# KAAMSETU — PHASE 21 / PHASE 20 BASELINE RECONCILIATION
## Traceable Evolution from Evidence Governance to Verified Regional Operations

**Mission:** "Every skill deserves to be seen, even without a degree."  
**Constitutional Invariant:** 0.00% commission on worker wages.  
**Baseline Commit:** `35d4a93` (`feat(phase-20): establish evidence-backed operations and governance`)  
**Parent on Main:** `3dff23c` (`feat(phase-12): establish repeatable national workforce identity network`)  
**Working Branch:** `phase-21-verified-regional-operations-and-institutional-ratification`  
**Reconciliation Date:** November 15, 2026  

---

### 1. Git Baseline & Tree Topology Audit

Before initiating any schema modifications or code additions for Phase 21, the git working tree was inspected and reconciled against historical project baselines:

```
* 35d4a93 (HEAD -> phase-20-evidence-backed-operations-and-governance) feat(phase-20): establish evidence-backed operations and governance
* a065bbe feat(phase-19): establish independent evidence and production assurance
* 7f98144 feat(phase-18): establish live ecosystem partnerships and regional operations
* cd53ec7 feat(phase-17): establish national ecosystem and responsible finance integrations
* 60f4ae6 feat(phase-16): establish independently verified national network operations
* a347ff2 feat(phase-15): establish evidence-backed workforce network growth
* 2255153 feat(phase-14): establish operational proof and trust governance
* f4be849 feat(phase-13): establish national operations and scale verification
* 3dff23c (main) feat(phase-12): establish repeatable national workforce identity network
```

**Reconciliation Verdict:**
- The Phase 20 final commit is verified as `35d4a93`.
- The parent on main is verified at `3dff23c`. The main branch remains cleanly parked, unmodified, and unmerged.
- Branch `phase-21-verified-regional-operations-and-institutional-ratification` was branched directly from `35d4a93`.

---

### 2. Schema Progression & Database Catalog Comparison

| Dimension | Phase 20 Baseline (`35d4a93`) | Phase 21 State | Delta / Justification |
| :--- | :--- | :--- | :--- |
| **Total Public Tables** | 77 tables | **79 tables** | +2 tables (`regional_market_evaluations`, `institutional_ratification_records`) |
| **Public Views** | 1 view (`public_worker_profiles`) | **1 view** (`public_worker_profiles`) | Preserved Aadhaar/phone masking view |
| **Row-Level Security Coverage**| 77 / 77 tables (100.0%) | **79 / 79 tables (100.0%)** | Zero unauthenticated table leakage; 100% RLS maintained |
| **Migrations Applied** | 01 through 21 | **01 through 22** | Migration 22 adds regional evaluation & institutional ratification |
| **Enterprise States** | 7 states | **11 states + 3 terminal** | Added `worker_consent_verified`, `roster_synced`, `deployment_confirmed`, `work_completed`, `wage_payment_documented` |
| **Regional Taxonomy** | 5 states | **8 states** | Added `research`, `candidate`, `readiness_assessment`, `conditionally_ready`, `controlled_pilot`, `active`, `suspended`, `closed` |

---

### 3. Test Suite Regression Defense

All previous test suites were executed against the Phase 21 baseline to confirm zero regression:

| Test Suite | Command | Prior Passing (Phase 20) | Current Passing (Phase 21) | Regression Status |
| :--- | :--- | :--- | :--- | :--- |
| **Backend & DB Verification** | `npm run verify:db` | 218 / 218 | **223 / 223** | **0 regressions** (+5 new assertions) |
| **Phase 20 Test Suite** | `npm run test:phase20` | 100 / 100 | **100 / 100** | **0 regressions** |
| **Phase 21 Test Suite** | `npm run test:phase21` | N/A | **100 / 100** | **New test suite passing** |
| **TypeScript Compilation** | `npx tsc --noEmit` | Clean (0 errors) | **Clean (0 errors)** | **0 type errors** |
| **Next.js Production Build**| `npm run build` | 105 routes clean | **105 routes clean** | **0 build failures** |

---

### 4. Detailed Gap Reconciliation from Phase 20

1. **Enterprise Deployment vs Booking Conflation:**
   - *Phase 20 finding:* Enterprise engagements in `enterprise_pilot_engagements` tracked basic authorization, but lacked fine-grained proof stages separating contract signing, roster sync, physical deployment, and bank wage receipt.
   - *Phase 21 resolution:* Upgraded to the 11-stage enterprise lifecycle (`transitionEnterprisePilotState`) in `src/lib/enterprise/enterprise-pilot-lifecycle-service.ts`. Enforced anti-conflation invariants prohibiting deployment without geofenced telemetry and prohibiting wage documentation without banking UTR.

2. **Numerical Score Overriding Qualitative Gates:**
   - *Phase 20 finding:* Siliguri corridor scored 85.7% but had missing field presence; risks remained that automated tooling might promote it to active based on score alone.
   - *Phase 21 resolution:* Formalized the **Anti-Override Invariant** in `evaluateDistrictReadiness` (`src/lib/regional/regional-operations-service.ts`). A high percentage can never override a failed mandatory qualitative gate.

3. **Institutional Ratification Transparency:**
   - *Phase 20 finding:* External partner statuses were tracked loosely in markdown audit documents.
   - *Phase 21 resolution:* Created `institutional_ratification_records` table with cryptographic SHA-256 evidence digests and strict state transitions enforcing legal entity verification, authorized signatory verification, and non-judicial stamp paper references.
