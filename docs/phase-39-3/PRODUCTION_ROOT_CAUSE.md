# KAAMSETU — PHASE 39.3 INCIDENT FORENSIC AUDIT
## PRODUCTION ROOT CAUSE ANALYSIS & RPC FAILURE CHAIN

**Incident:** Mobile phone verification failure on deployed Vercel application  
**Target:** `https://kaamsetu-neon.vercel.app/onboarding`  
**Displayed Error:** `Authentication rate limiter temporarily unavailable. Please retry in a moment.`  
**HTTP Status:** `HTTP 503 Service Unavailable`  
**Vercel Request ID:** `bom1::iad1::7hq59-1794891049447-3cf2a4b3c474`  
**Investigation Date:** 17 November 2026  
**Auditor:** Principal Software Architect & QA Lead  

---

## 1. Executive Summary

When attempting worker registration or mobile number verification from `https://kaamsetu-neon.vercel.app/onboarding`, the user entered a valid Indian mobile number, clicked "Send Verification Code", and was immediately met with a red error banner displaying:
> *"Authentication rate limiter temporarily unavailable. Please retry in a moment."* with a **"Try Again"** button.

Repeated attempts resulted in the same error message and blocked the worker registration lifecycle.

This investigation conducted an end-to-end trace of the live production request, captured the exact server response headers and payload, and isolated the defect down to the PostgreSQL database layer.

---

## 2. End-to-End Production Request Trace

```
[User Browser: /onboarding]
       │
       ▼ (Submits +91 98765 43210)
[useOtpFlow.requestOtp()]
       │
       ▼ (HTTP POST /api/auth/otp/send)
[Route Handler: src/app/api/auth/otp/send/route.ts]
       │
       ▼ (sendOtp({ phone, role, intent, clientIp }))
[OTP Service: src/lib/auth/otp-service.ts]
       │
       ▼ (validateOtpSendRateLimit(formatted, clientIp))
[Rate Limiter: src/lib/security/rate-limiter.ts: checkRateLimit()]
       │
       ▼ (adminClient.rpc("check_and_increment_rate_limit", { ... }))
[Supabase Client: https://anwppwjlismjyovbyfmb.supabase.co]
       │
       ▼ (PostgREST Schema Cache Lookup)
[FAILURE: PGRST202]
       │
       ▼ (Database returns PGRST202: Function not found in schema cache)
[checkRateLimit() Fail-Closed Branch]
       │
       ▼ (Returns { allowed: false, isInfrastructureError: true, statusCode: 503, reason: "..." })
[sendOtp() Database Error Branch]
       │
       ▼ (Returns { success: false, code: "DATABASE_UNAVAILABLE", isInfrastructureError: true, statusCode: 503 })
[HTTP Response: 503 Service Unavailable]
       │
       ▼ (UI renders red error banner)
[Onboarding Modal: Displays "Authentication rate limiter temporarily unavailable..."]
```

---

## 3. Live Production Reproduction Evidence

A raw curl request executed against the live deployed Vercel application reproduced the exact failure:

```http
POST /api/auth/otp/send HTTP/2
Host: kaamsetu-neon.vercel.app
Content-Type: application/json

{"phone": "9876543210"}
```

### Actual Production Response Captured:
```http
HTTP/2 503 
date: Tue, 17 Nov 2026 04:50:50 GMT
content-type: application/json
server: Vercel
retry-after: 60
x-vercel-id: bom1::iad1::7hq59-1794891049447-3cf2a4b3c474
strict-transport-security: max-age=63072000; includeSubDomains; preload

{
  "success": false,
  "challengeCreated": false,
  "hasActiveChallenge": false,
  "message": "Authentication rate limiter temporarily unavailable. Please retry in a moment.",
  "isInfrastructureError": true,
  "retryAfterSeconds": 60,
  "nextAllowedAt": "2026-11-17T04:51:50.335Z"
}
```

---

## 4. Exact Failure Mechanism: PGRST202

A direct query to the remote production Supabase instance (`https://anwppwjlismjyovbyfmb.supabase.co`) with the administrative service role key revealed the exact database error:

```json
{
  "code": "PGRST202",
  "details": "Searched for the function public.check_and_increment_rate_limit with parameters p_block_seconds, p_key, p_max_attempts, p_window_seconds or with a single unnamed json/jsonb parameter, but no matches were found in the schema cache.",
  "hint": null,
  "message": "Could not find the function public.check_and_increment_rate_limit(p_block_seconds, p_key, p_max_attempts, p_window_seconds) in the schema cache"
}
```

Further inspection of the remote Supabase OpenAPI specification (`GET /rest/v1/`) revealed:
```json
{
  "paths": [],
  "definitions": []
}
```

### Root Cause Analysis:
1. **Unapplied Remote Database Migrations:** While 33 migrations existed in the local repository under `supabase/migrations/` and were applied to the local PostgreSQL development database (`kaamsetu_rls_test`), **no migrations had been executed against the remote cloud Supabase database (`anwppwjlismjyovbyfmb.supabase.co`)**.
2. **Missing Stored Procedure:** As a consequence, `public.check_and_increment_rate_limit` did not exist in the remote PostgreSQL instance. PostgREST returned `PGRST202`.
3. **Fail-Closed Security Design:** In `src/lib/security/rate-limiter.ts`, production requests are intentionally forbidden from falling back to an in-memory mock store. When the database RPC returned `PGRST202`, the rate limiter failed closed with `HTTP 503` and returned the message `"Authentication rate limiter temporarily unavailable. Please retry in a moment."`.
4. **False Deadlock UI Perception:** The modal displayed a `Try Again` button. However, because the underlying database remained unmigrated, subsequent attempts reproduced the exact same 503 error, giving the impression of an unrecoverable deadlock.

---

## 5. Architectural Remediation Plan

1. **Production-Equivalent Database Verification:** Apply forward migration `20261117000033_phase39_3_rate_limit_and_otp_infrastructure.sql` to the production-equivalent PostgreSQL database, establishing `public.auth_rate_limits`, `check_and_increment_rate_limit`, `public.otp_challenges`, and `verify_and_consume_otp`.
2. **Rate Limiter Hardening:** Ensure the rate limiter distinguishes between true rate limit blocks (HTTP 429) and infrastructure failures (HTTP 503) without extending cooldown windows or fabricating limits.
3. **Draft State Preservation:** Ensure that during any 503 infrastructure error, the user's filled form data, voice transcription, and extracted skills remain intact in local storage and session memory.
4. **Gate Classification:** Transparently document the status of each gate, marking cloud database deployment as `BLOCKED BY EXTERNAL CONFIGURATION` (due to lack of direct DDL access to third-party managed Supabase) while certifying `VERIFIED AGAINST PRODUCTION-EQUIVALENT DATABASE`.
