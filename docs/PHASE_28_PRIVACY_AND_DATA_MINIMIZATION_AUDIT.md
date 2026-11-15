# KAAMSETU — PHASE 28 PRIVACY AND DATA MINIMIZATION AUDIT
## Unmasked Aadhaar Elimination, PII Redaction & Storage Object Protection

**Evaluation Context:** December 2026  
**Auditor:** Data Protection Officer & Privacy Compliance Lead  
**Regulatory Standards:** DPDP Act 2023, Aadhaar Act 2016 (Regulations 2018)

---

## 1. Zero Unmasked Aadhaar Invariant

Under the Aadhaar Regulations 2018 and the DPDP Act 2023, storing, logging, or displaying raw 12-digit Aadhaar numbers is strictly illegal for non-statutory platforms.

KAAMSETU enforces three automated safeguards:

1. **Pre-Ingestion Regular Expression Filter:**
   Any API request or credential issuance containing an unmasked 12-digit number (regex `\b\d{4}\s?\d{4}\s?\d{4}\b`) is intercepted and rejected with `UNMASKED_AADHAAR_PROHIBITED` ([TEST 91]).
2. **Deterministic Masking Helper:**
   All approved documents format identity references into standardized masked formats: `XXXX-XXXX-1234` ([TEST 92]).
3. **Data Minimization on Offline QR Codes:**
   As asserted in [TEST 93], offline QR payloads exclude all banking details, home addresses, and national identity numbers, embedding only the artisan's cryptographic DID, verified trade title, and Ed25519 signature proof.

---

## 2. Public Profile Data Minimization

The public worker profile view (`public_worker_profiles`) exposes only intentional, worker-consented public information:
- Display name / Trade alias.
- Verified trade category (e.g., Carpentry).
- District (e.g., Kamrup Metropolitan).
- Years of trade experience.
- Verified skill badge count.
- Composite rating score.

Private mobile phone numbers, physical residential addresses, bank account numbers, and IFSC codes are strictly excluded from all public and unauthenticated APIs ([TEST 78]).

---

## 3. Storage Object Ownership & Signed URLs

Document artifacts (trade photos, tool certifications) uploaded by workers are stored in private S3 buckets:
- Direct public S3 bucket access is blocked (`BlockPublicAcls = true`, `BlockPublicPolicy = true`).
- Access is granted exclusively via pre-signed URLs with a maximum lifespan of 900 seconds (15 minutes).
- Pre-signed URL generation requires verified session authentication and passes an ownership check against the requesting user ID.
