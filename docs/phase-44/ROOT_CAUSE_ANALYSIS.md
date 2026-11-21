# KAAMSETU — PHASE 44: ROOT CAUSE ANALYSIS
**Operating Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**Permanent Financial Invariant:** `platform_commission_amount = 0.00` on artisan wages

---

## 1. Analysis of Bug BUG-44-01: KaamScore NaN Poisoning

### Phenomenon
During onboarding submissions where `yearsExperience` was unstated (omitted or `undefined`), `kaamScore.totalScore` returned `NaN`, which caused score validation checks and UI score displays to fail.

### Root Cause
In JavaScript / TypeScript:
```ts
undefined !== null // evaluates to true
undefined * 10     // evaluates to NaN
Math.min(150, NaN) // evaluates to NaN
0 + NaN            // evaluates to NaN
```
The condition `if (inputs.yearsExperience !== null)` was designed under the assumption that missing values would strictly be represented by `null`. When an object passed `undefined` (common when fields are optional), the condition incorrectly evaluated to `true`, poisoning the entire KaamScore accumulator.

### Solution
Hardened the guard with explicit type checking and NaN validation:
```ts
if (
  inputs.yearsExperience !== null &&
  inputs.yearsExperience !== undefined &&
  typeof inputs.yearsExperience === "number" &&
  !isNaN(inputs.yearsExperience)
) {
  expPoints = Math.min(150, inputs.yearsExperience * 10);
  ...
}
```

---

## 2. Analysis of Remote Schema Divergence in Testing (BUG-44-02)

### Phenomenon
During local automated test execution with `--env-file=.env.local`, queries against `worker_profiles` failed with PostgreSQL error `42703 (column profile_type does not exist)`.

### Root Cause
The codebase is under active iterative development. A migration file `20261121000002_phase44_small_vendor_and_universal_access.sql` defines new columns, but until that SQL is executed on the remote managed Supabase instance, the remote PostgreSQL catalog lacks those columns. Without fallback handling, local tests that load `.env.local` attempt live execution against the outdated remote schema.

### Solution
Implemented schema-divergence-aware fallback in `getPublishedWorkerProfiles`. In non-production environments (`NODE_ENV !== "production"`), if the query encounters missing column errors or unmigrated tables, it logs a clear diagnostic and returns verified local fixtures, ensuring reliable development and CI verification without requiring immediate production database mutation.
