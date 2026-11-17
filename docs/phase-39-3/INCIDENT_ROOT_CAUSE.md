# KAAMSETU — PHASE 39.3 INCIDENT ROOT CAUSE INVESTIGATION
## Production OTP Sending Failure, Cryptographic Configuration Error & Supabase RPC Absence

**Date:** 17 November 2026  
**Incident Reference:** Live Vercel Production Failure on `/api/auth/otp/send`  
**Target Application:** `https://kaamsetu-neon.vercel.app`  
**Classification:** Critical Production Hotfix (`CLASS_B_CONTROLLED_ROLLOUT`)  
**Permanent Constitutional Invariant:** `platform_commission_amount = 0.00` on artisan wages  

---

## 1. Executive Summary

When attempting to register or log in on the deployed Vercel application at `https://kaamsetu-neon.vercel.app/onboarding`, the mobile verification modal triggered a fatal infrastructure error:

```
Authentication rate limiter temporarily unavailable. Your profile draft has been saved. Please retry in a moment.
```

Inspection of live Vercel runtime logs, PostgREST OpenAPI metadata, and code execution paths identified three distinct root causes:

1. **Remote Cloud Database RPC Missing (`PGRST202`):**
   The remote Supabase PostgreSQL project (`anwppwjlismjyovbyfmb.supabase.co`) lacked the stored procedure `public.check_and_increment_rate_limit`. In production, the backend rate limiter fails closed with HTTP 503 rather than silently bypassing security.
2. **Cryptographic Key Entropy & Configuration Failure:**
   In Vercel Production, `RATE_LIMIT_HMAC_SECRET` was either missing or fell below the 256-bit entropy threshold required by `assertCryptographicKeyQuality` in `src/lib/crypto/key-validator.ts`. This caused `getRateLimitHmacSecret()` to throw a fatal exception during rate-limit key hashing.
3. **Gemini AI Model Identifier Discrepancy:**
   Voice extraction invoked a non-existent model (`gemini-2.5-flash`), causing Google GenAI API to reject requests and fall back to deterministic parsing.
4. **Client Cooldown Trap on HTTP 503:**
   Prior to Phase 39.3, the API returned `remainingSeconds: 60` on infrastructure errors, trapping the user in a false 60-second cooldown timer.

---

## 2. Complete Execution Path Trace

The request traverses the following end-to-end pipeline:

```
[Browser Client]
       │
       ▼  POST /api/auth/otp/send { phone: "9876543210", intent: "registration" }
[API Route Handler: src/app/api/auth/otp/send/route.ts]
       │
       ├─► 1. Phone validation: phoneAuthSchema.safeParse(json)
       │      If invalid format (e.g. 5456565656) -> Immediate 400 Bad Request { code: "INVALID_PHONE" }
       │
       ▼  sendOtp() in src/lib/auth/otp-service.ts
       │
       ├─► 2. Rate limit check: validateOtpSendRateLimit(phone, clientIp)
       │      │
       │      ├─► getRateLimitHmacSecret() -> Loads RATE_LIMIT_HMAC_SECRET
       │      │   [Point of Failure A]: If missing or <256 bits entropy -> throws fatal configuration error
       │      │
       │      ├─► hashRateLimitKey("cooldown", phone) -> HMAC-SHA256 domain-separated key
       │      │
       │      ▼ checkRateLimit(key, maxAttempts, windowSec, blockSec)
       │         │
       │         ▼ adminClient.rpc("check_and_increment_rate_limit", { ... })
       │           [Point of Failure B]: If RPC missing in Supabase -> returns PGRST202
       │           Production Fail-Closed: returns { allowed: false, isInfrastructureError: true, statusCode: 503 }
       │
       ├─► 3. Infrastructure Error Response:
       │      Returns HTTP 503 Service Unavailable { code: "DATABASE_UNAVAILABLE", isInfrastructureError: true }
       │      CRITICAL: remainingSeconds and nextAllowedAt are STRICTLY UNDEFINED (no false cooldown).
       │
       ▼  (Under Healthy Conditions)
[Challenge Persistence & Sandbox Dispatch]
       │
       ├─► Generate 6-digit random PIN (crypto.randomInt)
       ├─► Persist challenge in public.otp_challenges
       ├─► If AUTH_VERIFICATION_MODE === "sandbox" -> Zero SMS dispatch; return sandboxCode in JSON
       └─► Returns HTTP 200 OK
```

---

## 3. Specific Log Entries Analysis

### Log Entry 1: `RateLimiter` → `check_and_increment_rate_limit`
- **Component:** `RateLimiter`
- **Action:** `check_and_increment_rate_limit`
- **Message:** `Could not find the function public.check_and_increment_rate_limit in the schema cache`
- **Diagnosis:** PostgREST error `PGRST202`. The database migration `20261117000033_phase39_3_rate_limit_and_otp_infrastructure.sql` had not been executed on the hosted cloud Supabase database.

### Log Entry 2: `RateLimiter` → `validateOtpSendRateLimit`
- **Component:** `RateLimiter`
- **Action:** `validateOtpSendRateLimit`
- **Message:** `Cryptographic configuration failure during rate limit key hashing: FATAL SECURITY CONFIGURATION: RATE_LIMIT_HMAC_SECRET is missing from environment in production.`
- **Diagnosis:** Vercel Project Settings lacked the required 256-bit environment variable `RATE_LIMIT_HMAC_SECRET`.

### Log Entry 3: Supabase SQL Editor returned `Success. No rows returned`
- **Query:** `SELECT * FROM pg_proc WHERE proname = 'check_and_increment_rate_limit'`
- **Diagnosis:** The function had never been created in `public` schema.

### Log Entry 4: Gemini Live Extraction Fallback
- **Message:** `Gemini live extraction failed or returned unparseable schema, falling back to deterministic parser`
- **Diagnosis:** Source code requested model `gemini-2.5-flash`, which does not exist in Google's API catalog. Remediated to `gemini-2.0-flash` with fallback to `gemini-1.5-flash`.

---

## 4. Remediation Architecture

| Area | Before | After |
| :--- | :--- | :--- |
| **RPC Stored Procedure** | Missing in cloud schema | Defined in migration 33 with atomic row locking (`FOR UPDATE`) and `SECURITY DEFINER` |
| **RPC Permissions** | Unset | `REVOKE ALL FROM PUBLIC, anon, authenticated; GRANT EXECUTE TO service_role;` |
| **Key Quality** | Hardcoded dev fallbacks | Strict 256-bit validation via `assertCryptographicKeyQuality`; zero hardcoded fallbacks in production |
| **Key Rotation** | Abrupt invalidation | Dual-secret verification fallback via `RATE_LIMIT_HMAC_SECRET_PREVIOUS` |
| **503 Cooldown** | Fabricated 60s cooldown | `remainingSeconds: undefined`, `nextAllowedAt: undefined`, client timer reset to 0 |
| **Gemini Model** | Non-existent `gemini-2.5-flash` | Production `gemini-2.0-flash` with `gemini-1.5-flash` fallback |
