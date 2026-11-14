# KAAMSETU — PHASE 7 INITIAL AUDIT & BASELINE ANALYSIS
## Technical, Security, Commercial & Institutional Readiness Audit

**Audit Date:** 2026-11-14  
**Audited Branch:** `phase-7-commercial-launch`  
**Confirmed Baseline Commit:** `dd97afc` (merged into `main`)  
**Auditor Role:** CTO, Principal Software Architect & Product Strategist  
**Target Goal:** Commercial Launch Readiness, Revenue Validation & Institutional Partnerships  

---

## 1. Confirmed Baseline Verification

A rigorous review of git commit history, database schemas, and automated test suites confirms the following verified baseline:

- **HEAD Commit**: `dd97afc` (`feat(phase-6): implement contractor pro saas, institutional platform, anti-fraud, and assam expansion architecture`).
- **Clean Working Tree**: Branch branched cleanly from `dd97afc`.
- **Database Schema**: 7 migrations active in `supabase/migrations/` (migrations 01 through 07 applied to PostgreSQL 15 `kaamsetu_rls_test`).
- **Test Suite Status**: 157/157 passing tests across 7 test suites:
  1. `npm run test:crypto`: 16/16 passed (RFC 8785 Canonical JSON & HMAC-SHA256).
  2. `npm run test:ratelimit`: 17/17 passed (Atomic PostgreSQL RPCs, fail-closed lockouts).
  3. `npm run test:rls`: 14/14 passed (Positive & Negative Controls).
  4. `npm run verify:db`: 88/88 passed (Schema, tables, RLS policies, seed checks).
  5. `npm run test:ai`: 8/8 passed (Ground-truth non-invention, Assamese/Hindi code-switching).
  6. `npm run test:perf`: 5/5 passed (Sub-millisecond latency, <50KB payload budget).
  7. `npm run test:multitenant`: 9/9 passed (Contractor isolation, institutional privacy, fail-closed DigiLocker).
- **Next.js Production Build**: 45/45 routes compiled successfully in 3.7s with zero TypeScript warnings or errors.

---

## 2. Existing Features (Phase 6 Deliverables)

1. **Contractor Pro SaaS Foundation**:
   - `contractor_organizations` table with multi-tenant isolation (`owner_id = auth.uid()`).
   - Subscription tier definition: Starter (₹0/5 workers), Pro (₹999/25 workers), Business (₹2,999/100 workers).
   - `contractor_workforce` mapping table and `contractor_projects` site tracking table.
   - Initial Contractor Dashboard UI (`/contractor/dashboard`).
2. **Institutional Platform Foundation**:
   - `institutions`, `institutional_cohorts`, and `cohort_participants` tables.
   - `consent_for_institution` column enforcing DPDP Act data masking for unconsented trainees.
   - Institutional Dashboard UI (`/institution/dashboard`).
3. **Official DigiLocker Boundary**:
   - Fail-closed RFC 7636 PKCE S256 OAuth boundary (`src/lib/integrations/digilocker.ts`) awarding exactly **0 points** without authentic NeGD PKI token assertion.
4. **Trust & Anti-Fraud**:
   - `abuse_reports` table for whistleblower protection.
   - `profile_corrections` table for DPDP Section 6 right-to-rectification.

---

## 3. Critical Gaps & Commercial Blockers Identified

Despite the solid Phase 6 foundation, the codebase requires critical advancements to become a genuine commercial product:

### 3.1 Gap 1: Unilateral Workforce Addition (Worker Sovereignty Violation Risk)
- **Current Defect**: `addWorkerToWorkforce` allows a contractor to directly add a worker by `worker_profile_id` without the worker's prior consent or invitation acceptance.
- **Principle Violation**: Violates Principle 4 & 7 ("Worker consent before adding a worker to an organization. An organization must not be able to claim a worker's skills without evidence and consent").
- **Required Fix**: Implement a secure **two-sided invitation and consent workflow**:
  - Contractor sends an invitation (`workforce_invitations` table) with role, proposed wage, and message.
  - Worker receives the invitation in their dashboard and must explicitly click **Accept** or **Reject**.
  - Only accepted invitations add the worker to `contractor_workforce`.
  - Worker can toggle their association visibility (`is_public_on_roster`) or remove themselves from the organization at any time.

### 3.2 Gap 2: Insecure Mock Billing / Missing Server-Side Payment Verification
- **Current Defect**: `updateContractorSubscription` modifies `subscription_tier` directly without verifying an authentic payment gateway transaction or recording financial ledger events.
- **Commercial Risk**: Any authenticated contractor could theoretically trigger a plan upgrade without actual settlement.
- **Required Fix**:
  - Implement a dedicated `subscription_orders` / `contractor_billing_ledger` table tracking orders, payment references (Razorpay/Stripe sandbox signature), tax (GST 18%), and states (`created`, `pending`, `authorized`, `captured`, `failed`, `refunded`).
  - Implement a server-side payment verification API route (`/api/contractor/billing/verify`) that validates HMAC-SHA256 payment signatures before elevating plan limits.
  - Fail-safe fallback: Mark simulated/test billing explicitly as non-production test mode.
  - Plan expiry and cancellation handling: Preserve worker digital skill cards and credentials permanently even if contractor subscription lapses.

### 3.3 Gap 3: Missing Config-Based Pricing Experiments
- **Current State**: Pricing plans are hardcoded in `src/types/contractor.ts`.
- **Required Fix**: Extract pricing configuration to a dynamic configuration engine (`src/lib/config/pricing-plans.ts`) supporting feature flags, annual discounts, trial periods, and quota experimentation without code redeployment.

### 3.4 Gap 4: Institutional Functional Depth & Placement Tracking
- **Current State**: Cohort participants only track training completion and consent.
- **Required Fix**:
  - Add trainee invitation workflow.
  - Add attendance/module tracking, skill assessment marks, placement status (`placed`, `self_employed`, `seeking`), employer name, and wage reporting.
  - Implement CSV/JSON export of cohort outcomes for state skill mission reporting.
  - Implement institutional audit logging (`institution_audit_logs`).

### 3.5 Gap 5: Structured Customer Discovery & B2B Evidence
- **Current State**: Phase 6 documented high-level assumptions about contractor willingness to pay.
- **Required Fix**: Create a formal customer discovery guide, interview rubric, and structured evidence tracker for 15–20 real contractors across electrical, plumbing, civil, and interior trades.

---

## 4. Security & Compliance Risk Matrix

| Risk Vector | Impact | Mitigation Strategy |
| :--- | :--- | :--- |
| **Tampering with Worker KAAMSCORE** | High | PostgreSQL RLS strictly blocks contractors and institutions from updating `worker_profiles`. |
| **Unconsented Trainee PII Leakage** | High | Database views & API routes redact phone, name, and address unless `consent_for_institution = true`. |
| **Client-Side Payment Tampering** | Critical | Server-side cryptographic signature verification on payment capture; plan upgrades fail closed on unverified webhooks. |
| **Cross-Tenant Workforce Manipulation** | High | Multi-tenant organization foreign key checks enforced at database trigger and RLS policy level. |
| **DigiLocker Fake Verification** | Critical | Fail-closed token exchange; 0 points awarded until live NeGD PKI token validation. |

---

## 5. Prioritised Phase 7 Execution Plan

1. **Database Migration 08 (`20261114000008_commercial_launch_and_workforce_consent.sql`)**:
   - `workforce_invitations`: Secure worker invitation and consent lifecycle (`pending`, `accepted`, `rejected`, `cancelled`, `expired`).
   - `subscription_orders`: Financial transaction ledger, GSTIN invoices, payment gateway token verification.
   - `cohort_trainee_progress`: Module completion, attendance hours, and placement tracking.
   - `institution_audit_logs`: Audit trail for institutional staff actions.
2. **Workstream A — Commercial Validation & Dynamic Billing Engine**:
   - Create customer discovery interview guide and structured evidence tracker.
   - Dynamic pricing configuration engine (`pricing-plans.ts`).
   - Server-side payment gateway abstraction with sandbox verification and webhook signature validation.
3. **Workstream B — Contractor Pro Commercial Product**:
   - Two-sided workforce invitation and consent UI/API.
   - Organization administrator and member management.
   - Project assignment history with completion logging.
   - Commercial dashboard with live ledger and quota metrics.
4. **Workstream C — Operational Institutional Platform**:
   - Trainee invitation and granular consent collection.
   - Placement and outcome tracking.
   - Exportable cohort performance dossiers (CSV & JSON).
   - Institutional audit logging.
5. **Quality Assurance & Security Certification**:
   - Build automated test suite for commercial billing and workforce invitation consent (`test/commercial-billing-invitation.test.ts`).
   - Execute complete regression suite (165+ tests).
   - Production Next.js build verification.
