-- ==============================================================================
-- KAAMSETU SOVEREIGN DIGITAL IDENTITY PLATFORM
-- Migration 06: Persistent Rate Limiting, SECURITY DEFINER Hardening,
-- Concurrency-Safe Stored Procedures & Credential Registry Key Rotation
-- Target: PostgreSQL 15+ / Supabase
-- ==============================================================================

-- 1. HARDEN RATE LIMITING TABLE & CONSTRAINTS
CREATE TABLE IF NOT EXISTS public.auth_rate_limits (
  key TEXT PRIMARY KEY,
  count INT NOT NULL DEFAULT 1 CHECK (count >= 0),
  first_attempt_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_attempt_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  blocked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_auth_rate_limits_blocked_until 
  ON public.auth_rate_limits (blocked_until) 
  WHERE blocked_until IS NOT NULL;

ALTER TABLE public.auth_rate_limits ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

ALTER TABLE public.auth_rate_limits ENABLE ROW LEVEL SECURITY;

-- Deny all direct table access to public, anon, and authenticated users.
-- Table access is granted strictly through privileged SECURITY DEFINER RPCs called by service_role.
REVOKE ALL ON TABLE public.auth_rate_limits FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.auth_rate_limits TO service_role;


-- 2. CONCURRENCY-SAFE RATE LIMIT INCREMENT FUNCTION
-- Uses atomic upsert to eliminate race conditions on first request
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

  -- Concurrency-safe initialization: Ensure row exists without race conditions
  INSERT INTO public.auth_rate_limits (key, count, first_attempt_at, last_attempt_at, blocked_until)
  VALUES (p_key, 0, v_now, v_now, NULL)
  ON CONFLICT (key) DO NOTHING;

  -- Atomic row-level lock for serialization
  SELECT * INTO v_record FROM public.auth_rate_limits WHERE key = p_key FOR UPDATE;

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

  -- Within active window: Check count against maximum allowed
  IF v_record.count >= p_max_attempts THEN
    UPDATE public.auth_rate_limits
    SET blocked_until = v_now + (p_block_seconds || ' seconds')::INTERVAL,
        last_attempt_at = v_now,
        updated_at = v_now
    WHERE key = p_key;
    RETURN QUERY SELECT false, v_record.count, p_block_seconds;
    RETURN;
  ELSIF (v_record.count + 1) >= p_max_attempts THEN
    -- Final allowed attempt reached: record attempt and engage block duration immediately
    UPDATE public.auth_rate_limits
    SET count = count + 1,
        blocked_until = v_now + (p_block_seconds || ' seconds')::INTERVAL,
        last_attempt_at = v_now,
        updated_at = v_now
    WHERE key = p_key;
    RETURN QUERY SELECT true, v_record.count + 1, 0;
    RETURN;
  ELSE
    UPDATE public.auth_rate_limits
    SET count = count + 1,
        last_attempt_at = v_now,
        updated_at = v_now
    WHERE key = p_key;
    RETURN QUERY SELECT true, v_record.count + 1, 0;
    RETURN;
  END IF;
END;
$$;


-- 3. RATE LIMIT STATUS CHECK (NON-INCREMENTING READ)
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


-- 4. RATE LIMIT CLEANUP FUNCTION
CREATE OR REPLACE FUNCTION public.clear_rate_limit(
  p_key TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF p_key IS NULL OR length(trim(p_key)) = 0 THEN
    RETURN false;
  END IF;

  DELETE FROM public.auth_rate_limits WHERE key = p_key;
  RETURN true;
END;
$$;


-- 5. EXPLICIT PERMISSION RESTRICTION ON RATE LIMIT FUNCTIONS
-- Revoke execution from PUBLIC, anon, and authenticated to prevent unauthorized manipulation
REVOKE ALL ON FUNCTION public.check_and_increment_rate_limit(TEXT, INT, INT, INT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_rate_limit_status(TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.clear_rate_limit(TEXT) FROM PUBLIC, anon, authenticated;

-- Grant execution strictly to service_role (used by server-side API handlers)
GRANT EXECUTE ON FUNCTION public.check_and_increment_rate_limit(TEXT, INT, INT, INT) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_rate_limit_status(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.clear_rate_limit(TEXT) TO service_role;


-- 6. HARDEN EXISTING SECURITY DEFINER TRIGGER FUNCTIONS WITH FIXED search_path
-- A. Prevent Profile Privilege Escalation
CREATE OR REPLACE FUNCTION public.prevent_profile_privilege_escalation()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF (NEW.role <> OLD.role OR NEW.is_verified <> OLD.is_verified) THEN
    IF current_setting('role', true) <> 'service_role' AND NOT EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    ) THEN
      NEW.role := OLD.role;
      NEW.is_verified := OLD.is_verified;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- B. Enforce Work Record Integrity
CREATE OR REPLACE FUNCTION public.enforce_work_record_integrity()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF (NEW.verified_by_contractor = true OR NEW.verification_hash IS NOT NULL) THEN
    IF current_setting('role', true) <> 'service_role' THEN
      IF NEW.booking_id IS NOT NULL THEN
        IF NOT EXISTS (
          SELECT 1 FROM public.bookings b
          WHERE b.id = NEW.booking_id
          AND b.customer_id = auth.uid()
          AND b.status = 'completed'
        ) AND NOT EXISTS (
          SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
        ) THEN
          NEW.verified_by_contractor := false;
          NEW.verification_hash := NULL;
        END IF;
      ELSE
        IF NOT EXISTS (
          SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
        ) THEN
          NEW.verified_by_contractor := false;
          NEW.verification_hash := NULL;
        END IF;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- C. Validate Booking Status Transition
CREATE OR REPLACE FUNCTION public.validate_booking_status_transition()
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.customer_id <> OLD.customer_id OR NEW.worker_profile_id <> OLD.worker_profile_id THEN
    RAISE EXCEPTION 'Cannot reassign booking participants';
  END IF;

  IF OLD.status = 'completed' AND NEW.status <> 'completed' THEN
    RAISE EXCEPTION 'Completed bookings cannot be modified or reopened';
  END IF;

  IF OLD.status = 'cancelled' AND NEW.status <> 'cancelled' THEN
    RAISE EXCEPTION 'Cancelled bookings cannot be reopened';
  END IF;

  IF NEW.status <> OLD.status THEN
    IF NEW.status = 'confirmed' THEN
      IF OLD.status <> 'requested' THEN
        RAISE EXCEPTION 'Invalid status transition: booking must be requested before confirmed';
      END IF;
      IF current_setting('role', true) <> 'service_role' AND NOT EXISTS (
        SELECT 1 FROM public.worker_profiles WHERE id = OLD.worker_profile_id AND user_id = auth.uid()
      ) AND NOT EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
      ) THEN
        RAISE EXCEPTION 'Only the assigned worker can accept this booking request';
      END IF;
    END IF;

    IF NEW.status = 'in_progress' THEN
      IF OLD.status <> 'confirmed' THEN
        RAISE EXCEPTION 'Invalid status transition: booking must be confirmed before in_progress';
      END IF;
      IF current_setting('role', true) <> 'service_role' AND NOT EXISTS (
        SELECT 1 FROM public.worker_profiles WHERE id = OLD.worker_profile_id AND user_id = auth.uid()
      ) AND NOT EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
      ) THEN
        RAISE EXCEPTION 'Only the assigned worker can mark work in progress';
      END IF;
    END IF;

    IF NEW.status = 'completed' AND OLD.status <> 'in_progress' THEN
      RAISE EXCEPTION 'Invalid status transition: booking must be in_progress before completion';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- D. Handle New Auth User Creation
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  user_role_val public.app_role;
  user_name_val text;
BEGIN
  -- Strict sanitization: User metadata can NEVER assign the 'admin' role
  BEGIN
    user_role_val := COALESCE(
      CASE 
        WHEN (NEW.raw_user_meta_data->>'role') = 'admin' THEN 'customer'::public.app_role
        WHEN (NEW.raw_user_meta_data->>'role') IN ('worker', 'contractor', 'verifier', 'customer') 
          THEN (NEW.raw_user_meta_data->>'role')::public.app_role
        ELSE 'customer'::public.app_role
      END,
      'customer'::public.app_role
    );
  EXCEPTION WHEN OTHERS THEN
    user_role_val := 'customer'::public.app_role;
  END;

  user_name_val := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    'User ' || substring(NEW.id::text, 1, 8)
  );

  INSERT INTO public.profiles (id, role, full_name, phone, avatar_url)
  VALUES (
    NEW.id,
    user_role_val,
    user_name_val,
    NEW.phone,
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;


-- 7. CREDENTIAL REGISTRY KEY ROTATION ENHANCEMENT
-- Add key_version column to public.credential_registry to support cryptographic key rotation
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'credential_registry' 
    AND column_name = 'key_version'
  ) THEN
    ALTER TABLE public.credential_registry ADD COLUMN key_version TEXT NOT NULL DEFAULT 'v1';
  END IF;
END $$;
