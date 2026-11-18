-- ============================================================================
-- KAAMSETU — PHASE 40: ROOT-CAUSE MASTER DATABASE SCHEMA REPAIR
-- Migration: 20261118000001_phase40_root_cause_master_schema.sql
-- Classification: CLASS_B_CONTROLLED_ROLLOUT (Guwahati Urban & Shillong Urban)
-- Target: PostgreSQL 15+ / Supabase (Cloud Project: anwppwjlismjyovbyfmb)
-- Permanent Financial Invariant: platform_commission_amount = 0.00
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('worker', 'customer', 'contractor', 'admin', 'institution');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.booking_status AS ENUM ('requested', 'confirmed', 'in_progress', 'completed', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.availability_state AS ENUM ('available', 'on_site', 'unavailable');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES (Linked directly to Supabase Auth auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'worker'::public.app_role,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  bio TEXT,
  city TEXT DEFAULT 'Guwahati',
  state TEXT DEFAULT 'Assam',
  pincode TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  account_status TEXT NOT NULL DEFAULT 'active',
  phone_verification_status TEXT NOT NULL DEFAULT 'not_verified',
  verification_method TEXT NOT NULL DEFAULT 'none',
  phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
  terms_accepted_at TIMESTAMPTZ DEFAULT now(),
  privacy_accepted_at TIMESTAMPTZ DEFAULT now(),
  terms_version TEXT NOT NULL DEFAULT '2026.1',
  privacy_version TEXT NOT NULL DEFAULT '2026.1',
  consent_purpose TEXT NOT NULL DEFAULT 'workforce_identity_registration',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure forward-compatibility columns exist if table was partially created
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'active';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_verification_status TEXT DEFAULT 'not_verified';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verification_method TEXT DEFAULT 'none';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS privacy_accepted_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS terms_version TEXT DEFAULT '2026.1';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS privacy_version TEXT DEFAULT '2026.1';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS consent_purpose TEXT DEFAULT 'workforce_identity_registration';

-- Indexes on profiles
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_email_lower ON public.profiles (LOWER(email)) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles (phone) WHERE phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles (role);

-- 4. OCCUPATIONS (National Trade Classifications aligned with NSQF)
CREATE TABLE IF NOT EXISTS public.occupations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  hindi_name TEXT,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  nsqf_level INT DEFAULT 4,
  icon_name TEXT DEFAULT 'Hammer',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed Core Occupations
INSERT INTO public.occupations (id, name, hindi_name, slug, description, nsqf_level, icon_name, is_active)
VALUES
  ('11111111-1111-1111-1111-111111111101', 'Electrical & Solar', 'इलेक्ट्रिकल और सोलर', 'electrical-solar', 'Domestic wiring, commercial power, solar inverter systems and industrial maintenance.', 4, 'Zap', true),
  ('11111111-1111-1111-1111-111111111102', 'Carpentry & Joinery', 'बढ़ईगीरी और काष्ठकला', 'carpentry-joinery', 'Architectural woodwork, furniture joinery, shuttering and precision framing.', 4, 'Hammer', true),
  ('11111111-1111-1111-1111-111111111103', 'Plumbing & Sanitation', 'प्लंबिंग और स्वच्छता', 'plumbing-sanitation', 'Potable water networks, drainage engineering, sanitary fixtures and pressure systems.', 4, 'Wrench', true),
  ('11111111-1111-1111-1111-111111111104', 'Masonry & Construction', 'राजमिस्त्री और निर्माण', 'masonry-construction', 'Brickwork, concrete placement, structural plastering and tile laying.', 3, 'Building', true),
  ('11111111-1111-1111-1111-111111111105', 'Painting & Finishing', 'पेंटिंग और परिष्करण', 'painting-finishing', 'Surface preparation, moisture barrier coating, enamel and decorative finishes.', 3, 'Paintbrush', true),
  ('11111111-1111-1111-1111-111111111106', 'Welding & Fabrication', 'वेल्डिंग और फैब्रिकेशन', 'welding-fabrication', 'Arc welding, structural steel fabrication, grill assembly and pipe fitting.', 4, 'Flame', true),
  ('11111111-1111-1111-1111-111111111107', 'HVAC & Refrigeration', 'एचवीएसी और प्रशीतन', 'hvac-refrigeration', 'Air conditioning installation, compressor overhaul, refrigerant charging and HVAC ducts.', 4, 'Wind', true),
  ('11111111-1111-1111-1111-111111111108', 'Automobile Mechanics', 'ऑटोमोबाइल मैकेनिक्स', 'automobile-mechanics', 'Internal combustion maintenance, vehicle electricals, brake systems and hydraulics.', 4, 'Car', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  hindi_name = EXCLUDED.hindi_name,
  slug = EXCLUDED.slug,
  is_active = true;

-- 5. SKILLS (Granular Trade Competencies)
CREATE TABLE IF NOT EXISTS public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  occupation_id UUID NOT NULL REFERENCES public.occupations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  hindi_name TEXT,
  slug TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_skills_occupation ON public.skills (occupation_id);
CREATE INDEX IF NOT EXISTS idx_skills_name ON public.skills (name);

-- 6. WORKER PROFILES (Detailed Professional Identity & Verification Record)
CREATE TABLE IF NOT EXISTS public.worker_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  registry_id TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  occupation_id UUID REFERENCES public.occupations(id) ON DELETE SET NULL,
  headline TEXT NOT NULL,
  bio TEXT,
  years_experience INT DEFAULT 0,
  hourly_rate NUMERIC,
  daily_rate_min NUMERIC,
  daily_rate_max NUMERIC,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  service_radius_km INT DEFAULT 25,
  languages TEXT[] DEFAULT '{}',
  kaamscore INT DEFAULT 300,
  kaamscore_level INT DEFAULT 1,
  aadhaar_verified BOOLEAN DEFAULT FALSE,
  digilocker_linked BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT FALSE,
  availability_status public.availability_state NOT NULL DEFAULT 'available'::public.availability_state,
  travel_willingness TEXT DEFAULT 'adjacent_districts',
  is_dispatch_eligible BOOLEAN DEFAULT TRUE,
  dispatch_status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_worker_profiles_user_id ON public.worker_profiles (user_id);
CREATE INDEX IF NOT EXISTS idx_worker_profiles_city_pincode ON public.worker_profiles (city, pincode);
CREATE INDEX IF NOT EXISTS idx_worker_profiles_published ON public.worker_profiles (is_published);

-- 7. WORKER SKILLS (Many-to-Many Worker Trade Associations)
CREATE TABLE IF NOT EXISTS public.worker_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_profile_id UUID NOT NULL REFERENCES public.worker_profiles(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  verification_type TEXT NOT NULL DEFAULT 'self_declared',
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  years_practiced INT DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (worker_profile_id, skill_id)
);

CREATE INDEX IF NOT EXISTS idx_worker_skills_profile ON public.worker_skills (worker_profile_id);

-- 8. USER CONSENTS (Immutable Audit Ledger)
CREATE TABLE IF NOT EXISTS public.user_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL,
  consent_version TEXT NOT NULL DEFAULT '2026.1',
  consent_purpose TEXT NOT NULL DEFAULT 'workforce_identity_registration',
  granted BOOLEAN NOT NULL DEFAULT TRUE,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  context_metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_user_consents_user ON public.user_consents (user_id);

-- 9. CONTRACTOR ORGANIZATIONS
CREATE TABLE IF NOT EXISTS public.contractor_organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  verification_status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (owner_id)
);

-- 10. AUTH RATE LIMITS (Persistent Abuse Prevention)
CREATE TABLE IF NOT EXISTS public.auth_rate_limits (
  key TEXT PRIMARY KEY,
  attempt_count INT NOT NULL DEFAULT 1,
  first_attempt_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  blocked_until TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. OTP CHALLENGES (Isolated for optional telecom features)
CREATE TABLE IF NOT EXISTS public.otp_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_hash TEXT NOT NULL,
  otp_hash TEXT NOT NULL,
  attempts INT NOT NULL DEFAULT 0,
  max_attempts INT NOT NULL DEFAULT 5,
  consumed BOOLEAN NOT NULL DEFAULT FALSE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_otp_challenges_phone_hash ON public.otp_challenges (phone_hash);

-- 12. AUTOMATIC PROFILE PROVISIONING TRIGGER ON auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name,
    email,
    role,
    phone,
    phone_verified,
    phone_verification_status,
    verification_method,
    account_status,
    created_at,
    updated_at
  )
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Artisan'),
    new.email,
    COALESCE((new.raw_user_meta_data->>'role')::public.app_role, 'worker'::public.app_role),
    new.raw_user_meta_data->>'phone',
    false,
    'not_verified',
    'none',
    'active',
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = COALESCE(EXCLUDED.email, public.profiles.email),
    full_name = COALESCE(NULLIF(EXCLUDED.full_name, 'Artisan'), public.profiles.full_name),
    updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Rebind trigger safely
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 13. RATE LIMITING STORED PROCEDURES (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.check_and_increment_rate_limit(
  p_key text,
  p_max_attempts integer,
  p_window_seconds integer,
  p_block_seconds integer
)
RETURNS TABLE(
  allowed boolean,
  remaining_attempts integer,
  retry_after_seconds integer,
  blocked boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_now timestamptz := now();
  v_record public.auth_rate_limits%ROWTYPE;
  v_elapsed_seconds integer;
BEGIN
  SELECT * INTO v_record FROM public.auth_rate_limits WHERE key = p_key FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO public.auth_rate_limits (key, attempt_count, first_attempt_at, blocked_until, updated_at)
    VALUES (p_key, 1, v_now, NULL, v_now);

    RETURN QUERY SELECT true, p_max_attempts - 1, 0, false;
    RETURN;
  END IF;

  IF v_record.blocked_until IS NOT NULL AND v_record.blocked_until > v_now THEN
    RETURN QUERY SELECT
      false,
      0,
      GREATEST(1, EXTRACT(EPOCH FROM (v_record.blocked_until - v_now))::integer),
      true;
    RETURN;
  END IF;

  v_elapsed_seconds := EXTRACT(EPOCH FROM (v_now - v_record.first_attempt_at))::integer;

  IF v_elapsed_seconds > p_window_seconds THEN
    UPDATE public.auth_rate_limits
    SET attempt_count = 1,
        first_attempt_at = v_now,
        blocked_until = NULL,
        updated_at = v_now
    WHERE key = p_key;

    RETURN QUERY SELECT true, p_max_attempts - 1, 0, false;
    RETURN;
  END IF;

  IF v_record.attempt_count >= p_max_attempts THEN
    UPDATE public.auth_rate_limits
    SET blocked_until = v_now + (p_block_seconds || ' seconds')::interval,
        updated_at = v_now
    WHERE key = p_key;

    RETURN QUERY SELECT false, 0, p_block_seconds, true;
    RETURN;
  END IF;

  UPDATE public.auth_rate_limits
  SET attempt_count = v_record.attempt_count + 1,
      updated_at = v_now
  WHERE key = p_key;

  RETURN QUERY SELECT
    true,
    GREATEST(0, p_max_attempts - (v_record.attempt_count + 1)),
    0,
    false;
  RETURN;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_rate_limit_status(p_key text)
RETURNS TABLE(
  is_existing boolean,
  attempt_count integer,
  remaining_seconds integer,
  is_blocked boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_now timestamptz := now();
  v_record public.auth_rate_limits%ROWTYPE;
BEGIN
  SELECT * INTO v_record FROM public.auth_rate_limits WHERE key = p_key;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0, 0, false;
    RETURN;
  END IF;

  IF v_record.blocked_until IS NOT NULL AND v_record.blocked_until > v_now THEN
    RETURN QUERY SELECT
      true,
      v_record.attempt_count,
      GREATEST(1, EXTRACT(EPOCH FROM (v_record.blocked_until - v_now))::integer),
      true;
    RETURN;
  END IF;

  RETURN QUERY SELECT true, v_record.attempt_count, 0, false;
  RETURN;
END;
$$;

-- 14. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.occupations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contractor_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_challenges ENABLE ROW LEVEL SECURITY;

-- Profiles: Authenticated users can read and update their own profile; public can read basic info
DO $$ BEGIN
  CREATE POLICY "Profiles are viewable by owner and public"
    ON public.profiles FOR SELECT
    USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Profiles can be updated by owner"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Profiles can be inserted by owner"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Occupations & Skills: Public read
DO $$ BEGIN
  CREATE POLICY "Occupations are viewable by everyone"
    ON public.occupations FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Skills are viewable by everyone"
    ON public.skills FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Worker Profiles: Public read if published; owner read/update always
DO $$ BEGIN
  CREATE POLICY "Worker profiles viewable by public or owner"
    ON public.worker_profiles FOR SELECT
    USING (is_published = true OR auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Worker profiles manageable by owner"
    ON public.worker_profiles FOR ALL
    USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Worker Skills: Public read; owner manage
DO $$ BEGIN
  CREATE POLICY "Worker skills viewable by everyone"
    ON public.worker_skills FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Worker skills manageable by worker owner"
    ON public.worker_skills FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM public.worker_profiles wp
        WHERE wp.id = worker_skills.worker_profile_id AND wp.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- User Consents: Owner view and create
DO $$ BEGIN
  CREATE POLICY "Consents viewable and insertable by owner"
    ON public.user_consents FOR ALL
    USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Rate Limits and OTP Challenges: STRICTLY service_role only
REVOKE ALL ON public.auth_rate_limits FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.otp_challenges FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.check_and_increment_rate_limit FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_rate_limit_status FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.check_and_increment_rate_limit TO service_role;
GRANT EXECUTE ON FUNCTION public.get_rate_limit_status TO service_role;

-- 15. POSTGREST SCHEMA CACHE RELOAD
NOTIFY pgrst, 'reload schema';
