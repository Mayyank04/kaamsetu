# KAAMSETU — PHASE 28 BLOCKER-02 (ONDC / ONEST) ASSURANCE
## Production Network Gateway Review, Key Ceremony Requirements & Staging Isolation

**Gate Code:** `BLOCKER-02`  
**Counterparty:** Open Network for Digital Commerce (ONDC) / Open Network for Education and Skilling Transformations (ONest)  
**Authoritative Operational State:** `APPROVED` (External Status: `approved_pending_execution`)  
**Platform Action:** Class A Promotion Refused; Production Gateway Kept Gated Pending Key Ceremony

---

## 1. Network Integration Context

KAAMSETU has architected full protocol adapters for the Beckn/ONDC protocol and the ONest educational/skilling taxonomy. Through these adapters, registered artisans can be discovered on buyer applications (BAP) nationwide while receiving job requests directly to their sovereign identity wallets.

During Phase 26 and Phase 27, technical interoperability was established and verified in the ONDC staging sandbox environment.

---

## 2. Gate Verification & Lifecycle Tracking

### Auditable Transition History for BLOCKER-02

| Step | Timestamp | Previous State | New State | Authorized By | Evidence Link / Instrument |
| :---: | :--- | :--- | :--- | :--- | :--- |
| 1 | 2026-07-20 | `IDENTIFIED` | `EVIDENCE_REQUESTED` | Integration Architect | ONDC Integration Agreement Application |
| 2 | 2026-09-05 | `EVIDENCE_REQUESTED` | `UNDER_REVIEW` | Tech Lead | Sandbox Compliance Test Suite Passed |
| 3 | 2026-11-02 | `UNDER_REVIEW` | `APPROVED` | ONDC Network Manager | ONDC Pre-Production Staging Clearance #ONDC-STG-992 |

### Current Status: `APPROVED` (Pending Execution)

While ONDC technical certification is complete and formal approval has been granted, the protocol requires an in-person, dual-custody **Production Root Key Ceremony** before production network credentials and network registry routing entries are activated.

As demonstrated in [TEST 13] of `test:phase28`, the system strictly prohibits routing live production traffic through ONDC adapters until:
1. The hardware security module (HSM) production signing keys are generated during the formal key ceremony.
2. The network registry signs the Kaamsetu BPP subscriber certificate.
3. Both the Infrastructure Controller and the Information Security Officer co-sign the activation manifest.

---

## 3. Strict Boundary Controls & Staging Isolation

Because `BLOCKER-02` remains `approved_pending_execution`:
1. **Network Boundary:** The ONDC production gateway URL (`api.ondc.org/bpp/kaamsetu`) returns HTTP 503 with header `X-Gate-Status: PENDING_PRODUCTION_KEY_CEREMONY`.
2. **Staging Sandbox Isolation:** Staging tests operate exclusively within the ONDC staging sandbox (`staging.gateway.ondc.org`). Staging subscriber keys are strictly barred from production clusters.
3. **Zero Production Dispatch via ONDC:** 0 live consumer bookings have been processed via ONDC buyer applications.
4. **Invariant Defense:** Even when live, ONDC transactions cannot deduct platform wage commission (`platform_commission_amount = 0.00`). Buyer finder fees (if any) are paid exclusively by employers or buyers.

### Path to Closure

1. Complete the ONDC Production Key Signing Ceremony with ONDC network officers.
2. Store Ed25519 root subscriber keys in production HSM.
3. Advance `BLOCKER-02` from `APPROVED` to `EXECUTED` via dual authorization.

Until the key ceremony is completed, `BLOCKER-02` remains **BLOCKED**.
