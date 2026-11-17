# KAAMSETU — PHASE 39.3 API ERROR CONTRACT
## HTTP Status Codes, Typed Error Catalog, Response Schemas & Non-Fabrication Invariants

**Date:** 17 November 2026  
**Document Classification:** API Specification (`CLASS_B_CONTROLLED_ROLLOUT`)  
**Operating Branch:** `phase-39-3-production-otp-rate-limiter-recovery`  
**Status:** **`VERIFIED IN LOCAL TESTS`**

---

## 1. HTTP Status Code Decision Matrix

The API strictly enforces differentiated HTTP status codes based on the root failure category. A client error must never collapse into a server error, and an infrastructure outage must never masquerade as a user rate-limit breach.

| HTTP Status | Condition / Trigger | Typed Code | Cooldown Fields (`retryAfterSeconds`, `nextAllowedAt`) | `Retry-After` Header |
| :--- | :--- | :--- | :--- | :--- |
| **200 OK** | Challenge created or active challenge retrieved in sandbox | `null` | Populated (60s) | Optional |
| **400 Bad Request** | Invalid mobile number format (e.g. `5456565656`), invalid OTP format, or expired code | `INVALID_PHONE`, `OTP_INVALID`, `OTP_EXPIRED` | Strictly `undefined` | None |
| **429 Too Many Requests** | Genuine rate limit breach: 60s cooldown per phone, 5 OTP/hr per phone, 15 OTP/hr per IP, or max verification attempts | `ACTIVE_CHALLENGE_EXISTS`, `RATE_LIMITED`, `OTP_ATTEMPTS_EXCEEDED` | Truthful integer & ISO timestamp | Included (e.g. `Retry-After: 48`) |
| **503 Service Unavailable** | Database unreachable, missing Supabase RPC (`PGRST202`), cryptographic key failure, or unconfigured telecom gateway in live mode | `DATABASE_UNAVAILABLE`, `AUTH_CONFIGURATION_ERROR` | **Strictly `undefined` (Never Fabricated)** | **Strictly Omitted** |
| **500 Internal Error** | Unhandled server runtime exception | `INTERNAL_SERVER_ERROR` | Strictly `undefined` | None |

---

## 2. The Non-Fabrication Invariant on HTTP 503

> **Constitutional Rule:** The server shall never fabricate a cooldown period for server-side outages.

When an infrastructure error occurs (HTTP 503):
1. **Server Response:**
   ```json
   {
     "success": false,
     "code": "DATABASE_UNAVAILABLE",
     "message": "Authentication rate limiter temporarily unavailable. Your profile draft has been saved. Please retry in a moment.",
     "isInfrastructureError": true
   }
   ```
   Notice that `retryAfterSeconds` and `nextAllowedAt` are strictly absent.
2. **HTTP Headers:** The `Retry-After` header is omitted.
3. **Client UX (`useOtpFlow`):**
   ```typescript
   if (err.statusCode === 503 || err.isInfrastructureError) {
     setCooldownSeconds(0);
     setNextAllowedAt(null);
   }
   ```
   The client does NOT initiate a countdown timer. The user is presented with a retry button and reassurance that their registration draft is safely stored in local storage.

---

## 3. Typed Auth Error Catalog

| Code | User-Facing Message | HTTP Status |
| :--- | :--- | :--- |
| `INVALID_PHONE` | Enter a valid 10-digit Indian mobile number beginning with 6, 7, 8 or 9. | 400 |
| `RATE_LIMITED` | Too many requests. Please wait before trying again. | 429 |
| `ACTIVE_CHALLENGE_EXISTS` | Please wait before requesting a new code. | 429 |
| `OTP_EXPIRED` | Verification code has expired. Please request a new code. | 400 |
| `OTP_INVALID` | Incorrect verification code. Please check and try again. | 400 |
| `OTP_ATTEMPTS_EXCEEDED` | Maximum verification attempts exceeded. Please request a new code. | 429 |
| `AUTH_CONFIGURATION_ERROR` | Authentication service configuration error. Please contact support. | 503 |
| `DATABASE_UNAVAILABLE` | Authentication rate limiter temporarily unavailable. Your profile draft has been saved. Please retry in a moment. | 503 |
| `OTP_CHALLENGE_CREATION_FAILED` | Failed to create verification challenge. Please try again. | 503 |
| `INTERNAL_SERVER_ERROR` | We're temporarily unable to process this request. Please try again shortly. | 500 |

---

## 4. API Endpoints Specification

### 4.1 `POST /api/auth/otp/send`
**Request Payload:**
```json
{
  "phone": "9876543210",
  "role": "worker",
  "fullName": "Dipankar Das",
  "intent": "registration"
}
```

**Success Response (Sandbox, 200 OK):**
```json
{
  "success": true,
  "challengeCreated": true,
  "hasActiveChallenge": true,
  "message": "Sandbox verification code for +91 98*** ***10 generated. No SMS will be sent.",
  "isSandbox": true,
  "sandboxCode": "481920",
  "retryAfterSeconds": 60,
  "nextAllowedAt": "2026-11-17T06:00:00.000Z"
}
```

**Rate Limited Response (Cooldown, 429 Too Many Requests):**
```json
{
  "success": false,
  "code": "ACTIVE_CHALLENGE_EXISTS",
  "message": "Please wait 45 seconds before requesting a new code.",
  "hasActiveChallenge": true,
  "isSandbox": true,
  "sandboxCode": "481920",
  "retryAfterSeconds": 45,
  "nextAllowedAt": "2026-11-17T06:00:45.000Z"
}
```

**Invalid Phone Response (400 Bad Request):**
```json
{
  "success": false,
  "code": "INVALID_PHONE",
  "message": "Enter a valid 10-digit Indian mobile number beginning with 6, 7, 8 or 9.",
  "challengeCreated": false,
  "hasActiveChallenge": false
}
```

**Infrastructure Error Response (503 Service Unavailable):**
```json
{
  "success": false,
  "code": "DATABASE_UNAVAILABLE",
  "message": "Authentication rate limiter temporarily unavailable. Your profile draft has been saved. Please retry in a moment.",
  "isInfrastructureError": true
}
```

---

### 4.2 `POST /api/auth/otp/verify`
**Request Payload:**
```json
{
  "phone": "9876543210",
  "otp": "481920",
  "role": "worker",
  "fullName": "Dipankar Das",
  "intent": "registration"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "sessionToken": "<encoded_payload>.<hmac_signature>",
  "user": {
    "id": "usr-1731823200000",
    "phone": "+919876543210",
    "role": "worker",
    "fullName": "Dipankar Das",
    "phoneVerified": false,
    "phoneVerificationStatus": "sandbox_unverified",
    "verificationMethod": "sandbox"
  }
}
```
