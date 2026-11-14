# KAAMSETU — PHASE 13 NATIONAL OPERATIONS ARCHITECTURE
## End-to-End Architectural Specification for Multi-State Workforce Operations, Institutional Interoperability & Platform Reliability

**Protocol:** KAAMSETU National Sovereign Skill Identity Protocol  
**Repository:** `Mayyank04/kaamsetu`  
**Branch:** `phase-13-national-operations-scale`  
**Classification:** B. NATIONAL EXPANSION READY — CONTROLLED ROLLOUT  
**Date:** November 15, 2026  
**Auditor / Architect:** Principal Software Architect & National Infrastructure Specialist  

---

### 1. Executive Architectural Overview

Phase 13 establishes the technical, operational, and governance architecture required to transition KAAMSETU from interstate readiness across Assam and Meghalaya into a controlled, multi-state operational platform capable of structured expansion across India.

The architecture is built upon the foundational non-negotiables:
1. **Worker Digital Identity & Physical QR Cards Are Free Forever**: No worker ever pays for registration, profile issuance, skill verification, or QR card generation.
2. **Constitutional 0.00% Take-Rate on Worker Wages**: Enforced through PostgreSQL table check constraints (`payment_records_commission_zero_check` where `platform_fee_percentage = 0.00` and `commission_amount = 0.00`).
3. **Worker Self-Sovereignty & Selective Disclosure**: Workers hold cryptographic control over their dossiers, export independently without platform vendor lock-in, and revoke access instantly.
4. **Algorithmic Demographic Neutrality**: Opportunity matching excludes religion, caste, gender, dialect, and device brand from all scoring formulas.
5. **Separation of Verified Reality from Simulation**: Candidate expansion regions and simulated telemetry are strictly isolated from empirical production metrics.

```
+---------------------------------------------------------------------------------------------------+
|                                 KAAMSETU NATIONAL OPERATIONS LAYER                                |
+---------------------------------------------------------------------------------------------------+
|  REGIONAL CONTROL PLANE           WORKER SOVEREIGN IDENTITY          INSTITUTIONAL PARTNER PLANE  |
|  - 10-Stage State Machine         - Schema 2.2 Dossier               - Authorized Signatories     |
|  - 12-Milestone Launch Playbook   - Granular Selective Disclosure    - HMAC-SHA256 Fingerprints   |
|  - Real-time Incident Gatekeeper  - Instant Revocation Engine        - Sandbox vs Prod Isolation  |
|  - Emergency Suspension Hook      - Offline Verification with Caveat - Dual-Key Zero-Downtime     |
+-----------------------------------+----------------------------------+----------------------------+
                                    |
+-----------------------------------+---------------------------------------------------------------+
|                                  INTELLIGENT WORKFORCE MATCHING V2                                |
|  - Explainable 4-Vector Breakdown: Trade (40%), Skill (30%), Location (15%), KaamScore (15%)      |
|  - Worker Contact Phone Masking (+91-XXXXX-XXXXX) until explicit worker consent                    |
|  - Zero-Review Fairness Invariant & Protected Demographic Exclusion Guarantee                     |
+---------------------------------------------------------------------------------------------------+
                                    |
+-----------------------------------+---------------------------------------------------------------+
|                                   FAIRNESS, GRIEVANCE & BILLING LEDGER                            |
|  - 7-Day Dispute SLA Mediation Queue                                                              |
|  - Retaliatory Review Automatic Quarantine Engine                                                 |
|  - Tax-Compliant 18% GST Ledger (CGST/SGST vs IGST)                                               |
|  - Strict ARR = MRR * 12 Mathematical Purity (Zero One-Time Fee Inflation)                        |
+---------------------------------------------------------------------------------------------------+
                                    |
+-----------------------------------+---------------------------------------------------------------+
|                             POSTGRESQL 15 KERNEL-SPACE DEFENSE (53 TABLES)                        |
|  - 100% Row-Level Security (53/53 Tables Enforced)                                                |
|  - Multi-Tenant Organization & State-Level Partition Isolation                                    |
|  - Atomic Database Rate Limiting (public.check_and_increment_rate_limit)                          |
+---------------------------------------------------------------------------------------------------+
```

---

### 2. Multi-Tier Subsystem Architecture

#### 2.1 Regional Operations Control Plane (`src/lib/regions/regional-operations-service.ts`)
The Regional Control Plane governs the lifecycle of federal operational territories.
- **Regions Managed**:
  - `IN-AS-KMP-METRO`: Kamrup Metropolitan (Guwahati, Assam) — Status: `active`
  - `IN-ML-EKH`: East Khasi Hills (Shillong, Meghalaya) — Status: `active`
  - `IN-TR-WTR`: West Tripura (Agartala, Tripura) — Status: `research_in_progress`
  - `IN-WB-DAR`: Darjeeling & Siliguri (North Bengal) — Status: `proposed`
  - `IN-NL-DIM`: Dimapur (Nagaland) — Status: `proposed`
- **Activation Gatekeeper (`evaluateRegionalActivationGate`)**:
  - Requires overall readiness score $\ge 85/100$.
  - Enforces two mandatory hard safety gates:
    - Zero active critical or high-severity operational incidents (`active_incident_count === 0`).
    - Formal institutional MoU executed with local partner (`has_signed_mou === true`).
  - If either hard gate fails, activation is strictly rejected regardless of point total.
- **Incident Management**:
  - Incidents categorized into `critical`, `high`, `medium`, `low`.
  - Logging an unresolved critical incident automatically blocks region promotion and flags emergency review.
- **Emergency Suspension**:
  - Immediate operational pause triggered by administrative action, moving region status to `suspended` and revoking cross-region deployment routing.

#### 2.2 Worker Identity Standard Schema 2.2 (`src/lib/interop/identity-interop-v2-2.ts`)
The portable identity dossier standard advances to version 2.2 with full backward compatibility:
- **Schema Lineage**:
  - `2.0`: Baseline credentials, skills, work records, and KaamScore.
  - `2.1`: Interstate mobility (`travelWillingness`), offline verification summaries, and revocation caveats.
  - `2.2`: Granular selective disclosure preferences, multi-factor credential provenance anchoring, and institutional authorized signatory fingerprints.
- **Selective Disclosure**:
  - Workers toggle visibility for 6 distinct data fields: `contactPhone`, `contactEmail`, `governmentId`, `dailyRate`, `workHistory`, `skillAssessments`.
  - When withheld, values are stripped from the payload prior to rendering or external API output.
- **Offline Scannable QR Payload**:
  - Embedded disclaimer: *"Offline verification reflects status at cache sync. Revocation may occur subsequently. Always verify online for high-value contracts."*

#### 2.3 Explainable Matching Engine v2 (`src/lib/opportunity/matching-engine-v2.ts`)
- **4-Vector Deterministic Scoring**:
  $$\text{Total Score} = \text{Trade Score} (40\%) + \text{Skill Match} (30\%) + \text{Location Proximity} (15\%) + \text{KaamScore Viability} (15\%)$$
- **Demographic Neutrality**:
  - Algorithms do not accept or evaluate gender, caste, religion, language dialect, or phone model.
  - Two candidate profiles differing solely in demographic attributes produce 100% identical matching scores and explanation text.
- **Contact Masking**:
  - Worker phone numbers remain masked (`+91-XXXXX-XXXXX`) on candidate discovery screens until the worker affirmatively accepts the project engagement.

#### 2.4 Institutional Credential Interoperability (`src/lib/institution/credential-interop-service.ts`)
- **Authorized Signatories**:
  - Institutional credentials must be signed by registered signatories in `institution_authorized_signatories`.
  - Verification includes SHA-256 public key fingerprints and designated organizational roles.
- **Formal Status Lifecycle**:
  - Strict unidirectional progression: `issued` $\rightarrow$ `active` $\rightarrow$ `suspended` $\rightarrow$ `revoked` / `expired`.
  - Revocations are irreversible and record immutable reason codes and timestamps.
- **Environment Isolation**:
  - Sandbox API keys (`is_sandbox = true`) operate within an isolated testing namespace and cannot write to or alter production credentials.

#### 2.5 Grievance Redressal & Anti-Retaliation Engine (`src/lib/disputes/grievance-service.ts`)
- **Automated 7-Day SLA**:
  - All submitted disputes are assigned an immutable mediation deadline: $\text{SLA Due Date} = \text{Submission Timestamp} + 7 \text{ Days}$.
- **Retaliatory Review Quarantine**:
  - If a contractor submits a negative review ($\le 2$ stars) within 14 days of an active worker grievance, the review is automatically placed into `quarantine` status.
  - Quarantined reviews do not affect worker KaamScore or public ratings during active mediation.
- **Restitution Verification**:
  - Wage claims can only be marked `resolved_worker_upheld` upon attaching valid transaction evidence (UPI reference, bank confirmation).

#### 2.6 Financial Reconciliation & GST Ledger (`src/lib/billing/financial-reconciliation-service.ts`)
- **18% Statutory GST Separation**:
  - Intra-state transactions (Assam $\rightarrow$ Assam): 9% CGST + 9% SGST.
  - Inter-state transactions (Assam $\rightarrow$ Meghalaya): 18% IGST.
- **Mathematical SaaS Metric Purity**:
  $$\text{ARR} = \text{Monthly Recurring Revenue (MRR)} \times 12$$
  - Setup fees, hardware sales, and one-time onboarding charges are strictly excluded from ARR calculations.

---

### 3. Database Layer Architecture (PostgreSQL 15)

Migration 14 (`20261115000014_national_operations_scale.sql`) expanded the schema to **53 tables + 1 view**:
- 100% of tables (53/53) have PostgreSQL Row-Level Security enabled.
- New Phase 13 operational tables:
  1. `regional_launch_milestones`: 12-milestone launch tracking per region.
  2. `regional_operational_incidents`: Incident severity and resolution audits.
  3. `institution_authorized_signatories`: Cryptographic signatory fingerprints.
  4. `worker_privacy_settings`: Granular field disclosure toggles.
  5. `financial_gst_ledger`: Tax-compliant invoice separation and ledger.
  6. `regional_service_telemetry`: Operational telemetry with simulation flags.

---

### 4. Architectural Verification Summary

| Component | Architecture Mechanism | Test Verification |
|---|---|---|
| Regional Operations | State Machine & Gatekeeper | Test 1, Test 2, Test 3, Test 4, Test 5 |
| Worker Identity | Schema 2.2 & Selective Disclosure | Test 6, Test 7, Test 8, Test 10, Test 11 |
| Matching Engine | 4-Vector Scoring & Demographic Parity | Test 12, Test 13, Test 14, Test 15 |
| Institutional Plane | Signatories & Key Rotation | Test 9, Test 23, Test 24 |
| Worker Protection | 7-Day SLA & Anti-Retaliation Quarantine | Test 16, Test 17, Test 18 |
| Financial Operations | 0% Worker Commission & GST Invoicing | Test 19, Test 20, Test 21, Test 22 |
| Platform Reliability | Persistent Rate Limits & DR Backup | Test 25, Test 26, Test 29, Test 30 |

The national architecture is fully verified, non-destructive, and compliant with all constitutional guarantees.
