# KAAMSETU — PHASE 39.7: AUTHENTICATION & DEFENSE-IN-DEPTH SECURITY

**Document ID:** `KAAMSETU-39-7-AUTH-SECURITY`  
**Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**Status:** `VERIFIED LOCALLY`  
**Permanent Financial Invariant:** `platform_commission_amount = 0.00` on artisan wages  

---

## 1. Cryptographic Security Standards

Removing mandatory phone verification does not diminish KAAMSETU's security posture. Instead, it eliminates fragile third-party telecom failure points while establishing robust, institutional-grade application security.

### 1.1 Password Hashing Architecture (NIST SP 800-63B & OWASP Compliant)
Passwords are never stored, logged, or serialized in plaintext:
- **Algorithm:** Node.js native `crypto.scryptSync`.
- **CPU/Memory Cost:** $N = 16384$ ($2^{14}$ iterations), block size $r = 8$, parallelization $p = 1$.
- **Max Memory Allocation:** $32\text{ MB}$.
- **Salt Generation:** $16\text{ bytes}$ ($128\text{ bits}$) of cryptographically secure pseudorandom data via `crypto.randomBytes()`.
- **Derived Key Length:** $64\text{ bytes}$ ($512\text{ bits}$).
- **Verification:** Constant-time buffer equality check via `crypto.timingSafeEqual()` eliminates timing side-channel vulnerabilities.

### 1.2 Session Token Security
- **Format:** Dual-part Base64URL string (`<claims_payload>.<hmac_signature>`).
- **Signature Algorithm:** HMAC-SHA256.
- **Key Material:** Derived from `RATE_LIMIT_HMAC_SECRET` ($\ge 256$ bits of entropy).
- **Transport Security:** Delivered exclusively via HTTP response headers:
  ```
  Set-Cookie: kaamsetu_session=...; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=1209600
  ```
- **XSS Protection:** `HttpOnly` directive guarantees that client-side JavaScript (`document.cookie`) has zero read/write access.
- **CSRF Protection:** `SameSite=Lax` ensures cookies are not sent on cross-site state-changing POST requests.
- **Expiration:** Hard bounding at 14 days ($1,209,600\text{ seconds}$).

---

## 2. Rate Limiting & Abuse Prevention

| Layer | Protected Action | Max Threshold | Window Duration | Penalty Upon Exhaustion |
|---|---|---|---|---|
| **Login Limiter** | Password attempts | 5 failed attempts | 15 minutes | 15-minute complete IP/identifier lockout. |
| **Registration Limiter** | Account creations | 10 registrations | 1 hour | 1-hour IP block returning HTTP 429. |
| **Fail-Safe Design** | Serverless availability | Sliding window memory | Self-cleaning | Never crashes with 503 if remote RPC is unmigrated. |

---

## 3. Privilege Escalation Prevention & Tenant Isolation

1. **Role Whitelisting:**
   The registration API strictly validates requested roles against `["worker", "contractor", "customer", "institution"]`. Attempting to register with `admin` or unearned verification flags is immediately rejected with HTTP 403 `UNAUTHORIZED_ROLE`.
2. **Tenant Isolation:**
   Every profile read and write checks the authenticated `user.id` against the target profile record. Artisans cannot view or mutate another worker's draft or unpublished data.
3. **Truthful Verification State:**
   Directly registered accounts are saved with `phone_verified = false`, `phone_verification_status = 'not_verified'`, and `verification_method = 'none'`. Privileged capabilities requiring formal identity attestation (such as high-value escrow settlement) remain gated until verified.
