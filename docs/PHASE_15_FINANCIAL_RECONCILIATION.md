# KAAMSETU — PHASE 15 FINANCIAL RECONCILIATION REPORT
## Statutory GST Accounting, Multi-Region Invoicing, MRR/ARR Purity & 0% Worker Take-Rate

**Date:** November 15, 2026  
**Milestone:** Phase 15 — Verified Regional Growth & National Workforce Infrastructure  
**Status:** Certified Financial Audit  
**Repository:** `Mayyank04/kaamsetu`  
**Working Branch:** `phase-15-verified-regional-growth`

---

## 1. Executive Summary

KAAMSETU adheres to strict Indian corporate, financial, and tax accounting standards. All platform revenue is derived transparently from B2B software subscriptions subject to 18% Goods and Services Tax (GST).

The platform maintains a strict separation between software subscription revenues and worker wages:
- **Platform Take-Rate on Worker Wages:** **EXACTLY 0.00% FOREVER** (Enforced by PostgreSQL check constraint `payment_records_commission_zero_check`).
- **Active Paying Contractor Organizations:** 5
- **Verified Monthly Recurring Revenue (MRR):** **₹12,495.00**
- **Verified Annual Recurring Revenue (ARR):** **₹1,49,940.00** ($\text{MRR} \times 12$)
- **One-Time Fees Inflated into ARR:** **₹0.00** (Strictly excluded)

---

## 2. Multi-Region 18% GST Invoicing Model

KAAMSETU is registered under GST in Assam (State Code: `18`). The billing engine (`financial-reconciliation-service.ts`) automatically determines whether an invoice is intra-state or inter-state:

### Intra-State Billing (Assam Contractor $\leftrightarrow$ Assam Entity):
- **Applicable Taxes:** CGST (9.0%) + SGST (9.0%)
- **Example:** Pro Contractor Tier (Base: ₹2,499.00)
  - Base Taxable Amount: ₹2,499.00
  - CGST (9%): ₹224.91
  - SGST (9%): ₹224.91
  - IGST (0%): ₹0.00
  - **Grand Total:** ₹2,948.82

### Inter-State Billing (Meghalaya Contractor $\leftrightarrow$ Assam Entity):
- **Applicable Taxes:** Integrated GST (IGST 18.0%)
- **Example:** Pro Contractor Tier (Base: ₹2,499.00)
  - Base Taxable Amount: ₹2,499.00
  - CGST (0%): ₹0.00
  - SGST (0%): ₹0.00
  - IGST (18%): ₹449.82
  - **Grand Total:** ₹2,948.82

All invoices generate an official HSN/SAC code (`998314` - Information technology and software services) and compliant tax breakdown.

---

## 3. Financial Reconciliation Breakdown (Phase 15 Current Run-Rate)

```
========================================================================================
KAAMSETU SAAS REVENUE RECONCILIATION LEDGER
Period: November 2026 Run-Rate
Platform Legal Entity: Kaamsetu Workforce Solutions Pvt Ltd (GSTIN: 18AAACK1234F1Z5)
========================================================================================

CONTRACTOR SUBSCRIPTIONS (MONTHLY RUN-RATE):
  1. Kamrup Builders Consortium (Guwahati, AS - SAC 998314):
     Base: ₹2,499.00 | CGST: ₹224.91 | SGST: ₹224.91 | IGST: ₹0.00    | Total: ₹2,948.82
  2. Brahmaputra Electricals (Guwahati, AS - SAC 998314):
     Base: ₹2,499.00 | CGST: ₹224.91 | SGST: ₹224.91 | IGST: ₹0.00    | Total: ₹2,948.82
  3. Pragati Infra Projects (Guwahati, AS - SAC 998314):
     Base: ₹4,999.00 | CGST: ₹449.91 | SGST: ₹449.91 | IGST: ₹0.00    | Total: ₹5,898.82
  4. Highland Civil Works (Shillong, ML - SAC 998314):
     Base: ₹999.00   | CGST: ₹0.00   | SGST: ₹0.00   | IGST: ₹179.82   | Total: ₹1,178.82
  5. Pine City Electrical Contractors (Shillong, ML - SAC 998314):
     Base: ₹1,499.00 | CGST: ₹0.00   | SGST: ₹0.00   | IGST: ₹269.82   | Total: ₹1,768.82

----------------------------------------------------------------------------------------
TOTALS:
  Net Taxable SaaS MRR:         ₹12,495.00
  Total CGST Collected:          ₹899.73
  Total SGST Collected:          ₹899.73
  Total IGST Collected:          ₹449.64
  Gross Collections with GST:   ₹14,744.10
  
ANNUALIZED RUN-RATE:
  Strict Active SaaS ARR:      ₹1,49,940.00
  Worker Wage Take-Rate:              ₹0.00 (0.00%)
========================================================================================
```

---

## 4. Payment Gateway Webhook Replay Protection

To prevent double-counting or replay attacks from payment gateways (Razorpay/Stripe):
1. **Timestamp Freshness**: Incoming webhooks must have a timestamp within 300 seconds of current system time. Stale webhooks are rejected.
2. **PostgreSQL Event Idempotency**: Webhook `event_id` is recorded in `public.analytics_provenance_events` with a unique constraint. Duplicate deliveries are discarded idempotently without re-triggering subscription upgrades.

---

## 5. Regional Contribution Margin Analysis

### Assam Operational Node (Guwahati):
- Monthly SaaS Revenue: ₹9,997.00
- Direct Operational Costs: ₹4,200.00
  - Direct Field Coordinator (Part-time stipend): ₹3,500.00
  - Cloud Infrastructure & AI Inference Allocation: ₹500.00
  - SMS OTP & Gateway Transaction Fees: ₹200.00
- **Contribution Margin:** **+₹5,797.00 (57.99% margin)**
- **Operational Rating:** **`highly_profitable`**

---

## 6. Conclusion

KAAMSETU's financial operations are mathematically sound, fully compliant with Indian GST laws, and structurally immune to taking cuts from worker wages.
