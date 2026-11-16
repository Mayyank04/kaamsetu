# KAAMSETU ENGINEERING & CONTRIBUTION GUIDELINES (CONTRIBUTING.md)

**Mission:** Every skill deserves to be seen, even without a degree.  
**Domain:** Sovereign Worker Identity, Cryptographic Trust, Fair Labor Economics, Institutional Skill Infrastructure.  
**Operating Scope:** `CLASS_B_CONTROLLED_ROLLOUT` (Guwahati Urban, Assam & Shillong Urban, Meghalaya).  
**Permanent Invariant:** `platform_commission_amount = 0.00` permanently on artisan wages.  

---

## 1. Core Engineering Ethics & Invariants

Every engineer, agent, or contributor working on KAAMSETU must strictly adhere to the following non-negotiable rules:

1. **Zero-Commission Guarantee:** The platform charges **0.00% commission** on artisan earnings. Never introduce transaction deductions, broker margins, or referral cuts on worker labor.
2. **Fail-Closed Security:** Never leak internal configuration variable names, stack traces, or secrets in client responses. When security keys are missing, fail closed immediately with user-friendly messages.
3. **No Decorative AI Slop:** Adhere strictly to `DESIGN.md` and the 30-Point Anti-AI Design Directive. No sparkles icons, no oversized `rounded-2xl` cards, no atmospheric gradient blur orbs, and no fake AI confidence scores.
4. **Physical Browser Verification:** Never claim a UI change is complete without inspecting rendered output across Desktop (1440px), Laptop (1280px), Tablet (768px), Mobile (390px), and Narrow Mobile (320px).
5. **Preserve Main Branch:** Never work directly on `main` or force-push. Use feature branches prefixed with the workstream name.

---

## 2. Local Environment Setup

### 2.1 Prerequisites
- Node.js `v20.x` or higher (verified with Node.js v24 LTS)
- npm `v10.x` or higher
- PostgreSQL 15+ (or Supabase CLI)
- Google Chrome (for headless browser visual verification)

### 2.2 Installation
```bash
# Clone the repository
git clone https://github.com/Mayyank04/kaamsetu.git
cd kaamsetu

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local
```

### 2.3 Running the Development Server
```bash
npm run dev
# Starts local server on http://localhost:3000
```

### 2.4 Building for Production
```bash
npm run build
# Generates optimized static & dynamic build
```

---

## 3. Naming & Code Conventions

| Category | Convention | Examples |
|---|---|---|
| **React Components** | PascalCase | `WorkerCard`, `OnboardingWizard`, `BookingRequestDialog` |
| **Custom Hooks** | `use` + PascalCase | `useAuth`, `useGeographicZone`, `useDraftPersistence` |
| **Service Classes / Modules** | PascalCase or kebab-case | `WorkerIdentityService`, `onboarding-service.ts` |
| **Repository Modules** | kebab-case | `worker-repository.ts`, `booking-repository.ts` |
| **Utility Functions** | camelCase | `normalizeIndianPhone`, `formatInrCurrency`, `generateRegistryId` |
| **Types & Interfaces** | PascalCase | `WorkerProfile`, `SubscriptionOrder`, `ApiResponse` |
| **Constants** | UPPER_SNAKE_CASE | `PERMITTED_OPERATING_REGIONS`, `ZERO_COMMISSION_INVARIANT` |
| **Database Tables** | snake_case (plural) | `worker_profiles`, `contractor_organizations`, `bookings` |
| **Database Columns** | snake_case | `user_id`, `daily_rate_inr`, `is_dispatch_eligible` |
| **Test Files** | `*.test.ts` | `phase-37-architecture.test.ts`, `auth-lifecycle.test.ts` |

---

## 4. Branch & Commit Conventions

### 4.1 Branch Naming
- Feature work: `feat/<feature-name>` or `phase-<number>-<description>`
- Bug fixes: `fix/<issue-name>`
- Architectural modernization: `refactor/<scope-name>`
- Examples: `phase-37-architecture-modernization`, `feat/payout-reconciliation`

### 4.2 Commit Messages
Follow Conventional Commits:
- `feat(scope): short description`
- `fix(scope): short description`
- `refactor(scope): short description`
- `docs(scope): short description`
- `test(scope): short description`

---

## 5. Testing Requirements

Before opening a pull request, all automated test suites must pass cleanly:

```bash
# 1. Strict TypeScript check
npx tsc --noEmit

# 2. ESLint code standard check
npm run lint

# 3. Architectural modern tests
npm run test:phase37

# 4. Security & regression tests
npm run test:phase36.1
npm run test:phase35.2
npm run test:phase35.1

# 5. Production build
npm run build
```

---

## 6. Pull Request Checklist

Every PR must be accompanied by evidence confirming:
- [ ] Working tree is clean and builds successfully (`npm run build`).
- [ ] No regression on authentication, OTP lifecycle, or draft persistence.
- [ ] No direct privileged database queries inside client UI components.
- [ ] Invariant `platform_commission_amount = 0.00` strictly maintained.
- [ ] All inputs validated via Zod schemas.
- [ ] No Lucide `Sparkles` icon imports in UI components.
- [ ] No `rounded-2xl` or `rounded-3xl` classes used on cards or panels.
- [ ] Multi-viewport screenshots captured if UI surfaces were modified.
- [ ] Relevant documentation updated in `docs/`.
