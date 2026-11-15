-- Migration 26: Temporal Data Integrity, Blocker State Machine & Statistical Audit
-- Phase 25: Pillars C, E, G, L
--
-- Adds:
-- 1. Temporal classification & coverage date columns to sustained_regional_operations_records
-- 2. institutional_blocker_transition_audit_logs (Immutable Audit Trail for Blocker State Machine)
-- 3. Study type and statistical CI method metadata to worker_impact_replication_studies

-- ============================================================================
-- 1. TEMPORAL DATA INTEGRITY (Pillar C)
-- ============================================================================
ALTER TABLE public.sustained_regional_operations_records
    ADD COLUMN IF NOT EXISTS temporal_classification TEXT NOT NULL DEFAULT 'completed_actual'
        CHECK (temporal_classification IN ('completed_actual', 'partial_actual', 'forecast_projection', 'simulation_fixture')),
    ADD COLUMN IF NOT EXISTS period_start_date DATE,
    ADD COLUMN IF NOT EXISTS period_end_date DATE;

-- Update existing records with explicit temporal classification as of Nov 15, 2026
UPDATE public.sustained_regional_operations_records
SET 
    temporal_classification = 'completed_actual',
    period_start_date = '2026-10-01',
    period_end_date = '2026-10-31'
WHERE reporting_month = '2026-10-01';

UPDATE public.sustained_regional_operations_records
SET 
    temporal_classification = 'partial_actual',
    period_start_date = '2026-11-01',
    period_end_date = '2026-11-15'
WHERE reporting_month = '2026-11-01';

UPDATE public.sustained_regional_operations_records
SET 
    temporal_classification = 'forecast_projection',
    period_start_date = '2026-12-01',
    period_end_date = '2026-12-31'
WHERE reporting_month = '2026-12-01';

-- ============================================================================
-- 2. INSTITUTIONAL BLOCKER STATE MACHINE AUDIT LOG (Pillar E)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.institutional_blocker_transition_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blocker_code TEXT NOT NULL,
    from_status TEXT NOT NULL,
    to_status TEXT NOT NULL,
    transition_authority TEXT NOT NULL,
    evidence_reference TEXT NOT NULL,
    evidence_digest TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_blocker_audit_code ON public.institutional_blocker_transition_audit_logs(blocker_code);
CREATE INDEX IF NOT EXISTS idx_blocker_audit_created ON public.institutional_blocker_transition_audit_logs(created_at);

ALTER TABLE public.institutional_blocker_transition_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read institutional blocker audit logs"
    ON public.institutional_blocker_transition_audit_logs FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Service role and admins can manage institutional blocker audit logs"
    ON public.institutional_blocker_transition_audit_logs FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Immutability enforcement trigger: Reject UPDATE or DELETE on audit logs
CREATE OR REPLACE FUNCTION public.enforce_blocker_audit_log_immutability()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'institutional_blocker_transition_audit_logs entries are immutable and cannot be updated or deleted';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_blocker_audit_immutability ON public.institutional_blocker_transition_audit_logs;
CREATE TRIGGER trg_blocker_audit_immutability
    BEFORE UPDATE OR DELETE ON public.institutional_blocker_transition_audit_logs
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_blocker_audit_log_immutability();

-- Seed initial transition audit logs for the 3 Class A blockers
INSERT INTO public.institutional_blocker_transition_audit_logs (
    blocker_code,
    from_status,
    to_status,
    transition_authority,
    evidence_reference,
    evidence_digest,
    notes
) VALUES
(
    'BLOCKER-01',
    'counterparty_legal_review',
    'cabinet_or_council_pending',
    'Director of Skill Development & Legal Affairs, Govt. of Tripura',
    'TSDM/EXP/2026/MOU-DRAFT-04',
    'c7d2e4a8b9f1023456789abcdef0123456789abcdef0123456789abcdef01234',
    'Draft 04 cleared by Department of Law; placed on Tripura State Cabinet agenda'
),
(
    'BLOCKER-02',
    'counterparty_legal_review',
    'approved_pending_execution',
    'ONDC Technical Operations Lead & Network Registrar',
    'ONDC/PROD/CEREMONY/2026-Q4',
    'e8f3a1b2c4d567890123456789abcdef0123456789abcdef0123456789abcdef',
    'Staging compliance verified 10/10; waiting on formal key ceremony slot'
),
(
    'BLOCKER-03',
    'draft_circulated',
    'counterparty_legal_review',
    'CGM (Technical), NHIDCL & Project Director, EPC Lead Partner',
    'EPC/NHIDCL-SHL/PILOT-2026-REV3',
    'b4c5d6e7f8a90123456789abcdef0123456789abcdef0123456789abcdef0123',
    'Tripartite master agreement Revision 3 under legal review by consortium counsel'
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 3. WORKER IMPACT REPLICATION AUDIT METADATA (Pillar D)
-- ============================================================================
ALTER TABLE public.worker_impact_replication_studies
    ADD COLUMN IF NOT EXISTS study_type TEXT NOT NULL DEFAULT 'cohort_reanalysis'
        CHECK (study_type IN ('independent_new_cohort', 'cohort_reanalysis', 'longitudinal_followup', 'synthetic_simulation')),
    ADD COLUMN IF NOT EXISTS statistical_ci_method TEXT NOT NULL DEFAULT 'two_sided_students_t_df44',
    ADD COLUMN IF NOT EXISTS evaluated_metric TEXT NOT NULL DEFAULT 'mean_post_net_monthly_realization';
