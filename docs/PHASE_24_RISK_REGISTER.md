# KAAMSETU — PHASE 24 RISK REGISTER
## Operational, Legal, Financial & Regulatory Risk Matrix

**Repository:** `Mayyank04/kaamsetu`  
**Working Branch:** `phase-24-institutional-gate-closure-and-impact-replication`  
**Evaluation Date:** November 15, 2026  
**Auditor:** Principal Risk Officer & Governance Review Board  

---

### 1. Risk Evaluation Matrix

Risks are scored on Impact (1-5) and Probability (1-5) to determine Severity ($I \times P$):

| Risk ID | Category | Description | Impact | Prob | Severity | Mitigation Strategy | Owner | Status |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- | :--- | :---: |
| **RSK-24-01** | Legal / Institutional | Delay in Tripura State Cabinet approval of TSDM bilateral MoU (`BLOCKER-01`). | 4 | 3 | **12 (Medium)** | Operations in Tripura strictly gated to research-only; maintain liaison with Directorate of Skill Development. | Head of Partnerships | ACTIVE |
| **RSK-24-02** | Technical / Protocol | Delay in ONDC Network Council scheduling production key ceremony (`BLOCKER-02`). | 4 | 2 | **8 (Low)** | Staging network operates stably; protocol compliance certified; awaiting slot with registrar. | CISO & Core Lead | ACTIVE |
| **RSK-24-03** | Enterprise / Legal | Delays in EPC consortium partners executing stamped tripartite agreements (`BLOCKER-03`). | 4 | 3 | **12 (Medium)** | 10-gate framework blocks worker deployment to highway/airport sites until wet-ink contracts executed. | Enterprise B2B Lead | ACTIVE |
| **RSK-24-04** | Worker Protection | Attempts by sub-contractors to deduct tool or transport fees from worker wages. | 5 | 2 | **10 (Medium)** | Contractual zero-deduction covenant, GeM Form B audit, and dual-evidence bank payout verification. | Labor Welfare Officer | MITIGATED |
| **RSK-24-05** | Credit / Finance | Predatory lending clauses or aggressive debt recovery by NBFC financing partners. | 5 | 1 | **5 (Low)** | Strict 14% APR cap, wage lien prohibition, 15-day cooling off, and RBI-regulated partner restriction. | Financial Systems Auditor | MITIGATED |
| **RSK-24-06** | Commercial / Unit Ops | Regional CAC inflation or slowing organic customer acquisition in new clusters. | 3 | 2 | **6 (Low)** | Community word-of-mouth incentives and institutional partnerships reduce reliance on digital ads. | Market Ops Lead | CONTROLLED |
| **RSK-24-07** | Privacy / Regulatory | Regulatory audits under DPDP Act 2023 scrutinizing worker consent mechanisms. | 4 | 1 | **4 (Low)** | Cryptographic consent logging in `worker_consent_audit_events`, selective disclosure, and instant revocation. | Data Privacy Officer | COMPLIANT |

---

### 2. Risk Escalation & Governance Protocols

1. **Immediate Circuit Breakers:** If any sub-contractor attempts to extract commissions from workers, their organization is instantly suspended from Contractor Pro, and their security deposit is frozen.
2. **Bi-Weekly Blocker Review:** The Institutional Assurance Lead reports weekly on counterparty progress for `BLOCKER-01`, `02`, and `03`.
3. **No Unilateral De-escalation:** A risk cannot be marked `CLOSED` or `RESOLVED` without primary documentary evidence uploaded to the evidence registry.
