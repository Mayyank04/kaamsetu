# KAAMSETU — PHASE 39.5 SUPABASE RPC & DATABASE CONTRACT AUDIT

**Target:** `public.check_and_increment_rate_limit`, `public.verify_and_consume_otp`, `public.register_user_account`  
**Migration:** `supabase/migrations/20261117000034_phase39_4_account_lifecycle_and_persistence.sql`  
**Status:** IMPLEMENTED BUT NOT VERIFIED (REMOTE CLOUD DB) / VERIFIED WORKING LOCALLY (LOCAL CODE)

---

## 1. Stored Procedures & TypeScript Contracts

### 1.1 `check_and_increment_rate_limit`
```sql
CREATE OR REPLACE FUNCTION public.check_and_increment_rate_limit(
  p_key TEXT,
  p_max_attempts INT,
  p_window_seconds INT,
  p_block_duration_seconds INT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
...
$$;
```
- **Permissions:** Revoked from `anon` and `authenticated`; granted exclusively to `service_role`.
- **TypeScript Caller:** `src/lib/security/rate-limiter.ts` passes exact snake_case parameter names.

### 1.2 `verify_and_consume_otp`
```sql
CREATE OR REPLACE FUNCTION public.verify_and_consume_otp(
  p_phone_hash TEXT,
  p_otp_hash TEXT,
  p_max_attempts INT DEFAULT 5
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
...
$$;
```
- **Serialization:** Locks row `FOR UPDATE` to prevent concurrent race-condition replay.
- **Fail-Closed:** In production, if RPC is missing or schema cache is stale, returns HTTP 503 rather than silent memory bypass.
