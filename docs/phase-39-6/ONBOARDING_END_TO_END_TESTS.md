# KAAMSETU — PHASE 39.6 ONBOARDING END-TO-END TESTS

**Document ID:** `KAAMSETU-39-6-ONBOARDING-E2E`  
**Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**Status:** `VERIFIED_LOCALLY`

---

## 1. Test Suite Verification Results

Command: `npm run test:phase39.6`  
Pass Rate: 36/36 tests passing (100%)

### Detailed Scenario Coverage

| Scenario ID | Test Scenario Description | Assertion | Result |
|---|---|---|---|
| **Scenario 1** | Local registration succeeds | `sendOtp` returns `success: true, challengeCreated: true` | **PASS** |
| **Scenario 2** | Vercel production registration contract | HMAC session token generates and verifies with durable claims | **PASS** |
| **Scenario 3** | Sandbox OTP request flow | Transparent sandbox code provisioned without SMS | **PASS** |
| **Scenario 4** | OTP verification & session issuance | Valid sandbox code verifies and mints session token | **PASS** |
| **Scenario 5** | Invalid OTP rejection | Code `000000` rejected with `OTP_INVALID` (400) | **PASS** |
| **Scenario 6** | Expired OTP rejection | Expired challenge rejected with `OTP_EXPIRED` (400) | **PASS** |
| **Scenario 7** | Replay attack defense | Consumed OTP challenge cannot be replayed | **PASS** |
| **Scenario 8** | Rate limiting enforcement | Immediate second OTP request rejected with HTTP 429 | **PASS** |
| **Scenario 9** | Concurrency bounds | Parallel requests cannot exceed threshold | **PASS** |
| **Scenario 10** | Missing RPC diagnostic | Production missing RPC returns `RATE_LIMIT_INFRASTRUCTURE_UNAVAILABLE` (503) | **PASS** |
| **Scenario 11** | Missing signing secret safety | Missing HMAC secret throws fatal config error | **PASS** |
| **Scenario 12** | Database timeout fail-closed | Database timeout fails closed, preventing unauthenticated access | **PASS** |
| **Scenario 13** | Registration to login transition | Registered artisan logs in with verified session | **PASS** |
| **Scenario 14** | Logout session invalidation | Invalidated cookie token cannot access authenticated routes | **PASS** |
| **Scenario 15** | Profile draft survival | Draft survives authentication interruptions without data loss | **PASS** |
| **Scenario 16** | Profile database persistence | Worker profile accurately persists with name, trade, and PIN | **PASS** |
| **Scenario 17** | Multi-tenant user isolation | User A cannot access or modify User B's profile | **PASS** |
| **Scenario 18** | Malformed PIN rejection | Non-numeric or incomplete PIN rejected with format error | **PASS** |
| **Scenario 19** | Out-of-bounds geographic error | Valid PIN outside Class B cluster receives distinct service notice | **PASS** |
| **Scenario 20** | Class B authorized geography | Guwahati (`781001`) and Shillong (`793001`) return `AUTHORIZED` | **PASS** |
| **Scenario 21** | Gemini fallback extraction | Deterministic fallback operates faithfully without hallucinated personas | **PASS** |
