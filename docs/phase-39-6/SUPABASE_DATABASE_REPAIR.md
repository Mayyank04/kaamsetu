# KAAMSETU — PHASE 39.6 SUPABASE DATABASE REPAIR

**Document ID:** `KAAMSETU-39-6-DB-REPAIR`  
**Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**Target Migration:** `supabase/migrations/20261117_master_infrastructure_repair.sql`  
**Status:** `IMPLEMENTED — REMOTE MIGRATION REQUIRED`

---

## 1. Remote Database Forensic Findings

Inspection of the remote Supabase project `anwppwjlismjyovbyfmb` via SQL query:
```sql
SELECT
  to_regclass('public.auth_rate_limits') AS rate_limit_table,
  to_regclass('public.otp_challenges') AS otp_table,
  to_regprocedure('public.check_and_increment_rate_limit(text,integer,integer,integer)') AS rate_limit_function,
  to_regprocedure('public.verify_and_consume_otp(text,text)') AS verify_otp_function;
```
returned `NULL` across all four checks.

Direct PostgREST diagnostics via `scripts/verify-supabase-infrastructure.ts` verified that:
- Tables `auth_rate_limits`, `otp_challenges`, `profiles`, `user_consents`, `contractor_organizations`, `worker_profiles` do not exist (`PGRST205`).
- Stored procedures `check_and_increment_rate_limit`, `verify_and_consume_otp`, `register_user_account`, `get_rate_limit_status` are absent from the schema cache (`PGRST202`).

---

## 2. Corrective Master Migration Architecture

To repair the remote database idempotently without dropping any future data, [supabase/migrations/20261117_master_infrastructure_repair.sql](file:///Users/mayankgautam/Desktop/stitch_kaamsetu_digital_identity_platform/supabase/migrations/20261117_master_infrastructure_repair.sql) was constructed:

1. **Extension Guards:**
   ```sql
   CREATE EXTENSION IF NOT EXISTS "pgcrypto";
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   ```
2. **Persistent Tables with Explicit RLS:**
   - `public.auth_rate_limits`: Stores IP and phone rate limits with atomic block windows.
   - `public.otp_challenges`: Stores hashed OTP challenges with expiration and attempt bounding.
   - `public.profiles`: Core workforce sovereign identity record.
   - `public.user_consents`: Immutable audit ledger for Terms of Service and Privacy Policy consent.
   - `public.contractor_organizations`: Contractor organization registry.
   - `public.worker_profiles`: Public vocational registry records.
3. **Privileged RPC Stored Procedures (`SECURITY DEFINER`):**
   - `public.check_and_increment_rate_limit(p_key text, p_max_attempts int, p_window_seconds int, p_block_seconds int)`
   - `public.get_rate_limit_status(p_key text)`
   - `public.verify_and_consume_otp(p_phone_hash text, p_otp_hash text)`
   - `public.register_user_account(p_phone text, p_full_name text, p_role text, p_verification_status text, p_verification_method text, p_phone_verified boolean)`
4. **Least Privilege Execution:**
   - All RPCs revoke `EXECUTE` from `PUBLIC`, `anon`, and `authenticated`.
   - Execution granted exclusively to `service_role`.
   - Explicit `SET search_path = public, pg_temp` to prevent hijacking.
5. **Schema Cache Invalidation:**
   - Emits `NOTIFY pgrst, 'reload schema'` to ensure PostgREST exposes new RPCs immediately without restart.
