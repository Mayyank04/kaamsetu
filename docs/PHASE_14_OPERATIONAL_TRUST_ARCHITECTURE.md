# KAAMSETU PHASE 14: OPERATIONAL TRUST ARCHITECTURE
## End-to-End System Reliability, Cryptographic Governance & Constitutional Guarantees

**Version:** 1.0.0  
**Phase:** 14 — Operational Proof, Trust Governance & Regional Sustainability  
**Author:** Principal Software Architect, Security Auditor & Platform Controller  
**Baseline Git Commit:** `2255153` (Phase 13 certification)  
**Target Git Branch:** `phase-14-operational-proof-and-trust`  
**Classification:** B. NATIONAL EXPANSION READY — CONTROLLED ROLLOUT  

---

## 1. Executive Summary & Architectural Invariants

Phase 14 transitions KAAMSETU from a technically certified national operating framework into a resilient, tamper-evident, dual-controlled operational trust network. The platform's mission remains invariant:
> *"Every skill deserves to be seen, even without a degree."*

To protect vulnerable, informal-sector wage earners while scaling institutional and enterprise relationships across India, the operational architecture enforces five non-negotiable constitutional invariants:

1. **Constitutional 0.00% Worker Commission:**
   - Worker digital identity, profile registration, QR credential card, and wage earnings are guaranteed free forever.
   - Enforced by PostgreSQL check constraint `payment_records_ledger_platform_commission_amount_check CHECK (platform_commission_amount = 0.00)`. Any attempt to deduct fees from worker disbursements fails closed at the relational database engine level.
2. **Worker Sovereignty & Granular DPDP Consent:**
   - Workers retain unilateral, unencumbered ownership of their digital identity.
   - Digital Personal Data Protection (DPDP) Act compliance guarantees that phone numbers, Aadhaar numbers, and exact rates are withheld by default. Identity disclosure requires explicit, fine-grained access grants that can be revoked instantly.
   - Subscription cancellation or commercial tier downgrades by contractors leave worker identity records 100% intact.
3. **Regional Dual Approval & Anti-Self-Approval:**
   - Critical regional operational changes—such as activating a new state, updating operational risk status, altering regional tariff structures, or deploying cross-border worker pools—require two distinct authenticated administrators (`initiated_by != secondary_approved_by`).
4. **Multi-Dimensional Offline Credential Trust:**
   - Institutional skill credentials decompose offline verification into 7 distinct orthogonal vectors: mathematical signature integrity, signing key revocation status, issuing institution accreditation, credential active status, time-bound freshness, signatory delegation, and empirical assessment provenance.
   - Expired or suspended credentials present clear, explicit offline caveats, preventing unaccredited claims on remote job sites.
5. **Algorithmic Demographic Neutrality:**
   - The matching and ranking engine evaluates workers strictly on trade alignment, verified skills, geographic proximity, and transparent KaamScore.
   - Counterfactual fairness audits mathematically confirm 100% parity across gender, religion, caste, and ethnicity variants.

---

## 2. End-to-End Architectural Model

```mermaid
flowchart TD
    subgraph ClientLayer ["Client & Edge Layer"]
        WP[Worker PWA / Mobile Web]
        CP[Contractor Dashboard]
        IP[Institutional Portal]
        OV[Offline QR Scanner / Edge Verifier]
    end

    subgraph SecurityGateway ["Security & Rate-Limiting Gateway"]
        RL[Atomic PostgreSQL Rate Limiter<br/>Fail-Closed with HMAC-SHA256 Hashing]
        WAF[Input Sanitization & PII Masking]
        AUTH[Supabase Auth / Session Token Resolution]
    end

    subgraph CoreServices ["Phase 14 Core Domain Services"]
        RGS[Regional Governance Service<br/>Dual Approval & Anti-Self-Approval]
        WTS[Worker Trust & Consent Service<br/>DPDP Plain-Language Notices & Audit]
        IGS[Issuer Governance Service<br/>Multi-Dimensional Credential Verification]
        ME2[Matching Engine V2<br/>Bi-Directional Explainability & Fairness]
        RIS[Review Integrity Service<br/>Retaliation Quarantine & Appeal Lifecycle]
        FAS[Financial Audit Service<br/>Transaction Reconciliation & Unit Economics]
        IRS[Incident Response Service<br/>Formal 7-Stage State Machine]
    end

    subgraph DataStorageLayer ["PostgreSQL 15 High-Assurance Storage (59 Tables)"]
        RLS[100% Row-Level Security Enabled<br/>pg_tables: 59 / 59 enforced]
        RDA[(regional_dual_approvals)]
        WCA[(worker_consent_audit_events)]
        RMA[(review_moderation_appeals)]
        OIL[(operational_incidents_lifecycle)]
        FRE[(financial_reconciliation_exceptions)]
        ROS[(regional_operational_scorecards)]
        PRL[(payment_records_ledger<br/>CHECK commission = 0.00)]
    end

    WP --> WAF
    CP --> WAF
    IP --> WAF
    OV --> IGS

    WAF --> RL
    RL --> AUTH
    AUTH --> CoreServices

    RGS --> RDA
    WTS --> WCA
    IGS --> RLS
    ME2 --> RLS
    RIS --> RMA
    FAS --> FRE
    FAS --> ROS
    FAS --> PRL
    IRS --> OIL
```

---

## 3. Pillar-by-Pillar Architectural Breakdown

### Pillar A: Regional Governance & Dual-Approval Controls
- **Dual Approval Engine (`regional_dual_approvals`):**
  Changes to regional operational readiness, state launches, or administrative privileges must undergo dual authorization. The service verifies:
  1. `initiated_by` is an authorized regional coordinator or platform admin.
  2. `secondary_approved_by` is an authenticated administrator distinct from `initiated_by`.
  3. Action payload is cryptographically hashed with SHA-256 to prevent in-flight tampering.
- **Suspended Region Opportunity Blocking:**
  When a region enters `suspended` status due to civil disruptions, natural disasters, or legal compliance audits, the opportunity matching engine strictly rejects project creation and worker dispatch within that territory (`validateRegionOpportunityRouting`).

### Pillar B: Worker Sovereignty & DPDP Consent Engine
- **Granular Field Visibility (`worker_privacy_settings`):**
  Workers configure exact disclosure preferences across `share_contact_phone`, `share_rates`, `share_certifications`, `share_work_history`, and `share_aadhaar_last4`.
- **Plain-Language Multilingual Notices:**
  Privacy notices and consent requests are rendered in plain language across Assamese (`as`), Hindi (`hi`), and English (`en`), fulfilling DPDP Act Section 5(1).
- **Consent Audit Ledger (`worker_consent_audit_events`):**
  Every consent grant, renewal, modification, and revocation is recorded with an immutable SHA-256 fingerprint, client user agent, and timestamp.
- **Portability & Post-Cancellation Independence:**
  Workers can export their full credential dossier as an RFC 8785 canonical JSON archive. Should an employer cancel their subscription, the worker's verified portfolio, reviews, and credentials remain entirely active and untouched.

### Pillar C: Institutional Credential Trust & Issuance Gatekeeping
- **Decomposed Multi-Dimensional Verification (`verifyCredentialMultiDimensional`):**
  Offline verification does not output a monolithic boolean. Instead, it decomposes trust into 7 auditable dimensions:
  1. `signatureValid`: HMAC-SHA256 signature verification over RFC 8785 canonicalized attributes.
  2. `keyStatusValid`: Status of the institutional signing key (`active`, `revoked`, or `expired`).
  3. `issuerAccredited`: Government accreditation status of the issuing training center.
  4. `credentialActive`: Relational status of the credential (`issued`, `suspended`, `revoked`).
  5. `freshnessValid`: Verification cache timestamp age (valid within 15 minutes; flagged with mandatory caveat if offline).
  6. `signatoryAuthorized`: Active delegation status of the authorized signatory.
  7. `assessmentAnchored`: Tamper-resistant NSQF batch assessment reference.
- **Issuance Gatekeeping (`evaluateCredentialIssuancePermission`):**
  Suspended issuers cannot issue credentials. Furthermore, sandbox API keys are prevented from issuing credentials into production namespaces.

### Pillar D: Explainable Matching & Demographic Parity
- **Bi-Directional Explainability:**
  - **Worker View:** Explains why an opportunity matches their profile (wage range, district proximity, daily commute allowance, required tools).
  - **Contractor View:** Explains candidate qualification (NSQF level, verified technical skills, trade alignment, proximity score).
- **Cold-Start Protection:**
  New workers with 0 completed jobs receive an exploratory score multiplier (exploration weight: 1.05) preventing starvation against established profiles.
- **Counterfactual Fairness Auditing:**
  The matching engine strips all protected demographic attributes before calculation. Audits execute counterfactual evaluations across demographic permutations to guarantee variance $\sigma^2 = 0$.

### Pillar E: Grievance Redressal & Review Integrity
- **Quarantine Engine for Retaliatory Reviews:**
  When a worker files a wage dispute, negative reviews submitted by the respondent contractor during the dispute window are automatically quarantined.
- **Formal Appeal Lifecycle (`review_moderation_appeals`):**
  Quarantined reviews undergo administrative review with formal status tracking (`pending`, `under_investigation`, `upheld`, `suppressed_retaliatory`, `dismissed`).
- **Private Evidence Isolation:**
  Grievance evidence (photos of unfinished sites, bank transaction SMS screenshots, police diary entries) is stored with PostgreSQL RLS isolating it from the respondent employer.
- **Tiered SLA Enforcement:**
  - Critical Safety / Harassment: 4 hours.
  - Wage Theft / Underpayment: 24 hours (first response), 7 days (statutory mediation).
  - Profile Discrepancies: 48 hours.

### Pillar F: Financial Ledger Reconciliation & Unit Economics
- **Transaction-Level Double-Entry Audit:**
  Reconciles Razorpay/bank webhooks against invoiced subscriptions. Excludes one-time onboarding fees from Annual Recurring Revenue (ARR).
- **GST Compliance:**
  Calculates statutory 18% GST, automatically separating intra-state supplies (9% CGST + 9% SGST for Assam-to-Assam) and inter-state supplies (18% IGST for Assam-to-Meghalaya).
- **Regional Unit Economics Scorecard (`computeRegionalUnitEconomics`):**
  Tracks regional Customer Acquisition Cost (CAC), Lifetime Value (LTV), server infrastructure overhead, and field coordination cost to verify regional contribution margins.

### Pillar G: Multi-Region Operational Scoping
- **Regional Coordinator Boundaries:**
  PostgreSQL RLS policies restrict regional field coordinators to records matching their operational jurisdiction (`operating_state` / `operating_district`).
- **Synthetic vs Real Data Isolation:**
  Candidate expansion regions (Tripura, North Bengal, Nagaland) are locked in `research_in_progress` or `proposed` lifecycle stages. They cannot accept live billing transactions or worker bookings until bilateral MoUs and field infrastructure are formally active.

### Pillar H: Incident Response & PII Redaction
- **Formal 7-Stage State Machine (`validateIncidentStageTransition`):**
  Incidents must progress sequentially through:
  `detected` $\rightarrow$ `triaged` $\rightarrow$ `investigating` $\rightarrow$ `mitigating` $\rightarrow$ `contained` $\rightarrow$ `resolved` $\rightarrow$ `post_mortem_completed`.
  Invalid jumps (e.g. `detected` straight to `resolved`) fail closed.
- **Telemetry Redaction Engine:**
  Standard telemetry filters automatically scrub 12-digit Aadhaar numbers, 10-digit Indian mobile numbers, JWT tokens, and 256-bit HMAC secret keys before logging to stdout.

---

## 4. Verification Summary & Test Evidence

The platform's operational architecture is verified by **15 comprehensive test suites** executing **410 automated assertions**:

| Test Suite | Script Command | Total Assertions | Passing | Status |
|:---|:---|:---:|:---:|:---:|
| Cryptographic Integrity & Key Rotation | `npm run test:crypto` | 16 | 16 | PASS |
| Persistent Rate Limiter & Fail-Closed | `npm run test:ratelimit` | 17 | 17 | PASS |
| Row-Level Security Access Control | `npm run test:rls` | 14 | 14 | PASS |
| Database Schema & RLS Verification | `npm run verify:db` | 176 | 176 | PASS |
| AI Ground-Truth & Non-Invention | `npm run test:ai` | 8 | 8 | PASS |
| Low-Bandwidth Network Performance | `npm run test:perf` | 5 | 5 | PASS |
| Multi-Tenancy & Institutional Security | `npm run test:multitenant` | 9 | 9 | PASS |
| Commercial Billing & Worker Consent | `npm run test:commercial` | 8 | 8 | PASS |
| Production Operations & Disaster Recovery | `npm run test:production` | 8 | 8 | PASS |
| Sustainable SaaS Growth & Retention | `npm run test:growth` | 8 | 8 | PASS |
| Phase 10: Multi-Region Infrastructure | `npm run test:phase10` | 20 | 20 | PASS |
| Phase 11: Interstate Operations Validation | `npm run test:phase11` | 25 | 25 | PASS |
| Phase 12: Repeatable National Network | `npm run test:phase12` | 30 | 30 | PASS |
| Phase 13: National Operations Scale | `npm run test:phase13` | 30 | 30 | PASS |
| Phase 14: Operational Proof & Trust | `npm run test:phase14` | 36 | 36 | PASS |
| **Total Platform Assertions** | **All 15 Suites** | **410** | **410** | **100% PASS** |

---

## 5. Architectural Integrity Certification

We certify that KAAMSETU's Phase 14 architecture implements all required governance checks, anti-tamper mechanisms, and privacy protections. The system maintains an uncompromised commitment to informal worker empowerment while providing rigorous, enterprise-grade auditability for commercial contractors and state institutions.
