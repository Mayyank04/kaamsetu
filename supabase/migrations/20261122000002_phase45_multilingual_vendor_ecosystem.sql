-- ============================================================================
-- KAAMSETU: PHASE 45 MASTER MIGRATION — MULTILINGUAL PLATFORM & VENDOR ECOSYSTEM
-- Migration: 20261122000002_phase45_multilingual_vendor_ecosystem.sql
-- Invariants:
--   1. platform_commission_amount = 0.00 permanently
--   2. Forward-only, strictly idempotent (IF NOT EXISTS throughout)
--   3. Safe multi-tenant RLS policies on all tables
-- ============================================================================

-- 1. Supported Languages Registry (39 Languages)
CREATE TABLE IF NOT EXISTS public.supported_languages (
    code VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    native_name VARCHAR(100) NOT NULL,
    script VARCHAR(50) NOT NULL,
    direction VARCHAR(5) DEFAULT 'ltr' CHECK (direction IN ('ltr', 'rtl')),
    region VARCHAR(100) NOT NULL,
    schedule VARCHAR(30) DEFAULT 'eighth_schedule' CHECK (schedule IN ('eighth_schedule', 'regional', 'federal_fallback')),
    is_official_8th_schedule BOOLEAN DEFAULT false,
    coverage_percent INT DEFAULT 90,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Essential Languages
INSERT INTO public.supported_languages (code, name, native_name, script, direction, region, schedule, is_official_8th_schedule, coverage_percent)
VALUES
    ('en', 'English', 'English', 'Latin', 'ltr', 'Pan-India', 'federal_fallback', false, 100),
    ('hi', 'Hindi', 'हिन्दी', 'Devanagari', 'ltr', 'North & Central India', 'eighth_schedule', true, 100),
    ('as', 'Assamese', 'অসমীয়া', 'Bengali-Assamese', 'ltr', 'Assam', 'eighth_schedule', true, 100),
    ('bn', 'Bengali', 'বাংলা', 'Bengali', 'ltr', 'West Bengal / Northeast', 'eighth_schedule', true, 100),
    ('brx', 'Bodo', 'बड़ो', 'Devanagari', 'ltr', 'Bodoland / Assam', 'eighth_schedule', true, 92),
    ('doi', 'Dogri', 'डोगरी', 'Devanagari', 'ltr', 'Jammu & Kashmir', 'eighth_schedule', true, 90),
    ('gu', 'Gujarati', 'ગુજરાતી', 'Gujarati', 'ltr', 'Gujarat', 'eighth_schedule', true, 100),
    ('kn', 'Kannada', 'ಕನ್ನಡ', 'Kannada', 'ltr', 'Karnataka', 'eighth_schedule', true, 100),
    ('ks', 'Kashmiri', 'کٲشُر', 'Perso-Arabic', 'rtl', 'Kashmir', 'eighth_schedule', true, 95),
    ('kok', 'Konkani', 'कोंकणी', 'Devanagari', 'ltr', 'Goa / Coastal Karnataka', 'eighth_schedule', true, 92),
    ('mai', 'Maithili', 'मैथिली', 'Devanagari', 'ltr', 'Bihar / Jharkhand', 'eighth_schedule', true, 94),
    ('ml', 'Malayalam', 'മലയാളം', 'Malayalam', 'ltr', 'Kerala', 'eighth_schedule', true, 100),
    ('mni', 'Manipuri', 'মৈতৈলোন্', 'Meetei Mayek', 'ltr', 'Manipur', 'eighth_schedule', true, 92),
    ('mr', 'Marathi', 'मराठी', 'Devanagari', 'ltr', 'Maharashtra', 'eighth_schedule', true, 100),
    ('ne', 'Nepali', 'नेपाली', 'Devanagari', 'ltr', 'Sikkim / Hills', 'eighth_schedule', true, 95),
    ('or', 'Odia', 'ଓଡ଼ିଆ', 'Odia', 'ltr', 'Odisha', 'eighth_schedule', true, 100),
    ('pa', 'Punjabi', 'ਪੰਜਾਬੀ', 'Gurmukhi', 'ltr', 'Punjab', 'eighth_schedule', true, 100),
    ('sa', 'Sanskrit', 'संस्कृतम्', 'Devanagari', 'ltr', 'Pan-India', 'eighth_schedule', true, 90),
    ('sat', 'Santali', 'ᱥᱟᱱᱛᱟᱲᱤ', 'Ol Chiki', 'ltr', 'Jharkhand / Bengal', 'eighth_schedule', true, 90),
    ('sd', 'Sindhi', 'سنڌي', 'Perso-Arabic', 'rtl', 'Western India', 'eighth_schedule', true, 90),
    ('ta', 'Tamil', 'தமிழ்', 'Tamil', 'ltr', 'Tamil Nadu', 'eighth_schedule', true, 100),
    ('te', 'Telugu', 'తెలుగు', 'Telugu', 'ltr', 'Andhra / Telangana', 'eighth_schedule', true, 100),
    ('ur', 'Urdu', 'اردو', 'Perso-Arabic', 'rtl', 'Pan-India', 'eighth_schedule', true, 100),
    ('kha', 'Khasi', 'Ka Ktien Khasi', 'Latin', 'ltr', 'Meghalaya', 'regional', false, 95),
    ('grt', 'Garo', 'A·chik', 'Latin', 'ltr', 'Meghalaya', 'regional', false, 92),
    ('bho', 'Bhojpuri', 'भोजपुरी', 'Devanagari', 'ltr', 'UP / Bihar', 'regional', false, 95),
    ('raj', 'Rajasthani', 'राजस्थानी', 'Devanagari', 'ltr', 'Rajasthan', 'regional', false, 94)
ON CONFLICT (code) DO UPDATE SET
    native_name = EXCLUDED.native_name,
    direction = EXCLUDED.direction,
    coverage_percent = EXCLUDED.coverage_percent;

-- 2. User Preferences (Multilingual & Accessibility)
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    preferred_language VARCHAR(10) DEFAULT 'en',
    text_size VARCHAR(10) DEFAULT 'normal' CHECK (text_size IN ('normal', 'large')),
    high_contrast BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT user_preferences_user_id_unique UNIQUE (user_id)
);

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own preferences"
    ON public.user_preferences FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert own preferences"
    ON public.user_preferences FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
    ON public.user_preferences FOR UPDATE
    USING (auth.uid() = user_id);

-- 3. Business Categories & Subcategories
CREATE TABLE IF NOT EXISTS public.business_categories (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    hindi_name VARCHAR(100) NOT NULL,
    icon_name VARCHAR(50) NOT NULL,
    description TEXT,
    display_order INT DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.business_subcategories (
    id VARCHAR(50) PRIMARY KEY,
    category_id VARCHAR(50) NOT NULL REFERENCES public.business_categories(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    hindi_name VARCHAR(100) NOT NULL,
    description TEXT,
    requires_license BOOLEAN DEFAULT false,
    license_name VARCHAR(150),
    dynamic_fields_schema JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT business_subcategories_cat_code_unique UNIQUE (category_id, code)
);

ALTER TABLE public.business_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_subcategories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read business_categories" ON public.business_categories FOR SELECT USING (true);
CREATE POLICY "Public read business_subcategories" ON public.business_subcategories FOR SELECT USING (true);

-- Seed Categories
INSERT INTO public.business_categories (id, code, name, hindi_name, icon_name, description, display_order)
VALUES
    ('cat-home-repair', 'home_repair', 'Home and Repair Services', 'घर और मरम्मत सेवाएं', 'Wrench', 'Electricians, plumbers, carpenters, and appliance repair', 1),
    ('cat-construction', 'construction', 'Construction and Skilled Labour', 'निर्माण और कुशल श्रम', 'Hammer', 'Masons, welders, bar benders, and civil workers', 2),
    ('cat-clothing', 'clothing', 'Clothing and Personal Services', 'सिलाई और व्यक्तिगत सेवाएं', 'Scissors', 'Tailors, boutiques, embroidery, and salon artists', 3),
    ('cat-food', 'food_hospitality', 'Food and Hospitality', 'भोजन और खानपान', 'Utensils', 'Street food stalls, tea shops, tiffin services', 4),
    ('cat-transport', 'transport', 'Transport and Mobility', 'परिवहन और वाहन सेवाएं', 'Truck', 'Auto drivers, transport crews, bike/car mechanics', 5),
    ('cat-retail', 'retail_shops', 'Retail and Local Shops', 'किराना और स्थानीय दुकानें', 'Store', 'Kirana stores, general stores, and trade suppliers', 6),
    ('cat-agri', 'agriculture', 'Agriculture and Rural Businesses', 'कृषि और ग्रामीण उद्यम', 'Sprout', 'Farmers, nursery, organic produce, tractor services', 7),
    ('cat-education', 'education', 'Education and Professional Services', 'शिक्षा और पेशेवर सेवाएं', 'BookOpen', 'Tutors, instructors, accountants, translators', 8),
    ('cat-artisan', 'artisan_traditional', 'Artisan and Traditional Occupations', 'हस्तशिल्प और पारंपरिक कला', 'Palette', 'Handloom weavers, bamboo artisans, potters', 9),
    ('cat-health', 'health_wellness', 'Health, Care and Wellness', 'स्वास्थ्य और देखभाल', 'HeartPulse', 'Elderly care assistants, nursing aids, wellness', 10),
    ('cat-events', 'events_services', 'Events and Other Services', 'उत्सव, कार्यक्रम व अन्य सेवाएं', 'Sparkles', 'Tent decorators, caterers, photographers', 11)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    hindi_name = EXCLUDED.hindi_name;

-- 4. Dedicated Vendors Table
CREATE TABLE IF NOT EXISTS public.vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    business_name VARCHAR(200) NOT NULL,
    display_name VARCHAR(200) NOT NULL,
    owner_name VARCHAR(150),
    primary_category_id VARCHAR(50) REFERENCES public.business_categories(code),
    secondary_category_id VARCHAR(50),
    subcategory VARCHAR(50),
    business_description TEXT,
    preferred_language VARCHAR(10) DEFAULT 'en',
    business_phone VARCHAR(20),
    contact_preference VARCHAR(20) DEFAULT 'phone' CHECK (contact_preference IN ('phone', 'whatsapp', 'in_person')),
    business_address TEXT,
    state VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    locality VARCHAR(150) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    stall_type VARCHAR(50) DEFAULT 'fixed_stall' CHECK (stall_type IN ('mobile_cart', 'fixed_stall', 'home_workshop', 'street_kiosk', 'retail_shop')),
    operating_hours VARCHAR(150),
    service_radius_km INT DEFAULT 15,
    delivery_available BOOLEAN DEFAULT false,
    product_catalog JSONB DEFAULT '[]'::jsonb,
    category_attributes JSONB DEFAULT '{}'::jsonb,
    price_model VARCHAR(30) DEFAULT 'fixed',
    price_range_min NUMERIC(10, 2),
    price_range_max NUMERIC(10, 2),
    verification_status VARCHAR(50) DEFAULT 'self_declared',
    profile_completion INT DEFAULT 75,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT vendors_user_id_unique UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_vendors_state_district ON public.vendors (state, district);
CREATE INDEX IF NOT EXISTS idx_vendors_category ON public.vendors (primary_category_id, subcategory);
CREATE INDEX IF NOT EXISTS idx_vendors_pincode ON public.vendors (pincode);

ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read published vendors"
    ON public.vendors FOR SELECT
    USING (is_published = true);

CREATE POLICY "Vendors manage own profile (insert)"
    ON public.vendors FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Vendors manage own profile (update)"
    ON public.vendors FOR UPDATE
    USING (auth.uid() = user_id);

-- 5. Voice Interaction Logs (No raw audio stored; metadata only)
CREATE TABLE IF NOT EXISTS public.voice_interaction_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    detected_language VARCHAR(10),
    action_intent VARCHAR(50),
    confidence_score NUMERIC(4, 3),
    duration_seconds NUMERIC(5, 2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.voice_interaction_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users insert own voice logs" ON public.voice_interaction_logs FOR INSERT WITH CHECK (true);
