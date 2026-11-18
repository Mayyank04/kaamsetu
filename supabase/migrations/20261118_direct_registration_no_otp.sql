-- ============================================================================
-- KAAMSETU — PHASE 39.7: DIRECT REGISTRATION & OTP REMOVAL MIGRATION
-- Migration: 20261118_direct_registration_no_otp.sql
-- Classification: CLASS_B_CONTROLLED_ROLLOUT (Guwahati Urban & Shillong Urban)
-- Purpose: Adds email, password_hash, password_salt to public.profiles
--          Enables direct password authentication without mandatory phone OTP.
-- Permanent Invariant: platform_commission_amount = 0.00
-- ============================================================================

-- 1. Ensure required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Add email and password credential columns to public.profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS password_salt TEXT;

-- 3. Adjust default constraints for phone and verification status
-- Mobile number is now optional or an unverified contact detail
ALTER TABLE public.profiles ALTER COLUMN phone DROP NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN phone_verification_status SET DEFAULT 'not_verified';
ALTER TABLE public.profiles ALTER COLUMN verification_method SET DEFAULT 'none';
ALTER TABLE public.profiles ALTER COLUMN phone_verified SET DEFAULT false;

-- 4. Case-insensitive unique index on email
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_email_lower 
ON public.profiles (LOWER(email)) 
WHERE email IS NOT NULL;

-- 5. Index on phone for fast lookup when provided
CREATE INDEX IF NOT EXISTS idx_profiles_phone_search 
ON public.profiles (phone) 
WHERE phone IS NOT NULL;

-- 6. RPC: Direct Account Registration (Atomic and Secure)
CREATE OR REPLACE FUNCTION public.register_direct_user_account(
    p_user_id UUID,
    p_full_name TEXT,
    p_email TEXT,
    p_password_hash TEXT,
    p_password_salt TEXT,
    p_role TEXT,
    p_phone TEXT DEFAULT NULL,
    p_terms_version TEXT DEFAULT '2026.1',
    p_privacy_version TEXT DEFAULT '2026.1'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_existing_id UUID;
    v_clean_email TEXT;
    v_clean_phone TEXT;
    v_profile_record RECORD;
BEGIN
    v_clean_email := LOWER(TRIM(p_email));
    v_clean_phone := NULLIF(TRIM(COALESCE(p_phone, '')), '');

    -- Check if email already registered
    SELECT id INTO v_existing_id FROM public.profiles WHERE LOWER(email) = v_clean_email LIMIT 1;
    IF v_existing_id IS NOT NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'code', 'ACCOUNT_ALREADY_EXISTS',
            'message', 'An account with this email address already exists. Please log in instead.'
        );
    END IF;

    -- Check if phone already registered (if provided)
    IF v_clean_phone IS NOT NULL THEN
        SELECT id INTO v_existing_id FROM public.profiles WHERE phone = v_clean_phone LIMIT 1;
        IF v_existing_id IS NOT NULL THEN
            RETURN jsonb_build_object(
                'success', false,
                'code', 'PHONE_ALREADY_REGISTERED',
                'message', 'An account with this mobile number already exists. Please log in instead.'
            );
        END IF;
    END IF;

    -- Insert into public.profiles
    INSERT INTO public.profiles (
        id,
        email,
        password_hash,
        password_salt,
        full_name,
        phone,
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
    ) VALUES (
        p_user_id,
        v_clean_email,
        p_password_hash,
        p_password_salt,
        TRIM(p_full_name),
        v_clean_phone,
        COALESCE(p_role, 'worker'),
        'active',
        'not_verified',
        'none',
        false,
        NOW(),
        NOW(),
        p_terms_version,
        p_privacy_version,
        'workforce_identity_direct_registration',
        NOW(),
        NOW()
    )
    RETURNING * INTO v_profile_record;

    -- Insert immutable consent record
    INSERT INTO public.user_consents (
        user_id,
        consent_type,
        consent_version,
        consent_purpose,
        granted,
        granted_at,
        context_metadata
    ) VALUES 
    (p_user_id, 'terms_of_service', p_terms_version, 'workforce_identity_direct_registration', true, NOW(), '{"method":"direct_web_registration"}'::jsonb),
    (p_user_id, 'privacy_policy', p_privacy_version, 'workforce_identity_direct_registration', true, NOW(), '{"method":"direct_web_registration"}'::jsonb);

    -- Role-specific record scaffolding
    IF p_role = 'contractor' THEN
        INSERT INTO public.contractor_organizations (
            id,
            owner_id,
            company_name,
            verification_status,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            p_user_id,
            TRIM(p_full_name) || ' Enterprises',
            'pending',
            NOW(),
            NOW()
        )
        ON CONFLICT (owner_id) DO NOTHING;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'user_id', p_user_id,
        'email', v_clean_email,
        'full_name', v_profile_record.full_name,
        'role', v_profile_record.role,
        'phone', v_profile_record.phone,
        'phone_verified', false,
        'phone_verification_status', 'not_verified',
        'verification_method', 'none'
    );
END;
$$;

-- 7. Secure Privileges
REVOKE ALL ON FUNCTION public.register_direct_user_account FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.register_direct_user_account TO service_role;

-- 8. Invalidate schema cache
NOTIFY pgrst, 'reload schema';
