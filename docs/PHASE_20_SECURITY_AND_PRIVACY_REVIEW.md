# KAAMSETU — SECURITY & PRIVACY REVIEW
## Threat Modeling, RLS Enforcement, Penetration Scenarios, DPDP Compliance & Attack Mitigation

**Security Posture:** 100% Row-Level Security Enabled Across All 77 Public Tables  
**Data Protection Baseline:** Digital Personal Data Protection Act, 2023 (DPDP Act)  
**Authentication Standard:** Fail-Closed JWT Validation with Persistent Distributed Rate Limiting

---

### 1. Threat Modeling & Defense-in-Depth

The KAAMSETU security architecture is designed to defend against malicious actors attempting to exploit informal workers, manipulate wage ledgers, or access unauthorized enterprise data.

```
+───────────────────────────────────────────────────────────+
|                        Edge Layer                         |
|  - TLS 1.3 Strict HTTPS Only                              |
|  - Distributed Persistent Rate Limiting (Redis / DB RPC)  |
|  - WAF Bot & Brute Force Defense                          |
+───────────────────────────────────────────────────────────+
                             │
                             ▼
+───────────────────────────────────────────────────────────+
|                     Application Layer                     |
|  - Fail-Closed Secret Resolution                          |
|  - PII Masking & Aadhaar Pattern Scrubbers                |
|  - Role-Based Access Control (RBAC)                       |
|  - Timing-Safe HMAC Cryptographic Verification            |
+───────────────────────────────────────────────────────────+
                             │
                             ▼
+───────────────────────────────────────────────────────────+
|                      Database Layer                       |
|  - PostgreSQL 15 with 100% Row-Level Security (77 Tables) |
|  - Multi-Tenant Organization Isolation Policies           |
|  - Immutable Audit Event Tables (evidence_attestation)    |
|  - Zero-Commission Check Constraints                      |
+───────────────────────────────────────────────────────────+
```

---

### 2. Attack Simulation Results (Penetration Scenarios)

In Phase 20, ten critical attack scenarios were simulated and verified in automated tests:

| Attack Scenario | Simulated Action | Defensive Invariant | Result |
| :--- | :--- | :--- | :--- |
| **1. Self-Attestation Escalation** | Claim owner submits attestation certifying their own record as `independently_verified`. | `validateAttestationConflict()` detects identical identities and throws conflict error. | **BLOCKED** |
| **2. Contractor Wage Manipulation**| Contractor attempts to verify own disputed wage payment record without worker concurrence. | `isMilestoneCertifiableWithDisputes()` freezes milestone while dispute is active. | **BLOCKED** |
| **3. Cross-Tenant Data Leakage** | Contractor Org A attempts to query roster of Contractor Org B via direct API injection. | RLS tenant isolation policy filters query to `organization_id = auth.jwt().org_id`. | **BLOCKED** |
| **4. Public Aadhaar Exposure** | Actor attempts to submit raw 12-digit Aadhaar number in public evidence record summary. | Regex scrubber rejects string containing 12-digit government identity pattern. | **BLOCKED** |
| **5. Credential Signature Tampering**| Attacker modifies NSQF level in JSON payload and presents original HMAC signature. | Canonical hash comparison fails; `verifyCredentialSignature()` returns `isValid: false`. | **BLOCKED** |
| **6. Retaliatory Review Poisoning**| Contractor posts 1-star review immediately following worker filing unpaid wage dispute. | Database trigger sets `is_retaliatory_suspected = true`, quarantining review score. | **BLOCKED** |
| **7. Webhook Replay Attack** | Attacker intercepts valid payment capture webhook and resends payload 30 minutes later. | Timestamp validation and idempotency check discard duplicate event without credit. | **BLOCKED** |
| **8. Silent Identity Confiscation**| Contractor dissolves workforce association and attempts to delete worker work records. | Foreign key `ON DELETE CASCADE` isolated to association table; worker profile persists. | **BLOCKED** |
| **9. Unconsented Data Export** | Institutional partner attempts bulk worker export without valid consent access grant. | `worker_identity_access_grants` RLS verifies active, non-expired grant token. | **BLOCKED** |
| **10. Rate Limiting Brute Force**| Bot sends 50 OTP generation requests within 60 seconds to lock worker account. | Atomic rate limit RPC locks endpoint after 3 attempts with 900-second lockout. | **BLOCKED** |

---

### 3. Digital Personal Data Protection (DPDP) 2023 Conformance

The platform's data protection architecture aligns with the principles of the DPDP Act, 2023:

1. **Purpose Limitation:** Data collected during onboarding is strictly bound to opportunity matching, credential verification, and wage disbursement. Third-party marketing sales are prohibited.
2. **Right to Withdraw Consent:** Workers retain a one-click sovereign consent revocation toggle. Revoking consent invalidates active access grants within 0ms.
3. **Storage Limitation & Erasure:** Inactive verification telemetry and expired webhook payloads are purged after statutory compliance retention periods.
4. **Data Minimization:** QR codes and public profiles disclose only necessary trade competence markers, keeping Aadhaar and banking details masked.

*Disclaimer: Software tests verify security and data privacy implementations, but do not constitute formal legal certification under the Data Protection Board of India.*
