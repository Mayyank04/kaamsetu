# KAAMSETU — PHASE 53.1: PRODUCTION READINESS & TESTING GOVERNANCE

**Operating Classification:** `CLASS_B_CONTROLLED_ROLLOUT` (Guwahati Urban & Shillong Urban)  
**Permanent Economic Invariant:** `platform_commission_amount = 0.00` on artisan wages  
**Date:** 2026-11-27  
**Module:** Environment Audit, Sandbox Mode Safety & Production Deployment Gate  
**Target Branch:** `phase-53.1-signup-ui-and-sandbox-otp`  

---

## 1. Production Readiness Verdict

**STATUS:** **`TESTING MODE ACTIVE (SANDBOX OTP) — PRODUCTION GATE SECURED`**

The signup user interface, in-place phone verification workflow, sandbox OTP engine, optional email field, database uniqueness constraints, and automated test suites are **100% complete and verified**.

### Current Operating Mode:
- `PHONE_OTP_MODE=sandbox` is configured for local and preview testing.
- The registration UI clearly discloses: `Sandbox verification — testing mode`.
- Accounts created in this mode are tagged with `phone_verification_status = "sandbox_verified"`, `verification_method = "sandbox"`, and `phone_verified = false`.
- The platform honestly reports that physical carrier SMS delivery is simulated and does not misrepresent sandbox verification as verified carrier phone ownership.

---

## 2. Environment Configuration Matrix

| Variable Name | Current Value / Scope | Production Role | Behavior |
| :--- | :--- | :--- | :--- |
| `PHONE_OTP_MODE` | `sandbox` (Local / Preview) | Controls OTP mode | When `sandbox`, accepts `123456` and displays testing OTP banner |
| `SANDBOX_OTP_CODE` | `123456` | Fixed test code | Only accepted by server-side verification |
| `AUTH_VERIFICATION_MODE` | `sandbox` | Secondary mode flag | Aligned with `PHONE_OTP_MODE` |
| `RATE_LIMIT_HMAC_SECRET` | 256-bit entropy key | Signs proof tokens | Validates `verificationProof` and session signatures |
| `TWILIO_ACCOUNT_SID` | *Unset* | Live carrier gateway | Not required while in sandbox testing mode |
| `TWILIO_AUTH_TOKEN` | *Unset* | Live carrier gateway | Not required while in sandbox testing mode |
| `TWILIO_PHONE_NUMBER` | *Unset* | Live carrier gateway | Not required while in sandbox testing mode |

---

## 3. Production Hardening Invariants

When transitioning to real carrier SMS delivery in production:
1. Set `PHONE_OTP_MODE=sms` and supply Twilio credentials in Vercel environment variables.
2. In production without `ALLOW_INSECURE_SANDBOX_IN_PRODUCTION=true`, any attempt to request sandbox codes will fail closed with HTTP 503 `SMS_GATEWAY_UNAVAILABLE`.
3. The codebase contains zero hardcoded fallback secrets.

---

## 4. Acceptance Verification Checklist

- [x] Existing signup UI preserved with Deep Forest Green, Warm Ivory, Warm Sand tokens.
- [x] Mandatory mobile number with country code picker (`+91` default).
- [x] Visible `Verify phone number` button adjacent to phone field.
- [x] In-place expandable OTP verification section.
- [x] Prominent `Sandbox verification — testing mode` disclosure banner.
- [x] `Testing OTP: 123456` callout with one-click `Copy OTP` button.
- [x] Copy OTP button copies to clipboard, shows `Copied!`, and pre-fills input.
- [x] 6-digit numeric OTP input with paste support and auto-focus.
- [x] `Verify OTP`, `Resend code` (with cooldown timer), and `Change phone number` actions.
- [x] Verified state banner: `✓ Phone verified in sandbox mode`.
- [x] Phone input locked upon verification with lock icon.
- [x] Optional email field visibly present with exact requested label and helper copy.
- [x] Signup succeeds with or without email.
- [x] Unverified email saved with `email_verified: false` (never falsely marked verified).
- [x] Primary `Create Account` button disabled until phone verified; enabled upon verification.
- [x] One phone number = one account enforced across all 5 roles.
- [x] Real browser verification executed via Chrome CDP (all 7 screenshots captured).
- [x] Automated test suites pass: `test:phase53` (14/14), `test:phase49:auth` (18/18), `test:phase52` (9/9).
- [x] TypeScript compiles with 0 errors (`npx tsc --noEmit`).
- [x] Linter passes with 0 errors (`npm run lint`).
- [x] Production build compiles with 0 errors (`125/125` routes).
- [x] All 5 required reports created and committed.
