-- ==============================================================================
-- KAAMSETU SOVEREIGN DIGITAL IDENTITY PLATFORM
-- Migration 05: RLS Security Reinforcement, Anti-Tamper Triggers,
-- Distributed Rate Limiting & Cryptographic Credential Registry
-- Target: PostgreSQL 15+ / Supabase
-- ==============================================================================

-- 0. HARDEN PROFILES TABLE RLS (PREVENT PHONE NUMBER / PRIVATE FIELD LEAKAGE)
-- Drop leaky policy that allowed anyone to read public.profiles table directly.
-- Public worker discovery queries through public.public_worker_profiles view which excludes phone.
DROP POLICY IF EXISTS "Public can view published worker basic profiles" ON public.profiles;

-- 1. PREVENT PROFILE PRIVILEGE ESCALATION
-- Ensures users can never change their own role to 'admin' or mark themselves verified
CREATE OR REPLACE FUNCTION public.prevent_profile_privilege_escalation()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if role or is_verified was changed
  IF (NEW.role <> OLD.role OR NEW.is_verified <> OLD.is_verified) THEN
    -- Only allow if session is service_role or user is already an admin
    IF current_setting('role', true) <> 'service_role' AND NOT EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    ) THEN
      NEW.role := OLD.role;
      NEW.is_verified := OLD.is_verified;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_profile_privilege_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_profile_privilege_escalation
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_privilege_escalation();


-- 2. PREVENT UNAUTHORIZED WORK RECORD SELF-VERIFICATION
-- Workers can insert work records, but verified_by_contractor and verification_hash
-- can only be set by the client/contractor of the completed booking or an admin
CREATE OR REPLACE FUNCTION public.enforce_work_record_integrity()
RETURNS TRIGGER AS $$
BEGIN
  -- If worker is inserting/updating their own record without admin/contractor confirmation
  IF (NEW.verified_by_contractor = true OR NEW.verification_hash IS NOT NULL) THEN
    IF current_setting('role', true) <> 'service_role' THEN
      -- Must be confirmed by the booking's customer or an admin
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
        -- Work records without a completed booking cannot be self-verified
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_enforce_work_record_integrity ON public.work_records;
CREATE TRIGGER trg_enforce_work_record_integrity
BEFORE INSERT OR UPDATE ON public.work_records
FOR EACH ROW EXECUTE FUNCTION public.enforce_work_record_integrity();


-- 3. REINFORCE BOOKING LIFECYCLE STATE MACHINE IN DATABASE TRIGGER
CREATE OR REPLACE FUNCTION public.validate_booking_status_transition()
RETURNS trigger AS $$
BEGIN
  -- Prevent altering customer or worker profile assignment
  IF NEW.customer_id <> OLD.customer_id OR NEW.worker_profile_id <> OLD.worker_profile_id THEN
    RAISE EXCEPTION 'Cannot reassign booking participants';
  END IF;

  -- Prevent modifying completed or cancelled bookings
  IF OLD.status = 'completed' AND NEW.status <> 'completed' THEN
    RAISE EXCEPTION 'Completed bookings cannot be modified or reopened';
  END IF;

  IF OLD.status = 'cancelled' AND NEW.status <> 'cancelled' THEN
    RAISE EXCEPTION 'Cancelled bookings cannot be reopened';
  END IF;

  -- Lifecycle state machine rules
  IF NEW.status <> OLD.status THEN
    -- requested -> confirmed: ONLY assigned worker can accept
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

    -- confirmed -> in_progress: ONLY assigned worker can start
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

    -- in_progress -> completed: must have been in_progress
    IF NEW.status = 'completed' AND OLD.status <> 'in_progress' THEN
      RAISE EXCEPTION 'Invalid status transition: booking must be in_progress before completion';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 4. DISTRIBUTED / SERVERLESS RATE LIMITING TABLE
CREATE TABLE IF NOT EXISTS public.auth_rate_limits (
  key TEXT PRIMARY KEY,
  count INT NOT NULL DEFAULT 1,
  first_attempt_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_attempt_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  blocked_until TIMESTAMPTZ
);

ALTER TABLE public.auth_rate_limits ENABLE ROW LEVEL SECURITY;

-- Rate limit increment function (Atomic across multiple serverless nodes)
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
) AS $$
DECLARE
  v_record public.auth_rate_limits;
  v_now TIMESTAMPTZ := now();
  v_window_expiry TIMESTAMPTZ;
BEGIN
  SELECT * INTO v_record FROM public.auth_rate_limits WHERE key = p_key FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO public.auth_rate_limits (key, count, first_attempt_at, last_attempt_at, blocked_until)
    VALUES (p_key, 1, v_now, v_now, NULL);
    RETURN QUERY SELECT true, 1, 0;
    RETURN;
  END IF;

  -- Check if currently blocked
  IF v_record.blocked_until IS NOT NULL AND v_record.blocked_until > v_now THEN
    RETURN QUERY SELECT false, v_record.count, EXTRACT(EPOCH FROM (v_record.blocked_until - v_now))::INT;
    RETURN;
  END IF;

  -- Check if window expired
  v_window_expiry := v_record.first_attempt_at + (p_window_seconds || ' seconds')::INTERVAL;
  IF v_now > v_window_expiry THEN
    UPDATE public.auth_rate_limits
    SET count = 1, first_attempt_at = v_now, last_attempt_at = v_now, blocked_until = NULL
    WHERE key = p_key;
    RETURN QUERY SELECT true, 1, 0;
    RETURN;
  END IF;

  -- Within window: check count
  IF v_record.count >= p_max_attempts THEN
    UPDATE public.auth_rate_limits
    SET blocked_until = v_now + (p_block_seconds || ' seconds')::INTERVAL,
        last_attempt_at = v_now
    WHERE key = p_key;
    RETURN QUERY SELECT false, v_record.count, p_block_seconds;
    RETURN;
  ELSE
    UPDATE public.auth_rate_limits
    SET count = count + 1, last_attempt_at = v_now
    WHERE key = p_key;
    RETURN QUERY SELECT true, v_record.count + 1, 0;
    RETURN;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 5. CANONICAL CRYPTOGRAPHIC CREDENTIAL REGISTRY TABLE
CREATE TABLE IF NOT EXISTS public.credential_registry (
  registry_id TEXT PRIMARY KEY,
  worker_profile_id UUID NOT NULL REFERENCES public.worker_profiles(id) ON DELETE CASCADE,
  canonical_payload_hash TEXT NOT NULL,
  signature TEXT NOT NULL,
  algorithm TEXT NOT NULL DEFAULT 'HMAC-SHA256',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'revoked')),
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ,
  revocation_reason TEXT
);

ALTER TABLE public.credential_registry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active credentials"
  ON public.credential_registry FOR SELECT
  USING (true);

CREATE POLICY "Admin manage credential registry"
  ON public.credential_registry FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
