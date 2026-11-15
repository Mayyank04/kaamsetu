# KAAMSETU — PHASE 24 INSTITUTIONAL BLOCKER CLOSURE
## Authoritative Register and Resolution Lifecycle for Mandatory Class A Blockers

**Repository:** `Mayyank04/kaamsetu`  
**Working Branch:** `phase-24-institutional-gate-closure-and-impact-replication`  
**Evaluation Date:** November 15, 2026  
**Auditor:** Institutional Assurance Lead & Chief Legal Officer  

---

### 1. Executive Context & Anti-Masking Policy

Under KAAMSETU's governance charter, software readiness cannot substitute for bilateral institutional authority. The platform's classification policy strictly dictates:
> **An unexecuted bilateral agreement cannot be treated as executed.**  
> **A staging sandbox key cannot be treated as a production network key.**  
> **A scoping workshop cannot be treated as a stamped master service agreement.**  
> **If any mandatory institutional counterparty dependency is pending, Class A promotion is strictly prohibited.**

Phase 24 establishes the **Authoritative Blocker Register** in database table `public.institutional_blocker_evaluations` to track the exact lifecycle of all outstanding Class A dependencies.

---

### 2. The 8-State Blocker Resolution Lifecycle

Each blocker progresses through a defined, sequential 8-stage lifecycle:

```
[1. registered]
       │
       ▼
[2. scoping_completed]
       │
       ▼
[3. draft_circulated]
       │
       ▼
[4. counterparty_legal_review]
       │
       ▼
[5. cabinet_or_council_pending]
       │
       ▼
[6. approved_pending_execution]
       │
       ▼
[7. executed_active] ────► (Resolved for Class A Gate)
       │
       ▼
[8. blocked] ───────────► (Escalated to Institutional Review Board)
```

1. `registered`: Blocker identified and assigned an authoritative tracking code.
2. `scoping_completed`: Joint working group establishes technical, operational, and legal scope.
3. `draft_circulated`: Master agreement or protocol draft circulated among stakeholders.
4. `counterparty_legal_review`: Counterparty legal counsel reviewing clauses (indemnity, wage escrow, zero-commission invariant).
5. `cabinet_or_council_pending`: Awaiting sovereign Cabinet, Council, or Board meeting agenda and approval.
6. `approved_pending_execution`: Formal approval granted; wet-ink or digital signature ceremony scheduled.
7. `executed_active`: Fully signed, stamped, registered instrument active in production.
8. `blocked`: External dependency halted, rejected, or renegotiation required.

---

### 3. Authoritative Blocker Register

#### Blocker 01: TSDM Bilateral MoU & Government Cabinet Approval
- **Blocker Code:** `BLOCKER-01`
- **Counterparty Name:** Tripura Skill Development Mission (TSDM), Directorate of Skill Development, Govt. of Tripura
- **Current Status:** `cabinet_or_council_pending`
- **Underlying Instrument Ref:** `TSDM/EXP/2026/MOU-DRAFT-04`
- **Responsible Internal Owner:** Head of Institutional Partnerships & Legal Compliance
- **External Counterparty Owner:** Director of Skill Development, Govt. of Tripura
- **Blocking Rationale:** While technical integrations with ASDM in Assam are fully operational, operations in Tripura remain restricted to research-only mode until a formal bilateral MoU is notified under Tripura State Cabinet sanction.
- **Resolution Criteria:** Formal publication of the Cabinet Gazette notification or wet-ink executed bilateral MoU uploaded to the institutional evidence registry with cryptographic hash verification.
- **Current Progress:** Draft 04 vetted by state legal department; currently queued on the State Cabinet agenda.

#### Blocker 02: ONDC & ONest Production Key Ceremony & Registry Listing
- **Blocker Code:** `BLOCKER-02`
- **Counterparty Name:** Open Network for Digital Commerce (ONDC) Council & ONest Consortium Registry
- **Current Status:** `approved_pending_execution`
- **Underlying Instrument Ref:** `ONDC/PROD/CEREMONY/2026-Q4`
- **Responsible Internal Owner:** Chief Information Security Officer & Core Infrastructure Lead
- **External Counterparty Owner:** ONDC Technical Operations Lead & ONest Working Group Convenor
- **Blocking Rationale:** All 10/10 Beckn 2.0 protocol tests and Ed25519 authentication flows are verified in staging (`staging.ondc.org`). Live transaction routing requires root production Ed25519 signing keys issued during an official key generation ceremony.
- **Resolution Criteria:** KAAMSETU's production Ed25519 public key listed in the official ONDC Production Network Registry with status `ACTIVE`.
- **Current Progress:** Staging compliance certified; key ceremony date requested with the ONDC Network Registrar.

#### Blocker 03: National Highway (NHIDCL) & Airport EPC Pilot Stamped Agreements
- **Blocker Code:** `BLOCKER-03`
- **Counterparty Name:** National Highways & Infrastructure Development Corp (NHIDCL) & Shillong Airport EPC Consortium
- **Current Status:** `counterparty_legal_review`
- **Underlying Instrument Ref:** `EPC/NHIDCL-SHL/PILOT-2026-REV3`
- **Responsible Internal Owner:** Head of Enterprise Partnerships & Labor Welfare Officer
- **External Counterparty Owner:** Chief General Manager (Technical), NHIDCL & Project Director, EPC Lead Partner
- **Blocking Rationale:** Deployment of skilled worker cohorts on active civil infrastructure construction sites cannot proceed without physical stamped tripartite contracts establishing worker insurance, wage escrow accounts, and zero wage deduction guarantees.
- **Resolution Criteria:** Physical non-judicial stamped paper contracts executed with corporate board resolutions and dedicated bank escrow accounts verified by audit.
- **Current Progress:** Tripartite draft Revision 3 circulated; EPC consortium legal counsel reviewing wage indemnity clauses.

---

### 4. Gate Readiness Evaluation & Remediation Plan

```typescript
// Deterministic Gate Assessment Logic from institutional-blocker-service.ts
const gateAssessment = assessInstitutionalGateReadiness(CANONICAL_CLASS_A_BLOCKERS);
// Result:
// allResolved = false
// activeBlockerCount = 3
// gateVerdict = "RETAIN_CLASS_B_CONTROLLED_ROLLOUT"
```

| Blocker | Estimated Remediation Horizon | Dependencies | Target Closure Milestone |
| :--- | :--- | :--- | :--- |
| **BLOCKER-01 (TSDM)** | 4-6 Weeks | State Cabinet meeting schedule | Phase 25 Gate Closure |
| **BLOCKER-02 (ONDC)** | 2-3 Weeks | Key ceremony slot with ONDC Registrar | Phase 25 Gate Closure |
| **BLOCKER-03 (EPC)** | 3-5 Weeks | Consortium board resolution execution | Phase 25 Gate Closure |

**Classification Policy Enforcement:** As long as any of these 3 blockers remains in a state other than `executed_active`, KAAMSETU will remain classified as **Class B: National Expansion Ready (Controlled Rollout)**.
