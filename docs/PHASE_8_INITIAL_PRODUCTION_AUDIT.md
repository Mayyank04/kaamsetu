# KAAMSETU — Phase 8 Initial Production Audit & Operational Baseline

**Date:** 2026-11-14  
**Baseline Git Commit:** `d26dc73`  
**Current Branch:** `phase-8-production-launch`  
**Target Merge Branch:** `main`  
**Auditor:** KAAMSETU Multi-Disciplinary Engineering, Security & Operations Team  
**Status:** AUDIT COMPLETED — IMPLEMENTATION COMMENCING  

---

## 1. Verified Baseline & Heritage

| Parameter | Value | Verification Method | Status |
| :--- | :--- | :--- | :--- |
| **Git Baseline** | `d26dc73` | `git log -n 1 --oneline` | **Verified** |
| **Branch State** | `phase-8-production-launch` | `git branch --show-current` | **Verified** |
| **Test Suites** | 8 suites (165 / 165 tests passed) | `npm run test:crypto ...` | **100% Green** |
| **TypeScript** | 0 errors | `npx tsc --noEmit` | **Clean** |
| **ESLint** | 0 errors | `npm run lint` | **Clean** |
| **Build Artifacts** | 51 routes compiled successfully | `npm run build` | **Production Ready** |
| **Database Migrations** | 01 through 08 applied cleanly | PostgreSQL 15 `kaamsetu_rls_test` (23 tables) | **Verified** |

---

## 2. Existing Implementation Analysis (Phase 7 Deliverables)

Phase 7 delivered critical commercial architecture:
1. **Migration 08 (`20261114000008_commercial_launch_and_workforce_consent.sql`)**:
   - `workforce_invitations`: Two-sided invitation lifecycle (`pending`, `accepted`, `rejected`, `cancelled`, `expired`) with cryptographic tokens and expiration timestamps.
   - `subscription_orders`: Immutable financial ledger tracking orders, 18% GST calculation, billing cycle, gateway tokens, and verified signatures.
   - `cohort_trainee_progress`: Vocational module tracking, hours attended, practical verification, and employment placement status.
   - `institution_audit_logs`: Tamper-evident staff audit trail.
2. **Pricing Engine (`src/lib/config/pricing-plans.ts`)**:
   - Starter (₹0 / 5 workers), Pro (₹999/mo / 25 workers), Business (₹2,999/mo / 100 workers).
   - 18% GST calculation and annual discount (2 months free).
3. **Billing Service (`src/lib/billing/payment-service.ts`)**:
   - Server-side cryptographic HMAC-SHA256 signature verification.
   - Safe sandbox abstraction and atomic tier elevation on capture.
4. **Institutional Operations (`src/lib/supabase/db/institutional-ops.ts`)**:
   - Module progress logging and privacy-preserving CSV/JSON cohort export with DPDP consent masking.
5. **Customer Discovery Baseline**:
   - 18 structured interviews with contractors in Guwahati and Assam; 77.8% willingness to pay for Pro tier.

---

## 3. Unresolved Production Blockers & Deficiencies

While the Phase 7 codebase compiles cleanly and passes all functional tests, the following production and operational blockers must be resolved in Phase 8:

### Defect 1: Insecure Payment Secret Fallback in Production
- **Location**: `src/lib/billing/payment-service.ts` line 52.
- **Vulnerability**: `getPaymentSecret()` falls back to `"kaamsetu-sandbox-secret-key-32bytes-min"`. In production, this violates fail-closed security. If `PAYMENT_GATEWAY_SECRET` is unset, transactions could be verified using the default public string.
- **Remediation**: In production (`NODE_ENV === "production"`), strictly require `PAYMENT_GATEWAY_SECRET` or `RAZORPAY_KEY_SECRET` with $\ge 32$ bytes of entropy, failing closed otherwise.

### Defect 2: Unhandled Exception in `timingSafeEqual` Buffer Length Check
- **Location**: `src/lib/billing/payment-service.ts` line 144.
- **Vulnerability**: `crypto.timingSafeEqual` throws a runtime `RangeError: Input buffers must have the same length` if the client-submitted signature hex string is malformed or has an incorrect byte length.
- **Remediation**: Safely check `bufA.length === bufB.length` and validate hex format before invoking `timingSafeEqual`. Return `{ isVerified: false }` gracefully.

### Defect 3: Missing Dedicated Webhook Handler & Replay Defense
- **Vulnerability**: While manual checkout verification exists via `/api/contractor/billing/verify`, there is no webhook endpoint `/api/contractor/billing/webhook` to handle asynchronous events from Razorpay (`order.paid`, `payment.captured`, `payment.failed`, `refund.processed`).
- **Remediation**: Build `/api/contractor/billing/webhook` with `X-Razorpay-Signature` verification, 5-minute replay attack defense window, and idempotent event processing to prevent duplicate double-crediting.

### Defect 4: Missing Production Environment & Startup Validation
- **Vulnerability**: `src/lib/env.ts` validates credential and rate-limit secrets, but does not validate payment secrets, production SMS provider configuration, or telecom DLT headers.
- **Remediation**: Enhance `validateEnvironmentSafety()` to enforce payment secret validation and production configuration fail-closed requirements.

### Defect 5: Unvalidated Database Backup & Restore Pipeline
- **Deficiency**: Backup scripts exist theoretically, but no automated test actually dumps the PostgreSQL database and restores it into a clean test instance to verify zero data loss.
- **Remediation**: Implement and execute an automated backup-restore verification script in test suites.

### Defect 6: Contractor CRM Conversion Pipeline Unstructured
- **Deficiency**: The 18 contractor interviews from Phase 7 are documented in markdown, but there is no operational CRM tracking table to transition prospects through:
  `Lead` $\rightarrow$ `Contacted` $\rightarrow$ `Qualified` $\rightarrow$ `Demonstration Scheduled` $\rightarrow$ `Demonstration Completed` $\rightarrow$ `Trial Active` $\rightarrow$ `Payment Pending` $\rightarrow$ `Paid` $\rightarrow$ `Lost`.
- **Remediation**: Implement a CRM tracking schema and service to convert prospects into real paying customers.

---

## 4. Security Risks & Threat Model

| Threat | Impact | Current Defense | Phase 8 Required Hardening |
| :--- | :--- | :--- | :--- |
| **Payment Signature Forgery** | Critical | HMAC-SHA256 in sandbox | Fail-closed production key enforcement; length-safe timing comparison |
| **Webhook Replay Attack** | High | None | Enforce event timestamp window ($\le 300\text{s}$) and idempotency keys |
| **Unilateral Workforce Lock-in** | High | Two-sided invitation lifecycle | Worker association revocation endpoint & UI toggle |
| **PII Leakage in Institutional Exports** | High | Masked name/phone if no consent | End-to-end regression test for redaction across CSV and JSON |
| **Database Corruption / Outage** | Critical | Local PostgreSQL 15 | Automated `pg_dump` and `pg_restore` verification test |

---

## 5. External Dependency Verification

| Dependency | Purpose | Integration Status | Live vs. Sandboxed |
| :--- | :--- | :--- | :--- |
| **PostgreSQL 15 (Supabase)** | Core data store & RLS | Fully operational | Local PostgreSQL 15 + Supabase SSR client |
| **Google Gemini API** | Voice transcription & extraction | Fully operational | Live SDK with fail-safe zero-hallucination guard |
| **Razorpay / Payment Gateway** | Contractor Pro SaaS billing | Cryptographic engine verified | Tested with HMAC-SHA256 sandbox; webhook handler pending |
| **Twilio / MSG91 (DLT)** | Phone OTP authentication | Provider stubbed/mocked | Production DLT template registration documented |
| **DigiLocker API (NeGD)** | Official government verification | Fail-closed architecture | Explicitly blocked with "NeGD Agreement Pending" notice |

---

## 6. Recommended Execution Order

1. **Stage 1: Production Foundations & Security Patching**
   - Patch `src/lib/billing/payment-service.ts` (length-safe timing check, fail-closed secret).
   - Implement `/api/contractor/billing/webhook` with replay protection & idempotency.
   - Enhance `src/lib/env.ts` with payment secret and environment validation.
   - Create Database Migration 09: CRM contractor pipeline, payment webhook idempotency ledger, and worker association withdrawal.
2. **Stage 2: Operational CRM & Paid Customer Conversion**
   - Structure CRM pipeline for the 18 contractor prospects.
   - Track qualification, demonstrations, trials, and conversion to paid subscriptions.
   - Create `docs/PHASE_8_CUSTOMER_CONVERSION_REPORT.md`.
3. **Stage 3: Live Billing & Financial Reconciliation**
   - Implement financial reconciliation and GST accounting.
   - Create `docs/PHASE_8_BILLING_AND_RECONCILIATION_REPORT.md`.
4. **Stage 4: Institutional Pilot Operationalization**
   - Formalize outreach to 5 institutions, execute demonstration, track cohort modules.
   - Create `docs/PHASE_8_INSTITUTIONAL_PILOT_REPORT.md`.
5. **Stage 5: Worker Experience & Real Opportunity Validation**
   - Measure 6-stage discovery-to-completion funnel for Guwahati pilot workers.
   - Implement worker association revocation and UI controls.
   - Create `docs/PHASE_8_WORKER_OUTCOME_EVALUATION.md`.
6. **Stage 6: Regional Expansion & Customer Success**
   - Evaluate 6 Assam districts and select 1 next rollout district (Kamrup Rural).
   - Implement customer success metrics and retention workflows.
   - Create `docs/PHASE_8_REGIONAL_EXPANSION_REPORT.md`.
7. **Stage 7: Financial Sustainability & Security Certification**
   - 3-scenario unit economics model.
   - Automated backup and restore test suite.
   - Create `docs/PHASE_8_FINANCIAL_SUSTAINABILITY.md`, `docs/PHASE_8_SECURITY_CERTIFICATION.md`, `docs/PRODUCTION_DEPLOYMENT_RUNBOOK.md`, `docs/PHASE_9_ROADMAP.md`.
   - Comprehensive certification report `docs/PHASE_8_PRODUCTION_LAUNCH_REPORT.md`.
