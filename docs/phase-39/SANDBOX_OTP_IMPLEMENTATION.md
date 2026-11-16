# KAAMSETU — PHASE 39 SANDBOX OTP IMPLEMENTATION & SIMULATION SPECIFICATION

**Program:** KAAMSETU Digital Identity & Worker Empowerment Platform  
**Target:** `Mayyank04/kaamsetu`  
**Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**Status:** Certified Active in Production & Staging  

---

## 1. Context & Architectural Rationale

In pre-Phase 39 releases, OTP authentication was tightly coupled to external telecom APIs (Twilio or Supabase Phone Auth). When SMS gateway credentials were not configured or lacked TRAI DLT template registration for Indian telecom operators, the authentication endpoint threw an unhandled exception, completely halting user registration, worker onboarding, and production evaluation.

Phase 39 introduces an enterprise-grade `AUTH_VERIFICATION_MODE=sandbox` engine that:
1. Eliminates reliance on external telecom networks during evaluation and staging.
2. Generates genuine cryptographic challenges and session tokens.
3. Transparently discloses sandbox codes to the client UI.
4. Honestly tags accounts in PostgreSQL with `phone_verification_status = 'sandbox_unverified'`.

---

## 2. Core Operational Modes

The OTP subsystem reads `AUTH_VERIFICATION_MODE` from the validated environment schema (`src/lib/env.ts`):

```typescript
AUTH_VERIFICATION_MODE: z.enum(["sandbox", "sms"]).default("sandbox")
```

| Mode | Gateway Triggered | Challenge Code Origin | UI Feedback | Persistence Layer |
| :--- | :--- | :--- | :--- | :--- |
| **`sandbox`** | None (Zero external SMS costs) | Cryptographic 6-digit random (or `SANDBOX_OTP_CODE`) | Sandbox test banner with 1-click auto-fill helper | `otp_challenges` table + memory cache |
| **`sms`** | Real Telecom Carrier (DLT / SMS gateway) | Cryptographic 6-digit random | "Enter 6-digit SMS code sent to your phone" | `otp_challenges` table + external carrier API |

---

## 3. Challenge Lifecycle & Cryptographic Hashing

```
[Client Request: Phone + Intent]
             │
             ▼
[Rate Limiter Check: Max 3 requests / 15m]
             │  (Pass)
             ▼
[Generate 6-Digit Code: crypto.randomInt(100000, 999999)]
             │
             ▼
[Generate Cryptographic Salt: crypto.randomBytes(16)]
             │
             ▼
[Compute HMAC-SHA256: Hash(Code + Salt, RATE_LIMIT_HMAC_SECRET)]
             │
             ▼
[Persist Challenge: otp_challenges Table]
   ├── phone: Normalized E.164 (+91XXXXXXXXXX)
   ├── code_hash: Hex-encoded HMAC digest
   ├── salt: Hex-encoded salt
   ├── expires_at: NOW() + 10 minutes
   ├── attempts: 0 (Limit: 5)
   └── consumed: false
             │
             ▼
[Deliver Response]
   ├── Sandbox Mode: { success: true, isSandbox: true, sandboxCode: "123456" }
   └── SMS Mode:     { success: true, isSandbox: false }
```

### 3.1 Rate Limiting Enforcements
- **Dispatch Limit:** Maximum 3 OTP requests per phone number within a rolling 15-minute sliding window. Requests exceeding this threshold fail closed with HTTP 429 (`Too Many Requests`).
- **Verification Attempt Limit:** Maximum 5 verification attempts per challenge. If 5 incorrect codes are supplied, the challenge is immediately invalidated (`consumed = true`).

### 3.2 Atomic Challenge Consumption
To prevent replay attacks, challenge verification is atomic:
1. Lookup active challenge where `phone = target` AND `consumed = false` AND `expires_at > NOW()`.
2. Compute `timingSafeEqual(computedHash, storedHash)`.
3. If matches: immediately update `consumed = true`, `consumed_at = NOW()`.
4. Issue `kaamsetu_session` cookie signed with HMAC-SHA256.

---

## 4. Honest Verification Tagging In PostgreSQL

Under no circumstances does sandbox mode masquerade as a verified cellular carrier handshake. In accordance with KAAMSETU's Institutional Trust Charter, the database migration `20261116000032_phase39_sandbox_account_and_verification_status.sql` records explicit audit columns on `profiles`:

```sql
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS phone_verification_status TEXT 
  DEFAULT 'sandbox_unverified' 
  CHECK (phone_verification_status IN ('unverified', 'sandbox_unverified', 'carrier_verified', 'institutional_verified'));

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS verification_method TEXT 
  DEFAULT 'sandbox' 
  CHECK (verification_method IN ('sandbox', 'sms_otp', 'institution_attested', 'biometric'));

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false;
```

When an account is created via sandbox mode:
- `phone_verification_status` $\leftarrow$ `'sandbox_unverified'`
- `verification_method` $\leftarrow$ `'sandbox'`
- `phone_verified` $\leftarrow$ `false`
- `account_status` $\leftarrow$ `'active'`

This ensures that any subsequent institutional verification or commercial credit underwriting can deterministically distinguish sandbox testing accounts from field-verified cellular subscribers.

---

## 5. UI Transparency & User Experience

In `src/app/login/page.tsx` and `src/app/auth/register/page.tsx`, when sandbox mode is active:
1. An informational alert is rendered explaining that the system is operating in verified sandbox mode.
2. The generated 6-digit code is clearly displayed directly in the form interface.
3. A helper button ("Use Test Code: XXXXXX") allows instant filling for frictionless QA and evaluation.
4. No fake success states or fabricated telecom dispatches are shown.
