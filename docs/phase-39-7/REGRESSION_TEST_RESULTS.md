# KAAMSETU — PHASE 39.7: REGRESSION TEST RESULTS

**Document ID:** `KAAMSETU-39-7-TEST-RESULTS`  
**Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**Status:** `VERIFIED LOCALLY`  
**Permanent Financial Invariant:** `platform_commission_amount = 0.00` on artisan wages  

---

## 1. Automated Test Execution Evidence

### Command: `npm run test:phase39.7`
- **Execution Date:** 2026-11-18
- **Runner:** Node.js native test runner via `tsx`
- **Pass Rate:** 18/18 tests passed (100%)
- **Total Duration:** 111.9ms

### 18 Mandatory Acceptance Criteria Matrix

| Scenario | Test Objective & Verification Target | Result | Duration |
|---|---|---|---|
| **Scenario 1** | User can register without a mobile number (email + password only) | **PASS** | 0.64ms |
| **Scenario 2** | User can register with an unverified mobile number as contact detail | **PASS** | 0.40ms |
| **Scenario 3** | Zero `POST /api/auth/otp/send` requests during registration | **PASS** | 0.05ms |
| **Scenario 4** | Zero OTP verification modals in onboarding flow | **PASS** | 0.06ms |
| **Scenario 5** | Zero SMS provider (Twilio) invocations | **PASS** | 0.36ms |
| **Scenario 6** | Account creation succeeds with scrypt password hashing | **PASS** | 59.69ms |
| **Scenario 7** | Supabase migration contract includes `email`, `password_hash`, `password_salt` | **PASS** | 0.85ms |
| **Scenario 8** | Worker registration redirects directly to `/onboarding` | **PASS** | 0.24ms |
| **Scenario 9** | Profile draft persists and restores from `localStorage` | **PASS** | 0.11ms |
| **Scenario 10** | Session token restores user claims across page refreshes | **PASS** | 0.17ms |
| **Scenario 11** | Direct login verifies password and issues fresh session cookie | **PASS** | 38.74ms |
| **Scenario 12** | Tenant isolation prevents cross-user session tampering | **PASS** | 0.14ms |
| **Scenario 13** | Unverified users cannot self-assign `admin` or privileged roles | **PASS** | 0.27ms |
| **Scenario 14** | Login rate limiter blocks brute force after 5 failed attempts | **PASS** | 0.12ms |
| **Scenario 15** | Registration rate limiter caps rapid account creation (max 10/hr) | **PASS** | 0.08ms |
| **Scenario 16** | Session signature validation enforces real 256-bit cryptographic keys | **PASS** | 0.09ms |
| **Scenario 17** | Out-of-rollout geography receives truthful `OUT_OF_BOUNDS` status | **PASS** | 1.22ms |
| **Scenario 18** | Invariants upheld: `platform_commission_amount = 0.00` & Class B rollout | **PASS** | 0.06ms |

---

## 2. Complementary Test Suite Execution Evidence

| Test Suite | Command | Coverage | Result |
|---|---|---|---|
| **Phase 39.7 Direct Auth** | `npm run test:phase39.7` | 18 mandatory acceptance criteria | **18/18 PASS** |
| **Phase 39.6 Root Cause** | `npm run test:phase39.6` | 36 scenarios (consent, images, Gemini, invariants) | **36/36 PASS** |
| **Incident Repair Suite** | `npm run test:incident-repair` | 14 rate-limiter, HMAC & cooldown tests | **14/14 PASS** |
| **TypeScript Compilation** | `npx tsc --noEmit` | Workspace-wide static type checking | **0 Errors** |
| **ESLint Hygiene** | `npm run lint` | Next.js code standards & syntax hygiene | **0 Warnings / 0 Errors** |
| **Production Build** | `npm run build` | Next.js 15.5 production compile (116 static pages) | **Exit Code 0** |
