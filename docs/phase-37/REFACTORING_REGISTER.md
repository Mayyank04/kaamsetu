# KAAMSETU — PHASE 37 REFACTORING REGISTER

**Programme:** KAAMSETU Digital Identity & Worker Empowerment Platform  
**Phase:** 37 — Scalable Architecture, Codebase Restructuring & Technical Debt Elimination  
**Status:** Certified & Grounded in Repository

---

## 1. Executive Summary

This register records every architectural refactoring executed during Phase 37. The objective was to transform the monolithic codebase into a clean, modular monolith with explicit separation of presentation, domain features, core services, and database repositories, without breaking existing working features or test suites.

---

## 2. Refactored Modules & Architectural Enhancements

### 2.1 Centralized Typed Error System & API Response Envelope

| Item | Previous State | Target State | Invariants Preserved |
| :--- | :--- | :--- | :--- |
| **Error Hierarchy** | Ad-hoc `Error` and fragmented `AppError` in `src/lib/error/` with partial status codes | Comprehensive typed hierarchy in `src/lib/errors/app-error.ts` inheriting from `AppError` | All 48 existing call sites preserved via backward-compatible bridge in `src/lib/error/handler.ts` |
| **Response Envelope** | Mixed raw JSON responses and custom objects across 99 API routes | Standardized `ApiResponse<T>` envelope with `requestId`, `timestamp`, `metadata`, and sanitized error details | Consistent contract for mobile, web, and external institutional consumers |
| **Logging** | Scattered `console.log` and `console.error` calls with potential secret leakage | Structured JSON logging in `src/server/logging/logger.ts` with automatic redaction of secrets, tokens, OTPs, and Aadhaar numbers | Zero sensitive data exposure |

---

### 2.2 Server Domain Services & Data Repositories

| Domain | Repository Layer (`src/server/database/repositories/`) | Service Layer (`src/server/services/`) | Key Invariants Enforced |
| :--- | :--- | :--- | :--- |
| **Worker Identity** | `WorkerRepository`: Encapsulates worker profile queries, slug lookups, and publication visibility | `WorkerIdentityService`: Profile orchestration, visibility toggling, KaamScore evidence evaluation | Evidence-backed trust scoring; no fabricated percentiles |
| **Onboarding** | Direct Supabase upsert calls migrated from 324-line route into service | `OnboardingService`: Coordinates vernacular voice intake, geographic checks, Ed25519 credential signing, and profile creation | Controlled rollout bounds; strict genuine audio evidence validation |
| **Bookings** | `BookingRepository`: Encapsulates booking lifecycle queries | `BookingService`: Handles direct booking requests and status transitions | **`platform_commission_amount = 0.00`** permanently enforced at repository and service layer |
| **Contractors** | `ContractorRepository`: Manages organization lookups, workforce roster queries, and project deployments | `ContractorService`: Handles crew allocation, project tracking, and 18% GST subscription billing calculations | Transparent enterprise subscription pricing; zero fee skimming on worker wages |
| **Institutions** | `InstitutionRepository`: Manages partner institutes, cohort tracking, and participant queries | `InstitutionService`: Manages cohort metrics and participant roster progress | Strict partner validation for Assam & Meghalaya skill missions |
| **Credentials** | N/A (Cryptographic Service) | `CredentialService`: Ed25519 sovereign key signing, W3C Verifiable Credential formatting, and signature verification | Ed25519 asymmetric cryptography; private key never exposed |
| **Geographic Bounds** | N/A (Boundary Service) | `GeographicAuthorizationService`: Server-side boundary enforcement | `CLASS_B_CONTROLLED_ROLLOUT` (Guwahati Urban: 781001-781039, Shillong Urban: 793001-793022) |
| **Payouts** | Immutable financial ledger queries | `PayoutService`: Disbursal validation, provenance verification, zero wage deduction invariant | 100% of declared wages must reach artisan; contractor declaration alone is never proof |
| **Grievances** | Worker dispute queries | `GrievanceService`: Dispute submission with 7-day mediation SLA, retaliatory review quarantine, restitution evidence check | Mandatory UPI UTR / Bank reference for wage dispute resolution |

---

### 2.3 Feature Layer Organization (`src/features/`)

| Feature Directory | Module | Description |
| :--- | :--- | :--- |
| `src/features/contractors/` | `billing-calculator.ts`, `index.ts` | Extracted subscription billing calculations from presentation views into reusable feature service |
| `src/features/onboarding/` | `index.ts` | Centralizes vernacular onboarding schemas and service delegations |
| `src/features/worker-identity/` | `index.ts` | Centralizes public artisan search, KaamScore evaluation, and profile visibility |
| `src/features/bookings/` | `index.ts` | Centralizes direct booking lifecycles and zero-commission invariants |
| `src/features/authentication/` | `index.ts` | Centralizes server session verification, RBAC guards, and fail-closed security |

---

### 2.4 API Route Handler Refactoring

| Route Handler | Previous Implementation | Refactored Implementation | Benefits |
| :--- | :--- | :--- | :--- |
| `src/app/api/worker/onboarding/save/route.ts` | 324 lines of inline Supabase queries, manual KaamScore calculation, and credential insertion | Reduced to ~45 lines delegating to `OnboardingService.saveProfile(user, data)` | Separation of concerns, 100% unit testable service logic, elimination of code duplication |
| `src/app/api/bookings/route.ts` | Mixed route handler and database logic | Delegates to `BookingService.requestBooking()` | Centralized zero-commission enforcement and boundary validation |
| `src/app/api/worker/profile/route.ts` | Direct DB profile updates | Delegates to `WorkerRepository.update()` | Consistent repository data-access pattern |

---

## 3. Backward Compatibility Preservation

1. **Error Handler Bridge (`src/lib/error/handler.ts` & `src/lib/error/app-error.ts`):**  
   All 48 existing route handlers importing from `@/lib/error/handler` continue to work without modification because `src/lib/error/handler.ts` transparently re-exports from `src/lib/errors/`.
2. **Route Aliasing Strategy:**  
   Legacy and convenience URLs (`/login`, `/signup`, `/explore`, `/bookings`, `/onboarding`) are preserved as lightweight re-exports to prevent broken links or client regressions.
3. **Phone Normalization Invariant:**  
   `src/lib/utilities/phone.ts` preserves exact behavior expected by `test/phase-35-1-addendum.test.ts` (`normalizeIndianPhone("+91 98765-43210")` returns `formatted: "+919876543210"` and `clean10: "9876543210"`).
