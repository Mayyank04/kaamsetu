# KAAMSETU — PHASE 23 ONDC PRODUCTION READINESS
## Beckn Protocol Architecture, Production Key Ceremony Checklist & Network Whitelisting Governance

**Core Mission:** "Every skill deserves to be seen, even without a degree."  
**Constitutional Invariant:** 0.00% commission on worker wages (`platform_commission_amount = 0.00`).  
**Auditor Designation:** ONDC & Digital Commerce Integration Specialist  
**Date:** November 15, 2026

---

### 1. Open Network Architecture

KAAMSETU operates as a verified Seller Network Participant (SNP / BPP) under the **Open Network for Digital Commerce (ONDC)** protocol standards (Beckn Schema v2.0).

```
   [ONDC Buyer Network Apps]  (e.g., Paytm, Magicpin, Pincode)
              │
              ▼
    (ONDC Beckn Gateway)
              │
              ▼
   [KAAMSETU BPP Adapter Layer]
              │
   ┌──────────┴──────────┐
   ▼                     ▼
[/on_search]         [/on_confirm]
(0.00% Wage Quote)   (Ed25519 Signature)
```

---

### 2. ONDC Production Whitelisting Checklist

| Readiness Checkpoint | Technical Specification | Current Status | Audit Verification |
| :--- | :--- | :--- | :--- |
| **Subscriber Identity (FQDN)** | `bpp.kaamsetu.in` with TLS 1.3 | **CONFIGURED** | DNS & SSL certificate validated |
| **Beckn Schema 2.0 Compliance**| 7 core endpoints (`/search` to `/support`) | **PASSED (10/10)** | Staging sandbox tests pass |
| **Asymmetric Cryptography** | Ed25519 payload signing & verification | **TESTED** | Keypair generation & auth headers |
| **0.00% Commission Invariant** | `platform_commission = 0.00` in quote breakup | **ENFORCED** | Verified across all Beckn quotations |
| **Replay & Idempotency** | Unique UUID `transaction_id` & `message_id` | **ENFORCED** | Replay attacks fail closed |
| **Webhook Latency SLA** | Asynchronous response $< 3,000\text{ms}$ | **PASSED (2,200ms)**| Within network performance benchmark |
| **Data Minimization** | Zero raw Aadhaar or PAN in Beckn payloads | **VERIFIED** | Strips sensitive PII from catalogs |
| **Production Key Ceremony** | ONDC Network Registrar wet-ink/KMS key | **BLOCKED** | Awaiting ONDC Council formal ceremony |

---

### 3. Production Gateway Blocking Rationale

While the technical software adapter, JSON schemas, cryptographic signing, and staging test suites are 100% complete, **live production traffic remains blocked**.

- **Outstanding External Dependency:** Formal execution of the ONDC Production Registry key ceremony by the ONDC Council.
- **Truthful Claim Boundary:** KAAMSETU processes simulated and staging network orders in developer sandboxes. It does **not** process live retail consumer orders on the national network until the production key ceremony is completed.
