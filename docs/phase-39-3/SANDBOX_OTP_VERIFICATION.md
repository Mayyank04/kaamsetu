# KAAMSETU — PHASE 39.3 SANDBOX OTP VERIFICATION
## Cryptographic Challenge Generation, Zero SMS Telecom Isolation & Atomic Anti-Replay

**Date:** 17 November 2026  
**Document:** `docs/phase-39-3/SANDBOX_OTP_VERIFICATION.md`  
**Configuration:** `AUTH_VERIFICATION_MODE=sandbox`  
**Security Invariant:** Zero SMS dispatch, random 6-digit PIN, single-use atomic consumption, removal of backdoor universal OTP  

---

## 1. Specification & Mode Enforcement

In development and authorized sandbox environments:
- `AUTH_VERIFICATION_MODE=sandbox`
- Zero SMS messages are transmitted to telecom networks.
- A secure random 6-digit numeric PIN is generated via `crypto.randomInt(100000, 999999)`.
- The challenge is hashed using HMAC-SHA256 (`hashOtpCode`) and persisted.
- Under sandbox mode, the plaintext 6-digit code is returned in the API response (`sandboxCode`) solely to populate UI test helpers (Auto-fill and Copy).

---

## 2. Elimination of Backdoor Universal Code

In prior phases, `src/lib/auth/otp-service.ts` contained an insecure fallback:
```typescript
// REMOVED INSECURE BACKDOOR:
// (!isProduction && req.otp === "123456")
```
This allowed arbitrary verification of any challenge with `123456`.
In Phase 39.3, this backdoor has been completely excised. Every verification requires a cryptographically matching hash or an explicit active sandbox challenge match. Verification attempts with `123456` against random challenges are rejected with `OTP_INVALID`.

---

## 3. Atomic Single-Use Consumption (Anti-Replay)

When an OTP code is verified:
1. The matching active challenge is checked.
2. The challenge is marked `consumed = true` with `consumed_at = now()`.
3. If an attacker or duplicate client thread attempts to verify the same OTP a second time, the attempt is immediately rejected with `OTP_INVALID` (already consumed).
4. Concurrent requests are protected by atomic check-and-consume invariants in both the PostgreSQL function `verify_and_consume_otp` and the in-memory synchronization store.

---

## 4. Honest Credential & Session Invariants

To avoid misleading workers or ecosystem partners:
- `phone_verification_status = 'sandbox_unverified'`
- `phone_verified = false`
- `verification_method = 'sandbox'`
- Issued session tokens explicitly embed these attributes in their cryptographically signed claims.
