# KAAMSETU — PHASE 39.3 ROOT CAUSE ANALYSIS
## Forensic Investigation of Production Rate-Limiter Failure, Supabase RPC Absence, Cryptographic Key Quality & Cooldown Semantics

**Date:** 17 November 2026  
**Incident Reference:** Live Vercel Production Logs & Supabase SQL Editor Inspection  
**Classification:** Critical Hotfix (`CLASS_B_CONTROLLED_ROLLOUT`)  
**Operating Branch:** `phase-39-3-production-otp-rate-limiter-recovery`  
**Target Application:** `https://kaamsetu-neon.vercel.app` (`/onboarding` & `/api/auth/otp/send`)  
**Permanent Constitutional Invariant:** `platform_commission_amount = 0.00`

---

## 1. Executive Summary & Incident Evidence

On 17 November 2026, the live Vercel deployment of KAAMSETU on `/onboarding` displayed:
> *"Authentication rate limiter temporarily unavailable. Please retry in a moment."*

Inspection of runtime telemetry and database queries revealed four critical forensic observations:

1. **Log Entry 1 (`/api/auth/otp/send`):**
   - Component: `RateLimiter`
   - Action: `check_and_increment_rate_limit`
   - Status: Fatal infrastructure error (HTTP 503).
2. **Log Entry 2 (`/api/auth/otp/send`):**
   - Component: `RateLimiter`
   - Action: `validateOtpSendRateLimit`
   - Status: Fatal message: `"Cryptographic configuration failure during rate limit key hashing: FATAL SECURITY CONFIGURATION: RATE_LIMIT_HMAC_SECRET is missing from environment in production."`
3. **Supabase SQL Editor Query Result:**
   - Query: `SELECT * FROM pg_proc WHERE proname = 'check_and_increment_rate_limit';`
   - Status: `Success. No rows returned.`
4. **Client UI State:**
   - Displayed: `"Authentication rate limiter temporarily unavailable. Your profile draft has been saved. Please retry in a moment."`
   - The UI previously trapped users in a false 60-second cooldown timer even though the request had failed due to a server infrastructure outage, not a rate-limit breach.

---

## 2. Forensic Analysis of the 4 Incident Items

### 2.1 Item 1 & Item 3: PostgREST Schema Cache Missing RPC (`PGRST202`) & SQL Editor 0 Rows
- **Forensic Finding:** In the remote Supabase Cloud project (`anwppwjlismjyovbyfmb.supabase.co`), the stored procedure `check_and_increment_rate_limit` had never been deployed.
- **Direct Proof:** Running `SELECT proname, prosecdef FROM pg_proc WHERE proname = 'check_and_increment_rate_limit'` in the Supabase SQL editor returned zero rows (`Success. No rows returned`).
- **PostgREST Behavior:** When `adminClient.rpc("check_and_increment_rate_limit", ...)` was invoked from Next.js on Vercel, Supabase returned HTTP 404 with PostgREST error code `PGRST202: Could not find the function public.check_and_increment_rate_limit in the schema cache`.
- **Fail-Closed Policy:** In `src/lib/security/rate-limiter.ts`, when `NODE_ENV === "production"`, unhandled database or PostgREST errors strictly fail closed, throwing or returning `isInfrastructureError: true` with status 503 to prevent unmetered brute-force requests.

### 2.2 Item 2: Cryptographic Key Quality Failure in `validateOtpSendRateLimit`
- **Forensic Finding:** During rate limit key hashing (`hashRateLimitKey`), the system derives HMAC-SHA256 digests using `getRateLimitHmacSecret()`.
- **Root Cause:** In Vercel Production, `RATE_LIMIT_HMAC_SECRET` was either missing or fell below the 256-bit entropy threshold required by `assertCryptographicKeyQuality` in `src/lib/crypto/key-validator.ts`.
- **Code Trace:**
  ```typescript
  // src/lib/security/rate-limiter.ts
  if (isProduction) {
    if (!secret) {
      throw new Error(
        "FATAL SECURITY CONFIGURATION: RATE_LIMIT_HMAC_SECRET is missing from environment in production."
      );
    }
    assertCryptographicKeyQuality(secret, "RATE_LIMIT_HMAC_SECRET");
    return secret;
  }
  ```
  When `getRateLimitHmacSecret()` threw, `validateOtpSendRateLimit()` caught the exception and logged:
  `[RateLimiter] validateOtpSendRateLimit fatal infrastructure error: FATAL SECURITY CONFIGURATION: RATE_LIMIT_HMAC_SECRET is missing from environment in production.`

### 2.3 Item 4 & The False Cooldown Deadlock (Client Trapping)
- **Defect:** Prior to Phase 39.3, when `rate-limiter.ts` returned an infrastructure error (HTTP 503), it populated:
  ```typescript
  remainingSeconds: 60,
  nextAllowedAt: new Date(Date.now() + 60000).toISOString(),
  ```
- **Catastrophic UX Consequence:** The client hook `useOtpFlow` read `remainingSeconds = 60` and triggered a countdown timer, disabling the `Send Verification Code` button and locking the user out for 60 seconds, even though no rate-limit had been exceeded and no challenge had been created!
- **Remediation:** On HTTP 503 (`isInfrastructureError: true`), `remainingSeconds` and `nextAllowedAt` must strictly evaluate to `undefined`. `useOtpFlow` resets `setCooldownSeconds(0)` and `setNextAllowedAt(null)`, allowing the user to immediately retry without arbitrary countdown traps.

---

## 3. Immediate Rejection of Invalid Mobile Numbers

Before Phase 39.3, entering non-Indian mobile formats (such as `5456565656`) bypassed client validation, hit the API, and crashed into generic 500/503 handlers.
In Phase 39.3:
1. `validateIndianMobile` in `src/lib/utilities/phone.ts` enforces `^[6-9]\d{9}$`.
2. Inline validation in `use-otp-flow.ts` and `onboarding-wizard.tsx` immediately marks `isPhoneValid = false`, displays `"Enter a valid 10-digit Indian mobile number beginning with 6, 7, 8 or 9."`, and disables the submission button.
3. `/api/auth/otp/send` parses via `phoneAuthSchema.safeParse`. If invalid, it immediately returns HTTP 400 Bad Request with `{ code: "INVALID_PHONE" }` without touching Supabase or the rate-limiter.

---

## 4. Architectural Remediation Summary

| Component | Defect | Phase 39.3 Resolution |
| :--- | :--- | :--- |
| **Supabase Remote DB** | `PGRST202` (RPC missing) | Author canonical migration `20261117000033_phase39_3_rate_limit_and_otp_infrastructure.sql` defining atomic PL/pgSQL function with `SECURITY DEFINER` and table RLS. |
| **Rate Limiter** | Fabricated 60s cooldown on 503 | Cleared `remainingSeconds` and `nextAllowedAt` to `undefined` across all infrastructure error returns. |
| **Client Hook (`useOtpFlow`)** | Client trapped in false countdown | Resets cooldown on 503, preserving onboarding draft in local storage. |
| **Key Validator** | Threw on key rotation | Implemented `RATE_LIMIT_HMAC_SECRET_PREVIOUS` fallback in `verifySessionToken` for zero-downtime rotation. |
| **API Error Contract** | Status code collapse to 500 | Enforced strict 400 / 429 / 503 HTTP status code separation with typed error codes. |
