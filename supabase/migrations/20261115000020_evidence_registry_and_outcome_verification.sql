-- Migration 20: Independent Evidence Registry & Worker Outcome Verification
-- Branch: phase-19-independent-evidence-and-production-assurance
-- Description: Establishes schemas for the central immutable evidence registry and granular worker outcome milestones with strict 0% commission invariants.

-- 1. Evidence Registry Records (Central immutable registry of platform claims, provenance, and verification states)
CREATE TABLE IF NOT EXISTS public.evidence_registry_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id TEXT NOT NULL UNIQUE,
    claim_description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'enterprise_pilot', 'erp_integration', 'ondc_network', 'onest_dsep',
        'responsible_finance', 'worker_outcome', 'commercial_revenue', 'regional_gate',
        'security_dpdp', 'multi_region_dr', 'observability', 'worker_sovereignty'
    )),
    source_system TEXT NOT NULL,
    evidence_location TEXT NOT NULL,
    evidence_sha256 TEXT NOT NULL,
    collection_timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    verification_timestamp TIMESTAMPTZ,
    verifier_role TEXT NOT NULL DEFAULT 'independent_auditor',
    scope_and_limitations TEXT NOT NULL,
    expiry_date TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'unverified' CHECK (status IN (
        'unverified', 'self_reported', 'system_observed', 'partner_confirmed',
        'independently_verified', 'expired', 'disputed', 'rejected'
    )),
    is_public_safe BOOLEAN NOT NULL DEFAULT true,
    redacted_summary TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexing for evidence queries
CREATE INDEX IF NOT EXISTS idx_evidence_registry_category ON public.evidence_registry_records (category);
CREATE INDEX IF NOT EXISTS idx_evidence_registry_status ON public.evidence_registry_records (status);
CREATE INDEX IF NOT EXISTS idx_evidence_registry_public_safe ON public.evidence_registry_records (is_public_safe);

-- Enable RLS
ALTER TABLE public.evidence_registry_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Admins manage all; public can read public-safe entries
CREATE POLICY "evidence_registry_admin_access"
    ON public.evidence_registry_records
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'::app_role
        )
    );

CREATE POLICY "evidence_registry_public_read_safe"
    ON public.evidence_registry_records
    FOR SELECT
    TO anon, authenticated
    USING (is_public_safe = true);


-- 2. Worker Outcome Milestones (Granular milestone tracking from opportunity receipt to confirmed payment)
CREATE TABLE IF NOT EXISTS public.worker_outcome_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    opportunity_id TEXT,
    milestone_step TEXT NOT NULL CHECK (milestone_step IN (
        'opportunity_received', 'opportunity_accepted', 'booking_confirmed',
        'work_started', 'work_completed', 'customer_confirmed',
        'gross_wages_agreed', 'gross_wages_paid', 'disputed', 'retracted'
    )),
    agreed_wage_amount NUMERIC(10, 2) CHECK (agreed_wage_amount >= 0),
    paid_wage_amount NUMERIC(10, 2) CHECK (paid_wage_amount >= 0),
    platform_commission_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (platform_commission_amount = 0.00), -- CONSTITUTIONAL 0% COMMISSION INVARIANT
    provenance_state TEXT NOT NULL DEFAULT 'self_reported' CHECK (provenance_state IN (
        'self_reported', 'worker_confirmed', 'customer_confirmed',
        'payment_documented', 'independently_verified', 'disputed', 'retracted'
    )),
    payment_evidence_ref TEXT,
    payment_evidence_hash TEXT,
    dispute_reason TEXT,
    milestone_timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexing for worker outcomes
CREATE INDEX IF NOT EXISTS idx_worker_outcomes_worker_id ON public.worker_outcome_milestones (worker_id);
CREATE INDEX IF NOT EXISTS idx_worker_outcomes_step ON public.worker_outcome_milestones (milestone_step);
CREATE INDEX IF NOT EXISTS idx_worker_outcomes_provenance ON public.worker_outcome_milestones (provenance_state);

-- Enable RLS
ALTER TABLE public.worker_outcome_milestones ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Workers manage own records; admins manage all
CREATE POLICY "worker_manage_own_outcome_milestones"
    ON public.worker_outcome_milestones
    FOR ALL
    TO authenticated
    USING (worker_id = auth.uid())
    WITH CHECK (worker_id = auth.uid());

CREATE POLICY "admin_manage_all_outcome_milestones"
    ON public.worker_outcome_milestones
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'::app_role
        )
    );
