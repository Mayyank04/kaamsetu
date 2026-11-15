# KAAMSETU Phase 27 Remediation Register
## Technical, Financial, Cryptographic & Institutional Remediation Tracking

**Evaluation Context:** November 2026  
**Governance Level:** Production Transition & Institutional Gate Closure

---

## 1. Remediation Tracking Register

| Remediation ID | Category | Description | Priority | Responsible Owner | Target Timeline | Acceptance Criteria | Dependencies |
|---|---|---|---|---|---|---|---|
| **REM-27-01** | Financial | Direct Core-Banking / UPI Settlement Feed Integration | High | Financial Systems Controller | Q1 2027 | Automated bank statement ingestion matching internal ledger to ₹0.00 | Nodal bank partner escrow API approval |
| **REM-27-02** | Infrastructure | Live Production Disaster Recovery Drill | High | Production Operations Lead | Q1 2027 | Maintenance window execution achieving RTO <= 30m and RPO <= 60s in production | Off-peak cohort scheduling |
| **REM-27-03** | Cryptographic | Offline Mobile CRL / Status List Synchronization | Medium | Mobile Client Lead | Q1 2027 | Mobile verifier app caches compressed bloom filter of revoked credentials | W3C StatusList2026 endpoint |
| **REM-27-04** | Institutional | TSDM Bilateral MoU State Cabinet Ratification (`BLOCKER-01`) | High | Institutional Partnerships Lead | Q1 2027 | Signed bilateral instrument with Tripura State Gazette notification | Tripura Cabinet legislative calendar |
| **REM-27-05** | Institutional | ONDC & ONest Production Key Ceremony (`BLOCKER-02`) | High | Lead Cryptographic Architect | Q1 2027 | Physical/HSM ceremony completion and live listing in ONDC Registry | ONDC Network Operations scheduling |
| **REM-27-06** | Institutional | EPC Tripartite Artisan Contract Execution (`BLOCKER-03`) | High | Regional Operations Director | Q1 2027 | Executed tripartite agreements with NHIDCL JV and site safety insurance | Legal counsel review completion |
| **REM-27-07** | Governance | Off-Host WORM Checkpoint Publishing | Medium | Infrastructure Security Lead | Q1 2027 | Automated daily sync of `audit_chain_checkpoints` to immutable S3 Object Lock | AWS Compliance Lock policy |

---

## 2. Governance Invariants

1. **No Waiver of Institutional Prereqs:** Neither REM-27-04, REM-27-05, nor REM-27-06 may be reclassified as "internal software readiness" or waived by executive fiat.
2. **Worker Protection Gate:** Heavy infrastructure dispatches under REM-27-06 remain blocked by the 10-gate framework until all safety indemnifications and wage guarantees are stamped.
