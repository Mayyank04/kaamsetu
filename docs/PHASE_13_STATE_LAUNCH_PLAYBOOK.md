# KAAMSETU — PHASE 13 STATE LAUNCH PLAYBOOK
## Standardized 12-Milestone Deployment Framework for Repeatable State Launches

**Protocol:** KAAMSETU National Sovereign Skill Identity Protocol  
**Repository:** `Mayyank04/kaamsetu`  
**Branch:** `phase-13-national-operations-scale`  
**Date:** November 15, 2026  
**Author:** National Expansion Lead & Operations Systems Architect  

---

### 1. Purpose & Playbook Philosophy

The KAAMSETU State Launch Playbook provides a repeatable, verifiable operational blueprint for activating new federal states and districts. Rather than improvising regional rollouts, every new operational territory must execute a standardized 12-milestone sequence tracked in `public.regional_launch_milestones`.

Every milestone has:
1. A unique identifier and title.
2. A required completion category (Governance, Technical, Partner, Worker Ops, Commercial, Quality).
3. Explicit verification criteria and audit artifacts.
4. A named accountable owner (`launch_owner_id`).
5. An accountable local institutional partner (`accountable_partner_name`).

---

### 2. The 12-Milestone National Launch Sequence

```
[ Phase 1: Foundation ]
M01: Legal & Inter-State Labor Compliance
M02: Baseline Trade & Labor Market Survey
M03: Institutional MoU & Skilling Body Integration

[ Phase 2: Technical & Linguistic Readiness ]
M04: Vernacular Voice & Localization Pack Certification
M05: Offline Verification & SMS Gateway Low-Bandwidth Testing
M06: Cross-State Corridor & Pincode Mapping

[ Phase 3: Ecosystem Activation ]
M07: Authorized Institutional Signatory Registration
M08: Contractor Council Formation & Wage Floor Covenant
M09: Pilot Worker Cohort Induction (25 Workers)

[ Phase 4: Operational Certification ]
M10: Local Dispute Mediation SLA & Grievance Desk
M11: GST Compliance & Dual-Key Webhook Integration
M12: Soft-Launch Verification Audit (30 Days Zero Incidents)
```

---

### 3. Detailed Milestone Specifications

#### Milestone 01: Legal & Inter-State Labor Compliance
- **Category:** Governance & Compliance
- **Target Days:** Day 1 – Day 15
- **Prerequisites:** State entry proposal approved.
- **Verification Criteria:** Legal audit confirming full compliance with the Inter-State Migrant Workmen Act (1979), the Digital Personal Data Protection Act (2023), and state-specific Shops and Establishments regulations. Confirmation that zero platform wage deductions are mandated by law.
- **Evidence Artifact:** Signed legal opinion memorandum from empanelled state advocate.

#### Milestone 02: Baseline Trade & Labor Market Survey
- **Category:** Field Research
- **Target Days:** Day 10 – Day 25
- **Prerequisites:** Legal clearance.
- **Verification Criteria:** Comprehensive survey covering top 5 blue-collar occupations, prevailing daily wage rates, contractor payment cycles, and tool ownership patterns across target district.
- **Evidence Artifact:** Empirical labor survey report with $\ge 50$ worker and $\ge 10$ contractor interviews.

#### Milestone 03: Institutional MoU & Skilling Body Integration
- **Category:** Institutional Partnerships
- **Target Days:** Day 20 – Day 40
- **Prerequisites:** Survey completed.
- **Verification Criteria:** Bilateral agreement with State Skill Development Mission (SSDM) or Directorate of Technical Education. Formal recognition of KAAMSETU digital identity as acceptable proof of prior learning.
- **Evidence Artifact:** Executed bilateral Memorandum of Understanding (MoU).

#### Milestone 04: Vernacular Voice & Localization Pack Certification
- **Category:** Technical Infrastructure
- **Target Days:** Day 30 – Day 45
- **Prerequisites:** Partner identified.
- **Verification Criteria:** Verification of regional BCP-47 language support (e.g., `bn` for Tripura, `ne` for North Bengal) with ground-truth audio test corpus achieving $>95\%$ skill extraction accuracy and $0\%$ invented experience.
- **Evidence Artifact:** AI extraction benchmark test log across native audio recordings.

#### Milestone 05: Offline Verification & SMS Gateway Low-Bandwidth Testing
- **Category:** Technical Infrastructure
- **Target Days:** Day 40 – Day 55
- **Prerequisites:** Regional infrastructure provisioned.
- **Verification Criteria:** Validation of SMS OTP delivery within 12 seconds over 2G edge networks. Verification that offline QR card scanning correctly validates RFC 8785 signatures without internet access.
- **Evidence Artifact:** Network resilience test report in low-connectivity clusters.

#### Milestone 06: Cross-State Corridor & Pincode Mapping
- **Category:** Field Operations
- **Target Days:** Day 45 – Day 60
- **Prerequisites:** Localization complete.
- **Verification Criteria:** Complete directory mapping of all postal pincodes in the district to regional operational hubs. Identification of common transit corridors for inter-district work.
- **Evidence Artifact:** Pincode database migration and travel radius validation matrix.

#### Milestone 07: Authorized Institutional Signatory Registration
- **Category:** Cryptographic Identity
- **Target Days:** Day 50 – Day 65
- **Prerequisites:** MoU executed.
- **Verification Criteria:** Registration of institutional signatories in `public.institution_authorized_signatories` with 256-bit public key fingerprints and designated credential issuance authority.
- **Evidence Artifact:** Key ceremony audit log with verified SHA-256 fingerprints.

#### Milestone 08: Contractor Council Formation & Wage Floor Covenant
- **Category:** Commercial Operations
- **Target Days:** Day 55 – Day 70
- **Prerequisites:** Partner and corridor mapping complete.
- **Verification Criteria:** Onboarding of initial 5 licensed contractor organizations. Written agreement adhering to prevailing statutory minimum wages and platform transparency rules.
- **Evidence Artifact:** Signed contractor charters and verified organizational profiles.

#### Milestone 09: Pilot Worker Cohort Induction (25 Workers)
- **Category:** Worker Operations
- **Target Days:** Day 60 – Day 75
- **Prerequisites:** Infrastructure and contractor council ready.
- **Verification Criteria:** In-person onboarding of 25 skilled workers via voice-first registration. Issuance of free physical QR cards. Affirmative consent recorded for profile discovery.
- **Evidence Artifact:** Cohort registry roster with verified credentials and 100% consent audit logs.

#### Milestone 10: Local Dispute Mediation SLA & Grievance Desk
- **Category:** Worker Protection
- **Target Days:** Day 65 – Day 80
- **Prerequisites:** Pilot cohort active.
- **Verification Criteria:** Local grievance mechanism operational with designated ombudsman. Automated 7-day mediation SLA configured and tested against simulated dispute workflow.
- **Evidence Artifact:** Operational dispute test execution and mediation roster.

#### Milestone 11: GST Compliance & Dual-Key Webhook Integration
- **Category:** Financial Operations
- **Target Days:** Day 70 – Day 85
- **Prerequisites:** Commercial launch approved.
- **Verification Criteria:** State-specific GST identification number (GSTIN) registered. Tax calculation verified for intra-state (CGST+SGST) vs inter-state (IGST). Dual API keys rotated without downtime.
- **Evidence Artifact:** Financial audit test report and tax reconciliation invoice sample.

#### Milestone 12: Soft-Launch Verification Audit (30 Days Zero Incidents)
- **Category:** Release Certification
- **Target Days:** Day 85 – Day 115
- **Prerequisites:** Milestones 01–11 completed.
- **Verification Criteria:** 30 consecutive days of operational activity with the pilot cohort: zero wage disputes unresolved beyond SLA, zero critical security incidents, and readiness scorecard $\ge 85/100$.
- **Evidence Artifact:** Signed Regional Activation Certificate by Expansion Committee.

---

### 4. Implementation Playbook Template in Code

The playbook template is automated via `initializeRegionalMilestones(regionId, client)` in `src/lib/regions/regional-operations-service.ts`. When a new operational territory is created, all 12 milestones are instantiated automatically into `public.regional_launch_milestones` with default status `pending`.

Progress is audited continuously, driving the computed `readiness_score` in `public.operational_regions`.
