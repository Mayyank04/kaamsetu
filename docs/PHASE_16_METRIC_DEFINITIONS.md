# KAAMSETU — PHASE 16 METRIC DEFINITIONS & CALCULATION STANDARD
## Standard Operating Definitions, Inclusion/Exclusion Rules & Data Sources

**Date:** November 15, 2026  
**Milestone:** Phase 16 — Independent Verification, National Network Reliability & Repeatable State Expansion  
**Standard Authority:** KAAMSETU Data Governance & Financial Controllership  
**Repository:** `Mayyank04/kaamsetu`  
**Working Branch:** `phase-16-independent-verification-and-national-scale`

---

## 1. Executive Standard

To prevent data drift, ambiguous reporting, and artificial inflation, all platform metrics must adhere to strict, standardized definitions. No metric may be cited in management, investor, or public disclosures without conforming to this specification.

---

## 2. Commercial & Financial Metrics

### 1. Monthly Recurring Revenue (MRR)
- **Definition:** The total normalized monthly subscription fees contracted and paid by active contractor organizations.
- **Data Source:** `public.subscription_orders` joined with `public.contractor_organizations`.
- **Calculation:** $\sum \text{Base Amount}$ for all orders where `status = 'captured'` and `billing_cycle = 'monthly'` within the active 30-day window.
- **Inclusion Rules:** Active Starter (₹999), Pro (₹2,499), and Enterprise (₹4,999) monthly contractor tiers.
- **Exclusion Rules:** Setup fees, hardware fees, one-time onboarding charges, refunded amounts, GST amounts (tax liabilities are tracked separately), and worker wages.
- **Current Run-Rate:** **₹12,495.00**

### 2. Annual Recurring Revenue (ARR)
- **Definition:** The annualized run-rate of active monthly recurring subscription contracts.
- **Calculation:** $\text{ARR} = \text{MRR} \times 12$.
- **Inclusion Rules:** Strictly derived from active recurring SaaS subscriptions.
- **Exclusion Rules:** One-time fees, setup fees, pilot subsidies, and worker earnings.
- **Current Run-Rate:** **₹1,49,940.00**

### 3. Customer Acquisition Cost (CAC)
- **Definition:** Total fully loaded sales, marketing, and field onboarding costs expended to acquire one paying contractor organization.
- **Calculation:** $\text{CAC} = \frac{\text{Total S\&M Expenditure}}{\text{New Paying Contractors Acquired}}$.
- **Inclusion Rules:** Direct sales team travel, marketing collateral, field demo stipends.
- **Exclusion Rules:** Core software engineering and platform infrastructure costs.
- **Current Metric:** **₹2,800.00** per contractor.

### 4. CAC Payback Period
- **Definition:** Time in months required for an average contractor subscription to generate gross margin equal to its acquisition cost.
- **Calculation:** $\text{Payback Months} = \frac{\text{CAC}}{\text{Average Monthly Base Fee} \times \text{Gross Margin \%}}$.
- **Current Metric:** **1.1 months** (Recovered in ~34 days).

### 5. Worker Wage Take-Rate / Platform Commission
- **Definition:** The percentage of worker wages extracted by the platform as transaction, placement, or marketplace fees.
- **Calculation:** $\text{Commission \%} = \frac{\text{Platform Commission Amount}}{\text{Total Worker Wages Disbursed}} \times 100$.
- **Constitutional Invariant:** **EXACTLY 0.00% FOREVER** (Enforced by check constraint `payment_records_commission_zero_check`).

---

## 3. Workforce & Outcome Metrics

### 6. Four-Tier Worker Earnings
All reported worker earnings must explicitly distinguish the verification tier:
1. **Tier 1 (Worker-Reported):** Self-reported by workers during periodic voice surveys without payment slips.
2. **Tier 2 (Customer-Confirmed):** Affirmatively confirmed by contractor site supervisors via in-app payout acknowledgement.
3. **Tier 3 (Payment-Backed):** Traceable to verified ledger disbursement entries in `public.worker_payout_confirmations`.
4. **Tier 4 (Independently Reconciled):** Reconciled directly against bank settlement UTR numbers or audited micro-finance statements.

### 7. Opportunity Fulfillment Latency
- **Definition:** Elapsed time in hours from opportunity posting by a contractor to verified affirmative acceptance by a matched worker.
- **Data Source:** `public.workforce_opportunities.created_at` to `public.worker_opportunity_applications.updated_at` (where `status = 'accepted'`).
- **Current Metric:** **3.2 hours** in Assam (`IN-AS`), **4.8 hours** in Meghalaya (`IN-ML`).

### 8. Repeat Booking Rate
- **Definition:** Percentage of completed bookings made by customers/contractors who have engaged the same worker or platform within the prior 90 days.
- **Calculation:** $\frac{\text{Repeat Bookings}}{\text{Total Completed Bookings}} \times 100$.
- **Current Metric:** **35.0%**.

---

## 4. Institutional & Network Metrics

### 9. Regional Supply-Demand Liquidity Ratio
- **Definition:** Ratio of active, available verified workers to active registered contractor organizations within an operational geographic territory.
- **Calculation:** $\text{Ratio} = \frac{\text{Active Workers}}{\max(\text{Active Contractors}, 1)}$.
- **Equilibrium Target:** $5.0 \le \text{Ratio} \le 25.0$.
- **Current Metric:** **15.0:1** in Assam (`liquid`), **9.3:1** in Meghalaya (`liquid`).

### 10. Multi-Dimensional Credential Validity
- **Definition:** Credential verified across all 7 orthogonal dimensions (Canonical JSON Hash, HMAC Signature, Issuer Verification, Signatory Authorization, Credential Status, Freshness Window, Claim Truth Distinction).
- **Classification Result:** `verified_valid` vs `signature_valid_status_inactive` vs `signature_tampered` vs `issuer_unauthorized`.

---

## 5. Audit Classifications

Every metric record stored in `public.metric_evidence_records` must declare its verification status:
- `verified`
- `partially_verified`
- `self_reported`
- `estimated`
- `unavailable`
- `disputed`

---

## 6. Conclusion

This standard eliminates reporting ambiguity and guarantees that all KAAMSETU performance statistics are mathematically verifiable and grounded in primary evidence.
