# KAAMSETU — PHASE 23 ONEST PRODUCTION REGISTRY READINESS
## Open Network for Education & Skilling Transitions (ONest / DSEP) Architecture & Registry Governance

**Core Mission:** "Every skill deserves to be seen, even without a degree."  
**Constitutional Invariant:** 0.00% commission on worker wages (`platform_commission_amount = 0.00`).  
**Auditor Designation:** ONest / DSEP Interoperability Specialist  
**Date:** November 15, 2026

---

### 1. ONest / DSEP Architecture

KAAMSETU integrates with the **Open Network for Education and Skilling Transitions (ONest)** powered by the **Decentralised Secondary Education Protocol (DSEP)**:
- Acts as a **Verifiable Credential Issuer** and **Skilling Provider Node**.
- Enables informal artisans to discover verified micro-skilling courses and apprenticeships.
- Enables vocational training graduates from state missions (e.g., ASDM) to publish cryptographically signed trade credentials to the national network.

---

### 2. The Three Integration Tiers

To ensure complete transparency, KAAMSETU strictly segregates its testing and operational layers into 3 distinct tiers:

```
┌─────────────────────────────────┐
│ 1. Mocked Contract Tests        │  --> PASSED (Schema & JSON-LD validation)
└────────────────┬────────────────┘
                 ▼
┌─────────────────────────────────┐
│ 2. Sandbox Integration Tests    │  --> PASSED (Bilateral staging testbed)
└────────────────┬────────────────┘
                 ▼
┌─────────────────────────────────┐
│ 3. Production Connectivity      │  --> BLOCKED (Awaiting Consortium Key)
└─────────────────────────────────┘
```

1. **Mocked Contract Tests:** Validates DSEP v1.0.0 API schemas, W3C Verifiable Credential data models, and local cryptographic signature verification (`test:crypto`).
2. **Sandbox Integration Tests:** End-to-end transaction discovery and quote flows executed against the ONest staging testbed.
3. **Production Connectivity Tests:** Live connectivity against the production national DSEP registry.
   - **Current Status: BLOCKED.** Live network credentials have not been issued by the ONest Consortium.

---

### 3. Trainee Consent & Verifiable Presentation Protocol

Under DPDP Act 2023 principles:
- No credential or trainee record is published to ONest without an explicit cryptographic consent grant from the worker.
- Credentials follow the **W3C Verifiable Credentials Data Model v1.0**:
  - Encodes trade competency, NSQF level, issuing authority, and issuance timestamp.
  - Excludes raw government identifiers (Aadhaar/PAN).
  - Can be presented selectively to prospective employers without disclosing unrelated historical work logs.
