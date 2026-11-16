# KAAMSETU — PHASE 39 INITIAL REPOSITORY AUDIT

**Target:** `Mayyank04/kaamsetu`  
**Starting Commit:** `381219e` (Phase 38 Full-Stack Security Certified)  
**Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**Objective:** Forensic audit of existing authentication mechanisms, demo persona artifacts, OTP flows, environment configuration, and database persistence layers.

---

## 1. Audit Scope & Baseline Findings

An exhaustive forensic inspection of the codebase identified the following architectural and implementation gaps that prevented the application from functioning as a genuine database-backed product:

### Finding 1: OTP Delivery Dependency
- **File:** `src/lib/auth/otp-service.ts`
- **Issue:** In production, when external SMS gateways (Twilio / Supabase SMS) were unconfigured, the OTP dispatch function immediately failed with an error, preventing account creation and onboarding.
- **Requirement:** A controlled `AUTH_VERIFICATION_MODE=sandbox` must be implemented to allow account creation and onboarding with genuine session establishment without invoking external SMS gateways.

### Finding 2: Hardcoded Cryptographic Fallback Secrets
- **File:** `src/lib/auth/otp-service.ts`
- **Functions:** `hashOtpCode()`, `signSessionToken()`, `verifySessionToken()`
- **Issue:** Contained fallback logic catching configuration errors and defaulting to `"kaamsetu-dev-fallback-hmac-secret-32-chars"`.
- **Requirement:** Cryptographic operations must fail closed securely. Secrets must be derived from `RATE_LIMIT_HMAC_SECRET` with validated 256-bit entropy.

### Finding 3: Public Demo Persona Experience
- **Files:** `src/app/login/page.tsx`, `src/app/api/auth/persona/route.ts`, `src/lib/auth/personas.ts`, `src/lib/auth/server.ts`, `src/lib/supabase/middleware.ts`, `src/components/layout/institutional-header.tsx`
- **Issue:** The UI featured a "Switch Demo Persona" tab and quick demo cards for simulated workers/contractors, setting a `kaamsetu_demo_persona` cookie that bypassed database authentication.
- **Requirement:** Complete excision of the public demo persona login, controls, and cookies. The application must operate strictly via authenticated user sessions.

### Finding 4: Environment Variable Defaults
- **File:** `src/lib/env.ts`
- **Issue:** Zod environment schema defaulted `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` to placeholder strings (`https://placeholder-kaamsetu.supabase.co`).
- **Requirement:** Elimination of dangerous defaults that allow missing database configurations to masquerade as valid connections.

### Finding 5: Missing Account Registration Experience
- **File:** `src/app/auth/register/page.tsx` & `src/app/signup/page.tsx`
- **Issue:** `src/app/auth/register/page.tsx` merely re-exported `src/app/login/page.tsx` without offering a dedicated registration journey.
- **Requirement:** Full reconstruction of a dedicated registration page with name, phone, account type, terms consent, inline validation, and sandbox OTP verification.

### Finding 6: Demo-Dependent Profile Persistence
- **File:** `src/server/services/onboarding.service.ts`
- **Issue:** Line 117 checked `if (isConfigured.supabase && !user.isDemo)`, which skipped database persistence for any user marked as demo.
- **Requirement:** All authenticated accounts created via sandbox or real auth must persist directly into PostgreSQL (`profiles`, `worker_profiles`, `worker_skills`).

### Finding 7: Mock Profile Fallback
- **File:** `src/lib/supabase/db/profiles.ts`
- **Issue:** When Supabase was unavailable or unconfigured, methods returned `FEATURED_PROFESSIONALS` fixtures masquerading as production database records.
- **Requirement:** Isolation of test fixtures; production queries must return genuine database records or honest empty states.

---

## 2. Invariant Governance
1. **Permanent Constitutional Invariant:** `platform_commission_amount = 0.00` on artisan wages.
2. **Controlled Rollout Boundaries:** Restricted to Guwahati Urban (781001-781039) and Shillong Urban (793001-793022).
3. **Phone Verification Honesty:** Sandbox accounts must clearly disclose: `phone_verification_status = 'sandbox_unverified'` and `phone_verified = false`.
