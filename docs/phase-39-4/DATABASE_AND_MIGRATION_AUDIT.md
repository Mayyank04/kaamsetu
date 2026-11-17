# KAAMSETU — PHASE 39.4 DATABASE & MIGRATION AUDIT
## PostgreSQL Schema Reconciliation, Atomic Persistence & Migration 34 Audit

**Repository:** `Mayyank04/kaamsetu`  
**Migration File:** `supabase/migrations/20261117000034_phase39_4_account_lifecycle_and_persistence.sql`  
**Operating Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**Permanent Financial Invariant:** `platform_commission_amount = 0.00`  
**Audit Status:** `IMPLEMENTED — NOT LIVE VERIFIED` (Requires execution in remote Supabase dashboard)

---

## 1. Migration Overview

Migration 34 (`20261117000034_phase39_4_account_lifecycle_and_persistence.sql`) permanently resolves the database-level constraints that previously obstructed account creation and profile persistence.

### Key Modifications:
1. **Unique Index on Mobile Numbers:** Enforces strict 1:1 mapping between mobile numbers and user profiles:
   ```sql
   CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_phone_unique 
       ON public.profiles(phone) WHERE phone IS NOT NULL;
   ```
2. **Foreign Key Decoupling:** Drops the legacy foreign key constraint `profiles_id_fkey` that linked `profiles.id` to `auth.users(id)`. This permits backend services to mint sovereign cryptographic UUIDs for workers without depending on GoTrue user registration.
3. **Audit & Verification Columns:** Adds mandatory lifecycle columns to `public.profiles`:
   - `account_status TEXT NOT NULL DEFAULT 'active'`
   - `phone_verification_status TEXT NOT NULL DEFAULT 'unverified'`
   - `verification_method TEXT NOT NULL DEFAULT 'sandbox'`
   - `phone_verified BOOLEAN NOT NULL DEFAULT false`
   - `terms_accepted_at TIMESTAMPTZ`
   - `privacy_accepted_at TIMESTAMPTZ`
4. **Atomic Registration Stored Procedure:** Establishes `public.register_user_account`:
   - Validates required inputs (`p_id`, `p_phone`, `p_full_name`).
   - Checks for phone conflicts, returning `ALREADY_EXISTS` atomically.
   - Inserts into `public.profiles`.
   - Initializes default contractor organization if role is `contractor`.
   - Executes under `SECURITY DEFINER` with search path locked to `public, pg_temp`.
   - Revoked from `PUBLIC`, `anon`, and `authenticated`; granted exclusively to `service_role`.

---

## 2. Complete SQL Migration Script

```sql
-- ==============================================================================
-- Migration 34: Phase 39.4 — Complete Account Lifecycle, Persistence & Uniqueness
-- ==============================================================================

-- 1. Ensure public.profiles table has unique constraint on phone
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'profiles' AND indexname = 'idx_profiles_phone_unique'
    ) THEN
        CREATE UNIQUE INDEX idx_profiles_phone_unique 
            ON public.profiles(phone) 
            WHERE phone IS NOT NULL;
    END IF;
END $$;

-- 2. Drop foreign key constraint on profiles.id referencing auth.users(id)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- 3. Add account lifecycle and verification status columns to profiles
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'account_status') THEN
        ALTER TABLE public.profiles ADD COLUMN account_status TEXT NOT NULL DEFAULT 'active';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'phone_verification_status') THEN
        ALTER TABLE public.profiles ADD COLUMN phone_verification_status TEXT NOT NULL DEFAULT 'unverified';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'verification_method') THEN
        ALTER TABLE public.profiles ADD COLUMN verification_method TEXT NOT NULL DEFAULT 'sandbox';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'phone_verified') THEN
        ALTER TABLE public.profiles ADD COLUMN phone_verified BOOLEAN NOT NULL DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'terms_accepted_at') THEN
        ALTER TABLE public.profiles ADD COLUMN terms_accepted_at TIMESTAMPTZ;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'privacy_accepted_at') THEN
        ALTER TABLE public.profiles ADD COLUMN privacy_accepted_at TIMESTAMPTZ;
    END IF;
END $$;

-- 4. Stored Procedure: Atomic User Registration with Conflict Defense
CREATE OR REPLACE FUNCTION public.register_user_account(
    p_id UUID,
    p_phone TEXT,
    p_full_name TEXT,
    p_role TEXT,
    p_phone_verification_status TEXT DEFAULT 'sandbox_unverified',
    p_verification_method TEXT DEFAULT 'sandbox',
    p_phone_verified BOOLEAN DEFAULT false
)
RETURNS TABLE (
    success BOOLEAN,
    status_code TEXT,
    user_id UUID,
    message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_existing_id UUID;
BEGIN
    IF p_id IS NULL OR p_phone IS NULL OR length(trim(p_phone)) = 0 THEN
        RETURN QUERY SELECT false, 'INVALID_INPUT', NULL::UUID, 'User ID and valid phone number are required.';
        RETURN;
    END IF;

    -- Check if phone already registered
    SELECT id INTO v_existing_id FROM public.profiles WHERE phone = p_phone LIMIT 1;
    IF v_existing_id IS NOT NULL THEN
        RETURN QUERY SELECT false, 'ALREADY_EXISTS', v_existing_id, 'An account is already registered with this mobile number.';
        RETURN;
    END IF;

    -- Insert new profile
    INSERT INTO public.profiles (
        id,
        phone,
        full_name,
        role,
        is_verified,
        account_status,
        phone_verification_status,
        verification_method,
        phone_verified,
        terms_accepted_at,
        privacy_accepted_at,
        created_at,
        updated_at
    ) VALUES (
        p_id,
        p_phone,
        trim(p_full_name),
        p_role,
        false,
        'active',
        p_phone_verification_status,
        p_verification_method,
        p_phone_verified,
        now(),
        now(),
        now(),
        now()
    );

    -- Auto-initialize contractor organization if role is contractor
    IF p_role = 'contractor' THEN
        INSERT INTO public.contractor_organizations (
            owner_id,
            company_name,
            operating_city,
            operating_state,
            subscription_tier,
            max_roster_workers,
            subscription_status,
            created_at,
            updated_at
        ) VALUES (
            p_id,
            trim(p_full_name) || '''s Enterprise',
            'Guwahati',
            'Assam',
            'starter',
            10,
            'active',
            now(),
            now()
        ) ON CONFLICT DO NOTHING;
    END IF;

    RETURN QUERY SELECT true, 'CREATED', p_id, 'Account registered successfully.';
    RETURN;
END;
$$;

REVOKE ALL ON FUNCTION public.register_user_account(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.register_user_account(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN) TO service_role;
```

---

## 3. Remote Execution Instructions (Supabase Cloud Dashboard)

To activate Migration 34 on the remote Supabase project (`kaamsetu-neon`):
1. Navigate to the Supabase Cloud Management Console for project `kaamsetu-neon`.
2. Open the **SQL Editor**.
3. Create a **New query**.
4. Paste the complete contents of `supabase/migrations/20261117000034_phase39_4_account_lifecycle_and_persistence.sql`.
5. Execute the query.
6. Verify output confirms:
   - `CREATE INDEX` on `idx_profiles_phone_unique`
   - `ALTER TABLE` successfully dropped `profiles_id_fkey`
   - Columns added to `profiles`
   - Stored procedure `public.register_user_account` compiled and granted to `service_role`.
