# KAAMSETU Phase 27 Offline QR Cryptographic Assurance
## Proprietary Compact HMAC-SHA256 Credential Format, Field Verifiability & Offline Boundaries

**Evaluation Context:** November 2026  
**Implementation Source:** [credential-signer.ts](file:///Users/mayankgautam/Desktop/stitch_kaamsetu_digital_identity_platform/src/lib/crypto/credential-signer.ts)  
**QR Generator:** [generate.ts](file:///Users/mayankgautam/Desktop/stitch_kaamsetu_digital_identity_platform/src/lib/qr/generate.ts)

---

## 1. Architectural Purpose & Design Rationale

While W3C Verifiable Credentials using Ed25519 are optimal for digital wallets and institutional API integrations, they produce payloads of 2.5 KB to 4 KB. In rural Assam and Meghalaya, field supervisors and contractors frequently operate in low-bandwidth 2G environments or areas with intermittent connectivity.

KAAMSETU deploys a lightweight, compact 2D barcode format:
- **Payload Size:** Bounded to <= 512 bytes.
- **Encoding:** Base64-encoded RFC 8785 canonical JSON payload + HMAC-SHA256 signature.
- **Physical Output:** High-density camera-scannable QR code printed on physical artisan ID cards.

---

## 2. Cryptographic Specification & Key Lifecycle

### 2.1 Cryptographic Primitives
- **Algorithm:** HMAC-SHA256 (RFC 2104 / FIPS 198-1).
- **Key Entropy:** Minimum 256 bits (32 bytes) cryptographically random material generated via CSPRNG (`crypto.randomBytes(32)`).
- **Canonical Serialization:** Deterministic RFC 8785 JSON Canonicalization Scheme (JCS).
- **Verification:** Constant-time buffer comparison (`crypto.timingSafeEqual`) to eliminate timing-attack side channels.

### 2.2 Key Custody & Storage
- **Local/Development:** Controlled via isolated test keys injected into in-memory key stores.
- **Production:** Injected via secure environment secrets (`CREDENTIAL_SIGNING_KEY_V1`, `CREDENTIAL_SIGNING_KEY_V2`) managed in AWS KMS / Supabase Vault.
- **Prohibition:** Private signing secrets are strictly barred from client-side JavaScript bundles and git trees.

### 2.3 Key Versioning & Multi-Version Rotation
```
Key Version Lifecycle:
[active] --> [rotated] --> [revoked]
```
- When a key version is **rotated**, it can no longer sign new credentials, but previously issued credentials signed with that key remain verifiable until their expiration date.
- When a key version is **revoked** (e.g. following suspected key compromise), all credentials issued under that version fail-closed immediately upon verification.

---

## 3. Offline Verification Boundary & Security Limitations

An honest security evaluation requires explicitly documenting the fundamental limitations of offline verification:

> [!WARNING]
> **Offline Revocation Limitation:**  
> A verifier device operating completely disconnected from the Internet cannot know if a worker credential has been revoked or suspended in real-time. The offline verifier can only verify:
> 1. That the credential payload was authentically signed by KAAMSETU.
> 2. That the credential has not exceeded its encoded `expiresAt` timestamp.
> 3. That the payload has not been tampered with.

### Mitigations Deployed:
1. **Short-Lived Physical Badges:** Field QR codes carry a strict maximum expiration window (30 to 90 days for high-risk trades, 12 months for standard trades).
2. **Periodic Status List Synchronization:** The mobile verifier app caches a local bloom filter or cryptographic CRL whenever connectivity is re-established.
3. **Mandatory Online Verification for High-Value Dispatches:** Dispatches exceeding ₹25,000 or heavy EPC project gates mandate online verification via `/verify/[registryId]`.
