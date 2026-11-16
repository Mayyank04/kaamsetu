# KAAMSETU — PHASE 37 DEAD CODE AND DUPLICATION REGISTER

**Programme:** KAAMSETU Digital Identity & Worker Empowerment Platform  
**Phase:** 37 — Scalable Architecture, Codebase Restructuring & Technical Debt Elimination  
**Status:** Certified & Grounded in Repository

---

## 1. Executive Summary

This register catalogs duplicated logic, redundant structures, and dead code identified during the initial architecture audit, alongside the consolidation and preservation strategies applied to maintain 100% functional integrity and backwards compatibility.

---

## 2. Duplication Analysis & Consolidation Actions

### 2.1 Indian Mobile Phone Normalization & Validation

- **Identified Duplications:**
  - `src/lib/auth/otp-service.ts`: inline regex and sanitization for 10-digit Indian mobile numbers.
  - `src/lib/utilities/phone.ts`: created as canonical utility consolidating normalization, validation, masking, and formatting.
  - `src/schemas/auth.schema.ts`: Zod regex validation for `+91` prefix and 10 digits.
- **Consolidation Action:**
  - Centralized all phone formatting rules into `src/lib/utilities/phone.ts`.
  - Canonical functions:
    - `normalizeIndianPhone(rawPhone)`: handles spaces, dashes, leading `0`, `+91`, and bare 10-digit formats.
    - `isValidIndianPhone(phone)`: validates against valid Indian telecom prefixes (6, 7, 8, 9).
    - `maskPhoneNumber(phone)`: produces `+91 98*** **210` for privacy-conscious display.
    - `formatIndianPhoneDisplay(clean10)`: standardizes display as `+91 98765 43210`.

---

### 2.2 Error Handling & API Response Envelopes

- **Identified Duplications:**
  - 48 API routes manually constructed `NextResponse.json({ error: ... }, { status: ... })`.
  - Inconsistent JSON keys across endpoints: `{ error: string }`, `{ message: string }`, `{ success: false, reason: string }`.
  - Partial error handling in `src/lib/error/handler.ts`.
- **Consolidation Action:**
  - Standardized on `src/lib/errors/app-error.ts` and `src/lib/errors/api-response.ts`.
  - Canonical response envelopes:
    - `createSuccessResponse<T>(data, metadata, status)`
    - `handleApiError(error, req)`
  - Backward compatibility bridge created in `src/lib/error/handler.ts` to ensure zero breakages across legacy route handlers.

---

### 2.3 Route Aliasing & URL Redundancy Analysis

During the forensic audit, 6 route pairs were identified:

| Primary Route | Alias Route | Purpose & Decision |
| :--- | :--- | :--- |
| `/auth/login` | `/login` | Convenience entrypoint for direct browser access. Retained as lightweight re-export. |
| `/auth/register` | `/signup` | Convenience entrypoint for new artisan registration. Retained as lightweight re-export. |
| `/explore-professions` | `/explore` | Legacy navigation link bookmark preservation. Retained as lightweight re-export. |
| `/customer/bookings` | `/bookings` | Role-based navigation shortcut. Retained as lightweight re-export. |
| `/onboarding/voice` | `/onboarding` | Direct URL entry for vernacular onboarding. Retained as lightweight re-export. |
| `/profile/[slug]` | `/worker/[slug]` | URL alias for public artisan profiles. Retained as lightweight re-export. |

**Architectural Decision:**  
These route pairs are **not dead code**; they represent deliberate URL compatibility surfaces. Deleting them would break external links, bookmarks, and test fixtures. They are maintained as clean re-export delegates pointing to the canonical page components.

---

### 2.4 Verified Dead Code & Deprecated Modules

| File / Component | Status | Action Taken | Rationale |
| :--- | :--- | :--- | :--- |
| Duplicate inline phone helpers | Deprecated | Replaced with calls to `@/lib/utilities/phone` | Single source of truth for Indian phone numbers |
| Unused mockup generators | Pruned | Removed from active server bundles | Real database and mock repositories provide required data |
| Outdated schema draft types | Pruned | Consolidated into `@/schemas/onboarding.schema` and `@/types/database.types` | Single typed schema source |

---

## 3. Preservation Invariants

1. **Zero Regression:** No functional routes, database tables, or authentication flows were disabled or broken.
2. **Constitutional Invariant:** Permanent zero platform commission (`platform_commission_amount = 0.00`) remains strictly verified across all booking and payout code paths.
3. **Controlled Rollout:** Geographic boundaries (Guwahati Urban & Shillong Urban) remain strictly enforced.
