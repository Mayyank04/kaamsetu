# KAAMSETU — PHASE 23 WORKER IDENTITY PORTABILITY
## W3C Verifiable Credentials, DPDP 2023 Sovereignty, Selective Disclosure & Non-Ownership Invariants

**Core Mission:** "Every skill deserves to be seen, even without a degree."  
**Constitutional Invariant:** 0.00% commission on worker wages (`platform_commission_amount = 0.00`).  
**Auditor Designation:** DPDP Privacy Architect & Digital Identity Specialist  
**Date:** November 15, 2026

---

### 1. The Worker Sovereignty Invariant

In conventional gig-work platforms, the platform or contractor owns the worker's profile, ratings, and reputation data. If a worker leaves the platform, their entire accumulated career history is wiped or locked.

KAAMSETU establishes the **Worker Sovereignty Invariant**:
$$\mathbf{The\text{ }worker\text{ }is\text{ }the\text{ }sole\text{ }owner\text{ }of\text{ }their\text{ }identity\text{ }and\text{ }credentials.}$$
$$\mathbf{No\text{ }contractor,\text{ }institution,\text{ }or\text{ }platform\text{ }can\text{ }seize\text{ }or\text{ }extinguish\text{ }it.}$$

---

### 2. Technical Portability Architecture (W3C Standards)

Worker credentials are structured under the **W3C Verifiable Credentials Data Model v1.0** and can be exported at any time via `/api/v2/identity/export`:

```json
{
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://kaamsetu.in/contexts/skills-v1.jsonld"
  ],
  "id": "urn:uuid:55555555-5555-5555-5555-555555550001",
  "type": ["VerifiableCredential", "TradeSkillCredential"],
  "issuer": "did:kaamsetu:asdm-guwahati-gov-in",
  "issuanceDate": "2026-01-15T08:00:00Z",
  "credentialSubject": {
    "id": "did:key:z6MkpTHR8VNsBxYAAWHuEc2KaAAo3InnWBnZBzG...",
    "trade": "Industrial Electrician & Solar Grid Specialist",
    "nsqfLevel": 4,
    "verifiedHours": 1850,
    "stateMissionVerification": "ASDM/TRG/2026/089"
  },
  "proof": {
    "type": "Ed25519Signature2020",
    "created": "2026-01-15T08:00:00Z",
    "verificationMethod": "did:kaamsetu:asdm-guwahati-gov-in#key-1",
    "proofValue": "z3j8...cryptographic_proof..."
  }
}
```

---

### 3. Selective Disclosure & Privacy Protection

Under the Digital Personal Data Protection (DPDP) Act 2023:
1. **Selective Disclosure:** When sharing credentials with a client or contractor, the worker can choose to disclose only trade qualifications and star ratings while withholding earnings history and residential address.
2. **Revocation Lists:** Cryptographic key revocation lists (RFC 8785) allow workers or state missions to revoke suspended badges immediately across all offline nodes.
3. **Instant Consent Withdrawal:** A worker can withdraw discoverability consent with a single tap. Their profile is removed from public search, but **zero credentials or work records are lost**.

---

### 4. Scannable QR Offline Verification Boundaries

- **Zero PII Exposure:** Physical or mobile QR codes encode an HMAC-SHA256 signed verification URL (e.g., `https://kaamsetu.in/verify/KS-CARP-7810?sig=...`).
- **No Plaintext Identifiers:** The QR code contains zero raw Aadhaar numbers, PANs, bank accounts, or phone numbers.
- **Offline Tamper Detection:** A field inspector scanning the QR code validates the cryptographic signature directly against the public key registry, detecting any forged NSQF levels or photo substitutions instantly.

---

### 5. The Free Identity Access Invariant

- **100% Free Forever:** A worker is **never** charged a subscription, verification fee, badge charge, or wage deduction to maintain their digital identity or scannable QR card (`worker_fee = 0.00`).
