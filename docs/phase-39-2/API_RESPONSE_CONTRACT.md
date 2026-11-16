# KAAMSETU — PHASE 39.2 API RESPONSE CONTRACT & SCHEMA SPECIFICATION

**Protocol:** HTTP/1.1 & HTTP/2 JSON REST  
**Base Path:** `/api/auth/otp`  
**Security Headers:** `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Content-Security-Policy`  
**Authentication Boundary:** Sandbox Simulation & Production Zero-SMS Invariant  

---

## 1. Overview & Architectural Directives

To permanently eliminate ambiguous cooldown deadlocks, all authentication and verification endpoints adhere to a deterministic contract. Every response explicitly conveys:
1. Whether an OTP challenge was created (`challengeCreated: boolean`).
2. Whether an unexpired active challenge currently exists in storage (`hasActiveChallenge: boolean`).
3. Whether sandbox simulation mode is active (`isSandbox: boolean`).
4. The simulated verification code in sandbox mode (`sandboxCode?: string`).
5. The remaining cooldown time in seconds before a resend is permitted (`retryAfterSeconds?: number`).
6. The ISO-8601 timestamp after which a new code may be requested (`nextAllowedAt?: string`).
7. Whether a failure was caused by backend infrastructure rather than rate limiting (`isInfrastructureError?: boolean`).

---

## 2. Endpoint: `POST /api/auth/otp/send`

### 2.1 Request Schema
```typescript
interface SendOtpRequestPayload {
  phone: string;              // 10-digit Indian mobile number (e.g., "9876543210")
  role?: string;               // Default: "worker"
  fullName?: string;           // Optional worker attestation legal name
}
```

### 2.2 Response Scenarios

#### Scenario A: Challenge Successfully Created (HTTP 200 OK)
Returned when no active cooldown exists and an OTP challenge is generated.
```json
{
  "success": true,
  "challengeCreated": true,
  "hasActiveChallenge": true,
  "isSandbox": true,
  "sandboxCode": "140737",
  "retryAfterSeconds": 60,
  "nextAllowedAt": "2026-11-17T00:03:00.000Z",
  "message": "[Sandbox Mode] Verification code generated: 140737. No SMS was sent."
}
```

#### Scenario B: Rate Limited with Active Challenge in Flight (HTTP 429 Too Many Requests)
Returned when a request is made within the 60-second cooldown period, but a previous unexpired challenge exists.
```json
{
  "success": false,
  "challengeCreated": false,
  "hasActiveChallenge": true,
  "isSandbox": true,
  "sandboxCode": "140737",
  "retryAfterSeconds": 48,
  "nextAllowedAt": "2026-11-17T00:03:00.000Z",
  "message": "Please wait 48 seconds before requesting a new code. You have an active verification code waiting."
}
```
*Client Action:* The UI transitions to the OTP entry step and enables "Enter Existing Code" or auto-fills the sandbox code.

#### Scenario C: Rate Limited without Active Challenge (HTTP 429 Too Many Requests)
Returned when the phone number is throttled (e.g. hourly limit exhausted) and no active challenge is valid.
```json
{
  "success": false,
  "challengeCreated": false,
  "hasActiveChallenge": false,
  "isSandbox": true,
  "retryAfterSeconds": 3600,
  "nextAllowedAt": "2026-11-17T01:02:00.000Z",
  "message": "Hourly request limit reached. Please wait before requesting another code."
}
```

#### Scenario D: Infrastructure / Database Error (HTTP 503 Service Unavailable)
Returned when remote database RPCs fail in production. This must **never** be presented as a user rate limit.
```json
{
  "success": false,
  "isInfrastructureError": true,
  "statusCode": 503,
  "message": "Authentication service temporarily unavailable. Please retry in a moment."
}
```

---

## 3. Endpoint: `POST /api/auth/otp/verify`

### 3.1 Request Schema
```typescript
interface VerifyOtpRequestPayload {
  phone: string;              // 10-digit Indian mobile number
  code: string;               // 6-digit numeric verification code
  fullName?: string;           // Optional worker attestation legal name
}
```

### 3.2 Response Scenarios

#### Scenario A: Verification Successful (HTTP 200 OK)
Signs authentication session and sets `kaamsetu_auth_token` HTTP-only signed cookie.
```json
{
  "success": true,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "phone": "+919876543288",
    "role": "worker",
    "fullName": "Rameshwar Sharma",
    "phoneVerified": false,
    "phoneVerificationStatus": "sandbox_unverified",
    "isSandbox": true
  },
  "message": "Mobile number verified via transparent sandbox simulation."
}
```

#### Scenario B: Invalid Code (HTTP 400 Bad Request)
```json
{
  "success": false,
  "remainingAttempts": 4,
  "message": "Invalid verification code. 4 attempts remaining."
}
```

#### Scenario C: Maximum Verification Attempts Exceeded (HTTP 429 Too Many Requests)
```json
{
  "success": false,
  "remainingAttempts": 0,
  "message": "Maximum verification attempts exceeded. Please request a new code."
}
```

---

## 4. Contract Conformance Proof

Every schema requirement has been verified through automated integration tests in `test/phase-39-2-runtime-otp-recovery.test.ts`:
- **Scenario A (200):** Tested in `Scenario 3 & 4`
- **Scenario B (429 with challenge):** Tested in `Scenario 5 & 10`
- **Scenario C (429 without challenge):** Tested in `Scenario 11`
- **Scenario D (503 infrastructure):** Tested in `Scenario 2`
- **Verify (200 with sandbox status):** Tested in `Scenario 13 & 14`
