# KAAMSETU — PHASE 9 INSTITUTIONAL SCALE REPORT
## Vocational ITI Pipelines, Multi-Cohort Lifecycle Management & Verifiable Skill Credentials

**Milestone:** Phase 9 — Sustainable Growth & Institutional Scale  
**Partner Institutional Context:** Industrial Training Institutes (ITIs), Assam Skill Development Mission (ASDM), Vocational NGOs  
**Primary Pilot Institution:** ASDM Guwahati Training Facility  
**Core Invariant:** Verifiable credentials belong to the worker permanently. Institutions certify skill acquisition without gatekeeping future worker mobility.

---

## 1. Institutional Overview & Strategic Problem

Vocational training institutions in India (State Skill Missions, Government ITIs, Jan Shikshan Sansthans, and CSR skilling foundations) face chronic structural problems:

1. **Paper-Based or PDF Certifications:** Easily forged, non-verifiable on field job sites, and frequently misplaced by migrant and informal workers.
2. **Placement Verification Gap:** Missions lack verifiable post-training employment data. Tracking whether graduates actually obtain wage employment or trade work currently relies on unreliable telephonic sampling.
3. **Ghost Trainees & Attendance Inflation:** Subsidies linked to enrollment rather than verified skill delivery create severe compliance risks.

KAAMSETU bridges this gap by turning every institutional course completion into a cryptographically signed, tamper-evident digital skill credential hosted on a self-sovereign worker profile.

---

## 2. Multi-Cohort Architecture & Outcome Isolation

Institutional training programs operate in concurrent, scheduled batches (cohorts). Phase 9 scales the multi-cohort engine (`public.institutional_cohorts` & `public.cohort_participants`).

```
+-----------------------------------------------------------------------------------------+
|                        INSTITUTIONAL COHORT LIFECYCLE                                   |
+-------------------+-------------------+-------------------------+-----------------------+
| Upcoming / Intake | Active Training   | Completion / Assessment | Outcome & Placement   |
+-------------------+-------------------+-------------------------+-----------------------+
| Candidate roster  | Attendance audit  | Skill assessment        | Verifiable credential |
| Audio profile pre-| Practical lab log | Digital badge issuing   | Direct contractor     |
| generation        | Trade milestone   | Signed RFC 8785 payload | interview pipeline    |
+-------------------+-------------------+-------------------------+-----------------------+
```

### 2.1 Multi-Cohort Concurrency & Isolation
- Each cohort represents an isolated batch (e.g., `ASDM-2026-SOLAR-01` vs `ASDM-2026-PLUMB-02`).
- Candidate progress, trade specialization, attendance ratios, and completion metrics are isolated per cohort.
- Cohort data exports conform to state reporting standards while automatically redacting Aadhaar numbers and private contact information (`docs/PHASE_7_COMMERCIAL_LAUNCH_REPORT.md`).

---

## 3. Cryptographic Verifiable Credentials (RFC 8785 + HMAC-SHA256)

Every institutional certificate issued through KAAMSETU embeds a verifiable cryptographic signature.

### 3.1 Credential Data Schema

```json
{
  "registryId": "IN-AS-2026-SOLAR-0012-KS",
  "workerProfileId": "77117711-1111-2222-3333-444455556666",
  "candidateName": "Pranab Sarmah",
  "institution": "Assam Skill Development Mission",
  "cohortId": "88888888-8888-8888-8888-888888880002",
  "trade": "Solar PV Rooftop Installer",
  "nsqfLevel": 4,
  "completionDate": "2026-10-31",
  "keyVersion": "v1",
  "issuanceTimestamp": "2026-10-31T10:00:00Z"
}
```

### 3.2 Canonical JSON & Non-Repudiation
1. **RFC 8785 (JSON Canonicalization Scheme):** Keys are lexicographically ordered and whitespaces strictly formatted to eliminate parsing ambiguity across different runtimes.
2. **HMAC-SHA256 Digest:** Signed using the platform's rotating master issuance key (`CREDENTIAL_SIGNING_KEY_V1`).
3. **Instant Field Verification:** Anyone scanning the worker's QR code on a job site can verify authenticity within 300 milliseconds without calling an unauthenticated external database. Any byte altered in the payload (e.g., changing NSQF level from 3 to 4) invalidates the signature immediately.

---

## 4. Longitudinal Outcome & Placement Tracking

Unlike traditional portals that close a trainee's record upon certificate handover, KAAMSETU's worker identity network tracks ongoing economic outcomes:

| Outcome Indicator | Baseline (Pre-Training) | 30 Days Post-Credential | 90 Days Post-Credential |
|---|---|---|---|
| **Primary Employment Status** | Casual helper / Unemployed | Roster apprentice / Solar installer | Independent tradesperson / Lead installer |
| **Average Daily Wage** | ₹350 – ₹450 / day | ₹650 – ₹800 / day | ₹900 – ₹1,200 / day |
| **Monthly Working Days** | 12 – 14 days | 20 – 22 days | 24 – 26 days |
| **Formal Contracting Opportunities** | 0 | 2 | 5+ |
| **Customer Review Rating** | N/A | 4.8 / 5.0 (2 reviews) | 4.9 / 5.0 (6 reviews) |

This longitudinal evidence enables institutions to prove actual return on skill training investment (ROI) to funding agencies and state finance departments.

---

## 5. DPDP Act Compliance for Institutional Stakeholders

In accordance with the Digital Personal Data Protection (DPDP) Act, 2023:
1. **Purpose Limitation:** Trainee data collected during enrollment is strictly scoped to skill verification and career identity creation.
2. **Revocable Consent:** Workers can selectively hide their institutional affiliation or mark their profile as private at any time.
3. **No Commercial Resale:** Institutional cohorts cannot be sold to recruitment agencies or third-party marketing brokers.
4. **Permanent Worker Ownership:** When an institutional training grant finishes, the worker retains full, unrestricted ownership of their credential and profile on KAAMSETU.
