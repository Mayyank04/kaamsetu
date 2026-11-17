# AUTOMATED REGRESSION TEST EVIDENCE DOSSIER

**Document ID:** `KAAMSETU-DOC-39-6-10`  
**Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**Status:** `VERIFIED LOCALLY`

---

## 1. Test Suite Execution Summary

All automated test suites across Phase 39.1 through Phase 39.6 were executed successfully with 0 failures:

| Test Suite | Command | Total Tests | Passed | Failed | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Phase 39.6 Master Recovery** | `npm run test:phase39.6` | 36 | 36 | 0 | **PASS** |
| **Phase 39.5 Gemini & Homepage** | `npm run test:phase39.5` | 5 | 5 | 0 | **PASS** |
| **Phase 39.4 Complete Lifecycle**| `npm run test:phase39.4` | 27 | 27 | 0 | **PASS** |
| **Phase 39.3 Auth Restoration**  | `npm run test:phase39.3` | 21 | 21 | 0 | **PASS** |
| **Phase 39.2 Runtime OTP**       | `npm run test:phase39.2` | 24 | 24 | 0 | **PASS** |
| **Incident Repair Audit**        | `npm run test:incident-repair` | 14 | 14 | 0 | **PASS** |
| **Aggregate Total**              | Across all test suites | **127** | **127** | **0** | **PASS** |

---

## 2. 21 Mandatory Regression Scenarios Evidence (Phase 39.6)

1. **Scenario 1 (Local Registration):** `sendOtp({ phone, intent: "registration" })` creates challenge and succeeds. (PASS)
2. **Scenario 2 (Vercel Registration Contract):** Session signing and verification succeeds with durable claims. (PASS)
3. **Scenario 3 (Sandbox OTP Request):** OTP dispatch in sandbox mode returns 6-digit sandbox code transparently. (PASS)
4. **Scenario 4 (OTP Verification):** Valid sandbox code verifies and returns signed session token. (PASS)
5. **Scenario 5 (Invalid OTP Rejection):** Deliberate invalid code (`000000`) is rejected with `OTP_INVALID` (400). (PASS)
6. **Scenario 6 (Expired OTP Rejection):** Past-expiry challenge is rejected with `OTP_EXPIRED`. (PASS)
7. **Scenario 7 (Replayed OTP Rejection):** Previously consumed challenge cannot be re-verified. (PASS)
8. **Scenario 8 (Rate Limits Enforcement):** Rapid second send within 60s cooldown is rejected with HTTP 429. (PASS)
9. **Scenario 9 (Concurrency Protection):** Concurrent requests cannot bypass atomic rate-limit window. (PASS)
10. **Scenario 10 (Missing RPC Diagnostic):** Production mode returns typed error `RATE_LIMIT_INFRASTRUCTURE_UNAVAILABLE` (503). (PASS)
11. **Scenario 11 (Safe Secret Failure):** Missing HMAC signing secret in production throws fatal configuration error. (PASS)
12. **Scenario 12 (Supabase Timeout):** Timeout fails closed, strictly preventing unverified session bypass. (PASS)
13. **Scenario 13 (Registration to Login Flow):** Registered user can request OTP and login successfully. (PASS)
14. **Scenario 14 (Session Invalidation):** Tampered or invalidated token rejects authentication. (PASS)
15. **Scenario 15 (Draft Preservation):** Artisan onboarding profile draft survives authentication interruptions. (PASS)
16. **Scenario 16 (Profile Persistence):** Verified user profile persists with name, trade, and location. (PASS)
17. **Scenario 17 (Cross-User Isolation):** User A cannot access User B's profile identity. (PASS)
18. **Scenario 18 (Invalid PIN Rejection):** Malformed and non-numeric PIN codes rejected with format error. (PASS)
19. **Scenario 19 (Unsupported Geography Notice):** Valid 6-digit Indian PIN outside Guwahati/Shillong receives distinct service area notice. (PASS)
20. **Scenario 20 (Authorized Geography):** Guwahati (`781001`) and Shillong (`793001`) proceed as `AUTHORIZED`. (PASS)
21. **Scenario 21 (Gemini Outage Resilience):** Deterministic fallback extracts trade without hallucinating fake names. (PASS)

---

## 3. Preflight Infrastructure Diagnostic Script Evidence

Command: `npx tsx scripts/verify-deployment-preflight.ts`  
Status: Explicit, deterministic check of environment variables, cryptographic entropy, and remote Supabase tables/procedures.
