# KAAMSETU — PHASE 9 REVENUE, PRICING & UNIT ECONOMICS STRATEGY
## Sustainable SaaS Monetisation, 18% GST Reconciliation & Worker Wage Inviolability

**Milestone:** Phase 9 — Sustainable Growth & Scaled Monetisation  
**Primary Monetisation Model:** B2B SaaS Subscriptions + Institutional Verification Tooling  
**Core Ethical Invariant:** 0% commission on worker earnings. Platform services are 100% free for informal workers forever.

---

## 1. Monetisation Philosophy & Ethical Boundaries

KAAMSETU operates on an uncompromising ethical foundation:

> **We monetize software productivity and institutional compliance, never human vulnerability.**

Traditional informal labor markets extract between 10% and 30% of worker daily earnings through middlemen, labor contractors (thekedars), and exploitative marketplace commission apps. 

KAAMSETU completely rejects this model:
1. **0% Take Rate:** No transaction cut or matching commission is ever deducted from worker wages.
2. **Permanent Free Worker Access:** Audio onboarding, multi-dialect AI parsing, verifiable QR identity cards, portable profile exports, and direct customer discovery remain completely free for all workers.
3. **Enterprise & Institutional Funding:** Enterprises, contractors, and vocational training missions pay for software that replaces paper rosters, streamlines site compliance, eliminates ghost workers, and certifies verifiable skill outcomes.

---

## 2. Subscription Pricing Architecture

KAAMSETU offers three clear B2B tiers and custom Institutional packages:

```
+---------------------------------------------------------------------------------------+
|                                    PRICING TIERS                                      |
+-------------------+-------------------+-----------------------+-----------------------+
| Feature           | Starter (Free)    | Pro (Growth)          | Business (Scale)      |
+-------------------+-------------------+-----------------------+-----------------------+
| Target Customer   | Small Crew Lead   | Established Contractor| Multi-site Firm / EPC |
| Monthly Price     | ₹0                | ₹999 / month + GST    | ₹2,999 / month + GST  |
| Annual Price      | ₹0                | ₹9,990 / year + GST   | ₹29,990 / year + GST  |
| Annual Savings    | —                 | ~17% (2 Months Free)  | ~17% (2 Months Free)  |
| Max Active Roster | 5 Workers         | 25 Workers            | 100 Workers           |
| Active Projects   | 1 Project         | 5 Projects            | Unlimited             |
| Supervisors       | 1 (Owner Only)    | 3 Site Supervisors    | 10 Site Supervisors   |
| Verification Pack | Standard QR Scan  | Batch Credential Audit| Full Provenance Export|
| Support SLA       | Community / Web   | 24hr WhatsApp Support | Dedicated CS Account  |
+-------------------+-------------------+-----------------------+-----------------------+
```

### 2.1 Enterprise & Institutional Tier
- **Pricing:** ₹250 to ₹400 per certified graduate outcome (or annual recurring contract ₹1,80,000 to ₹4,50,000 / year).
- **Inclusions:** Multi-cohort lifecycle tracking, batch biometric/credential imports, official verifiable credential issuance (RFC 8785 + HMAC-SHA256), automated placement tracking, and state mission analytics reporting.

---

## 3. Financial Reconciliation & Tax Compliance (18% GST)

KAAMSETU operates in full compliance with the Indian Goods and Services Tax (GST) Act:

- **Service Accounting Code (SAC):** `998314` (Information technology software services and cloud-based application hosting).
- **GST Rate:** 18% (9% CGST + 9% SGST for intrastate Assam supplies; 18% IGST for interstate supplies such as Meghalaya).

### 3.1 Order Price Breakdown

| Plan Tier & Cycle | Base Amount (₹) | CGST 9% (₹) | SGST 9% (₹) | Total GST 18% (₹) | Gross Invoiced (₹) |
|---|---|---|---|---|---|
| **Pro Monthly** | ₹999.00 | ₹89.91 | ₹89.91 | ₹179.82 | **₹1,178.82** |
| **Pro Annual** | ₹9,990.00 | ₹899.10 | ₹899.10 | ₹1,798.20 | **₹11,788.20** |
| **Business Monthly** | ₹2,999.00 | ₹269.91 | ₹269.91 | ₹539.82 | **₹3,538.82** |
| **Business Annual** | ₹29,990.00 | ₹2,699.10 | ₹2,699.10 | ₹5,398.20 | **₹35,388.20** |

### 3.2 Automated Invoicing & Tax Ledger

1. Every captured transaction in `public.subscription_orders` records `base_amount`, `gst_amount`, `total_amount`, and payment gateway references (`gateway_payment_id`).
2. GST tax invoices are generated automatically with sequential serial numbers (`KS/2026-27/0001`) and compliant HSN/SAC codes.
3. Monthly reconciliation reports are matched against GSTR-1 and GSTR-3B filing data.

---

## 4. Unit Economics & Gross Margin Analysis

### 4.1 Cost to Serve (Per Active Paying Contractor / Month)

| Expense Component | Monthly Cost (₹) | Notes / Assumptions |
|---|---|---|
| **Cloud Database & Hosting (PostgreSQL)** | ₹45.00 | Localized edge nodes, connection pooling |
| **Storage & Bandwidth (Portfolio & Badges)** | ₹18.00 | WebP image compression, Supabase Storage |
| **AI Audio & Parsing API (Gemini Flash)** | ₹32.00 | ~8 onboarding audio transcriptions / mo |
| **Payment Gateway Processing Fees** | ₹23.58 | Razorpay standard 2.0% + GST on ₹1,178.82 |
| **SMS / WhatsApp Notification Delivery** | ₹14.00 | MSG91 / Gupshup transactional alerts |
| **Total Variable Cost of Service** | **₹132.58** | Variable COGS per contractor / month |

### 4.2 Gross Margin Calculation

- **Net Revenue (Pro Monthly):** ₹999.00
- **Variable Cost of Goods Sold (COGS):** ₹132.58
- **Gross Profit per Customer:** **₹866.42**
- **Gross Margin:** **86.73%**

High gross software margins (> 85%) ensure that KAAMSETU can achieve operating profitability at modest scale (approx. 80 paid contractor subscribers).

---

## 5. Revenue Trajectory & Sensitivity Scenarios

| Scenario | 6-Month MRR (₹) | 12-Month MRR (₹) | 24-Month MRR (₹) | Break-Even Month |
|---|---|---|---|---|
| **Conservative (Guwahati Only)** | ₹34,797 | ₹89,910 | ₹2,45,000 | Month 14 |
| **Moderate (Assam + Shillong)** | ₹55,000 | ₹1,75,000 | ₹5,50,000 | Month 9 |
| **Aggressive (NE Regional Scale)** | ₹95,000 | ₹3,20,000 | ₹11,50,000 | Month 6 |

---

## 6. Worker Wage Inviolability Audit Standard

To guarantee no back-door monetization of workers occurs:
1. All client invoices reflect software license and platform access fees only.
2. Worker payouts, wage negotiations, and job payments occur peer-to-peer (via UPI, cash, or direct contractor payroll).
3. The platform stores no worker escrow balances and charges 0 transaction fees on work completed.
4. Independent quarterly audits certify that 100% of reported software revenue originates from B2B and institutional SaaS contracts.
