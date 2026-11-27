-- ============================================================================
-- KAAMSETU PHASE 54: MARKETPLACE CATEGORY SYSTEM & VERIFIED PHONE IDENTITY
-- Safe, non-destructive migration ensuring worker category indexing and
-- database-enforced phone verification state.
--
-- Rollout Boundary: CLASS_B_CONTROLLED_ROLLOUT (Guwahati Urban & Shillong Urban).
-- Permanent Constitutional Invariant: platform_commission_amount = 0.00 on artisan wages.
-- ============================================================================

-- 1. Ensure phone_verification_status and category_slug columns exist on worker_profiles
ALTER TABLE public.worker_profiles
  ADD COLUMN IF NOT EXISTS phone_verification_status TEXT NOT NULL DEFAULT 'not_verified',
  ADD COLUMN IF NOT EXISTS category_slug TEXT,
  ADD COLUMN IF NOT EXISTS subcategories TEXT[] DEFAULT '{}'::TEXT[];

-- 2. Add constraint on phone_verification_status values if not already present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_worker_profiles_phone_verification_status'
  ) THEN
    ALTER TABLE public.worker_profiles
      ADD CONSTRAINT chk_worker_profiles_phone_verification_status
      CHECK (phone_verification_status IN ('sms_verified', 'sandbox_verified', 'not_verified'));
  END IF;
END $$;

-- 3. Accelerated discovery and filtering indexes
CREATE INDEX IF NOT EXISTS idx_worker_profiles_phone_verification_status
  ON public.worker_profiles (phone_verification_status)
  WHERE is_published = TRUE;

CREATE INDEX IF NOT EXISTS idx_worker_profiles_category_slug
  ON public.worker_profiles (category_slug)
  WHERE is_published = TRUE;

CREATE INDEX IF NOT EXISTS idx_worker_profiles_city_pincode
  ON public.worker_profiles (city, pincode)
  WHERE is_published = TRUE;

-- 4. Sync existing profile phone_verification_status into worker_profiles
DO $$
BEGIN
  UPDATE public.worker_profiles wp
  SET phone_verification_status = p.phone_verification_status
  FROM public.profiles p
  WHERE wp.user_id = p.id
    AND p.phone_verification_status IS NOT NULL
    AND wp.phone_verification_status = 'not_verified';
END $$;
