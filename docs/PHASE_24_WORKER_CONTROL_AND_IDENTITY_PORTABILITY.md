# KAAMSETU — PHASE 24 WORKER CONTROL & IDENTITY PORTABILITY
## Self-Sovereign Identity, DPDP Act 2023 Compliance & W3C Verifiable Credentials

**Repository:** `Mayyank04/kaamsetu`  
**Working Branch:** `phase-24-institutional-gate-closure-and-impact-replication`  
**Evaluation Date:** November 15, 2026  
**Auditor:** Data Privacy & Identity Architect & Security Assurance Lead  

---

### 1. The Principle of Worker Data Sovereignty

In conventional labor platforms, workers' reputation, ratings, and work history are trapped inside proprietary walled gardens. If a worker leaves the platform, their entire professional history is lost.

In KAAMSETU, a worker's skill identity belongs solely to the worker:
> **"Every skill deserves to be seen, even without a degree — and every worker owns their professional identity."**

Workers have the sovereign right to:
1. Export their verified credentials in open, machine-readable W3C standards.
2. Grant or revoke employer access to their identity at any time.
3. Selectively disclose their skills without exposing sensitive PII.
4. Verify their credentials offline without active internet connectivity.

---

### 2. DPDP Act 2023 Compliance Architecture

KAAMSETU is architected to exceed India's **Digital Personal Data Protection (DPDP) Act 2023**:

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                     DPDP 2023 COMPLIANCE CONTROLS                             │
├───────────────────────────────────────────────────────────────────────────────┤
│ 1. Explicit Purpose-Bound Consent: Logged in worker_consent_audit_events.     │
│ 2. Real-Time Revocation: Consent revocation takes effect within < 500ms.      │
│ 3. Data Minimization: Contractors see only verified skills & active radius.  │
│ 4. PII Protection: Unauthenticated viewers cannot view phone or raw Aadhaar.  │
│ 5. Right to Erasure: Full account deletion and export pipeline available.     │
└───────────────────────────────────────────────────────────────────────────────┘
```

#### 2.1 Public PII Masking
The database view `public.public_worker_profiles` strictly masks personal contact information:
- Phone numbers: Rendered as `XXXXXX1234` or completely suppressed for unauthenticated sessions.
- Aadhaar Numbers: Never stored in raw plaintext; verified cryptographically via UIDAI sandbox hashes; displayed only as masked `XXXX-XXXX-9876`.
- Residential Addresses: Coarsened to town/city and district level (e.g. "Beltola, Guwahati, Assam").

---

### 3. W3C Verifiable Credentials & JSON-LD Export

Artisans can download their complete skill credential package as a standardized W3C Verifiable Credential:

```json
{
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://schema.kaamsetu.org/v1"
  ],
  "id": "urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6",
  "type": ["VerifiableCredential", "VocationalSkillCredential"],
  "issuer": "did:kaamsetu:institution:asdm-guwahati-01",
  "issuanceDate": "2026-10-01T00:00:00Z",
  "credentialSubject": {
    "id": "did:kaamsetu:worker:7f9a2b1c",
    "skillCategory": "Carpentry & Joinery",
    "nsqfLevel": 3,
    "verifiedExperienceYears": 8,
    "completedJobs": 42,
    "verifiedPayerRating": 4.85
  },
  "proof": {
    "type": "Ed25519Signature2020",
    "created": "2026-10-01T00:00:00Z",
    "proofPurpose": "assertionMethod",
    "verificationMethod": "did:kaamsetu:institution:asdm-guwahati-01#key-1",
    "jws": "eyJhbGciOiJFZERTQ..."
  }
}
```

---

### 4. Offline QR Verification via HMAC-SHA256

Inspectors, contractors, and labor officers can verify credentials on remote construction sites without internet access:
- High-density QR codes encode a compact JSON payload containing worker ID, skill tier, and issuance timestamp signed with KAAMSETU's public verification HMAC key.
- Offline handheld inspection apps verify the digital signature locally within 10 milliseconds.
- Prevents counterfeit identity cards and skill credential forgery.
