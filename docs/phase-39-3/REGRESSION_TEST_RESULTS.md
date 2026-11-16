# KAAMSETU — PHASE 39.3 REGRESSION TEST AUDIT REGISTER
## Complete Execution Matrix Across Historical & Phase 39.3 Verification Suites

**Date:** 17 November 2026  
**Document:** `docs/phase-39-3/REGRESSION_TEST_RESULTS.md`  
**Test Runner:** Node.js native test runner (`node:test`, `node:assert/strict`) via `tsx`  
**Total Test Count:** 170 tests across 7 phases  
**Overall Result:** **100% PASS (0 Failures, 0 Regressions, 0 Skipped)**  

---

## 1. Test Execution Summary

| Phase Suite | Command | Total Tests | Passed | Failed | Status |
|-------------|---------|-------------|--------|--------|--------|
| **Phase 39.3** | `npm run test:phase39.3` | 22 | 22 | 0 | **PASS** |
| **Phase 39.2** | `npm run test:phase39.2` | 24 | 24 | 0 | **PASS** |
| **Phase 39.1** | `npm run test:phase39.1` | 18 | 18 | 0 | **PASS** |
| **Phase 39** | `npm run test:phase39` | 36 | 36 | 0 | **PASS** |
| **Phase 38** | `npm run test:phase38` | 34 | 34 | 0 | **PASS** |
| **Phase 37** | `npm run test:phase37` | 25 | 25 | 0 | **PASS** |
| **Phase 36.1** | `npm run test:phase36.1` | 11 | 11 | 0 | **PASS** |
| **TypeScript** | `npx tsc --noEmit` | N/A | 0 errors | 0 | **PASS** |
| **ESLint** | `npm run lint` | N/A | 0 warnings | 0 | **PASS** |
| **Next.js Build** | `npm run build` | 114 pages | 114 static/dynamic | 0 | **PASS** |

---

## 2. Phase 39.3 Scenario Breakdown

### Section 1: Indian Mobile Validation 10-Number Matrix
- `9876543210` (starts with 9) -> **PASS**
- `8765432109` (starts with 8) -> **PASS**
- `7654321098` (starts with 7) -> **PASS**
- `6543210987` (starts with 6) -> **PASS**
- `5456565656` (reproduction case: starts with 5) -> **REJECTED** with exact error message
- `1234567890` (starts with 1) -> **REJECTED**
- `0123456789` (starts with 0) -> **REJECTED**
- `987654321` (9 digits) -> **REJECTED**
- `98765432109` (11 digits) -> **REJECTED**
- `98765ABCD0` (alphanumeric) -> **REJECTED**
- Normalization tolerates: `+91`, domestic `0`, and whitespace formatting.

### Section 2: Zod Schema & API Early Rejection
- `phoneAuthSchema` rejects `5456565656` before hitting any backend logic.
- `/api/auth/otp/send` returns `HTTP 400 Bad Request` with `{ code: "INVALID_PHONE" }`.
- `/api/auth/otp/verify` returns `HTTP 400 Bad Request` with `{ code: "OTP_INVALID" }` for malformed codes.

### Section 3: Typed Error Catalog Contract
- All 10 standard codes mapped with HTTP status and user-facing messages.
- `DATABASE_UNAVAILABLE` (503) message reassures user that profile draft is safely preserved.

### Section 4: Sandbox Delivery & Security Invariants
- Random 6-digit PIN generated under sandbox mode.
- Insecure universal backdoor `123456` strictly rejected.
- Atomic single-use consumption prevents code replay.

### Section 5: Cooldown & Active Challenge State Recovery
- Second request during cooldown returns 429 with `ACTIVE_CHALLENGE_EXISTS` and challenge code recovery.

### Section 6: Session Cryptography & Integrity
- HMAC-SHA256 session token signed with sandbox security invariants (`phone_verification_status = 'sandbox_unverified'`, `phone_verified = false`).

### Section 7: Worker Onboarding Persistence & Minting
- Worker profile saved to Guwahati Urban (`IN-AS-2026-XXXX-KS`).
- Permanent constitutional invariant enforced: `platform_commission = 0.00%`.
