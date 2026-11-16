# KAAMSETU — PHASE 39 SECURITY REGRESSION EVIDENCE REGISTER

**Program:** KAAMSETU Digital Identity & Worker Empowerment Platform  
**Target:** `Mayyank04/kaamsetu`  
**Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**Standard:** Enterprise Application Security & Cryptographic Integrity  

---

## 1. Automated Security Assertion Matrix

The Phase 39 test suite (`test/phase-39-production-reconstruction.test.ts`) verifies that all security boundaries, session primitives, and constitutional invariants are strictly upheld.

| Test ID | Security Category | Target Function / Module | Evaluated Condition | Result |
| :--- | :--- | :--- | :--- | :--- |
| **SEC-39-01** | Secret Quality | `getRateLimitHmacSecret()` | Rejects missing secrets and keys shorter than 32 characters. | **PASS** |
| **SEC-39-02** | Fail-Closed Crypto | `hashOtpCode()`, `signSessionToken()` | Throws `SecurityConfigurationError` when secret is missing; zero fallback strings. | **PASS** |
| **SEC-39-03** | Sandbox OTP Dispatch | `sendOtpChallenge()` | Dispatches 6-digit challenge without external API in `sandbox` mode; discloses code safely. | **PASS** |
| **SEC-39-04** | Atomic Consumption | `verifyOtpChallenge()` | Successfully consumes challenge once; second attempt with identical code fails (Anti-Replay). | **PASS** |
| **SEC-39-05** | Attempt Limiting | `verifyOtpChallenge()` | Invalidates challenge after 5 consecutive incorrect code submissions (Anti-Bruteforce). | **PASS** |
| **SEC-39-06** | Dispatch Rate Limit | `sendOtpChallenge()` | Blocks 4th OTP dispatch request within 15-minute sliding window (Anti-Flooding). | **PASS** |
| **SEC-39-07** | Session Signature | `verifySessionToken()` | Rejects tampered payloads or modified signatures in constant time. | **PASS** |
| **SEC-39-08** | Cookie Security | `verifyOtpChallenge()` | Emits cookie with `HttpOnly=true`, `SameSite=Lax`, and 7-day TTL. | **PASS** |
| **SEC-39-09** | Demo Decommissioning | `/api/auth/persona` | Returns HTTP 410 Gone with explicit retirement payload. | **PASS** |
| **SEC-39-10** | Honest Verification Tag | `profiles` Table Schema | Records `phone_verification_status = 'sandbox_unverified'` and `phone_verified = false`. | **PASS** |
| **SEC-39-11** | Commission Invariant | Payout & Booking Service | Enforces `platform_commission_amount = 0.00` on all artisan wages. | **PASS** |
| **SEC-39-12** | Geographic Invariant | Onboarding Service | Rejects registrations outside Guwahati Urban (781001-781039) and Shillong Urban (793001-793022). | **PASS** |

---

## 2. In-Depth Penetration & Robustness Scenarios

### Scenario A: Replay Attack on Consumed OTP
- **Vector:** An adversary captures a valid 6-digit OTP code and attempts to re-verify it after the legitimate user has already consumed it.
- **Defense Mechanism:** Challenge records in `otp_challenges` feature an atomic `consumed` flag and timestamp. Upon first verification, `consumed` is flipped to `true`.
- **Observed Behavior:** Subsequent verification requests return HTTP 400 (`Invalid or expired OTP code`).

### Scenario B: Timing Attack on Session Verification
- **Vector:** An attacker attempts byte-by-byte timing attacks against HMAC signature verification strings.
- **Defense Mechanism:** Signatures are evaluated using Node.js `crypto.timingSafeEqual`:
  ```typescript
  crypto.timingSafeEqual(expectedDigest, suppliedDigest)
  ```
- **Observed Behavior:** Constant-time verification execution invariant to match position.

### Scenario C: Bruteforce Code Enumeration
- **Vector:** An attacker attempts automated iteration across the $10^6$ possible 6-digit codes.
- **Defense Mechanism:**
  1. Each challenge allows a maximum of 5 attempts before irreversible invalidation.
  2. Each phone number is rate-limited to 3 challenge dispatches per 15 minutes.
  3. Total possible attempts per 15 minutes is bounded to 15. The probability of guessing a random 6-digit code within 15 attempts is $15 / 1,000,000 = 0.0015\%$.
