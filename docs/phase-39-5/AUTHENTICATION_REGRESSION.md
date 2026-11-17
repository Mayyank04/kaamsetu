# KAAMSETU — PHASE 39.5 AUTHENTICATION REGRESSION REPORT

**Target Routes:** `/login`, `/auth/register`, `/onboarding`  
**Harness:** `test/phase-39-4-complete-lifecycle.test.ts` & `test/phase-39-3-auth-restoration.test.ts`  
**Status:** VERIFIED LOCALLY

---

## 1. Authentication Lifecycle State Machine

The complete authentication lifecycle was verified through end-to-end automated testing:

1. **Guest Registration:**
   - Role selection: Worker / Artisan, Contractor / Enterprise, Customer.
   - Input validation: Strict Indian mobile number validation (`/^[6-9]\d{9}$/`). Rejects prefixes `0–5`.
   - Mandatory affirmative consent: Unchecked-by-default checkbox required before OTP dispatch.
2. **Challenge Dispatch:**
   - Evaluates rate limits (`validateOtpSendRateLimit`).
   - Generates random 6-digit PIN in sandbox mode (zero telecom SMS dispatch).
   - Fails closed in production with HTTP 503 if Supabase or HMAC secret is unconfigured.
3. **Verification & Account Creation:**
   - Verifies OTP challenge atomically (`verify_and_consume_otp` or memory store).
   - Rejects expired challenges, invalid PINs, and single-use replay attempts.
   - Locks out phone after 5 consecutive failures.
   - Populates `public.profiles` and `public.user_consents` with version `2026.1`.
4. **Session Establishment:**
   - Issues HMAC-SHA256 session token signed with `RATE_LIMIT_HMAC_SECRET`.
   - Supports zero-downtime key rotation via `RATE_LIMIT_HMAC_SECRET_PREVIOUS`.
   - Sets HTTP-only, SameSite=Lax cookie `kaamsetu_session`.
5. **Logout:**
   - Route `/api/auth/logout` clears `kaamsetu_session` cookie across path `'/'` with `maxAge: 0`.
6. **Sign Back In:**
   - Existing account resolved from database; client-supplied role tampering rejected.
