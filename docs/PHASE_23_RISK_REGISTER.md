# KAAMSETU — PHASE 23 RISK REGISTER
## Production Transition, External Counterparty Dependencies & Regulatory Risk Matrix

**Core Mission:** "Every skill deserves to be seen, even without a degree."  
**Constitutional Invariant:** 0.00% commission on worker wages (`platform_commission_amount = 0.00`).  
**Auditor Designation:** Principal Systems Auditor & Enterprise Risk Lead  
**Date:** November 15, 2026

---

### 1. Risk Quantification Methodology

Risks are evaluated on a standard $5 \times 5$ Impact and Likelihood matrix:
- **Severity Score:** $\mathbf{Score} = \mathbf{Impact\text{ (1–5)}} \times \mathbf{Likelihood\text{ (1–5)}}$
- **Classification:** Low (1–5), Medium (6–12), High (15–20), Critical (21–25).

---

### 2. Comprehensive Institutional Risk Register

| Risk ID | Risk Domain | Risk Event & Description | Pre-Score | Mitigation Strategy | Post-Score | Risk Owner |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **RSK-01** | **Institutional** | ONDC Council production key ceremony delayed beyond Q1 2027. | $4 \times 4 = 16$ (High) | Keep staging isolated; maintain Class B classification; zero live claims. | $4 \times 2 = 8$ (Med) | Open Network Lead |
| **RSK-02** | **Institutional** | Tripura State Cabinet reshuffle delays TSDM MoU execution. | $3 \times 4 = 12$ (Med) | Keep Tripura gated in `candidate_research`; prioritize ASDM Phase II expansion. | $3 \times 1 = 3$ (Low) | State Partnerships Lead |
| **RSK-03** | **Commercial** | NHIDCL Regional Office leadership transfer delays stamped paper contract. | $4 \times 3 = 12$ (Med) | Use GeM Contract Form B standard templates; maintain pilot in `blocked` state. | $4 \times 1 = 4$ (Low) | Enterprise B2B Lead |
| **RSK-04** | **Financial** | NBFC partner attempts hidden fee or aggressive collection on tool finance. | $5 \times 3 = 15$ (High) | Strict non-recourse covenants; statutory 3-day cooling-off; zero wage garnishment. | $5 \times 1 = 5$ (Low) | Responsible Finance Lead |
| **RSK-05** | **Regulatory** | DPDP 2023 consent withdrawal disputes by enterprise contractors. | $5 \times 2 = 10$ (Med) | Section 6(4) instant one-tap revocation API; preserves credentials without data loss. | $5 \times 1 = 5$ (Low) | DPDP Privacy Architect |
| **RSK-06** | **Operational** | Severe Northeast monsoon flash floods disrupt field artisan matching. | $4 \times 4 = 16$ (High) | SROP-12 automated weather protocol triggers emergency job halt in flood zones. | $4 \times 2 = 8$ (Med) | Regional Field Lead |
| **RSK-07** | **Technical** | Primary-to-replica PostgreSQL streaming replication lag exceeds 5s SLA. | $4 \times 2 = 8$ (Med) | Real-time Prometheus alerting; automated failover to multi-region standby replica. | $4 \times 1 = 4$ (Low) | Lead SRE |
| **RSK-08** | **Security** | Distributed credential signature forgery attempt using weak keys. | $5 \times 2 = 10$ (Med) | RFC 8785 Canonical JSON + HMAC-SHA256 with 256-bit entropy enforcement. | $5 \times 1 = 5$ (Low) | Information Security Lead |

---

### 3. Monitoring & Circuit-Breaker Protocols

- **Weekly Executive Risk Review:** The Enterprise Operations Committee reviews all risks with residual scores $\ge 6$.
- **Automated Circuit Breaker:** If regional grievance resolution exceeds the 48-hour SLA or if an unconsented worker is assigned to an enterprise roster, automated job matching for that contractor is paused immediately pending ombudsman sign-off.
