# KAAMSETU — PHASE 39.4 VERCEL DEPLOYMENT VERIFICATION AUDIT

**Target Domain:** `https://kaamsetu-neon.vercel.app`  
**Git Branch:** `phase-39-4-complete-auth-and-production-recovery`  
**Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**Status Taxonomy:** IMPLEMENTED BUT NOT VERIFIED (PENDING LIVE VERCEL RUNTIME BUILD & DB MIGRATION) / VERIFIED WORKING LOCALLY

---

## 1. Local Production Build Certification

The production build was verified using `next build` on Next.js 15.5.29:
- **Build Status:** Success (0 compilation errors, 0 type errors).
- **Static Pages Generated:** 114 pages rendered successfully.
- **Dynamic API Routes Verified:**
  - `POST /api/auth/otp/send`
  - `POST /api/auth/otp/verify`
  - `POST /api/auth/logout`
  - `GET /api/auth/me`
- **First Load JS:** 103 kB shared across client bundles.
- **Middleware Size:** 109 kB with strict CSP and cookie security headers.

---

## 2. Environment Configuration Matrix for Vercel

To ensure the production deployment at `https://kaamsetu-neon.vercel.app` succeeds end-to-end, the following environment variables must be active in the Vercel Project Settings:

| Environment Variable | Production Requirement | Purpose | Local Status |
| :--- | :--- | :--- | :--- |
| `RATE_LIMIT_HMAC_SECRET` | Required (256-bit entropy, min 32 chars) | HMAC key derivation for rate limiter and cookie signatures | `VERIFIED` |
| `RATE_LIMIT_HMAC_SECRET_PREVIOUS` | Optional | Zero-downtime key rotation support | `VERIFIED` |
| `NEXT_PUBLIC_SUPABASE_URL` | Required | Supabase client endpoint | `CONFIGURED` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Required | Public anonymous client key | `CONFIGURED` |
| `SUPABASE_SERVICE_ROLE_KEY` | Required | Server-only admin client key | `CONFIGURED` |
| `AUTH_VERIFICATION_MODE` | `"sandbox"` or `"sms"` | Controls sandbox PIN generation vs live SMS dispatch | `VERIFIED ("sandbox")` |

---

## 3. Deployment Checklist & Verification Steps

1. **Commit & Push to Remote Branch:**
   Push commits to `origin/phase-39-4-complete-auth-and-production-recovery`.
2. **Execute Supabase Migration:**
   Run `supabase/migrations/20261117000034_phase39_4_account_lifecycle_and_persistence.sql` in the Supabase SQL Editor.
3. **Trigger Vercel Production Deployment:**
   Deploy the branch or promote to production.
4. **End-to-End Live Acceptance Walkthrough on Vercel:**
   - Open `https://kaamsetu-neon.vercel.app/onboarding`.
   - Fill in artisan trade and geographic pin code (`781001` - Guwahati).
   - Click "Verify Mobile Number".
   - Confirm consent section is visible and unchecked.
   - Click "Send Verification Code" with box unchecked: verify inline error displays `"Please accept the Terms of Service and Privacy Policy to continue."`.
   - Check the consent checkbox: verify error disappears immediately.
   - Click "Send Verification Code": verify HTTP 200 and sandbox test code appears.
   - Click "Auto-fill Code": verify code enters inputs.
   - Click "Verify & Continue": verify session is created and onboarding wizard advances to Step 2.
