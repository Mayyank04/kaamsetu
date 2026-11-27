# KAAMSETU — PHASE 54: PHONE VERIFICATION & IDENTITY REPORT

**Product:** KAAMSETU  
**Mission:** Every skill deserves to be seen, even without a degree.  
**Classification:** `CLASS_B_CONTROLLED_ROLLOUT` (Guwahati Urban & Shillong Urban)  
**Permanent Constitutional Invariant:** `platform_commission_amount = 0.00` on artisan wages  
**Verification Date:** November 27, 2026  

---

## 1. Executive Summary

Phase 54 establishes a verified mobile phone identity architecture for KAAMSETU artisans and customers. The system enforces that mobile number verification proves **access to the phone number**, distinguishing genuine carrier SMS verification from sandbox test verification, while firmly rejecting any false claim that phone verification constitutes government ID certification or police background checks.

Every registered account is verified server-side through time-bound OTP proofs, bound to canonical E.164 normalized identities, and stored with immutable verification metadata in PostgreSQL.

---

## 2. Core Architectural Guarantees

| Invariant | Implementation Mechanism | Enforcement Layer |
|---|---|---|
| **Mandatory Phone** | Required normalized E.164 phone number on signup (`+91XXXXXXXXXX`) | Frontend + Zod Schema + Postgres `NOT NULL` |
| **Server-Issued Proof** | Single-use HMAC-SHA256 verification proof token issued upon OTP success | `src/lib/auth/otp-service.ts` |
| **Anti-Bypass Protection** | Client-supplied booleans (`isVerified: true`, `phoneVerified: true`) are stripped | `src/app/api/auth/register/route.ts` |
| **Unique Identity** | One verified phone number corresponds to exactly one KAAMSETU identity | Database unique index `idx_profiles_phone_e164_unique` |
| **Separation of Modes** | `sms_verified` (carrier SMS) vs `sandbox_verified` (test harness) vs `not_verified` | `phone_verification_status` column constraint |
| **Fail-Closed Production** | In `NODE_ENV=production`, OTP sandbox is strictly rejected with HTTP 503 | `src/lib/auth/otp-service.ts` |

---

## 3. Verification Modes & Badge Semantics

The platform provides a restrained, dignified visual badge reflecting real database verification status without AI ornamentation or inflated claims:

### 3.1 Real Carrier Verification (`phone_verification_status === 'sms_verified'`)
- **Badge Label:** `Phone verified`
- **Visual Styling:** Emerald tint (`bg-emerald-50 text-emerald-800 border-emerald-600/25`) with CheckCircle2 icon.
- **Semantic Meaning:** The worker successfully entered an OTP received via their mobile carrier network.
- **Strict Invariant:** Never described as government ID, background check, or trade certification.

### 3.2 Test Verification (`phone_verification_status === 'sandbox_verified'`)
- **Badge Label:** `Test verified`
- **Visual Styling:** Amber tint (`bg-amber-50 text-amber-900 border-amber-600/25`) with AlertCircle icon.
- **Semantic Meaning:** Completed in development/test sandbox environment. Real carrier phone ownership is not confirmed.

### 3.3 Unverified (`phone_verification_status === 'not_verified'`)
- **Display:** No badge rendered. Returns `null`.

---

## 4. Verification Flow & Lifecycle

```
[User Phone Input]
       │
       ▼
[POST /api/auth/otp/send] ──► [Normalizes to E.164]
       │                   ──► [Rate Limit Check: 60s cooldown, max 5 attempts/hr]
       │                   ──► [Issues OTP via Twilio / Sandbox]
       ▼
[POST /api/auth/otp/verify] ──► [Constant-time OTP Check]
       │                    ──► [Generates single-use JTI proof token]
       ▼
[POST /api/auth/register] ──► [Validates & consumes proof token]
       │                  ──► [Enforces unique phone_e164 in DB]
       ▼
[Session Issued] ─────────► [Phone locked, Verified status persisted]
```

---

## 5. Automated Test Evidence

Executed via `npm run test:phase54` and `npm run test:phase53`:

```
✔ 1.1 Normalizes equivalent Indian mobile formats identically to +91XXXXXXXXXX
✔ 1.2 Supports valid international E.164 numbers
✔ 2.1 Incorrect OTP rejected and replaying a used OTP is rejected
✔ 2.2 Resend cooldown blocks rapid repeat OTP sends with 429 RATE_LIMITED
✔ 2.3 Brute-force > 5 failed OTP attempts locks out further verification
✔ 2.4 Production OTP HTTP routes reject sandbox mode and never return sandboxCode
✔ 3.1 Direct registration without verificationProof is rejected even with forged isVerified flags
✔ 3.2 Registration succeeds WITHOUT email (omitted/empty), sets emailVerified false
✔ 3.3 Registration with valid optional Gmail trims spaces and marks emailVerified: false
✔ 3.4 Duplicate registration with same phone across formats/roles returns 409
✔ 3.5 Concurrent duplicate registrations allow only 1 creation
✔ 5.1 Worker can register with phone OTP verification and optional email (HTTP 201)
✔ 5.2 Worker can register with phone OTP verification without email (HTTP 201)
✔ 5.3 Duplicate phone registration is securely rejected (HTTP 409)
```

---

## 6. Conclusion

Phone verification in KAAMSETU Phase 54 is fully implemented, cryptographically validated, database-enforced, and verified across unit, integration, and browser testing environments.
