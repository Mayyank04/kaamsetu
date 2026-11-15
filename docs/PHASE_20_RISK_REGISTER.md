# KAAMSETU — RISK REGISTER (PHASE 20)
## Multi-Pillar Risk Classification (P0–P3), Ownership, Remediation Strategy & Gating Status

**Audit Reference:** Phase 20 Evidence-Backed Operations & Governance Audit  
**Assessment Date:** November 15, 2026  
**Auditor:** Principal Software Architect & Institutional Assurance Team

---

### Risk Severity Legend

- **P0 (Critical / Release-Blocking):** Fundamental risk to worker welfare, regulatory breach, data loss, or legal liability. Precludes unconstrained production launch.
- **P1 (High):** Significant dependency on external institutional counterparty; requires formal gating.
- **P2 (Medium):** Operational or performance limitation managed under controlled regional pilot.
- **P3 (Low):** Minor technical debt, documentation refinement, or UX enhancement.

---

### 1. Active Risk Register

| Risk ID | Severity | Pillar | Description of Risk | Assigned Owner | Mitigation & Compensating Control | Release-Blocking? |
| :---: | :---: | :--- | :--- | :--- | :--- | :---: |
| **RSK-20-01** | **P1** | Enterprise Contracts | Two EPC enterprise pilots (Assam & Meghalaya) lack executed non-judicial stamped paper agreements. | Lead Commercial Counsel | Gated in `partner_unverified`. Zero live production routing permitted until wet-ink contracts executed. | **YES (For Enterprise GA)** |
| **RSK-20-02** | **P1** | Network Protocols | ONDC BPP adapter passes staging sandbox tests but lacks official council production whitelisting signing key. | Head of Ecosystem Interoperability | Operating status locked to `awaiting_approval`. Adapter disallows live order processing without valid council keys. | **YES (For Live ONDC GA)** |
| **RSK-20-03** | **P1** | Responsible Finance | NBFC tool financing lacks an executed Tripartite LSP Agreement required under RBI September 2022 Guidelines. | Financial Inclusion Directorate | Classified as `sandbox_validated`. Code strictly blocks credit origination or disbursement. | **YES (For Loan Origination)** |
| **RSK-20-04** | **P1** | Regional Expansion | Tripura regional activation lacks an executed institutional MoU with Tripura Skill Development Mission (TSDM). | Regional Expansion Director | Scored at 57.1% and strictly classified as `gated_in_research`. Contractor recruitment prohibited. | **YES (For Tripura Launch)** |
| **RSK-20-05** | **P2** | Commercial Settlement | Merchant bank clearing (NEFT/RTGS settlement) operates in simulated test ledger; live bank accounts unlinked. | Financial Controller | `commercial-settlement-service.ts` segregates test ledger from cash accounting. Requires authentic UTR for clearance. | **NO (Controlled Pilot)** |
| **RSK-20-06** | **P2** | Regional Expansion | Siliguri transit corridor is scored at 85.7% but lacks a physical field office lease and local nodal coordinator. | North Bengal Operations Lead | Overall status held at `conditionally_ready` / `pilot_candidate` in accordance with the Anti-Override Invariant. | **NO (Controlled Transit Pilot)** |
| **RSK-20-07** | **P2** | Disaster Recovery | Secondary standby cluster (Hyderabad) tested in synthetic drills; cross-region streaming WAL latency subject to transit blips. | Infrastructure Reliability Lead | Circuit breaker trips to half-open on lag $> 5.0$s. Automated backup snapshots verified daily. | **NO (Within RTO/RPO SLA)** |
| **RSK-20-08** | **P3** | Worker Sovereignty | Informal workers in low-connectivity hill tracts face occasional SMS OTP gateway latency. | Mobile UX & Communications | Offline-first sync queues and local cryptographic credential caching implemented in Migration 03/06. | **NO** |

---

### 2. Summary of Gating Items for National General Availability (Class A)

To transition KAAMSETU from **Class B (National Expansion Ready — Controlled Rollout)** to **Class A (Independently Evidence-Verified Controlled Operations)**, four specific external gating conditions must be formally retired:

1. **Retire RSK-20-01:** Secure executed agreements on non-judicial stamp paper from EPC enterprise partners in Assam and Meghalaya.
2. **Retire RSK-20-02:** Receive official production whitelisting keys from the ONDC Registry Council.
3. **Retire RSK-20-03:** Execute the Tripartite LSP Agreement between KAAMSETU, the candidate NBFC, and the escrow trustee bank.
4. **Retire RSK-20-04:** Execute the state-level institutional MoU with TSDM for Tripura expansion.
