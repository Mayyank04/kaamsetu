# KAAMSETU — PHASE 39.6 OTP SANDBOX VERIFICATION & SECURITY

**Document ID:** `KAAMSETU-39-6-OTP-SANDBOX`  
**Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**Status:** `VERIFIED_LOCALLY`

---

## 1. Sandbox Verification Invariants

When `AUTH_VERIFICATION_MODE=sandbox`:
1. **Zero Telecom Transmission:** No outbound HTTP requests or SMS packets are dispatched to Twilio or telecom gateways.
2. **Cryptographic Randomness:** Codes are generated via `crypto.randomInt(100000, 999999).toString()`.
3. **No Backdoor Bypass:** Universal codes like `'123456'` are explicitly rejected unless configured as a valid 6-digit server environment variable.
4. **Transparent Disclosure:** Sandbox verification mode is explicitly tagged with `isSandbox: true` and honest messaging in the UI.
5. **No False Phone Verification Claims:** Accounts created or authenticated via sandbox OTP receive `phone_verification_status = "sandbox_unverified"` and `phone_verified = false`. They are never represented as holding government-verified or telecommunications-verified phone ownership.

---

## 2. Anti-Replay & Expiration Lifecycle

- **Expiration Window:** 300 seconds (5 minutes). Challenges past expiration are rejected with `OTP_EXPIRED`.
- **Atomic Single-Use Consumption:** Successful verification stamps `consumed_at = now()` in a `FOR UPDATE` transaction. Replayed attempts return `NOT_FOUND` / `INVALID_CODE`.
- **Attempt Bounding:** Up to 5 verification attempts are allowed per challenge. Subsequent attempts are rejected with `OTP_ATTEMPTS_EXCEEDED`.
