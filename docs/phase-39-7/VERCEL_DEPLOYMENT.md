# KAAMSETU — PHASE 39.7: VERCEL PRODUCTION DEPLOYMENT GUIDE

**Document ID:** `KAAMSETU-39-7-VERCEL-DEPLOYMENT`  
**Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**Target Domain:** `https://kaamsetu-neon.vercel.app`  
**Repository Branch:** `phase-39-7-direct-registration-no-otp`  
**Status:** `IMPLEMENTED — REMOTE MIGRATION REQUIRED`  
**Permanent Financial Invariant:** `platform_commission_amount = 0.00` on artisan wages  

---

## 1. Vercel Production Environment Variables Audit

Verify that the following environment variables are active in Vercel Project Settings (`https://vercel.com/mayyank04s-projects/kaamsetu/settings/environment-variables`):

| Variable | Scope | Type | Expected Value / Format |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Production, Preview | Public Client | `https://anwppwjlismjyovbyfmb.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production, Preview | Public Client | Remote anon JWT |
| `SUPABASE_SERVICE_ROLE_KEY` | Production, Preview | Server-Only Secret | Remote service role JWT |
| `RATE_LIMIT_HMAC_SECRET` | Production, Preview | Server-Only Secret | 64-character random hex string |
| `AUTH_VERIFICATION_MODE` | Production, Preview | Server-Only | `sandbox` |
| `ENABLE_IN_MEMORY_RATE_LIMIT_MOCK` | Production | Server-Only | `false` |
| `NEXT_PUBLIC_BASE_URL` | Production | Public Client | `https://kaamsetu-neon.vercel.app` |
| `GEMINI_API_KEY` | Production, Preview | Server-Only Secret | Google AI Studio Key |
| `GEMINI_MODEL` | Production, Preview | Server-Only | `gemini-2.0-flash` |

---

## 2. Remote Supabase Database Execution (Operator Action)

Before deployed routes can persist registered users into Supabase, the operator must execute the forward-only DDL scripts in the Supabase Dashboard SQL Editor for project `anwppwjlismjyovbyfmb`:

1. Open [Supabase SQL Editor](https://supabase.com/dashboard/project/anwppwjlismjyovbyfmb/sql/new).
2. Execute [supabase/migrations/20261117_master_infrastructure_repair.sql](file:///Users/mayankgautam/Desktop/stitch_kaamsetu_digital_identity_platform/supabase/migrations/20261117_master_infrastructure_repair.sql) (if not already run).
3. Execute [supabase/migrations/20261118_direct_registration_no_otp.sql](file:///Users/mayankgautam/Desktop/stitch_kaamsetu_digital_identity_platform/supabase/migrations/20261118_direct_registration_no_otp.sql).
4. Run the verification query to confirm columns `email`, `password_hash`, `password_salt` exist on `public.profiles`.

---

## 3. Git Deployment & CI/CD Verification

### Step 3.1: Commit and Push
```bash
git checkout phase-39-7-direct-registration-no-otp
git add .
git commit -m "feat(auth): complete otp removal, direct registration and onboarding restoration"
git push -u origin phase-39-7-direct-registration-no-otp
```

### Step 3.2: Trigger Vercel Production Build
- Create and merge a Pull Request into `main`, or deploy directly via Vercel CLI:
  ```bash
  vercel --prod
  ```
- Verify that the Vercel build log confirms:
  - 116 static pages generated
  - Zero TypeScript compilation errors
  - Zero ESLint warnings

---

## 4. Live Post-Deployment Smoke Test Protocol

1. **Verify Health Endpoint:**
   ```bash
   curl -s -i https://kaamsetu-neon.vercel.app/api/auth/health
   ```
2. **Verify Direct Registration:**
   Navigate to `https://kaamsetu-neon.vercel.app/signup`. Fill Name, Email, Password, Terms, and click "Create Account".
   - Confirm immediate redirect to `/onboarding`.
   - Confirm zero OTP prompt.
3. **Verify Profile Persistence:**
   Complete Steps 1–3 on `/onboarding`, enter Guwahati PIN `781003`, and click "Approve & Mint Credential".
   - Confirm instant generation of Sovereign Success Card (Step 4).
   - Confirm zero 503 errors.
