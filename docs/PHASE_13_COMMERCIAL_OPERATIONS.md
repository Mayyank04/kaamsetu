# KAAMSETU — PHASE 13 COMMERCIAL OPERATIONS
## SaaS Monetisation Model, Contractor Tiers, Webhook Security & Zero Worker Take-Rate

**Protocol:** KAAMSETU National Commercial Operations Model  
**Repository:** `Mayyank04/kaamsetu`  
**Branch:** `phase-13-national-operations-scale`  
**Date:** November 15, 2026  
**Auditor / Author:** Chief Commercial Officer & Fintech Security Engineer  

---

### 1. Commercial Philosophy & The Constitutional Guarantee

KAAMSETU operates on a strict, ethical monetization model:

> **Constitutional Guarantee:**  
> **Workers never pay.** Basic digital identity registration, skill verification, profile publication, and physical QR identity cards are **FREE FOREVER**.  
> The platform extracts **EXACTLY 0.00% commission** from worker daily wages or project payouts.

Platform revenues are generated exclusively from B2B SaaS subscriptions paid by contractor organizations, construction firms, and institutional skilling bodies who derive immense productivity value from verified workforce deployment, automated attendance, and compliance tools.

---

### 2. B2B Subscription Tiers & Pricing Schedule

| Subscription Tier | Monthly Fee (excl. GST) | 18% GST | Gross Monthly | Annual Discounted (2 Months Free) | Max Active Workers | Target Customer Segment |
|---|---|---|---|---|---|---|
| **Free / Starter** | ₹0 | ₹0 | ₹0 | ₹0 | Up to 5 | Individual master craftsmen, micro-contractors |
| **Contractor Pro** | ₹2,499 | ₹449.82 | ₹2,948.82 | ₹24,990 / yr | Up to 35 | Mid-size electrical, plumbing, masonry contractors |
| **Enterprise Fleet** | ₹9,999 | ₹1,799.82 | ₹11,798.82 | ₹99,990 / yr | Up to 200 | Commercial construction builders, infrastructure EPCs |

#### Features Included in Paid Tiers:
- Advanced 4-Vector Candidate Matching Engine.
- Multi-project crew scheduling and shift allocation.
- Priority verification of site craftspeople.
- Automated tax and GST-compliant compliance exports.
- Multi-supervisor administrative access.

---

### 3. Payment Gateway Integration & Webhook Security

Online billing is processed through Razorpay with fintech-grade cryptographic non-repudiation (`src/lib/billing/payment-service.ts`):

#### 3.1 HMAC-SHA256 Signature Verification
Every incoming payment webhook payload must provide `x-razorpay-signature`:
$$\text{Signature} = \text{HMAC-SHA256}(\text{Raw Request Body}, \text{WEBHOOK\_SECRET})$$
Signatures are validated using constant-time comparison (`crypto.timingSafeEqual`) to prevent timing side-channel attacks.

#### 3.2 Webhook Replay Defense (300-Second Window)
To prevent replay attacks where an attacker re-submits a previously captured valid payment confirmation:
- The webhook payload timestamp is evaluated against current server time.
- If $|\text{Current Time} - \text{Webhook Timestamp}| > 300 \text{ seconds}$, the webhook is **STRICTLY REJECTED**.

Verified in Phase 8 Test 4 and Phase 13 Test 21.

#### 3.3 Billing Idempotency & Duplicate Order Prevention
- Payment orders are assigned unique UUIDs and invoice numbers.
- `public.payment_webhook_events` enforces a `UNIQUE(order_id)` constraint.
- Duplicate webhooks for an already captured transaction are safely acknowledged with `HTTP 200 OK` (`idempotent_duplicate`) without double-crediting quotas.

Verified in Phase 13 Test 20.

---

### 4. Contractor CRM Funnel & Conversion Operations

Commercial growth is managed through `public.crm_contractor_leads` and `public.partner_crm_records`:

```
[ PROSPECT ] ──> [ CONTACTED ] ──> [ DEMO_COMPLETED ] ──> [ PROPOSAL_SENT ] ──> [ CLOSED_WON ]
                                                                                   (Paying Customer)
```

- Each lead is tracked with lead source, estimated workforce size, decision-maker contact details, and conversion probability.
- Automated telemetry flags high-usage Starter accounts that exceed 5 workers, triggering sales outreach for Pro tier upgrade.
- Customer health scoring (`public.contractor_customer_health`) tracks monthly active crew assignments and login frequency to prevent churn.

Verified in Phase 9 Test 1 and Phase 10 Test 14.
