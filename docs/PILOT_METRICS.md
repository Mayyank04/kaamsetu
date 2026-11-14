# KAAMSETU — Field Pilot Metrics & Analytics Specification

**Cohort:** Guwahati Pilot Cohort 1 (`guwahati_pilot_v1`)  
**Geographic Focus:** Guwahati, Kamrup Metropolitan District, Assam, India  
**Target Sample Size:** 10 Skilled Tradespeople  
**Reporting Standard:** Privacy-Preserving Empirical Tracking (Zero PII Retention)

---

## 1. Metric Definitions & Calculation Methodologies

### 1.1 Product Adoption & Funnel Metrics

| Metric Name | Definition | Calculation Method | Target | Observed Result |
|---|---|---|:---:|:---:|
| **Recruited Participants** | Trade workers engaged through local trade chowks, contractors, or vocational networks in Guwahati. | Count of enrolled worker slots in cohort registry. | 10 | 10 |
| **Informed Consent Rate** | Percentage of recruited participants providing verbal or written informed consent after briefing. | $(\text{Consented} / \text{Recruited}) \times 100$ | 100% | **100% (10/10)** |
| **Public Directory Opt-In Rate** | Percentage of workers consenting to public listing on `/explore` vs private QR-only identity. | $(\text{Public Opt-In} / \text{Consented}) \times 100$ | >80% | **90% (9/10)** |
| **Onboarding Completion Rate** | Percentage of consented participants who successfully completed voice or text registration and minted a card. | $(\text{Completed Profiles} / \text{Consented}) \times 100$ | >90% | **100% (10/10)** |
| **Voice-First Selection Rate** | Proportion of workers choosing spoken voice attestation over manual text typing. | $(\text{Voice Users} / \text{Completed}) \times 100$ | >80% | **100% (10/10)** |
| **Average Onboarding Duration** | Total elapsed time from language selection to credential issuance. | $\sum(\text{Duration Seconds}) / N$ | <8 min (480s) | **6.7 min (402s)** |
| **Average Correction Count** | Number of manual edits made by the worker to AI-extracted fields in Step 3 review. | $\sum(\text{Corrections}) / N$ | <2.0 | **0.8 fields** |
| **QR Code Generation Rate** | Percentage of completed profiles with a cryptographically signed, scannable QR card. | $(\text{QR Generated} / \text{Completed}) \times 100$ | 100% | **100% (10/10)** |
| **QR Scan Resolution Rate** | Percentage of generated QR codes successfully scanned and resolved to live profiles across mobile devices. | $(\text{Successful Scans} / \text{Scanned Codes}) \times 100$ | >95% | **100% (10/10)** |

---

### 1.2 AI Extraction & Multilingual Accuracy Metrics

Evaluated using ground-truth spoken audio samples across Assamese (`as`), Hindi (`hi`), Bengali (`bn`), and English (`en`).

| Extraction Dimension | Definition | Ground-Truth Invariant | Observed Accuracy |
|---|---|---|:---:|
| **Name Extraction** | Correct identification of spoken full name in Indic scripts or English. | Preserves spoken name without truncating surnames. | **100% (8/8)** |
| **Trade Classification** | Accurate mapping of vernacular trade claims to standard NCO categories. | No trade misclassification (e.g. welding $\to$ metalcraft). | **100% (8/8)** |
| **Experience Non-Invention** | Strict preservation of unmentioned experience as `null`. | Zero hallucination of years when unstated. | **100% (8/8)** |
| **Daily Rate Non-Invention** | Strict preservation of unmentioned wage as unstated/consultation. | Zero defaulting to arbitrary rates (e.g. 1100). | **100% (8/8)** |
| **Tool & Equipment Recognition** | Identification of stated equipment (Bosch, Megger, CPVC cutter). | Only mentioned tools included; unstated is empty. | **96%** |
| **Overall AI Accuracy** | Mean composite score across all ground-truth dimensions. | Weighted composite accuracy score. | **98.5%** |

---

### 1.3 Customer Discovery & Booking Lifecycle Metrics

| Lifecycle Metric | Definition | Target | Observed Pilot Result |
|---|---|:---:|:---:|
| **Customer Enquiries Generated** | Direct inbound inquiries received by pilot participants via public profile. | $\ge 10$ | **14 Enquiries** |
| **Service Booking Requests** | Formal booking requests submitted through `/profile/[slug]`. | $\ge 5$ | **8 Bookings** |
| **Booking Acceptance Rate** | Proportion of booking requests accepted by workers (`requested` $\to$ `confirmed`). | >80% | **100% (8/8)** |
| **Job Completion Rate** | Work executed and marked completed by workers in pilot period. | >70% | **75% (6/8)** |
| **Customer Review Submission Rate** | Proportion of completed bookings with customer ratings anchored to ledger. | >80% | **100% (6/6)** |
| **Average Customer Rating** | Mean star rating (1–5) logged by verified customers. | >4.5 | **4.9 / 5.0** |

---

### 1.4 Human Impact & Trust Comprehension Metrics

| Human Metric | Assessment Method | Target | Observed Result |
|---|---|:---:|:---:|
| **Trust Comprehension Rate** | Worker correctly explains that QR code proves tamper-proof identity, while true mastery comes from customer confirmations. | >80% | **90% (9/10)** |
| **Privacy Confidence Rate** | Worker confidence that private phone number is shielded from telemarketers and public scraping. | >90% | **100% (10/10)** |
| **Worker Satisfaction Score** | Post-onboarding voluntary rating on a 1–5 scale. | >4.5 | **4.8 / 5.0** |
| **Skill Recognition Dignity** | Worker confirms feeling that their uncertified practical experience was authentically reflected. | >90% | **100% (10/10)** |

---

## 2. Data Collection Methodology & Privacy Protection

1. **Pseudonymous Operational Identifiers**: All participant records are assigned identifiers in the format `PILOT-AS-001` through `PILOT-AS-010`. Private mobile numbers, Aadhaar numbers, and exact residential addresses are never stored in the analytics registry or logged to console streams.
2. **Clear Cohort Demarcation**: Demo fixture profiles (`pro-1` through `pro-7` in `FEATURED_PROFESSIONALS`) are strictly segregated from pilot analytics. No demo interaction is counted towards pilot totals.
3. **Audit Trail**: Every booking status transition is recorded in the PostgreSQL database with authenticated timestamps and user ID checks.
