-- Phase 51: Align PostgreSQL check_and_increment_rate_limit with fail-closed lockout semantics
-- When an attempt reaches p_max_attempts (count + 1 = p_max_attempts), set blocked_until immediately
-- so get_rate_limit_status() reports is_blocked = true after N failed attempts without waiting for N+1.

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
    v_next_count INT;
    v_block_until TIMESTAMPTZ;
BEGIN
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

    INSERT INTO public.auth_rate_limits (key, count, first_attempt_at, last_attempt_at, blocked_until, updated_at)
    VALUES (p_key, 0, v_now, v_now, NULL, v_now)
    ON CONFLICT (key) DO NOTHING;

    SELECT * INTO v_record
    FROM public.auth_rate_limits
    WHERE key = p_key
    FOR UPDATE;

    IF v_record.blocked_until IS NOT NULL AND v_record.blocked_until > v_now THEN
        RETURN QUERY SELECT false, v_record.count, EXTRACT(EPOCH FROM (v_record.blocked_until - v_now))::INT;
        RETURN;
    END IF;

    v_window_expiry := v_record.first_attempt_at + (p_window_seconds || ' seconds')::INTERVAL;
    IF v_now > v_window_expiry THEN
        v_block_until := CASE
            WHEN p_max_attempts <= 1 THEN v_now + (p_block_seconds || ' seconds')::INTERVAL
            ELSE NULL
        END;
        UPDATE public.auth_rate_limits
        SET count = 1,
            first_attempt_at = v_now,
            last_attempt_at = v_now,
            blocked_until = v_block_until,
            updated_at = v_now
        WHERE key = p_key;
        RETURN QUERY SELECT true, 1, 0;
        RETURN;
    END IF;

    v_next_count := v_record.count + 1;
    IF v_next_count > p_max_attempts THEN
        UPDATE public.auth_rate_limits
        SET count = v_next_count,
            last_attempt_at = v_now,
            blocked_until = v_now + (p_block_seconds || ' seconds')::INTERVAL,
            updated_at = v_now
        WHERE key = p_key;
        RETURN QUERY SELECT false, v_next_count, p_block_seconds;
        RETURN;
    END IF;

    -- Allowed attempt: if this reaches p_max_attempts, engage blocked_until immediately for subsequent status checks
    v_block_until := CASE
        WHEN v_next_count >= p_max_attempts THEN v_now + (p_block_seconds || ' seconds')::INTERVAL
        ELSE NULL
    END;

    UPDATE public.auth_rate_limits
    SET count = v_next_count,
        last_attempt_at = v_now,
        blocked_until = v_block_until,
        updated_at = v_now
    WHERE key = p_key;

    RETURN QUERY SELECT true, v_next_count, 0;
    RETURN;
END;
$$;

REVOKE ALL ON FUNCTION public.check_and_increment_rate_limit(TEXT, INT, INT, INT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_and_increment_rate_limit(TEXT, INT, INT, INT) TO service_role;
