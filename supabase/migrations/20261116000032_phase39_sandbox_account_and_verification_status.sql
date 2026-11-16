-- ==============================================================================
-- Migration 32: Phase 39 — Sandbox Account Creation, Verification Status & Invariant Model
-- ==============================================================================

-- 1. Extend profiles with explicit verification and account status models
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS account_status TEXT NOT NULL DEFAULT 'active',
    ADD COLUMN IF NOT EXISTS phone_verification_status TEXT NOT NULL DEFAULT 'sandbox_unverified',
    ADD COLUMN IF NOT EXISTS verification_method TEXT NOT NULL DEFAULT 'sandbox',
    ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN NOT NULL DEFAULT false;

-- Add index on phone_verification_status for rapid authorization filtering
CREATE INDEX IF NOT EXISTS idx_profiles_verification_status 
    ON public.profiles (phone_verification_status, account_status);

-- 2. Extend otp_challenges with intent and verification_mode
ALTER TABLE public.otp_challenges
    ADD COLUMN IF NOT EXISTS intent TEXT NOT NULL DEFAULT 'login',
    ADD COLUMN IF NOT EXISTS verification_mode TEXT NOT NULL DEFAULT 'sandbox';

-- 3. Stored Procedure: Updated verify_and_consume_otp preserving 2-argument compatibility
CREATE OR REPLACE FUNCTION public.verify_and_consume_otp(
    p_phone_hash TEXT,
    p_otp_hash TEXT
)
RETURNS TABLE (
    success BOOLEAN,
    status_code TEXT,
    role TEXT,
    full_name TEXT,
    message TEXT,
    intent TEXT,
    verification_mode TEXT
) AS $$
DECLARE
    v_record public.otp_challenges;
BEGIN
    -- Query latest active unconsumed challenge for the hashed phone
    SELECT * INTO v_record
    FROM public.otp_challenges
    WHERE phone_hash = p_phone_hash
      AND consumed_at IS NULL
    ORDER BY created_at DESC
    LIMIT 1
    FOR UPDATE;

    -- Challenge not found or already consumed
    IF v_record.id IS NULL THEN
        RETURN QUERY SELECT false, 'NOT_FOUND', 'worker'::TEXT, NULL::TEXT, 'No active verification code found for this number.'::TEXT, 'login'::TEXT, 'sandbox'::TEXT;
        RETURN;
    END IF;

    -- Check expiry
    IF now() > v_record.expires_at THEN
        RETURN QUERY SELECT false, 'EXPIRED', v_record.role, v_record.full_name, 'Verification code has expired. Please request a new code.'::TEXT, v_record.intent, v_record.verification_mode;
        RETURN;
    END IF;

    -- Check attempt count
    IF v_record.attempts >= v_record.max_attempts THEN
        RETURN QUERY SELECT false, 'MAX_ATTEMPTS_EXCEEDED', v_record.role, v_record.full_name, 'Maximum verification attempts exceeded. Please request a new code.'::TEXT, v_record.intent, v_record.verification_mode;
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
        SET consumed_at = now()
        WHERE id = v_record.id;

        RETURN QUERY SELECT true, 'VERIFIED', v_record.role, v_record.full_name, 'Verification successful.'::TEXT, v_record.intent, v_record.verification_mode;
        RETURN;
    ELSE
        RETURN QUERY SELECT false, 'INVALID_CODE', v_record.role, v_record.full_name, 'Incorrect verification code.'::TEXT, v_record.intent, v_record.verification_mode;
        RETURN;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

REVOKE ALL ON FUNCTION public.verify_and_consume_otp(TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_and_consume_otp(TEXT, TEXT) TO service_role;
