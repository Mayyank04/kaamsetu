# KAAMSETU — PHASE 12 WORKER IDENTITY STANDARD SPECIFICATION
## Version 2.1 Portable Skill Identity, Micro-Credential Anchoring & Offline Verification Standard

**Standard Identifier:** `KST-STD-2.1-2026`  
**Supersedes:** `KST-STD-2.0-2026`  
**Classification:** Open Workforce Identity Protocol  
**Date:** November 15, 2026  

---

### 1. Specification Overview & Backward Compatibility

KAAMSETU Worker Identity Specification Version 2.1 builds on Schema 2.0 (established in Phase 10) to deliver **interstate portability, offline QR verification with cryptographic caveats, and explicit worker travel preferences**.

The specification maintains 100% backward compatibility:
- A verifier built for Schema 2.0 can ingest a Schema 2.1 identity dossier without throwing schema validation errors.
- A Schema 2.0 dossier exported prior to Phase 12 remains valid and verifiable under the canonical HMAC-SHA256 signature scheme.
- Schema 2.1 extends the schema strictly with optional, additive fields (`travelWillingness`, `offlineVerificationSummary`, `credentialSuspensionStatus`).

---

### 2. Schema 2.1 Complete JSON Structure

```json
{
  "$schema": "https://kaamsetu.in/schemas/v2.1/worker-dossier.json",
  "schemaVersion": "2.1",
  "issuer": "https://kaamsetu.in",
  "grantId": "grant-7a8b9c0d-1e2f-4a5b-8c9d-0e1f2a3b4c5d",
  "issuedAt": "2026-11-15T00:00:00Z",
  "expiresAt": "2026-11-16T00:00:00Z",
  "registryId": "IN-AS-2026-4029-KS",
  "kaamscore": 820,
  "travelWillingness": "adjacent_districts",
  "selectiveDisclosure": {
    "name": true,
    "primaryTrade": true,
    "experienceYears": true,
    "skills": true,
    "verifiedCredentials": true,
    "workHistory": true,
    "equipment": false,
    "hourlyRate": false
  },
  "worker": {
    "fullName": "Pranab Gogoi",
    "primaryTrade": "Solar PV & Micro-Grid Technician",
    "category": "Electrical & Solar",
    "ncoCode": "7411.0100 - Electrical Mechanics & Solar Mounts",
    "experienceYears": 7,
    "operatingCity": "Guwahati",
    "operatingState": "Assam",
    "skills": [
      "Rooftop Solar Array Commissioning",
      "3-Phase Inverter Synchronization",
      "Industrial Earthing Testing"
    ],
    "verifiedCredentials": [
      {
        "credentialIdentifier": "KST-INST-4-8F3B1A2C",
        "institutionName": "Assam Skill Development Mission",
        "tradeTitle": "Solar PV Installer (Suryamitra)",
        "nsqfLevel": 4,
        "issuedAt": "2026-08-14T00:00:00Z",
        "status": "issued"
      }
    ],
    "workHistory": [
      {
        "projectTitle": "Dispur Commercial Solar Retrofit",
        "role": "Lead Wireman",
        "durationDays": 28,
        "contractorName": "Brahmaputra Infrastructure Pvt Ltd",
        "verifiedCompletion": true
      }
    ]
  },
  "offlineVerificationSummary": {
    "registryId": "IN-AS-2026-4029-KS",
    "fullName": "Pranab Gogoi",
    "primaryTrade": "Solar PV & Micro-Grid Technician",
    "kaamscore": 820,
    "credentialCount": 1,
    "cachedKeyVersion": "v1",
    "lastSyncTimestamp": "2026-11-15T00:00:00Z",
    "integritySignature": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "offlineCaveatNotice": "Offline verification confirms signature authenticity as of last cache synchronization; it cannot prove absence of revocation occurred post-sync."
  },
  "integrity": {
    "keyVersion": "v1",
    "canonicalHash": "4a1b8c2d9e0f3a6b5c7d1e8f2a4b0c9d7e5f3a1b",
    "signature": "3045022100e4b8a1c9...2a8b9c0d1e2f3a4b",
    "jcsCompliant": true
  }
}
```

---

### 3. Cryptographic Anchoring & Selective Disclosure

1. **RFC 8785 JSON Canonicalization (JCS):** All fields within the export payload are serialized strictly according to RFC 8785 rules (keys sorted lexically, standard number formatting, UTF-8 normalization) prior to computing HMAC-SHA256 digests.
2. **Selective Disclosure Filtering:** The worker decides which sections to disclose to a requesting party. If `equipment: false`, the `equipmentHandled` array is entirely omitted from the output. Unredacted Aadhaar numbers are **never included in any export under any circumstances**.
3. **Instant Revocation Token Defense:** Every access token is hashed with SHA-256 and stored in `public.worker_identity_access_grants`. When a worker clicks "Revoke Access", the record status immediately transitions to `'revoked'` with `revoked_at = now()`. Any subsequent API call with that token is rejected at the database level with HTTP 403 Forbidden.

---

### 4. Offline Verification & The Mandatory Revocation Caveat

A critical security innovation in Schema 2.1 is the formalization of offline QR verification limitations:

> **Fundamental Cryptographic Invariant:**  
> An offline verifier without internet connectivity can mathematically verify the cryptographic authenticity of the cached signature, but **cannot prove the absence of a revocation that occurred after the last cache sync**.

To prevent misleading claims of "foolproof offline revocation", Schema 2.1 mandates that every offline QR verification response and physical card embed the exact caveat notice:
`"Offline verification confirms signature authenticity as of last cache synchronization; it cannot prove absence of revocation occurred post-sync."`

Field scanners and contractor mobile apps that parse KAAMSETU QR codes are required to display this caveat prominently whenever an offline scan is conducted.
