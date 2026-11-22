-- ============================================================================
-- KAAMSETU: PHASE 47 MASTER MIGRATION — PRODUCT EXPERIENCE EXCELLENCE
-- Migration: 20261122000004_phase47_product_experience_excellence.sql
-- Invariants:
--   1. platform_commission_amount = 0.00 permanently
--   2. Forward-only, strictly idempotent (IF NOT EXISTS / DO blocks)
--   3. Strict Row Level Security on all user and draft tables
-- ============================================================================

-- 1. Extend vendors table with services_catalog, business_images, and draft state
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'vendors' AND column_name = 'services_catalog'
    ) THEN
        ALTER TABLE public.vendors ADD COLUMN services_catalog JSONB DEFAULT '[]'::jsonb;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'vendors' AND column_name = 'business_images'
    ) THEN
        ALTER TABLE public.vendors ADD COLUMN business_images JSONB DEFAULT '[]'::jsonb;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'vendors' AND column_name = 'is_draft'
    ) THEN
        ALTER TABLE public.vendors ADD COLUMN is_draft BOOLEAN DEFAULT false;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'vendors' AND column_name = 'draft_step'
    ) THEN
        ALTER TABLE public.vendors ADD COLUMN draft_step INT DEFAULT 1;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'vendors' AND column_name = 'draft_data'
    ) THEN
        ALTER TABLE public.vendors ADD COLUMN draft_data JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- 2. Dedicated Vendor Drafts Table (Auto-save & Resume across devices)
CREATE TABLE IF NOT EXISTS public.vendor_drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    draft_step INT DEFAULT 1,
    draft_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT vendor_drafts_user_unique UNIQUE (user_id)
);

ALTER TABLE public.vendor_drafts ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'vendor_drafts' AND policyname = 'Users manage own vendor draft'
    ) THEN
        CREATE POLICY "Users manage own vendor draft"
            ON public.vendor_drafts FOR ALL
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- 3. Dedicated Customer Search History Table (Local-first / Privacy-safe)
CREATE TABLE IF NOT EXISTS public.customer_recent_searches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    search_query VARCHAR(255) NOT NULL,
    category_filter VARCHAR(50),
    location_filter VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.customer_recent_searches ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'customer_recent_searches' AND policyname = 'Users view own searches'
    ) THEN
        CREATE POLICY "Users view own searches"
            ON public.customer_recent_searches FOR SELECT
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'customer_recent_searches' AND policyname = 'Users insert own searches'
    ) THEN
        CREATE POLICY "Users insert own searches"
            ON public.customer_recent_searches FOR INSERT
            WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- 4. Re-affirm Zero Commission Ledger Invariant
COMMENT ON TABLE public.vendors IS 'Permanent platform commission = 0.00 on artisan goods and services.';
