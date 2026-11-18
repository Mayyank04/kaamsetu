# KAAMSETU — PHASE 39.7: SUPABASE DATABASE MIGRATIONS

**Document ID:** `KAAMSETU-39-7-SUPABASE-MIGRATIONS`  
**Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**Target Migration:** `supabase/migrations/20261118_direct_registration_no_otp.sql`  
**Status:** `IMPLEMENTED — REMOTE MIGRATION REQUIRED`  
**Permanent Financial Invariant:** `platform_commission_amount = 0.00` on artisan wages  

---

## 1. Migration Overview & Forward-Only DDL

To support direct password registration without OTP while preserving all existing tables and data, migration [supabase/migrations/20261118_direct_registration_no_otp.sql](file:///Users/mayankgautam/Desktop/stitch_kaamsetu_digital_identity_platform/supabase/migrations/20261118_direct_registration_no_otp.sql) was authored.

### DDL Summary:
1. **Add Credential Columns to `public.profiles`:**
   ```sql
   ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
   ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS password_hash TEXT;
   ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS password_salt TEXT;
   ```
2. **Relax Phone Constraints & Update Defaults:**
   ```sql
   ALTER TABLE public.profiles ALTER COLUMN phone DROP NOT NULL;
   ALTER TABLE public.profiles ALTER COLUMN phone_verification_status SET DEFAULT 'not_verified';
   ALTER TABLE public.profiles ALTER COLUMN verification_method SET DEFAULT 'none';
   ALTER TABLE public.profiles ALTER COLUMN phone_verified SET DEFAULT false;
   ```
3. **Case-Insensitive Unique Email Index:**
   ```sql
   CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_email_lower 
   ON public.profiles (LOWER(email)) 
   WHERE email IS NOT NULL;
   ```
4. **Phone Lookup Index:**
   ```sql
   CREATE INDEX IF NOT EXISTS idx_profiles_phone_search 
   ON public.profiles (phone) 
   WHERE phone IS NOT NULL;
   ```
5. **Atomic Stored Procedure (`register_direct_user_account`):**
   - Atomically checks for duplicate email or phone.
   - Inserts profile record with `active` status and `none` verification method.
   - Records audit log in `public.user_consents`.
   - Scaffolds contractor organization if role is `contractor`.
   - Security: `SECURITY DEFINER`, `search_path = public, pg_temp`.
   - Grants: Revoked from `PUBLIC`, `anon`, and `authenticated`; granted exclusively to `service_role`.
6. **Schema Cache Invalidation:**
   ```sql
   NOTIFY pgrst, 'reload schema';
   ```

---

## 2. Operator Execution Procedure in Supabase Dashboard

Because Supabase is behind Cloudflare and TCP port 5432 is restricted, execute the migration script via the Supabase Dashboard SQL Editor:

1. Navigate to: [Supabase SQL Editor](https://supabase.com/dashboard/project/anwppwjlismjyovbyfmb/sql/new)
2. If previous migration `20261117_master_infrastructure_repair.sql` has not been executed, execute it first.
3. Paste the contents of [supabase/migrations/20261118_direct_registration_no_otp.sql](file:///Users/mayankgautam/Desktop/stitch_kaamsetu_digital_identity_platform/supabase/migrations/20261118_direct_registration_no_otp.sql).
4. Click **RUN** (or `Cmd+Enter`).
5. Verify output shows `Success. No rows returned`.

---

## 3. Database Verification Query

In a new SQL Editor tab, run the verification query:

```sql
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name IN ('email', 'password_hash', 'password_salt', 'phone', 'phone_verified', 'phone_verification_status')
ORDER BY column_name;
```

**Expected Result:**
- `email`: `text`, nullable: `YES`
- `password_hash`: `text`, nullable: `YES`
- `password_salt`: `text`, nullable: `YES`
- `phone`: `text`, nullable: `YES`
- `phone_verified`: `boolean`, default: `false`
- `phone_verification_status`: `text`, default: `'not_verified'::text`
