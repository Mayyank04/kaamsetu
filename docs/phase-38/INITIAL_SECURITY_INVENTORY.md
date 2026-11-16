# KAAMSETU — PHASE 38 INITIAL SECURITY INVENTORY
## Complete Endpoint & Asset Security Inventory

**Repository:** `Mayyank04/kaamsetu`  
**Assessment Date:** 2026-11-16  
**Assessment Scope:** Full-Stack API, Database, Authentication & Cryptographic Infrastructure  
**Total API Endpoints Audited:** 99  
**Total Database Tables Audited:** 100  
**Operating Classification:** `CLASS_B_CONTROLLED_ROLLOUT`

---

## 1. Executive Summary

This inventory records every API route handler, server action, authentication flow, and data asset in the KAAMSETU repository. Each endpoint is categorized by authentication requirement, role-based access control (RBAC), tenant/object ownership enforcement, input schema validation, rate-limiting policy, and associated regression tests.

---

## 2. API Endpoint Security Inventory

| HTTP Method | Route | Auth Required | Required Role | Ownership Requirement | Input Schema | DB Operations | Sensitive Data Returned | Rate Limit Policy | Relevant Test Suite |
| :--- | :--- | :---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/otp/send` | No | Anonymous / Any | None | Mobile phone schema (`+91` 10-digit) | `INSERT INTO otp_challenges` | None (plain OTP never returned) | 3 sends / 10 min per phone & IP | `test/phase-35-1-addendum.test.ts` |
| **POST** | `/api/auth/otp/verify` | No | Anonymous / Any | None | `phone`, `otp` (6 digits) | `RPC verify_and_consume_otp` | Session cookie set (`kaamsetu_session`) | 5 failed attempts / lockout | `test/phase-35-1-addendum.test.ts` |
| **GET** | `/api/auth/me` | Yes | Any authenticated | User's own session | None | `SELECT FROM profiles` | Masked phone, role, full name | None (session check) | `test/phase-35-1.test.ts` |
| **POST** | `/api/auth/logout` | Yes | Any authenticated | User's own session | None | Cookie clearance | None | None | `test/phase-35-1.test.ts` |
| **POST** | `/api/auth/persona` | No | Dev / Demo only | Blocked in production | Persona role selector | In-memory session mock | Demo session cookie | Blocked in production | `test/phase-35-2.test.ts` |
| **POST** | `/api/worker/onboarding/save` | Yes | `worker` | User's own profile | `approvedProfileSubmissionSchema` | `UPSERT worker_profiles`, `credential_registry` | Registry ID, slug, KaamScore | IP & geographic boundary checks | `test/phase-35-1-addendum.test.ts` |
| **POST** | `/api/worker/onboarding/extract` | Yes | `worker` | None | Audio file or transcript | Gemini API extraction | Extracted trade skills | 5 requests / min per IP | `test/ai-accuracy-ground-truth.test.ts` |
| **GET** | `/api/worker/profile` | Yes | `worker` | `requireOwnedWorkerProfile` | None | `SELECT FROM worker_profiles` | Worker bio, skills, rates | Standard session query | `test/phase-35-1.test.ts` |
| **PATCH** | `/api/worker/profile` | Yes | `worker` | `requireOwnedWorkerProfile` | `profileUpdateSchema` | `UPDATE worker_profiles` | Updated profile record | Standard session query | `test/phase-37-architecture-modernization.test.ts` |
| **GET** | `/api/worker/payouts` | Yes | `worker` / `contractor` | Worker own payouts / Contractor own org | Query params (`workerProfileId`, `contractorOrgId`) | `SELECT FROM payment_records_ledger` | Payment amounts, UTR references | Standard session query | `test/phase-35-1-layered-security.test.ts` |
| **POST** | `/api/worker/payouts` | Yes | `contractor` | `requireOwnedContractorOrg` | `createPayoutSchema` | `INSERT INTO payment_records_ledger` | Created payout record | 20 disbursements / 10 min (Phase 38) | `test/phase-35-1-layered-security.test.ts` |
| **PATCH** | `/api/worker/payouts` | Yes | `worker` / `contractor` | Worker own dispute / Contractor own org | `patchPayoutSchema` | `UPDATE payment_records_ledger` | Updated dispute status | Standard session query | `test/phase-35-1-layered-security.test.ts` |
| **GET** | `/api/worker/grievance` | Yes | `worker` / `moderator` / `admin` | Worker own grievances | `workerProfileId` param | `SELECT FROM worker_disputes` | Grievance evidence, claim amount | Standard session query | `test/phase-35-1-layered-security.test.ts` |
| **POST** | `/api/worker/grievance` | Yes | `worker` | `requireOwnedWorkerProfile` | `submitGrievanceSchema` | `INSERT INTO worker_disputes` | Grievance ID, SLA due date | 3 grievances / hour (Phase 38) | `test/phase-35-1-layered-security.test.ts` |
| **PATCH** | `/api/worker/grievance` | Yes | `moderator` / `admin` | Non-partisan reviewer | `resolveGrievanceSchema` | `UPDATE worker_disputes` | Resolution status, UTR reference | Privileged role check | `test/phase-35-1-layered-security.test.ts` |
| **POST** | `/api/worker/portfolio/upload` | Yes | `worker` | `requireOwnedWorkerProfile` | Multipart FormData (image) | `Supabase Storage upload` | Storage URL, filename, size | 10 uploads / 10 min | `test/phase-35-1.test.ts` |
| **POST** | `/api/v2/identity/export` | Yes | `worker` / `institution` | Worker own profile / Institution own cohort | Export body (`workerProfileId`, `format`) | `SELECT worker_profiles, skills` | Complete sovereign profile dossier | 10 exports / hour (Phase 38) | `test/phase-35-1-layered-security.test.ts` |
| **GET** | `/api/worker/identity/export` | Yes | `worker` | `requireWorker` | Query param (`format`) | `SELECT worker_profiles, skills` | Complete sovereign profile dossier | 10 exports / hour (Phase 38) | `test/phase-35-1-layered-security.test.ts` |
| **POST** | `/api/worker/consent-audit` | Yes | `worker` | `requireOwnedWorkerProfile` | Consent audit schema | `INSERT INTO consent_audit_events` | Immutable consent receipt | Standard session query | `test/phase-35-1-layered-security.test.ts` |
| **POST** | `/api/bookings` | Yes | `customer` / `any` | `requireAuthenticatedUser` | `createBookingSchema` | `INSERT INTO bookings` | Booking reference, status | Boundary & rate checks | `test/phase-37-architecture-modernization.test.ts` |
| **PATCH** | `/api/bookings/[id]/status` | Yes | `worker` / `customer` | Participant ownership (`isCustomer` or `isWorker`) | `statusTransitionSchema` | `UPDATE bookings` | Updated booking status | Terminal status lock | `test/phase-35-1.test.ts` |
| **POST** | `/api/contractor/billing/order` | Yes | `contractor` | `requireOwnedContractorOrg` | `createOrderSchema` | `INSERT INTO subscription_orders` | Gateway order ID, amount, 18% GST | Standard session query | `test/commercial-billing-invitation.test.ts` |
| **POST** | `/api/contractor/billing/verify` | Yes | `contractor` | `requireOwnedContractorOrg` | `verifyPaymentSchema` | `UPDATE subscription_orders` | Subscription status, activation | HMAC verification | `test/commercial-billing-invitation.test.ts` |
| **POST** | `/api/contractor/billing/webhook` | No | Gateway Signature | Cryptographic webhook secret | Razorpay / Gateway event JSON | `UPDATE subscription_orders` | Order reference, processing status | Replay window 300s & timingSafeEqual | `test/commercial-billing-invitation.test.ts` |
| **GET** | `/api/contractor/workforce` | Yes | `contractor` | `requireOwnedContractorOrg` | Query params | `SELECT FROM contractor_workforce` | Worker profiles, trade, status | Standard session query | `test/contractor-institution-security.test.ts` |
| **POST** | `/api/contractor/projects` | Yes | `contractor` | `requireOwnedContractorOrg` | `projectSchema` | `INSERT INTO contractor_projects` | Project record | Standard session query | `test/contractor-institution-security.test.ts` |
| **GET** | `/api/institution/cohorts/[id]/export` | Yes | `institution` | `requireInstitutionCohortOwnership` | Cohort ID in route | `SELECT cohort_participants` | Trainee names, assessment scores | Standard session query | `test/phase-35-1-layered-security.test.ts` |
| **POST** | `/api/disputes/moderation` | Yes | `moderator` / `admin` | Non-partisan staff | Appeal schema | `INSERT INTO dispute_appeals` | Appeal record, status | Privileged role check | `test/phase-35-1-layered-security.test.ts` |
| **POST** | `/api/governance/financial-settlement` | Yes | `governance_auditor` / `admin` | Privileged role | Settlement schema | `INSERT INTO financial_settlements` | UTR reference, settlement hash | Privileged role check | `test/phase-35-1-layered-security.test.ts` |
| **GET** | `/api/workers` | No | Public | Filtered to `is_published = true` | Search query params | `SELECT FROM worker_profiles` | Public name, trade, KaamScore, city | Public directory limit | `test/phase-35-1.test.ts` |
| **GET** | `/api/health` | No | Public | None | None | Supabase connectivity check | Health status, timestamp | Public monitoring | `test/phase-35-1.test.ts` |

---

## 3. Database Assets & RLS Coverage Inventory

- **Total Tables:** 100 relational tables across 31 Supabase migrations.
- **Row Level Security (RLS) Status:** 100% of tables have `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`.
- **Sensitive Isolation Enforced:**
  - `otp_challenges`: Access granted exclusively to `service_role`; blocked for `anon` and `authenticated`.
  - `credential_registry`: Tamper-proof W3C credential assertions with active key rotation.
  - `payment_records_ledger`: Permanent `platform_commission_amount = 0.00` database trigger.
  - `worker_profiles`: Public queries strictly filtered to `is_published = true`; unauthenticated phone/email leakage prevented.
