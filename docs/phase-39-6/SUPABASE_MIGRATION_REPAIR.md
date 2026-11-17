# KAAMSETU — PHASE 39.6 SUPABASE MIGRATION REPAIR

**Document ID:** `KAAMSETU-39-6-MIGRATION-REPAIR`  
**Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**Target Migration:** `supabase/migrations/20261117_master_infrastructure_repair.sql`  
**Status:** `IMPLEMENTED_NOT_DEPLOYED` / `BLOCKED_BY_OPERATOR_ACTION`

---

## 1. Migration Analysis & Chronology

Historical analysis revealed earlier migrations:
- `20261114000006_persistent_rate_limiter_and_security_hardening.sql`
- `20261117000033_phase39_3_master_infrastructure_repair.sql`
- `20261117000034_phase39_4_account_lifecycle_and_persistence.sql`

While these existed in the local repository, they were never applied sequentially to the active remote Supabase project (`anwppwjlismjyovbyfmb.supabase.co`).

To prevent partial dependency errors or sequencing deadlocks, a single, forward-only, idempotent master migration was engineered:
`supabase/migrations/20261117_master_infrastructure_repair.sql`.

---

## 2. Objects Created & Definitions

### A. Tables
1. **`public.auth_rate_limits`**:
   - Columns: `key TEXT PRIMARY KEY`, `count INTEGER NOT NULL`, `first_attempt_at TIMESTAMPTZ`, `last_attempt_at TIMESTAMPTZ`, `blocked_until TIMESTAMPTZ`, `created_at TIMESTAMPTZ`, `updated_at TIMESTAMPTZ`.
   - Index: `idx_auth_rate_limits_blocked ON public.auth_rate_limits (key, blocked_until)`.
   - RLS: Enabled. Revoked from PUBLIC, anon, authenticated. Granted exclusively to `service_role`.
2. **`public.otp_challenges`**:
   - Columns: `id UUID PRIMARY KEY`, `phone_hash TEXT NOT NULL`, `otp_hash TEXT NOT NULL`, `role TEXT NOT NULL`, `full_name TEXT`, `intent TEXT NOT NULL`, `verification_mode TEXT NOT NULL`, `attempts INTEGER NOT NULL`, `max_attempts INTEGER NOT NULL`, `expires_at TIMESTAMPTZ NOT NULL`, `consumed_at TIMESTAMPTZ`, `created_at TIMESTAMPTZ`.
   - Index: `idx_otp_challenges_lookup ON public.otp_challenges (phone_hash, consumed_at, expires_at)`.
   - RLS: Enabled. Revoked from PUBLIC, anon, authenticated. Granted exclusively to `service_role`.
3. **`public.profiles`**: Core workforce sovereign identity record.
4. **`public.user_consents`**: Immutable audit ledger for Terms of Service and Privacy Policy consent.
5. **`public.contractor_organizations`**: Contractor multi-tenant business profiles.
6. **`public.worker_profiles`**: Public vocational registry records.

### B. Stored Procedures
1. **`public.check_and_increment_rate_limit(p_key TEXT, p_max_attempts INT, p_window_seconds INT, p_block_seconds INT)`**:
   - Atomic check and increment with `FOR UPDATE` row lock.
   - Resets window when expired, applies block duration upon violation.
   - Security: `SECURITY DEFINER`, `search_path = public, pg_temp`. Revoked from anon/authenticated, granted to `service_role`.
2. **`public.get_rate_limit_status(p_key TEXT)`**:
   - Read-only status inspection without incrementing counter.
   - Security: `SECURITY DEFINER`, `search_path = public, pg_temp`. Revoked from anon/authenticated, granted to `service_role`.
3. **`public.verify_and_consume_otp(p_phone_hash TEXT, p_otp_hash TEXT)`**:
   - Single-use atomic consumption with `FOR UPDATE` lock.
   - Prevents replay attacks by stamping `consumed_at = now()`.
   - Security: `SECURITY DEFINER`, `search_path = public, pg_temp`. Revoked from anon/authenticated, granted to `service_role`.
4. **`public.register_user_account(...)`**:
   - Atomic account creation ensuring idempotent registration without race conditions.

---

## 3. Required Production Verification SQL

Execute the following query in the Supabase SQL Editor:
```sql
SELECT
  to_regclass('public.auth_rate_limits') AS rate_limit_table,
  to_regclass('public.otp_challenges') AS otp_table,
  to_regprocedure(
    'public.check_and_increment_rate_limit(text,integer,integer,integer)'
  ) AS rate_limit_function,
  to_regprocedure(
    'public.verify_and_consume_otp(text,text)'
  ) AS verify_otp_function;
```

**Expected Result (Post-Migration):**
- `rate_limit_table`: `auth_rate_limits`
- `otp_table`: `otp_challenges`
- `rate_limit_function`: `check_and_increment_rate_limit(text,integer,integer,integer)`
- `verify_otp_function`: `verify_and_consume_otp(text,text)`
