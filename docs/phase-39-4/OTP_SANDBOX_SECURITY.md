# KAAMSETU — PHASE 39.4 OTP SANDBOX SECURITY
## Cryptographic Sandbox Architecture, Security Invariants & Defense-in-Depth Specification

**Repository:** `Mayyank04/kaamsetu`  
**Target Branch:** `phase-39-4-complete-auth-and-production-recovery`  
**Operating Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**Permanent Financial Invariant:** `platform_commission_amount = 0.00`  
**Security Status:** `VERIFIED WORKING`

---

## 1. Sandbox Purpose & Operating Invariants

In high-assurance workforce platforms, testing and evaluating real registration workflows must not incur external telecom charges, spam real mobile numbers, or leave hardcoded backdoors in production code.

KAAMSETU implements an enterprise-grade cryptographic sandbox environment governed by four non-negotiable security invariants:

1. **Zero External Telecom Dispatch:** Under `AUTH_VERIFICATION_MODE=sandbox`, no SMS API calls are made to Twilio, Supabase SMS, or cellular gateways.
2. **Zero Hardcoded Backdoors:** The system rejects predictable backdoor codes such as `123456`, `000000`, or `111111`. Every sandbox code is dynamically generated via a cryptographically secure pseudorandom number generator (CSPRNG).
3. **Atomic Single-Use Consumption:** A sandbox OTP code can only be used once. Replaying the code immediately fails with `OTP_INVALID`.
4. **Honest Status Attribution:** Profiles registered via sandbox verification are tagged with `phone_verification_status = 'sandbox_unverified'` and `phone_verified = false`. They are never dishonestly flagged as live SMS-verified.

---

## 2. Cryptographic Code Generation & Storage

Sandbox codes are generated on the server using Node.js `crypto.randomInt`:
```ts
const otpCode = crypto.randomInt(100000, 999999).toString();
```
The raw 6-digit code is never stored in plain text in the database. Instead, it is stored as an HMAC-SHA256 digest keyed with `RATE_LIMIT_HMAC_SECRET`:
```ts
export function hashOtpCode(otp: string): string {
  const secret = getRateLimitHmacSecret();
  return crypto.createHmac("sha256", secret).update(`otp:${otp}`).digest("hex");
}
```
The mobile phone number is similarly transformed into a privacy-preserving lookup key:
```ts
const phoneHashed = hashRateLimitKey("phone:identity", formatted);
```

Database schema representation in `public.otp_challenges`:
```sql
CREATE TABLE IF NOT EXISTS public.otp_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_hash TEXT NOT NULL,
    otp_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'worker',
    full_name TEXT,
    intent TEXT NOT NULL DEFAULT 'registration',
    verification_mode TEXT NOT NULL DEFAULT 'sandbox',
    attempts INTEGER NOT NULL DEFAULT 0,
    max_attempts INTEGER NOT NULL DEFAULT 5,
    expires_at TIMESTAMPTZ NOT NULL,
    consumed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## 3. Expiration & Anti-Replay Defense

1. **Time-to-Live (TTL):** Every challenge expires exactly 300 seconds (5 minutes) after creation. Verification requests submitted after `expires_at` are rejected with HTTP 400 and code `OTP_EXPIRED`.
2. **Single-Use Atomic Consumption:** The PostgreSQL stored procedure `public.verify_and_consume_otp` locks the record `FOR UPDATE`, checks `consumed_at IS NULL`, updates `consumed_at = now()`, and returns success within a single atomic database transaction. If the same code is submitted concurrently or sequentially, the second request fails.
3. **Lockout Defense (Brute-Force Protection):** Up to 5 verification attempts are permitted per challenge. Upon the 5th incorrect attempt, the phone identity key is blocked for 900 seconds (15 minutes), and the system returns HTTP 429 `OTP_ATTEMPTS_EXCEEDED`.

---

## 4. Transparent Sandbox User Experience

To facilitate end-to-end evaluation without telecom costs, the frontend UI surfaces transparent helpers exclusively when `res.isSandbox === true`:

- **Visual Sandbox Badge:** Informs the user that the system is operating in simulated test mode.
- **Display of Server-Generated PIN:** The generated 6-digit PIN is displayed in a monospace block.
- **Copy Helper:** A single-click copy button copies the code to the clipboard.
- **Auto-Fill Action:** An "Auto-fill Code" button automatically populates the 6-digit input boxes, accelerating acceptance testing.

---

## 5. Security Invariant Verification Matrix

| Security Control | Implementation Mechanism | Expected Behaviour | Test Result |
|---|---|---|---|
| Zero Telecom Dispatch | `isSandbox` branch bypasses Twilio/SMS | Zero outbound network calls | `VERIFIED WORKING` |
| CSPRNG Code Generation | `crypto.randomInt(100000, 999999)` | Non-deterministic 6-digit PIN | `VERIFIED WORKING` |
| Backdoor Rejection | Server rejects universal code `123456` | Rejects with `OTP_INVALID` | `VERIFIED WORKING` |
| 5-Minute TTL | `expires_at = now() + interval '5 min'` | Rejects with `OTP_EXPIRED` | `VERIFIED WORKING` |
| Anti-Replay Defense | `consumed_at = now()` atomic update | Second attempt rejected | `VERIFIED WORKING` |
| 5-Attempt Lockout | `attempts >= max_attempts` check | 15-minute lockout (HTTP 429) | `VERIFIED WORKING` |
| Honest Identity Modeling | `phone_verification_status = 'sandbox_unverified'` | Database records test status | `VERIFIED WORKING` |
