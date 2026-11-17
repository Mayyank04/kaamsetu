-- ==============================================================================
-- KAAMSETU MASTER INFRASTRUCTURE REPAIR & VERIFICATION MIGRATION
-- Migration: 20261117_master_infrastructure_repair.sql
-- Description: Establishes all persistent auth rate-limits, OTP challenge storage,
--              profiles, user consents, and atomic RPC stored procedures.
-- Classification: CLASS_B_CONTROLLED_ROLLOUT
-- ==============================================================================

-- Required PostgreSQL Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create app_role enum if it does not already exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM ('worker', 'contractor', 'customer', 'institution', 'admin');
    END IF;
END $$;

-- 2. Persistent Rate Limiting Table (auth_rate_limits)
CREATE TABLE IF NOT EXISTS public.auth_rate_limits (
    key TEXT PRIMARY KEY,
    count INTEGER NOT NULL DEFAULT 1,
    first_attempt_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_attempt_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    blocked_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure all columns exist if table was partially created in earlier migrations
ALTER TABLE public.auth_rate_limits
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_auth_rate_limits_blocked 
    ON public.auth_rate_limits (key, blocked_until);

ALTER TABLE public.auth_rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.auth_rate_limits FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.auth_rate_limits TO service_role;

-- 3. Atomic Rate Limiter Stored Procedure
CREATE OR REPLACE FUNCTION public.check_and_increment_rate_limit(
    p_key TEXT,
    p_max_attempts INT,
    p_window_seconds INT,
    p_block_seconds INT
)
RETURNS TABLE (
    allowed BOOLEAN,
    current_count INT,
    remaining_seconds INT
) 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_record public.auth_rate_limits;
    v_now TIMESTAMPTZ := now();
    v_window_expiry TIMESTAMPTZ;
BEGIN
    -- Strict Parameter Validation
    IF p_key IS NULL OR length(trim(p_key)) = 0 THEN
        RAISE EXCEPTION 'Invalid rate limit key';
    END IF;
    IF p_max_attempts <= 0 THEN
        RAISE EXCEPTION 'p_max_attempts must be greater than 0';
    END IF;
    IF p_window_seconds <= 0 THEN
        RAISE EXCEPTION 'p_window_seconds must be greater than 0';
    END IF;
    IF p_block_seconds <= 0 THEN
        RAISE EXCEPTION 'p_block_seconds must be greater than 0';
    END IF;

    -- Concurrency-safe initialization
    INSERT INTO public.auth_rate_limits (key, count, first_attempt_at, last_attempt_at, blocked_until, updated_at)
    VALUES (p_key, 0, v_now, v_now, NULL, v_now)
    ON CONFLICT (key) DO NOTHING;

    -- Atomic row-level lock for serialization
    SELECT * INTO v_record 
    FROM public.auth_rate_limits 
    WHERE key = p_key 
    FOR UPDATE;

    -- Check if currently blocked
    IF v_record.blocked_until IS NOT NULL AND v_record.blocked_until > v_now THEN
        RETURN QUERY SELECT false, v_record.count, EXTRACT(EPOCH FROM (v_record.blocked_until - v_now))::INT;
        RETURN;
    END IF;

    -- Check if window has expired -> reset window
    v_window_expiry := v_record.first_attempt_at + (p_window_seconds || ' seconds')::INTERVAL;
    IF v_now > v_window_expiry THEN
        IF p_max_attempts <= 1 THEN
            UPDATE public.auth_rate_limits
            SET count = 1,
                first_attempt_at = v_now,
                last_attempt_at = v_now,
                blocked_until = v_now + (p_block_seconds || ' seconds')::INTERVAL,
                updated_at = v_now
            WHERE key = p_key;
            RETURN QUERY SELECT true, 1, 0;
            RETURN;
        ELSE
            UPDATE public.auth_rate_limits
            SET count = 1,
                first_attempt_at = v_now,
                last_attempt_at = v_now,
                blocked_until = NULL,
                updated_at = v_now
            WHERE key = p_key;
            RETURN QUERY SELECT true, 1, 0;
            RETURN;
        END IF;
    END IF;

    -- Within active window: check limit
    IF v_record.count + 1 > p_max_attempts THEN
        -- Exceeded max allowed attempts -> apply block
        UPDATE public.auth_rate_limits
        SET count = v_record.count + 1,
            last_attempt_at = v_now,
            blocked_until = v_now + (p_block_seconds || ' seconds')::INTERVAL,
            updated_at = v_now
        WHERE key = p_key;
        RETURN QUERY SELECT false, v_record.count + 1, p_block_seconds;
        RETURN;
    ELSE
        -- Allowed: increment attempt count
        UPDATE public.auth_rate_limits
        SET count = v_record.count + 1,
            last_attempt_at = v_now,
            updated_at = v_now
        WHERE key = p_key;
        RETURN QUERY SELECT true, v_record.count + 1, 0;
        RETURN;
    END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.check_and_increment_rate_limit(TEXT, INT, INT, INT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_and_increment_rate_limit(TEXT, INT, INT, INT) TO service_role;

-- 3b. Read-only Rate Limit Status Stored Procedure
CREATE OR REPLACE FUNCTION public.get_rate_limit_status(
    p_key TEXT
)
RETURNS TABLE (
    allowed BOOLEAN,
    current_count INT,
    remaining_seconds INT,
    is_blocked BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_record public.auth_rate_limits;
    v_now TIMESTAMPTZ := now();
BEGIN
    IF p_key IS NULL OR length(trim(p_key)) = 0 THEN
        RETURN QUERY SELECT true, 0, 0, false;
        RETURN;
    END IF;

    SELECT * INTO v_record FROM public.auth_rate_limits WHERE key = p_key;

    IF NOT FOUND THEN
        RETURN QUERY SELECT true, 0, 0, false;
        RETURN;
    END IF;

    IF v_record.blocked_until IS NOT NULL AND v_record.blocked_until > v_now THEN
        RETURN QUERY SELECT false, v_record.count, EXTRACT(EPOCH FROM (v_record.blocked_until - v_now))::INT, true;
        RETURN;
    END IF;

    RETURN QUERY SELECT true, v_record.count, 0, false;
END;
$$;

REVOKE ALL ON FUNCTION public.get_rate_limit_status(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_rate_limit_status(TEXT) TO service_role;

-- 4. Persistent OTP Challenges Table (otp_challenges)
CREATE TABLE IF NOT EXISTS public.otp_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_hash TEXT NOT NULL,
    otp_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'worker',
    full_name TEXT,
    intent TEXT NOT NULL DEFAULT 'registration',
    verification_mode TEXT NOT NULL DEFAULT 'sandbox',
    attempts INTEGER NOT NULL DEFAULT 0,
    max_attempts INTEGER NOT NULL DEFAULT 5,
    expires_at TIMESTAMPTZ NOT NULL,
    consumed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_otp_challenges_lookup 
    ON public.otp_challenges (phone_hash, consumed_at, expires_at);

ALTER TABLE public.otp_challenges ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.otp_challenges FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.otp_challenges TO service_role;

-- 5. Stored Procedure: Atomic Verification & Single-Use Consumption of OTP
CREATE OR REPLACE FUNCTION public.verify_and_consume_otp(
    p_phone_hash TEXT,
    p_otp_hash TEXT
)
RETURNS TABLE (
    success BOOLEAN,
    status_code TEXT,
    role TEXT,
    full_name TEXT,
    message TEXT
) 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_record public.otp_challenges;
    v_now TIMESTAMPTZ := now();
BEGIN
    -- Query latest active unconsumed challenge for the hashed phone with row lock
    SELECT * INTO v_record
    FROM public.otp_challenges
    WHERE phone_hash = p_phone_hash
      AND consumed_at IS NULL
    ORDER BY created_at DESC
    LIMIT 1
    FOR UPDATE;

    -- Challenge not found or already consumed
    IF v_record.id IS NULL THEN
        RETURN QUERY SELECT false, 'NOT_FOUND', 'worker'::TEXT, NULL::TEXT, 'No active verification code found for this number.';
        RETURN;
    END IF;

    -- Check expiry
    IF v_now > v_record.expires_at THEN
        RETURN QUERY SELECT false, 'EXPIRED', v_record.role, v_record.full_name, 'Verification code has expired. Please request a new code.';
        RETURN;
    END IF;

    -- Check attempt count
    IF v_record.attempts >= v_record.max_attempts THEN
        RETURN QUERY SELECT false, 'MAX_ATTEMPTS_EXCEEDED', v_record.role, v_record.full_name, 'Maximum verification attempts exceeded. Please request a new code.';
        RETURN;
    END IF;

    -- Increment attempts
    UPDATE public.otp_challenges
    SET attempts = attempts + 1
    WHERE id = v_record.id;

    -- Verify hash
    IF v_record.otp_hash = p_otp_hash THEN
        -- Mark as consumed immediately to prevent replay
        UPDATE public.otp_challenges
        SET consumed_at = v_now
        WHERE id = v_record.id;

        RETURN QUERY SELECT true, 'VERIFIED', v_record.role, v_record.full_name, 'Verification successful.';
        RETURN;
    ELSE
        RETURN QUERY SELECT false, 'INVALID_CODE', v_record.role, v_record.full_name, 'Invalid verification code. Please try again.';
        RETURN;
    END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.verify_and_consume_otp(TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_and_consume_otp(TEXT, TEXT) TO service_role;

-- 6. User Profiles Table (public.profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone TEXT,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'worker',
    avatar_url TEXT,
    bio TEXT,
    primary_trade TEXT,
    years_experience INTEGER DEFAULT 0,
    city TEXT DEFAULT 'Guwahati',
    state TEXT DEFAULT 'Assam',
    pincode TEXT,
    skills TEXT[] DEFAULT '{}',
    equipment_handled TEXT[] DEFAULT '{}',
    daily_rate_min NUMERIC,
    daily_rate_max NUMERIC,
    account_status TEXT NOT NULL DEFAULT 'active',
    phone_verification_status TEXT NOT NULL DEFAULT 'sandbox_unverified',
    verification_method TEXT NOT NULL DEFAULT 'sandbox',
    phone_verified BOOLEAN NOT NULL DEFAULT false,
    terms_accepted_at TIMESTAMPTZ,
    privacy_accepted_at TIMESTAMPTZ,
    terms_version TEXT NOT NULL DEFAULT '2026.1',
    privacy_version TEXT NOT NULL DEFAULT '2026.1',
    consent_purpose TEXT NOT NULL DEFAULT 'workforce_identity_registration',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure all columns exist on public.profiles
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS phone TEXT,
    ADD COLUMN IF NOT EXISTS full_name TEXT NOT NULL DEFAULT 'User',
    ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'worker',
    ADD COLUMN IF NOT EXISTS primary_trade TEXT,
    ADD COLUMN IF NOT EXISTS bio TEXT,
    ADD COLUMN IF NOT EXISTS years_experience INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS city TEXT DEFAULT 'Guwahati',
    ADD COLUMN IF NOT EXISTS state TEXT DEFAULT 'Assam',
    ADD COLUMN IF NOT EXISTS pincode TEXT,
    ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS equipment_handled TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS daily_rate_min NUMERIC,
    ADD COLUMN IF NOT EXISTS daily_rate_max NUMERIC,
    ADD COLUMN IF NOT EXISTS account_status TEXT NOT NULL DEFAULT 'active',
    ADD COLUMN IF NOT EXISTS phone_verification_status TEXT NOT NULL DEFAULT 'sandbox_unverified',
    ADD COLUMN IF NOT EXISTS verification_method TEXT NOT NULL DEFAULT 'sandbox',
    ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS privacy_accepted_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS terms_version TEXT NOT NULL DEFAULT '2026.1',
    ADD COLUMN IF NOT EXISTS privacy_version TEXT NOT NULL DEFAULT '2026.1',
    ADD COLUMN IF NOT EXISTS consent_purpose TEXT NOT NULL DEFAULT 'workforce_identity_registration';

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_phone_unique 
    ON public.profiles (phone) 
    WHERE phone IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles (phone);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles (role);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.profiles TO service_role;

-- 7. User Consent Audit Ledger (user_consents)
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

-- 8. Contractor Organizations Table (contractor_organizations)
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

ALTER TABLE public.contractor_organizations ENABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.contractor_organizations TO service_role;

-- 9. Atomic Account Registration Stored Procedure
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
BEGIN
    -- Query for existing profile with row lock
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
            v_profile.role,
            v_profile.account_status,
            v_profile.phone_verification_status,
            false;
        RETURN;
    ELSE
        -- Insert new profile
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
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            p_phone,
            COALESCE(NULLIF(trim(p_full_name), ''), 'Verified User'),
            COALESCE(NULLIF(trim(p_role), ''), 'worker'),
            'active',
            COALESCE(p_verification_status, 'sandbox_unverified'),
            COALESCE(p_verification_method, 'sandbox'),
            COALESCE(p_phone_verified, false),
            now(),
            now(),
            now(),
            now()
        )
        RETURNING * INTO v_profile;

        RETURN QUERY SELECT 
            v_profile.id,
            v_profile.phone,
            v_profile.full_name,
            v_profile.role,
            v_profile.account_status,
            v_profile.phone_verification_status,
            true;
        RETURN;
    END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.register_user_account(TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.register_user_account(TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN) TO service_role;

-- 10. Worker Profiles Table (worker_profiles) for Sovereign Credential Card
CREATE TABLE IF NOT EXISTS public.worker_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    registry_id TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    primary_trade TEXT NOT NULL,
    sub_trades TEXT[] DEFAULT '{}',
    years_experience INTEGER DEFAULT 0,
    city TEXT NOT NULL DEFAULT 'Guwahati',
    state TEXT NOT NULL DEFAULT 'Assam',
    pincode TEXT,
    kaam_score INTEGER DEFAULT 300,
    kaam_tier TEXT DEFAULT 'Emerging Artisan',
    verification_status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.worker_profiles ENABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.worker_profiles TO service_role;

-- 11. Instruct PostgREST to reload schema cache immediately
NOTIFY pgrst, 'reload schema';
