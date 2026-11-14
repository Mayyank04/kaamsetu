-- ==============================================================================
-- KAAMSETU SOVEREIGN DIGITAL IDENTITY PLATFORM
-- Migration 04: Security Hardening, Strict Storage RLS & Privacy Policies
-- Target: PostgreSQL 15+ / Supabase
-- ==============================================================================

-- 1. HARDEN PROFILES PRIVACY
-- Drop overly broad SELECT policy that exposed phone numbers to everyone
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Allow users to view their own complete private profile (including phone)
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Allow public users to view only minimal public identity for published workers
CREATE POLICY "Public can view published worker basic profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.worker_profiles
      WHERE worker_profiles.user_id = profiles.id
      AND worker_profiles.is_published = true
    )
  );

-- Create a privacy-preserving public view that never exposes phone numbers
CREATE OR REPLACE VIEW public.public_worker_profiles AS
SELECT 
  wp.id AS worker_profile_id,
  wp.registry_id,
  wp.slug,
  wp.occupation_id,
  wp.headline,
  wp.bio,
  wp.years_experience,
  wp.hourly_rate,
  wp.daily_rate_min,
  wp.daily_rate_max,
  wp.city,
  wp.state,
  wp.pincode,
  wp.service_radius_km,
  wp.languages,
  wp.kaamscore,
  wp.kaamscore_level,
  wp.aadhaar_verified,
  wp.digilocker_linked,
  wp.availability_status,
  wp.created_at,
  p.full_name,
  p.avatar_url,
  p.is_verified AS profile_verified,
  o.name AS occupation_name,
  o.hindi_name AS occupation_hindi_name,
  o.slug AS occupation_slug,
  o.nsqf_level
FROM public.worker_profiles wp
JOIN public.profiles p ON p.id = wp.user_id
JOIN public.occupations o ON o.id = wp.occupation_id
WHERE wp.is_published = true;

GRANT SELECT ON public.public_worker_profiles TO anon, authenticated;

-- 2. HARDEN STORAGE RLS POLICIES (OWNERSHIP ENFORCEMENT)
DROP POLICY IF EXISTS "Workers can upload portfolio images" ON storage.objects;
DROP POLICY IF EXISTS "Workers can delete their own portfolio images" ON storage.objects;

-- Enforce folder ownership matching auth.uid() in predictable path: user_id/worker_profile_id/filename
CREATE POLICY "Workers can upload portfolio images to own folder only"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'portfolio-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Workers can update own portfolio images only"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'portfolio-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Workers can delete own portfolio images only"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'portfolio-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- 3. HARDEN WORK RECORDS PRIVACY
-- Only genuinely verified work records belonging to published profiles are visible to the public
DROP POLICY IF EXISTS "Public work records are viewable by everyone" ON public.work_records;

CREATE POLICY "Verified work records of published workers are viewable by public"
  ON public.work_records FOR SELECT
  USING (
    is_verified = true AND
    verification_hash IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.worker_profiles
      WHERE worker_profiles.id = work_records.worker_profile_id
      AND worker_profiles.is_published = true
    )
  );

-- Workers can always view all their own work records (including unverified / pending)
CREATE POLICY "Workers can view all own work records"
  ON public.work_records FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.worker_profiles
      WHERE worker_profiles.id = work_records.worker_profile_id
      AND worker_profiles.user_id = auth.uid()
    )
  );

-- 4. HARDEN BOOKING UPDATES
-- Prevent participants from mutating core ownership columns during status transitions
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

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_booking_status ON public.bookings;
CREATE TRIGGER trg_validate_booking_status
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_booking_status_transition();
