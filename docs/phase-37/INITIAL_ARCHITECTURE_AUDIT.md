# KAAMSETU — PHASE 37 INITIAL ARCHITECTURE AUDIT
## Forensic System Inspection, Technical Debt Inventory & Duplication Register

**Programme:** KAAMSETU Digital Identity & Worker Empowerment Platform  
**Workstream:** Phase 37 — Scalable Architecture & Codebase Modernization  
**Repository:** `Mayyank04/kaamsetu`  
**Starting Commit Baseline:** `5f9c1b556ddf3c439ba9eba8ab222cfa6d4139a6`  
**Branch:** `phase-37-architecture-modernization`  
**Date:** 16 November 2026  
**Auditor:** Principal Software Architect, Senior Full-Stack Engineer, Backend Architect & Security Auditor  

---

## 1. Executive Summary

A comprehensive forensic audit of the KAAMSETU repository was conducted across its build tooling, directory hierarchy, route topology, API contracts, state management, database integrations, and test coverage.

KAAMSETU is a high-integrity platform serving informal vocational artisans in India, operating under a permanent constitutional zero-commission invariant (`platform_commission_amount = 0.00`) and a `CLASS_B_CONTROLLED_ROLLOUT` boundary (Guwahati Urban & Shillong Urban). 

Over 36 iterative phases, the platform has successfully implemented critical security, cryptographic, and domain features (Ed25519 signing, DPDP consent enforcement, OTP replay protection, and 30-point anti-AI design reconstruction). However, rapid iterative evolution has accumulated architectural technical debt:
1. **Scattered Environment Access:** Direct `process.env.*` reads across 15+ disparate files without centralized server-side configuration validation.
2. **Inconsistent Error Handling & API Responses:** Mixed API response structures (`{ success: true, data: T }` vs raw payload `{ ...data }` vs `{ error: string }`), and error handlers that lack correlation IDs.
3. **Oversized Monolithic UI Components:** `contractor-dashboard-view.tsx` (982 lines) and `page.tsx` (663 lines) embed complex billing math, crew matching, and state machines directly in JSX.
4. **Scattered Services in `src/lib/`:** Over 35 subdirectories in `src/lib/` with varying naming conventions and blurred responsibilities between repositories, services, and utilities.
5. **Route Duplication / Aliasing:** 6 route pairs exist purely for URL alias compatibility (`/login` vs `/auth/login`, `/signup` vs `/auth/register`, `/explore` vs `/explore-professions`, `/bookings` vs `/customer/bookings`, `/onboarding` vs `/onboarding/voice`, `/profile/[slug]` vs `/worker/[slug]`).
6. **Test Organization Debt:** 42 test files located in a flat `test/` directory, structured by historical milestone phases rather than architectural purpose (unit, integration, security).

---

## 2. Inventory of System Artifacts

### 2.1 Route Inventory (App Router)
- **Public Informational & Editorial:**
  - `/` (`src/app/page.tsx`): Main landing page (hero, 32 trades, how it works, why degree-free, dual-pane guild preview).
  - `/about` (`src/app/about/page.tsx`): Institutional mission and governance.
  - `/how-it-works` (`src/app/how-it-works/page.tsx`): 4-step artisan journey & cryptographic trust architecture.
  - `/terms` (`src/app/terms/page.tsx`): 12-section Terms of Service & permanent zero-commission guarantee.
  - `/privacy` (`src/app/privacy/page.tsx`): 9-section DPDP Act compliance & zero raw Aadhaar guarantee.
  - `/explore` (`src/app/explore/page.tsx`): National vocational trades & verified artisan directory.
  - `/explore-professions` (`src/app/explore-professions/page.tsx`): Compatibility alias -> `/explore`.
- **Authentication & Registration:**
  - `/login` (`src/app/login/page.tsx`): Phone OTP authentication & institutional demo persona switcher.
  - `/signup` (`src/app/signup/page.tsx`): Compatibility alias -> `/login`.
  - `/auth/login` (`src/app/auth/login/page.tsx`): Compatibility alias -> `/login`.
  - `/auth/register` (`src/app/auth/register/page.tsx`): Compatibility alias -> `/login`.
- **Worker & Public Profiles:**
  - `/onboarding` (`src/app/onboarding/page.tsx`): 4-step vernacular voice onboarding wizard.
  - `/onboarding/voice` (`src/app/onboarding/voice/page.tsx`): Compatibility alias -> `/onboarding`.
  - `/profile/[slug]` (`src/app/profile/[slug]/page.tsx`): Public artisan profile, service menu, booking dialog.
  - `/worker/[slug]` (`src/app/worker/[slug]/page.tsx`): Compatibility alias -> `/profile/[slug]`.
  - `/verify/[registryId]` (`src/app/verify/[registryId]/page.tsx`): Offline QR verification of Ed25519 credentials.
- **Dashboards & Portals:**
  - `/dashboard` (`src/app/dashboard/page.tsx`): Sovereign artisan workbench (records, payouts, crew invites, visibility).
  - `/contractor/dashboard` (`src/app/contractor/dashboard/page.tsx`): Commercial crew management & subscription invoices.
  - `/institution/dashboard` (`src/app/institution/dashboard/page.tsx`): State vocational cohorts, consent tracking, credentials.
  - `/customer/bookings` (`src/app/customer/bookings/page.tsx`): Client booking status, payments, OTP review modal.
  - `/bookings` (`src/app/bookings/page.tsx`): Compatibility alias -> `/customer/bookings`.

### 2.2 API Endpoint Inventory (99 Handlers in `src/app/api/`)
- **Authentication:** `auth/logout`, `auth/me`, `auth/otp/send`, `auth/otp/verify`, `auth/persona`.
- **Worker Identity & Operations:** `worker/profile`, `worker/onboarding/extract`, `worker/onboarding/save`, `worker/dashboard`, `worker/payouts`, `worker/portfolio`, `worker/portfolio/upload`, `worker/invitations`, `worker/invitations/[id]/respond`, `worker/bookings/[id]`, `worker/identity/export`, `worker/identity/grants`, `worker/consent-audit`, `worker/grievance`, `worker/disputes`, `worker/profile/correction`, `worker/support`, `worker/opportunities`, `worker/outcomes`, `worker/impact-replication`.
- **Contractor & Enterprise Operations:** `contractor/organization`, `contractor/workforce`, `contractor/projects`, `contractor/projects/[id]/crew`, `contractor/projects/match`, `contractor/invitations`, `contractor/billing/order`, `contractor/billing/verify`, `contractor/billing/history`, `contractor/billing/cancel`, `contractor/billing/webhook`, `contractor/subscription`, `contractor/success`, `contractor/opportunities`.
- **Institutional Partnerships:** `institution/cohorts`, `institution/cohorts/[id]/participants`, `institution/cohorts/[id]/progress`, `institution/cohorts/[id]/export`, `institution/credentials`, `institution/metrics`, `institution/onboarding`, `institution/sandbox/verify`, `institution/signatories`.
- **Bookings, Reviews & Disputes:** `bookings`, `bookings/[id]/status`, `customer/bookings`, `reviews`, `disputes/moderation`.
- **Governance & Financial Ledgers:** `governance/attestations`, `governance/claim-reconciliations`, `governance/class-a-readiness`, `governance/disputes`, `governance/evidence-registry`, `governance/financial-settlement`, `governance/gap-assessment`, `governance/institutional-blockers`, `governance/institutional-ratifications`, `governance/operations-dashboard`, `governance/regional-evaluations`, `governance/regional-operating-reviews`, `governance/release-manifests`, `governance/worker-outcomes`, `billing/exceptions`, `billing/gst-ledger`, `payments/ledger`.
- **Regional Gates & Ecosystem:** `regions/governance`, `regions/launch-gates`, `regions/lifecycle`, `regions/liquidity`, `regions/operations`, `regions/siliguri/gates`, `regional/sustained-operations`, `ecosystem/ondc`, `ecosystem/ondc/onboarding`, `ecosystem/onest`, `ecosystem/onest/readiness`, `enterprise/pilot`, `enterprise/sync`, `finance/readiness`, `finance/tool-financing`, `observability/ecosystem-dashboard`, `observability/integrations`, `staffing/cross-region`, `v1/interop/worker/[token]`, `v2/identity/export`.
- **System Utilities:** `health`, `incidents/lifecycle`, `reports/abuse`, `ai/extract-skill`, `analytics/provenance`.

### 2.3 Database Tables & Relationships (95 Schema Tables)
- Core identity: `profiles`, `worker_profiles`, `worker_skills`, `skills`, `occupations`, `portfolio`.
- Commercial operations: `bookings`, `reviews`, `work_records`, `contractor_organizations`, `contractor_workforce`, `contractor_projects`, `workforce_invitations`, `subscription_orders`.
- Institutional compliance: `institutions`, `institutional_cohorts`, `cohort_participants`, `institutional_credentials`, `institution_authorized_signatories`.
- Sovereign trust & governance: `worker_consent_audit_events`, `worker_payout_confirmations`, `payment_records_ledger`, `audit_chain_checkpoints`, `worker_payout_dispute_records`, `evidence_registry_records`, `independent_audit_attestations`.

---

## 3. The 17 Specific Technical Debt Findings

### Debt 01: Duplicate Components & Redundant Route Wrappers
- **Finding:** 6 routes in `src/app/` are single-line re-exports created for legacy URL compatibility:
  - `src/app/auth/login/page.tsx` (`export { default } from "../../login/page"`)
  - `src/app/auth/register/page.tsx` (`export { default } from "../../login/page"`)
  - `src/app/explore-professions/page.tsx` (`import ExplorePage from "../explore/page"`)
  - `src/app/bookings/page.tsx` (`import CustomerBookingsPage from "@/app/customer/bookings/page"`)
  - `src/app/onboarding/voice/page.tsx` (identical to `onboarding/page.tsx` with minor metadata variation)
  - `src/app/worker/[slug]/page.tsx` (`import PublicProfilePage from "@/app/profile/[slug]/page"`)
- **Remediation Plan:** Retain route compatibility to prevent breaking legacy bookmarks, but consolidate metadata and imports through a single canonical page module.

### Debt 02: Duplicate Business Logic
- **Finding:** Indian phone normalization is implemented separately in `src/lib/auth/otp-service.ts` (`normalizeIndianPhone`) and inline via regex in `src/lib/auth/server.ts` and `src/schemas/auth.schema.ts`.
- **Remediation Plan:** Centralize phone normalization into `src/lib/utilities/phone.ts` and import universally.

### Debt 03: Repeated Database Queries & Uncached Reads
- **Finding:** Profile ownership and contractor organization lookups are queried independently across multiple API routes instead of utilizing a shared repository function.
- **Remediation Plan:** Extract reusable data-access functions into dedicated repositories (`src/server/database/`).

### Debt 04: Circular Dependency Vulnerabilities
- **Finding:** `src/lib/auth/server.ts` imports from `src/lib/supabase/server.ts` which in turn imports from `src/lib/supabase/client.ts`.
- **Remediation Plan:** Strict unidirectional layering: Types -> Config -> Database -> Repositories -> Services -> API Handlers.

### Debt 05: Oversized Monolithic React Components
- **Finding:** 
  - `src/components/dashboard/contractor-dashboard-view.tsx` is 982 lines long and handles crew rosters, project modals, tax calculation, subscription tier upgrades, and invitation tracking in a single file.
  - `src/app/page.tsx` is 663 lines long.
- **Remediation Plan:** Decompose oversized components into domain subcomponents (`features/contractors/components/`).

### Debt 06: Oversized API Route Handlers
- **Finding:** `src/app/api/worker/onboarding/save/route.ts` (300+ lines) performs phone lookup, location geo validation, profile upsert, skills extraction, occupation linkage, and response formatting in a single handler.
- **Remediation Plan:** Delegate business workflow to `OnboardingService.saveProfile()`. The route handler retains only request parsing, validation, service invocation, and response serialization.

### Debt 07: Unused Exports & Deprecated Helpers
- **Finding:** Several helper functions in `src/lib/utils.ts` and `src/lib/auth/server.ts` are left over from Phase 10–25 refactoring and have no call sites.
- **Remediation Plan:** Audit call sites, verify zero dependencies, and remove dead exports.

### Debt 08: Legacy Mockup Folders in Project Root
- **Finding:** Root contains 3 legacy prototype folders from repository creation:
  - `kaamsetu_india_s_universal_digital_skill_identity_platform/` (HTML + PNG)
  - `kaamsetu_voice_first_worker_registration_flow/` (HTML + PNG)
  - `sovereign_trust/` (DESIGN.md)
  - `kaamsetu-phase-35-1-certified.zip` (3.4 MB archive)
- **Remediation Plan:** Document these files in the dead code register. Maintain repository cleanliness without destroying git history.

### Debt 09: Inconsistent Module Naming
- **Finding:** `src/lib/error/` uses singular, while `src/schemas/` and `src/types/` use plural. Service files alternate between kebab-case and descriptor prefixes.
- **Remediation Plan:** Establish consistent naming convention aligned with Section 7.

### Debt 10: Inconsistent Error Handling & Missing Request Correlation IDs
- **Finding:** Some API routes return raw `{ error: "message" }`, others return `{ success: false, error: { code, message } }`. Many catch blocks lack request correlation IDs (`requestId`).
- **Remediation Plan:** Introduce typed error classes (`AuthenticationError`, `AuthorizationError`, `ValidationError`, `NotFoundError`, `ConflictError`, `RateLimitError`, `ExternalServiceError`, `DatabaseError`, `ConfigurationError`) and standardized `ApiResponse<T>` with `requestId` and timestamp.

### Debt 11: Direct Database Access from Server Components
- **Finding:** `src/app/dashboard/page.tsx` performs direct database reads using `createClient()` inline rather than going through a service layer.
- **Remediation Plan:** Route data fetching through typed domain service calls.

### Debt 12: Business Logic Embedded in React Components
- **Finding:** Subscription breakdown math (`calculateBillingBreakdown`), GST tax calculations, and discount schedules are written inside `contractor-dashboard-view.tsx`.
- **Remediation Plan:** Extract financial math to `src/features/contractors/services/billing-calculator.ts`.

### Debt 13: Inconsistent Environment Variable Access
- **Finding:** Over 15 files access `process.env.*` directly without going through `src/lib/env.ts`. When `RATE_LIMIT_HMAC_SECRET` was missing in Phase 35.1, it caused fatal uncaught exceptions.
- **Remediation Plan:** Create a centralized, server-only environment validation module `src/server/configuration/environment.ts` with fail-closed security.

### Debt 14: Inconsistent API Response Formats
- **Finding:** Mixed success envelopes across endpoints (`{ success: true, data: T }` vs raw `{ ...T }`).
- **Remediation Plan:** Standardize on `ApiResponse<T>` envelope with backward compatibility helpers.

### Debt 15: Missing Schema Validation on Inbound Requests
- **Finding:** Several smaller endpoints parse `await request.json()` without passing through a Zod schema.
- **Remediation Plan:** Enforce Zod schemas across all POST, PATCH, and PUT endpoints.

### Debt 16: Scattered State Management
- **Finding:** UI state, draft form state in `localStorage`, and server state are mixed in complex component hierarchies without a documented state boundary.
- **Remediation Plan:** Define clear state boundaries in `docs/phase-37/STATE_MANAGEMENT_GUIDE.md`.

### Debt 17: Flat Test Directory Organization
- **Finding:** 42 test files sit in a flat `test/` directory named after historical phase milestones (`phase-13-*.test.ts`, `phase-35-*.test.ts`).
- **Remediation Plan:** Introduce a modular testing strategy organizing tests by domain and purpose while preserving existing test scripts.

---

## 4. Next Steps & Target Architecture Plan

The findings from this audit define the roadmap for Phase 37 execution. Work will proceed in controlled, atomic stages without breaking existing user journeys, maintaining the permanent zero-commission invariant and Class B rollout restrictions.
