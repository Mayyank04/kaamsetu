# KAAMSETU — PHASE 7 & 12-MONTH STRATEGIC ROADMAP
## 4 Stages, Operational Gates & Assam-to-India Scaling Methodology

---

## 1. Roadmap Architecture Overview

KAAMSETU's scaling strategy balances engineering discipline, legal safeguards, and on-the-ground operational reality. Growth is governed by **explicit Go / No-Go decision gates** at each stage boundary.

```
+-----------------------------------------------------------------------------------------------+
|                               12-MONTH STRATEGIC ROADMAP                                      |
+-----------------------------------------------------------------------------------------------+
| STAGE 1 (Months 1–3)  | Guwahati & Kamrup Metro Pilot Consolidation                           |
|                       | Target: 2,500 Workers • 85 Contractor Pro Subscribers                 |
|                       | Gate: Break-even unit economics & 90%+ profile accuracy               |
+-----------------------------------------------------------------------------------------------+
| STAGE 2 (Months 4–6)  | Assam Multi-District Institutional Rollout (Nagaon, Darrang, Sualkuchi)|
|                       | Target: 12,000 Workers • 280 Contractor Pro • 2 Institutional Partners|
|                       | Gate: ASDM cohort integration & DPDP consent compliance verified     |
+-----------------------------------------------------------------------------------------------+
| STAGE 3 (Months 7–9)  | Official DigiLocker & NeGD Gateway Production Activation              |
|                       | Target: 35,000 Workers • 650 Contractors • First Physical Card Batch  |
|                       | Gate: Live NeGD PKI token validation passing in production            |
+-----------------------------------------------------------------------------------------------+
| STAGE 4 (Months 10–12)| Northeast-to-Pan-India Expansion (Bihar, UP, Rajasthan Federation)   |
|                       | Target: 100,000 Workers • 1,500 Contractors • ₹1.5 Cr Annual Run Rate |
|                       | Gate: Cross-state federated registry performance < 50ms latency       |
+-----------------------------------------------------------------------------------------------+
```

---

## 2. Stage Details, Deliverables & Operational Gates

### STAGE 1: Guwahati & Kamrup Metro Pilot Consolidation (Months 1–3)
- **Primary Objectives**:
  - Scale from the 10-worker field pilot (`guwahati_pilot_v1`) to 2,500 verified workers across Guwahati's 4 major Naka chowks (Beltola, Maligaon, Paltan Bazaar, Bharalumukh).
  - Onboard 85 paid Contractor Pro subscribers from Guwahati's solar installation, interior, and electrical contracting sectors.
  - Establish counter-top verification rosters in 30 high-volume electrical hardware stores.
- **Key Deliverables**:
  - Localized Assamese voice onboarding kiosk kit with thermal QR printer.
  - Contractor Pro web & mobile dashboard with one-click PDF compliance dossiers.
  - Zero-commission customer referral directory.
- **Go / No-Go Decision Gate 1**:
  - *Must achieve*: Monthly Recurring Revenue (MRR) >= ₹90,000 to cover operational burn.
  - *Must achieve*: Worker monthly active usage (QR scans / profile shares) >= 65%.
  - *Must achieve*: AI onboarding accuracy >= 95% across Assamese, Bengali, and Hindi without human intervention.

---

### STAGE 2: Assam Multi-District Institutional Rollout (Months 4–6)
- **Primary Objectives**:
  - Expand beyond Kamrup Metro into Kamrup Rural (Sualkuchi textile cluster, Hajo brass craft), Nagaon (pump & agri-mechanics), and Darrang.
  - Execute bilateral MOU with Assam Skill Development Mission (ASDM) and Industrial Training Institute (ITI) Guwahati.
  - Enroll 10 institutional training cohorts (approx. 300 trainees).
- **Key Deliverables**:
  - Institutional cohort portal with granular DPDP Act worker consent management.
  - District-level trade competency filters and multi-supervisor access for large construction firms.
  - Automated WhatsApp bot for worker profile sharing and offline booking requests.
- **Go / No-Go Decision Gate 2**:
  - *Must achieve*: Formal institutional partnership agreement signed with ASDM.
  - *Must achieve*: Trainee granular consent rate >= 85%.
  - *Must achieve*: Zero PII leakage incidents reported or detected in security telemetry.

---

### STAGE 3: Official DigiLocker & NeGD Gateway Activation (Months 7–9)
- **Primary Objectives**:
  - Transition from the fail-closed preparatory boundary to a live production PKI integration with the National e-Governance Division (NeGD) / MeitY.
  - Launch physical Sovereign NFC/PVC Smart Skill Cards (₹99) distributed through partner ITIs and hardware stores.
  - Expand into Sonitpur (Tezpur) and Udalguri BTR corridor.
- **Key Deliverables**:
  - Production OAuth OpenID Connect gateway connection to DigiLocker with cryptographic token assertion verification.
  - Automated PVC/NFC card encoding pipeline linking physical UID to live cryptographic verification hash.
  - Contractor Business multi-site daily wage settlement tracking.
- **Go / No-Go Decision Gate 3**:
  - *Must achieve*: NeGD production gateway certification and security audit signoff.
  - *Must achieve*: Zero false positives in automated DigiLocker KAAMSCORE boost (exactly 0 pts awarded if token invalid, 100 pts awarded if authenticated).
  - *Must achieve*: Physical card unit economics positive (COGS <= ₹38, Retail ₹99).

---

### STAGE 4: Pan-India Expansion & Federation (Months 10–12)
- **Primary Objectives**:
  - Scale KAAMSETU across inter-state informal labor migration corridors: Assam -> West Bengal, Bihar -> Delhi NCR, and Rajasthan.
  - Reach 100,000+ registered skilled workers and 1,500+ active enterprise contractors.
  - Achieve platform self-sufficiency with Annual Run Rate exceeding ₹1.5 Crores.
- **Key Deliverables**:
  - Regional language expansion: Maithili, Bhojpuri, Marwari, and Odia voice onboarding.
  - Open API for construction ERPs (Procore, Buildertrend, Zoho Creator).
  - National Sovereign Skill Registry Federation Protocol specification.
- **Go / No-Go Decision Gate 4**:
  - *Must achieve*: 99.95% system uptime under 50,000 daily active queries.
  - *Must achieve*: Multi-region database replication latency < 100ms.
  - *Must achieve*: Sustainable net operating margin >= 45%.

---

## 3. Risk Mitigation & Governance Matrix

| Risk Category | Potential Vulnerability | Architectural & Operational Defense |
| :--- | :--- | :--- |
| **Monetisation Pressure** | Pressure to extract fees from workers as growth accelerates | Architectural invariant: Database schema contains no billing logic on worker tables. Zero commission is written into corporate bylaws. |
| **Government Bureaucracy** | Delay in formal DigiLocker NeGD API access | Fail-closed architecture allows KAAMSETU to deliver 100% of core value (voice onboarding, QR skill cards, work records, contractor SaaS) without external dependencies. |
| **Contractor Abuse** | Contractors attempting to lock in workers or suppress competition | Workers own their profiles independently. A contractor can add or remove a worker from an org roster, but cannot delete or hold hostage the worker's digital skill card. |
| **Device & Bandwidth Limits** | Rural workers with 2G/3G connections or basic smartphones | Payloads strictly budgeted under 50KB. High-density camera-scannable QR codes work instantly on any camera phone without requiring the app to be installed. |
