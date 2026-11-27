# KAAMSETU — PHASE 53: SIGNUP SECURITY AUDIT
**Classification:** `CLASS_B_CONTROLLED_ROLLOUT` (Guwahati Urban & Shillong Urban)  
**Permanent Economic Invariant:** `platform_commission_amount = 0.00`  
**Date:** 2026-11-26  
**Auditor:** Principal Software & Application Security Architect

---

## 1. Executive Summary

This independent security audit examined the account registration mechanisms, authentication APIs, OTP lifecycle, database schemas, and client forms across KAAMSETU. Prior phases introduced direct password registration (Phase 40) alongside simulated OTP endpoints (Phase 39/49), but left critical vulnerabilities that allowed phone verification bypass, duplicate profile proliferation, and unverified identity claims.

This audit details the vulnerabilities discovered, their architectural root causes, and how Phase 53 permanently eliminates them.

---

## 2. Vulnerability Catalog & Root-Cause Analysis

### Vulnerability P53-V1: Direct Registration Bypassed Phone Verification (P0 - Critical)
- **Defect:** Prior to Phase 53, `POST /api/auth/register` accepted a JSON payload with `email`, `password`, `fullName`, and an optional `phone` string. Any caller—via curl, automated scripts, or browser dev tools—could submit account creation requests without proving possession of the phone number.
- **Root Cause:** In Phase 40 (`20261118_direct_registration_no_otp.sql`), email-based registration was introduced to decouple development from SMS gateways. The API failed to require cryptographic proof of OTP verification, leaving the phone field purely declarative.
- **Remediation:** `POST /api/auth/register` now strictly requires `verificationProof` (a time-bound, HMAC-SHA256 token signed by the server during OTP verification) binding the canonical E.164 phone number. Missing, expired, forged, or replayed tokens fail closed with HTTP 401 `PHONE_VERIFICATION_REQUIRED`.

### Vulnerability P53-V2: Multi-Role Duplicate Accounts on Identical Phone Numbers (P0 - Critical)
- **Defect:** A user could register once as an Artisan/Worker, then register again as a Contractor, Customer, Vendor, or Institution using the same mobile number. Multiple distinct rows in `public.profiles` could point to different Supabase Auth identities sharing the same physical phone.
- **Root Cause:** Database indexes on `public.profiles(phone)` were either non-unique or dropped during migrations that permitted null phone numbers (`20261118_direct_registration_no_otp.sql`). Furthermore, different roles were scoped only at the application level rather than enforced by an immutable database constraint.
- **Remediation:** Migration `20261126000001_phase53_unique_phone_and_optional_email.sql` introduces a partial unique database index:
  ```sql
  CREATE UNIQUE INDEX idx_profiles_verified_phone_unique
    ON public.profiles (phone)
    WHERE phone IS NOT NULL AND phone_verified = TRUE;
  ```
  Additionally, pre-registration checks query across canonical E.164 and legacy 10-digit formats, immediately rejecting duplicates with HTTP 409 `PHONE_ALREADY_REGISTERED`.

### Vulnerability P53-V3: Phone Format Inequivalence Bypass (P1 - High)
- **Defect:** A number entered as `9876543210` could be registered, and later re-registered by another party submitting `+919876543210`, `09876543210`, or `+91 98765 43210`. Unindexed variations bypassed string-equality checks.
- **Root Cause:** Different modules performed ad-hoc string formatting (`clean10` vs `+91` prefix) inconsistently before inserting into the database or querying rate limits.
- **Remediation:** All endpoints now funnel through `normalizePhoneNumber(rawPhone)` in `src/lib/utilities/phone.ts`. Numbers are transformed into canonical E.164 format (`+91XXXXXXXXXX`) prior to validation, rate limiting, hashing, OTP challenge generation, or SQL queries.

### Vulnerability P53-V4: Unearned Trust on Optional Email (P1 - High)
- **Defect:** Prior registration forms treated email as mandatory and marked it trusted in Supabase Auth (`email_confirm: true`), while informal Indian artisans frequently lack email or input third-party emails that were never verified.
- **Root Cause:** Conflating primary authentication identity (which must be the verified mobile phone) with optional electronic mail.
- **Remediation:** Email is now optional. When provided, it is stored in `public.profiles.email` with `email_verified = false`. It is never used as an unverified recovery identity. A synthetic phone handle (`phone.<hash>@phone.kaamsetu.internal`) anchors the credential layer in Supabase Auth if email is omitted.

### Vulnerability P53-V5: Production Sandbox OTP Leakage Risk (P0 - Critical)
- **Defect:** If test configuration flags were misconfigured in production, `sendOtp` could potentially expose `sandboxCode` in JSON responses or allow `123456` as a fixed code.
- **Root Cause:** Dual-mode code paths that did not fail closed on production boundaries.
- **Remediation:** `src/lib/auth/otp-service.ts` and `src/lib/env.ts` enforce:
  1. `NODE_ENV === "production"` defaults `AUTH_VERIFICATION_MODE` to `"sms"`.
  2. In production, `sandboxCode` is strictly stripped from all API outputs.
  3. `verifyOtp` rejects sandbox verification with HTTP 503 `LIVE_TELECOM_GATEWAY_REQUIRED` unless explicit, audited override flags exist.
  4. `validateEnvironmentSafety()` throws `FATAL SECURITY VIOLATION` upon startup if demo auth or insecure sandbox flags are detected in production.

---

## 3. Account Creation Surface Audit

Every route capable of generating user accounts was inspected:

| Route / Endpoint | Capability | Verification Enforcement | Role Boundaries |
| :--- | :--- | :--- | :--- |
| `POST /api/auth/register` | Direct user account creation | Enforced via `verificationProof` | Allowlisted: `worker`, `vendor`, `contractor`, `customer`, `institution` |
| `POST /api/auth/otp/verify` | Direct OTP verification | Enforced via telecom SMS / HMAC token | When `deferAccountCreation: true`, returns proof without writing to DB |
| `POST /api/auth/persona` | Legacy demo persona switcher | **Disabled (HTTP 410 Gone)** | Zero accounts generated |
| `POST /api/worker/onboarding/save` | Worker profile drafting | Only operates on authenticated session | Scoped to authenticated worker |
| `POST /api/institution/onboarding` | Institution profile creation | Guarded by `requireInstitution` / `requireAdmin` | Role escalation blocked |

---

## 4. Security Verification Verdict

The account creation surface is hardened against unverified registration, credential tampering, role escalation, and duplicate identity creation. All positive and negative security assertions passed in `test/phase-53-phone-verified-registration.test.ts`.
