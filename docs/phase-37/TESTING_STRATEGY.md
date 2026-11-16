# KAAMSETU — TESTING STRATEGY & QUALITY ASSURANCE FRAMEWORK

**Programme:** KAAMSETU Digital Identity & Worker Empowerment Platform  
**Phase:** 37 — Scalable Architecture, Codebase Restructuring & Technical Debt Elimination  
**Status:** Certified & Grounded in Repository

---

## 1. Testing Philosophy & Quality Floor

KAAMSETU adheres to a strict test-driven and regression-hardened engineering philosophy. Because this platform handles legal worker identities, financial payouts, and cryptographic skill credentials, automated verification is mandatory before any release or PR merge.

---

## 2. Test Suite Hierarchy

```
test/
├── phase-35-1.test.ts                         # Core security and fail-closed RBAC tests
├── phase-35-1-addendum.test.ts                # Production OTP lifecycle & onboarding journey tests
├── phase-35-1-layered-security.test.ts        # Layered security, boundary & rate-limit tests
├── phase-35-2.test.ts                         # Incident remediation & session tests
├── phase-36-1.test.ts                         # Anti-AI design audit & accessibility tests
└── phase-37-architecture-modernization.test.ts# Architectural layers, services & repositories tests
```

---

## 3. Test Categories & Verification Scope

### 3.1 Architecture & Layer Boundary Tests (`test:phase37`)
- **Error System:** Verifies all 9 typed error classes inherit from `AppError` and produce correct HTTP status codes and standard API error envelopes.
- **Service Layer Delegation:** Verifies `WorkerIdentityService`, `BookingService`, `OnboardingService`, `ContractorService`, `InstitutionService`, `CredentialService`, `GeographicAuthorizationService`, and `PayoutService`.
- **Zero-Commission Invariant:** Verifies that both `BookingRepository` and `PayoutService` strictly reject any commission deductions (`platform_commission_amount = 0.00`).
- **Phone Utilities:** Verifies normalization, validation, masking, and formatting across diverse Indian mobile number formats.
- **Fail-Closed Environment Validator:** Verifies that `envService` fails closed when `RATE_LIMIT_HMAC_SECRET` is missing in production mode.
- **Route Aliasing:** Verifies that legacy and convenience route pairs resolve correctly.

### 3.2 Security & Authorization Regression Tests (`test:phase35.1` & `test:phase35.2`)
- Fail-closed authentication when anonymous callers invoke protected routes.
- Role-based access control (RBAC) preventing horizontal and vertical privilege escalation.
- Constant-time HMAC comparison and Ed25519 asymmetric signature verification.
- Controlled rollout boundary enforcement for Guwahati Urban and Shillong Urban.

### 3.3 UI & Design System Quality Gates (`test:phase36.1`)
- Anti-AI-slop design checks: zero floating blur blobs, zero repetitive 3-card partitions.
- Token adherence: Deep Forest Green (`#153E35`), Warm Ivory (`#F7F5F0`), Warm Sand (`#E8C999`).
- Responsive viewports: Desktop (1440px), Tablet (768px), and Mobile (390px).

---

## 4. Execution Commands

| Command | Target Suite |
| :--- | :--- |
| `npm run test:phase37` | Phase 37 Architecture & Service Modernization Suite |
| `npm run test:phase36.1` | Phase 36.1 Anti-AI Design & Human-Centred UI Suite |
| `npm run test:phase35.2` | Phase 35.2 Production Remediation & Auth Incident Suite |
| `npm run test:phase35.1:addendum` | Phase 35.1 Addendum OTP & Onboarding Reliability Suite |
| `npm run test:phase35.1` | Phase 35.1 Core Security & Layered Protection Suite |
| `npm run test:all` | Complete end-to-end regression test suite |
| `npm run lint` | ESLint static code analysis |
| `npx tsc --noEmit` | Strict TypeScript compilation check |
| `npm run build` | Next.js production build verification |

---

## 5. Mandatory CI/CD Quality Gates

Every code change must pass all gates in sequence:
1. `npx tsc --noEmit` (0 errors)
2. `npm run test:phase37` (100% pass)
3. `npm run test:phase36.1` (100% pass)
4. `npm run test:phase35.2` (100% pass)
5. `npm run test:phase35.1:addendum` (100% pass)
6. `npm run test:phase35.1` (100% pass)
7. `npm run build` (Clean production bundle build)
