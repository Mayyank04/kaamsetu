# KAAMSETU — PHASE 16 IDENTITY INTEROPERABILITY REPORT
## Schema 2.0 Specification, W3C Verifiable Credentials Alignment & Offline Verification

**Date:** November 15, 2026  
**Milestone:** Phase 16 — Independent Verification, National Network Reliability & Repeatable State Expansion  
**Standard:** Schema 2.0 W3C-Aligned Verifiable Credential Format  
**Repository:** `Mayyank04/kaamsetu`  
**Working Branch:** `phase-16-independent-verification-and-national-scale`

---

## 1. Executive Summary

KAAMSETU empowers workers to carry their professional identity across employers, platforms, and institutions. In Phase 16, KAAMSETU deployed **Identity Schema 2.0** (`identity-schema-v2-service.ts`), providing W3C-aligned verifiable identity exports, full backward compatibility with Schema 1.0 dossiers, deterministic RFC 8785 canonicalization, and clear offline freshness caveats.

---

## 2. Schema 2.0 Data Specification

```json
{
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://w3id.org/kaamsetu/v2"
  ],
  "schemaVersion": "2.0",
  "id": "wid-001",
  "issuedAt": "2026-11-15T01:30:00.000Z",
  "workerProfile": {
    "fullName": "Pranab Bora",
    "primaryTrade": "Masonry",
    "skills": ["Bricklaying", "Plastering"],
    "kaamScore": 840,
    "completedProjectsCount": 18,
    "ratingAverage": 4.8
  },
  "institutionalCredentials": [
    {
      "credentialIdentifier": "ASDM-MAS-2026-091",
      "tradeTitle": "Masonry Construction",
      "nsqfLevel": 3,
      "issuingInstitution": "Assam Skill Development Mission",
      "issuanceDate": "2026-08-15T10:00:00.000Z",
      "status": "active"
    }
  ],
  "selectiveDisclosure": {
    "phoneDisclosed": false,
    "earningsDisclosed": false,
    "identityMasked": true
  },
  "integrityProof": {
    "type": "HmacSha256Signature2026",
    "created": "2026-11-15T01:30:00.000Z",
    "verificationMethod": "https://kaamsetu.org/keys/v2",
    "proofValue": "4ace54e681577cc72834b..."
  },
  "disclaimers": {
    "nonGovernmentStatus": "This credential certifies vocational competence verified by accredited institutions on KAAMSETU. It does NOT constitute a government gazetted degree or DigiLocker official document.",
    "offlineVerificationCaveat": "Offline verification valid as of cache timestamp; real-time revocation status cannot be verified without network connectivity."
  }
}
```

---

## 3. Backward Compatibility with Schema 1.0

A core reliability requirement is that older Schema 1.0 dossiers generated in earlier pilot phases remain fully parsable and verifiable.

KAAMSETU's parser (`upgradeLegacySchemaV1ToV2`):
- Ingests Schema 1.0 payloads.
- Normalizes trade labels to current National Skills Qualifications Framework (NSQF) taxonomy.
- Re-serializes the payload under Schema 2.0 structure.
- Re-verifies legacy signatures against historical key versions (`v1` and `v2`).

---

## 4. RFC 8785 Canonical JSON Signing

To prevent signature verification failures caused by differing JSON serializer whitespace, key order, or float representations, KAAMSETU strictly implements **RFC 8785 (JSON Canonicalization Scheme - JCS)**:
- Object keys are recursively sorted in lexicographical Unicode order.
- No whitespace is included outside string literals.
- Deterministic IEEE 754 number formatting.
- UTF-8 byte stream is hashed using HMAC-SHA256.

---

## 5. Offline Freshness & Revocation Limitation Caveat

In remote parts of the Northeast with intermittent cellular connectivity, credentials must be verifiable offline via cached PWA storage or QR scan.

However, offline verification cannot check real-time database revocation status. To balance utility with truth in verification:
1. **Freshness Budget:** A cached credential verification is considered fresh for up to **7 days**.
2. **Stale Cache Handling:** Beyond 7 days, offline verification flags `offline_cache_stale`.
3. **Mandatory Visual Caveat:** The verification interface embeds an immutable notice:
   > *"Offline verification valid as of cache timestamp; real-time revocation status cannot be verified without network connectivity."*

---

## 6. Non-Government Status Disclosure

To prevent deceptive representation:
- Credentials issued on KAAMSETU do NOT claim to be official government degrees, diplomas, or DigiLocker gazetted qualifications.
- Every credential explicitly identifies the vocational training provider (e.g., ASDM, Don Bosco) and states that KAAMSETU functions as the cryptographic issuance and identity layer.

---

## 7. Conclusion

Identity Schema 2.0 provides an open, W3C-aligned, tamper-evident digital identity for India's blue-collar tradespeople, interoperable with national digital public infrastructure.
