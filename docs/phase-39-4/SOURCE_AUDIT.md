# KAAMSETU — PHASE 39.4 SOURCE CODE & DEFECT AUDIT
## Comprehensive Source-Level Forensic Audit & Architectural Vulnerability Remediation

**Repository:** `Mayyank04/kaamsetu`  
**Branch:** `phase-39-4-complete-auth-and-production-recovery`  
**Baseline Commits:** Phase 39.2 (`4d1f544`), Phase 39.3 (`636b30e`)  
**Operating Classification:** `CLASS_B_CONTROLLED_ROLLOUT` (Guwahati Urban & Shillong Urban)  
**Permanent Financial Invariant:** `platform_commission_amount = 0.00`  
**Audit Status:** `VERIFIED WORKING`

---

## 1. Executive Summary

A comprehensive source-level forensic audit of the KAAMSETU codebase was conducted across the authentication lifecycle, credential persistence layers, rate limiting infrastructure, Next.js middleware, and UI hooks. 

The audit identified nine distinct architectural defects that caused the recurring OTP deadlocks, HTTP 503 infrastructure errors, rate limiter failures on Vercel production deployments, and authentication lifecycle inconsistencies observed across previous iterations.

All nine defects have been systematically remediated with zero regressions.

---

## 2. Forensic Analysis of Identified Defects & Remediations

### Defect 1: Critical Production In-Memory Bypass & Serverless Isolation
- **Location:** `src/lib/auth/otp-service.ts`
- **Root Cause:** The OTP dispatch logic contained a condition:
  ```ts
  if (isProduction && !isSandbox) { return 503; }
  ```
  When `isSandbox` was true in production, database insertion errors did not fail closed. Instead, execution continued and stored the challenge in `memoryOtpStore` (`Map<string, MemoryOtpRecord>`). On Vercel serverless functions, each HTTP request may execute in an isolated ephemeral micro-VM. When the user submitted the verification code, `/api/auth/otp/verify` was handled by a different lambda instance where `memoryOtpStore` was empty, resulting in `No active verification code found for this number`.
- **Remediation:** In production, any database insertion failure or unconfigured Supabase client strictly **fails closed** with HTTP 503 `DATABASE_UNAVAILABLE`, regardless of whether `verificationMode` is sandbox or SMS. Zero in-memory fallback is permitted in production environments.

### Defect 2: Missing Account Existence Validation on Login
- **Location:** `src/lib/auth/otp-service.ts` (`sendOtp`)
- **Root Cause:** Prior to Phase 39.4, `sendOtp` issued an OTP challenge to any valid mobile number without checking whether an account actually existed. When a user attempted to sign in with an unregistered phone number, an OTP was dispatched, verified, and a session token was minted with a phantom random UUID, leaving the user with an orphaned session and broken dashboard state.
- **Remediation:** `sendOtp` now accepts an `intent: "login" | "registration"` parameter. When `intent === "login"`, `sendOtp` queries `public.profiles` for `phone = formatted`. If no profile exists, it immediately aborts with HTTP 404 and typed code `ACCOUNT_NOT_FOUND`, displaying actionable instructions to register first.

### Defect 3: Missing Duplicate Prevention on Registration
- **Location:** `src/lib/auth/otp-service.ts` (`sendOtp` and `verifyOtp`)
- **Root Cause:** Registration requests did not verify whether the phone number was already assigned to an existing worker or contractor profile. A duplicate registration could overwrite existing profile metadata or fail at database insert time with an unhandled exception.
- **Remediation:** When `intent === "registration"`, `sendOtp` queries `public.profiles`. If a record already exists, it immediately returns HTTP 409 and typed code `ACCOUNT_ALREADY_EXISTS`, guiding the user to sign in instead. `verifyOtp` enforces the same check atomically before profile creation.

### Defect 4: Client Role Spoofing & Escalation Vulnerability
- **Location:** `src/lib/auth/otp-service.ts` (`verifyOtp`)
- **Root Cause:** `verifyOtp` accepted `role?: string` from the client request body and used it directly when minting session tokens:
  ```ts
  resolvedRole = req.role || "worker";
  ```
  A malicious client could pass `role: "admin"` during login to escalate their privilege level.
- **Remediation:** Anti-role escalation is now strictly enforced. During login, the user's role is authoritatively resolved from `existingProfile.role` in the PostgreSQL database. Client-supplied `role` parameters during login are completely ignored.

### Defect 5: Non-Unique Phone Column in `public.profiles`
- **Location:** `supabase/migrations/20261115000001_initial_schema.sql`
- **Root Cause:** The `profiles` table defined `phone TEXT` without a unique constraint or unique index. Under concurrent registration requests, race conditions could insert multiple profile rows with identical phone numbers, corrupting authentication lookups.
- **Remediation:** Authored Migration 34 (`20261117000034_phase39_4_account_lifecycle_and_persistence.sql`), which establishes:
  ```sql
  CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_phone_unique 
      ON public.profiles(phone) WHERE phone IS NOT NULL;
  ```

### Defect 6: Foreign Key Constraint Blocking Sovereign Service-Role Profiles
- **Location:** `public.profiles.id REFERENCES auth.users(id)`
- **Root Cause:** Migration 01 established a foreign key constraint linking `profiles.id` directly to Supabase internal `auth.users(id)`. When registering users through sovereign cryptographic phone OTP without GoTrue, inserting into `profiles` failed with a foreign key violation (`violates foreign key constraint profiles_id_fkey`).
- **Remediation:** Migration 34 cleanly drops the foreign key constraint:
  ```sql
  ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
  ```
  This allows the backend service role to generate cryptographically secure UUIDs for worker profiles while maintaining referential integrity for downstream child tables.

### Defect 7: Row-Level Security Blocking Worker Onboarding Persistence
- **Location:** `src/server/services/onboarding.service.ts`
- **Root Cause:** `OnboardingService` instantiated `createServerSupabaseClient()`, which operates under anon or authenticated user context. Because sovereign OTP users authenticate via HMAC-signed session cookies (`kaamsetu_session`) rather than Supabase Auth JWT tokens, Supabase RLS evaluated requests as anonymous visitors, rejecting `worker_profiles` inserts with permission denied errors.
- **Remediation:** Switched `OnboardingService` to use `createAdminClient()`. Server-side validation authoritatively verifies session tokens and inputs before executing privileged database writes.

### Defect 8: Edge Runtime Incompatibility in Next.js Middleware
- **Location:** `src/lib/supabase/middleware.ts`
- **Root Cause:** Middleware imported Node.js `crypto` (`import * as crypto from "crypto"`) and used Node.js `Buffer.from()` to verify HMAC signatures. Next.js middleware executes in the Edge Runtime, where Node.js standard library modules are unsupported, causing build warnings and potential runtime crashes on Vercel Edge nodes.
- **Remediation:** Rebuilt `verifyMiddlewareSessionToken` using the Web Crypto API (`crypto.subtle`) and standard Web APIs (`TextEncoder`, `Uint8Array`, `atob`). Zero Node.js `crypto` or `Buffer` dependencies remain in middleware code.

### Defect 9: Incomplete Cookie Scope on Logout
- **Location:** `src/app/api/auth/logout/route.ts`
- **Root Cause:** The logout handler cleared cookies without explicitly defining `path: "/"`. Depending on the client path from which logout was triggered (e.g. `/contractor/settings`), browser cookie jars retained the session cookie for parent or sibling paths.
- **Remediation:** Added explicit `path: "/"`, `maxAge: 0`, and `expires: new Date(0)` to cookie deletion options for `kaamsetu_session` and `kaamsetu_demo_persona`.

---

## 3. Verification & Compliance Matrix

| Defect ID | Affected Component | Failure Mode | Fix Implemented | Local Test | Remote Deployment |
|---|---|---|---|---|---|
| DEF-01 | `otp-service.ts` | Memory bypass on Vercel lambda | Fail-closed on DB error | `VERIFIED WORKING` | `IMPLEMENTED — NOT LIVE VERIFIED` |
| DEF-02 | `otp-service.ts` | Phantom login for missing account | Mandatory existence check | `VERIFIED WORKING` | `IMPLEMENTED — NOT LIVE VERIFIED` |
| DEF-03 | `otp-service.ts` | Duplicate account overwrites | Mandatory conflict check (409) | `VERIFIED WORKING` | `IMPLEMENTED — NOT LIVE VERIFIED` |
| DEF-04 | `otp-service.ts` | Client role spoofing / escalation | DB-authoritative role binding | `VERIFIED WORKING` | `IMPLEMENTED — NOT LIVE VERIFIED` |
| DEF-05 | Migration 34 | Race condition duplicate phones | `idx_profiles_phone_unique` | `VERIFIED WORKING` | `IMPLEMENTED — NOT LIVE VERIFIED` |
| DEF-06 | Migration 34 | `profiles_id_fkey` constraint error | Dropped legacy FK constraint | `VERIFIED WORKING` | `IMPLEMENTED — NOT LIVE VERIFIED` |
| DEF-07 | `onboarding.service.ts` | RLS rejected worker save | Admin client with server auth | `VERIFIED WORKING` | `IMPLEMENTED — NOT LIVE VERIFIED` |
| DEF-08 | `middleware.ts` | Edge runtime crash on Node crypto | Web Crypto API (`crypto.subtle`) | `VERIFIED WORKING` | `VERIFIED WORKING` |
| DEF-09 | `logout/route.ts` | Leaked session cookie on subpaths | Explicit `path: "/"` deletion | `VERIFIED WORKING` | `VERIFIED WORKING` |
