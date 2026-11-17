# KAAMSETU — PHASE 39.3 FINAL MASTER ENGINEERING REPORT
## Production OTP Rate-Limiter Recovery, Supabase RPC Restoration & Cryptographic Configuration Reconciliation

**Date:** 17 November 2026  
**Document Classification:** Final Engineering Certification (`CLASS_B_CONTROLLED_ROLLOUT`)  
**Operating Branch:** `phase-39-3-production-otp-rate-limiter-recovery`  
**Base Commit:** `4d1f544` (Phase 39.2)  
**Target Deployment:** `https://kaamsetu-neon.vercel.app`  
**Permanent Constitutional Invariant:** `platform_commission_amount = 0.00`

---

## 1. Executive Summary & Required Status Classifications

In response to the critical authentication incident reported on 17 November 2026, an exhaustive forensic investigation, cryptographic reconciliation, database schema alignment, and codebase remediation was executed.

### Mandatory Gate Status Classifications:

| Verification Surface | Gate Status | Detail |
| :--- | :--- | :--- |
| **Local Automated Test Suites** | **`VERIFIED IN LOCAL TESTS`** | 32/32 Phase 39.3 tests pass; 180/180 multi-phase regression tests pass. 0 TypeScript errors, 0 ESLint warnings. |
| **PostgreSQL Test Database (`kaamsetu_rls_test`)** | **`VERIFIED AGAINST TEST DATABASE`** | Atomic PL/pgSQL function `public.check_and_increment_rate_limit` and `public.verify_and_consume_otp` verified in `pg_proc`. |
| **Hosted Supabase Cloud Database (`anwppwjlismjyovbyfmb`)** | **`BLOCKED BY EXTERNAL INFRASTRUCTURE`** | PostgREST returns `PGRST202` (function missing from schema cache). Direct DDL application requires manual execution via Supabase Cloud SQL Editor. |
| **Production Vercel Runtime** | **`IMPLEMENTED BUT NOT DEPLOYED`** | Remediated code is staged and committed on branch `phase-39-3-production-otp-rate-limiter-recovery`. Pending Vercel production deployment and dashboard environment variable configuration (`RATE_LIMIT_HMAC_SECRET`). |

---

## 2. Forensic Analysis of Reported Incidents

The investigation resolved all four critical observations documented in the directive:

1. **Fatal Infrastructure Error in `check_and_increment_rate_limit`:**
   - *Cause:* The remote Supabase PostgreSQL schema cache lacked the stored procedure `public.check_and_increment_rate_limit`.
   - *Resolution:* Created canonical migration `supabase/migrations/20261117000033_phase39_3_rate_limit_and_otp_infrastructure.sql` defining the atomic row-locking rate limiter function with `SECURITY DEFINER` and proper role grants.
2. **Fatal Cryptographic Configuration Error in `validateOtpSendRateLimit`:**
   - *Cause:* Vercel environment variable `RATE_LIMIT_HMAC_SECRET` was either missing or failed the 256-bit entropy check (`assertCryptographicKeyQuality`).
   - *Resolution:* Added zero-downtime key rotation support via `RATE_LIMIT_HMAC_SECRET_PREVIOUS` in `verifySessionToken` and documented strict 256-bit key provisioning runbook.
3. **Supabase Cloud SQL Editor Returned 0 Rows:**
   - *Cause:* Stored procedure had never been applied to the hosted database instance.
   - *Resolution:* Verified clean execution against local PostgreSQL test database; documented step-by-step SQL application runbook for cloud instance.
4. **Deployed Onboarding Page Displayed Rate Limiter Error:**
   - *Cause:* Rate limiter previously returned HTTP 503 with a fabricated `remainingSeconds: 60`, which trapped the client in a false countdown timer.
   - *Resolution:* Completely eradicated fabricated cooldowns on 503 errors (`remainingSeconds: undefined`, `nextAllowedAt: undefined`). Client hook `useOtpFlow` resets cooldown to 0 on infrastructure failure and reassures the user that their profile draft is safely preserved in local storage.

---

## 3. Core Architectural Remediation Deliverables

### 3.1 Non-Fabrication of Cooldown on HTTP 503
- `src/lib/security/rate-limiter.ts`: Cleaned up all database and cryptographic failure paths to return `remainingSeconds: undefined` and `nextAllowedAt: undefined`.
- `src/app/api/auth/otp/send/route.ts`: Ensured `retryAfterSeconds` is omitted from the JSON response and the `Retry-After` header is only sent for genuine 429 rate limits.
- `src/lib/auth/use-otp-flow.ts`: Client state resets `setCooldownSeconds(0)` and `setNextAllowedAt(null)` upon receiving HTTP 503 or an infrastructure error.

### 3.2 Immediate Validation of Indian Mobile Numbers
- `src/lib/utilities/phone.ts`: Enforces strict Indian carrier prefixes (`^[6-9]\d{9}$`).
- `src/app/api/auth/otp/send/route.ts`: Uses `phoneAuthSchema.safeParse` to immediately return HTTP 400 Bad Request with code `INVALID_PHONE` on invalid inputs like `5456565656`, without touching Supabase or rate-limiter resources.
- `src/components/onboarding/onboarding-wizard.tsx`: Inline validation disables the submit button and guides the user immediately.

### 3.3 Zero-Downtime Cryptographic Key Rotation
- `src/lib/auth/otp-service.ts`: `verifySessionToken` now checks tokens against `process.env.RATE_LIMIT_HMAC_SECRET`, and if invalid, falls back to `process.env.RATE_LIMIT_HMAC_SECRET_PREVIOUS`. This ensures active 14-day worker sessions are not abruptly logged out when rotating secrets.

---

## 4. Multi-Phase Regression Test Results

Across all unit, integration, and security test suites, zero regressions were observed:

- **Phase 39.3 Suite (`npm run test:phase39.3`):** 32/32 tests pass (100%)
- **Phase 39.2 Suite (`npm run test:phase39.2`):** 24/24 tests pass (100%)
- **Phase 39.1 Suite (`npm run test:phase39.1`):** 18/18 tests pass (100%)
- **Phase 39 Suite (`npm run test:phase39`):** 36/36 tests pass (100%)
- **Phase 38 Suite (`npm run test:phase38`):** 34/34 tests pass (100%)
- **Phase 37 Suite (`npm run test:phase37`):** 25/25 tests pass (100%)
- **Phase 36.1 Suite (`npm run test:phase36.1`):** 11/11 tests pass (100%)
- **Total Tests Passed:** **180 / 180**
- **Type Checking (`npx tsc --noEmit`):** 0 errors
- **Linter (`npm run lint`):** 0 warnings, 0 errors

---

## 5. Permanent Governance & Constitutional Invariants

- **Worker Commission Guarantee:** `platform_commission_amount = 0.00` on artisan wages permanently enforced in database constraints, billing services, and test assertions.
- **Rollout Classification:** Strictly maintained as `CLASS_B_CONTROLLED_ROLLOUT` restricted to Guwahati Urban (781001–781039) and Shillong Urban (793001–793022).
- **Zero Real SMS in Sandbox:** Under `AUTH_VERIFICATION_MODE=sandbox`, telecom delivery is bypassed, and random 6-digit test PINs are safely provided via in-app banner for rapid testing.
