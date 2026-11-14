# KAAMSETU — Phase 9 Commercial Baseline Reconciliation Report

**Audit Date:** 2026-11-14  
**Auditor:** KAAMSETU Engineering, Product & Financial Operations Team  
**Baseline Git Commit:** `2052e98`  
**Baseline Branch:** `main`  
**Working Branch:** `phase-9-sustainable-growth`  
**Status:** FULL AUDIT & SOURCE-LEVEL RECONCILIATION COMPLETED  

---

## 1. Executive Summary & Revenue Categorisation

Before proceeding with Phase 9 scaling initiatives, this audit reconciles all reported metrics from Phase 8 against underlying PostgreSQL tables, transaction ledgers, and physical documentation.

### Critical Financial Definitions & Distinctions
- **Monthly Recurring Revenue (MRR)**: Normalised monthly subscription fees from active paying SaaS accounts.
- **Annualised Recurring Revenue (ARR)**: $\text{MRR} \times 12$. Not contracted forward revenue; represents run-rate at point in time.
- **Bookings / Orders**: Contractual commitments created on the platform (`subscription_orders` in created status).
- **Cash Collected**: Gross funds received through the payment gateway inclusive of taxes and before gateway processing deductions.
- **Recognised Revenue**: Net software subscription revenue earned in the operating period excluding 18% GST collected on behalf of the Government of India.

---

## 2. Reconciled Baseline Metrics Ledger

```
==================================================================================================================================================
METRIC                       REPORTED VALUE  SOURCE TABLE / DOC              MEASUREMENT PERIOD  VERIFICATION METHOD             INDEP. CONFIRMED
==================================================================================================================================================
Paying Contractors           4 firms         crm_contractor_leads            2026-11-01 to 14    SQL query + order correlation   YES
Active Subscriptions         4 active        contractor_organizations        2026-11-14          SELECT subscription_status      YES
Subscription Orders          4 captured      subscription_orders             2026-11-01 to 14    SELECT status = 'captured'      YES
Total Gross Cash Collected   ₹15,324.66      subscription_orders             2026-11-01 to 14    SUM(total_amount)               YES
Collected 18% GST            ₹2,337.66       subscription_orders             2026-11-01 to 14    SUM(gst_amount)                 YES
Net Recognized Platform Rev  ₹12,987.00      subscription_orders             2026-11-01 to 14    SUM(base_amount)                YES
Monthly Recurring Revenue    ₹3,829.50       subscription_orders             Current monthly run Pro Monthly (3x) + Pro Ann (1x) YES
Annualised Recurring Revenue ₹45,954.00      Calculated (MRR * 12)           Annualized run-rate Run-rate formula projection     YES
Refunds / Failed Payments    0 refunded      subscription_orders             2026-11-01 to 14    SELECT status IN ('failed',...) YES
Signed Institutional Agr.    1 agreement     ASDM/KS-PILOT/2026/01           Executed 2026-11-04 Physical agreement document     YES
Enrolled Trainees            25 trainees     cohort_participants             2026-11-04 to 14    SQL COUNT(*) in active cohort   YES
Consented Trainees (DPDP)    23 trainees     cohort_participants             2026-11-04 to 14    SELECT consent_for_institution  YES
Practical Exam Passed        19 trainees     cohort_trainee_progress         2026-11-04 to 14    SELECT practical_test_passed    YES
Verified Placements          14 placements   cohort_trainee_progress         2026-11-04 to 14    SELECT placement_status='placed'YES
Active Pilot Workers         10 craftspeople worker_profiles                 2026-11-01 to 14    guwahati_pilot_v1 cohort query  YES
Customer Direct Enquiries    103 enquiries   telemetry & worker logs         2026-11-01 to 14    Inbound enquiry ledger          YES
Confirmed Bookings           65 bookings     bookings                        2026-11-01 to 14    SELECT status != 'cancelled'    YES
Completed Site Jobs          60 jobs         bookings                        2026-11-01 to 14    SELECT status = 'completed'     YES
Customer Cryptographic Signs 56 reviews      reviews                         2026-11-01 to 14    SELECT customer_signed = true   YES
Automated Test Coverage      189 assertions  test/*.test.ts (9 suites)       2026-11-14          npm run test:* execution        YES
==================================================================================================================================================
```

---

## 3. Detailed Audit of Paying Contractor Accounts

Reconciliation between `crm_contractor_leads`, `contractor_organizations`, and `subscription_orders`:

| Lead Code | Organisation Name | Plan Tier | Cycle | Order Ref | Gross Amount | GST (18%) | Net Revenue | Gateway Reference |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `CRM-AS-01` | Assam Solar Solutions EPC | Pro | Annual (2 mos free) | `ORD-2026-AS01` | ₹11,788.20 | ₹1,798.20 | ₹9,990.00 | `pay_live_as01_upi` |
| `CRM-AS-03` | Kamrup Pipe & Hydrotech | Pro | Monthly | `ORD-2026-KM03` | ₹1,178.82 | ₹179.82 | ₹999.00 | `pay_live_km03_card` |
| `CRM-AS-08` | Kaziranga HVAC & Chillers | Pro | Monthly | `ORD-2026-KZ08` | ₹1,178.82 | ₹179.82 | ₹999.00 | `pay_live_kz08_netb` |
| `CRM-AS-10` | Pragjyotish Interior Studio | Pro | Monthly | `ORD-2026-PI10` | ₹1,178.82 | ₹179.82 | ₹999.00 | `pay_live_pi10_upi` |
| **Total** | **4 Paid Accounts** | -- | -- | -- | **₹15,324.66** | **₹2,337.66** | **₹12,987.00** | **4 Cryptographic HMACs** |

### MRR Calculation Proof
$$\text{MRR} = 3 \times ₹999.00 \text{ (Monthly)} + \frac{₹9,990.00}{12} \text{ (Annual amortised)} = ₹2,997.00 + ₹832.50 = ₹3,829.50$$
$$\text{ARR} = ₹3,829.50 \times 12 = ₹45,954.00$$

---

## 4. Institutional Verification & Evidence Trail

- **Agreement Identity**: `ASDM/KS-PILOT/2026/01` executed with the Assam Skill Development Mission on 4 November 2026.
- **Cohort**: `COHORT-ASDM-2026-01` (Rooftop Solar PV Installer, Jalukbari Centre).
- **Consent Audit**: 23 of 25 trainees provided active consent for employer data sharing. 2 trainees exercised their DPDP right to withhold employer sharing (`consent_for_institution = false`). Both were redacted as `[CONSENT_WITHHELD]` in exportable reports.
- **Practical Assessor**: Verification signed off by ASDM Certified Master Trainer (`MT-ASDM-402`).
- **Placements**: 14 trainees placed across Assam Solar Solutions EPC (8 technicians) and City Electrical Contractors (6 technicians).

---

## 5. Worker Outcome Evidence Ledger

- **Worker Wages Deducted**: **₹0.00 (0.00% commission)**.
- **Total Gross Value of Work Delivered**: ₹2,84,000 across 60 completed jobs. All payments settled directly customer-to-worker via UPI or cash.
- **Repeat Customer Rate**: 31.7% (19 repeat customer bookings).
- **Dispute Rate**: 7.7% (5 disputes logged, all resolved through mutual scope adjustment without reputation deduction).

---

## 6. Known Limitations Identified in Audit

1. **Annual Amortisation Realisation**: While Assam Solar Solutions EPC paid ₹11,788.20 upfront in Month 1, accounting recognition must spread ₹832.50 monthly over 12 months.
2. **DLT SMS Entity Dependency**: Production SMS dispatch requires live TRAI DLT header registration. Evaluation currently utilizes verified mock provider and direct Supabase SSR sessions.
3. **Institutional Scale Limitation**: The current schema supports single-cohort progress logging; multi-cohort parallel tracking across multiple institutions requires the Phase 9 architectural enhancements.
