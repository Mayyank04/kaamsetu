# KAAMSETU — PHASE 12 WORKER PROTECTION & TRUST REPORT
## Anti-Exploitation, SIM-Swap Account Recovery, Whistleblower Protections & Dispute Resolution

**Protocol:** KAAMSETU Worker Protection & Trust Architecture  
**Guiding Mandate:** "Every skill deserves to be seen, even without a degree."  
**Date:** November 15, 2026  

---

### 1. Executive Summary & Philosophy of Worker Sovereignty

In the informal workforce, craftspeople face asymmetric vulnerabilities: wage theft by contractors, retaliatory negative reviews when safety hazards are reported, identity hijacking via SIM-swap fraud, and loss of livelihood when migrating across state lines.

KAAMSETU embeds **worker protection directly into its database kernel and cryptographic design**. Protection is not an afterthought or an optional customer-service policy; it is enforced via immutable PostgreSQL constraints, Row-Level Security policies, and cryptographically verified audit trails.

---

### 2. SIM-Swap Defense & Resilient Account Recovery

In rural and semi-urban India, mobile phone theft and fraudulent SIM cloning are frequent vectors for identity hijacking. If account recovery relied solely on automated SMS OTP, an attacker controlling a stolen SIM could instantly hijack a worker's digital identity and work history.

KAAMSETU establishes a **fail-closed, mediated account recovery protocol**:

```mermaid
sequenceDiagram
    autonumber
    actor Worker as Skilled Worker (New SIM)
    participant Field as Field Coordinator / ITI Helpdesk
    participant App as KAAMSETU Sovereign Trust Core
    participant Admin as Regional Dispute Mediator

    Worker->>Field: In-Person Physical Presentation (Physical QR Card + Gov Photo ID)
    Field->>App: Initiate Mediated Recovery Request (Upload Biometric / In-Person Proof)
    App->>App: Freeze Automated OTP Transfer on Disputed Profile
    App->>Admin: Escalate to Recovery Queue in `worker_disputes` (`dispute_type = 'account_recovery'`)
    Admin->>Field: Verify In-Person Witness Attestation
    Admin->>App: Approve Profile Transfer to Worker's New Mobile Number
    App->>Worker: Issue New Key Material; Invalidate Stolen SIM Sessions
```

Automated SMS OTP transfers are strictly prohibited whenever an account recovery flag is raised.

---

### 3. Non-Payment Grievance Redressal & Restitution Ledger

When a contractor fails to pay agreed wages, informal workers historically had zero institutional recourse. KAAMSETU provides a formal, evidence-backed grievance redressal system recorded in `public.worker_disputes`:

1. **Submission:** Worker submits a non-payment dispute with agreed daily rate, project location, and supervisor name.
2. **Mediation SLA:** The regional coordinator is bound by a **7-business-day mediation SLA**.
3. **Evidence Preservation:** Contractor must submit verifiable proof of payment (e.g. Bank UTR number, UPI transaction reference).
4. **Resolution States:**
   - `resolved_worker_upheld`: Dispute resolved in worker's favor; contractor restitution recorded with transaction proof.
   - `resolved_contractor_upheld`: Verifiable payment evidence confirmed.
   - `escalated_legal`: Escalated to the District Labour Commissioner under the Payment of Wages Act.
5. **Contractor Penalty:** Contractors with unresolved wage disputes are automatically blocked from posting new opportunities or inviting crew members.

---

### 4. Whistleblower Protection & Anti-Retaliation Reviews

Informal workers frequently remain silent about dangerous working conditions (e.g., unshielded 440V high-voltage busbars, lack of scaffolding harnesses) because contractors threaten them with bad reviews.

KAAMSETU deploys two structural defenses:
1. **Anonymous Safety Feedback Reports (`public.opportunity_feedback_reports`):** Workers can submit safety hazard reports without exposing their identity to the site contractor. Reports are routed directly to regional compliance officers.
2. **Retaliatory Review Mitigation:** If a contractor submits a negative review for a worker within 14 days of an active wage dispute or safety report, the review is automatically placed in quarantine (`is_quarantined = true`) and excluded from the worker's public KaamScore until reviewed by an independent mediator.

---

### 5. DPDP Act 2023 Compliance & Sovereign Rectification

In accordance with the Digital Personal Data Protection Act, 2023:
- **Right to Rectification (`public.profile_corrections`):** Workers have the right to request corrections to their trade, experience, or personal data at any time.
- **Right to Erasure / Departure:** If a worker leaves a contractor or uninstalls the platform, their identity remains their own. Contractors cannot retain, lock, or export unredacted worker personal data.
- **Data Minimization:** No Aadhaar numbers, biometric fingerprints, or financial bank account numbers are stored in plain text or shared with commercial contractors.
