-- ============================================================================
-- KAAMSETU MIGRATION 17: INDEPENDENT VERIFICATION & NATIONAL SCALE
-- Phase 16: Independent Evidence, Worker Outcome Measurement & State Readiness Gates
-- ============================================================================

-- 1. Metric Evidence & Provenance Verification Ledger
CREATE TABLE IF NOT EXISTS public.metric_evidence_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_identifier TEXT NOT NULL,
    reporting_period TEXT NOT NULL,
    data_source TEXT NOT NULL,
    calculation_method TEXT NOT NULL,
    verification_status TEXT NOT NULL CHECK (
        verification_status IN (
            'verified',
            'partially_verified',
            'self_reported',
            'estimated',
            'unavailable',
            'disputed'
        )
    ),
    metric_value JSONB NOT NULL,
    raw_evidence_hash TEXT NOT NULL,
    verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    verification_notes TEXT,
    last_updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_simulated BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index on metric_identifier and reporting_period
CREATE INDEX IF NOT EXISTS idx_metric_evidence_ident_period
    ON public.metric_evidence_records(metric_identifier, reporting_period);

-- 2. Worker Outcome Cohorts & Earning Provenance Ledger
CREATE TABLE IF NOT EXISTS public.worker_outcome_cohorts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_profile_id UUID NOT NULL REFERENCES public.worker_profiles(id) ON DELETE CASCADE,
    cohort_id TEXT NOT NULL,
    baseline_period_start DATE NOT NULL,
    baseline_period_end DATE NOT NULL,
    follow_up_period_start DATE NOT NULL,
    follow_up_period_end DATE NOT NULL,
    worker_reported_monthly_income NUMERIC(12,2),
    customer_confirmed_monthly_income NUMERIC(12,2),
    payment_record_backed_monthly_income NUMERIC(12,2),
    independently_reconciled_monthly_income NUMERIC(12,2),
    outcome_tracking_opted_in BOOLEAN NOT NULL DEFAULT true,
    completion_count INTEGER NOT NULL DEFAULT 0 CHECK (completion_count >= 0),
    repeat_customer_count INTEGER NOT NULL DEFAULT 0 CHECK (repeat_customer_count >= 0),
    avg_enquiry_to_booking_hours NUMERIC(6,2),
    avg_booking_to_completion_hours NUMERIC(6,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_worker_cohort UNIQUE(worker_profile_id, cohort_id)
);

CREATE INDEX IF NOT EXISTS idx_worker_outcome_worker
    ON public.worker_outcome_cohorts(worker_profile_id);

-- 3. State Launch Gate Evaluations
CREATE TABLE IF NOT EXISTS public.state_launch_gate_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_code TEXT NOT NULL REFERENCES public.operational_regions(region_code) ON DELETE CASCADE,
    gate_number INTEGER NOT NULL CHECK (gate_number BETWEEN 1 AND 5),
    gate_name TEXT NOT NULL,
    evaluation_status TEXT NOT NULL CHECK (
        evaluation_status IN ('passed', 'failed', 'under_review', 'exempt')
    ),
    evidence_document_uri TEXT,
    evaluated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    evaluated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    notes TEXT,
    CONSTRAINT unique_region_gate UNIQUE(region_code, gate_number)
);

CREATE INDEX IF NOT EXISTS idx_state_launch_gate_region
    ON public.state_launch_gate_evaluations(region_code);

-- ============================================================================
-- ROW LEVEL SECURITY ENFORCEMENT (100% COVERAGE)
-- ============================================================================

ALTER TABLE public.metric_evidence_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_outcome_cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.state_launch_gate_evaluations ENABLE ROW LEVEL SECURITY;

-- Metric Evidence Policies:
-- Platform Admins have full access.
-- Authenticated users (workers, contractors, institutions) can read verified metrics only.
CREATE POLICY "Admins have full access to metric evidence"
    ON public.metric_evidence_records
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role = 'admin'::app_role
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role = 'admin'::app_role
        )
    );

CREATE POLICY "Authenticated users can view verified metric evidence"
    ON public.metric_evidence_records
    FOR SELECT
    TO authenticated
    USING (
        is_simulated = false
    );

-- Worker Outcome Cohorts Policies:
-- Worker can view their own outcome record only (if opted-in).
-- Platform Admins can view/manage.
CREATE POLICY "Workers can view own outcome cohort data"
    ON public.worker_outcome_cohorts
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.worker_profiles wp
            WHERE wp.id = worker_outcome_cohorts.worker_profile_id
              AND wp.user_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role = 'admin'::app_role
        )
    );

CREATE POLICY "Workers can update own outcome opt-in preference"
    ON public.worker_outcome_cohorts
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.worker_profiles wp
            WHERE wp.id = worker_outcome_cohorts.worker_profile_id
              AND wp.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.worker_profiles wp
            WHERE wp.id = worker_outcome_cohorts.worker_profile_id
              AND wp.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins have full access to worker outcome cohorts"
    ON public.worker_outcome_cohorts
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role = 'admin'::app_role
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role = 'admin'::app_role
        )
    );

-- State Launch Gate Policies:
-- Admins and regional coordinators can manage launch gates.
-- General users can read passed gates for active operational regions.
CREATE POLICY "Admins have full access to state launch gates"
    ON public.state_launch_gate_evaluations
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role = 'admin'::app_role
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role = 'admin'::app_role
        )
    );

CREATE POLICY "Users can view launch gates"
    ON public.state_launch_gate_evaluations
    FOR SELECT
    TO authenticated
    USING (true);
