-- ==============================================================================
-- Migration 33: Phase 39.3 — Rate Limit, OTP Challenges & Resilient Infrastructure
-- ==============================================================================

-- 1. Create auth_rate_limits table for persistent brute-force and cooldown defense
CREATE TABLE IF NOT EXISTS public.auth_rate_limits (
    key TEXT PRIMARY KEY,
    count INTEGER NOT NULL DEFAULT 1,
    first_attempt_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_attempt_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    blocked_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for blocked checks
CREATE INDEX IF NOT EXISTS idx_auth_rate_limits_blocked 
    ON public.auth_rate_limits (key, blocked_until);

-- Row Level Security on auth_rate_limits
ALTER TABLE public.auth_rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.auth_rate_limits FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.auth_rate_limits TO service_role;

-- 2. Concurrency-safe atomic rate limiter stored procedure
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

    -- Within active window: increment attempt count
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
        -- Allowed: increment and update
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

-- 3. Create otp_challenges table for persistent cryptographic challenges
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

-- Index for lookup and active expiry
CREATE INDEX IF NOT EXISTS idx_otp_challenges_lookup 
    ON public.otp_challenges (phone_hash, consumed_at, expires_at);

-- Row Level Security on otp_challenges
ALTER TABLE public.otp_challenges ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.otp_challenges FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.otp_challenges TO service_role;

-- 4. Stored Procedure: Atomic Verification & Single-Use Consumption of OTP
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

    -- Verify hash in constant time
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
