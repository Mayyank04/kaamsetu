# KAAMSETU — PHASE 39.2 ACTIVE CHALLENGE RECOVERY & SANDBOX VERIFICATION

**Feature Domain:** Sovereign Authentication & Verification Flow  
**Primary Invariant:** Zero SMS Dispatch in Development & Staging Environments  
**Status Flag:** `phone_verification_status = 'sandbox_unverified'`  
**Auditor:** Senior Authentication & UX Resilience Engineer  

---

## 1. Problem Definition & Architectural Purpose

When an artisan or informal worker requests an OTP code, real-world conditions often cause interruptions:
- The network drops temporarily.
- The user accidentally closes the modal or navigates away.
- The user re-clicks "Send Verification Code" after 15 seconds.

In traditional flawed architectures, re-clicking "Send Verification Code" results in an immediate `429 Too Many Requests` error with a 60-second cooldown message, stranding the user on the phone entry screen without the code or a way to enter it.

**Phase 39.2 Solution:** The server inspects existing storage for an active, unexpired verification challenge for that phone number. If found during a cooldown window, the server returns:
```json
{
  "success": false,
  "challengeCreated": false,
  "hasActiveChallenge": true,
  "isSandbox": true,
  "sandboxCode": "140737",
  "retryAfterSeconds": 48
}
```
The client UI detects `hasActiveChallenge: true` and immediately transitions the user to the OTP entry screen, presenting the active code and enabling instant verification.

---

## 2. In-Memory Store Architecture & Lifecycle

### 2.1 Storage Structure
Challenges are maintained in `memoryOtpStore` bound to `globalThis.__kaamsetu_memory_otp_store`:
```typescript
interface StoredOtpChallenge {
  phone: string;
  code: string;               // 6-digit cryptographic PIN
  hashedCode: string;         // SHA-256 hash for secure comparison
  attempts: number;           // Remaining verification attempts (starts at 5)
  expiresAt: number;          // Epoch timestamp (10 minutes from creation)
  createdAt: number;          // Epoch timestamp of issuance
  fullName?: string;          // Associated artisan legal name
  isSandbox: boolean;         // True in dev/staging/preview
}
```

### 2.2 Active Challenge Lookup Algorithm
```typescript
// src/lib/auth/otp-service.ts
const existingChallenge = memoryOtpStore.get(normalizedPhone);
const hasActiveChallenge = Boolean(
  existingChallenge &&
  existingChallenge.expiresAt > Date.now() &&
  existingChallenge.attempts > 0
);
```
If `hasActiveChallenge` is true:
- During cooldown: The existing challenge's `sandboxCode` is returned in the 429 response so the user can verify without waiting.
- During verification: The stored challenge is validated against the user's entered code.

---

## 3. Transparent Sandbox Verification Mode

### 3.1 Transparent Invariants
1. **Zero SMS Cost / Zero Telecom Integration:**
   No SMS gateway or Twilio/Gupshup API is invoked in development or test modes.
2. **Deterministic Sandbox Code Generation:**
   In sandbox mode, a 6-digit cryptographically pseudo-random PIN is generated and surfaced transparently in the response payload.
3. **Database Integrity Preservation:**
   When an artisan is registered via sandbox mode, their database profile record explicitly stores:
   - `phone_verified = false`
   - `phone_verification_status = 'sandbox_unverified'`
   - `metadata.verifiedViaSandbox = true`
   This guarantees that simulated registrations are completely distinguishable from production telecom-verified records and cannot bypass institutional trust checks.

---

## 4. UI Active Challenge Helpers

In Step 2 of the verification modal:
1. **Sandbox Test Mode Disclosure Banner:**
   Prominently displays "Sandbox Test Mode" and "No SMS Sent" to reassure the user that no carrier charges or real SMS messages were initiated.
2. **Auto-Fill Button:**
   One-click button that populates the 6-digit code directly into the input field and triggers validation.
3. **Copy Code Button:**
   Copies the 6-digit code to the clipboard, providing tactile "Copied" feedback.
4. **Change Number Button:**
   Allows the user to easily back out and fix a mistyped phone number.
5. **Live Ticking Resend Countdown:**
   Counts down in real-time (`Resend code in 45s`). When the timer hits 0s, the countdown dynamically transforms into a clickable `Resend Verification Code` link.
