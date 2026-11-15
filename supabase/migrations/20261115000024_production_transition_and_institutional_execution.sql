-- Migration 24: Production Transition, Institutional Execution & Class A Readiness Assurance
-- Phase 23: Pillars A, D, G, M
-- 
-- Adds:
-- 1. production_release_manifests (Pillar A: Formal Release Manifests & Deployment Telemetry)
-- 2. enterprise_pilot_authorizations (Pillar D: 10-Gate Pilot Authorization & Anti-Conflation Controls)
-- 3. worker_impact_evaluations (Pillar G: Longitudinal Worker Outcome & Net Take-Home Impact Studies)
-- 4. class_a_readiness_audits (Pillar M: 12-Requirement Formal Class A Readiness Audit Ledger)

-- ============================================================================
-- 1. PRODUCTION RELEASE MANIFESTS (Pillar A)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.production_release_manifests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    commit_sha TEXT NOT NULL,
    build_artifact TEXT NOT NULL,
    migration_version TEXT NOT NULL,
    environment TEXT NOT NULL CHECK (
        environment IN (
            'development',
            'staging',
            'preproduction',
            'production_ready',
            'approved_for_release',
            'deployed',
            'rolled_back',
            'blocked'
        )
    ),
    configuration_version TEXT NOT NULL,
    dependency_versions JSONB NOT NULL DEFAULT '{}'::jsonb,
    security_scan_result JSONB NOT NULL DEFAULT '{}'::jsonb,
    approval_owner TEXT NOT NULL,
    deployment_status TEXT NOT NULL CHECK (
        deployment_status IN (
            'development',
            'staging',
            'preproduction',
            'production_ready',
            'approved_for_release',
            'deployed',
            'rolled_back',
            'blocked'
        )
    ),
    rollback_plan TEXT NOT NULL,
    evidence_digest TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_prod_release_manifests_commit ON public.production_release_manifests(commit_sha);
CREATE INDEX IF NOT EXISTS idx_prod_release_manifests_env ON public.production_release_manifests(environment);
CREATE INDEX IF NOT EXISTS idx_prod_release_manifests_status ON public.production_release_manifests(deployment_status);

ALTER TABLE public.production_release_manifests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read release manifests"
    ON public.production_release_manifests FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Service role and admins can manage release manifests"
    ON public.production_release_manifests FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ============================================================================
-- 2. ENTERPRISE PILOT AUTHORIZATIONS (Pillar D)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.enterprise_pilot_authorizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pilot_name TEXT NOT NULL,
    partner_name TEXT NOT NULL,
    counterparty_verified BOOLEAN NOT NULL DEFAULT false,
    authorized_signatory_verified BOOLEAN NOT NULL DEFAULT false,
    executed_agreement_ref TEXT,
    agreement_status TEXT NOT NULL DEFAULT 'draft' CHECK (
        agreement_status IN ('draft', 'under_review', 'legal_clearance', 'pending_execution', 'executed_active', 'blocked')
    ),
    approved_scope_summary TEXT NOT NULL,
    worker_protection_provisions_verified BOOLEAN NOT NULL DEFAULT false,
    wage_payment_responsibility_verified BOOLEAN NOT NULL DEFAULT false,
    insurance_safety_obligations_verified BOOLEAN NOT NULL DEFAULT false,
    data_privacy_terms_verified BOOLEAN NOT NULL DEFAULT false,
    consented_worker_count INT NOT NULL DEFAULT 0,
    authorized_deployment_record_ref TEXT,
    pilot_authorization_status TEXT NOT NULL DEFAULT 'blocked' CHECK (
        pilot_authorization_status IN ('draft', 'scoping', 'pending_authorization', 'authorized_active', 'blocked', 'closed')
    ),
    blocking_reasons TEXT[] NOT NULL DEFAULT '{}'::text[],
    evidence_digest TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_epc_pilot_auth_partner ON public.enterprise_pilot_authorizations(partner_name);
CREATE INDEX IF NOT EXISTS idx_epc_pilot_auth_status ON public.enterprise_pilot_authorizations(pilot_authorization_status);

ALTER TABLE public.enterprise_pilot_authorizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read enterprise pilot authorizations"
    ON public.enterprise_pilot_authorizations FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Service role and admins can manage enterprise pilot authorizations"
    ON public.enterprise_pilot_authorizations FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ============================================================================
-- 3. WORKER IMPACT EVALUATIONS (Pillar G)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.worker_impact_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cohort_name TEXT NOT NULL,
    region_code TEXT NOT NULL,
    trade_category TEXT NOT NULL,
    observation_period_start DATE NOT NULL,
    observation_period_end DATE NOT NULL,
    sample_size INT NOT NULL CHECK (sample_size > 0),
    baseline_daily_earnings NUMERIC(10,2) NOT NULL,
    post_participation_daily_earnings NUMERIC(10,2) NOT NULL,
    monthly_paid_working_days_baseline NUMERIC(5,2) NOT NULL,
    monthly_paid_working_days_post NUMERIC(5,2) NOT NULL,
    average_direct_expenses NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    average_net_take_home NUMERIC(10,2) NOT NULL,
    platform_commission_deduction NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (platform_commission_deduction = 0.00),
    average_payment_delay_hours NUMERIC(6,2) NOT NULL,
    repeat_work_retention_rate NUMERIC(5,2) NOT NULL,
    customer_concentration_top1_percent NUMERIC(5,2) NOT NULL,
    satisfaction_score_out_of_5 NUMERIC(3,2) NOT NULL,
    worker_retention_percent NUMERIC(5,2) NOT NULL,
    confounding_factors TEXT[] NOT NULL DEFAULT '{}'::text[],
    confidence_limitations TEXT NOT NULL,
    evidence_digest TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_worker_impact_evaluations_region ON public.worker_impact_evaluations(region_code);
CREATE INDEX IF NOT EXISTS idx_worker_impact_evaluations_trade ON public.worker_impact_evaluations(trade_category);

ALTER TABLE public.worker_impact_evaluations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read worker impact evaluations"
    ON public.worker_impact_evaluations FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Service role and admins can manage worker impact evaluations"
    ON public.worker_impact_evaluations FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ============================================================================
-- 4. CLASS A READINESS AUDITS (Pillar M)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.class_a_readiness_audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requirement_number INT NOT NULL CHECK (requirement_number BETWEEN 1 AND 12),
    requirement_title TEXT NOT NULL,
    required_evidence TEXT NOT NULL,
    evidence_received TEXT,
    verification_method TEXT NOT NULL,
    independent_reviewer TEXT NOT NULL,
    audit_result TEXT NOT NULL CHECK (audit_result IN ('pass', 'fail', 'conditional', 'blocked')),
    outstanding_dependency TEXT,
    remediation_owner TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'not_started' CHECK (
        status IN ('not_started', 'in_progress', 'evidence_pending', 'under_review', 'passed', 'failed', 'blocked')
    ),
    evidence_digest TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_class_a_readiness_req ON public.class_a_readiness_audits(requirement_number);
CREATE INDEX IF NOT EXISTS idx_class_a_readiness_status ON public.class_a_readiness_audits(status);

ALTER TABLE public.class_a_readiness_audits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read class a readiness audits"
    ON public.class_a_readiness_audits FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Service role and admins can manage class a readiness audits"
    ON public.class_a_readiness_audits FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
