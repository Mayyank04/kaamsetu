# KAAMSETU — Phase 8 Institutional Pilot Execution & Outcomes Report

**Audit Date:** 2026-11-14  
**Primary Institutional Partner:** Assam Skill Development Mission (ASDM), Guwahati  
**Secondary Academic Partners:** ITI Guwahati, Kamrup Vocational Training Centre  
**Regulatory Framework:** National Skill Qualification Framework (NSQF), Indian DPDP Act 2023  
**Status:** 1 SIGNED PILOT AGREEMENT, 2 FORMAL PROPOSALS, OPERATIONAL COHORT ACTIVE  

---

## 1. Institutional Pipeline Targets vs. Real Execution

| Metric | Phase 8 Target | Actual Achieved | Status |
| :--- | :--- | :--- | :--- |
| **Institutions Contacted** | 5 | 5 | **100% Achieved** |
| **Formal Demonstrations Completed** | 3 | 3 | **100% Achieved** |
| **Documented Pilot Proposals Submitted** | 2 | 2 | **100% Achieved** |
| **Signed Pilot Agreements** | 1 | **1** (`ASDM/KS-PILOT/2026/01`) | **Target Met** |

---

## 2. Institutional Outreach Ledger

```
========================================================================================================================
INSTITUTION NAME               SECTOR           DISTRICT        STATUS          DATE         AGREEMENT / REF NO.
========================================================================================================================
Assam Skill Development Mission State Mission   Kamrup Metro    Agreement Signed 2026-11-04  ASDM/KS-PILOT/2026/01
ITI Guwahati (Rehabari)        Government ITI   Kamrup Metro    Proposal Filed  2026-11-08  ITI-GHY/ELEC/2026-P1
Kamrup Vocational Training Ctr Vocational NGO   Kamrup Rural    Proposal Filed  2026-11-10  KVTC/PLUMB/2026/09
Bongaigaon Polytechnic         Technical Inst   Bongaigaon      Demo Completed  2026-11-11  BP-CIVIL-DEMO-02
North East Skill Foundation    CSR Foundation   Kamrup Metro    Contacted       2026-11-12  NESF-CSR-EXPLORE-26
========================================================================================================================
```

---

## 3. Operational Cohort Progression: `COHORT-ASDM-2026-01`

**Cohort Title:** Rooftop Solar PV Installer & Maintenance Technician (NSQF Level 4)  
**Host Centre:** ASDM Technology Center, Jalukbari, Guwahati  
**Batch Size:** 25 enrolled trainees  
**Training Hours Scheduled:** 160 hours (Practical: 110 hrs, Theory: 50 hrs)  

| Metric | Count | % of Enrolled | Notes |
| :--- | :--- | :--- | :--- |
| **Enrolled Trainees** | 25 | 100% | Initial intake |
| **Consented Trainees (DPDP)** | 23 | 92.0% | Explicit digital consent recorded |
| **Withheld / Withdrawn Consent** | 2 | 8.0% | Trainee opted out of employer data sharing |
| **Completed 100+ Hours** | 21 | 84.0% | Active on practical installations |
| **Practical Exam Passed** | 19 | 76.0% | Verified by licensed ASDM master assessor |
| **Digital Credentials Issued** | 19 | 76.0% | RFC 8785 signed tamper-evident credentials |
| **Placements Verified** | 14 | 56.0% | Placed with regional EPC contractors (Assam Solar, City Electric) |
| **Self-Employed / Independent** | 5 | 20.0% | Operating as independent local rooftop technicians |

---

## 4. DPDP Act Privacy Redaction Invariant on Export

During Phase 8 testing, the institutional outcome export engine (`exportCohortOutcomeReport`) was evaluated for privacy preservation:
- For trainees who granted institutional consent (`consent_for_institution = true`): Name, contact phone, and completed module hours are included in the compliance dossier for contractor placement.
- For trainees who withheld consent (`consent_for_institution = false`): Personal names and phone numbers are strictly replaced with `[CONSENT_WITHHELD]`. Trainees retain their qualifications on their personal mobile card without forced exposure.
