# KAAMSETU — PHASE 39.6 AUTHENTICATION END-TO-END TESTS

**Document ID:** `KAAMSETU-39-6-AUTH-TESTS`  
**Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**Status:** `VERIFIED LOCALLY ONLY`

---

## 1. Automated Test Execution Evidence

Command: `npm run test:phase39.6`  
Pass Rate: 36/36 tests passed (100%)

### Test Scenario Matrix

| Scenario | Objective | Result |
|---|---|---|
| **Scenario 1** | Local registration succeeds | **PASS** |
| **Scenario 2** | Vercel production registration contract | **PASS** |
| **Scenario 3** | Sandbox OTP challenge creation | **PASS** |
| **Scenario 4** | OTP verification and session issuance | **PASS** |
| **Scenario 5** | Rejection of invalid OTP (`000000`) | **PASS** |
| **Scenario 6** | Rejection of expired challenge | **PASS** |
| **Scenario 7** | Anti-replay defense on consumed challenge | **PASS** |
| **Scenario 8** | 60-second cooldown enforcement (429) | **PASS** |
| **Scenario 9** | Concurrency safety under simultaneous requests | **PASS** |
| **Scenario 10** | Missing RPC returns `RATE_LIMIT_INFRASTRUCTURE_UNAVAILABLE` (503) | **PASS** |
| **Scenario 11** | Missing HMAC signing secret fails closed | **PASS** |
| **Scenario 12** | Database timeout fails closed | **PASS** |
| **Scenario 13** | Registered artisan logs in successfully | **PASS** |
| **Scenario 14** | Logout invalidates session token | **PASS** |
| **Scenario 15** | Profile draft preserved across auth interruptions | **PASS** |
| **Scenario 16** | Profile persists to database | **PASS** |
| **Scenario 17** | Tenant isolation prevents cross-user access | **PASS** |
| **Scenario 18** | Malformed PIN rejected with field error | **PASS** |
| **Scenario 19** | Out-of-bounds geography receives distinct service notice | **PASS** |
| **Scenario 20** | Authorized Guwahati/Shillong geography passes | **PASS** |
| **Scenario 21** | Gemini fallback operates faithfully | **PASS** |
