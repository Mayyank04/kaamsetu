# KAAMSETU — PHASE 39.4 AUTHENTICATION ARCHITECTURE
## Sovereign Cryptographic Authentication Lifecycle & State Machine Specification

**Repository:** `Mayyank04/kaamsetu`  
**Target Branch:** `phase-39-4-complete-auth-and-production-recovery`  
**Operating Classification:** `CLASS_B_CONTROLLED_ROLLOUT` (Guwahati Urban & Shillong Urban)  
**Permanent Financial Invariant:** `platform_commission_amount = 0.00`  
**Architecture Status:** `VERIFIED WORKING`

---

## 1. High-Level Architectural Overview

KAAMSETU implements a decentralized, sovereign worker authentication model designed specifically for skilled informal artisans, master craftspeople, and independent contractors in India.

The authentication architecture is governed by five foundational pillars:

1. **Phone-First Identity:** The primary identity anchor is a validated 10-digit Indian mobile number conforming to E.164 standards (+91 prefix with initial digit 6, 7, 8, or 9).
2. **Server-Controlled Verification Modes:** The application operates in either `sandbox` mode (cryptographic simulated verification without telecom dispatch) or `sms` mode (live telecom delivery via Twilio or Supabase SMS).
3. **Fail-Closed Security Posture:** If cryptographic secrets, database RPC functions, or data stores are unconfigured or fail in production, requests are strictly rejected with HTTP 503 and zero silent bypass.
4. **Deterministic Client State Machine:** All authentication surfaces consume a unified React hook (`useOtpFlow`) enforcing mutually exclusive states, inline validation, and duplicate submission prevention.
5. **Anti-Role Escalation:** User roles (`worker`, `contractor`, `institution`, `customer`) are authoritatively stored in PostgreSQL and cannot be modified or escalated through client-side request tampering.

---

## 2. Authoritative Client State Machine

All client surfaces (`/login`, `/auth/register`, and `/onboarding`) consume `useOtpFlow.ts`, which implements a strictly deterministic finite state machine.

```
                      ┌───────────────┐
                      │     IDLE      │
                      └───────┬───────┘
                              │ Valid Phone Input &
                              │ Action Triggered
                              ▼
                      ┌───────────────┐
            ┌─────────┤  REQUESTING   ├─────────┐
            │         └───────┬───────┘         │
            │ Rate Limit (429)│                 │ Error (400, 404, 409, 503)
            │ or Success (200)│                 │
            ▼                 ▼                 ▼
   ┌────────────────┐ ┌───────────────┐ ┌────────────────┐
   │  RATE_LIMITED  │ │   CODE_SENT   │ │ FAILURE STATE  │
   └────────┬───────┘ └───────┬───────┘ └────────────────┘
            │                 │ User Submits 6-Digit PIN
            │ Countdown       ▼
            │ Expires ┌───────────────┐
            └────────►│   VERIFYING   │
                      └───────┬───────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
           ┌────────────────┐  ┌────────────────┐
           │    VERIFIED    │  │  VERIFICATION  │
           │  (Authenticated│  │    FAILURE     │
           │    Session)    │  │ (Invalid/Lock) │
           └────────────────┘  └────────────────┘
```

### Complete Failure State Taxonomy
The state machine handles 10 typed failure states:
1. `invalid_phone`: Phone number fails length, regex, or Indian prefix validation.
2. `rate_limited`: 60-second cooldown active or hourly quota exceeded (HTTP 429).
3. `expired`: OTP challenge exceeded its 5-minute time-to-live (HTTP 400).
4. `invalid_code`: Submitted PIN does not match the cryptographic hash (HTTP 400).
5. `attempts_exceeded`: 5 consecutive failed verification attempts triggered a 15-minute lockout (HTTP 429).
6. `configuration_failed`: Server cryptographic secret missing or malformed (HTTP 503).
7. `database_unavailable`: PostgreSQL rate limit or OTP challenge store unreachable (HTTP 503).
8. `account_not_found`: Login attempted on an unregistered phone number (HTTP 404).
9. `account_creation_failed`: Database error during account persistence (HTTP 500).
10. `network_error`: Client-side fetch failed due to connectivity loss.

---

## 3. End-to-End Authentication Flows

### Flow A: New Worker Registration (`/auth/register`)
1. User provides full name, accepts Terms of Service, and enters a valid Indian mobile number.
2. Client schema (`registrationInputSchema`) validates inputs before dispatch.
3. `useOtpFlow` issues `POST /api/auth/otp/send` with `{ phone, fullName, role, intent: "registration" }`.
4. Rate limiter validates send frequency.
5. Server queries `public.profiles`. If account exists, returns HTTP 409 `ACCOUNT_ALREADY_EXISTS`.
6. Server creates a persistent cryptographic challenge in `public.otp_challenges` (TTL: 300s).
7. Under `AUTH_VERIFICATION_MODE=sandbox`, server returns `sandboxCode` in response body.
8. User inputs 6-digit PIN.
9. `useOtpFlow` issues `POST /api/auth/otp/verify`.
10. Stored procedure `public.verify_and_consume_otp` atomically marks challenge consumed.
11. Server creates new profile in `public.profiles` with `phone_verification_status = 'sandbox_unverified'`.
12. Server mints an HMAC-SHA256 signed session token and sets `kaamsetu_session` cookie (`httpOnly`, `sameSite: "lax"`, `path: "/"`).
13. Client redirects to role-appropriate dashboard (`/dashboard` or `/contractor/dashboard`).

### Flow B: Existing User Login (`/login`)
1. User enters mobile number.
2. `useOtpFlow` issues `POST /api/auth/otp/send` with `{ phone, intent: "login" }`.
3. Server queries `public.profiles`. If missing, returns HTTP 404 `ACCOUNT_NOT_FOUND`.
4. Server generates OTP challenge and returns status.
5. User enters PIN and submits.
6. Server verifies code.
7. **Anti-Role Escalation:** Server resolves role from database record (`existingProfile.role`), ignoring any client-provided role parameters.
8. Server sets session cookie and redirects.

### Flow C: Artisan Onboarding Modal (`/onboarding`)
1. Artisan completes skill profile (trade, experience, daily wage, tools, micro-credentials).
2. Draft is continuously persisted in browser session storage (`kaamsetu_onboarding_draft`).
3. Artisan clicks "Sign & Mint Sovereign Credential".
4. Inline modal opens, prompting for phone verification.
5. Modal uses `useOtpFlow` with `intent: "registration"`.
6. Upon OTP verification, session is minted.
7. Modal calls `OnboardingService.saveProfile()` using `createAdminClient()` to persist profile and mint cryptographic credential.
8. Onboarding completes with confetti and permanent registry link.

---

## 4. API Endpoint Contracts

### `POST /api/auth/otp/send`
- **Request Body:**
  ```json
  {
    "phone": "9876543210",
    "fullName": "Biren Das",
    "role": "worker",
    "intent": "registration"
  }
  ```
- **Success Response (HTTP 200 - Sandbox Mode):**
  ```json
  {
    "success": true,
    "challengeCreated": true,
    "hasActiveChallenge": true,
    "message": "Sandbox verification code for +91 98****3210 generated. No SMS will be sent.",
    "isSandbox": true,
    "sandboxCode": "482915",
    "retryAfterSeconds": 60,
    "nextAllowedAt": "2026-11-17T17:15:00.000Z"
  }
  ```
- **Error Response (HTTP 404 - Login Account Missing):**
  ```json
  {
    "success": false,
    "code": "ACCOUNT_NOT_FOUND",
    "message": "No account found with this mobile number. Please register first."
  }
  ```
- **Error Response (HTTP 409 - Registration Conflict):**
  ```json
  {
    "success": false,
    "code": "ACCOUNT_ALREADY_EXISTS",
    "message": "An account already exists with this mobile number. Please sign in instead."
  }
  ```
- **Error Response (HTTP 503 - Infrastructure Error):**
  ```json
  {
    "success": false,
    "code": "DATABASE_UNAVAILABLE",
    "isInfrastructureError": true,
    "message": "Authentication service is unavailable. Please retry shortly."
  }
  ```

### `POST /api/auth/otp/verify`
- **Request Body:**
  ```json
  {
    "phone": "9876543210",
    "otp": "482915",
    "fullName": "Biren Das",
    "role": "worker",
    "intent": "registration"
  }
  ```
- **Success Response (HTTP 200):**
  ```json
  {
    "success": true,
    "message": "Mobile number verified successfully.",
    "user": {
      "id": "e4a2c1f9-58b3-4f01-9234-7a1b0c2e4f8a",
      "phone": "+919876543210",
      "fullName": "Biren Das",
      "role": "worker",
      "isDemo": false,
      "accountStatus": "active",
      "phoneVerificationStatus": "sandbox_unverified",
      "verificationMethod": "sandbox",
      "phoneVerified": false
    },
    "sessionToken": "<HMAC-SHA256 Token>",
    "redirectUrl": "/dashboard"
  }
  ```
