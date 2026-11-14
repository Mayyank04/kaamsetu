-- ============================================================================
-- KAAMSETU SOVEREIGN DIGITAL IDENTITY PLATFORM
-- Migration 01: Core Schema & Relational Architecture
-- Target: PostgreSQL 15+ / Supabase
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS
DO $$ BEGIN
  CREATE TYPE app_role AS ENUM ('worker', 'customer', 'contractor', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE booking_status AS ENUM ('requested', 'confirmed', 'in_progress', 'completed', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE availability_state AS ENUM ('available', 'on_site', 'unavailable');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'customer',
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

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

-- 5. SKILLS (Granular Trade Competencies)
CREATE TABLE IF NOT EXISTS public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  occupation_id UUID NOT NULL REFERENCES public.occupations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  hindi_name TEXT,
  slug TEXT NOT NULL,
  category TEXT DEFAULT 'Core Craft', -- 'Core Craft', 'Equipment & Tools', 'Safety & Standards', 'Specialization'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_occupation_skill_slug UNIQUE (occupation_id, slug)
);

-- 6. WORKER PROFILES
CREATE TABLE IF NOT EXISTS public.worker_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  registry_id TEXT NOT NULL UNIQUE, -- e.g. "IN-RJ-2026-4029-KS"
  slug TEXT NOT NULL UNIQUE, -- Unique URL identifier, e.g. "rameshwar-sharma-jaipur"
  occupation_id UUID NOT NULL REFERENCES public.occupations(id) ON DELETE RESTRICT,
  headline TEXT NOT NULL,
  bio TEXT,
  years_experience INT NOT NULL DEFAULT 0 CHECK (years_experience >= 0),
  hourly_rate NUMERIC(10, 2) CHECK (hourly_rate >= 0),
  daily_rate_min NUMERIC(10, 2) CHECK (daily_rate_min >= 0),
  daily_rate_max NUMERIC(10, 2) CHECK (daily_rate_max >= daily_rate_min),
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL CHECK (pincode ~ '^[1-9][0-9]{5}$'),
  service_radius_km INT DEFAULT 25 CHECK (service_radius_km > 0),
  languages TEXT[] DEFAULT ARRAY['Hindi'],
  kaamscore INT NOT NULL DEFAULT 650 CHECK (kaamscore >= 300 AND kaamscore <= 900),
  kaamscore_level INT NOT NULL DEFAULT 2 CHECK (kaamscore_level >= 1 AND kaamscore_level <= 4),
  aadhaar_verified BOOLEAN NOT NULL DEFAULT FALSE,
  digilocker_linked BOOLEAN NOT NULL DEFAULT FALSE,
  is_published BOOLEAN NOT NULL DEFAULT FALSE, -- RLS gatekeeper: only published profiles are public
  availability_status availability_state NOT NULL DEFAULT 'available',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. WORKER SKILLS (M:M Junction with verification metrics)
CREATE TABLE IF NOT EXISTS public.worker_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_profile_id UUID NOT NULL REFERENCES public.worker_profiles(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  years_practiced INT DEFAULT 1,
  is_primary BOOLEAN DEFAULT FALSE,
  verified_by_peer_count INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_worker_skill UNIQUE (worker_profile_id, skill_id)
);

-- 8. PORTFOLIO (Showcase items for craftsmen)
CREATE TABLE IF NOT EXISTS public.portfolio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_profile_id UUID NOT NULL REFERENCES public.worker_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  project_date DATE,
  category TEXT,
  client_testimony TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. BOOKINGS (Transactions & Service Contracts)
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_reference TEXT NOT NULL UNIQUE, -- e.g. "BK-2026-8901"
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  worker_profile_id UUID NOT NULL REFERENCES public.worker_profiles(id) ON DELETE CASCADE,
  service_title TEXT NOT NULL,
  description TEXT,
  location_address TEXT NOT NULL,
  location_city TEXT NOT NULL,
  scheduled_start TIMESTAMPTZ NOT NULL,
  scheduled_end TIMESTAMPTZ,
  estimated_cost NUMERIC(10, 2),
  final_cost NUMERIC(10, 2),
  status booking_status NOT NULL DEFAULT 'requested',
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. REVIEWS (Gated to verified completed bookings only)
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL UNIQUE REFERENCES public.bookings(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  worker_profile_id UUID NOT NULL REFERENCES public.worker_profiles(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  quality_rating INT CHECK (quality_rating >= 1 AND quality_rating <= 5),
  punctuality_rating INT CHECK (punctuality_rating >= 1 AND punctuality_rating <= 5),
  comment TEXT NOT NULL,
  contractor_signed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. WORK RECORDS (Verified tenure history & cryptographic audit trail)
CREATE TABLE IF NOT EXISTS public.work_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_profile_id UUID NOT NULL REFERENCES public.worker_profiles(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  project_title TEXT NOT NULL,
  contractor_or_client TEXT NOT NULL,
  location TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN DEFAULT FALSE,
  hours_logged NUMERIC(8, 2),
  trade_category TEXT NOT NULL,
  verified_by_contractor BOOLEAN DEFAULT FALSE,
  verification_hash TEXT, -- SHA-256 integrity hash
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE & FAST LOOKUPS
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_worker_profiles_slug ON public.worker_profiles(slug);
CREATE INDEX IF NOT EXISTS idx_worker_profiles_published ON public.worker_profiles(is_published) WHERE is_published = TRUE;
CREATE INDEX IF NOT EXISTS idx_worker_profiles_occupation ON public.worker_profiles(occupation_id);
CREATE INDEX IF NOT EXISTS idx_worker_profiles_city ON public.worker_profiles(city);
CREATE INDEX IF NOT EXISTS idx_worker_profiles_kaamscore ON public.worker_profiles(kaamscore DESC);

CREATE INDEX IF NOT EXISTS idx_skills_occupation ON public.skills(occupation_id);
CREATE INDEX IF NOT EXISTS idx_worker_skills_worker ON public.worker_skills(worker_profile_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_worker ON public.portfolio(worker_profile_id);

CREATE INDEX IF NOT EXISTS idx_bookings_customer ON public.bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_worker ON public.bookings(worker_profile_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);

CREATE INDEX IF NOT EXISTS idx_reviews_worker ON public.reviews(worker_profile_id);
CREATE INDEX IF NOT EXISTS idx_reviews_booking ON public.reviews(booking_id);

CREATE INDEX IF NOT EXISTS idx_work_records_worker ON public.work_records(worker_profile_id);

-- ============================================================================
-- AUTOMATED TRIGGERS & BUSINESS LOGIC FUNCTIONS
-- ============================================================================

-- Function 1: Updated At Timestamp Mutator
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER trg_worker_profiles_updated_at
BEFORE UPDATE ON public.worker_profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER trg_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER trg_reviews_updated_at
BEFORE UPDATE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function 2: Automated Unique Profile Slug Generator
CREATE OR REPLACE FUNCTION public.generate_worker_profile_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  candidate_slug TEXT;
  collision_count INT := 0;
  user_full_name TEXT;
BEGIN
  -- If slug already provided and not empty, clean it
  IF NEW.slug IS NOT NULL AND trim(NEW.slug) <> '' THEN
    base_slug := lower(regexp_replace(trim(NEW.slug), '[^a-zA-Z0-9]+', '-', 'g'));
    base_slug := trim(both '-' from base_slug);
  ELSE
    -- Fetch worker full name from profiles
    SELECT full_name INTO user_full_name FROM public.profiles WHERE id = NEW.user_id;
    IF user_full_name IS NULL THEN
      user_full_name := 'worker';
    END IF;

    -- Generate base slug: e.g. "rameshwar-sharma-jaipur"
    base_slug := lower(regexp_replace(user_full_name || '-' || NEW.city, '[^a-zA-Z0-9]+', '-', 'g'));
    base_slug := trim(both '-' from base_slug);
  END IF;

  candidate_slug := base_slug;

  -- Ensure uniqueness
  WHILE EXISTS (
    SELECT 1 FROM public.worker_profiles
    WHERE slug = candidate_slug AND id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
  ) LOOP
    collision_count := collision_count + 1;
    candidate_slug := base_slug || '-' || collision_count;
  END LOOP;

  NEW.slug := candidate_slug;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_worker_profiles_slug
BEFORE INSERT OR UPDATE OF city ON public.worker_profiles
FOR EACH ROW EXECUTE FUNCTION public.generate_worker_profile_slug();

-- Function 3: New Auth User Profile Initializer Trigger
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role_val public.app_role;
  user_name_val TEXT;
BEGIN
  -- Extract role from raw_user_meta_data if present
  BEGIN
    user_role_val := COALESCE(
      (NEW.raw_user_meta_data->>'role')::public.app_role,
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger firing on auth.users creation
CREATE OR REPLACE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();
