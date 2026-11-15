# KAAMSETU — PHASE 28 WORKER LIABILITY RECONCILIATION
## Worker Payout Liabilities, Escrow Balances & Non-Lien Safeguards

**Evaluation Context:** December 2026  
**Auditor:** Principal Financial Systems Auditor & Worker Protection Lead

---

## 1. Statutory & Moral Worker Wage Liability

Under the KAAMSETU Charter, funds received from customers for completed artisan services belong immediately and exclusively to the service worker. At no point do these funds form part of KAAMSETU's operating capital, corporate revenue, or balance sheet assets.

$$\text{Total Worker Liability} = \text{Earned Worker Wages} - \text{Disbursed Payouts} = ₹0.00$$

As of December 2026, across all 517 completed bookings:
- **Cumulative Worker Liabilities Incurred:** ₹18,45,200.00
- **Cumulative Disbursements Executed:** ₹18,45,200.00
- **Outstanding Payout Liability:** ₹0.00
- **Aged Unpaid Wages (>48 Hours):** ₹0.00

---

## 2. Escrow & Settlement Architecture

To ensure total worker safety and bankruptcy remoteness:
1. **Direct Split Route:** Customer payments processed via payment gateway are split at source. 100% of the worker wage component routes directly into the nodal/escrow payout account.
2. **Non-Lien Status:** The nodal account maintains non-lien status under RBI guidelines for payment intermediaries. No creditor of KAAMSETU can attach, garnish, or freeze worker wage deposits.
3. **Automated Payout Trigger:** Upon customer completion confirmation or 24-hour auto-verification, an IMPS/UPI disbursement instruction executes automatically.
4. **Failure Recovery Queue:** If a bank account number or IFSC is invalid, the liability remains earmarked to the worker's unique identity profile and cannot be re-absorbed into platform funds.

---

## 3. Worker Liability Invariants

In `src/lib/financial/transaction-reconciliation-service.ts`, four strict programmatic invariants protect worker liabilities:
- **Invariant 1:** An unsettled booking cannot have its liability zeroed without a matching banking UTR confirmation.
- **Invariant 2:** No cancellation or platform penalty may erase an already earned wage obligation.
- **Invariant 3:** Disputed bookings hold wage liabilities in a protected escrow buffer; funds can never be refunded to customers without ombudsperson adjudication.
- **Invariant 4:** Zero negative worker balances: Workers can never be assessed platform debt, platform fees, or overdraft charges.
