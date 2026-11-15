# KAAMSETU — PHASE 13 WORKER IDENTITY STANDARD
## Schema 2.2 Specification: Granular Selective Disclosure, Portable Cryptographic Dossiers & Anti-Lock-in Architecture

**Standard:** KAAMSETU Sovereign Worker Identity Specification 2.2  
**Repository:** `Mayyank04/kaamsetu`  
**Branch:** `phase-13-national-operations-scale`  
**Date:** November 15, 2026  
**Auditor / Author:** Identity Standards Lead & Cryptographic Systems Architect  

---

### 1. Specification Overview & Evolution

The KAAMSETU Worker Identity Standard defines the JSON data model, cryptographic integrity envelope, and access governance rules for portable blue-collar worker dossiers.

```
SCHEMA 2.0 (Phase 10)
  ├── Basic Demographics & Trade Specialisation
  ├── KaamScore & Provenance Work Records
  └── RFC 8785 Canonical JSON + HMAC-SHA256 Signature

SCHEMA 2.1 (Phase 12)
  ├── Interstate Mobility Parameters (travelWillingness)
  ├── Offline Scannable Bitmap Payload
  └── Mandatory Revocation Caveat Notice

SCHEMA 2.2 (Phase 13 - Current)
  ├── Granular Field-Level Selective Disclosure Toggles
  ├── Multi-Factor Institutional Signatory Fingerprints
  └── Strict Revocation Expiry & Dynamic Consent Renewal
```

The standard strictly prohibits proprietary lock-in. Dossiers are self-contained, offline-verifiable, and can be exported as cryptographically verifiable JSON documents conforming to national W3C Verifiable Credentials and India DPDP Act portability guidelines.

---

### 2. Schema 2.2 Document Model

A Schema 2.2 dossier consists of 6 top-level blocks:

```json
{
  "$schema": "https://kaamsetu.in/schemas/v2.2/worker-identity.json",
  "schemaVersion": "2.2",
  "dossierId": "dossier_ks_2026_9948271a",
  "issuedAt": "2026-11-15T00:30:00.000Z",
  "expiresAt": "2027-11-15T00:30:00.000Z",
  "identitySubject": {
    "registryId": "IN-AS-2026-1301-KS",
    "fullName": "Bipul Kalita",
    "primaryTrade": "Industrial Electrician",
    "yearsExperience": 8,
    "operationalTerritory": {
      "state": "Assam",
      "district": "Kamrup Metropolitan",
      "city": "Guwahati",
      "pincode": "781005"
    },
    "travelWillingness": "adjacent_districts",
    "languages": ["as", "en", "hi"]
  },
  "trustAndReputation": {
    "kaamScore": 830,
    "kaamScoreLevel": 4,
    "totalCompletedJobs": 48,
    "averageRating": 4.92,
    "aadhaarVerified": true,
    "digilockerLinked": true
  },
  "verifiedCredentials": [
    {
      "credentialId": "KST-INST-4-8A2C8862",
      "tradeTitle": "Solar PV Installer",
      "nsqfLevel": 4,
      "issuingInstitution": "Assam State Skilling Mission",
      "authorizedSignatoryFingerprint": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      "issuedAt": "2026-06-15T10:00:00.000Z",
      "status": "active"
    }
  ],
  "selectiveDisclosureProfile": {
    "shareContactPhone": false,
    "shareContactEmail": false,
    "shareGovernmentId": false,
    "shareDailyRate": true,
    "shareWorkHistory": true,
    "shareSkillAssessments": true
  },
  "offlineVerificationSummary": {
    "cachedAt": "2026-11-15T00:30:00.000Z",
    "cacheExpiresAt": "2026-11-22T00:30:00.000Z",
    "revocationCheckDisclaimer": "Offline verification reflects status at cache sync. Revocation may occur subsequently. Always verify online for high-value contracts.",
    "signature": "a1b2c3d4e5f6..."
  },
  "proof": {
    "type": "JsonWebSignature2020",
    "created": "2026-11-15T00:30:00.000Z",
    "verificationMethod": "did:kaamsetu:keys:v1",
    "jws": "eyJhbGciOiJIUzI1NiJ9..."
  }
}
```

---

### 3. Granular Selective Disclosure Engine

To protect blue-collar workers from commercial spam, predatory wage underbidding, and identity theft, Schema 2.2 introduces the **Selective Disclosure Engine** (`applySelectiveDisclosure` in `src/lib/interop/identity-interop-v2-2.ts`).

Workers control their data visibility through `public.worker_privacy_settings`:

| Privacy Flag | Default | Protected Data Attributes | Redaction Behavior |
|---|---|---|---|
| `share_contact_phone` | `false` | Mobile telephone number | Completely stripped from JSON; masked (`+91-XXXXX-XXXXX`) in UI |
| `share_contact_email` | `false` | Electronic mail address | Omitted from identity payload |
| `share_government_id` | `false` | Aadhaar / Voter ID references | Replaced with boolean verification flag (`aadhaarVerified: true`) |
| `share_daily_rate` | `true` | Preferred wage expectations | Redacted to prevent contractor price-fixing |
| `share_work_history` | `true` | Itemized prior project records | Aggregated to job count and rating summary |
| `share_skill_assessments` | `true` | Detailed institutional evaluation rubrics | Retains credential title and NSQF level only |

#### Verification in Phase 13 Test 7:
Worker privacy settings were asserted against live database storage. When all three sensitive flags were disabled:
- `phone` was purged.
- `rates` were withheld.
- `identity numbers` were eliminated.
- Core skilling credentials and KaamScore remained verifiable.

---

### 4. Consent Lifecycle & Instant Revocation

Data disclosures are governed by cryptographic access grants in `public.worker_identity_access_grants`:
1. **Time-Bounded Grants**: Each grant carries an explicit `expires_at` timestamp (default: 30 days).
2. **Dynamic Renewal**: Grants may be extended only with affirmative worker interaction.
3. **Instant Revocation**:
   - The worker may click "Revoke Access" at any moment.
   - The status updates to `revoked` and `revoked_at` is stamped.
   - Subsequent verification requests using the grant token immediately return `HTTP 403 Forbidden` (`grant_revoked`).

This lifecycle was independently validated in Phase 13 Test 8.

---

### 5. Offline Verification & The Mandatory Revocation Caveat

Because blue-collar work frequently occurs in underground mines, rural tea gardens, or telecom blackspots, KAAMSETU cards carry a high-density QR code embedding a signed Schema 2.2 offline summary.

However, offline verifications cannot contact live revocation lists. To prevent fraudulent use of revoked credentials:
1. Every offline payload embeds a strict 7-day cache TTL (`cacheExpiresAt`).
2. Every offline payload embeds an explicit legal disclaimer notice:
   > *"Offline verification reflects status at cache sync. Revocation may occur subsequently. Always verify online for high-value contracts."*
3. Verifier applications are required to present this caveat prominently to the verifier whenever internet connectivity is absent.

This invariant was verified in Phase 13 Test 11.
