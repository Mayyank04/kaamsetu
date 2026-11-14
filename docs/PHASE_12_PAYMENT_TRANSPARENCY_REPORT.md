# KAAMSETU — PHASE 12 PAYMENT TRANSPARENCY REPORT
## Constitutional 0% Take-Rate Invariant, Transparent Wage Ledgers & Discrepancy Tracking

**Protocol:** KAAMSETU Transparent Financial Infrastructure  
**Constitutional Mandate:** 0.00% Platform Commission on Worker Wages Free Forever  
**Date:** November 15, 2026  

---

### 1. The Constitutional Non-Negotiable: 0.00% Platform Take-Rate

Gig platforms and gig intermediaries routinely extract 15% to 30% of informal worker earnings through opaque service charges, lead fees, and platform commissions. 

KAAMSETU was founded on an unbreakable constitutional promise:
> **"Every rupee earned by a craftsperson belongs 100% to that craftsperson. KAAMSETU extracts exactly 0.00% commission from worker wages."**

This is not a temporary promotional discount. In Phase 12, this principle is enforced directly at the **PostgreSQL storage engine level**:

```sql
-- PostgreSQL Check Constraint Enforcing Constitutional 0% Take-Rate
ALTER TABLE public.payment_records_ledger 
  ADD CONSTRAINT payment_records_commission_zero_check 
  CHECK (platform_commission_amount = 0.00);
```

Any attempt by application code, an errant backend worker, or an administrative script to insert a non-zero commission into `payment_records_ledger` is aborted by the database kernel with a fatal constraint violation error.

---

### 2. Transparent Payment Record Architecture (`payment_records_ledger`)

To eliminate wage discrepancies between what commercial clients pay and what workers actually receive, Phase 12 introduces a dual-entry payment provenance ledger:

| Column | Data Type | Constraint | Purpose |
|---|---|---|---|
| `id` | `UUID` | Primary Key | Globally unique payment record identifier |
| `worker_profile_id` | `UUID` | FK `worker_profiles(id)` | Recipient worker identifier |
| `booking_id` | `UUID` | FK `bookings(id)` NULL | Associated direct booking (optional) |
| `opportunity_id` | `UUID` | FK `workforce_opportunities(id)` NULL | Associated project opportunity (optional) |
| `employer_declared_amount` | `NUMERIC(10,2)` | `> 0` | Gross amount declared and budgeted by employer |
| `worker_agreed_amount` | `NUMERIC(10,2)` | `> 0` | Net daily wage agreed with worker prior to dispatch |
| `amount_invoiced` | `NUMERIC(10,2)` | `> 0` | Amount invoiced to commercial project account |
| `amount_paid` | `NUMERIC(10,2)` | `> 0` | Verifiable amount actually disbursed to worker |
| `platform_commission_amount`| `NUMERIC(10,2)` | `CHECK (= 0.00)` | Strictly 0.00 (Constitutional Invariant) |
| `payment_evidence_ref` | `TEXT` | Optional | Bank UTR / UPI transaction reference ID |
| `disputed_amount` | `NUMERIC(10,2)` | Default `0.00` | Amount contested in active mediation |
| `resolution_status` | `TEXT` | `CHECK (IN ...)` | `settled`, `disputed`, `reconciled` |

---

### 3. Discrepancy Tracking & Wage Theft Detection

A common abuse pattern in Indian subcontracting occurs when an EPC contractor bills ₹1,200/day for a solar technician, but the local subcontractor pays the worker only ₹600/day, pocketing the ₹600 difference.

The `payment_transparency_service` actively computes discrepancy ratios:
$$\text{WageDiscrepancy} = \text{employerDeclaredAmount} - \text{amountPaid}$$

- If $\text{amountPaid} < \text{workerAgreedAmount}$, the record is flagged as `disputed` with the deficit recorded in `disputed_amount`.
- A formal wage discrepancy alert is routed to the Regional Director.
- Repeated discrepancies by a contractor trigger an automated suspension of the contractor's hiring privileges.

---

### 4. Commercial Monetization vs Worker Wages

KAAMSETU's commercial revenue model is completely decoupled from worker earnings:
- **Workers:** 100% free digital identity, free QR card, free verified credentials, 0% commission on all earnings forever.
- **Contractors & Employers:** Pay fixed monthly SaaS subscription fees (Contractor Pro ₹2,499/mo, Contractor Business ₹7,999/mo) for enterprise crew management tools, multi-supervisor rosters, and project scheduling software.
- **Institutions:** Pay structured administrative fees for enterprise batch credential verification and accreditation analytics.

This clean separation ensures KAAMSETU's financial incentives are permanently aligned with worker empowerment, never worker extraction.
