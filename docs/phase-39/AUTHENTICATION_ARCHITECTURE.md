# KAAMSETU — PHASE 39 AUTHENTICATION ARCHITECTURE SPECIFICATION

**Program:** KAAMSETU Digital Identity & Worker Empowerment Platform  
**Target:** `Mayyank04/kaamsetu`  
**Classification:** `CLASS_B_CONTROLLED_ROLLOUT` (Guwahati Urban & Shillong Urban)  
**Security Standard:** Enterprise Fail-Closed Cryptographic Session Management  

---

## 1. Executive Overview

Phase 39 completely overhauls the authentication architecture of KAAMSETU, decommissioning hackathon-era mock personas and ephemeral demo bypasses in favor of a dual-engine production session management system that operates seamlessly across both local development, managed sandbox environments, and production Supabase deployments.

```
+-----------------------------------------------------------------------------------+
|                              Client Web Browser                                   |
+-----------------------------------------------------------------------------------+
           |                                                       ^
     (1) Submit Phone                                        (6) Set Secure Cookie
     & Role / Intent                                       (`kaamsetu_session`)
           v                                                       |
+-----------------------------------------------------------------------------------+
|                        Next.js API Route Handlers                                 |
|   /api/auth/otp/send                           /api/auth/otp/verify               |
+-----------------------------------------------------------------------------------+
           |                                                       ^
     (2) Generate Challenge                                  (5) Sign Session Token
     (Crypto random 6-digit)                                 (HMAC-SHA256 payload)
           v                                                       |
+-----------------------------------------------------------------------------------+
|                      OTP Service Layer (`otp-service.ts`)                         |
|   - Fail-closed secret extraction via `RATE_LIMIT_HMAC_SECRET`                    |
|   - Mode dispatch: `AUTH_VERIFICATION_MODE=sandbox` vs `sms`                     |
|   - Rate Limiting: 3 sends / 15m; 5 attempts max per challenge                   |
+-----------------------------------------------------------------------------------+
      |                       |                                    |
      | (Sandbox Mode)        | (SMS Mode)                         |
      v                       v                                    v
+------------------+   +--------------------+             +------------------+
| Transparent UI   |   | External Telecom   |             | PostgreSQL DB    |
| Code Disclosure  |   | Gateway (Twilio/   |             | - otp_challenges |
| in API response  |   | MSG91 / DLT)       |             | - profiles       |
+------------------+   +--------------------+             +------------------+
```

---

## 2. Session Model & Token Specifications

KAAMSETU implements a tamper-proof, cryptographically signed bearer session cookie (`kaamsetu_session`) that provides robust state verification independent of external network outages.

### 2.1 Cookie Attributes
Every authentication session cookie emitted by the server enforces strict modern web security attributes:

| Attribute | Value | Operational Purpose |
| :--- | :--- | :--- |
| **Name** | `kaamsetu_session` | Unique session identifier for the platform. |
| **HttpOnly** | `true` | Prevents access via client-side JavaScript (`document.cookie`), mitigating XSS session hijacking. |
| **Secure** | `process.env.NODE_ENV === "production"` | Enforces transmission exclusively over HTTPS in staging and production environments. |
| **SameSite** | `Lax` | Provides standard CSRF protection for top-level navigations while permitting seamless user entry. |
| **Path** | `/` | Valid across all application routes and protected zones. |
| **Max-Age** | `604800` (7 Days) | Standard rolling session lifetime. |

### 2.2 Token Payload & Cryptographic Signing
The session token is composed of an unpadded Base64URL-encoded JSON payload and a 256-bit HMAC-SHA256 cryptographic signature separated by a period (`.`):

$$\text{SessionToken} = \text{base64url}(\text{Payload}) \mathbin{\Vert} \text{"."} \mathbin{\Vert} \text{HMAC-SHA256}(\text{base64url}(\text{Payload}), K_{\text{HMAC}})$$

#### Token Payload Structure:
```typescript
interface SessionPayload {
  userId: string;          // Persistent UUID or normalized phone hash
  phone: string;           // E.164 normalized mobile number (+91XXXXXXXXXX)
  role: AppRole;           // "worker" | "contractor" | "institution" | "customer" | "admin"
  exp: number;             // Unix timestamp in milliseconds when token expires
  iat: number;             // Unix timestamp in milliseconds when token was issued
  isSandbox?: boolean;     // Explicit flag identifying sandbox-authenticated sessions
}
```

#### Verification Invariant:
Verification is performed in constant time using `crypto.timingSafeEqual` over raw binary digests:
```typescript
const computedSig = crypto
  .createHmac("sha256", secret)
  .update(dataPart)
  .digest();

if (!crypto.timingSafeEqual(computedSig, Buffer.from(signaturePart, "hex"))) {
  throw new SecurityError("Invalid session signature");
}
```

---

## 3. Role Authorization Matrix

KAAMSETU enforces strict role-based access control across routes in `src/lib/supabase/middleware.ts` and server-side route handlers:

| Role | Permitted Route Prefixes | Prohibited Route Prefixes | Default Post-Auth Landing |
| :--- | :--- | :--- | :--- |
| **`worker`** | `/dashboard`, `/worker/*`, `/onboarding` | `/admin/*`, `/contractor/*`, `/institution/*` | `/dashboard` or `/onboarding` |
| **`contractor`** | `/contractor/*`, `/dashboard` | `/admin/*`, `/institution/*` | `/contractor/dashboard` |
| **`institution`** | `/institution/*`, `/dashboard` | `/admin/*`, `/contractor/*` | `/institution/dashboard` |
| **`customer`** | `/customer/*`, `/dashboard`, `/search` | `/admin/*`, `/institution/*` | `/customer/dashboard` |
| **`admin`** | `/*` (Full platform administrative access) | None | `/admin/audit` |

If an authenticated user attempts to access an unauthorized route (e.g., a `worker` navigating to `/admin/audit`), the middleware immediately redirects to their designated role dashboard with HTTP 307.

---

## 4. Decommissioning of Hackathon Bypass Artifacts

All hackathon demo bypass paths have been permanently eradicated:
1. **`kaamsetu_demo_persona` Cookie:** Stripped from `src/lib/supabase/middleware.ts` and `src/lib/auth/server.ts`. Any existing client cookie is ignored and overwritten.
2. **`switchPersona` Method:** Removed from `useAuth` hook in `src/lib/auth/use-auth.tsx`.
3. **`/api/auth/persona` Endpoint:** Permanently decommissioned with HTTP 410 Gone.
4. **Header Persona Switcher:** Cleaned from `src/components/layout/institutional-header.tsx`.

---

## 5. Dual Supabase & Managed Session Resolution

When resolving the active user in `getCurrentUser()` (`src/lib/auth/server.ts`):
1. **Primary Check:** Attempts `supabase.auth.getUser()`. If a valid Supabase Auth session exists, it queries the `profiles` table to resolve the verified role and details.
2. **Secondary Check:** If Supabase Auth returns null, it inspects the `kaamsetu_session` cookie. If the cryptographic signature verifies against `RATE_LIMIT_HMAC_SECRET` and `Date.now() < payload.exp`, the user is authenticated with their verified role and metadata.
3. **Fail-Closed Fallback:** If neither session is present or valid, returns `null`. No fallback to default demo accounts is ever permitted in production.
