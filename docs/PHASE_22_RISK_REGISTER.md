# KAAMSETU — PHASE 22 RISK REGISTER
## Institutional, Operational, Regulatory & Technical Risk Mitigation Framework

**Core Mission:** "Every skill deserves to be seen, even without a degree."  
**Constitutional Invariant:** 0.00% commission on worker wages (`platform_commission_amount = 0.00`).  
**Auditor Designation:** Principal Systems Auditor & Enterprise Risk Lead  
**Date:** November 15, 2026

---

### 1. Risk Governance Taxonomy

Risks are quantified on a standard $5 \times 5$ Impact and Likelihood matrix:
- **Severity Score:** $\mathbf{Score} = \mathbf{Impact\text{ (1–5)}} \times \mathbf{Likelihood\text{ (1–5)}}$
- **Classification:** Low (1–5), Medium (6–12), High (15–20), Critical (21–25).

---

### 2. Comprehensive Institutional Risk Register

| Risk ID | Domain | Risk Description | Pre-Score | Mitigation Strategy | Post-Score | Risk Owner |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **RSK-01** | **Institutional** | ONDC Council production key ceremony delayed beyond Q4 2026. | $4 \times 4 = 16$ (High) | Maintain staging sandbox testing; continue bilateral review; do not claim Class A. | $4 \times 2 = 8$ (Med) | Open Network Lead |
| **RSK-02** | **Regional** | Siliguri transit corridor helpdesk physical lease execution stalled. | $3 \times 4 = 12$ (Med) | Enforce anti-override lock; keep Siliguri at `conditionally_ready`; zero commercial matching. | $3 \times 1 = 3$ (Low) | Field Ops Controller |
| **RSK-03** | **Regulatory** | DPDP 2023 consent challenge by third-party contractor or employer. | $5 \times 2 = 10$ (Med) | One-tap consent revocation API; zero credential loss; complete public PII masking. | $5 \times 1 = 5$ (Low) | Privacy Architect |
| **RSK-04** | **Financial** | Enterprise EPC pilot contractor delays direct wage disbursement. | $5 \times 3 = 15$ (High) | 11-stage pilot lifecycle locks stage 10 until bank UTR verified; 48h grievance desk shields worker. | $5 \times 1 = 5$ (Low) | Worker Protection Lead |
| **RSK-05** | **Operational** | Severe Northeast monsoon flooding disrupting physical job execution. | $4 \times 4 = 16$ (High) | SROP-12 automated weather protocol halts matching; protects workers from safety risks. | $4 \times 2 = 8$ (Med) | Regional Field Lead |
| **RSK-06** | **Technical** | Primary-to-replica PostgreSQL replication lag exceeding 5s SLA. | $4 \times 2 = 8$ (Med) | Continuous Prometheus streaming replication alerts; automatic read-replica failover. | $4 \times 1 = 4$ (Low) | Lead SRE |
| **RSK-07** | **Commercial** | Long enterprise B2B SaaS procurement cycles delaying ARR expansion. | $3 \times 3 = 9$ (Med) | Pre-approved GeM Contract Form B templates; low-barrier Contractor Pro tier (₹1.5L/yr). | $3 \times 2 = 6$ (Med) | Commercial Ops Lead |
| **RSK-08** | **Legal** | State skill mission leadership turnover (e.g. ASDM / TSDM transfers). | $4 \times 3 = 12$ (Med) | Institutionalized non-exclusive MoUs signed at Secretary level; valid through Dec 2027. | $4 \times 1 = 4$ (Low) | Partnership Lead |

---

### 3. Monitoring & Incident Escalation Protocol

- **Weekly Risk Review:** The Executive Operations Committee reviews all open risks with post-scores $\ge 6$.
- **Automatic Circuit Breakers:** If any regional grievance exceeds the 48-hour resolution SLA, regional matching for that trade guild is automatically paused pending ombudsman sign-off.
- **Auditor Independence:** Independent assurance engineers possess unilateral authority to flag records in `audit_evidence_review_events` as `challenge_flagged`.
