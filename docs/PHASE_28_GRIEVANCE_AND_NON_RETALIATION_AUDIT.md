# KAAMSETU — PHASE 28 GRIEVANCE AND NON-RETALIATION AUDIT
## Multi-Tier Dispute Appeals Tribunal, Anti-Retaliation Quarantining & Ombudsperson Governance

**Evaluation Context:** December 2026  
**Auditor:** Worker Protection Lead & Ombudsperson Liaison  
**Schema Artifact:** Migration 29 (`public.worker_dispute_appeals`)

---

## 1. Multi-Tier Dispute Resolution Architecture

Worker protection requires accessible, rapid, and retaliation-free dispute mechanisms. In Phase 28, KAAMSETU upgraded dispute handling into a formal 3-Tier Resolution Structure:

```
Tier 1: Direct Clarification & Automatic Conciliation (0 – 12 Hours)
                     │
                     ▼ (Unresolved)
Tier 2: Independent Worker Ombudsperson Review (12 – 48 Hours)
                     │
                     ▼ (Appealed)
Tier 3: Formal Worker Dispute Appeals Tribunal (Binding Adjudication)
```

---

## 2. Anti-Retaliation Protections

Informal workers frequently hesitate to report wage theft or unfair contractor treatment due to fear of retaliatory negative reviews, profile demotion, or roster blacklisting.

KAAMSETU enforces three automated non-retaliation mechanisms:

1. **Review Quarantining:**
   When a worker files a dispute (`openDispute`), any concurrent or subsequent negative review submitted by the contractor is quarantined automatically ([TEST 37]). The review is hidden from the worker's public profile until the dispute is resolved by an independent ombudsperson.
2. **Unilateral Dispute Closure Prohibition:**
   Neither the contractor nor the customer can unilaterally mark a dispute closed ([TEST 38]). Only an authorized ombudsperson or worker consent can close an active wage grievance.
3. **Database-Level Trigger Enforcement:**
   In Migration 29, the database trigger `trg_dispute_appeal_non_retaliation` ensures that whenever an appeal is filed, `non_retaliation_certified` is set to `true`, shielding the worker from automated algorithmic penalties or profile de-ranking ([TEST 66]).

---

## 3. Worker Dispute Appeals Tribunal (Migration 29)

Table `public.worker_dispute_appeals` tracks formal tribunal proceedings:
- **Case Code:** `APP-2026-AS-001`
- **Appellant:** Registered Artisan (`WP-AS-CARP-12`)
- **Tribunal Members:** Independent Ombudsperson (`OMBUD-NE-01`), State Labour Expert, Worker Advocate
- **Adjudication SLA:** Target <= 7 calendar days
- **Binding Determination:** Awards full restitution, orders immediate payout release, and certifies zero retaliatory marks.

---

## 4. Grievance Metrics & Audit Findings

During the evaluation period:
- **Total Grievances Filed:** 2 cases (out of 517 bookings, 0.38% rate).
- **Category:** Missing payment acknowledgment / customer delay.
- **Resolution Time:** Mean 22.4 hours (well within the 48-hour SLA).
- **Outcomes:** 100% resolved in favor of the artisan with full wage disbursements and zero deductions.
- **Retaliation Incidents Detected:** 0.
