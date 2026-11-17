# KAAMSETU — PHASE 39.4 VERCEL DEPLOYMENT EVIDENCE
## Production Build Analysis, Serverless Infrastructure & Configuration Requirements

**Target Domain:** `https://kaamsetu-neon.vercel.app`  
**Repository:** `Mayyank04/kaamsetu`  
**Deployment Target Branch:** `phase-39-4-complete-auth-and-production-recovery`  
**Audit Status:** `IMPLEMENTED — NOT LIVE VERIFIED`

---

## 1. Production Build & Serverless Configuration

The production build was verified locally using the exact Vercel Next.js 15 build pipeline. All 114 application routes compiled into static or dynamic serverless functions without errors or Edge runtime warnings.

### Serverless Function Sizes:
- Middleware: `109 kB` (Pure Web Crypto API, zero Node standard library dependencies).
- Shared Client Chunks: `103 kB`.
- Dynamic Auth Handlers (`/api/auth/otp/send`, `/api/auth/otp/verify`): `372 B` route handler footprint.
- Onboarding Wizard (`/onboarding`): `144 B` route size, `173 kB` first load JS.

---

## 2. Root Cause Analysis of Previous Vercel Incidents

The forensic investigation identified why previous deployments to `https://kaamsetu-neon.vercel.app` experienced persistent failures:

1. **Missing or Non-Entropy `RATE_LIMIT_HMAC_SECRET`:**  
   Vercel production logs revealed:
   ```
   {"level":"fatal","component":"RateLimiter","action":"validateOtpSendRateLimit","message":"Cryptographic configuration failure during rate limit key hashing"}
   ```
   The production rate limiter failed closed because `RATE_LIMIT_HMAC_SECRET` was either missing from the Vercel project environment variables, or was set to a placeholder that failed the 256-bit entropy validator.
2. **PostgreSQL RPC Cache & Missing Migrations in Supabase Cloud:**  
   When the rate limiter invoked `check_and_increment_rate_limit`, the remote Supabase database had not had Migration 33 executed, resulting in PostgreSQL error 42883 (function does not exist).
3. **Serverless Ephemeral Memory Loss:**  
   When database RPCs failed, previous code fell back to in-memory maps. Because each serverless invocation on Vercel runs in an ephemeral container, the OTP verification request landed on a separate container where the challenge did not exist.
4. **Edge Runtime Middleware Warning:**  
   Previous middleware imported Node.js `crypto`, which is incompatible with Vercel Edge Middleware runtime.

---

## 3. Mandatory Vercel Environment Configuration

For the live Vercel deployment at `https://kaamsetu-neon.vercel.app` to function correctly, the following environment variables must be configured in the **Vercel Project Settings > Environment Variables**:

| Variable Name | Environment | Description | Required Value / Format |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Production, Preview | Supabase API URL | `https://<project-ref>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production, Preview | Supabase Anonymous Key | Valid JWT string |
| `SUPABASE_SERVICE_ROLE_KEY` | Production, Preview | Supabase Service Role Key | Valid high-privilege JWT string |
| `RATE_LIMIT_HMAC_SECRET` | Production, Preview | 256-bit Key Material | Minimum 32 characters, high entropy |
| `RATE_LIMIT_HMAC_SECRET_PREVIOUS` | Production (Optional) | Rotation Key | 32-character previous key |
| `AUTH_VERIFICATION_MODE` | Production, Preview | Verification Mode | `sandbox` (for test) or `sms` |
| `SANDBOX_OTP_CODE` | Production (Optional) | Fixed Sandbox PIN | Optional 6-digit string |

---

## 4. Current Deployment State

- **Local Build & Compilation:** `VERIFIED WORKING` (zero errors, Edge-compliant).
- **Automated Regression Suite:** `VERIFIED WORKING` (92/92 tests passing).
- **Remote Vercel Runtime:** `IMPLEMENTED — NOT LIVE VERIFIED` (awaiting Git push and confirmation of remote database migration).
