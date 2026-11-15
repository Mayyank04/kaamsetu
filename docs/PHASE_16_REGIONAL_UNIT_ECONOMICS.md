# KAAMSETU — PHASE 16 REGIONAL UNIT ECONOMICS REPORT
## Territorial Contribution Margin, Direct Costs, Cost per Worker & Scorecards

**Date:** November 15, 2026  
**Milestone:** Phase 16 — Independent Verification, National Network Reliability & Repeatable State Expansion  
**Standard:** Territorial Unit Economics & Contribution Accounting  
**Repository:** `Mayyank04/kaamsetu`  
**Working Branch:** `phase-16-independent-verification-and-national-scale`

---

## 1. Executive Summary

To guarantee long-term financial sustainability without extracting cuts from worker wages, each operational territory must demonstrate viable unit economics.

Territorial contribution margin is evaluated via `computeRegionalUnitEconomics` (`financial-audit-service.ts`):

$$\text{Contribution Margin} = \text{Territory SaaS Revenue} - (\text{Field Coordinator Stipends} + \text{Cloud/AI Allocation} + \text{SMS/Gateway Fees})$$

$$\text{Margin \%} = \frac{\text{Contribution Margin}}{\text{Territory SaaS Revenue}} \times 100$$

---

## 2. Active Regional Unit Economics Scorecard

### Assam Operational Hub (Guwahati & Kamrup Metro):
- **Active Paying Contractors:** 3 organizations (Kamrup Builders, Brahmaputra Elec, Pragati Infra).
- **Active Registered Workers:** 600 verified workers.
- **Monthly SaaS Recurring Revenue:** **₹9,997.00**
- **Direct Regional Operational Costs:**
  - Field Coordinator Stipend (Part-time honorarium): ₹3,500.00
  - Cloud Edge Hosting & AI Inference Allocation: ₹500.00
  - SMS OTP & Razorpay Gateway Processing Fees: ₹200.00
  - **Total Direct Costs:** ₹4,200.00
- **Net Contribution Margin:** **+₹5,797.00**
- **Contribution Margin Percentage:** **+57.99%**
- **Cost per Active Worker:** **₹7.00 / worker / month**
- **Revenue per Paying Contractor:** **₹3,332.33 / contractor / month**
- **Operational Health Rating:** **`highly_profitable`**

### Meghalaya Operational Hub (Shillong & East Khasi Hills):
- **Active Paying Contractors:** 2 organizations (Highland Civil Works, Pine City Electrical).
- **Active Registered Workers:** 140 verified workers.
- **Monthly SaaS Recurring Revenue:** **₹2,498.00**
- **Direct Regional Operational Costs:**
  - Field Coordinator Stipend (Shared part-time): ₹1,800.00
  - Cloud & AI Allocation: ₹200.00
  - Gateway & SMS Fees: ₹80.00
  - **Total Direct Costs:** ₹2,080.00
- **Net Contribution Margin:** **+₹418.00**
- **Contribution Margin Percentage:** **+16.73%**
- **Cost per Active Worker:** **₹14.85 / worker / month**
- **Revenue per Paying Contractor:** **₹1,249.00 / contractor / month**
- **Operational Health Rating:** **`sustainable`**

---

## 3. Contribution Margin Threshold Scale

The platform classifies territorial viability into five operational ratings:

| Margin Percentage | Operational Rating | Meaning & Strategy |
|---|---|---|
| **$\ge +40.0\%$** | **`highly_profitable`** | Strong cash generation; territory can self-fund expansion into adjacent districts. |
| **$+15.0\% \text{ to } +39.9\%$** | **`sustainable`** | Self-sufficient; covers direct field operations with positive buffer. |
| **$-5.0\% \text{ to } +14.9\%$** | **`break_even`** | Operational breakeven; focus on contractor acquisition to lift margin. |
| **$-50.0\% \text{ to } -5.1\%$** | **`subsidized_expansion`**| Investment phase; subsidized by central hub during first 90 days. |
| **$< -50.0\%$** | **`critical_intervention`**| Unsustainable burn; trigger operational review or pause operations. |

---

## 4. Candidate Territory Feasibility Projections

Before activating candidate corridors (Tripura, North Bengal, Nagaland), feasibility models project their unit economics at scale:

| Target Corridor | Required Paying Contractors for Breakeven | Projected Monthly Revenue | Estimated Field Hub Cost | Target Margin % at 6 Months |
|---|---|---|---|---|
| **Tripura (`IN-TR`)** | 2 Pro Contractors (₹2,499) | ₹4,998.00 | ₹3,000.00 | **+39.9%** (`sustainable`) |
| **North Bengal (`IN-WB`)** | 2 Pro Contractors (₹2,499) | ₹4,998.00 | ₹3,200.00 | **+35.9%** (`sustainable`) |
| **Nagaland (`IN-NL`)** | 2 Pro Contractors (₹2,499) | ₹4,998.00 | ₹3,200.00 | **+35.9%** (`sustainable`) |

---

## 5. Conclusion

KAAMSETU's regional unit economics demonstrate that local operational hubs are self-sustaining and profitable on modest B2B subscription volumes, upholding 0% commission on worker wages forever.
