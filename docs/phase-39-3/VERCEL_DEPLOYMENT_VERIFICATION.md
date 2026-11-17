# KAAMSETU — PHASE 39.3 VERCEL DEPLOYMENT VERIFICATION
## Production Deployment Audit, Environment Reconciliation & Infrastructure Status

**Date:** 17 November 2026  
**Document Classification:** Deployment Audit Register (`CLASS_B_CONTROLLED_ROLLOUT`)  
**Target Deployment:** `https://kaamsetu-neon.vercel.app`  
**Base Commit:** `4d1f544` (Phase 39.2)  
**Active Working Branch:** `phase-39-3-production-otp-rate-limiter-recovery`

---

## 1. Production Deployment Status Overview

| Component | Status | Evidence / Notes |
| :--- | :--- | :--- |
| **Local Source Code Remediation** | **`VERIFIED IN LOCAL TESTS`** | 32/32 Phase 39.3 tests pass; 180/180 multi-phase regression tests pass. 0 lint or TypeScript errors. |
| **Local Test Database (`kaamsetu_rls_test`)** | **`VERIFIED AGAINST TEST DATABASE`** | Canonical migration applied; PL/pgSQL stored procedures verified in `pg_proc`. |
| **Remote Vercel Git Branch** | **`IMPLEMENTED BUT NOT DEPLOYED`** | Code prepared on branch `phase-39-3-production-otp-rate-limiter-recovery`, ready for push and merge. |
| **Remote Supabase Cloud (`anwppwjlismjyovbyfmb`)** | **`BLOCKED BY EXTERNAL INFRASTRUCTURE`** | `PGRST202` schema cache error. Stored procedure `check_and_increment_rate_limit` missing in cloud instance; requires SQL Editor execution in dashboard. |
| **Vercel Production Environment Variables** | **`BLOCKED BY EXTERNAL INFRASTRUCTURE`** | `RATE_LIMIT_HMAC_SECRET` missing or fails 256-bit entropy check, producing fatal cryptographic configuration logs. Requires configuration in Vercel dashboard. |

---

## 2. Forensic Trace of Vercel Production Logs

Prior to this engineering repair, the deployed serverless functions on Vercel emitted the following errors upon accessing `/onboarding`:

1. **Log Event 1 (`POST /api/auth/otp/send`):**
   ```
   {"level":"fatal","component":"RateLimiter","action":"validateOtpSendRateLimit","message":"Cryptographic configuration failure during rate limit key hashing: FATAL SECURITY CONFIGURATION: RATE_LIMIT_HMAC_SECRET is missing from environment in production."}
   ```
   **Cause:** Vercel environment lacked a valid `RATE_LIMIT_HMAC_SECRET` meeting the 32-byte entropy requirement.

2. **Log Event 2 (`POST /api/auth/otp/send`):**
   ```
   {"level":"fatal","component":"RateLimiter","action":"checkRateLimit","keyPrefix":"cooldown","message":"Could not find the function public.check_and_increment_rate_limit in the schema cache"}
   ```
   **Cause:** Cloud Supabase database returned PostgREST code `PGRST202`.

3. **Client UI Result:**
   The UI received HTTP 503 and previously started a 60-second cooldown timer.
   **Phase 39.3 Fix:** The client no longer starts a cooldown timer on 503. The error message informs the worker that their profile draft is safely preserved in local storage.

---

## 3. Production Deployment Checklist

To transition from `BLOCKED BY EXTERNAL INFRASTRUCTURE` to `VERIFIED IN LIVE VERCEL RUNTIME`, execute the following four deployment steps:

### Step 1: Deploy Supabase Cloud Migration
1. Navigate to the Supabase Dashboard: `https://supabase.com/dashboard/project/anwppwjlismjyovbyfmb/sql`.
2. Open the SQL Editor and execute the script in:
   `supabase/migrations/20261117000033_phase39_3_rate_limit_and_otp_infrastructure.sql`.
3. Confirm creation of `public.check_and_increment_rate_limit` and `public.verify_and_consume_otp`.

### Step 2: Configure High-Entropy Secrets in Vercel
1. Generate a 256-bit HMAC secret:
   ```bash
   openssl rand -base64 32
   ```
2. Navigate to Vercel Project Settings > Environment Variables:
   - `RATE_LIMIT_HMAC_SECRET`: `<generated_secret>`
   - `AUTH_VERIFICATION_MODE`: `sandbox`
   - `NEXT_PUBLIC_APP_URL`: `https://kaamsetu-neon.vercel.app`
3. Save environment variables for Production, Preview, and Development.

### Step 3: Push & Merge Remediated Branch
```bash
git push -u origin phase-39-3-production-otp-rate-limiter-recovery
```
Create a Pull Request to merge into `main` and trigger automatic Vercel production build.

### Step 4: Live Verification on Vercel
1. Visit `https://kaamsetu-neon.vercel.app/onboarding`.
2. Enter a valid Indian mobile number (e.g. `9876543210`).
3. Click **Send Verification Code**.
4. Confirm sandbox 6-digit PIN is displayed in the UI banner.
5. Enter PIN and verify seamless transition to credential issuance.
