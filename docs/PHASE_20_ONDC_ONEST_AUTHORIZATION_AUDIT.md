# KAAMSETU — ONDC & ONEST AUTHORIZATION AUDIT
## Open Network Protocols, Staging Conformance, Production Whitelisting & Key Ceremonies

**Protocol Standards:** Open Network for Digital Commerce (ONDC BPP / Beckn Protocol v1.2), Open Network for Education and Skilling Transformations (ONest / DSEP Protocol v2.0)  
**Current Operating Classification:** `awaiting_approval`  
**Service Implementation:** `src/lib/ecosystem/ondc/ondc-onboarding-service.ts`, `src/lib/ecosystem/onest/onest-live-service.ts`

---

### 1. Protocol Architecture & Integration Truth

KAAMSETU implements open digital network adapters enabling informal workers to discover opportunities and receive employment requests without vendor lock-in.

However, an engineering test passing in a staging sandbox environment does **NOT** equal live network authorization. Live network traffic requires signed participant agreements and production whitelisting keys from network registry governing councils.

```
+-----------------------------------------------------------+
|                   KAAMSETU Adapter Stack                  |
+-----------------------------------------------------------+
       |                                           |
       v                                           v
[ONDC BPP Adapter]                        [ONest DSEP Adapter]
  Beckn Protocol 1.2                        DSEP Schema 2.0
       |                                           |
       v                                           v
Staging Sandbox: PASS                      Staging Sandbox: PASS
Production Key: AWAITING APPROVAL          Production Key: AWAITING APPROVAL
```

---

### 2. ONDC BPP Integration Audit

#### Staging Conformance Evaluation:
- **Search & Discovery (`/search`, `/on_search`):** PASSED. Successfully publishes local trade guild catalogs (e.g. Guwahati Electrical Guild) conforming to `nic2004:52110`.
- **Selection & Order Flow (`/select`, `/init`, `/confirm`):** PASSED. Validates transaction context, BAP callback URIs, and fulfillment objects.
- **Ed25519 Cryptographic Key Ceremony:** PASSED. Implemented RFC 8032 Ed25519 asymmetric signing for request authorization headers.
- **Worker Wage Invariant:** PASSED. Service fee itemization reflects 0% commission on worker labor rates.

#### Production Whitelisting Status:
- Participant Agreement submitted to ONDC Council.
- Category Whitelisting Request: Local Services & Informal Workforce.
- **Status:** **`awaiting_approval`**. Production routing remains locked until the ONDC Registry Council issues live signing keys.

---

### 3. ONest / DSEP Skilling & Opportunity Audit

#### Conformance Evaluation:
- **DSEP Schema 2.0 Mapping:** PASSED. Maps informal apprenticeship opportunities, NSQF certification programs, and trade cohort records.
- **Decentralized Discovery (`dsep:jobs`, `dsep:courses`):** PASSED. Validates context headers and encrypted provider metadata.
- **Worker Data Sovereignty Defense:** PASSED. Protects worker profile attributes from unauthorized mutation by external network aggregators.

#### Consortium Key Status:
- DSEP Network Consortium membership initiated.
- **Status:** **`awaiting_approval`**. Production network routing remains gated pending live consortium production key distribution.

---

### 4. Key Management & Client-Side Isolation

Cryptographic private signing keys (`ed25519_signing_private_key`, `secp256k1_identity_key`) are isolated inside secure server-side infrastructure.

**Security Verification:**
- Zero private keys are bundled with client-side Next.js JavaScript artifacts.
- No environment variable prefixed with `NEXT_PUBLIC_` contains private cryptographic material.
- Signature verification utilizes timing-safe byte equality comparisons to prevent side-channel timing attacks.

---

### 5. Audit Verdict & Invariant Defense

| Network | Sandbox Conformance | Security Audit | Council Production Key | Operational Classification |
| :--- | :--- | :--- | :--- | :--- |
| **ONDC BPP** | 100% (10/10 Tests Passed) | PASS | Pending Council Issuance | `awaiting_approval` |
| **ONest DSEP** | 100% (Schema 2.0 Validated) | PASS | Pending Consortium Keys | `awaiting_approval` |

*Governing Rule: Live consumer orders from ONDC/ONest will not be routed until official production whitelisting keys are received and validated.*
