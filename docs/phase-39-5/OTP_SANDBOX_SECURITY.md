# KAAMSETU — PHASE 39.5 OTP SANDBOX SECURITY SPECIFICATION

**Mode:** `AUTH_VERIFICATION_MODE=sandbox`  
**Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**Status:** VERIFIED LOCALLY

---

## 1. Sandbox Invariants & Honest Attribution

1. **Zero External Telecom Dispatch:**
   In sandbox mode, no external SMS gateway (Twilio, Gupshup, Fast2SMS) is called. No telecommunication charges or toll fraud risks are incurred.
2. **CSPRNG Code Generation:**
   Every challenge is generated using Node.js `crypto.randomInt(100000, 1000000)`.
3. **No Universal Backdoors:**
   Universal codes like `'123456'` are strictly rejected with HTTP 400.
4. **Honest Verification Attribution:**
   Sandbox-verified accounts are explicitly tagged in profile records:
   - `phone_verified = false`
   - `verification_method = "sandbox"`
   - `phone_verification_status = "sandbox_unverified"`
   No high-privilege operations or sovereign loan disbursements are granted solely based on simulated verification.
5. **Single-Use Anti-Replay Defense:**
   Challenges are marked `consumed_at` atomically; reuse attempts return HTTP 400 `OTP_INVALID`.
6. **Rate-Limiting & Lockout:**
   - 60-second minimum cooldown interval per phone.
   - Max 5 OTPs per phone per hour.
   - Max 15 OTPs per IP per hour.
   - 5 consecutive failed verification attempts triggers a 15-minute lockout.
