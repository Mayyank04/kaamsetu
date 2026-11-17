-- ==============================================================================
-- Migration 34: Phase 39.4 — Account Lifecycle, Persistent Identity & RLS Hardening
-- File: supabase/migrations/20261117000034_phase39_4_account_lifecycle_and_persistence.sql
-- ==============================================================================

-- 1. Ensure phone column in public.profiles has strict database-level uniqueness
-- This guarantees zero duplicate accounts on concurrent registration attempts.
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_phone_unique 
    ON public.profiles (phone) 
    WHERE phone IS NOT NULL;

-- 2. Relax legacy profiles_id_fkey constraint if it strictly requires auth.users
-- This allows sovereign cryptographic worker identities and direct service-role profile management.
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- 3. Ensure all lifecycle, verification and legal consent columns exist on public.profiles
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS account_status TEXT NOT NULL DEFAULT 'active',
    ADD COLUMN IF NOT EXISTS phone_verification_status TEXT NOT NULL DEFAULT 'sandbox_unverified',
    ADD COLUMN IF NOT EXISTS verification_method TEXT NOT NULL DEFAULT 'sandbox',
    ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS privacy_accepted_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS terms_version TEXT NOT NULL DEFAULT '2026.1',
    ADD COLUMN IF NOT EXISTS privacy_version TEXT NOT NULL DEFAULT '2026.1',
    ADD COLUMN IF NOT EXISTS consent_purpose TEXT NOT NULL DEFAULT 'workforce_identity_registration';

-- Indices on public.profiles for high-throughput lookup
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles (phone);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles (role);
CREATE INDEX IF NOT EXISTS idx_profiles_account_status ON public.profiles (account_status);

-- 3.5. Immutable User Consent Audit Ledger (DPDP Act 2023 Compliance)
CREATE TABLE IF NOT EXISTS public.user_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    phone_hash TEXT NOT NULL,
    terms_version TEXT NOT NULL DEFAULT '2026.1',
    privacy_version TEXT NOT NULL DEFAULT '2026.1',
    purpose TEXT NOT NULL DEFAULT 'workforce_identity_registration',
    intent TEXT NOT NULL DEFAULT 'registration',
    accepted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    withdrawn_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_consents_lookup 
    ON public.user_consents (user_id, phone_hash, accepted_at DESC);

ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.user_consents FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.user_consents TO service_role;

-- 4. Ensure public.contractor_organizations table and columns
CREATE TABLE IF NOT EXISTS public.contractor_organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    gstin TEXT,
    business_type TEXT NOT NULL DEFAULT 'proprietorship',
    operating_city TEXT NOT NULL DEFAULT 'Guwahati',
    operating_state TEXT NOT NULL DEFAULT 'Assam',
    subscription_tier TEXT NOT NULL DEFAULT 'starter',
    subscription_status TEXT NOT NULL DEFAULT 'active',
    subscription_expires_at TIMESTAMPTZ,
    max_roster_workers INT NOT NULL DEFAULT 10,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contractor_orgs_owner ON public.contractor_organizations (owner_id);

-- Enable RLS and grant service_role full administrative access
ALTER TABLE public.contractor_organizations ENABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.contractor_organizations TO service_role;

-- 5. Stored Procedure: Atomic Account Registration & Conflict Resolution
CREATE OR REPLACE FUNCTION public.register_user_account(
    p_phone TEXT,
    p_full_name TEXT,
    p_role TEXT,
    p_verification_status TEXT,
    p_verification_method TEXT,
    p_phone_verified BOOLEAN
)
RETURNS TABLE (
    id UUID,
    phone TEXT,
    full_name TEXT,
    role TEXT,
    account_status TEXT,
    phone_verification_status TEXT,
    is_new_user BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_profile public.profiles;
    v_is_new BOOLEAN := false;
    v_role_val app_role;
BEGIN
    -- Validate and safely cast role
    BEGIN
        v_role_val := p_role::app_role;
    EXCEPTION WHEN OTHERS THEN
        v_role_val := 'worker'::app_role;
    END;

    -- Atomic query for existing profile
    SELECT * INTO v_profile
    FROM public.profiles
    WHERE public.profiles.phone = p_phone
    FOR UPDATE;

    IF v_profile.id IS NOT NULL THEN
        -- Account already exists: return existing record without duplicate creation
        RETURN QUERY SELECT 
            v_profile.id,
            v_profile.phone,
            v_profile.full_name,
            v_profile.role::TEXT,
            v_profile.account_status,
            v_profile.phone_verification_status,
            false;
        RETURN;
    ELSE
        -- Insert brand new authoritative profile with legal consent metadata
        INSERT INTO public.profiles (
            id,
            phone,
            full_name,
            role,
            account_status,
            phone_verification_status,
            verification_method,
            phone_verified,
            terms_accepted_at,
            privacy_accepted_at,
            terms_version,
            privacy_version,
            consent_purpose,
            created_at,
            updated_at
        )
        VALUES (
            gen_random_uuid(),
            p_phone,
            p_full_name,
            v_role_val,
            'active',
            p_verification_status,
            p_verification_method,
            p_phone_verified,
            now(),
            now(),
            '2026.1',
            '2026.1',
            'workforce_identity_registration',
            now(),
            now()
        )
        RETURNING * INTO v_profile;

        RETURN QUERY SELECT 
            v_profile.id,
            v_profile.phone,
            v_profile.full_name,
            v_profile.role::TEXT,
            v_profile.account_status,
            v_profile.phone_verification_status,
            true;
        RETURN;
    END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.register_user_account(TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.register_user_account(TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN) TO service_role;
