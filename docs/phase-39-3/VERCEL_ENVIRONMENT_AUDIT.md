# KAAMSETU — PHASE 39.3 VERCEL ENVIRONMENT CONFIGURATION & SECURITY AUDIT
## VARIABLE CLASSIFICATION, CRYPTOGRAPHIC ENTROPY & ZERO-LEAKAGE VERIFICATION

**Platform:** Vercel Production (`https://kaamsetu-neon.vercel.app`)  
**Deployment ID:** `bom1::iad1::9cwcp-1794910233046-29dc59d36d40`  
**Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**Audit Date:** 17 November 2026  

---

## 1. Environment Variable Catalog & Classification Matrix

| Variable Name | Sensitivity | Scope | Required / Optional | Required Minimum Format / Entropy | Vercel Cloud Status |
| :--- | :--- | :--- | :---: | :--- | :---: |
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Client + Server | **Required** | Valid HTTPS URL (`https://...supabase.co`) | **CONFIGURED** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public / Low | Client + Server | **Required** | JWT format (`ey...`) | **CONFIGURED** |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secret (Critical)** | Server Only | **Required** | JWT format (`ey...`) | **CONFIGURED** |
| `RATE_LIMIT_HMAC_SECRET` | **Secret (Critical)** | Server Only | **Required** | 256-bit high-entropy secret (>=32 chars, diverse character sets) | **BLOCKED BY VERCEL CONFIGURATION** (Missing or weak) |
| `RATE_LIMIT_HMAC_SECRET_PREVIOUS` | **Secret (Critical)** | Server Only | Optional | 256-bit high-entropy secret (used during zero-downtime key rotation) | Optional |
| `AUTH_VERIFICATION_MODE` | Non-Sensitive | Server Only | **Required** | `"sandbox"` or `"production"` | Set to `"sandbox"` |
| `GEMINI_API_KEY` | **Secret (High)** | Server Only | Optional | Google AI Studio / Vertex API key | **CONFIGURED** |
| `NEXT_PUBLIC_APP_URL` | Public | Client + Server | **Required** | `https://kaamsetu-neon.vercel.app` | **CONFIGURED** |
| `NODE_ENV` | Non-Sensitive | System | **Required** | `"production"` | **CONFIGURED** |

---

## 2. Cryptographic Secret Entropy Validation Logic

All cryptographic secrets used for HMAC key hashing and token signing are validated via `assertCryptographicKeyQuality` in `src/lib/crypto/key-validator.ts`:

```typescript
export function assertCryptographicKeyQuality(name: string, value: string | undefined): string {
  if (!value || value.trim().length === 0) {
    throw new Error(`FATAL SECURITY CONFIGURATION: ${name} is missing from environment in production.`);
  }

  // Minimum length: 32 bytes (256 bits)
  if (value.length < 32) {
    throw new Error(`FATAL CRYPTOGRAPHIC CONFIGURATION: ${name} must be at least 32 characters (256 bits) long.`);
  }

  // Rejection of predictable test placeholders
  const lower = value.toLowerCase();
  const bannedKeywords = ["placeholder", "secret", "password", "test", "development", "changeme", "default", "123456"];
  if (bannedKeywords.some(banned => lower.includes(banned))) {
    throw new Error(`FATAL CRYPTOGRAPHIC CONFIGURATION: ${name} contains predictable placeholder keyword.`);
  }

  // Character diversity requirement
  const hasUpper = /[A-Z]/.test(value);
  const hasLower = /[a-z]/.test(value);
  const hasNumber = /[0-9]/.test(value);
  const hasSpecial = /[^A-Za-z0-9]/.test(value);
  const diversity = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;

  if (diversity < 3) {
    throw new Error(`FATAL CRYPTOGRAPHIC CONFIGURATION: ${name} lacks sufficient character entropy (insufficient character diversity).`);
  }

  return value;
}
```

---

## 3. Secret Leakage & Boundary Audit

1. **Client Bundle Analysis (`next build`):**
   - Inspection of Next.js static client chunks confirmed zero instances of `RATE_LIMIT_HMAC_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, or `GEMINI_API_KEY` in the client JavaScript bundle.
   - All server variables are accessed strictly within Node.js route handlers (`src/app/api/...`) and server libraries (`src/server/...`, `src/lib/security/...`).
2. **Log Sanitization:**
   - Server logs format errors with sanitized metadata, never printing the raw cryptographic secrets.
   - Any thrown exception outputs: `Cryptographic configuration failure during rate limit key hashing` without exposing secret contents.
3. **Response Headers & Payload:**
   - No cryptographic hashes or private keys are exposed in HTTP responses.
   - Session tokens contain only base64url encoded public worker identifiers and an HMAC signature.

---

## 4. Remediation Steps for Vercel Project Settings

To resolve the `BLOCKED BY VERCEL CONFIGURATION` status:

1. Open **Vercel Dashboard** → `kaamsetu-neon` → **Settings** → **Environment Variables**.
2. Add or update `RATE_LIMIT_HMAC_SECRET`:
   - Environment: `Production`, `Preview`, `Development`
   - Value: Generate a cryptographically secure 256-bit string (e.g., using `openssl rand -base64 32`).
3. Ensure `AUTH_VERIFICATION_MODE` is set to `"sandbox"`.
4. Trigger a production redeploy.
