# KAAMSETU — PHASE 39.6 ACCOUNT & SESSION LIFECYCLE

**Document ID:** `KAAMSETU-39-6-ACCOUNT-LIFECYCLE`  
**Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**Status:** `VERIFIED_LOCALLY`

---

## 1. End-to-End Authentication State Flow

```
[Onboarding Voice Step]
       │
       ▼
[ExtractionEditor Drafting (Step 3)] ───► PIN Code Incomplete (Guides user, suppresses error)
       │
       ▼ (PIN = 6 digits entered)
[Live Geographic Validation] ───────────► Guwahati/Shillong Authorized (Green banner)
       │
       ▼ (Submit "Approve & Create Identity")
[OTP Verification Modal] ───────────────► Consent Checkbox Required
       │
       ▼ (Send OTP)
[Rate Limiter Check] ───────────────────► Fail closed if DB down (503) / Allowed (200)
       │
       ▼
[Sandbox OTP Provided] ─────────────────► Single-use code entered
       │
       ▼ (Verify OTP)
[Database Account Provisioning] ────────► RPC register_user_account (Idempotent)
       │
       ▼
[Session Cookie Minted] ────────────────► HttpOnly, Secure, SameSite=Lax (14-day expiry)
       │
       ▼
[Profile Persistence to Supabase] ──────► worker_profiles & profiles updated
```

---

## 2. Session Security Controls

- **Cookie Name:** `kaamsetu_session`
- **Security Flags:** `HttpOnly`, `SameSite=Lax`, `Secure` (in production).
- **Signing Mechanism:** HMAC-SHA256 signature using `RATE_LIMIT_HMAC_SECRET`.
- **Key Rotation:** Supports dual-verification with `RATE_LIMIT_HMAC_SECRET_PREVIOUS` for zero-downtime key rotation.
- **Anti-Role Escalation:** Session token binds `role` cryptographically. Client-side tampering of the payload invalidates the signature and rejects the session.
- **Logout:** Invalidation clears the cookie with `maxAge: 0` and `path: "/"`.
