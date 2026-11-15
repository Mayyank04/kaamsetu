# KAAMSETU — PHASE 23 INSTITUTIONAL EVIDENCE DASHBOARD
## Dual-View Architecture, Provenance Traceability & Anti-Self-Approval Governance

**Core Mission:** "Every skill deserves to be seen, even without a degree."  
**Constitutional Invariant:** 0.00% commission on worker wages (`platform_commission_amount = 0.00`).  
**Auditor Designation:** Principal Systems Auditor & Release Governance Lead  
**Date:** November 15, 2026

---

### 1. The Evidence Provenance Mandate

Institutional stakeholders (state skill missions, national open networks, infrastructure agencies, labor departments) cannot rely on static marketing summaries. Every reported operational milestone must be backed by an immutable provenance trail.

KAAMSETU separates claims into 7 distinct evidential states:
$$\mathbf{Technical\text{ }Readiness} \longrightarrow \mathbf{Legal\text{ }Execution} \longrightarrow \mathbf{Operational\text{ }Authorization} \longrightarrow \mathbf{Actual\text{ }Deployment} \longrightarrow \mathbf{Worker\text{ }Outcome} \longrightarrow \mathbf{Payment\text{ }Verification} \longrightarrow \mathbf{Independent\text{ }Review}$$

---

### 2. Anti-Self-Approval Governance Rule

To prevent internal fabrication or unauthorized milestone promotion:
1. **Developer / Operator Quarantine:** Software developers and regional field recruiters are strictly blocked from approving their own high-risk operational claims in `audit_evidence_review_events`.
2. **Dual-Sign-Off Requirement:** Transitions to `attestation_active` status require digital signature concurrence from two distinct roles:
   - Primary: Regional Field Operations Controller
   - Secondary: Independent Institutional Assurance Engineer
3. **Dispute Invalidation:** If any claim is challenged by an external auditor or worker, its status shifts to `challenge_flagged`, instantly freezing public dashboard badges.

---

### 3. Dual-View Operations Dashboard Architecture

The Unified Operations Dashboard serves two distinct audiences through strictly segregated API contracts:

```
                          [KAAMSETU DATA STORE]
                                    │
         ┌──────────────────────────┴──────────────────────────┐
         ▼                                                     ▼
[/api/governance/dashboard/public]          [/api/governance/dashboard/audit]
  - Citizen & Consumer Facing                 - Regulator & Auditor Facing
  - Strict PII Redaction                      - Full Verification Provenance
  - 0.00% Commission Badge                    - Unmasked SHA-256 Digests
  - Aggregated Star Ratings                   - Masked Bank UTR Patterns
  - District Footprint Totals                 - Executed MoU Registry IDs
```

#### 1. Public Citizen View (Privacy-Safe)
- Strips 100% of raw worker phone numbers, PANs, Aadhaar numbers, and residential street coordinates.
- Prominently certifies the **0.00% platform commission on worker wages**.
- Displays verified regional worker footprints (Guwahati: 388 verified paid jobs; Shillong: 135 verified paid jobs).

#### 2. Internal Regulatory View (Auditor-Facing)
- Exposes full cryptographic SHA-256 evidence digests.
- Exposes masked bank UTR transaction references (e.g., `HDFC******9102`) proving real-world wage settlements.
- Truthfully displays the platform's certified status as **Class B**, highlighting outstanding external counterparty dependencies.
