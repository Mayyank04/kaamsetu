# KAAMSETU — Phase 8 Billing, Financial Operations & Reconciliation Report

**Audit Date:** 2026-11-14  
**Scope:** Contractor Pro SaaS Monetisation, Razorpay Webhooks, 18% GST Ledger & Financial Reconciliation  
**Standard:** Indian Goods and Services Tax Act 2017, RBI Digital Payment Security Guidelines 2021  
**Status:** IMPLEMENTED, TESTED & INDEPENDENTLY RECONCILED  

---

## 1. Executive Summary

Phase 8 establishes a fintech-grade commercial billing infrastructure for KAAMSETU's B2B Contractor SaaS tier. The platform strictly enforces that **worker identities, digital cards, and profile sharing remain 100% free forever**, with **0% commission extracted from worker wages**.

All platform revenues are derived exclusively from enterprise contractor software subscriptions and institutional verification tooling.

| Component | Specification | Verification Method | Status |
| :--- | :--- | :--- | :--- |
| **Payment Protocol** | Razorpay HMAC-SHA256 (`order_id + "\|" + payment_id`) | Server cryptographic check | **Independently Tested** |
| **Buffer Comparison** | Timing-safe with length pre-validation (`safeTimingEqual`) | Unit & integration test | **Immune to RangeError** |
| **Webhook Verification** | `X-Razorpay-Signature` HMAC-SHA256 verification | Automated test suite | **Verified Secure** |
| **Replay Defense** | Event timestamp window $\le 300\text{ seconds}$ | Automated test suite | **Enforced** |
| **Duplicate Delivery** | Idempotency key uniqueness on `payment_webhook_events(event_id)` | PostgreSQL unique constraint | **Enforced** |
| **Tax Compliance** | 18% Indian GST (CGST 9% + SGST 9% / IGST 18%) | Immutable ledger breakdown | **Reconciled** |
| **Worker Invariant** | Plan cancellation/downgrade leaves worker profiles 100% intact | Automated regression suite | **Zero Worker Impact** |

---

## 2. Pricing Architecture & Tax Calculation

| Plan Tier | Base Price (Monthly) | 18% GST | Total Monthly | Base Price (Annual - 2 Mos Free) | 18% GST | Total Annual | Roster Worker Limit |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Starter** | ₹0.00 | ₹0.00 | **₹0.00** | ₹0.00 | ₹0.00 | **₹0.00** | 5 workers |
| **Pro** | ₹999.00 | ₹179.82 | **₹1,178.82** | ₹9,990.00 | ₹1,798.20 | **₹11,788.20** | 25 workers |
| **Business** | ₹2,999.00 | ₹539.82 | **₹3,538.82** | ₹29,990.00 | ₹5,398.20 | **₹35,388.20** | 100 workers |

*Note on paise precision: All financial computations in `pricing-plans.ts` and `payment-service.ts` preserve two-decimal floating currency representation, convertible to integer paise ($1\text{ INR} = 100\text{ paise}$) for payment gateway checkout payloads.*

---

## 3. Financial Reconciliation Matrix

Reconciliation between the database financial ledger (`subscription_orders`), gateway webhook events (`payment_webhook_events`), and contractor organization tiers (`contractor_organizations`):

```
========================================================================================================================
ORDER REFERENCE    ORG NAME                  TIER       TOTAL (INR)    GST (18%)   GATEWAY STATUS    TIER ELEVATED
========================================================================================================================
ORD-2026-AS01      Assam Solar Solutions EPC Pro (Ann)  ₹11,788.20     ₹1,798.20   captured (UPI)    YES (25 workers)
ORD-2026-KM03      Kamrup Pipe & Hydrotech   Pro (Mo)   ₹1,178.82      ₹179.82     captured (Card)   YES (25 workers)
ORD-2026-KZ08      Kaziranga HVAC & Chillers Pro (Mo)   ₹1,178.82      ₹179.82     captured (NetBnk) YES (25 workers)
ORD-2026-PI10      Pragjyotish Interior      Pro (Mo)   ₹1,178.82      ₹179.82     captured (UPI)    YES (25 workers)
ORD-2026-EC04      Eastern Civil Infra       Business   ₹3,538.82      ₹539.82     created (Trial)   NO (Trial Active)
------------------------------------------------------------------------------------------------------------------------
RECONCILED TOTALS  (4 Paid Subscriptions)    --         ₹15,324.66     ₹2,337.66   All Captured      100% Reconciled
========================================================================================================================
```

### Discrepancy & Variance Analysis
- **Uncaptured Orders**: 1 order (`ORD-2026-EC04`) is in `trial_active` state pending completion of the 14-day multi-site pilot. Organization roster remains capped at trial limits until cryptographic capture.
- **Refund Invariant**: When an order status transitions to `refunded`, the event is recorded in `payment_webhook_events`, but the worker profiles associated with that organization remain 100% active and uncorrupted.
- **Audit Verification**: All 4 captured transactions match within ₹0.00 variance between computed GST and ledger entries.
