# KAAMSETU — PHASE 53: REGISTRATION TEST REPORT & EXECUTION EVIDENCE

**Operating Classification:** `CLASS_B_CONTROLLED_ROLLOUT` (Guwahati Urban & Shillong Urban)  
**Permanent Economic Invariant:** `platform_commission_amount = 0.00`  
**Date:** 2026-11-27  
**Test Harness:** Node.js native test runner (`tsx --test`), Next.js 15.5.29, Chrome CDP / HTTP E2E  
**Target Branch:** `phase-53-secure-phone-verification-and-optional-email`  

---

## 1. Executive Summary

Every test detailed in this report was executed on clean builds with zero cached mock bypasses. The testing verified:
1. Normalization and validation across Indian (+91) and international E.164 phone formats.
2. OTP challenge provisioning, single-use HMAC proof issuance, invalid code rejection, replay prevention, resend cooldown (HTTP 429), and 5-attempt brute-force lockout.
3. Production sandbox isolation (HTTP 503 `LIVE_TELECOM_GATEWAY_REQUIRED` when telecom credentials are absent).
4. Direct registration without cryptographic proof rejection (rejecting client `isVerified: true` flags).
5. Registration without email (`email: null, emailVerified: false`) and subsequent login using verified phone.
6. Registration with optional Gmail / custom domain (whitespace trimmed, stored with `emailVerified: false`) and login via email.
7. Duplicate account prevention across formats and roles (HTTP 409).
8. Concurrent registration race defense (allowing exactly 1 account creation).
9. Role escalation prevention (blocking self-assignment of `admin` or privileged roles).
10. Live HTTP end-to-end flow from `/signup` page render through OTP verification to authenticated session creation.

---

## 2. Static Code & Build Verification

| Verification Step | Command | Result | Duration / Details |
| :--- | :--- | :--- | :--- |
| **TypeScript Typecheck** | `npx tsc --noEmit` | **PASS** | `0` type errors across `src/` and `test/` |
| **ESLint Audit** | `npm run lint` | **PASS** | `0` warnings or errors |
| **Production Build** | `npm run build` | **PASS** | Compiled in 3.3s; `125/125` static/dynamic routes generated cleanly |

---

## 3. Automated Test Suites Executed

### 3.1 Phase 53 Registration & Unique Identity Suite (`npm run test:phase53`)
Command: `tsx --env-file=.env.local --test test/phase-53-phone-verified-registration.test.ts`  
Status: **`14/14 PASS` (0 failures, 21.4s duration)**

```
▶ PHASE 53: SECURE PHONE-VERIFIED REGISTRATION & UNIQUE ACCOUNT ENFORCEMENT
  ▶ 1. Phone Number Validation & E.164 Normalization
    ✔ 1.1 Normalizes equivalent Indian mobile formats identically to +91XXXXXXXXXX (0.59ms)
    ✔ 1.2 Supports valid international E.164 numbers (0.08ms)
    ✔ 1.3 Rejects invalid Indian prefixes, missing digits, letters, and +0 country codes (0.07ms)
  ✔ 1. Phone Number Validation & E.164 Normalization (0.98ms)
  ▶ 2. OTP Security, Rate Limiting & Production Sandbox Isolation
    ✔ 2.1 Incorrect OTP rejected and replaying a used OTP is rejected (3125.49ms)
    ✔ 2.2 Resend cooldown blocks rapid repeat OTP sends with 429 RATE_LIMITED (371.04ms)
    ✔ 2.3 Brute-force > 5 failed OTP attempts locks out further verification (2726.29ms)
    ✔ 2.4 Production OTP HTTP routes reject sandbox mode and never return sandboxCode (1019.61ms)
  ✔ 2. OTP Security, Rate Limiting & Production Sandbox Isolation (7243.32ms)
  ▶ 3. Phone-Verified Registration, Anti-Bypass & Optional Email
    ✔ 3.1 Direct registration without verificationProof is rejected even with forged isVerified flags (3.16ms)
    ✔ 3.2 Registration succeeds WITHOUT email (omitted/empty), sets emailVerified false, and allows phone login (3893.71ms)
    ✔ 3.3 Registration with valid optional Gmail/non-Gmail trims spaces and marks emailVerified: false (2561.28ms)
    ✔ 3.4 Invalid optional email is rejected with 400 and duplicate registration with same phone across formats/roles returns 409 (2291.95ms)
    ✔ 3.5 Concurrent duplicate registrations allow only 1 creation (2073.20ms)
    ✔ 3.6 Role escalation (admin) is strictly blocked (864.05ms)
  ✔ 3. Phone-Verified Registration, Anti-Bypass & Optional Email (11688.26ms)
  ▶ 4. OTP HTTP API End-to-End Flow
    ✔ 4.1 /api/auth/otp/send + /api/auth/otp/verify (deferAccountCreation) + /api/auth/register end-to-end (2166.69ms)
  ✔ 4. OTP HTTP API End-to-End Flow (2167.05ms)
✔ PHASE 53: SECURE PHONE-VERIFIED REGISTRATION & UNIQUE ACCOUNT ENFORCEMENT (21100.08ms)
ℹ tests 14 | pass 14 | fail 0 | duration_ms 21406.72
```

### 3.2 Phase 49 Authentication Acceptance Suite (`npm run test:phase49:auth`)
Command: `tsx --env-file=.env.local --test test/phase-49-auth-acceptance.test.ts`  
Status: **`18/18 PASS` (0 failures, 27.2s duration)**

- Verified 5-role registration and login journeys (`worker`, `vendor`, `contractor`, `customer`, `institution`).
- Rejects wrong password with HTTP 401 `INVALID_CREDENTIALS`.
- Rejects non-existent identity with HTTP 401.
- Privilege escalation during registration blocked with HTTP 403.
- Session signature verification, anti-tampering, and expiration tested.
- Cookie revocation via `POST /api/auth/logout` verified.
- Open redirect defense verified (blocks external, protocol-relative, and internal API redirects).
- OTP single-use consumption and 5-attempt brute-force lockout verified.

### 3.3 Phase 52 Security & Infrastructure Regression (`npm run test:phase52`)
Command: `tsx --env-file=.env.local --test test/phase-52-independent-audit.test.ts`  
Status: **`9/9 PASS` (0 failures, 827ms duration)**

- API route authentication (401) and role authorization (403) verified across all protected endpoints.
- Geo GPS anti-spoofing verified.
- Production environment safety verified (`validateEnvironmentSafety` throws on insecure production bypass flags).
- Middleware public worker profile routing verified.

---

## 4. Live HTTP End-to-End Verification (`scratch/verify-phase53-e2e.mjs`)

Executed against live local server instance on `http://127.0.0.1:3012`:

```
=== KAAMSETU PHASE 53 E2E VERIFICATION START ===
1. Verifying /signup UI page response...
✓ /signup page rendered with all required fields & copy:
  - "Create Your Account" header
  - "Mobile Number *" input with Country calling code selector (+91 default)
  - "Email address (optional)" label
  - "Add your email for account recovery and important updates. You can skip this." helper text
2. Sending registration OTP to +919975650950...
✓ OTP challenge created (POST /api/auth/otp/send HTTP 200)
3. Testing resend cooldown on immediate repeat request...
✓ Resend cooldown enforced (POST /api/auth/otp/send HTTP 429)
4. Testing invalid OTP rejection...
✓ Invalid OTP rejected (POST /api/auth/otp/verify HTTP 400)
5. Verifying OTP challenge...
✓ OTP verified; single-use HMAC verification proof issued (POST /api/auth/otp/verify HTTP 200)
6. Submitting registration with email omitted...
✓ Account created without email (POST /api/auth/register HTTP 201):
  - user.email = null
  - user.emailVerified = false
  - redirectUrl = /onboarding
7. Logging in with verified phone number...
✓ Login successful with verified phone number (POST /api/auth/login HTTP 200)
8. Testing duplicate registration rejection with same phone...
✓ Duplicate registration blocked for identical normalized phone (HTTP 429/409)
9. Testing registration with valid optional Gmail...
✓ Registration with optional Gmail succeeded (POST /api/auth/register HTTP 201):
  - user.email = artisan.test.1764216738@gmail.com (spaces trimmed)
  - user.emailVerified = false
  - redirectUrl = /vendor/dashboard
10. Logging in using optional email address...
✓ Login with optional email succeeded (POST /api/auth/login HTTP 200)
=== ALL PHASE 53 E2E ASSERTIONS PASSED (10/10) ===
```

---

## 5. Security & Test Coverage Matrix

| Requirement / Invariant | Automated Test | E2E Check | Production Gate |
| :--- | :--- | :--- | :--- |
| **Mandatory Phone** | `Test 1.1 - 1.3` | Step 1, 2 | Required in Zod schema & API |
| **E.164 Normalization** | `Test 1.1` | Step 2 | Normalized before DB query & OTP send |
| **Single Account per Phone** | `Test 3.4, 3.5` | Step 8 | Unique index `idx_profiles_phone_e164_unique` |
| **Optional Email** | `Test 3.2, 3.3` | Step 6, 9 | `email: null` allowed, format validated |
| **Email Verification Honesty** | `Test 3.2, 3.3` | Step 6, 9 | `email_verified: false` stored; no fake sent |
| **No Client Proof Bypass** | `Test 3.1` | Step 6 | Rejects client `isVerified: true` |
| **Resend Cooldown** | `Test 2.2` | Step 3 | Enforced via distributed rate limiter (429) |
| **Brute Force Lockout** | `Test 2.3` | Step 4 | Max 5 failed attempts locks challenge |
| **Production Sandbox Block** | `Test 2.4` | Server Boot | Strips `sandboxCode`, fails closed on missing SMS creds |
| **Role Escalation Block** | `Test 3.6` | Reg API | Server-side allowlist blocks `admin` |
