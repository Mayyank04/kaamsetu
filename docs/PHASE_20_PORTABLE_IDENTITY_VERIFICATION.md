# KAAMSETU — PORTABLE IDENTITY & VERIFIABLE CREDENTIALS
## W3C Digital Credentials, Cryptographic Non-Repudiation, Masked QR Verification & Verifier Limitations

**Standard:** W3C Verifiable Credentials Data Model v1.1 & RFC 8785 Canonical JSON  
**Cryptographic Algorithm:** HMAC-SHA256 (Canonical Payload Digestion) / Ed25519  
**Service Implementation:** `src/lib/crypto/credential-signer.ts`, `src/lib/identity/worker-id-card.ts`

---

### 1. Worker Identity Sovereignty

In conventional staffing and gig platforms, a worker's professional reputation, ratings, and work history belong to the platform or the contractor. If a worker leaves a contractor or switches apps, their track record is lost.

KAAMSETU establishes **Worker Identity Sovereignty**:
1. **Unilateral Portability:** The worker owns their persistent identity (`did:kaamsetu:*`).
2. **Anti-Lock-in:** A contractor departing or removing a worker from their crew cannot delete, alter, or confiscate the worker's accrued history or ratings.
3. **Selective Disclosure:** Workers can share verified skill credentials while withholding personal equipment, home address, or historical rate negotiation notes.
4. **Sovereign Revocation Key:** Exported identity packages include worker-held cryptographic revocation tokens.

---

### 2. What the QR Code Proves vs. What It Does NOT Prove

To maintain absolute transparency with hiring contractors and institutional employers, the physical and digital verification page (`/verify/[registryId]`) publishes explicit scope disclosures:

| Capability | Proved by QR & Digital Proof? | Technical / Operational Reality |
| :--- | :---: | :--- |
| **Authentic Digital Issuance** | **YES** | Proves the credential payload was issued by an authorized issuer key without modification since signing. |
| **Tamper-Evidence** | **YES** | Altering even one character (e.g. NSQF level 3 to 4) invalidates the canonical HMAC digest. |
| **Active Registration** | **YES** | Proves the credential is not expired, suspended, or revoked in the central registry. |
| **Hands-on Physical Competence**| **NO** | **Does NOT prove offline trade dexterity, craftsmanship, or site behavior without practical trade assessment.** |
| **Biometric Co-Presence** | **NO** | **Does NOT prove that the person presenting the card is the original owner without photo/biometric match.** |
| **Guaranteed Output Quality** | **NO** | **Does NOT constitute an institutional warranty or liability guarantee for contractor job execution.** |

---

### 3. Segregation of Verified vs. Self-Reported Claims

The worker profile presentation strictly differentiates provenance levels:

1. **Institutionally Verified Credentials:**
   - Backed by accredited training institutes (e.g. ASDM, NSDC, ITI Guwahati).
   - Displayed with blue cryptographic verification badges and audit registry links.
2. **Peer & Contractor Confirmed Experience:**
   - Backed by completed booking milestones and counterparty confirmation.
3. **Self-Reported Claims:**
   - Bio narratives, years of trade experience unbacked by institutional papers, secondary skills.
   - Distinctly labeled as `"Self-Reported"` to avoid misleading prospective contractors.

---

### 4. Privacy-Preserving Physical ID Card Layout

When generating worker ID cards and printable QR codes:
- **Aadhaar Masking:** Only the last 4 digits are visible (`XXXX-XXXX-4412`).
- **QR Code Content:** Contains only the worker DID, masked ID, primary trade, and public verification URL. Raw government ID numbers and phone numbers are excluded from the optical bitmap.
