# KAAMSETU — PHASE 28 REMEDIATION REGISTER
## Tracking Remediations, Operational Deficiencies & Action Item Resolutions

**Evaluation Context:** December 2026  
**Auditor:** Quality & Remediation Lead

---

## 1. Phase 28 Action Item Register

| Item ID | Classification | Defect / Operational Need | Resolution in Phase 28 | Verification |
| :--- | :---: | :--- | :--- | :--- |
| **REM-28-01** | Database Schema | Need for formal multi-tier appeals tribunal for worker grievances | Added `public.worker_dispute_appeals` in Migration 29 | Verified via `verify:db` & [TEST 40] |
| **REM-28-02** | Independent Audit | Tracking third-party external auditor attestations and digests | Added `public.independent_audit_attestations` in Migration 29 | Verified via `verify:db` & [TEST 68] |
| **REM-28-03** | Disaster Recovery | Conflation of staging DR with live production DR | Added `public.production_dr_execution_log` & boundary segregation | Verified via [TEST 75, 79, 81] |
| **REM-28-04** | Immutability | Need for non-retaliation triggers on worker dispute filings | Implemented `trg_dispute_appeal_non_retaliation` trigger | Verified via [TEST 66] |
| **REM-28-05** | Manifest Reproducibility | Adding Migration 29 threatened Phase 27 manifest hash | Scoped `computeMigrationsDirectoryDigest` to preserve P27 digest bit-for-bit | Verified via [TEST 5] |
| **REM-28-06** | Financial Audit | Lack of standardized 15-field bridge items for all 517 jobs | Built `TransactionReconciliationBridgeItem` & generator | Verified via [TEST 25] |

---

## 2. Outstanding Remediations (External Dependency)

1. **TSDM Bilateral Instrument:** Awaiting Tripura State Cabinet notification (`BLOCKER-01`).
2. **ONDC Production Gateway:** Awaiting scheduled root key signing ceremony (`BLOCKER-02`).
3. **EPC Master Agreement Execution:** Awaiting counterparty legal sign-off and stamp-duty payment (`BLOCKER-03`).
