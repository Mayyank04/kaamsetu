# KAAMSETU — PHASE 39.6 OTP SANDBOX VALIDATION

**Document ID:** `KAAMSETU-39-6-OTP-SANDBOX`  
**Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**Status:** `VERIFIED LOCALLY ONLY`

---

## 1. Sandbox Delivery & Invariant Enforcement

When `AUTH_VERIFICATION_MODE=sandbox`:
1. **Zero External Telecom Egress:** No HTTP packets are transmitted to Twilio or external SMS gateways.
2. **Cryptographic Randomness:** Challenges are generated via `crypto.randomInt(100000, 999999).toString()`.
3. **No Backdoor Bypass:** Universal codes (e.g. `'123456'`) are rejected unless explicitly configured server-side.
4. **Honest Verification Tagging:**
   - Accounts verified via sandbox are recorded with:
     - `phone_verification_status = "sandbox_unverified"`
     - `phone_verified = false`
     - `verification_method = "sandbox"`
   - No real-world telecom ownership is declared or certified.
5. **Single-Use Atomic Consumption:**
   - Challenge consumption executes in PostgreSQL with `FOR UPDATE` locking.
   - Replayed codes are rejected immediately.
   - Max 5 failed attempts locks out the phone for 15 minutes.
