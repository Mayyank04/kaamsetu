# KAAMSETU — PHASE 39.6 PRODUCTION DEPLOYMENT RUNBOOK

**Document ID:** `KAAMSETU-39-6-DEPLOYMENT-RUNBOOK`  
**Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**Target Environments:** Supabase Project `anwppwjlismjyovbyfmb` & Vercel `kaamsetu-neon.vercel.app`  
**Status:** `IMPLEMENTED — REMOTE MIGRATION REQUIRED`  
**Permanent Financial Invariant:** `platform_commission_amount = 0.00` on artisan wages  

---

## 1. Prerequisites & Operator Access Requirements

Before executing this runbook, the operator must have:
1. Administrator access to the Supabase Dashboard for project `anwppwjlismjyovbyfmb` (`https://supabase.com/dashboard/project/anwppwjlismjyovbyfmb`).
2. Deployment permissions for the Vercel project `kaamsetu` under `Mayyank04`.
3. Repository access to `Mayyank04/kaamsetu`.

---

## 2. Stage 1: Supabase Database Migration Execution

Because Supabase is hosted behind Cloudflare and direct TCP port 5432 is restricted without the connection pooler or IPv4 add-on, DDL migrations are executed directly via the Supabase Dashboard SQL Editor.

### Step 1.1: Open SQL Editor
1. Navigate to: [Supabase SQL Editor](https://supabase.com/dashboard/project/anwppwjlismjyovbyfmb/sql/new).
2. Create a new query tab and label it: `20261117_master_infrastructure_repair`.

### Step 1.2: Execute Master Migration Script
Copy and paste the entire idempotent migration script located at:  
[supabase/migrations/20261117_master_infrastructure_repair.sql](file:///Users/mayankgautam/Desktop/stitch_kaamsetu_digital_identity_platform/supabase/migrations/20261117_master_infrastructure_repair.sql)

Key objects created:
- Extensions: `pgcrypto`, `uuid-ossp`
- Tables: `auth_rate_limits`, `otp_challenges`, `profiles`, `user_consents`, `contractor_organizations`, `worker_profiles`
- Functions: `check_and_increment_rate_limit`, `get_rate_limit_status`, `verify_and_consume_otp`, `register_user_account`
- RLS Policies & Grants: Strict `service_role` execute grants, zero `anon` privilege escalation.
- PostgREST Schema Invalidation: `NOTIFY pgrst, 'reload schema'`

Click **RUN** (or press `Cmd+Enter` / `Ctrl+Enter`). Verify the query outputs `Success. No rows returned`.

### Step 1.3: Run Database Object Verification Query
In a new query tab, run the following verification query:

```sql
SELECT
  to_regclass('public.auth_rate_limits') AS rate_limit_table,
  to_regclass('public.otp_challenges') AS otp_table,
  to_regclass('public.profiles') AS profiles_table,
  to_regclass('public.user_consents') AS consents_table,
  to_regclass('public.contractor_organizations') AS contractors_table,
  to_regclass('public.worker_profiles') AS worker_profiles_table,
  to_regprocedure('public.check_and_increment_rate_limit(text,integer,integer,integer)') AS rate_limit_rpc,
  to_regprocedure('public.verify_and_consume_otp(text,text)') AS verify_otp_rpc,
  to_regprocedure('public.register_user_account(text,text,text,text,text,boolean)') AS register_account_rpc,
  to_regprocedure('public.get_rate_limit_status(text)') AS rate_limit_status_rpc;
```

**Pass Criterion:** All 10 columns must return non-null identifiers (e.g. `auth_rate_limits`, `check_and_increment_rate_limit`, etc.). If any column returns `NULL`, rerun the migration script.

---

## 3. Stage 2: Vercel Environment Configuration Audit

Navigate to: `https://vercel.com/mayyank04s-projects/kaamsetu/settings/environment-variables`

Ensure the following production environment variables are configured identically:

| Variable | Target Value / Format | Scope | Invariant |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://anwppwjlismjyovbyfmb.supabase.co` | Production, Preview | Canonical URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOi...` (Valid Supabase Anon JWT) | Production, Preview | Browser API ingress |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOi...` (Valid Supabase Service Role JWT) | Production, Preview | Server-only admin RPCs |
| `RATE_LIMIT_HMAC_SECRET` | 64-char cryptographically random hex string | Production, Preview | SHA-256 HMAC phone hashing |
| `AUTH_VERIFICATION_MODE` | `sandbox` | Production, Preview | Zero telecom SMS cost |
| `ENABLE_IN_MEMORY_RATE_LIMIT_MOCK` | `false` | Production | **MANDATORY**: Never set `true` in prod |
| `NEXT_PUBLIC_BASE_URL` | `https://kaamsetu-neon.vercel.app` | Production | Canonical site URL |
| `GEMINI_API_KEY` | Valid Google AI Studio API Key | Production, Preview | Voice profile extraction |
| `GEMINI_MODEL` | `gemini-2.0-flash` | Production, Preview | Active Gemini model |

> [!CAUTION]
> If `ENABLE_IN_MEMORY_RATE_LIMIT_MOCK` is set to `true` on Vercel, rate limiting across serverless lambdas will fail open or fail inconsistently. It must be strictly set to `false`.

---

## 4. Stage 3: Code Deployment via Git

### Step 3.1: Commit and Push Branch
Ensure all changes from Phase 39.6 are committed and pushed:
```bash
git checkout phase-39-6-otp-503-root-cause-repair
git add .
git commit -m "fix(auth): eliminate production otp 503 and complete supabase rpc infrastructure"
git push origin phase-39-6-otp-503-root-cause-repair
```

### Step 3.2: Merge to Main or Trigger Vercel Deployment
Merge branch `phase-39-6-otp-503-root-cause-repair` into `main` via Pull Request or trigger deployment directly via Vercel Dashboard / CLI:
```bash
vercel --prod
```

Verify that the build logs confirm:
- `Next.js 15.5` build succeeds
- 114 static pages generated
- Zero ESLint or TypeScript errors

---

## 5. Stage 4: Post-Deployment Smoke Testing & Health Certification

### Step 5.1: Health Check Endpoint Verification
Run the following curl command against the production deployment:
```bash
curl -s -i https://kaamsetu-neon.vercel.app/api/auth/health
```

**Expected HTTP Status:** `200 OK`  
**Expected Response Body:**
```json
{
  "status": "healthy",
  "database": "connected",
  "tables": {
    "auth_rate_limits": true,
    "otp_challenges": true,
    "profiles": true,
    "user_consents": true
  },
  "rpcs": {
    "check_and_increment_rate_limit": true,
    "verify_and_consume_otp": true,
    "register_user_account": true
  },
  "verificationMode": "sandbox",
  "mockRateLimiter": false,
  "timestamp": "..."
}
```

### Step 5.2: Live Onboarding Verification Walkthrough
1. Navigate to: `https://kaamsetu-neon.vercel.app/onboarding`
2. **Step 1 (Voice/Drafting):** Enter: *"I am an electrician in Guwahati with 8 years of experience doing house wiring."* Click "Extract Profile".
3. **Step 2 (Extraction Editor):**
   - Confirm Name, Category ("Electrical & Solar"), and Experience (8 years) are populated.
   - City is "Guwahati", State is "Assam".
   - Enter PIN code: `781003`.
   - Confirm the badge shows "Authorized Region: Guwahati Urban" with a green tactile check.
   - Click "Continue to Verification".
4. **Step 3 (Authentication Modal):**
   - Verify the Terms of Service & Privacy Policy checkbox is visible and unchecked.
   - Enter mobile: `9876543210`.
   - Check the consent checkbox.
   - Click **Send Verification Code**.
   - Verify HTTP response is **200 OK** (503 is completely eliminated!).
   - In sandbox mode, the 6-digit code is generated and displayed on screen with an auto-fill button.
   - Click "Auto-fill Code" (or enter the 6 digits).
   - Click **Verify & Proceed**.
5. **Step 4 (Completion):**
   - Verify account is created with `phone_verification_status: "sandbox_unverified"` and `verification_method: "sandbox"`.
   - Verify user session cookie is issued and user is redirected to `/worker/dashboard`.

---

## 6. Rollback Procedures

If any unanticipated failure occurs during migration:
1. **Database Rollback:**
   The migration is non-destructive (`IF NOT EXISTS`, `CREATE OR REPLACE FUNCTION`). No existing tables are dropped. If an RPC needs alteration, update the SQL function definition and run `NOTIFY pgrst, 'reload schema'`.
2. **Application Rollback:**
   In the Vercel Dashboard, navigate to **Deployments** and click **Rollback** on the previous stable production deployment.
