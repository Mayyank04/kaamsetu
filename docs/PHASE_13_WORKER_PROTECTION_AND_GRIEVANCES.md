# KAAMSETU — PHASE 13 WORKER PROTECTION AND GRIEVANCES
## Grievance Redressal, 7-Day Mediation SLA, Anti-Retaliation Defense & DPDP Profile Rectification

**Protocol:** KAAMSETU Worker Protection and Trust Framework  
**Repository:** `Mayyank04/kaamsetu`  
**Branch:** `phase-13-national-operations-scale`  
**Date:** November 15, 2026  
**Auditor / Author:** Worker Welfare Ombudsman & Application Security Engineer  

---

### 1. Protection Framework Overview

Informal blue-collar workers in India lack institutional safety nets, formal employment contracts, and dispute resolution channels. When disputes occur over unpaid wages or unsafe working conditions, workers face severe power imbalances, including retaliatory negative reviews that destroy their livelihoods.

KAAMSETU establishes a comprehensive worker protection infrastructure:
1. **Confidential Dispute Filing**: Evidence and identity protected by PostgreSQL RLS.
2. **Automated 7-Day Mediation SLA**: Strict operational accountability.
3. **Automatic Retaliatory Review Quarantine**: Defense against vindictive reviews.
4. **Mandatory Restitution Proof**: Verified UPI/bank receipt required to close wage disputes.
5. **DPDP Right to Rectification**: Auditable self-correction of erroneous profile data.
6. **SIM-Swap Protection**: Defense against fraudulent account takeover.

---

### 2. Automated 7-Day Mediation SLA

Every worker dispute submitted via `POST /api/worker/grievance` is assigned a strict 7-day completion window:

$$\text{sla\_due\_at} = \text{created\_at} + 7 \text{ calendar days}$$

```sql
ALTER TABLE public.worker_disputes
  ADD COLUMN sla_due_at timestamptz DEFAULT now() + INTERVAL '7 days';
```

#### Dispute Lifecycle:
1. **`submitted`**: Worker logs dispute with claimed amount, category (`unpaid_wages`, `hazardous_conditions`, `contractor_misconduct`), and encrypted evidence URLs.
2. **`under_mediation`**: Assigned regional ombudsman initiates structured conciliation with the contractor.
3. **`escalated`**: If unresolved after 4 business days or if contractor fails to respond, dispute escalates to national operations review.
4. **`resolved_worker_upheld`**: Contractor agrees to settle or platform upholds worker claim.
5. **`resolved_dismissed`**: Claim dismissed with written legal justification.

Verified in Phase 13 Test 16.

---

### 3. Retaliatory Review Automatic Quarantine Engine

When workers report contractors for wage theft or abusive site conditions, bad-faith contractors routinely attempt to destroy the worker's reputation by posting defamatory 1-star reviews.

Phase 13 implements the **Anti-Retaliation Quarantine Engine** (`evaluateRetaliatoryReviewQuarantine` in `src/lib/disputes/grievance-service.ts`):

```typescript
export function evaluateRetaliatoryReviewQuarantine(input: {
  reviewRating: number;
  hasActiveDisputeWithReviewer: boolean;
  daysSinceDisputeOpened: number;
}): { shouldQuarantine: boolean; quarantineReason?: string }
```

#### Quarantine Trigger Rules:
- If a contractor submits a review with rating $\le 2$ stars, AND
- The worker has an active, unresolved grievance against that contractor, AND
- The dispute was opened within the preceding 14 days:
  $$\text{Result: } \textbf{AUTOMATIC QUARANTINE}$$

#### Impact on KaamScore:
- Quarantined reviews are flagged `is_quarantined = true` in `public.reviews`.
- They are excluded from worker average rating calculations and KaamScore formula inputs.
- The review remains hidden from the public until the mediation desk determines whether the review is legitimate or retaliatory.

Verified in Phase 13 Test 17.

---

### 4. Mandatory Restitution Proof for Wage Disputes

A wage non-payment grievance cannot be resolved on verbal contractor assurances. Resolution requires concrete financial evidence:

```typescript
export function validateWageDisputeResolution(input: {
  disputeCategory: string;
  resolutionStatus: string;
  hasFinancialRestitutionProof: boolean;
  restitutionTransactionRef?: string;
}): { isValid: boolean; error?: string }
```

- When resolving an `unpaid_wages` dispute as `resolved_worker_upheld`, the mediator must attach `restitution_evidence_url` and a valid bank or UPI reference number.
- Without cryptographic or banking proof of full payment, the system prevents dispute closure.

Verified in Phase 11 Test 15 and Phase 13 Test 16.

---

### 5. DPDP Act Right to Rectification (`public.profile_corrections`)

Under Section 12 of the DPDP Act (2023), data principals have the right to correct inaccurate personal data:
- Workers can initiate correction requests for misspelled names, erroneous trade categorizations, or inaccurate dates of birth.
- Correction requests are logged with timestamp, requesting user, requested changes, and audit rationale.
- Approved corrections update `worker_profiles` and are stamped in the immutable ledger.

Verified in Phase 13 Test 18.

---

### 6. SIM-Swap Defense & Manual Account Recovery Queue

In India, illegal SIM swapping is a leading vector for financial fraud and identity theft. Because KAAMSETU profiles anchor worker reputations, automated OTP handover during account recovery presents severe risk:
- When a worker reports a lost SIM or phone number change, the system does not immediately send SMS reset codes to the new number.
- Account recovery is routed to a manual verification queue where a regional coordinator verifies physical identity (via Aadhaar biometric hash, physical QR card serial number, or video verification) before migrating profile ownership.

Verified in Phase 12 Test 8.
