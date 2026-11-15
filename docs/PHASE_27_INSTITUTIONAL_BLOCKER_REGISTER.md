# KAAMSETU Phase 27 Institutional Blocker Register
## External Institutional Dependencies, 6-Stage Blocker Lifecycle & Anti-Masking Policy

**Evaluation Context:** November 2026  
**Implementation Source:** [institutional-blocker-service.ts](file:///Users/mayankgautam/Desktop/stitch_kaamsetu_digital_identity_platform/src/lib/governance/institutional-blocker-service.ts)  
**Database Migration:** [20261115000026_temporal_integrity_and_blocker_state_machine.sql](file:///Users/mayankgautam/Desktop/stitch_kaamsetu_digital_identity_platform/supabase/migrations/20261115000026_temporal_integrity_and_blocker_state_machine.sql)

---

## 1. Blocker Governance & Anti-Masking Policy

KAAMSETU enforces a strict **Anti-Masking Policy**:
> Institutional approvals, government MoUs, network key ceremonies, and commercial tripartite contracts are real-world external legal events. The platform cannot grant itself external approvals. No institutional blocker may be marked resolved without an authenticated, legally binding instrument executed by external counterparties.

---

## 2. Institutional Blocker Register

| Field | BLOCKER-01: TSDM Bilateral MoU | BLOCKER-02: ONDC Production Ceremony | BLOCKER-03: EPC Tripartite Contracts |
|---|---|---|---|
| **Blocker Code** | `BLOCKER-01` | `BLOCKER-02` | `BLOCKER-03` |
| **Title** | TSDM Bilateral MoU & Government Cabinet Approval | ONDC & ONest Production Key Ceremony & Registry Listing | EPC Tripartite Artisan Contracts & Site Safety Authorization |
| **External Counterparty** | Tripura Skill Development Mission (TSDM), Directorate of Skill Development, Govt. of Tripura | Open Network for Digital Commerce (ONDC) Council & ONest Consortium Registry | National Highways & Infrastructure Development Corp (NHIDCL) & EPC JV Lead |
| **Current Lifecycle Status** | `cabinet_or_council_pending` | `approved_pending_execution` | `counterparty_legal_review` |
| **Underlying Instrument Ref** | `TSDM/EXP/2026/MOU-DRAFT-04` | `ONDC/PROD/CEREMONY/2026-Q4` | `EPC/NHIDCL-SHL/PILOT-2026-REV3` |
| **Last Verified Evidence** | Inter-departmental committee approval minutes (2026-10-18) | ONDC Staging test transaction report #STG-9912 | Draft agreement circulated to NHIDCL legal counsel (2026-10-22) |
| **Evidence Expiry** | 2026-12-31 | 2026-12-31 | 2026-12-15 |
| **Required Next Action** | State Cabinet formal resolution and wet-ink bilateral execution | Execution of production key ceremony and live subscriber registry listing | Legal sign-off, tripartite stamping, and site safety protocol issuance |
| **External Owner** | Director of Skill Development, Govt. of Tripura | ONDC Network Operations & Key Ceremony Custodian | Chief General Manager (Projects), NHIDCL Regional Office Shillong |
| **Internal Remediation Owner** | Head of Institutional Partnerships & Legal Compliance | Principal Cryptographic Architect & Network Integration Lead | Regional Operations Director & Worker Safety Assurance Lead |
| **Authorization Requirements** | Tripura State Cabinet Notification | Cryptographic HSM production ceremony authorization | Tripartite wet-ink / e-stamp agreement |
| **Risks of Premature Activation** | Unauthorized deployment in Tripura; legal liability under state procurement acts | Network-wide transaction failure; cryptographic key invalidation | Worker safety liability on heavy infrastructure sites without mandatory worker cover |

---

## 3. Blocker Lifecycle State Machine

The database trigger `validate_blocker_lifecycle_transition` enforces strict progressive linearity:
$$\text{identified} \longrightarrow \text{diligence} \longrightarrow \text{counterparty\_review} \longrightarrow \text{approved\_pending\_execution} \longrightarrow \text{executed} \longrightarrow \text{operationally\_verified}$$

Terminal and exception states (`rejected`, `withdrawn`, `expired`, `suspended`, `blocked`) require explicit administrative justification recorded in `public.institutional_blocker_transition_audit_logs`.

---

## 4. Class A Gate Impact

Because all three blockers represent mandatory external dependencies, their unclosed status strictly precludes Class A certification:
- **Blockers Active:** 3 of 3
- **Gate Recommendation:** `RETAIN_CLASS_B_CONTROLLED_ROLLOUT`
- **Class A Status:** **PROHIBITED**
