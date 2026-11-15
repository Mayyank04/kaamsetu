# KAAMSETU — PHASE 15 NATIONAL NETWORK ARCHITECTURE REPORT
## Multi-Region Infrastructure, Relational Schema & Distributed Trust Topology

**Date:** November 15, 2026  
**Milestone:** Phase 15 — Verified Regional Growth & National Workforce Infrastructure  
**Status:** Certified Architecture — Production Ready  
**Repository:** `Mayyank04/kaamsetu`  
**Working Branch:** `phase-15-verified-regional-growth`  
**Classification:** `B. NATIONAL EXPANSION READY — CONTROLLED ROLLOUT`

---

## 1. Executive Architectural Overview

KAAMSETU's Phase 15 architecture establishes a multi-region, privacy-first, federated digital identity and workforce opportunity network. It provides verified workforce identity, multi-dimensional credential trust, transparent opportunity matching, and auditable financial reconciliation while strictly enforcing core non-negotiables:

1. **Constitutional 0.00% Commission on Worker Wages**: Enforced at the PostgreSQL storage engine level via check constraints.
2. **Worker Sovereignty & Granular Consent**: Workers own their credentials and identity dossiers, disclose attributes selectively, and revoke access at will.
3. **No Degree, Smartphone, or DigiLocker Mandate**: Accessible via offline-first progressive web application, voice-assisted intake, and physical cryptographic QR credentials.
4. **Zero AI Hallucination / Non-Invention Defense**: Unstated worker attributes, trades, or experience levels remain strictly `null`.
5. **Algorithmic Demographic Neutrality**: Demographic factors (religion, caste, gender) are excluded from matching computations.
6. **Strict Production vs Candidate Regional Isolation**: Operational regions (Assam, Meghalaya) are isolated from candidate exploratory corridors (Tripura, North Bengal, Nagaland).

```mermaid
graph TD
    subgraph ClientLayer["Edge & Client Touchpoints"]
        WV[Worker Voice / SMS / PWA]
        CP[Contractor SaaS Web Application]
        IP[Institutional Partner Portal]
        FC[Field Coordinator Mobile Console]
    end

    subgraph APILayer["Next.js 15 API & Service Boundary"]
        RLS_GW[RLS Authenticated Gateway]
        VOICE_SVC[AI Voice Intake Service]
        MATCH_ENG[Explainable Matching Engine v2]
        CRED_SVC[Multi-Dimensional Credential Trust]
        FIN_SVC[Financial Reconciliation & GST Service]
        SUPP_SVC[Worker Safety & Priority Support]
    end

    subgraph StorageLayer["PostgreSQL 15 Relational Store (65 Tables - 100% RLS)"]
        CORE_AUTH[Identity & Profiles (profiles, worker_profiles)]
        REG_STORE[Regional Topologies (operational_regions, regional_liquidity_snapshots)]
        CRED_STORE[Cryptographic Trust (institutional_credentials, key_rotations)]
        OPP_STORE[Opportunities & Matching (workforce_opportunities, applications)]
        FIN_STORE[Billing & Accounting (subscription_ledger, payment_records)]
        AUDIT_STORE[Provenance & Governance (analytics_provenance_events, audit_logs)]
    end

    WV --> RLS_GW
    CP --> RLS_GW
    IP --> RLS_GW
    FC --> RLS_GW

    RLS_GW --> VOICE_SVC
    RLS_GW --> MATCH_ENG
    RLS_GW --> CRED_SVC
    RLS_GW --> FIN_SVC
    RLS_GW --> SUPP_SVC

    VOICE_SVC --> CORE_AUTH
    MATCH_ENG --> OPP_STORE
    CRED_SVC --> CRED_STORE
    FIN_SVC --> FIN_STORE
    SUPP_SVC --> REG_STORE
    RLS_GW --> AUDIT_STORE
```

---

## 2. Multi-Region Topological Separation

KAAMSETU organizes geographic operations into three operational states:

| Region Code | Region Name | Status | Legal & Operational Boundary | Field Coordination Node |
|---|---|---|---|---|
| `IN-AS` | Assam | **Operational (Active)** | Kamrup Metro (Guwahati), Nagaon, Dibrugarh | Guwahati Central Hub |
| `IN-ML` | Meghalaya | **Operational (Active)** | East Khasi Hills (Shillong), Ri-Bhoi | Shillong Regional Office |
| `IN-TR` | Tripura | **Candidate (Research)** | Agartala, West Tripura | N/A (Isolated in Research) |
| `IN-WB` | North Bengal | **Candidate (Research)** | Siliguri, Jalpaiguri | N/A (Isolated in Research) |
| `IN-NL` | Nagaland | **Candidate (Research)** | Dimapur, Kohima | N/A (Isolated in Research) |

### Strict Candidate Region Contamination Defense
Candidate regions are stored with `status = 'candidate'` or `'research'` in `public.operational_regions`. Production analytics, opportunity routing, contractor matching, and financial ledgers strictly exclude candidate regions from production calculations.

---

## 3. Database Catalog Evolution: Migration 16

Phase 15 introduced database migration `20261115000016_verified_regional_growth.sql`, expanding the schema from 59 to 65 tables with 100% Row-Level Security (RLS) enforcement.

### New Relational Entities in Phase 15:
1. `public.regional_network_liquidity_snapshots`: Captures periodic point-in-time metrics of active worker supply, open contractor demand, match fulfillment latency, and liquidity health.
2. `public.worker_payout_confirmations`: Tracks contractor wage disbursements, affirmative worker receipt confirmations, and wage discrepancy disputes.
3. `public.contractor_customer_success_events`: Records contractor platform usage, retention events, feature adoption, and composite health scores (0-100).
4. `public.institutional_onboarding_lifecycle`: Manages the formal 8-stage state machine for institutional skilling partners.
5. `public.worker_support_assignments`: Implements rapid-response worker safety triage, field coordinator dispatch, and whistleblower confidentiality.
6. `public.analytics_provenance_events`: Immutable audit ledger logging high-order analytics events with deterministic SHA-256 provenance hashes.

### PostgreSQL Catalog Verification:
- **Total Tables:** 65
- **Views:** 1 (`public.public_worker_profiles`)
- **RLS Enforcement:** Exactly 65 of 65 tables have Row-Level Security enabled (100.0%).
- **Public Exposure:** 0 tables exposed to unauthenticated public access without policy evaluation.

---

## 4. Multi-Dimensional Cryptographic Trust

Credential verification rejects single-point binary validation in favor of an orthogonal 7-dimension model:
1. **RFC 8785 Canonical JSON Hashing**: Deterministic payload representation avoiding whitespace, key-order, and float serialization variance.
2. **HMAC-SHA256 Non-Repudiation**: Digitally signed using versioned institutional keys.
3. **Issuer Status Check**: Issuers must have `status = 'verified'` in `public.institutional_partners`.
4. **Signatory Authorization**: Issuing officer must be registered and active with authorized trade scope.
5. **Freshness & Key Rotation**: Keys older than 180 days require rollover; expired keys fail issuance.
6. **Separation of Signature vs Claim Truth**: Cryptographic signature validity verifies payload integrity, but claim truth requires accredited NSQF/partner status.
7. **Offline Revocation Caveat**: Cached verification tokens embed explicit warnings that offline cached signatures cannot verify real-time revocation status.

---

## 5. Security & Multi-Tenant Isolation

- **Tenant Isolation**: Contractor organizations access only their scoped opportunities, applications, and subscription invoices.
- **Worker Data Minimization**: Public profiles omit telephone numbers, Aadhaar identifiers, residential addresses, and wage payout histories.
- **Coordinator Scoping**: Field coordinators are bound strictly to their designated administrative territories via RLS policies.
- **Fail-Closed Operations**: In production mode, missing environment variables, database disconnections, or rate limiter failures immediately fail closed.

---

## 6. Architectural Conclusion

The Phase 15 national network architecture provides the structural resilience and cryptographic rigor required to scale KAAMSETU across multiple states without sacrificing worker dignity, data privacy, or financial integrity.
