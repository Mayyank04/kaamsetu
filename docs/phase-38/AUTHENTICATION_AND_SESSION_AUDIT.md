# KAAMSETU — PHASE 38 AUTHENTICATION & SESSION AUDIT

**Programme:** KAAMSETU Digital Identity & Worker Empowerment Platform  
**Assessment Phase:** 38 — Security Audit & Vulnerability Remediation  
**Status:** Certified & Hardened

---

## 1. Authentication Architecture Overview

KAAMSETU utilizes a hybrid vernacular authentication model designed specifically for skilled informal artisans:

1. **Primary Worker & Customer Authentication:** Passwordless cryptographic SMS OTP verification with 14-day `HttpOnly; Secure; SameSite=Lax` session cookies.
2. **Enterprise & Contractor Authentication:** Supabase Auth with server-validated session cookies and RBAC guards.
3. **Session Persistence:** Exclusively server-managed cookies. Zero access tokens or session secrets are stored in `localStorage` or `sessionStorage`.

---

## 2. Session Cookie Specification

| Cookie Attribute | Production Value | Security Justification |
| :--- | :--- | :--- |
| **Name** | `kaamsetu_session` | Primary authenticated application session token |
| **HttpOnly** | `true` | Prevents JavaScript access, mitigating Cross-Site Scripting (XSS) token theft |
| **Secure** | `true` (in production) | Enforces HTTPS-only transmission, preventing man-in-the-middle packet sniffing |
| **SameSite** | `Lax` | Provides defense-in-depth against Cross-Site Request Forgery (CSRF) on cross-site requests |
| **Path** | `/` | Uniformly accessible across all authenticated application routes |
| **Max-Age** | `1,209,600` seconds (14 days) | Balances mobile worker usability with session lifecycle expiration |

---

## 3. Cryptographic OTP Verification Lifecycle

```mermaid
sequenceDiagram
    actor Worker as Artisan Mobile
    participant Route as /api/auth/otp/send
    participant Limiter as Rate Limiter (HMAC Keyed)
    participant DB as PostgreSQL (otp_challenges)
    participant Provider as SMS Gateway / Sandbox

    Worker->>Route: POST { phone: "+91 98765 43210" }
    Route->>Limiter: validateOtpSendRateLimit(phone, ip)
    alt Rate Limit Exceeded
        Limiter-->>Worker: HTTP 429 Too Many Requests
    else Allowed
        Route->>DB: INSERT into otp_challenges (hashed OTP, expires_at: 10m)
        Route->>Provider: Dispatch 6-digit OTP
        Route-->>Worker: HTTP 200 OK (OTP Sent)
    end

    Worker->>Route: POST /api/auth/otp/verify { phone, otp }
    Route->>DB: RPC verify_and_consume_otp(phone, otp)
    alt Invalid OTP (< 5 attempts)
        DB-->>Worker: HTTP 400 Invalid OTP (attempts incremented)
    alt Lockout (>= 5 failed attempts)
        DB-->>Worker: HTTP 429 Brute-Force Lockout (15 min cooldown)
    else Success
        DB->>DB: Mark challenge as consumed (atomic)
        Route-->>Worker: Set-Cookie: kaamsetu_session (HttpOnly; Secure; SameSite=Lax)
    end
```

---

## 4. Multi-Factor Authentication (MFA) & Privileged Roles

- **Artisans & Customers:** One-Time Password (OTP) verification serves as the primary authentication factor tied to verified Indian mobile numbers (`+91`).
- **Contractors & Enterprise Accounts:** Authenticated via verified credentials with re-authentication required for high-risk operations (e.g. payout disbursement).
- **Administrators & Governance Auditors:** Require server-side role assertion (`requireAdmin()`, `requireModerator()`). Dedicated multi-factor elevation and strict tenant boundary validation are enforced at API controllers.
