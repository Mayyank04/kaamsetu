# PHASE 35.1: INTEGRATION STATUS & EXTERNAL GATES REGISTER

**Programme:** KAAMSETU Digital Identity & Worker Empowerment Platform  
**Workstream:** Phase 35.1 — Architecture & Integration Integrity  
**Operating Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**Baseline Date:** November 16, 2026  

---

## 1. Operating Classification & The 5 Outstanding Institutional Gates

In strict accordance with the non-negotiable governance principles established in Phase 30 through Phase 35, KAAMSETU operates under **`CLASS_B_CONTROLLED_ROLLOUT`** within authorized urban clusters (Guwahati Urban, Kamrup Metro, Assam and Shillong Urban, East Khasi Hills, Meghalaya).

**Class A National Production promotion is strictly refused** until the following 5 external institutional gates are formally executed and independently validated:

| Gate ID | Institutional Counterparty | Requirement | Current Authentic Status | Promotion Blocker? |
| :--- | :--- | :--- | :--- | :--- |
| **GATE-01** | **Tripura Skill Development Mission (TSDM)** | Bilateral institutional agreement and formal state pilot authorization for Agartala & West Tripura | **PENDING EXECUTION** (`BLOCKER-01`). All operations in Tripura remain hard-blocked at the gateway level. | **YES** |
| **GATE-02** | **Open Network for Digital Commerce (ONDC / ONest)** | Production key ceremony, BPP registry certification, and network clearance | **STAGING ONLY** (`BLOCKER-02`). Production traffic disabled; operational only against staging registry. | **YES** |
| **GATE-03** | **Heavy EPC Tripartite Consortium** | Formal counterparty signature on tripartite agreements with major infrastructure developers | **PENDING SIGNATURE** (`BLOCKER-03`). Cross-region heavy industrial staffing strictly prohibited. | **YES** |
| **GATE-04** | **Direct Bank Settlement (Core Banking Integration)** | Direct host-to-host bank API settlement replacing provider merchant escrow accounts | **PENDING CORE BANKING INTEGRATION**. System operates via sandbox / merchant gateway payouts. | **YES** |
| **GATE-05** | **Production Multi-Region Disaster Recovery** | Independent cross-cloud disaster recovery drill and automated failover verification | **PENDING EXERCISE**. Single-region managed cloud deployment active. | **YES** |

*Governing Rule:* KAAMSETU never manufactures synthetic approvals, pseudo-authorizations, or fake bank UTRs to simulate gate closure.

---

## 2. External Integration Service Matrix

| Integration Domain | Primary Provider | Integration Pattern | Fallback / Sandbox Behavior | Security Controls |
| :--- | :--- | :--- | :--- | :--- |
| **Identity Verification** | MeitY DigiLocker Partner API | OAuth 2.0 PKCE Authorization Code flow with signed document retrieval | In local/test sandbox, returns deterministic mock Aadhaar XML verification; production requires valid credentials. | Aadhaar numbers are masked on display; biometric data is never stored; consent timestamped in audit logs. |
| **Digital Commerce & Network** | ONDC / ONest Network | BPP (Beckn Protocol Provider) REST APIs with asymmetric cryptographic header signing | Routed to ONDC Staging Registry (`staging.registry.ondc.org`); production disabled until production key ceremony. | Request body signature validation with Ed25519; canonical hashing. |
| **Payment Gateway** | Razorpay / Cashfree | Server-to-server webhook reconciliation with HMAC-SHA256 signature verification | Sandbox provider mock mode for local development; test UTRs rejected if presented as genuine settlement. | Zero commission enforced on payouts; idempotency keys prevent duplicate payouts. |
| **Multilingual Voice Extraction** | Google Gemini Generative AI | `@google/genai` Node.js SDK on secure server-side route (`/api/worker/onboarding/extract`) | Graceful degradation to manual text entry if AI API key is unconfigured or rate limited. | Worker audio uploaded to private Supabase storage; Gemini receives audio buffer/URI; extracted fields require worker review. |
| **SMS / Mobile OTP** | Twilio / Fast2SMS | HTTPS REST API with single-use 6-digit OTP generation | In development mode, mock OTP `123456` enabled only when `ENABLE_DEMO_AUTH=true`; blocked in production. | Salted HMAC rate limiting (max 5 requests per 10 minutes per IP/phone). |
| **Database & Object Storage** | Supabase (PostgreSQL 15+) | PostgREST / GoTrue / Storage S3-compatible APIs | Mock fallback mode for local unit tests without active network connection. | 100% RLS coverage; storage folder isolation; immutable audit triggers. |

---

## 3. Geographic Boundary Enforcement

The platform enforces strict spatial boundaries across all user onboarding and booking workflows:

```
Guwahati Urban (Kamrup Metro, Assam: PIN 781001–781039) -> AUTHORIZED (Active Operations)
Shillong Urban (East Khasi Hills, Meghalaya: PIN 793001–793022) -> AUTHORIZED (Active Operations)
Siliguri (Darjeeling, West Bengal: PIN 734xxx) -> CONDITIONAL (Gated Pilot Pending Local Logistics)
Tripura (Agartala, West Tripura: PIN 799xxx) -> BLOCKED (Pending TSDM Institutional Execution)
Other Regions / Unbounded -> BLOCKED (Class B Scope Restriction)
```
