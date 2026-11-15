# KAAMSETU — PHASE 21 INSTITUTIONAL RATIFICATION REGISTER
## Formal Instruments, Open Network Whitelisting & Counterparty Due Diligence

**Mission:** "Every skill deserves to be seen, even without a degree."  
**Database Table:** `public.institutional_ratification_records` (100% RLS Enabled)  
**Governing Axiom:** "A partner is not verified because its name appears in a database. No platform promotion to production status without authentic counterparty instruments."  
**Register Audit Date:** November 15, 2026  

---

### 1. Institutional Counterparty Register

The following register documents the legal, technical, and operational ratification status of all external institutional counterparties connected to the KAAMSETU platform:

| Counterparty Code | Legal Entity Name | Category | Instrument Type | Verification Evidence / Reference | Execution Status | Active in Prod |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`GOV-ASDM-01`** | Assam Skill Development Mission | `state_skill_mission` | `institutional_mou` | Bilateral MoU on Rs 100 stamp paper (`ASDM/KAAMSETU/MOU/2026/01`) | **`stamped_and_executed`** | **YES** |
| **`ONDC-BPP-ADAPTER`** | Open Network for Digital Commerce | `open_network_ondc` | `network_whitelisting_key` | 10/10 staging protocol tests passed; council production key ceremony pending | **`counterparty_pending`** | **NO (Staging Only)** |
| **`ONEST-DSEP-ADAPTER`**| ONest DSEP Workforce Consortium | `open_network_onest` | `network_whitelisting_key` | DSEP Schema 2.0 conformance certified in sandbox; production key pending | **`counterparty_pending`** | **NO (Sandbox Only)** |
| **`NBFC-FIN-01`** | North East Micro & Tool Finance NBFC | `regulated_nbfc` | `tripartite_lsp_agreement` | RBI 2022 KFS & APR (13.5%) verified; tripartite LSP agreement in legal review | **`legal_review`** | **NO (Staging Only)** |

---

### 2. Detailed Counterparty Audits

#### A. Assam Skill Development Mission (`GOV-ASDM-01`)
- **Legal Entity Verification:** Ministry of Skill Development & Entrepreneurship / Govt. of Assam agency.
- **Authorized Signatory:** Mission Director, ASDM.
- **Instrument Reference:** `ASDM/KAAMSETU/MOU/2026/01` (Executed on Rs 100 non-judicial stamp paper, Kamrup Registry).
- **Effective Term:** January 15, 2026 to January 14, 2028.
- **Operational Scope:** Data interoperability for candidate skill tracking, recognition of prior learning (RPL) assessment scheduling, and state employment exchange registry sync.
- **Audit Verdict:** Fully executed and active.

#### B. Open Network for Digital Commerce (`ONDC-BPP-ADAPTER`)
- **Legal Entity Verification:** Section 8 company under DPIIT, Ministry of Commerce & Industry.
- **Technical Conformance:** 10/10 Beckn protocol sandbox tests passing (search, on_search, select, on_select, init, on_init, confirm, on_confirm, status, on_status).
- **Current Limitation:** Awaiting Council Production Key Ceremony.
- **Governance Constraint:** Live production routing is strictly gated at the gateway middleware. Live commercial transactions on ONDC are blocked until production keys are signed and verified in the registry.
- **Audit Verdict:** Counterparty Pending (Production Whitelisting Pending).

#### C. ONest DSEP Consortium (`ONEST-DSEP-ADAPTER`)
- **Legal Entity Verification:** Open Network for Education & Skilling Transformation consortium.
- **Technical Conformance:** DSEP Schema 2.0 conformance verified. Job and apprenticeship search catalogs formatted.
- **Current Limitation:** Production consortium registry token pending Q1 council onboarding.
- **Governance Constraint:** Live student/trainee discoverability is active in sandbox only.
- **Audit Verdict:** Counterparty Pending (Production Whitelisting Pending).

#### D. Regulated NBFC Partner (`NBFC-FIN-01`)
- **Legal Entity Verification:** Reserve Bank of India registered Non-Banking Financial Company (Scale Based Regulation - Middle Layer).
- **Compliance Audit:** Complies fully with RBI Digital Lending Guidelines (2022):
  - Key Fact Statement (KFS) generated before loan agreement.
  - Annual Percentage Rate (APR) capped at 13.5% (strictly $\le 14.0\%$).
  - Minimum 3-day look-up / cooling-off period with zero prepayment penalty.
  - Direct disbursement to tool vendor escrow; zero intermediary deductions.
- **Current Limitation:** Bilateral Tripartite LSP (Lending Service Provider) agreement between NBFC, KAAMSETU, and Scheduled Commercial Escrow Bank is currently undergoing final review by bank legal counsel.
- **Governance Constraint:** Live loan origination is completely disabled in the UI and API until wet-ink stamped execution.
- **Audit Verdict:** Legal Review (Live Lending Blocked).

---

### 3. State Machine Transition Invariants

The `transitionRatificationStatus` domain service enforces mathematical barriers preventing improper elevation:
1. **No Execution Without Signatory Proof:** Transition to `stamped_and_executed` or `production_whitelisted` is rejected if `legalEntityVerified` or `authorizedSignatoryVerified` is false.
2. **Mandatory Stamped Paper Reference:** Transition to `stamped_and_executed` requires a non-empty non-judicial stamp paper reference number.
3. **Mandatory Production Key:** Transition to `production_whitelisted` requires a verifiable cryptographic key identifier issued by the network council.
4. **Cryptographic Checksum:** Every status change generates an immutable SHA-256 evidence hash capturing institution code, status, stamp reference, and production key.
