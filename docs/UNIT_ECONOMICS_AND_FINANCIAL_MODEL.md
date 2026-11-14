# KAAMSETU — UNIT ECONOMICS & FINANCIAL MODEL
## Non-Extractive Monetisation, Variable Cost Optimization & 24-Month Projections

---

## 1. Core Economic Invariant: 0% Worker Extraction

KAAMSETU adheres to a fundamental socioeconomic principle:
> **A digital identity platform must never tax the livelihood of the vulnerable informal worker.**

Aggregator platforms that extract 20% commission create structural perverse incentives:
1. Workers conduct initial bookings on-platform and migrate subsequent transactions offline to evade commission.
2. Low-wage workers suffer wage degradation.
3. The platform is incentivized to treat workers as commoditized, interchangeable resources rather than sovereign craftsmen.

**KAAMSETU's non-extractive revenue pillars**:
- **B2B Contractor Pro SaaS**: ₹999/month (₹9,990/year)
- **B2B Contractor Business SaaS**: ₹2,999/month (₹29,990/year)
- **Optional Physical PVC/NFC Smart Skill Cards**: ₹99/card (Cost of goods sold: ₹38/card; gross margin: ₹61/card)
- **Institutional Outcome Reporting Subscriptions**: ₹25,000 to ₹75,000 per institutional cohort audit for state missions.

---

## 2. Worker Variable Unit Cost Breakdown (Onboarding & Storage)

A critical engineering objective in Phase 6 was driving down the variable cost per onboarded worker to under **₹1.00 ($0.012)**.

| Operational Component | Technical Driver | Cost per Worker Onboarded (INR) |
| :--- | :--- | :--- |
| **Voice Audio Ingestion** | In-browser Web Audio API downsampling (16kHz 16-bit mono WebM) | ₹0.00 |
| **Multilingual AI Extraction** | Gemini Flash 2.5 API with strict prompt optimization (~420 input tokens, ~180 output tokens) | ₹0.18 |
| **Database Row Insertion** | PostgreSQL indexed record on Supabase multi-tenant database | ₹0.04 |
| **Cryptographic Signing** | Local RFC 8785 Canonical JSON + HMAC-SHA256 signature calculation | ₹0.00 (Zero API cost) |
| **QR Code Bitmap Generation** | In-process Serverless PNG rasterization | ₹0.01 |
| **Portfolio Storage (5 Photos)** | Supabase Storage compressed WebP format (~120KB per image, ~600KB total) | ₹0.12 (First year retention) |
| **SMS OTP Verification** | Gupshup / Twilio SMS gateway (1 verification code per signup) | ₹0.22 |
| **Total Variable Cost Per Worker** | | **₹0.57 (Well under ₹1.00 target)** |

---

## 3. Contractor Pro SaaS Economics

| Metric | Contractor Pro (₹999/mo) | Contractor Business (₹2,999/mo) |
| :--- | :--- | :--- |
| **Monthly Subscription (ARPU)** | ₹999 | ₹2,999 |
| **Annual Contract Value (ACV)** | ₹11,988 (Monthly) / ₹9,990 (Annual) | ₹35,988 (Monthly) / ₹29,990 (Annual) |
| **Customer Acquisition Cost (CAC)** | ₹2,400 (Field contractor outreach) | ₹5,800 (Direct sales & demo) |
| **Monthly Churn Rate (Expected)** | 3.5% | 1.8% |
| **Average Lifetime (Months)** | 28.5 months | 55.5 months |
| **Customer Lifetime Value (LTV)** | ₹28,470 | ₹1,66,440 |
| **LTV / CAC Ratio** | **11.8x** | **28.7x** |
| **Payback Period** | **2.4 months** | **1.9 months** |

---

## 4. 24-Month Financial Projections (3 Scenarios)

### Scenario A: Conservative (Guwahati & Kamrup Metro Focus)
- Active Paid Contractors by Month 12: 120 (100 Pro, 20 Business)
- Active Paid Contractors by Month 24: 380 (310 Pro, 70 Business)
- Onboarded Skilled Workers: 12,000 (Month 12) -> 35,000 (Month 24)
- **Month 12 Monthly Recurring Revenue (MRR)**: ₹1,59,880 ($1,920 USD)
- **Month 24 Monthly Recurring Revenue (MRR)**: ₹5,19,620 ($6,260 USD)
- **Annual Run Rate at Month 24**: **₹62,35,440 (~₹62.3 Lakhs)**
- Net Operating Margin: **42%**

### Scenario B: Base Case (5-District Assam Cluster Rollout)
- Active Paid Contractors by Month 12: 350 (280 Pro, 70 Business)
- Active Paid Contractors by Month 24: 1,100 (850 Pro, 250 Business)
- Onboarded Skilled Workers: 30,000 (Month 12) -> 95,000 (Month 24)
- Physical Smart Cards Sold: 14,000 units (Net profit: ₹8.5 Lakhs)
- Institutional Cohort Subscriptions: 6 State Missions (₹18 Lakhs/year)
- **Month 12 MRR**: ₹4,89,650 ($5,900 USD)
- **Month 24 MRR**: ₹15,99,900 ($19,270 USD)
- **Annual Run Rate at Month 24**: **₹1,91,98,800 (~₹1.92 Crores)**
- Net Operating Margin: **58%**

### Scenario C: Growth Case (Assam + Regional Northeast Corridor Expansion)
- Active Paid Contractors by Month 12: 750 (600 Pro, 150 Business)
- Active Paid Contractors by Month 24: 2,800 (2,100 Pro, 700 Business)
- Onboarded Skilled Workers: 65,000 (Month 12) -> 240,000 (Month 24)
- Physical Smart Cards Sold: 48,000 units (Net profit: ₹29.2 Lakhs)
- **Month 12 MRR**: ₹10,49,250 ($12,640 USD)
- **Month 24 MRR**: ₹41,97,200 ($50,560 USD)
- **Annual Run Rate at Month 24**: **₹5,03,66,400 (~₹5.03 Crores)**
- Net Operating Margin: **67%**

---

## 5. Break-Even Analysis & Capital Requirements

- **Monthly Fixed Infrastructure Overhead**:
  - Supabase Pro Database & Storage Cluster: ₹4,500
  - Next.js Edge Hosting & CDN: ₹3,200
  - Gemini AI Batch Allocation: ₹6,000
  - Total Fixed Cloud Overhead: ~₹13,700 / month
- **Field Operations & Ground Team**:
  - 3 Field Operations Specialists (Guwahati & regional clusters): ₹90,000 / month
  - Total Monthly Operational Burn: ~₹1,05,000 / month
- **Break-Even Point**:
  - Reached with **85 Contractor Pro subscribers** (₹84,915 MRR) + **10 Contractor Business subscribers** (₹29,990 MRR) = **₹1,14,905 MRR**.
  - Timeline to Break-Even in Base Case: **Month 4 of Stage 1 rollout.**
