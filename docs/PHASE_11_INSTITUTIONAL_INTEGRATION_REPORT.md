# KAAMSETU — PHASE 11 INSTITUTIONAL INTEGRATION REPORT
## Cryptographic Credential Protocol, Partner API Gateway & Sandbox Verification

**Milestone:** Phase 11 — Interstate Field Expansion & Ecosystem Integration  
**Protocol Standard:** RFC 8785 Canonical JSON Serialization (JCS) + HMAC-SHA256 Non-Repudiation  
**Schema Version:** 2.0  
**Institutional Integration Endpoints:**
- `/api/institution/credentials` (Credential lifecycle management: issue, suspend, revoke)
- `/api/institution/sandbox/verify` (Partner API key verification sandbox)
- `/api/v1/interop/worker/[token]` (Time-limited selective disclosure dossier export)

---

## 1. Executive Summary

Phase 11 transforms KAAMSETU from an internal certification directory into an interoperable institutional trust protocol. Institutional partners—vocational training institutes (ITIs), state skill missions (ASDM, MSSDS), and polytechnics—can now issue, verify, suspend, and revoke digital trade credentials anchored by 256-bit cryptographic signatures.

Third-party employers, verifiers, and government portals can query credentials through a rate-limited, scoped REST API gateway or through public QR verification pages without exposing unconsented personal data.

---

## 2. Cryptographic Architecture: Canonicalization & Signing

To ensure credentials remain tamper-evident across database migrations, state lines, and third-party verifications, KAAMSETU implements RFC 8785 Canonical JSON Serialization (JCS).

```mermaid
flowchart TD
    A["Institutional Evaluation<br>(Trade, NSQF Level, Assessor)"] --> B["Learner Explicit Consent Check<br>(DPDP Act Invariant)"]
    B -->|Consent Granted| C["RFC 8785 Canonical Serialization<br>(Deterministic Key Sorting)"]
    B -->|Consent Denied| X["FAIL CLOSED<br>Issuance Blocked"]
    C --> D["SHA-256 Canonical Hash"]
    D --> E["HMAC-SHA256 Signature<br>(256-Bit Server Secret)"]
    E --> F["Anchored in public.institutional_credentials<br>(Status: 'issued')"]
    F --> G["Public QR Verification / Partner API"]
```

### 2.1 Canonical Payload Specification
```typescript
interface CanonicalCredentialData {
  assessmentReference: string;
  cohortId: string;
  credentialIdentifier: string; // e.g. "KST-INST-4-A1B2C3D4"
  institutionId: string;
  issuedAt: string;             // ISO-8601 UTC
  nsqfLevel: number;            // 1 to 8
  schemaVersion: "2.0";
  tradeTitle: string;
  workerProfileId: string;
}
```

### 2.2 Tamper-Evident Verification Proof
Any modification to the stored or presented data (for instance, an attacker attempting to elevate NSQF Level from 4 to 8, or altering the trade title from "Electrician Helper" to "Master Electrician") produces an immediate SHA-256 hash divergence. The constant-time HMAC check fails, immediately reporting:
```json
{
  "isValid": false,
  "status": "tampered",
  "signatureVerified": false,
  "tamperEvident": true,
  "reason": "Cryptographic signature check failed - credential tampered"
}
```

---

## 3. Credential Lifecycle State Machine

Institutional credentials exist in four strictly defined, auditable states:

```mermaid
stateDiagram-v2
    [*] --> issued: Authorized Assessor Signs with Consent
    issued --> verified: Third-Party External Verification Match
    issued --> suspended: Formal Regulatory Inquiry / Retesting
    verified --> suspended: Audit Flag Raised
    suspended --> verified: Re-evaluation Passed
    suspended --> revoked: Disciplinary Board Revocation Order
    issued --> revoked: Fraudulent Assessment Discovery
    revoked --> [*]: Permanent Terminal State
```

1. **`issued`:** Credential signed and active. Searchable by identifier.
2. **`verified`:** Confirmed by an authorized verifier or live site inspection.
3. **`suspended`:** Temporarily frozen (e.g. pending mandatory safety recertification). Public verification explicitly reports `Credential currently suspended`.
4. **`revoked`:** Permanently invalidated with immutable `revoked_at` timestamp and `revocation_reason`. Cannot be reinstated; verifier receives a clear warning of revocation.

---

## 4. Institutional Partner API Gateway & Scoped Sandboxes

To support external integration by technical universities, state agencies, and enterprise contractors, Phase 11 introduces scoped API keys stored in `public.institutional_partner_api_keys`.

### 4.1 Key Security Invariants
- **Zero Raw Key Storage:** The API server stores only the SHA-256 digest of the key (`api_key_hash`). The plaintext key (`kst_live_...` or `kst_test_...`) is displayed exactly once upon generation.
- **Environment Isolation:** Keys carry explicit `is_sandbox: boolean` flags. Sandbox keys cannot modify production cohort records.
- **Per-Key Rate Limiting:** Enforced at 60 requests/minute by default to protect database infrastructure from denial-of-service attempts.

### 4.2 Endpoint: `/api/institution/sandbox/verify`
Allows integration testing by third parties using API keys or public identifier queries:

**Sample Request:**
```http
POST /api/institution/sandbox/verify HTTP/1.1
Host: kaamsetu.in
Authorization: Bearer kst_test_8f9a2b1c4d3e5f6a7b8c9d0e
Content-Type: application/json

{
  "credentialIdentifier": "KST-INST-4-EEAFE135"
}
```

**Sample Successful Response:**
```json
{
  "data": {
    "verification": {
      "isValid": true,
      "status": "issued",
      "credentialIdentifier": "KST-INST-4-EEAFE135",
      "tradeTitle": "Certified Solar Rooftop Technician",
      "nsqfLevel": 4,
      "authorizedIssuerName": "Dr. N. Sarma",
      "authorizedIssuerRole": "Lead Assessor, ASDM",
      "issuedAt": "2026-11-14T17:45:00.000Z",
      "signatureVerified": true,
      "tamperEvident": false,
      "institutionName": "Assam Skill Development Mission (ASDM)",
      "workerName": "Rameshwar Sharma"
    },
    "partnerContext": {
      "keyName": "ASDM Testing Sandbox Key",
      "isSandbox": true,
      "institutionName": "Assam Skill Development Mission (ASDM)"
    },
    "protocolVersion": "2.0",
    "timestamp": "2026-11-14T17:50:12.431Z"
  }
}
```

---

## 5. Partner Institutional Landscape (Assam & Meghalaya)

| Partner Institution | Jurisdiction | Type | Status | Use Case / Integration Scope |
|---|---|---|---|---|
| **Assam Skill Development Mission (ASDM)** | Assam | State Mission | Operational / Sandbox Live | Issuing NSQF Level 4 credentials for solar PV and electrical cohorts |
| **Industrial Training Institute (ITI) Guwahati** | Assam | Vocational ITI | Pilot Proposal / Discussion | Digital trade certificate anchoring for graduating electrician and plumber trainees |
| **Meghalaya State Skill Development Society (MSSDS)** | Meghalaya | State Mission | Pilot Proposal / Discussion | Credential verification for cross-border solar and timber construction artisans |
| **Nagaon Polytechnic Institute** | Assam | Polytechnic | Contacted | Technical diploma practical apprenticeship tracking |

---

## 6. Regulatory & Privacy Governance (DPDP Act Compliance)

1. **Mandatory Worker Consent:** Section 19 of the test suite verifies that `issueInstitutionalCredential` strictly fails closed with an exception if `learnerConsentObtained === false`.
2. **Whistleblower & Whitelist Defense:** Partner organizations can only query credentials when provided with an authorized public identifier or a worker-issued time-limited access grant. Unrestricted mass directory scraping is mathematically blocked.
3. **Audit Trail Integrity:** Every issuance, verification, suspension, and revocation event is logged to `institution_audit_logs` with actor timestamps and client IP digests.
