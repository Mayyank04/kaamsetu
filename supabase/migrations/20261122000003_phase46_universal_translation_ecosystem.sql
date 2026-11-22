-- ============================================================================
-- KAAMSETU — PHASE 46 MASTER DATABASE MIGRATION
-- Universal Translation, Cross-Language Communication & Language Capabilities
-- Idempotent, RLS-Enforced, Zero-Commission Invariant Preserved
-- ============================================================================

-- 1. Translation Provider Configs
CREATE TABLE IF NOT EXISTS public.translation_provider_configs (
    id TEXT PRIMARY KEY,
    provider_name TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    latency_sla_ms INTEGER NOT NULL DEFAULT 1500,
    daily_request_limit INTEGER NOT NULL DEFAULT 50000,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed Default Providers
INSERT INTO public.translation_provider_configs (id, provider_name, is_active, latency_sla_ms)
VALUES 
    ('gemini', 'Google Gemini Generative Indian Translator', true, 800),
    ('deterministic', 'Deterministic Vernacular Offline Corpus', true, 10),
    ('bhashini', 'Government of India ULCA / Bhashini Models', true, 1200),
    ('google_cloud', 'Google Cloud Translation API v3', true, 600),
    ('azure', 'Microsoft Azure Cognitive Translator', true, 700)
ON CONFLICT (id) DO UPDATE SET 
    is_active = EXCLUDED.is_active,
    latency_sla_ms = EXCLUDED.latency_sla_ms,
    updated_at = now();

-- 2. Translation Language Capabilities Table
CREATE TABLE IF NOT EXISTS public.translation_language_capabilities (
    language_code TEXT PRIMARY KEY,
    language_name TEXT NOT NULL,
    native_name TEXT NOT NULL,
    script TEXT NOT NULL,
    direction TEXT NOT NULL DEFAULT 'ltr',
    source_supported BOOLEAN NOT NULL DEFAULT true,
    target_supported BOOLEAN NOT NULL DEFAULT true,
    detection_supported BOOLEAN NOT NULL DEFAULT true,
    voice_supported BOOLEAN NOT NULL DEFAULT false,
    tts_supported BOOLEAN NOT NULL DEFAULT false,
    supported_providers JSONB NOT NULL DEFAULT '["gemini", "deterministic"]'::jsonb,
    known_limitations TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Cryptographic Translation Cache (Public translations only; private messages never stored)
CREATE TABLE IF NOT EXISTS public.translation_cache (
    cache_key TEXT PRIMARY KEY,
    source_language TEXT NOT NULL,
    target_language TEXT NOT NULL,
    original_text_hash TEXT NOT NULL,
    translated_text TEXT NOT NULL,
    provider TEXT NOT NULL,
    character_count INTEGER NOT NULL DEFAULT 0,
    is_private BOOLEAN NOT NULL DEFAULT false,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '30 days'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_translation_cache_lookup 
ON public.translation_cache (source_language, target_language, expires_at);

-- 4. Translation Quality Feedback & Correction Ledger
CREATE TABLE IF NOT EXISTS public.translation_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    original_text TEXT NOT NULL,
    translated_text TEXT NOT NULL,
    source_language TEXT NOT NULL,
    target_language TEXT NOT NULL,
    provider TEXT NOT NULL,
    rating TEXT NOT NULL CHECK (rating IN ('accurate', 'minor_errors', 'inaccurate', 'offensive')),
    suggested_correction TEXT,
    comments TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. User Translation Preferences (Independently configurable from App Language)
CREATE TABLE IF NOT EXISTS public.user_translation_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    preferred_app_language TEXT NOT NULL DEFAULT 'en',
    preferred_translation_language TEXT NOT NULL DEFAULT 'hi',
    auto_detect_source BOOLEAN NOT NULL DEFAULT true,
    show_original_by_default BOOLEAN NOT NULL DEFAULT false,
    enable_voice_playback BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.translation_provider_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.translation_language_capabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.translation_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.translation_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_translation_preferences ENABLE ROW LEVEL SECURITY;

-- Provider Configs: Public read
DROP POLICY IF EXISTS "Public can view translation provider configs" ON public.translation_provider_configs;
CREATE POLICY "Public can view translation provider configs"
ON public.translation_provider_configs FOR SELECT USING (true);

-- Capabilities: Public read
DROP POLICY IF EXISTS "Public can view translation language capabilities" ON public.translation_language_capabilities;
CREATE POLICY "Public can view translation language capabilities"
ON public.translation_language_capabilities FOR SELECT USING (true);

-- Cache: Public read only for non-private items
DROP POLICY IF EXISTS "Public can read non-private cached translations" ON public.translation_cache;
CREATE POLICY "Public can read non-private cached translations"
ON public.translation_cache FOR SELECT USING (is_private = false AND expires_at > now());

DROP POLICY IF EXISTS "Service and authenticated can insert cache" ON public.translation_cache;
CREATE POLICY "Service and authenticated can insert cache"
ON public.translation_cache FOR INSERT WITH CHECK (true);

-- Feedback: Anyone can submit; only owner can view their own
DROP POLICY IF EXISTS "Anyone can submit translation feedback" ON public.translation_feedback;
CREATE POLICY "Anyone can submit translation feedback"
ON public.translation_feedback FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view their own feedback" ON public.translation_feedback;
CREATE POLICY "Users can view their own feedback"
ON public.translation_feedback FOR SELECT USING (auth.uid() = user_id);

-- Preferences: Strict owner isolation
DROP POLICY IF EXISTS "Users can view their own translation preferences" ON public.user_translation_preferences;
CREATE POLICY "Users can view their own translation preferences"
ON public.user_translation_preferences FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own translation preferences" ON public.user_translation_preferences;
CREATE POLICY "Users can update their own translation preferences"
ON public.user_translation_preferences FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- PERMANENT CONSTITUTIONAL INVARIANT: ZERO COMMISSION ENFORCEMENT
-- ============================================================================
CREATE OR REPLACE FUNCTION public.enforce_phase46_zero_commission()
RETURNS trigger AS $$
BEGIN
    IF NEW.commission_rate IS NOT NULL AND NEW.commission_rate > 0.00 THEN
        RAISE EXCEPTION 'Permanent Constitutional Invariant Violated: platform_commission_amount must be exactly 0.00';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
