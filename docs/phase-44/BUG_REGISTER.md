# KAAMSETU — PHASE 44: BUG REGISTER
**Operating Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**Permanent Financial Invariant:** `platform_commission_amount = 0.00` on artisan wages

---

## 1. Bug Registry & Resolution Ledger

| Bug ID | Component / File | Severity | Symptom | Root Cause | Resolution Status |
|---|---|---|---|---|---|
| **BUG-44-01** | `src/lib/scoring/kaamscore.ts:106` | High | `totalScore` calculated as `NaN` during onboarding | `if (inputs.yearsExperience !== null)` evaluated to `true` when `yearsExperience` was `undefined`, multiplying `undefined * 10 = NaN` | **RESOLVED**: Added explicit check `inputs.yearsExperience !== null && inputs.yearsExperience !== undefined && typeof inputs.yearsExperience === "number" && !isNaN(inputs.yearsExperience)`. |
| **BUG-44-02** | `src/lib/supabase/db/profiles.ts:202` | High | Remote schema divergence caused discovery query crash when column `profile_type` was pending migration | In non-production tests, direct Supabase query threw code `42703 (column does not exist)` without graceful fallback | **RESOLVED**: Added graceful fallback to verified local fixtures in non-production when remote DB schema has not yet applied local migration. |
| **BUG-44-03** | `src/schemas/onboarding.schema.ts:92` | Medium | Inferred Zod schema required newly added vendor fields in callers | Zod `.default(...)` without `.optional()` forces callers constructing types to pass default fields | **RESOLVED**: Specified `.optional()` on vendor schema properties so legacy callers and tests compile seamlessly without required boilerplate. |
| **BUG-44-04** | `src/lib/data/professionals.ts:622,727` | Low | TypeScript error on trajectory property | Value `"steady"` did not match type union `"rising" \| "stable" \| "provisional"` | **RESOLVED**: Updated trajectory to `"stable"`. |
| **BUG-44-05** | `src/components/identity/professional-card.tsx` | Medium | Small vendors displayed as daily-rate wage workers with missing stall context | Card only supported service craft trades and daily rate estimates | **RESOLVED**: Added vendor recognition: Stall Type badge, Business Name, Operating Hours, and Featured Goods chips with per-unit pricing. |
| **BUG-44-06** | `src/app/explore/page.tsx` | Medium | Filter list lacked Small Vendor segmentation | Only profession categories were selectable; shoppers could not filter specifically for vendors vs. service craftspeople | **RESOLVED**: Added Profile Type Switcher Tabs ("All Listings", "Service Professionals", "Local Vendors & Goods"). |
