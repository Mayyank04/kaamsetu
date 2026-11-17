# KAAMSETU — PHASE 39.6 AUTHENTICATION & GEOGRAPHIC ROOT CAUSE REPORT

**Operating Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**Constitutional Invariant:** `platform_commission_amount = 0.00` on artisan wages  
**Target URL:** `https://kaamsetu-neon.vercel.app`

---

## 1. Executive Summary

This forensic investigation resolved the dual production failure observed on Vercel:
1. `"Authentication rate limiter temporarily unavailable. Your profile draft has been saved. Please retry in a moment."`
2. `"A valid 6-digit Indian Postal PIN code is required."`

Both issues were rooted in infrastructure discrepancies and unhandled drafting states rather than core business logic defects.

---

## 2. Root Cause 1: "Authentication rate limiter temporarily unavailable"

### Evidence
- On Vercel (`NODE_ENV === "production"`), the rate limiter invokes `adminClient.rpc("check_and_increment_rate_limit")` against `anwppwjlismjyovbyfmb.supabase.co`.
- Diagnostic testing revealed that PostgREST responded with `PGRST202: Could not find the function public.check_and_increment_rate_limit(p_block_seconds, p_key, p_max_attempts, p_window_seconds) in the schema cache` and `PGRST205` for missing tables.
- The remote Supabase production instance had **never had the auth rate limits and stored procedures applied**.
- In local development, `ENABLE_IN_MEMORY_RATE_LIMIT_MOCK=true` or non-production fallback allowed requests to succeed locally in memory while masking the unmigrated remote database state.
- Because production strictly adheres to **fail-closed security invariants**, the missing stored procedure produced HTTP 503 `RATE_LIMIT_INFRASTRUCTURE_UNAVAILABLE`.

### Remediation
1. Created consolidated forward-only, idempotent migration `supabase/migrations/20261117_master_infrastructure_repair.sql` defining:
   - Tables: `auth_rate_limits`, `otp_challenges`, `profiles`, `user_consents`, `contractor_organizations`, `worker_profiles`.
   - Stored procedures: `check_and_increment_rate_limit`, `get_rate_limit_status`, `verify_and_consume_otp`, `register_user_account`.
   - Strict RLS policies and grants.
2. Standardized error taxonomy with `RATE_LIMIT_INFRASTRUCTURE_UNAVAILABLE` (503) vs `RATE_LIMITED` (429).
3. Created automated verification scripts `scripts/verify-supabase-infrastructure.ts` and `scripts/verify-deployment-preflight.ts`.

---

## 3. Root Cause 2: "A valid 6-digit Indian Postal PIN code is required"

### Evidence
- During voice onboarding (Step 2 -> Step 3), the artisan speaks their testimony. Gemini extracts `city: "Guwahati"`, `state: "Assam"`, but `pincode: ""`.
- In `ExtractionEditor.tsx`, `geoStatus` was computed as:
  ```ts
  const geoStatus = React.useMemo(() => {
    if (!city && !state && !pincode) return null;
    return GeographicAuthorizationService.validateLocation({ city, state, pincode: pincode.trim() || null });
  }, [city, state, pincode]);
  ```
- Because `city` was present, the condition `!city && !state && !pincode` was `false`.
- `validateLocation` was called with `pincode: null`, which immediately returned `status: "OUT_OF_BOUNDS"` with `reason: "A valid 6-digit Indian Postal PIN code is required."`.
- This triggered an immediate, aggressive red error banner in Step 3 before the artisan had even clicked on the form.
- Additionally, the PIN input field lacked `required` and client-side format validation, allowing submissions without a PIN to be rejected by the server with HTTP 403.

### Remediation
1. **ExtractionEditor UI Update:**
   - Evaluates `geoStatus` only when the user has entered a complete 6-digit PIN (`normalizedPin.length === 6`).
   - Displays a neutral helper badge when PIN entry is in progress (`X/6 digits`).
   - Does not display red error alerts when the field is simply empty during drafting.
   - Enforces `required` and `pattern="[1-9][0-9]{5}"` on the PIN input field.
   - Prevents form dispatch in `handleSubmit` if PIN is invalid.
2. **Geographic Service Normalization:**
   - Normalizes whitespace (`(req.pincode || "").replace(/\s+/g, "").trim()`) to handle spaced inputs like `"781 001"`.
   - Distinguishes invalid PIN (format error) from valid PIN outside operating zones.
