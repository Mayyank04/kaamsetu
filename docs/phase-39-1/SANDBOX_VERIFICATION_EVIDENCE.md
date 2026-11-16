# KAAMSETU — PHASE 39.1 SANDBOX VERIFICATION EVIDENCE
## Transparent Test Code Generation, Telecom Isolation & Security Invariants

**Programme:** KAAMSETU Digital Identity Platform  
**Classification:** Controlled Rollout Test Assurance  
**Operating Boundary:** `CLASS_B_CONTROLLED_ROLLOUT`  

---

## 1. Sandbox Verification Mechanics

When `AUTH_VERIFICATION_MODE=sandbox` is configured in the environment:
1. **Telecom Packet Isolation:** The system NEVER dispatches SMS packets to Twilio or telecom gateways.
2. **Deterministic Cryptographic Simulation:** A 6-digit numeric verification code is generated via `crypto.randomInt(100000, 999999)` (or overridden by `SANDBOX_OTP_CODE` for automated QA).
3. **Transparent UI Disclosure:** The sandbox test code is prominently surfaced in the UI with a distinct, respectful informational banner:
   - Badge: `SANDBOX TEST MODE` / `NO SMS DISPATCHED`
   - Test Code: displayed in high-contrast monospace font (`font-mono tracking-widest`)
   - One-Click Helpers: `Auto-fill` and `Copy`
4. **Honest Database Tagging:**
   Artisans and users registered via sandbox mode are recorded with:
   - `phone_verification_status = 'sandbox_unverified'`
   - `phone_verified = false`
   - `verification_method = 'sandbox'`
   The platform NEVER manufactures false claims of SMS or government-backed verification.

---

## 2. Evidence of Sandbox Challenge Lifecycle

### Request (POST `/api/auth/otp/send`)
```json
{
  "phone": "+919876543210",
  "role": "worker",
  "fullName": "Suresh Boro",
  "intent": "registration"
}
```

### Initial Response (HTTP 200 OK)
```json
{
  "success": true,
  "message": "Sandbox mode enabled. Use the test code displayed below to complete verification.",
  "isSandbox": true,
  "sandboxCode": "847291",
  "retryAfterSeconds": 60,
  "nextAllowedAt": "2026-11-16T17:21:45.120Z",
  "statusCode": 200
}
```

### Immediate Subsequent Request (HTTP 429 Too Many Requests)
```json
{
  "success": false,
  "message": "Please wait 58 seconds before requesting a new code.",
  "retryAfterSeconds": 58,
  "nextAllowedAt": "2026-11-16T17:21:45.120Z",
  "hasActiveChallenge": true,
  "isSandbox": true,
  "sandboxCode": "847291",
  "statusCode": 429
}
```

### Verification Request (POST `/api/auth/otp/verify`)
```json
{
  "phone": "+919876543210",
  "otp": "847291",
  "role": "worker",
  "fullName": "Suresh Boro",
  "intent": "registration"
}
```

### Verification Response (HTTP 200 OK)
```json
{
  "success": true,
  "message": "Sandbox verification complete. Account active (phone verification not completed).",
  "user": {
    "id": "c8b417c8-71e2-4521-884e-e5a9b1c73a81",
    "phone": "+919876543210",
    "fullName": "Suresh Boro",
    "role": "worker",
    "isDemo": false,
    "accountStatus": "active",
    "phoneVerificationStatus": "sandbox_unverified",
    "verificationMethod": "sandbox",
    "phoneVerified": false
  },
  "sessionToken": "eyJ1c2VySWQiOiJjOGI0MTdjOC...e47a9f",
  "redirectUrl": "/dashboard",
  "isSandbox": true,
  "statusCode": 200
}
```

---

## 3. Security Invariants Verified

- **Single-Use Atomic Consumption:** Once `847291` is verified, re-submitting returns `400 Bad Request: Verification code already used.`
- **Attempt Bounding:** Submitting 5 incorrect codes locks the challenge for 900 seconds.
- **Timing Attack Safety:** HMAC signature verification on `kaamsetu_session` uses `crypto.timingSafeEqual`.
- **Fail-Closed Secrets:** In production, missing or short `RATE_LIMIT_HMAC_SECRET` rejects with a clean generic message while logging fatal security diagnostics internally.
