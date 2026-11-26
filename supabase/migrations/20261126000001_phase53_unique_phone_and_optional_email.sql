-- ============================================================================
-- KAAMSETU PHASE 53: UNIQUE PHONE IDENTITY & OPTIONAL EMAIL MIGRATION
-- Safe, non-destructive migration enforcing database-level uniqueness on
-- canonical E.164 phone numbers and optional unverified email storage.
--
-- SAFETY GUARANTEES:
-- 1. Never deletes, merges, or mutates user roles or auth.users identities.
-- 2. Audits existing duplicate or invalid phone rows before indexing.
-- 3. Keeps all existing RLS policies intact.
-- ============================================================================

-- 1. Ensure optional email, email verification state, and canonical E.164 column exist
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS phone_e164 TEXT,
  ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS phone_verification_status TEXT NOT NULL DEFAULT 'not_verified';

ALTER TABLE public.profiles ALTER COLUMN phone DROP NOT NULL;

-- 2. Non-destructive conflict audit log table (for manual governance review only)
CREATE TABLE IF NOT EXISTS public.phone_uniqueness_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL,
  raw_phone TEXT,
  normalized_phone_e164 TEXT,
  audit_status TEXT NOT NULL CHECK (audit_status IN ('duplicate_phone', 'invalid_phone', 'normalized')),
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.phone_uniqueness_audit ENABLE ROW LEVEL SECURITY;

-- 3. Normalize existing Indian mobile numbers into phone_e164 ONLY when unambiguous & unique
DO $$
DECLARE
  rec RECORD;
  v_digits TEXT;
  v_clean10 TEXT;
  v_e164 TEXT;
  v_conflict_exists BOOLEAN;
BEGIN
  FOR rec IN
    SELECT id, phone
    FROM public.profiles
    WHERE phone IS NOT NULL AND phone_e164 IS NULL
  LOOP
    v_digits := regexp_replace(rec.phone, '\D', '', 'g');

    IF length(v_digits) = 12 AND left(v_digits, 2) = '91' THEN
      v_clean10 := substr(v_digits, 3);
    ELSIF length(v_digits) = 11 AND left(v_digits, 1) = '0' THEN
      v_clean10 := substr(v_digits, 2);
    ELSE
      v_clean10 := v_digits;
    END IF;

    IF v_digits ~ '^[1-9][0-9]{6,14}$' AND rec.phone LIKE '+%' AND NOT (rec.phone LIKE '+91%') THEN
      v_e164 := '+' || v_digits;
    ELSIF v_clean10 ~ '^[6-9][0-9]{9}$' THEN
      v_e164 := '+91' || v_clean10;
    ELSE
      v_e164 := NULL;
    END IF;

    IF v_e164 IS NULL THEN
      INSERT INTO public.phone_uniqueness_audit (profile_id, raw_phone, normalized_phone_e164, audit_status)
      VALUES (rec.id, rec.phone, NULL, 'invalid_phone');
    ELSE
      SELECT EXISTS (
        SELECT 1 FROM public.profiles p WHERE p.phone_e164 = v_e164 AND p.id <> rec.id
      ) INTO v_conflict_exists;

      IF v_conflict_exists THEN
        INSERT INTO public.phone_uniqueness_audit (profile_id, raw_phone, normalized_phone_e164, audit_status)
        VALUES (rec.id, rec.phone, v_e164, 'duplicate_phone');
      ELSE
        UPDATE public.profiles SET phone_e164 = v_e164 WHERE id = rec.id;
      END IF;
    END IF;
  END LOOP;
END $$;

-- 4. Database-level unique index enforcing One Verified Phone = One Primary Account Identity
-- Note: Also prevent any new conflicting active phone registration across roles.
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_phone_e164_unique
  ON public.profiles (phone_e164)
  WHERE phone_e164 IS NOT NULL;

-- Partial unique index for legacy phone column values when populated
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE phone IS NOT NULL
    GROUP BY phone
    HAVING count(*) > 1
  ) THEN
    CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_phone_unique
      ON public.profiles (phone)
      WHERE phone IS NOT NULL;
  ELSE
    RAISE NOTICE 'Phase 53 notice: existing duplicate values detected in profiles.phone; review public.phone_uniqueness_audit before enabling idx_profiles_phone_unique.';
  END IF;
END $$;

-- Optional email uniqueness (case-insensitive, permits NULL when email omitted)
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_email_lower_unique
  ON public.profiles (lower(email))
  WHERE email IS NOT NULL;
