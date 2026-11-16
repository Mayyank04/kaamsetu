# KAAMSETU — PHASE 39 HACKATHON & DEMO ARTIFACT REMOVAL REGISTER

**Target:** `Mayyank04/kaamsetu`  
**Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**Objective:** Track the identification, decommissioning, and complete removal of all public hackathon demo persona elements, UI banners, switching controls, and bypass cookies.

---

## 1. Inventory of Demo & Persona Artifacts

| Artifact | Source File | Prior State | Action Taken | Current State |
| :--- | :--- | :--- | :--- | :--- |
| **Demo Persona UI Tab** | `src/app/login/page.tsx` | Tab allowing quick 1-click login as Electrician, Weaver, Contractor, ASDM | REMOVED | Clean single-form phone OTP authentication. |
| **Demo Persona Cookie** | `src/lib/auth/server.ts`, `src/lib/supabase/middleware.ts` | Cookie `kaamsetu_demo_persona` accepted as authenticated session | REMOVED | Only cryptographically signed `kaamsetu_session` or Supabase session accepted. |
| **Persona Switching Endpoint** | `src/app/api/auth/persona/route.ts` | POST endpoint setting `kaamsetu_demo_persona` | DECOMMISSIONED | Returns 404 / Disabled in production. |
| **Header Persona Switcher** | `src/components/layout/institutional-header.tsx` | "Switch Demo Persona" in dropdown and mobile menu | REMOVED | Replaced with "Account Profile" and standard Sign In / Register links. |
| **Client Auth Context Hook** | `src/lib/auth/use-auth.tsx` | Exported `switchPersona(key)` method | REMOVED | Cleaned up; exports `loginWithOtp`, `refreshSession`, `logout`. |
| **Demo User Bypass in Onboarding** | `src/server/services/onboarding.service.ts` | Skipped DB persistence if `user.isDemo` was true | REMOVED | Full PostgreSQL profile persistence for all accounts. |
| **Featured Worker Fallback** | `src/lib/supabase/db/profiles.ts` | Returned mock `FEATURED_PROFESSIONALS` when DB failed | REMOVED | Clean empty states or typed database error returned. |

---

## 2. Preservation Invariants

- **Test Fixtures Retained:** Synthetic test personas used strictly inside automated offline test suites (`test/`) are preserved for unit and regression testing.
- **Historical Governance:** Historical audit documentation (`docs/phase-10/` through `docs/phase-38/`) is preserved untouched as permanent historical record.
- **No Decoration:** The UI retains its established human-centred design system: Deep Forest Green (`#153E35`), Warm Ivory (`#F7F5F0`), and Warm Sand (`#E8C999`).
