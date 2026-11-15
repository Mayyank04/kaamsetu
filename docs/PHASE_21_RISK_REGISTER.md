# KAAMSETU — PHASE 21 RISK REGISTER
## Operational Dependencies, Institutional Gating & Mitigation Strategies

**Mission:** "Every skill deserves to be seen, even without a degree."  
**Review Period:** Phase 21 Execution  
**Governance Invariant:** No risk may be concealed, deferred, or reclassified without an identifiable mitigation owner and evidence review.  
**Audit Date:** November 15, 2026  

---

### 1. Active Risk Matrix

| Risk ID | Risk Domain | Description | Impact | Prob. | Severity | Mitigation Strategy | Owner | Review Cadence |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`RSK-21-01`** | Institutional | **ONDC Council Production Key Delay:** Network council key ceremony delayed beyond Q1 2027. | High | Med | **HIGH** | Maintain staging sandbox testing; continue direct booking operations; do not advertise ONDC in consumer marketing. | Open Network Lead | Bi-Weekly |
| **`RSK-21-02`** | Financing | **NBFC Escrow Bank Legal Review Friction:** Commercial bank legal review of Tripartite LSP agreement takes > 60 days. | Med | Med | **MEDIUM** | Strict UI gating prevents any worker loan origination; promote tool self-procurement guidance without credit dependency. | Financial Controller | Weekly |
| **`RSK-21-03`** | Regional | **Siliguri Commercial Office Lease Impasse:** Commercial landlord negotiations in Hill Cart Road drag out. | Med | Low | **MEDIUM** | Enforce Anti-Override Invariant; maintain `conditionally_ready` status; explore alternate IT park incubation space. | Regional Ops Lead | Weekly |
| **`RSK-21-04`** | Enterprise | **Enterprise Wet-Ink Stamp Contract Turnaround:** NHIDCL contractor delays physical stamp paper execution. | Med | Med | **MEDIUM** | Maintain `partner_unverified` state; do not deploy workers to site casting yard until contract is executed. | Enterprise Architect | Weekly |
| **`RSK-21-05`** | Institutional | **Tripura TSDM Bureaucratic Inertia:** Assembly session or cabinet shuffle delays TSDM RPL MoU. | Low | High | **LOW** | Keep Tripura strictly gated in `candidate` research; zero commercial exposure; focus resources on Assam/Meghalaya anchors. | Regional Strategist | Monthly |
| **`RSK-21-06`** | Workforce | **Migrant Worker Circular Churn in Transit Corridor:** Seasonal workers move across states without notifying platform. | Med | Med | **MEDIUM** | Automatic 30-day inactivity toggle to `available = false`; sovereign portable credentials remain valid offline via QR. | Field Ops Lead | Bi-Weekly |
| **`RSK-21-07`** | Infrastructure | **Inter-Region Cloud Network Partition:** WAN latency spikes between Mumbai and Hyderabad clusters. | High | Low | **MEDIUM** | Asynchronous streaming WAL with 5-second boundary; quorum-based fencing prevents split-brain promotion. | Lead SRE | Continuous |
| **`RSK-21-08`** | Privacy | **DPDP 2023 Consent Audit Scrutiny:** Regulatory inquiry into informal worker voice consent legality. | High | Low | **MEDIUM** | Vernacular audio recordings with biometric OTP timestamp stored in encrypted audit vault with verifiable consent trail. | Privacy Auditor | Monthly |

---

### 2. Risk Retirement Triggers

1. **Retirement of `RSK-21-01`:** Formal issuance and cryptographic verification of `ONDC-PROD-KEY-ED25519-2026-KAAMSETU-01` in the live ONDC Network Registry.
2. **Retirement of `RSK-21-02`:** Execution of tripartite agreement on non-judicial stamp paper bearing wet-ink signatures of NBFC, Escrow Bank, and KAAMSETU.
3. **Retirement of `RSK-21-03`:** Registered lease deed executed for permanent coordination office in Siliguri and verified by independent on-site audit.
4. **Retirement of `RSK-21-04`:** Scanned and verified non-judicial stamp paper agreement uploaded with corporate signatory resolution for `ent-epc-as-01`.
