# KAAMSETU — PHASE 39.3 SUPABASE RPC RECONCILIATION
## Schema Audit, PL/pgSQL Definition, Security Privileges & Database Verification

**Date:** 17 November 2026  
**Document Classification:** Engineering Register (`CLASS_B_CONTROLLED_ROLLOUT`)  
**Operating Branch:** `phase-39-3-production-otp-rate-limiter-recovery`  
**Migration Path:** `supabase/migrations/20261117000033_phase39_3_rate_limit_and_otp_infrastructure.sql`

---

## 1. Remote vs Local Database Audit

An empirical database comparison was conducted between the local test database (`kaamsetu_rls_test` on `localhost:5432`) and the remote Supabase project (`anwppwjlismjyovbyfmb.supabase.co`).

### 1.1 Remote Supabase Cloud Inspection (`anwppwjlismjyovbyfmb`)
- **API Endpoint:** `https://anwppwjlismjyovbyfmb.supabase.co/rest/v1/rpc/check_and_increment_rate_limit`
- **Response:** HTTP 404
- **PostgREST Body:**
  ```json
  {
    "code": "PGRST202",
    "details": "Searched for the function public.check_and_increment_rate_limit with parameters p_key, p_max_attempts, p_window_seconds, or with a single unnamed json/jsonb parameter, but no match was found in the schema cache.",
    "hint": "Perhaps you meant to call the function ...",
    "message": "Could not find the function public.check_and_increment_rate_limit in the schema cache"
  }
  ```
- **Supabase Cloud SQL Editor Execution:**
  ```sql
  SELECT proname, prosecdef FROM pg_proc WHERE proname = 'check_and_increment_rate_limit';
  -- Result: Success. No rows returned.
  ```
- **Status Classification:** **`BLOCKED BY EXTERNAL INFRASTRUCTURE`**
  *(Direct DDL execution requires manual application via the Supabase Dashboard SQL editor or administrative database management token).*

### 1.2 Local Database Inspection (`kaamsetu_rls_test`)
- **Database Engine:** PostgreSQL 14+ with pgcrypto
- **Migration Application:** Migration `20261117000033_phase39_3_rate_limit_and_otp_infrastructure.sql` applied cleanly.
- **SQL Audit:**
  ```sql
  SELECT proname, prosecdef, provolatile FROM pg_proc WHERE proname IN ('check_and_increment_rate_limit', 'verify_and_consume_otp');
  ```
  **Output:**
  | proname | prosecdef | provolatile |
  | :--- | :--- | :--- |
  | `check_and_increment_rate_limit` | `t` (SECURITY DEFINER) | `v` (VOLATILE) |
  | `verify_and_consume_otp` | `t` (SECURITY DEFINER) | `v` (VOLATILE) |
- **Status Classification:** **`VERIFIED AGAINST TEST DATABASE`**

---

## 2. Canonical PL/pgSQL Definition: `check_and_increment_rate_limit`

```sql
CREATE OR REPLACE FUNCTION public.check_and_increment_rate_limit(
  p_key TEXT,
  p_max_attempts INTEGER,
  p_window_seconds INTEGER,
  p_block_seconds INTEGER DEFAULT NULL
)
RETURNS TABLE (
  allowed BOOLEAN,
  remaining_seconds INTEGER,
  next_allowed_at TIMESTAMPTZ,
  reason TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_now TIMESTAMPTZ := clock_timestamp();
  v_effective_block_sec INTEGER := COALESCE(p_block_seconds, p_window_seconds);
  v_rec RECORD;
  v_remaining_sec INTEGER;
  v_blocked_until TIMESTAMPTZ;
BEGIN
  -- 1. Lock existing row or insert new record atomically
  SELECT * INTO v_rec
  FROM public.auth_rate_limits
  WHERE key = p_key
  FOR UPDATE;

  IF NOT FOUND THEN
    IF p_max_attempts <= 1 THEN
      v_blocked_until := v_now + (v_effective_block_sec || ' seconds')::INTERVAL;
    ELSE
      v_blocked_until := NULL;
    END IF;

    INSERT INTO public.auth_rate_limits (
      key, count, first_attempt_at, last_attempt_at, blocked_until, created_at, updated_at
    ) VALUES (
      p_key, 1, v_now, v_now, v_blocked_until, v_now, v_now
    );

    RETURN QUERY SELECT TRUE, NULL::INTEGER, NULL::TIMESTAMPTZ, NULL::TEXT;
    RETURN;
  END IF;

  -- 2. Check if currently blocked
  IF v_rec.blocked_until IS NOT NULL AND v_rec.blocked_until > v_now THEN
    v_remaining_sec := GREATEST(1, CEIL(EXTRACT(EPOCH FROM (v_rec.blocked_until - v_now)))::INTEGER);
    RETURN QUERY SELECT 
      FALSE, 
      v_remaining_sec, 
      v_rec.blocked_until, 
      'Too many attempts. Blocked for security. Try again in ' || v_remaining_sec || 's.';
    RETURN;
  END IF;

  -- 3. Window expiry check
  IF (v_now - v_rec.first_attempt_at) > (p_window_seconds || ' seconds')::INTERVAL THEN
    IF p_max_attempts <= 1 THEN
      v_blocked_until := v_now + (v_effective_block_sec || ' seconds')::INTERVAL;
    ELSE
      v_blocked_until := NULL;
    END IF;

    UPDATE public.auth_rate_limits
    SET count = 1,
        first_attempt_at = v_now,
        last_attempt_at = v_now,
        blocked_until = v_blocked_until,
        updated_at = v_now
    WHERE key = p_key;

    RETURN QUERY SELECT TRUE, NULL::INTEGER, NULL::TIMESTAMPTZ, NULL::TEXT;
    RETURN;
  END IF;

  -- 4. Limit exceeded check
  IF v_rec.count >= p_max_attempts THEN
    IF v_rec.blocked_until IS NULL OR v_rec.blocked_until <= v_now THEN
      v_blocked_until := v_now + (v_effective_block_sec || ' seconds')::INTERVAL;
    ELSE
      v_blocked_until := v_rec.blocked_until;
    END IF;

    UPDATE public.auth_rate_limits
    SET last_attempt_at = v_now,
        blocked_until = v_blocked_until,
        updated_at = v_now
    WHERE key = p_key;

    v_remaining_sec := GREATEST(1, CEIL(EXTRACT(EPOCH FROM (v_blocked_until - v_now)))::INTEGER);
    RETURN QUERY SELECT 
      FALSE, 
      v_remaining_sec, 
      v_blocked_until, 
      'Maximum limit of ' || p_max_attempts || ' attempts reached. Try again in ' || v_remaining_sec || 's.';
    RETURN;
  END IF;

  -- 5. Under limit: Increment count atomically
  IF (v_rec.count + 1) >= p_max_attempts THEN
    v_blocked_until := v_now + (v_effective_block_sec || ' seconds')::INTERVAL;
  ELSE
    v_blocked_until := NULL;
  END IF;

  UPDATE public.auth_rate_limits
  SET count = count + 1,
      last_attempt_at = v_now,
      blocked_until = v_blocked_until,
      updated_at = v_now
  WHERE key = p_key;

  RETURN QUERY SELECT TRUE, NULL::INTEGER, NULL::TIMESTAMPTZ, NULL::TEXT;
END;
$$;
```

---

## 3. Grants & Security Privileges

```sql
GRANT EXECUTE ON FUNCTION public.check_and_increment_rate_limit(TEXT, INTEGER, INTEGER, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION public.check_and_increment_rate_limit(TEXT, INTEGER, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_and_increment_rate_limit(TEXT, INTEGER, INTEGER, INTEGER) TO anon;

GRANT EXECUTE ON FUNCTION public.verify_and_consume_otp(TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.verify_and_consume_otp(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.verify_and_consume_otp(TEXT, TEXT) TO anon;
```

---

## 4. Runbook for Hosted Supabase Cloud Application

To deploy this function to the hosted Supabase instance:
1. Log in to [Supabase Dashboard](https://supabase.com/dashboard/project/anwppwjlismjyovbyfmb).
2. Open the **SQL Editor**.
3. Paste the contents of `supabase/migrations/20261117000033_phase39_3_rate_limit_and_otp_infrastructure.sql`.
4. Click **Run**.
5. Verify schema cache reload via:
   ```sql
   NOTIFY pgrst, 'reload schema';
   ```
6. Re-run:
   ```sql
   SELECT proname FROM pg_proc WHERE proname = 'check_and_increment_rate_limit';
   ```
   *Expected output: 1 row returned.*
