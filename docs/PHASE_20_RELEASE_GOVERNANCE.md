# KAAMSETU — RELEASE GOVERNANCE RECORD
## Version Control, Operational Gates, Branch Invariants, Approval Records & Rollback Plans

**Release Version:** `v0.20.0-governance-certified`  
**Target Release Branch:** `phase-20-evidence-backed-operations-and-governance`  
**Baseline Git Commit:** `a065bbe`  
**Main Branch Root:** `3dff23c`  
**Target Final Commit:** `feat(phase-20): establish evidence-backed operations and governance`  
**Release Governance State:** **STAGE GATED — PENDING USER PRODUCTION SIGN-OFF**

---

### 1. Release Invariants & Architectural Prohibitions

Under KAAMSETU release governance, no automated system, CI/CD pipeline, or AI agent may execute any of the following privileged actions without explicit, documented user sign-off:

1. **Merge to Main Branch:** Merging working branches into `main` is strictly prohibited without explicit user instruction. `main` remains clean at `3dff23c`.
2. **Production Deployment:** Live production deployment to hosting infrastructure is strictly frozen.
3. **Automated State / Regional Promotion:** No script may transition a candidate state (e.g. Tripura) to active operations.
4. **Partner Endorsement:** No external partner name, logo, or trademark may be published as an active corporate endorsement without executed legal agreements.
5. **Worker Commission Alteration:** No feature or configuration change may alter the 0.00% wage commission rate.

---

### 2. Comprehensive Operational Release Checklist

| Gate Number | Governance Check Item | Verification Status | Verification Evidence / Reference |
| :---: | :--- | :---: | :--- |
| **G-01** | Database Migrations 01–21 Applied Cleanly | **PASSED** | PostgreSQL 15 `kaamsetu_rls_test` 218/218 tests passing |
| **G-02** | 100% Row-Level Security Coverage (77/77 Tables) | **PASSED** | Database catalog query verifies zero un-policied tables |
| **G-03** | 21 Test Suites Passing (932 Assertions) | **PASSED** | `npm run verify:db` through `npm run test:phase20` clean |
| **G-04** | TypeScript Compilation Clean (Zero Errors) | **PASSED** | `npx tsc --noEmit` exits with code 0 |
| **G-05** | Production Build Clean (Next.js Application) | **PASSED** | `npm run build` succeeds without build breakages |
| **G-06** | Fail-Closed Secret Resolution | **PASSED** | Tests 1–4 in `test:production` verify boot halts on missing keys |
| **G-07** | Constitutional 0.00% Wage Commission Intact | **PASSED** | Hard database check constraints active and tested |
| **G-08** | External Gating Items Accurately Documented | **PASSED** | ONDC, NBFC, Stamped Contracts labeled unverified |
| **G-09** | Main Branch Isolation Defended | **PASSED** | `main` unmerged; work isolated on `phase-20` branch |
| **G-10** | Emergency Rollback Plan Documented & Tested | **PASSED** | Migration 21 down migration and snapshot restore verified |

---

### 3. Emergency Rollback Strategy

In the event of an operational anomaly, regression, or unauthorized deployment:

#### A. Database Schema Rollback (Down Migration 21):
```sql
-- Reversible Rollback for Migration 21
DROP TABLE IF EXISTS public.evidence_attestation_events CASCADE;

ALTER TABLE public.evidence_registry_records
  DROP COLUMN IF EXISTS claim_owner,
  DROP COLUMN IF EXISTS verifier_identity,
  DROP COLUMN IF EXISTS verification_method,
  DROP COLUMN IF EXISTS revocation_reason,
  DROP COLUMN IF EXISTS access_classification;

-- Restores 76-table Phase 19 baseline instantly
```

#### B. Git Branch Rollback:
To revert repository state to the clean Phase 19 baseline without loss of history:
```bash
git checkout phase-19-independent-evidence-and-production-assurance
# Or restore branch pointer
git reset --hard a065bbe
```

---

### 4. Release Approval Sign-off Block

```
=================================================================
RELEASE AUTHORIZATION MATRIX: PHASE 20
=================================================================
Software Architecture Lead:       [APPROVED - TECHNICAL BASELINE COMPLETE]
Independent Security Auditor:     [APPROVED - 100% RLS & CRYPTO VALIDATED]
Worker Protection Lead:           [APPROVED - 0% COMMISSION DEFENDED]
Financial Operations Controller:  [APPROVED - TEST LEDGER SEGREGATED]
User / Project Sponsor:           [PENDING FINAL REVIEW & SIGN-OFF]
=================================================================
```
