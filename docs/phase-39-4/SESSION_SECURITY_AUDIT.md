# KAAMSETU — PHASE 39.4 SESSION SECURITY AUDIT
## HMAC-SHA256 Token Lifecycle, Zero-Downtime Key Rotation & Edge Runtime Audit

**Repository:** `Mayyank04/kaamsetu`  
**Target Branch:** `phase-39-4-complete-auth-and-production-recovery`  
**Operating Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**Permanent Financial Invariant:** `platform_commission_amount = 0.00`  
**Audit Status:** `VERIFIED WORKING`

---

## 1. Session Architecture & Threat Model

KAAMSETU issues multi-instance sovereign session tokens authenticated via HMAC-SHA256 signatures.

### Security Invariants:
1. **Stateless Multi-Instance Compatibility:** Session tokens are self-contained and signed. Any serverless Next.js instance can authenticate a request without a database lookup on every static or cached resource.
2. **Cryptographic Key Material Quality:** HMAC secrets must possess at least 256 bits of entropy (32+ alphanumeric characters). Trivial or predictable secrets (e.g. `123456`, `secret`, `password`) are rejected at startup.
3. **Dual-Key Zero-Downtime Rotation:** The system accepts `RATE_LIMIT_HMAC_SECRET_PREVIOUS` to enable zero-downtime key rotation without invalidating active sessions.
4. **Edge Runtime Compatibility:** Session signature verification in Next.js middleware is implemented strictly using standard Web APIs (`crypto.subtle`), avoiding Node.js standard library dependencies.

---

## 2. Token Format & Claims Structure

Tokens are composed of two base64url-encoded parts separated by a period:
```
<EncodedClaims>.<HmacSignature>
```

### Claims Payload Schema:
```json
{
  "userId": "e4a2c1f9-58b3-4f01-9234-7a1b0c2e4f8a",
  "phone": "+919876543210",
  "role": "worker",
  "verificationMethod": "sandbox",
  "phoneVerified": false,
  "iat": 1731862800,
  "exp": 1732467600
}
```

- `iat`: Timestamp issued (seconds since Unix epoch).
- `exp`: Timestamp expired (default 7 days / 604,800 seconds).

---

## 3. Web Crypto Edge Middleware Verification

Next.js middleware (`src/lib/supabase/middleware.ts`) verifies session tokens using Web Crypto:

```ts
async function verifyHmacSha256(data: string, signature: string, secret: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const key = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const base64 = signature.replace(/-/g, "+").replace(/_/g, "/");
    const pad = base64.length % 4;
    const padded = pad ? base64 + "=".repeat(4 - pad) : base64;
    const binary = atob(padded);
    const sigBytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      sigBytes[i] = binary.charCodeAt(i);
    }

    const dataBytes = encoder.encode(data);
    return await crypto.subtle.verify("HMAC", key, sigBytes, dataBytes);
  } catch {
    return false;
  }
}
```

### Key Advantages:
- `crypto.subtle.verify` executes constant-time byte comparisons natively in the browser/edge engine, preventing timing attacks.
- Operates identically in Node.js 18+, Vercel Edge Runtime, Cloudflare Workers, and modern browsers.
- Zero Node.js `crypto` or `Buffer` dependencies.

---

## 4. Zero-Downtime Key Rotation Lifecycle

When rotating secrets:
1. Deploy new secret as `RATE_LIMIT_HMAC_SECRET` on Vercel.
2. Deploy previous secret as `RATE_LIMIT_HMAC_SECRET_PREVIOUS`.
3. New tokens are signed with `RATE_LIMIT_HMAC_SECRET`.
4. Middleware and backend services first attempt verification against `RATE_LIMIT_HMAC_SECRET`.
5. If primary verification fails, fallback verification is performed against `RATE_LIMIT_HMAC_SECRET_PREVIOUS`.
6. Once all legacy sessions have expired (7 days), `RATE_LIMIT_HMAC_SECRET_PREVIOUS` can be safely removed.

---

## 5. Clean Cookie Revocation (Logout)

`POST /api/auth/otp/logout` ensures complete destruction of the session cookie across all path scopes:

```ts
response.cookies.set("kaamsetu_session", "", {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 0,
  path: "/",
  expires: new Date(0),
});
```

---

## 6. Audit & Verification Results

| Security Control | Implementation | Outcome |
|---|---|---|
| Signature Authenticity | HMAC-SHA256 signature verification | `VERIFIED WORKING` |
| Tamper Resistance | Rejects tokens with altered payloads or signatures | `VERIFIED WORKING` |
| Dual-Key Rotation | Fallback to `RATE_LIMIT_HMAC_SECRET_PREVIOUS` | `VERIFIED WORKING` |
| Edge Compatibility | Pure Web Crypto API (`crypto.subtle`) | `VERIFIED WORKING` |
| Cookie Revocation | Explicit `path: "/"`, `maxAge: 0` cookie deletion | `VERIFIED WORKING` |
