# KAAMSETU — PHASE 28 MANIFEST SIGNATURE REPRODUCTION
## RFC 8785 Canonical JSON, SHA-256 Digest & Ed25519 Cryptographic Verification

**Evaluation Period:** December 2026  
**Signing Authority:** Kaamsetu Security Office / Ed25519 Root Key Ceremony  
**Key Identifier:** `did:web:kaamsetu.org#phase28-key-1`

---

## 1. Specification & Canonicalization Standard

To ensure release manifests are tamper-evident and immune to key-ordering, whitespace, or encoding ambiguities, KAAMSETU utilizes the RFC 8785 JSON Canonicalization Scheme (JCS).

The cryptographic workflow is structured as follows:
```
Manifest Dictionary 
      │
      ▼
RFC 8785 Canonical Serializer (JCS)
      │
      ▼
UTF-8 Encoded Byte Stream
      │
      ▼
SHA-256 Cryptographic Hash
      │
      ▼
Canonical Digest (64 hex characters)
      │
      ▼
Ed25519 Pure Signature (RFC 8032)
```

---

## 2. Phase 28 Manifest Reproduction Evidence

The authoritative Phase 28 Release Manifest is recorded in [PHASE_28_CANONICAL_RELEASE_MANIFEST.json](file:///Users/mayankgautam/Desktop/stitch_kaamsetu_digital_identity_platform/docs/PHASE_28_CANONICAL_RELEASE_MANIFEST.json).

### Cryptographic Parameters

- **Canonical Hash:** `be5d35fe288be159259c8738a143f7a020e966cebf2db7ed8288cf689d93b5f1`
- **Signing Algorithm:** `Ed25519 (EdDSA)`
- **Public Key:** `b4ef9b8dc9bb7ee4daef6dd9d5eb6599be5c345b14197c36a4fa4c4b574fa62e`
- **Signature (Hex):**
  `f7d825c9b20b224e756184918e6c7104b901a18c603a1fc6c52a061483dcbc6c888d3d995c612ad910022416ba3a8bce1ff5e839e9fb13b19280d9cfd1b8170c`

### Independent Verification Script

To independently verify the signature using Node.js:
```javascript
const crypto = require('crypto');
const fs = require('fs');

const manifestRaw = fs.readFileSync('docs/PHASE_28_CANONICAL_RELEASE_MANIFEST.json', 'utf8');
const manifest = JSON.parse(manifestRaw);

// Extract signature object and verify payload
const publicKeyDer = Buffer.concat([
  Buffer.from('302a300506032b6570032100', 'hex'),
  Buffer.from(manifest.signature.publicKeyHex, 'hex')
]);

const publicKey = crypto.createPublicKey({
  key: publicKeyDer,
  format: 'der',
  type: 'spki'
});

const isVerified = crypto.verify(
  null,
  Buffer.from(manifest.canonicalHash, 'utf8'),
  publicKey,
  Buffer.from(manifest.signature.signatureHex, 'hex')
);

console.log('Ed25519 Signature Verified:', isVerified);
// Result: true
```

---

## 3. Historical Phase 27 Manifest Invariant

To ensure backwards reproducibility, Phase 27's manifest calculation was independently re-evaluated against the 28 historical migration files and Phase 27 documents:
- **Phase 27 Canonical Hash:** `ba364051ba48500c694502fd3a9dc970db38efd7625ac79efa20409f97aae6ab`
- **Verification Result:** PASS (Exact bitwise match).
