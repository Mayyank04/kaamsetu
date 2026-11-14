# KAAMSETU — PHASE 13 INSTITUTIONAL ECOSYSTEM
## Institutional Partnerships, State Skilling Mission Governance, Cohort Lifecycle & DPDP Compliance

**Protocol:** KAAMSETU Institutional Interoperability Framework  
**Repository:** `Mayyank04/kaamsetu`  
**Branch:** `phase-13-national-operations-scale`  
**Date:** November 15, 2026  
**Auditor / Author:** Institutional Integration Director & Public Policy Specialist  

---

### 1. Ecosystem Overview & Mandate

KAAMSETU bridges the historic divide between formal vocational training institutions and real-world employment. In India, hundreds of thousands of trainees complete short-term skilling programs annually through State Skill Development Missions (SSDMs), Industrial Training Institutes (ITIs), and polytechnics, but struggle to prove their competencies to contractors on job sites.

KAAMSETU transforms physical certificates into portable, cryptographically signed, QR-verifiable skill identities that workers retain across employers, districts, and states.

---

### 2. Verified Institutional Partners & Operational Memoranda

| Institution Code | Organization Name | State / District | Institution Type | Partner Status | Verification Status | Executed MoU Scope |
|---|---|---|---|---|---|---|
| `INST-AS-ASDM` | Assam Skill Development Mission (ASDM) | Assam (Kamrup Metro) | State Mission | Operational | Verified | Solar PV, Electrical, Plumbing credentials |
| `INST-ML-MSSDS` | Meghalaya State Skills Development Society (MSSDS) | Meghalaya (East Khasi Hills) | State Mission | Operational | Verified | Construction Carpentry, Masonry credentials |
| `INST-TR-TSSDM` | Tripura State Skill Development Mission | Tripura (West Tripura) | State Mission | Candidate | Pending Verification | Baseline exploratory framework |

Institutional records are governed by `public.institutions` and `public.institutional_cohorts`.

---

### 3. Institutional Cohort & Trainee Progression Lifecycle

Institutions manage vocational cohorts through a 5-stage student progression lifecycle:

```
1. ENROLLED
   └── Student admitted to training course (e.g. Solar PV Installer, NSQF Level 4)
2. TRAINING_IN_PROGRESS
   └── Trainee actively attending theory and practical workshops
3. ASSESSMENT_ATTEMPTED
   └── Formal third-party Sector Skill Council assessment undertaken
4. ASSESSMENT_PASSED
   └── Trainee successfully clears theory, practical, and viva examinations
5. CREDENTIAL_ISSUED
   └── Tamper-evident credential generated and anchored on KAAMSETU
```

#### Trainee Placement Tracking:
Post-credential issuance, the cohort tracking engine monitors job outcomes:
- `employer_introduced`: Trainee matched to verified contractor project.
- `placement_confirmed`: Trainee completes 30+ days of employment, confirming real-world placement.

---

### 4. DPDP Act Compliance & Learner Consent Invariant

To comply with Section 6 of the Digital Personal Data Protection Act (2023), institutional credential issuance requires affirmative learner consent:

```typescript
if (!learnerConsentObtained) {
  throw new Error("DPDP Compliance Error: Institutional credential cannot be issued without affirmative learner consent.");
}
```

- When a training institution publishes a batch of credentials, the platform verifies `learner_consent_obtained = true`.
- If a trainee withholds consent, their credential is not linked to their public profile or made discoverable to contractors.
- Trainees may inspect, export, or request rectification of their institutional training records at any time.

Verified in Phase 11 Test 19 and Phase 13 Test 7.

---

### 5. Institutional Partner API Architecture

Institutions integrate their student information systems via authenticated REST endpoints:

- `POST /api/institution/signatories`: Registers authorized signing officials with SHA-256 key fingerprints.
- `POST /api/institution/cohorts`: Creates and manages vocational training batches.
- `POST /api/institution/credentials`: Issues NSQF-aligned credentials signed by verified signatories.
- `GET /api/institution/cohorts/[id]/export`: Generates privacy-redacted cohort outcome reports for government compliance.
- `POST /api/institution/sandbox/verify`: Validates credential issuance logic in a sandbox environment without affecting production registries.

All API routes enforce strict rate limiting and role-based privilege checks.
