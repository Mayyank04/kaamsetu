# AUTHENTICATION & ACCOUNT LIFECYCLE ARCHITECTURE

**Document ID:** `KAAMSETU-DOC-39-6-03`  
**Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**Status:** `VERIFIED LOCALLY`

---

## 1. Multi-Role Authentication Topology

KAAMSETU enforces strict role partitioning to prevent unauthorized role escalation and cross-domain data leakage.

```
       +------------------------------------+
       |  Phone + Indian Mobile (+91)      |
       +-----------------+------------------+
                         |
           [ Terms & Consent Validated ]
                         |
           +-------------v-------------+
           | /api/auth/otp/send        |
           | Mode: Sandbox (Zero SMS)  |
           +-------------+-------------+
                         |
           +-------------v-------------+
           | /api/auth/otp/verify      |
           | Single-Use HMAC Challenge |
           +-------------+-------------+
                         |
       +-----------------+-----------------+
       |                                   |
[ Worker / Artisan ]             [ Contractor / Client ]
Destination: /onboarding         Destination: /contractor/dashboard
Session: role=worker             Session: role=contractor
```

---

## 2. Invariants & Lifecycle Defenses

1. **Anti-Role Escalation:** During login, any client-submitted `role` parameter is overridden by the authoritative role stored in the database. A worker cannot escalate to contractor or admin privileges via form spoofing.
2. **Sandbox Mode Isolation:** In development and sandbox test environments (`AUTH_VERIFICATION_MODE=sandbox`), no external telecom requests are dispatched. Sandbox codes are generated non-deterministically and displayed transparently in the helper banner. Universal backdoor codes (such as `'123456'`) are rejected.
3. **Cryptographic Anti-Replay:** Once an OTP challenge is consumed, its state is marked `consumed` in the database RPC `verify_and_consume_otp`. Any secondary submission is immediately rejected with `OTP_ALREADY_USED`.
4. **Brute-Force Lockout:** After 5 consecutive invalid code submissions for a target mobile number, the phone is placed in a security cooldown lockout.
5. **Tamper-Evident Session Tokens:** Tokens are signed using HMAC-SHA256 with key rotation support (`RATE_LIMIT_HMAC_SECRET`). Tampering with claims or signatures results in immediate session invalidation (`401 Unauthorized`).
6. **Clean Cookie Revocation:** The `/api/auth/logout` endpoint issues an immediate cookie clear across path `/` with `maxAge: 0` and `expires: new Date(0)`.
