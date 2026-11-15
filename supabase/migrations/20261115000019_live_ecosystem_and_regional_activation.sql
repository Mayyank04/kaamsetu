-- Migration 19: Live Ecosystem Onboarding, Enterprise Pilot Execution & Responsible Tool Finance
-- Branch: phase-18-live-ecosystem-and-regional-activation
-- Description: Establishes schema for live ONDC/ONest participant registry credentials, enterprise ERP pilots (Assam & Meghalaya), and worker tool financing applications under RBI digital lending directions.

-- 1. Live Ecosystem Participants (ONDC BPP, ONest DSEP, GeM credentials & staging approval logs)
CREATE TABLE IF NOT EXISTS public.live_ecosystem_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    network_type TEXT NOT NULL CHECK (network_type IN ('ondc', 'onest', 'gem', 'dsep')),
    participant_id TEXT NOT NULL UNIQUE, -- e.g. 'kaamsetu.live.bpp.ondc'
    subscriber_id TEXT NOT NULL,
    signing_public_key TEXT NOT NULL, -- Ed25519 signing public key in Base64
    enc_public_key TEXT NOT NULL, -- X25519 encryption public key in Base64
    callback_url TEXT NOT NULL,
    lifecycle_status TEXT NOT NULL DEFAULT 'prepared' CHECK (lifecycle_status IN (
        'not_started', 'research', 'prepared', 'submitted', 'awaiting_approval',
        'sandbox_active', 'sandbox_validated', 'pre_prod_validated',
        'production_approved', 'production_active', 'suspended', 'failed'
    )),
    staging_passed BOOLEAN NOT NULL DEFAULT false,
    staging_verified_at TIMESTAMPTZ,
    pre_prod_passed BOOLEAN NOT NULL DEFAULT false,
    pre_prod_verified_at TIMESTAMPTZ,
    council_approval_ref TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexing for fast participant lookups
CREATE INDEX IF NOT EXISTS idx_live_ecosystem_network_type ON public.live_ecosystem_participants (network_type);
CREATE INDEX IF NOT EXISTS idx_live_ecosystem_subscriber_id ON public.live_ecosystem_participants (subscriber_id);
CREATE INDEX IF NOT EXISTS idx_live_ecosystem_status ON public.live_ecosystem_participants (lifecycle_status);

-- Enable RLS
ALTER TABLE public.live_ecosystem_participants ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Administrative management & read
CREATE POLICY "live_ecosystem_participants_admin_access"
    ON public.live_ecosystem_participants
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'::app_role
        )
    );

CREATE POLICY "live_ecosystem_participants_public_read_active"
    ON public.live_ecosystem_participants
    FOR SELECT
    TO anon, authenticated
    USING (lifecycle_status IN ('sandbox_validated', 'pre_prod_validated', 'production_approved', 'production_active'));


-- 2. Enterprise Pilot Engagements (Assam & Meghalaya EPC Contractors, SAP SuccessFactors, GeM Form B)
CREATE TABLE IF NOT EXISTS public.enterprise_pilot_engagements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enterprise_name TEXT NOT NULL,
    enterprise_tax_id TEXT NOT NULL, -- GSTIN or PAN reference
    region_code TEXT NOT NULL DEFAULT 'IN-AS',
    erp_system TEXT NOT NULL CHECK (erp_system IN ('sap_successfactors', 'oracle_fusion', 'gem_contract', 'custom_odata')),
    pilot_agreement_ref TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'consented', 'pilot_active', 'pilot_completed', 'suspended', 'terminated')),
    enrolled_worker_count INTEGER NOT NULL DEFAULT 0 CHECK (enrolled_worker_count >= 0),
    consented_roster_count INTEGER NOT NULL DEFAULT 0 CHECK (consented_roster_count >= 0),
    synced_records_count INTEGER NOT NULL DEFAULT 0 CHECK (synced_records_count >= 0),
    gem_form_b_certified BOOLEAN NOT NULL DEFAULT false,
    pilot_start_date DATE,
    pilot_end_date DATE,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexing for enterprise pilots
CREATE INDEX IF NOT EXISTS idx_enterprise_pilots_region ON public.enterprise_pilot_engagements (region_code);
CREATE INDEX IF NOT EXISTS idx_enterprise_pilots_status ON public.enterprise_pilot_engagements (status);
CREATE INDEX IF NOT EXISTS idx_enterprise_pilots_erp ON public.enterprise_pilot_engagements (erp_system);

-- Enable RLS
ALTER TABLE public.enterprise_pilot_engagements ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Restricted to platform admins
CREATE POLICY "enterprise_pilot_engagements_admin_access"
    ON public.enterprise_pilot_engagements
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'::app_role
        )
    );


-- 3. Tool Financing Pilot Applications (RBI Digital Lending compliant, non-credit-scored, 0% platform commission)
CREATE TABLE IF NOT EXISTS public.tool_financing_pilot_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    nbfc_partner_id TEXT NOT NULL,
    toolkit_type TEXT NOT NULL CHECK (toolkit_type IN ('electrical_tooling', 'solar_installation_kit', 'plumbing_kit', 'carpentry_power_set', 'masonry_precision_pack')),
    requested_amount NUMERIC(10, 2) NOT NULL CHECK (requested_amount > 0 AND requested_amount <= 30000.00),
    approved_amount NUMERIC(10, 2) CHECK (approved_amount >= 0),
    annual_percentage_rate NUMERIC(5, 2) NOT NULL CHECK (annual_percentage_rate >= 0.00 AND annual_percentage_rate <= 14.00), -- APR capped at <= 14% p.a.
    tenure_months INTEGER NOT NULL CHECK (tenure_months BETWEEN 3 AND 18),
    kfs_disclosed BOOLEAN NOT NULL DEFAULT true,
    kfs_hash TEXT NOT NULL,
    worker_consent_recorded BOOLEAN NOT NULL DEFAULT true,
    worker_consent_timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    cooling_off_period_days INTEGER NOT NULL DEFAULT 3 CHECK (cooling_off_period_days >= 3),
    platform_commission_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (platform_commission_amount = 0.00), -- CONSTITUTIONAL 0% COMMISSION
    status TEXT NOT NULL DEFAULT 'applied' CHECK (status IN ('applied', 'kfs_signed', 'underwriting_review', 'disbursed', 'active_repayment', 'closed', 'rejected', 'cancelled_in_cooling_off')),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexing for worker tool financing
CREATE INDEX IF NOT EXISTS idx_tool_financing_worker ON public.tool_financing_pilot_applications (worker_id);
CREATE INDEX IF NOT EXISTS idx_tool_financing_status ON public.tool_financing_pilot_applications (status);
CREATE INDEX IF NOT EXISTS idx_tool_financing_nbfc ON public.tool_financing_pilot_applications (nbfc_partner_id);

-- Enable RLS
ALTER TABLE public.tool_financing_pilot_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Workers manage/read own applications; platform admins manage all
CREATE POLICY "worker_manage_own_tool_financing"
    ON public.tool_financing_pilot_applications
    FOR ALL
    TO authenticated
    USING (worker_id = auth.uid())
    WITH CHECK (worker_id = auth.uid());

CREATE POLICY "admin_manage_all_tool_financing"
    ON public.tool_financing_pilot_applications
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'::app_role
        )
    );
