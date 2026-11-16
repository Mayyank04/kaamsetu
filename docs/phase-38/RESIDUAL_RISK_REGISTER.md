# KAAMSETU — PHASE 38 RESIDUAL RISK & OPERATIONAL RISK REGISTER

**Programme:** KAAMSETU Digital Identity & Worker Empowerment Platform  
**Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**Parent Baseline:** Phase 37 Modular Monolith  
**Audit Objective:** Catalog accepted risks, operational trade-offs, upstream dependency exposures, third-party sandbox boundaries, and compensatory controls.

---

## 1. Executive Summary

In adherence to security engineering best practices and Phase 38 governance, all known high and critical vulnerabilities have been remediated in code. However, any production system operating in the physical world with mobile networks, SMS gateways, and cloud infrastructure carries residual risks.

This register documents every identified residual risk, its business and technical context, existing compensatory controls, and scheduled re-assessment milestones.

---

## 2. Residual Risk Matrix

| Risk ID | Category | Description | Likelihood | Impact | Residual Risk | Compensatory Controls | Review Cadence |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- | :---: |
| **RR-01** | Dependency / Supply Chain | Transitive PostCSS & Zod advisories retained without major breaking upgrades | Low | Low | ACCEPTABLE | Outer request payload bounds (1MB/5MB), static build ahead-of-time, no user-supplied CSS, bounded schema arrays (`.max(5)`). | Quarterly |
| **RR-02** | Telecommunications | SMS Gateway delivery latency or interception on telecom carrier networks | Medium | Medium | ACCEPTABLE | 5-minute OTP expiry window, rate limits (3 requests per 15 min), single-use challenge consumption, constant-time verification. | Monthly |
| **RR-03** | Cloud Infrastructure | Vercel Edge Runtime & Supabase PostgreSQL cloud availability SLA | Low | High | ACCEPTABLE | Client-side offline pack caching (`worker_offline_packs`), connection pooling via Supabase pooler, automated database backup schedules. | Continuous |
| **RR-04** | Client Security | Shared or stolen mobile devices used by informal workers | Medium | Medium | ACCEPTABLE | 15-minute idle session timeouts, biometrics / PIN lock screen prompt on trusted devices, one-click remote session revocation. | Bi-weekly |
| **RR-05** | Geographic Expansion | Requests for registration from un-serviced Indian states / rural clusters | High | Low | ACCEPTABLE | Strict fail-closed pincode filters (Guwahati: 781001-781039, Shillong: 793001-793022); explicit waitlist logging with 0 unauthorized record creation. | Milestone-based |
| **RR-06** | Third-Party Media | Malicious polyglot files evading basic binary header validation | Very Low | Low | ACCEPTABLE | Magic bytes validation, 5MB file caps, filename regex sanitization, multi-tenant folder isolation, non-executable storage bucket policies. | Semi-annual |

---

## 3. In-Depth Risk Analysis & Compensatory Controls

### 3.1 RR-01: Upstream Transitive Package Dependencies
- **Context:** `npm audit` notes vulnerabilities in PostCSS and Zod. Upgrading PostCSS requires Next.js 16 (major architecture breaking change); upgrading Zod requires Zod 4 (rewrites core API).
- **Compensatory Controls:**
  1. `next.config.ts` enforces `productionBrowserSourceMaps: false`, neutralizing the source-map auto-load path in PostCSS.
  2. Next.js and Vercel edge routers restrict HTTP request bodies to 1MB/5MB, making memory exhaustion attacks via oversized Zod collections impossible.
  3. Schemas strictly cap array lengths (e.g. `.max(5)` on skills).
- **Status:** Risk Accepted. Re-evaluate when Next.js 15 LTS releases backported patches or during the scheduled Phase 40 major dependency cycle.

### 3.2 RR-02: SMS Gateway / Carrier Security
- **Context:** Telecom networks in semi-urban India may experience delayed SMS delivery or SS7 signaling vulnerabilities.
- **Compensatory Controls:**
  1. OTP lifetime is limited to 300 seconds (5 minutes).
  2. Maximum 3 failed attempts before an OTP challenge is permanently invalidated.
  3. Phone rate limiting (max 3 SMS per phone per 15 minutes) prevents carrier abuse or billing denial of service.
- **Status:** Risk Managed. Future roadmaps include WhatsApp OTP verification via accredited business API.

### 3.3 RR-04: Worker Device Hygiene in Field Conditions
- **Context:** Informal artisans frequently share smartphones within families or work crews.
- **Compensatory Controls:**
  1. High-privilege actions (payout bank account updates, credential exports) require re-authentication.
  2. Session cookies are HTTP-only, SameSite=Lax, and secure.
  3. Offline verifiable credentials use QR codes containing public cryptographically signed payloads, allowing validation without exposing user accounts.
- **Status:** Risk Managed.

---

## 4. Operational Sign-Off
- **Risk Acceptance Lead:** KAAMSETU Technical Governance Board
- **Operating Classification:** Approved for `CLASS_B_CONTROLLED_ROLLOUT`
- **Next Formal Review:** Phase 39 Security Assurance Cycle
