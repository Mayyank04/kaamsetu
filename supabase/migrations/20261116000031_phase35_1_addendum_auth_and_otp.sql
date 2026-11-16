-- ==============================================================================
-- Migration 31: Phase 35.1 Addendum — OTP Challenges, Multi-Tenant Dispatch & Session Security
-- ==============================================================================

-- 1. Persistent OTP Challenges Table for Durable Multi-Instance Authentication
CREATE TABLE IF NOT EXISTS public.otp_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_hash TEXT NOT NULL,
    otp_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'worker',
    full_name TEXT,
    attempts INTEGER NOT NULL DEFAULT 0,
    max_attempts INTEGER NOT NULL DEFAULT 5,
    expires_at TIMESTAMPTZ NOT NULL,
    consumed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for lookup and active expiry
CREATE INDEX IF NOT EXISTS idx_otp_challenges_lookup 
    ON public.otp_challenges (phone_hash, consumed_at, expires_at);

-- Row Level Security on otp_challenges
ALTER TABLE public.otp_challenges ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.otp_challenges FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.otp_challenges TO service_role;

-- 2. Stored Procedure: Atomic Verification & Single-Use Consumption of OTP
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
        RETURN QUERY SELECT false, 'NOT_FOUND', 'worker'::TEXT, NULL::TEXT, 'No active verification code found for this number.';
        RETURN;
    END IF;

    -- Check expiry
    IF now() > v_record.expires_at THEN
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
        SET consumed_at = now()
        WHERE id = v_record.id;

        RETURN QUERY SELECT true, 'VERIFIED', v_record.role, v_record.full_name, 'Verification successful.';
        RETURN;
    ELSE
        RETURN QUERY SELECT false, 'INVALID_CODE', v_record.role, v_record.full_name, 'Incorrect verification code.';
        RETURN;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

REVOKE ALL ON FUNCTION public.verify_and_consume_otp(TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_and_consume_otp(TEXT, TEXT) TO service_role;

-- 3. Add Dispatch Eligibility & Regional Status columns to worker_profiles
ALTER TABLE public.worker_profiles 
    ADD COLUMN IF NOT EXISTS is_dispatch_eligible BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN IF NOT EXISTS dispatch_status TEXT NOT NULL DEFAULT 'active';

-- 4. Booking Policy: Block bookings for workers who are NOT dispatch eligible
CREATE OR REPLACE FUNCTION public.check_worker_booking_eligibility()
RETURNS TRIGGER AS $$
DECLARE
    v_eligible BOOLEAN;
BEGIN
    SELECT is_dispatch_eligible INTO v_eligible
    FROM public.worker_profiles
    WHERE id = NEW.worker_id;

    IF v_eligible IS FALSE THEN
        RAISE EXCEPTION 'BOOKING_DISPATCH_BLOCKED: Worker is registered as non-dispatch outside active Class B operating zones.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_worker_booking_eligibility ON public.service_bookings;
CREATE TRIGGER trg_check_worker_booking_eligibility
    BEFORE INSERT ON public.service_bookings
    FOR EACH ROW
    EXECUTE FUNCTION public.check_worker_booking_eligibility();
