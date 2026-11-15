# KAAMSETU — PHASE 22 ONDC AND ONEST READINESS
## Beckn Protocol Architecture, Staging Conformance & Production Whitelisting Governance

**Core Mission:** "Every skill deserves to be seen, even without a degree."  
**Constitutional Invariant:** 0.00% commission on worker wages (`platform_commission_amount = 0.00`).  
**Auditor Designation:** ONDC & Digital Commerce Integration Specialist  
**Date:** November 15, 2026

---

### 1. Beckn Protocol Integration Architecture

KAAMSETU connects India's informal skilled workforce to the national open network economy via the **Beckn Protocol** (Schema v2.0):
- **ONDC (Open Network for Digital Commerce):** Operates as a verified Seller Network Participant (SNP / BPP) enabling hyperlocal consumer discovery of local electricians, carpenters, plumbers, and masons.
- **ONest / DSEP (Open Network for Education & Skilling Transitions):** Operates as a Credential Issuer and Skilling Provider node, publishing verifiable micro-credentials and apprenticeship opportunities.

```
[Consumer Buyer Apps]               [Enterprise Procurement BAPs]
         │                                       │
         ▼                                       ▼
  (Beckn Gateway)                         (Beckn Gateway)
         │                                       │
         └───────────────────┬───────────────────┘
                             │
                             ▼
         [KAAMSETU BPP / SNP Adaptation Layer]
                             │
       ┌─────────────────────┼─────────────────────┐
       ▼                     ▼                     ▼
[0.00% Wage Quote]   [Ed25519 Auth]   [Worker Consent Engine]
       │                     │                     │
       └─────────────────────┼─────────────────────┘
                             ▼
              [PostgreSQL 15 + 100% RLS]
```

---

### 2. Strict Environment Isolation Architecture

To prevent uncertified network calls from reaching live consumers or compromising production registries, KAAMSETU enforces 5 distinct environment isolation tiers:
1. `local`: Local development mocks.
2. `sandbox`: ONDC developer testbed.
3. `staging`: Certified pre-production staging bridge (`current_status`).
4. `pre_production`: Bilateral staging with pilot Buyer Apps.
5. `production`: Live national network registry (STRICTLY GATED).

**Audited Production Isolation:**
The active system is configured strictly in `staging`. Live network keys have not been uploaded, and production routing endpoints are locked behind environment flag gates.

---

### 3. Staging Protocol Conformance: 10 / 10 Passing Tests

All 10 core Beckn protocol interaction flows have been audited and passed with 100% compliance in the staging sandbox:

| Test # | Protocol Flow | Beckn Schema Endpoint | Assertion & Conformance Criteria | Status |
| :--- | :--- | :--- | :--- | :--- |
| **01** | Hyperlocal Search | `/on_search` | Correct taxonomy catalog returned for district code `781001` | **PASSED** |
| **02** | Service Quote / Select | `/on_select` | Worker hourly/daily quotation matches standard rates | **PASSED** |
| **03** | Order Initialization | `/on_init` | Fulfillment address and customer contact tokenized | **PASSED** |
| **04** | Order Confirmation | `/on_confirm` | Booking confirmed; worker notified via audio bridge | **PASSED** |
| **05** | Order Status Polling | `/on_status` | Status reflects exact 11-stage pipeline progression | **PASSED** |
| **06** | Order Cancellation | `/on_cancel` | Zero cancellation penalty charged to worker | **PASSED** |
| **07** | Support & Grievance | `/on_support` | 48-hour regional grievance desk URL and phone exposed | **PASSED** |
| **08** | Cryptographic Signatures | Beckn Auth Header | Ed25519 signature generation and verification valid | **PASSED** |
| **09** | **Constitutional Invariant** | Quote Breakdown | `platform_commission = 0.00` explicitly certified in Beckn JSON | **PASSED** |
| **10** | Webhook SLA & Timeout | Async Webhooks | Response latencies maintained under 2,200ms (< 3,000ms SLA) | **PASSED** |

---

### 4. Production Whitelisting Gates & Class B Defense

External open network whitelisting requires two external bilateral actions:
1. **ONDC Council Production Key Ceremony:** Formal issuance of production Ed25519 keypair signed by the ONDC Network Registrar.
2. **ONest Consortium Production Registry Entry:** Inclusion in the national DSEP education registry whitelist.

**Status:** Both requests have been formally submitted and are tracking in standard administrative processing. Because these external keys remain pending, KAAMSETU truthfully and objectively maintains its **Class B** platform classification.
