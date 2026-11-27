# KAAMSETU — PHASE 53.1: SANDBOX OTP TEST REPORT & SECURITY SPECIFICATION

**Operating Classification:** `CLASS_B_CONTROLLED_ROLLOUT` (Guwahati Urban & Shillong Urban)  
**Permanent Economic Invariant:** `platform_commission_amount = 0.00`  
**Date:** 2026-11-27  
**Module:** Sandbox OTP Authentication, Rate Limiting & Lifecycle Security  
**Target Branch:** `phase-53.1-signup-ui-and-sandbox-otp`  

---

## 1. Sandbox Mode Specification (`PHONE_OTP_MODE=sandbox`)

The platform implements an explicit authentication mode controlled by server configuration:
```env
PHONE_OTP_MODE=sandbox
SANDBOX_OTP_CODE=123456
AUTH_VERIFICATION_MODE=sandbox
```

### 1.1 Invariants & Security Boundaries
1. **Fixed Testing Code:** In sandbox mode, the server accepts and generates code `123456`.
2. **Explicit Labeling:** The signup UI prominently renders:
   `Sandbox verification — testing mode` (Amber pill badge with icon).
3. **Transparent Testing Display:** When sandbox mode is active, the UI displays `Testing OTP: 123456` with a one-click `Copy OTP` button.
4. **Server-Side Enforcement:** The frontend never decides whether an OTP is valid. All verification must execute through `POST /api/auth/otp/verify`.
5. **No Production Leakage:** In production environments (`NODE_ENV === "production"`), sandbox code is never returned unless explicitly opted in via `ALLOW_INSECURE_SANDBOX_IN_PRODUCTION === "true"`. Missing telecom credentials fail closed (HTTP 503).
6. **Honest Status Modeling:** Phones verified via sandbox OTP are explicitly stored as `phone_verification_status = "sandbox_verified"` with `verification_method = "sandbox"` and `phone_verified = false`. Sandbox verification is never misrepresented as physical carrier ownership proof.

---

## 2. OTP Defense Parameters & Test Results

| Parameter | Specification | Test Coverage | Result |
| :--- | :--- | :--- | :--- |
| **Fixed Sandbox Code** | Accepts `123456` server-side | `Test 2.1` & E2E Step 5 | **PASS** |
| **Incorrect Code Rejection** | Rejects codes other than `123456` | `Test 2.1` & E2E Step 4 | **PASS (HTTP 400)** |
| **Challenge Expiration** | 5-minute challenge lifespan (300s) | `Test 2.1` | **PASS (HTTP 400 OTP_EXPIRED)** |
| **Anti-Replay Protection** | Burned upon single use; repeat use fails | `Test 2.1` & Phase 49 `Test 6.1` | **PASS (HTTP 400 OTP_INVALID)** |
| **Max Verification Attempts** | Locked out after 5 consecutive failures | `Test 2.3` & Phase 49 `Test 6.2` | **PASS (HTTP 429 OTP_ATTEMPTS_EXCEEDED)** |
| **Resend Cooldown** | 45–60s cooldown between dispatch requests | `Test 2.2` & E2E Step 3 | **PASS (HTTP 429 RATE_LIMITED)** |
| **Production Sandbox Block** | Production without credentials fails closed | `Test 2.4` & Phase 52 `Test 3.1` | **PASS (HTTP 503 SMS_GATEWAY_UNAVAILABLE)** |
| **Cryptographic Proof Single-Use** | Nonce (`jti`) burned on account creation | `Test 3.1, 3.4` | **PASS (HTTP 401 on forged/replayed proof)** |

---

## 3. End-to-End Sandbox Flow Execution Trace

Executed via Chrome CDP on `http://localhost:3012/signup`:
1. **User Input:** Mobile number entered as `9876543210` with country code `+91`.
2. **Send Code:** User clicked `Verify phone number`. `POST /api/auth/otp/send` responded with HTTP 200, returning `isSandbox: true` and `sandboxCode: "123456"`.
3. **UI Expansion:** OTP card expanded displaying:
   - Amber badge: `Sandbox verification — testing mode`
   - Prompt: `We sent a verification code to +919876543210.`
   - Highlighted box: `Testing OTP: 123456` with button `Copy OTP`.
4. **Copy & Entry:** User clicked `Copy OTP` (button changed to `Copied!`). OTP input automatically populated with `123456`.
5. **Verify:** User clicked `Verify OTP`. `POST /api/auth/otp/verify` verified the challenge server-side, issued HMAC `verificationProof`, and returned `phoneVerificationStatus: "sandbox_verified"`.
6. **State Transition:** OTP section collapsed into a green banner `✓ Phone verified in sandbox mode`. Phone input locked with lock icon. Primary `Create Account` button unlocked and enabled.
