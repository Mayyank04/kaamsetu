# KAAMSETU — PHASE 23 UNIT ECONOMICS & FINANCIAL GOVERNANCE
## B2B SaaS Operating Model, Statutory 18% GST Reconciliation & Multi-Year Scenario Models

**Core Mission:** "Every skill deserves to be seen, even without a degree."  
**Constitutional Invariant:** 0.00% commission on worker wages (`platform_commission_amount = 0.00`).  
**Auditor Designation:** Principal Financial Systems Auditor & Commercial Operations Lead  
**Date:** November 15, 2026

---

### 1. The Ethical Monetization Model

KAAMSETU demonstrates that a digital labor identity platform can achieve financial viability without extracting fees from workers.

All platform operating costs, cloud hosting, SMS gateways, and field kiosks are funded entirely by:
1. **Contractor Pro SaaS Licenses:** Paid by infrastructure and civil contractors for verified workforce compliance, crew geofencing, and automated GeM Form B billing.
2. **Institutional Analytics Subscriptions:** Paid by state skill missions and vocational training academies for cohort tracking.
3. **Zero Worker Extraction:** Worker registration, credential issuance, and job discovery are **100% free forever** (`platform_commission_amount = 0.00`).

---

### 2. Audited Commercial P&L & Tax Reconciliation

| Financial Item | Annual Audited Value (INR) | Accounting Standard & Notes |
| :--- | :--- | :--- |
| **B2B SaaS Annual Software Subscriptions** | ₹4,50,000.00 | 3 Contractor Pro Licenses @ ₹1.5L/yr (Ind AS 115) |
| **Goods & Services Tax (GST @ 18.00%)** | **₹81,000.00** | SAC 998313 (IT Software as a Service); Remitted |
| **Gross Invoiced Commercial Billing** | **₹5,31,000.00** | Fully reconciled with GSTR-1 filings |
| **Cloud Hosting & DB Compute (COGS)** | ₹1,20,000.00 | Dedicated PostgreSQL 15, DR replication & edge |
| **SMS OTP & Vernacular Audio Gateway** | ₹45,000.00 | Brute-force rate-limited OTP and voice bridges |
| **Field Kiosk Operations & Audit Supplies** | ₹20,000.00 | Paltan Bazaar & Police Bazar partner kiosks |
| **TOTAL COST OF GOODS SOLD (COGS)** | **₹1,85,000.00** | Direct software and operational delivery costs |
| **GROSS OPERATING PROFIT** | **₹2,65,000.00** | **Gross Software Margin: 58.89% (~58.9%)** |
| **Worker Wage Escrow / Withholding** | **₹0.00** | **Direct worker receipt: Zero platform float** |

#### Reconciliation Precision
The commercial ledger (`public.subscription_orders` and `public.billing_invoices`) validates that invoice totals, GST liabilities, and subtotal lines match to within **₹0.01 tolerance**, preventing rounding drift.

---

### 3. Multi-Year Financial Operating Scenarios

To ensure long-term sustainability without resorting to worker monetization, KAAMSETU models three disciplined scenarios:

| Scenario | Year 1 (FY27) ARR | Year 2 (FY28) ARR | Year 3 (FY29) ARR | Active Contractor Orgs | Gross Margin % | Worker Fee Model |
| :--- | :---:| :---:| :---:| :---:| :---:| :---:|
| **1. Conservative** | ₹12,00,000 | ₹28,00,000 | ₹55,00,000 | 8 → 18 → 35 | **55.0%** | **0.00% Forever** |
| **2. Base Plan** | ₹25,00,000 | ₹65,00,000 | ₹1,40,00,000 | 16 → 42 → 90 | **62.5%** | **0.00% Forever** |
| **3. Upside Scale** | ₹45,00,000 | ₹1,20,00,000 | ₹2,80,00,000 | 30 → 80 → 180 | **71.0%** | **0.00% Forever** |

#### Revenue Recognition & Pipeline Rules
- Unsigned contracts and exploratory MoUs are strictly excluded from recognized revenue and held in an unbooked `commercial_pipeline` ledger.
- Software licenses are recognized pro-rata on a monthly basis ($\frac{1}{12}\text{th}$ per month) under Ind AS 115.
