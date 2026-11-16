# KAAMSETU — PHASE 36.1 TERMS & PRIVACY REVIEW

**Programme:** KAAMSETU Digital Identity & Worker Empowerment Platform  
**Workstream:** Phase 36.1 — Statutory Trust, DPDP Compliance & Legal Transparency  
**Routes:** `/terms` and `/privacy`  
**Governing Laws & Standards:** Digital Personal Data Protection (DPDP) Act 2023, Information Technology Act 2000, Aadhaar Act 2016  
**Operational Status:** Controlled Pilot Operational Draft (Subject to Formal Statutory Counsel Review)  
**Date:** 16 November 2026  

---

## 1. Executive Summary

Phase 36.1 introduced complete, dedicated, fully rendered routes for **Terms of Service** (`/terms`) and **Privacy Policy** (`/privacy`), directly linked from the platform header and footer.

Both documents are structured to provide operational transparency during the `CLASS_B_CONTROLLED_ROLLOUT` phase, establishing the platform's constitutional invariants while explicitly carrying a disclaimer that they represent operational draft frameworks subject to statutory legal review prior to multi-state expansion.

---

## 2. Terms of Service (`/terms`) Section-by-Section Breakdown

The Terms of Service page is structured into 12 distinct operational sections:

| Section | Title | Primary Legal & Operational Content |
|---|---|---|
| **Header** | Operational Framework Notice | Clarifies that KAAMSETU is an institutional digital infrastructure platform, not a gig labor broker. |
| **Notice** | Legal Counsel Review Notice | Prominent alert box stating that the document reflects operational architecture and requires final review by authorized legal counsel prior to general public commercialization. |
| **1** | Acceptance of Terms | Governs access by artisans, small contractors, customers, and training partners. |
| **2** | Eligibility & Controlled Scope | Limits active dispatch to Guwahati Urban and Shillong Urban. Users outside these zones may hold non-dispatch credential portfolios. |
| **3** | User Roles & Responsibilities | Details rights of Skilled Workers, Customers, Commercial Contractors, and Training Institutes. |
| **4** | Self-Sovereignty & Credential Control | Guarantees that workers own their profile and may unpublish, export, or revoke it at any time. |
| **5** | Verification & Skill Attestations | Clearly defines the tiered trust architecture: self-declared voice testimony, client reviews, and institutional credentials. |
| **6** | Permanent Zero-Commission Policy | Inscribes `platform_commission_amount = 0.00` on artisan wages as a permanent constitutional guarantee. |
| **7** | Direct Contracting & Financial Settlement | Direct customer-to-worker settlement via UPI or cash; KAAMSETU never acts as an escrow custodian or wage deductions agent. |
| **8** | Prohibited Activities | Bans identity theft, fake reviews, harassment, and off-platform exploitation. |
| **9** | Dispute Resolution & Ombudsperson | Provides a 3-tier internal dispute resolution flow (direct conciliation, community mediation, administrative review). |
| **10** | Suspension & Account Termination | Governs process for account deactivation with guaranteed data export rights. |
| **11** | Limitation of Liability | Standard institutional liability disclaimers for direct worker-client workmanship contracts. |
| **12** | Governing Law & Jurisdiction | Designates the High Court of Gauhati, Assam, for pilot operations. |

---

## 3. Privacy Policy (`/privacy`) Section-by-Section Breakdown

The Privacy Policy is structured into 9 comprehensive sections compliant with the **Digital Personal Data Protection (DPDP) Act, 2023**:

| Section | Title | Primary DPDP & Cryptographic Content |
|---|---|---|
| **Header** | DPDP Compliance Overview | Affirms commitment to privacy, dignity, and self-sovereign control over digital skill records. |
| **Notice** | Ongoing DPDP Audit Notice | Explicit notice stating the policy reflects current technical data flows and is undergoing independent DPDP compliance audit. |
| **1** | Information We Collect | Itemizes data categories: Mobile number (for OTP verification), Profile details (name, trade, experience, location), Voice recordings, Work records. |
| **2** | Cryptographic Security & Zero Raw Aadhaar | **Critical Invariant:** KAAMSETU **never stores raw 12-digit Aadhaar numbers**. Verification uses masked VIDs or DigiLocker XML. All session keys use SHA-256 HMAC cryptographic hashing. |
| **3** | Purpose & Lawful Basis | Details legitimate purposes under the DPDP Act: account authentication, skill matching, dispute resolution. |
| **4** | Data Sharing & Ecosystem Interfaces | Strict prohibition on third-party data broker sharing; data is only shared with explicit worker consent (e.g., sharing a phone number with a confirmed booking customer). |
| **5** | Retention & Deletion Rights | Workers retain the right to delete their profile at any time. Deletion permanently erases all PII from active databases within 30 days. |
| **6** | User Rights Under Indian DPDP | Enumerates statutory rights: Right to Access, Right to Correction, Right to Grievance Redressal, Right to Nominate. |
| **7** | Protection of Children's Data | Strictly restricts platform registration to individuals 18 years of age or older. |
| **8** | Cookies & Local Storage | Explains use of essential session cookies (`kaamsetu_session`) and local storage for offline draft recovery. No third-party ad tracking pixels. |
| **9** | Privacy Contact & Grievance Officer | Designates an institutional Data Protection & Grievance Officer based in Guwahati, Assam, with dedicated contact email (`privacy@kaamsetu.org`). |

---

## 4. Automated Assurance & Regression Testing

Both pages are covered by deterministic tests in `test/phase-36-1-anti-ai-reconstruction.test.ts`:
- Route compilation: Verified via `next build` (`○ /terms 176 B`, `○ /privacy 176 B`).
- Zero-commission invariant: Asserted via string and token matching.
- Zero raw Aadhaar guarantee: Asserted via cryptographic security token inspection.
- Footer integration: Asserted that both links exist and render valid target URLs.
- Multi-viewport screenshots: Verified across 1440px, 1280px, 768px, 390px, and 320px viewports.
