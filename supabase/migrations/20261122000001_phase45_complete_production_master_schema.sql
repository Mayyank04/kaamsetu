-- ============================================================================
-- KAAMSETU — PHASE 45: COMPLETE PRODUCTION MASTER DATABASE SCHEMA
-- Migration: 20261122000001_phase45_complete_production_master_schema.sql
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

-- 3. PROFILES TABLE (Linked to auth.users)
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

-- Ensure all profiles columns exist
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

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_email_lower ON public.profiles (LOWER(email)) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles (phone) WHERE phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles (role);

-- 4. OCCUPATIONS TABLE (NSQF Aligned Trades)
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

-- Seed Occupations (22 Trades across 6 Sectors + Small Vendors)
INSERT INTO public.occupations (id, name, hindi_name, slug, description, nsqf_level, icon_name, is_active)
VALUES
  ('11111111-1111-1111-1111-111111111101', 'Electrical & Solar', 'इलेक्ट्रिकल और सोलर', 'electrical-solar', 'Domestic wiring, commercial power, solar inverter systems and industrial maintenance.', 4, 'Zap', true),
  ('11111111-1111-1111-1111-111111111102', 'Carpentry & Joinery', 'बढ़ईगीरी और काष्ठकला', 'carpentry-joinery', 'Architectural woodwork, furniture joinery, shuttering and precision framing.', 4, 'Hammer', true),
  ('11111111-1111-1111-1111-111111111103', 'Plumbing & Sanitation', 'प्लंबिंग और स्वच्छता', 'plumbing-sanitation', 'Potable water networks, drainage engineering, sanitary fixtures and pressure systems.', 4, 'Wrench', true),
  ('11111111-1111-1111-1111-111111111104', 'Masonry & Construction', 'राजमिस्त्री और निर्माण', 'masonry-construction', 'Brickwork, concrete placement, structural plastering and tile laying.', 3, 'Building', true),
  ('11111111-1111-1111-1111-111111111105', 'Painting & Finishing', 'पेंटिंग और परिष्करण', 'painting-finishing', 'Surface preparation, moisture barrier coating, enamel and decorative finishes.', 3, 'Paintbrush', true),
  ('11111111-1111-1111-1111-111111111106', 'Welding & Fabrication', 'वेल्डिंग और फैब्रिकेशन', 'welding-fabrication', 'Arc welding, structural steel fabrication, grill assembly and pipe fitting.', 4, 'Flame', true),
  ('11111111-1111-1111-1111-111111111107', 'Fresh Produce & Vegetables', 'फल एवं सब्जी विक्रेता', 'fresh-produce-vegetables', 'Farm-fresh vegetable vending, seasonal fruit stalls, mobile produce carts, and wholesale procurement.', 3, 'Apple', true),
  ('11111111-1111-1111-1111-111111111108', 'Street Food & Tea', 'स्ट्रीट फूड एवं चाय नाश्ता', 'street-food-tea', 'Traditional tea preparation, regional street food delicacies, snacks, and mobile catering stalls.', 3, 'Coffee', true),
  ('11111111-1111-1111-1111-111111111109', 'Custom Tailoring & Apparel', 'सिलाई एवं परिधान', 'tailoring-apparel', 'Bespoke pattern cutting, traditional ethnic dressmaking, alterations, and home garment workshops.', 4, 'Scissors', true),
  ('11111111-1111-1111-1111-111111111110', 'Handicrafts & Pottery', 'हस्तशिल्प एवं मिट्टी के बर्तन', 'handicrafts-pottery', 'Terracotta pottery, cane & bamboo crafts, hand-loomed artifacts, and cultural souvenir vending.', 4, 'Sparkles', true),
  ('11111111-1111-1111-1111-111111111111', 'Footwear & Leather Care', 'जूता सिलाई एवं चमड़ा कार्य', 'footwear-leather-repair', 'Handmade leather footwear, sole stitching, cobbler services, and traditional leather restoration.', 3, 'ShieldCheck', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  hindi_name = EXCLUDED.hindi_name,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  is_active = true;

-- 5. SKILLS TABLE
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

-- 6. WORKER PROFILES TABLE
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
  district TEXT,
  locality TEXT,
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
  profile_type TEXT NOT NULL DEFAULT 'service_professional',
  business_name TEXT,
  vendor_type TEXT,
  stall_type TEXT DEFAULT 'fixed_stall',
  operating_hours TEXT,
  product_catalog JSONB NOT NULL DEFAULT '[]'::jsonb,
  delivery_available BOOLEAN NOT NULL DEFAULT false,
  contact_preference TEXT DEFAULT 'phone',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure all extended columns exist on worker_profiles
ALTER TABLE public.worker_profiles ADD COLUMN IF NOT EXISTS district TEXT;
ALTER TABLE public.worker_profiles ADD COLUMN IF NOT EXISTS locality TEXT;
ALTER TABLE public.worker_profiles ADD COLUMN IF NOT EXISTS profile_type TEXT NOT NULL DEFAULT 'service_professional';
ALTER TABLE public.worker_profiles ADD COLUMN IF NOT EXISTS business_name TEXT;
ALTER TABLE public.worker_profiles ADD COLUMN IF NOT EXISTS vendor_type TEXT;
ALTER TABLE public.worker_profiles ADD COLUMN IF NOT EXISTS stall_type TEXT DEFAULT 'fixed_stall';
ALTER TABLE public.worker_profiles ADD COLUMN IF NOT EXISTS operating_hours TEXT;
ALTER TABLE public.worker_profiles ADD COLUMN IF NOT EXISTS product_catalog JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.worker_profiles ADD COLUMN IF NOT EXISTS delivery_available BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.worker_profiles ADD COLUMN IF NOT EXISTS contact_preference TEXT DEFAULT 'phone';

CREATE UNIQUE INDEX IF NOT EXISTS idx_worker_profiles_user_id ON public.worker_profiles (user_id);
CREATE INDEX IF NOT EXISTS idx_worker_profiles_geo ON public.worker_profiles (state, district, city, pincode);
CREATE INDEX IF NOT EXISTS idx_worker_profiles_published ON public.worker_profiles (is_published);
CREATE INDEX IF NOT EXISTS idx_worker_profiles_profile_type ON public.worker_profiles (profile_type);

-- 7. WORKER SKILLS (Many-to-Many)
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

-- 8. CREDENTIAL REGISTRY (W3C Cryptographic Credentials)
CREATE TABLE IF NOT EXISTS public.credential_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registry_id TEXT NOT NULL UNIQUE,
  worker_profile_id UUID NOT NULL REFERENCES public.worker_profiles(id) ON DELETE CASCADE,
  canonical_payload_hash TEXT NOT NULL,
  signature TEXT NOT NULL,
  algorithm TEXT NOT NULL DEFAULT 'Ed25519',
  key_version TEXT NOT NULL DEFAULT 'v1',
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_credential_registry_id ON public.credential_registry (registry_id);
CREATE INDEX IF NOT EXISTS idx_credential_worker ON public.credential_registry (worker_profile_id);

-- 9. BOOKINGS TABLE (Customer & Service Requests)
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_reference TEXT NOT NULL UNIQUE,
  customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  worker_profile_id UUID NOT NULL REFERENCES public.worker_profiles(id) ON DELETE CASCADE,
  service_title TEXT NOT NULL,
  description TEXT,
  location_address TEXT NOT NULL,
  location_city TEXT NOT NULL,
  location_state TEXT DEFAULT 'Assam',
  location_pincode TEXT,
  scheduled_start TIMESTAMPTZ NOT NULL,
  scheduled_end TIMESTAMPTZ,
  estimated_cost NUMERIC NOT NULL DEFAULT 500,
  final_cost NUMERIC,
  platform_commission NUMERIC NOT NULL DEFAULT 0.00,
  status public.booking_status NOT NULL DEFAULT 'requested'::public.booking_status,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bookings_customer ON public.bookings (customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_worker ON public.bookings (worker_profile_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings (status);

-- 10. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  worker_profile_id UUID NOT NULL REFERENCES public.worker_profiles(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  is_verified_booking BOOLEAN NOT NULL DEFAULT TRUE,
  moderation_status TEXT NOT NULL DEFAULT 'approved',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reviews_worker ON public.reviews (worker_profile_id);

-- 11. CONTRACTOR JOBS / WORKFORCE OPPORTUNITIES
CREATE TABLE IF NOT EXISTS public.contractor_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  trade_category TEXT NOT NULL,
  required_workers INT NOT NULL DEFAULT 1,
  daily_wage NUMERIC NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  district TEXT,
  pincode TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contractor_jobs_geo ON public.contractor_jobs (state, district, city);

-- 12. CUSTOM LOCALITIES (Unlisted Rural Villages / Hamlets)
CREATE TABLE IF NOT EXISTS public.custom_localities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state TEXT NOT NULL,
  district TEXT NOT NULL,
  locality_name TEXT NOT NULL,
  pincode TEXT,
  reported_by_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending_review',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_custom_localities_state_dist ON public.custom_localities (state, district);

-- 13. SERVICE COVERAGE AREAS (Class B Controlled Rollout Boundary)
CREATE TABLE IF NOT EXISTS public.service_coverage_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state TEXT NOT NULL,
  district TEXT NOT NULL,
  city TEXT NOT NULL,
  pincode_prefix TEXT NOT NULL,
  is_dispatch_active BOOLEAN NOT NULL DEFAULT FALSE,
  operating_tier TEXT NOT NULL DEFAULT 'CLASS_B_CONTROLLED_ROLLOUT',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed Class B Rollout Zones (Guwahati & Shillong)
INSERT INTO public.service_coverage_areas (state, district, city, pincode_prefix, is_dispatch_active, operating_tier)
VALUES
  ('Assam', 'Kamrup Metropolitan', 'Guwahati', '781', true, 'CLASS_B_CONTROLLED_ROLLOUT'),
  ('Meghalaya', 'East Khasi Hills', 'Shillong', '793', true, 'CLASS_B_CONTROLLED_ROLLOUT')
ON CONFLICT DO NOTHING;

-- 14. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credential_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contractor_jobs ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view and edit their own profiles
DROP POLICY IF EXISTS "profiles_owner_access" ON public.profiles;
CREATE POLICY "profiles_owner_access" ON public.profiles
  FOR ALL USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_public_read" ON public.profiles;
CREATE POLICY "profiles_public_read" ON public.profiles
  FOR SELECT USING (true);

-- Worker Profiles: Public can view published profiles; Owners can manage
DROP POLICY IF EXISTS "worker_profiles_public_read" ON public.worker_profiles;
CREATE POLICY "worker_profiles_public_read" ON public.worker_profiles
  FOR SELECT USING (is_published = true OR auth.uid() = user_id);

DROP POLICY IF EXISTS "worker_profiles_owner_write" ON public.worker_profiles;
CREATE POLICY "worker_profiles_owner_write" ON public.worker_profiles
  FOR ALL USING (auth.uid() = user_id);

-- Credentials: Fully public verification
DROP POLICY IF EXISTS "credential_registry_public_read" ON public.credential_registry;
CREATE POLICY "credential_registry_public_read" ON public.credential_registry
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "credential_registry_service_insert" ON public.credential_registry;
CREATE POLICY "credential_registry_service_insert" ON public.credential_registry
  FOR ALL USING (true);

-- Bookings: Customers manage their bookings; Workers view bookings assigned to them
DROP POLICY IF EXISTS "bookings_customer_manage" ON public.bookings;
CREATE POLICY "bookings_customer_manage" ON public.bookings
  FOR ALL USING (auth.uid() = customer_id);

DROP POLICY IF EXISTS "bookings_worker_view" ON public.bookings;
CREATE POLICY "bookings_worker_view" ON public.bookings
  FOR SELECT USING (
    worker_profile_id IN (SELECT id FROM public.worker_profiles WHERE user_id = auth.uid())
  );

-- Contractor Jobs: Contractors manage their own postings; Public can discover open jobs
DROP POLICY IF EXISTS "contractor_jobs_public_read" ON public.contractor_jobs;
CREATE POLICY "contractor_jobs_public_read" ON public.contractor_jobs
  FOR SELECT USING (status = 'open' OR auth.uid() = contractor_id);

DROP POLICY IF EXISTS "contractor_jobs_owner_manage" ON public.contractor_jobs;
CREATE POLICY "contractor_jobs_owner_manage" ON public.contractor_jobs
  FOR ALL USING (auth.uid() = contractor_id);
