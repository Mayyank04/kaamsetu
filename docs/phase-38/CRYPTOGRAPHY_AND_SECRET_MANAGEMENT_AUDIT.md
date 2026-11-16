# KAAMSETU — PHASE 38 CRYPTOGRAPHY, KEY MANAGEMENT & SECRETS AUDIT

**Target:** Cryptographic Services, Credential Signing, Secrets Validation, Session Security  
**Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**Parent Baseline:** Phase 37 Modular Monolith  
**Audit Objective:** Evaluate cryptographic algorithms, inspect asymmetric Ed25519 key management, verify RFC 8785 JSON Canonicalization Scheme (JCS), assess key rotation capabilities, review secret entropy and validation mechanisms, and verify constant-time comparison guards.

---

## 1. Executive Summary

KAAMSETU operates as a sovereign cryptographic trust layer for skilled informal workers. Because artisan credentials may be verified offline by employers or municipal institutions, the integrity and non-repudiation of credentials depend entirely on rigorous cryptographic design.

The platform employs:
1. **Ed25519 Asymmetric Signatures:** High-security, constant-time public key cryptography for verifiable worker credentials.
2. **RFC 8785 JSON Canonicalization (JCS):** Deterministic object sorting and normalization preventing signature invalidation caused by key reordering or whitespace variance.
3. **High-Entropy Secrets & Key Quality Assertions:** Fail-closed initialization guards (`assertCryptographicKeyQuality`) requiring minimum 256-bit entropy.
4. **Key Rotation & Backward Compatibility:** Dual-key support (`RATE_LIMIT_HMAC_SECRET` and `RATE_LIMIT_HMAC_SECRET_PREVIOUS`; credential key versioning `v1`, `v2`).
5. **Constant-Time Operations:** `crypto.timingSafeEqual` prevents timing side-channel attacks across tokens, webhook signatures, and HMAC digests.

---

## 2. Asymmetric Credential Signing Architecture

### 2.1 Algorithm Selection
- **Algorithm:** Ed25519 (Edwards-curve Digital Signature Algorithm over Curve25519).
- **Security Properties:**
  - 128-bit security level equivalent to 3072-bit RSA.
  - Immune to side-channel timing attacks (natively constant-time).
  - Compact public keys (32 bytes) and signatures (64 bytes), optimal for QR codes on physical identity cards.
- **Implementation:** `src/lib/crypto/credential-signer.ts` using Node.js native `crypto.sign(null, canonicalBuffer, privateKey)` and `crypto.verify(null, canonicalBuffer, publicKey, signature)`.

### 2.2 RFC 8785 JSON Canonicalization (JCS)
To prevent signature mismatch across differing JSON parsers:
- Object keys are recursively sorted lexicographically by Unicode code point.
- Whitespace between tokens is eliminated.
- Numbers follow ECMAScript 6 representation (RFC 8785 Section 3.2.2.3).
- Strings are encoded in canonical UTF-8 with standard escaping.

### 2.3 Verification Lifecycle & Revocation
Verification does not solely check mathematical validity:
1. Verifies Ed25519 signature over canonical payload.
2. Checks expiration date against current UTC timestamp.
3. Queries cryptographic revocation registry (`credential_revocations`) to ensure credential was not suspended or revoked by an accredited issuing institution.

---

## 3. Secret Management & Key Quality Assertions

### 3.1 Fail-Closed Environment Validation
In production (`NODE_ENV === "production"`), missing cryptographic keys will crash the startup process safely rather than allowing the application to run in a degraded or insecure state:
- `RATE_LIMIT_HMAC_SECRET`: Minimum 32 characters (256 bits). Absence triggers immediate fail-closed error.
- `SUPABASE_SERVICE_ROLE_KEY`: Mandatory for privileged background routines; silent fallback to unprivileged keys was removed in SEC-08.
- `CREDENTIAL_SIGNING_PRIVATE_KEY`: Validated for valid Ed25519 PKCS#8 private key structure.

### 3.2 Zero Secret Leakage Invariants
- Private keys and HMAC secrets are never sent to the browser client.
- Login and error pages sanitize error messages, ensuring secret names or stack traces are never exposed in user-facing UI (e.g. `src/app/login/page.tsx`).
- Sensitive parameters in query strings or JSON payloads are masked by `src/lib/security/privacy-logger.ts` before audit persistence.

---

## 4. Constant-Time Timing Attack Mitigations

Every verification comparing sensitive hashes or signatures utilizes `crypto.timingSafeEqual`:
```typescript
export function timingSafeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}
```
This protects:
- Webhook signature verification (`src/app/api/webhooks/...`).
- Rate-limiting token hashing.
- Internal session verification tokens.

---

## 5. Key Rotation Matrix
| Key Identifier | Purpose | Active Algorithm | Rotation Strategy | Fallback Supported |
| :--- | :--- | :--- | :--- | :---: |
| `CREDENTIAL_KEY_V1` | Verifiable Credential Signatures | Ed25519 | Annual / On Compromise | Yes (`keyVersion` in header) |
| `RATE_LIMIT_HMAC_SECRET` | IP & Identifier Hashing | HMAC-SHA256 | Semi-Annual | Yes (`_PREVIOUS` secret checked) |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin Database Client | JWT / Asymmetric | Platform Managed | No (Fail-Closed) |

---

## 6. Audit Verdict
- **Status:** PASS
- **Cryptographic Rigor:** Industry-standard Ed25519 and RFC 8785 compliance.
- **Timing Vulnerabilities:** 0 detected; all sensitive checks use constant-time primitives.
- **Secret Management:** Production fail-closed with automated entropy checks.
