# KAAMSETU — PHASE 39.6 ROOT CAUSE INVESTIGATION REPORT

**Document ID:** `KAAMSETU-39-6-ROOT-CAUSE`  
**Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**Operating Center:** Guwahati Urban & Shillong Urban  
**Permanent Financial Invariant:** `platform_commission_amount = 0.00` on artisan wages  
**Status:** `VERIFIED_LOCALLY` / `BLOCKED_BY_OPERATOR_ACTION` (Remote Supabase Execution)

---

## 1. Executive Summary & Root-Cause Matrix

| Observed Symptom | Failing Layer | Concrete Evidence | Root Cause | Code/Database Repair | Regression Test Scenario | Subsystem Status |
|---|---|---|---|---|---|---|
| `"Authentication rate limiter temporarily unavailable. Your profile draft has been saved. Please retry in a moment."` | Supabase RPC / PostgREST Schema Cache | Supabase SQL Editor query returned `NULL` for `to_regclass('public.auth_rate_limits')` and `to_regprocedure('check_and_increment_rate_limit(...)')`. Live probe script returned `PGRST202` and `PGRST205`. | Production remote database was never migrated; stored procedures and rate limiting tables did not exist. Fail-closed security returned 503. | Authored idempotent forward-only DDL `supabase/migrations/20261117_master_infrastructure_repair.sql`. | Scenario 10 in `phase-39-6-root-cause-recovery.test.ts` | `BLOCKED_BY_OPERATOR_ACTION` |
| `"A valid 6-digit Indian Postal PIN code is required."` | Frontend Drafting State / UI Validation | When Gemini extracted `city: "Guwahati"` and `state: "Assam"` with empty PIN, `ExtractionEditor.tsx` evaluated `validateLocation` on `pincode: null`, instantly rendering a red error alert. | Live geographic validation ran prematurely on incomplete draft input before user interacted with PIN field. | Updated `ExtractionEditor.tsx` to compute `geoStatus` only when `pin.length === 6`, added progress helper `(X/6 digits)`, and enforced input validation. | Scenario 18, 19, 20 in `phase-39-6-root-cause-recovery.test.ts` | `VERIFIED_LOCALLY` |
| Local vs Production Rate Limiter Drift | Security / Environment Layer | Local env had `ENABLE_IN_MEMORY_RATE_LIMIT_MOCK=true` or non-production fallback masking missing DB; production strictly enforces `allowDevMock=false`. | In-memory limiter masked database absence locally while production failed closed. | Enforced strict typing, correlation ID server logging, and standardized `RATE_LIMIT_INFRASTRUCTURE_UNAVAILABLE`. | Scenario 8, 9, 10, 12 in `phase-39-6-root-cause-recovery.test.ts` | `VERIFIED_LOCALLY` |

---

## 2. Forensic Request Trace

1. **User Action:** Artisan completes voice onboarding step 2 and reaches step 3 (`/onboarding`), then clicks "Verify Mobile Number" and "Send Verification Code".
2. **API Ingress:** Client sends `POST /api/auth/otp/send` with `{ phone, intent: "registration", role: "worker", termsAccepted: true }`.
3. **Validation & Rate Limiting:** Handler calls `validateOtpSendRateLimit(formatted, clientIp)`.
4. **RPC Dispatch:** `checkRateLimit()` invokes `adminClient.rpc("check_and_increment_rate_limit", { p_key, ... })`.
5. **Database Failure:** PostgREST on `https://anwppwjlismjyovbyfmb.supabase.co` encounters missing function `public.check_and_increment_rate_limit` and returns:
   ```json
   {
     "code": "PGRST202",
     "message": "Could not find the function public.check_and_increment_rate_limit(p_block_seconds, p_key, p_max_attempts, p_window_seconds) in the schema cache"
   }
   ```
6. **Fail-Closed Enforcement:** Because production refuses to bypass rate limiting or fall back to an in-memory store across distributed serverless functions, the rate limiter fails closed with HTTP 503 and returns `RATE_LIMIT_INFRASTRUCTURE_UNAVAILABLE`.
