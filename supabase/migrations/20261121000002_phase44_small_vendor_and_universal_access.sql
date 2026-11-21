-- ============================================================================
-- KAAMSETU — PHASE 44: SMALL VENDOR ARCHITECTURE & UNIVERSAL ACCESS
-- Migration: 20261121000002_phase44_small_vendor_and_universal_access.sql
-- Classification: CLASS_B_CONTROLLED_ROLLOUT with Decoupled Vendor & Artisan Registry
-- Permanent Invariant: platform_commission_amount = 0.00
-- ============================================================================

-- 1. ADD SMALL VENDOR COLUMNS TO WORKER PROFILES
ALTER TABLE public.worker_profiles
  ADD COLUMN IF NOT EXISTS profile_type TEXT NOT NULL DEFAULT 'service_professional'
    CHECK (profile_type IN ('service_professional', 'goods_vendor', 'hybrid_artisan')),
  ADD COLUMN IF NOT EXISTS business_name TEXT,
  ADD COLUMN IF NOT EXISTS vendor_type TEXT,
  ADD COLUMN IF NOT EXISTS stall_type TEXT DEFAULT 'fixed_stall',
  ADD COLUMN IF NOT EXISTS operating_hours TEXT,
  ADD COLUMN IF NOT EXISTS product_catalog JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS delivery_available BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS contact_preference TEXT DEFAULT 'phone'
    CHECK (contact_preference IN ('phone', 'whatsapp', 'in_person', 'any'));

-- Fast indexes for discovery filtering
CREATE INDEX IF NOT EXISTS idx_worker_profiles_profile_type
  ON public.worker_profiles (profile_type);

CREATE INDEX IF NOT EXISTS idx_worker_profiles_vendor_type
  ON public.worker_profiles (vendor_type);

-- 2. SEED VENDOR & ARTISAN OCCUPATIONS
INSERT INTO public.occupations (id, name, hindi_name, slug, description, nsqf_level, icon_name, is_active)
VALUES
  (
    '11111111-1111-1111-1111-111111111107',
    'Fresh Produce & Vegetables',
    'फल एवं सब्जी विक्रेता',
    'fresh-produce-vegetables',
    'Farm-fresh vegetable vending, seasonal fruit stalls, mobile produce carts, and local wholesale procurement.',
    3,
    'Apple',
    true
  ),
  (
    '11111111-1111-1111-1111-111111111108',
    'Street Food, Tea & Refreshments',
    'स्ट्रीट फूड एवं चाय नाश्ता',
    'street-food-tea',
    'Traditional tea preparation, regional street food delicacies, snacks, and hygienic mobile catering stalls.',
    3,
    'Coffee',
    true
  ),
  (
    '11111111-1111-1111-1111-111111111109',
    'Custom Tailoring & Apparel',
    'सिलाई एवं परिधान',
    'tailoring-apparel',
    'Bespoke pattern cutting, traditional ethnic dressmaking, alterations, and home-based garment workshops.',
    4,
    'Scissors',
    true
  ),
  (
    '11111111-1111-1111-1111-111111111110',
    'Handicrafts & Pottery',
    'हस्तशिल्प एवं मिट्टी के बर्तन',
    'handicrafts-pottery',
    'Terracotta pottery, cane & bamboo crafts, hand-loomed artifact creation, and cultural souvenir vending.',
    4,
    'Sparkles',
    true
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    'Footwear & Leather Care',
    'जूता सिलाई एवं चमड़ा कार्य',
    'footwear-leather-repair',
    'Handmade leather footwear, sole stitching, cobbler services, and traditional leather goods restoration.',
    3,
    'ShieldCheck',
    true
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  hindi_name = EXCLUDED.hindi_name,
  description = EXCLUDED.description,
  is_active = true;

-- 3. ENSURE UNRESTRICTED ACCESS FOR VENDOR PROFILE DISCOVERY
-- Grant read access to published vendor profiles
DROP POLICY IF EXISTS "Public can view published worker profiles" ON public.worker_profiles;
CREATE POLICY "Public can view published worker profiles"
  ON public.worker_profiles
  FOR SELECT
  USING (is_published = true);
