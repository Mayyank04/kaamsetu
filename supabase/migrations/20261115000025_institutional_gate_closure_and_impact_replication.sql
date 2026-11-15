-- Migration 25: Institutional Gate Closure, Worker Impact Replication & Sustained Regional Operations
-- Phase 24: Pillars A, C, E, M
-- 
-- Adds:
-- 1. institutional_blocker_evaluations (Pillar A: Authoritative Register for the 3 Mandatory Class A Blockers)
-- 2. worker_impact_replication_studies (Pillar C: Replicated Longitudinal Cohort Study with Statistical Distributions)
-- 3. sustained_regional_operations_records (Pillar E: Multi-Period Monthly Regional Operations Telemetry)

-- ============================================================================
-- 1. INSTITUTIONAL BLOCKER EVALUATIONS (Pillar A)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.institutional_blocker_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blocker_code TEXT NOT NULL UNIQUE,
    blocker_title TEXT NOT NULL,
    counterparty_name TEXT NOT NULL,
    current_status TEXT NOT NULL CHECK (
        current_status IN (
            'registered',
            'scoping_completed',
            'draft_circulated',
            'counterparty_legal_review',
            'cabinet_or_council_pending',
            'approved_pending_execution',
            'executed_active',
            'blocked'
        )
    ),
    underlying_instrument_ref TEXT,
    required_action TEXT NOT NULL,
    responsible_remediation_owner TEXT NOT NULL,
    external_counterparty_owner TEXT NOT NULL,
    blocking_rationale TEXT NOT NULL,
    resolution_criteria TEXT NOT NULL,
    evidence_digest TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inst_blockers_code ON public.institutional_blocker_evaluations(blocker_code);
CREATE INDEX IF NOT EXISTS idx_inst_blockers_status ON public.institutional_blocker_evaluations(current_status);

ALTER TABLE public.institutional_blocker_evaluations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read institutional blocker evaluations"
    ON public.institutional_blocker_evaluations FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Service role and admins can manage institutional blocker evaluations"
    ON public.institutional_blocker_evaluations FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ============================================================================
-- 2. WORKER IMPACT REPLICATION STUDIES (Pillar C)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.worker_impact_replication_studies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    study_code TEXT NOT NULL UNIQUE,
    cohort_name TEXT NOT NULL,
    region_code TEXT NOT NULL,
    trade_category TEXT NOT NULL,
    sample_size INT NOT NULL CHECK (sample_size > 0),
    observation_period_start DATE NOT NULL,
    observation_period_end DATE NOT NULL,
    baseline_daily_mean NUMERIC(10,2) NOT NULL,
    baseline_daily_median NUMERIC(10,2) NOT NULL,
    post_daily_mean NUMERIC(10,2) NOT NULL,
    post_daily_median NUMERIC(10,2) NOT NULL,
    baseline_monthly_days_mean NUMERIC(5,2) NOT NULL,
    post_monthly_days_mean NUMERIC(5,2) NOT NULL,
    baseline_direct_expenses NUMERIC(10,2) NOT NULL,
    post_direct_expenses NUMERIC(10,2) NOT NULL,
    variable_expense_net_gain_percent NUMERIC(5,2) NOT NULL,
    fixed_expense_net_gain_percent NUMERIC(5,2) NOT NULL,
    platform_commission_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (platform_commission_amount = 0.00),
    confidence_interval_95 TEXT NOT NULL,
    missing_data_rate_percent NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    attrition_rate_percent NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    subgroup_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
    replication_verdict TEXT NOT NULL CHECK (
        replication_verdict IN ('reproduced_exact', 'reproduced_within_confidence_band', 'inconclusive', 'failed')
    ),
    evidence_digest TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_impact_replication_study ON public.worker_impact_replication_studies(study_code);
CREATE INDEX IF NOT EXISTS idx_impact_replication_region ON public.worker_impact_replication_studies(region_code);

ALTER TABLE public.worker_impact_replication_studies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read worker impact replication studies"
    ON public.worker_impact_replication_studies FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Service role and admins can manage worker impact replication studies"
    ON public.worker_impact_replication_studies FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ============================================================================
-- 3. SUSTAINED REGIONAL OPERATIONS RECORDS (Pillar E)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.sustained_regional_operations_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_code TEXT NOT NULL,
    reporting_month DATE NOT NULL,
    registered_workers INT NOT NULL CHECK (registered_workers >= 0),
    verified_workers INT NOT NULL CHECK (verified_workers >= 0),
    available_workers INT NOT NULL CHECK (available_workers >= 0),
    workers_with_recent_completed_work INT NOT NULL CHECK (workers_with_recent_completed_work >= 0),
    workers_with_verified_payments INT NOT NULL CHECK (workers_with_verified_payments >= 0),
    unique_active_customers INT NOT NULL CHECK (unique_active_customers >= 0),
    repeat_customers INT NOT NULL CHECK (repeat_customers >= 0),
    booking_conversion_rate NUMERIC(5,2) NOT NULL,
    cancellation_rate NUMERIC(5,2) NOT NULL,
    dispute_rate NUMERIC(5,2) NOT NULL,
    grievance_rate NUMERIC(5,2) NOT NULL,
    average_payment_delay_hours NUMERIC(6,2) NOT NULL,
    regional_operating_cost_inr NUMERIC(10,2) NOT NULL,
    customer_acquisition_cost_inr NUMERIC(10,2) NOT NULL,
    operating_status TEXT NOT NULL CHECK (
        operating_status IN ('candidate', 'conditionally_ready', 'controlled_active', 'active_verified', 'suspended')
    ),
    regional_lead_owner TEXT NOT NULL,
    evidence_digest TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (region_code, reporting_month)
);

CREATE INDEX IF NOT EXISTS idx_sustained_ops_region ON public.sustained_regional_operations_records(region_code);
CREATE INDEX IF NOT EXISTS idx_sustained_ops_month ON public.sustained_regional_operations_records(reporting_month);

ALTER TABLE public.sustained_regional_operations_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read sustained regional operations records"
    ON public.sustained_regional_operations_records FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Service role and admins can manage sustained regional operations records"
    ON public.sustained_regional_operations_records FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
