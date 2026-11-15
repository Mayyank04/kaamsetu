# KAAMSETU — PHASE 25 WORKER IDENTITY & CONSENT ASSURANCE
## W3C Verifiable Credentials, Ed25519 Signatures, DPDP Act 2023 Compliance & Self-Sovereign Identity

**Repository:** `Mayyank04/kaamsetu`  
**Working Branch:** `phase-25-independent-evidence-and-class-a-reassessment`  
**Evaluation Date:** November 15, 2026  
**Auditor:** Data Privacy & Identity Architect & Principal Cryptographic Auditor  
**Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  

---

### 1. Principle of Worker Self-Sovereign Identity

In traditional labor platforms, an artisan's professional reputation, ratings, and credential history are locked inside proprietary corporate databases. When an artisan leaves or is de-platformed, their entire work track record vanishes.

KAAMSETU establishes **Worker Self-Sovereign Identity (SSI)**:
> *"Every skill deserves to be seen, even without a degree — and every artisan owns their verified professional credentials."*

Workers retain absolute ownership of:
1. Their cryptographic skill credentials (portable across employers, platforms, and state boundaries).
2. Their work portfolio photographs, videos, and craft documentation.
3. Their personal identity data and access permissions under the DPDP Act 2023.

---

### 2. W3C Verifiable Credentials Architecture (JSON-LD)

Skill verifications issued by KAAMSETU adhere strictly to the **W3C Verifiable Credentials Data Model v1.1**:

```json
{
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://schema.kaamsetu.org/credentials/v1"
  ],
  "id": "urn:uuid:7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "type": ["VerifiableCredential", "VocationalSkillCredential"],
  "issuer": {
    "id": "did:kaamsetu:issuer:kamrup-skill-center-01",
    "name": "Guwahati Vocational Skill Assessment Center"
  },
  "issuanceDate": "2026-10-14T09:30:00Z",
  "expirationDate": "2028-10-14T09:30:00Z",
  "credentialSubject": {
    "id": "did:kaamsetu:worker:7f14b2a8-8e6d-4c3e-b452-e9a8f27301c2",
    "primarySkill": "master_carpenter",
    "skillLevel": "level_4_master",
    "competencyDomains": [
      "traditional_joinery",
      "timber_framing",
      "precision_cabinetry"
    ],
    "verificationAuthority": "ASDM-Authorized Assessor #AS-8812",
    "assessmentMethod": "physical_demonstration_and_site_inspection"
  },
  "proof": {
    "type": "Ed25519Signature2020",
    "created": "2026-10-14T09:31:12Z",
    "verificationMethod": "did:kaamsetu:issuer:kamrup-skill-center-01#key-1",
    "proofPurpose": "assertionMethod",
    "proofValue": "z3h8A...[Ed25519 Cryptographic Signature]...9fKa"
  }
}
```

#### Cryptographic Signature Verification
- **Key Algorithm:** `Ed25519` (Edwards-curve Digital Signature Algorithm over Curve25519).
- **Public Key Infrastructure:** Issuer public keys registered in immutable public trust anchors.
- **Portability:** Any third party (contractor, government agency, overseas employer) can independently verify the authenticity of a worker's credential offline using standard open-source cryptographic libraries without pinging KAAMSETU servers.

---

### 3. DPDP Act 2023 Statutory Compliance

KAAMSETU's data architecture is engineered to comply with the **Digital Personal Data Protection Act (DPDP), 2023**:

#### Consent Management & Audit Trail
- **Granular Consent Capture:** Worker consent is captured explicitly per processing purpose (e.g., *portfolio display*, *enterprise job matching*, *police verification badge generation*).
- **Immutable Consent Logging:** Every consent grant, scope modification, and revocation is written to `worker_consent_audit_events`.
- **Sub-Second Revocation (< 500ms):** When an artisan revokes employer access, the RLS policies immediately deny access across all API endpoints within milliseconds.

#### Selective Disclosure & Privacy Badging
Artisans can prove their qualifications to a prospective client without disclosing sensitive Personally Identifiable Information (PII):
- A homeowner or contractor can verify:
  - Skill Grade: **Level 4 Master Carpenter**
  - Experience: **8+ Years Verified**
  - Police Verification Status: **Clear (Badge #PV-2026-AS-091)**
  - ASDM Assessment ID: **Verified**
- Without disclosing:
  - Government Aadhaar number
  - Full residential address
  - Private mobile phone number (masked routing used)
  - Bank account details

---

### 4. Offline Verification via HMAC-SHA256 QR Codes

In remote work sites (highways, border districts, forest reserves) where mobile network connectivity is absent or intermittent, physical site supervisors can verify worker identities using offline cryptographic QR codes:

```
┌─────────────────────────────────────────────────────────────┐
│                    OFFLINE QR SPECIFICATION                 │
├─────────────────────────────────────────────────────────────┤
│ Payload Structure:                                          │
│ {                                                           │
│   "wid": "7f14b2a8",                                        │
│   "sk": "carpentry_l4",                                     │
│   "exp": 1794738600,                                        │
│   "nonce": "a8f3b9c2",                                      │
│   "sig": "e4d3a2...[HMAC-SHA256 signature]...09f1"         │
│ }                                                           │
│                                                             │
│ Security Invariants:                                        │
│ 1. Time-to-Live (TTL): 15 minutes max validity.             │
│ 2. Dynamic Rotating Nonce: Prevents replay & photocopy attacks│
│ 3. Offline Verification: Supervisor app validates HMAC with  │
│    cached daily rotating regional public secret.             │
└─────────────────────────────────────────────────────────────┘
```

---

### 5. Work Portfolio Intellectual Property Ownership

Artisans frequently upload high-resolution photographs and videos of their craftsmanship (e.g., carved wooden doors, intricate masonry, structural steel fabrication).

#### Platform IP Invariants
1. **Full Worker Ownership:** The artisan retains 100% copyright, intellectual property, and moral rights over all portfolio images and work samples uploaded.
2. **Limited Non-Exclusive Display License:** KAAMSETU receives only a limited, non-transferable, revocable license to render the images within the worker's public profile for potential clients.
3. **Zero Commercial Resale / AI Training:** Portfolio images cannot be sold, licensed to third-party image databases, or ingested into generative AI models without separate, explicit written consent.
4. **Permanent Deletion on Request:** If a worker deletes their profile, all portfolio assets are permanently purged from object storage within 7 days, backed by a cryptographic deletion receipt.

---

### 6. Summary Conclusion

The Worker Identity and Consent Architecture meets the highest global standards for digital civil rights:
- Full compliance with the DPDP Act 2023.
- W3C Verifiable Credentials with Ed25519 signatures enable true portable workforce dignity.
- Offline HMAC QR technology enables secure site access without reliance on continuous cloud connectivity.
- Artisans remain the sovereign owners of their reputation, credentials, and work portfolios.
