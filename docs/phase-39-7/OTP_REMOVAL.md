# KAAMSETU — PHASE 39.7: COMPLETE OTP REMOVAL DIRECTIVE

**Document ID:** `KAAMSETU-39-7-OTP-REMOVAL`  
**Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**Operating Center:** Guwahati Urban & Shillong Urban  
**Permanent Financial Invariant:** `platform_commission_amount = 0.00` on artisan wages  
**Status:** `VERIFIED LOCALLY`  

---

## 1. Executive Product Decision & Problem Statement

In previous phases, worker registration and onboarding were tightly coupled to mandatory phone OTP verification. Under production deployment on Vercel (`https://kaamsetu-neon.vercel.app`), repeated requests to `POST /api/auth/otp/send` failed with HTTP 503:

> "Authentication rate limiter temporarily unavailable. Your profile draft has been saved. Please retry in a moment."

This failure occurred because the server-side rate-limiter required remote database stored procedures (`check_and_increment_rate_limit`) that had not yet been executed in the remote Supabase project `anwppwjlismjyovbyfmb`. Because production code correctly enforces a fail-closed posture rather than falling back to an in-memory store, artisans were trapped in a deadlock: no OTP was sent, no account could be created, and profiles could not be published.

**Strategic Product Decision:**  
KAAMSETU has permanently removed mandatory phone OTP verification from the core account registration and worker onboarding lifecycle. The registration flow is restored as a direct, friction-free experience:

$$\text{Registration Page} \longrightarrow \text{Account Creation} \longrightarrow \text{Supabase Persistence} \longrightarrow \text{Session Issuance} \longrightarrow \text{Artisan Onboarding} \longrightarrow \text{Profile Persistence} \longrightarrow \text{Dashboard}$$

---

## 2. Inventory of Removed & Decoupled OTP Dependencies

| Component / Layer | Previous Behavior | Phase 39.7 Decoupled Architecture | Status |
|---|---|---|---|
| **Registration Page (`/signup`, `/auth/register`)** | Required 10-digit phone, invoked `useOtpFlow`, demanded simulated SMS code. | Replaced with direct registration form: Full Name, Email, Password, Confirm Password, optional contact Phone, Terms & Privacy consent. | `VERIFIED LOCALLY` |
| **Login Page (`/login`, `/auth/login`)** | Required mobile number + OTP verification roundtrip. | Replaced with direct password authentication: Email or Mobile + Password. | `VERIFIED LOCALLY` |
| **Worker Onboarding (`/onboarding`)** | Intercepted Step 3 with "Verify Mobile Number" modal blocking profile save. | Removed the OTP modal completely. Authenticated users save in one click; unauthenticated visitors are presented with a direct password account creation dialog. | `VERIFIED LOCALLY` |
| **Profile Save API (`/api/worker/onboarding/save`)** | Refused unverified phone sessions. | Validates authoritative session cookie (`kaamsetu_session`); persists profiles regardless of phone verification state. | `VERIFIED LOCALLY` |
| **Mobile Number Status** | Mandatory identity prerequisite. | Optional unverified contact detail (`phone_verified = false`, `phone_verification_status = 'not_verified'`). | `VERIFIED LOCALLY` |
| **OTP Services (`otp-service.ts`)** | Executed inline during normal registration. | Preserved as isolated background utility for optional future telecom features; decoupled from normal onboarding. | `VERIFIED LOCALLY` |

---

## 3. Preserved Security & Invariant Guarantees

1. **No Client-Controlled Privilege Escalation:**
   Users registering directly cannot assign themselves administrative, contractor, institutional, or verified-worker privileges.
2. **Brute Force Protection:**
   Direct registration and login endpoints are guarded by sliding-window rate limiters that fail gracefully without crashing when database RPCs are absent.
3. **Password Security:**
   Passwords are never stored in plaintext. Hashing is performed using OWASP-compliant `scrypt` with a cryptographically secure 16-byte random salt per user.
4. **Permanent Financial Invariant:**
   $\text{platform\_commission\_amount} = 0.00$ on artisan wages across all tables, invoices, and job completions.
5. **Geographic Boundaries:**
   Controlled rollout strictly bounded to Guwahati Urban (`781001–781039`) and Shillong Urban (`793001–793022`).
