# KAAMSETU — Phase 6 Roadmap, Financial Sustainability & Institutional Recommendations

**Author:** KAAMSETU Product & Engineering Deployment Team  
**Baseline:** Post-Phase 5 Controlled Field Pilot Validation (Guwahati, Assam)  
**Core Mission Constraint:** Basic digital workforce identity must remain permanently free and commission-free.

---

## 1. Prioritised Engineering & Product Backlog (Phase 6)

Based on empirical observations from the Guwahati pilot, the backlog is categorized into four strict priority tiers:

### P0 — Security, Privacy & Integrity (Mandatory Before Public Expansion)
1. **Automated Secret Rotation Pipeline**: Implement zero-downtime rotation for `CREDENTIAL_SIGNING_SECRET` and `RATE_LIMIT_HMAC_SECRET` with dual-key resolution tests.
2. **Periodic PII Scrubbing Audit**: Enforce automated CI linting ensuring database views and API responses never expose unmasked worker telephone numbers, email addresses, or residential street coordinates.

### P1 — Core Reliability & Workflow Enhancements (High Priority)
1. **Offline PWA Service Worker & Sync**: Cache the onboarding form, language resources, and minted Sovereign Card locally on worker devices so registration can be initiated offline and synced when network connectivity is re-established.
2. **Direct Photo Upload in Booking Requests**: Allow customers to attach photographs of the job site (e.g. damaged distribution box, pipe leakage) directly in the booking modal to help workers assess tooling requirements in advance.
3. **Materials Ownership Selector in Bookings**: Add a clear radio selector in the booking modal:
   - *Customer supplies materials*
   - *Worker brings materials (reimbursed on invoice)*
   - *Labor only*

### P2 — Usability & Vernacular Expansion (Medium Priority)
1. **WhatsApp One-Click Direct Chat**: Allow customers to initiate a private WhatsApp message with the worker via an anonymised click-to-chat relay, preserving worker privacy.
2. **Vernacular Audio Guide Prompts**: Add brief, warm spoken Assamese/Hindi audio walkthroughs explaining each onboarding step for workers with minimal literacy.
3. **Regional Trade Expansion**: Add specific NCO trade mappings for traditional weaving (Eri/Muga silk), stone masonry, and agricultural cold chain equipment.

### P3 — Ecosystem & Convenience Features (Future Enhancement)
1. **Physical NFC & PVC Card Fulfillment**: Partner with local print hubs to offer durable, waterproof laminated PVC identity cards with embedded NFC chips and QR codes for ₹50–₹100.
2. **Contractor Subcontractor Rosters**: Enable contractors to maintain verified teams of skilled workers for multi-month commercial projects.

---

## 2. Institutional Readiness & Regulatory Requirements

To scale KAAMSETU beyond a 10-worker controlled cohort to an open public registry across Assam and the Northeast, three institutional milestones must be achieved:

| Institutional Requirement | Regulatory Authority | Production Action Plan |
|---|---|---|
| **DigiLocker Production Integration** | National e-Governance Division (NeGD) / MeitY | Apply for institutional partner credentials under the National Digital Identity Framework. Exchange PKI certificates to verify genuine Aadhaar and NSDC skill certificate tokens via live OAuth assertion. |
| **TRAI DLT SMS Registration** | Telecom Regulatory Authority of India (TRAI) / Telecom Operators | Register the KAAMSETU principal entity, 6-character header (`KAMSTU`), and transactional OTP templates on Jio/Airtel Vilpower DLT to enable non-blocking SMS delivery across India. |
| **Vocational Skill Alignment** | Assam Skill Development Mission (ASDM) / NSDC | Form collaborative partnerships with ITI Guwahati and local vocational guilds to recognize KAAMSETU sovereign credentials as valid evidence of informal apprenticeship. |

---

## 3. Financial Sustainability & Unit Economics Model

### Direct Variable Cost Per Worker Onboarding
KAAMSETU is architected for extreme resource efficiency. Direct variable infrastructure costs per onboarded worker are remarkably low:

| Cost Component | Provider & Tier | Cost per Unit | Cost per Onboarded Worker |
|---|---|---|:---:|
| **AI Spoken Extraction** | Google Gemini 2.5 Flash | $0.075 / 1M input tokens | ₹0.02 ($0.00025) |
| **SMS OTP Verification** | Indian DLT SMS Gateway (MSG91) | ₹0.14 per domestic SMS | ₹0.28 (2 SMS attempts) |
| **PostgreSQL Database** | Supabase Managed Postgres | Shared pooled instance | ₹0.20 |
| **File / Photo Storage** | S3-compatible Blob Storage | $0.021 / GB / month | ₹0.05 (2 compressed photos) |
| **Bandwidth & Compute** | Edge Serverless Functions | Edge free tier / CDN | ₹0.05 |
| **Total Direct Onboarding Cost** | | | **₹0.60 (~$0.007 USD)** |

> **Key Takeaway:** The marginal technical cost to issue a verifiable, cryptographically signed digital identity to an informal worker in India is **less than ₹1 (under 1 US cent)**!

---

### Sustainable Revenue Strategy (Commission-Free Core)
To ensure long-term sustainability without ever taxing informal workers:

1. **Free Tier (Permanent Citizen Identity)**: Voice onboarding, sovereign skill card minting, scannable QR generation, and public discovery remain **100% free with 0% platform commission on worker earnings**.
2. **Contractor & Enterprise Subscriptions**: Commercial builders and interior contractors pay a monthly SaaS subscription (₹999–₹2,999/month) for bulk candidate search, team verification rosters, and compliance audit exports.
3. **CSR & Skill Mission Sponsorship**: State skill development missions (ASDM, NSDC) sponsor digital credential issuance for graduating vocational batches (₹50–₹100 per certified graduate credential).
4. **Physical PVC Skill Card Sales**: Optional high-durability embossed smart cards sold directly to workers at cost plus modest fulfillment margin (₹99 per card).
