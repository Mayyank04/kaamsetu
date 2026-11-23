-- ============================================================================
-- KAAMSETU — PHASE 48: MASTER ENGINEERING RECOVERY SCHEMA ADDITIONS
-- 1. Extends public.app_role enum to officially support 'vendor'
-- 2. Ensures otp_challenges and user_consents tables have necessary columns
-- ============================================================================

DO $$
BEGIN
    ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'vendor';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
