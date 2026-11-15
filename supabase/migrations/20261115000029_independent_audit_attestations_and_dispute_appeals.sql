-- Migration 29: Independent Audit Attestations, Worker Dispute Appeals & Production DR Execution Log
-- Phase 28: Pillars B, D, G, I, M
--
-- Adds:
-- 1. Table public.independent_audit_attestations (Third-party audit reports & evidence hashes)
-- 2. Table public.worker_dispute_appeals (Multi-tier appeals tribunal for contested wage disputes)
-- 3. Table public.production_dr_execution_log (Staging vs Production DR segregation register)
-- 4. Anti-retaliation guards and tamper-evident immutability triggers
-- 5. 100% Row Level Security (RLS) enforcement

-- ============================================================================
-- 1. INDEPENDENT AUDIT ATTESTATIONS (Pillars B, M)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.independent_audit_attestations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attestation_code TEXT NOT NULL UNIQUE,                       -- e.g. 'AUDIT-2026-XXXX'
    auditor_name TEXT NOT NULL,
    auditor_organization TEXT NOT NULL,
    auditor_accreditation TEXT NOT NULL,
    report_reference TEXT NOT NULL,
    evidence_digest_sha256 TEXT NOT NULL,                        -- SHA-256 of the audit evidence bundle
    scope_domains TEXT[] NOT NULL,                               -- e.g. ARRAY['cryptographic_identity', 'financial_reconciliation']
    findings_summary JSONB NOT NULL DEFAULT '{}'::jsonb,
    attestation_status TEXT NOT NULL CHECK (attestation_status IN (
        'PENDING_REVIEW',
        'ATTESTED',
        'CONDITIONALLY_ATTESTED',
        'REJECTED',
        'EXPIRED'
    )),
    effective_from TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    verified_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_attest_code 
    ON public.independent_audit_attestations(attestation_code);

CREATE INDEX IF NOT EXISTS idx_audit_attest_status 
    ON public.independent_audit_attestations(attestation_status);

ALTER TABLE public.independent_audit_attestations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read for audit attestations"
    ON public.independent_audit_attestations FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Service role can manage audit attestations"
    ON public.independent_audit_attestations FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Immutability guard: once an attestation is ATTESTED, its core evidence cannot be modified
CREATE OR REPLACE FUNCTION public.enforce_attestation_evidence_immutability()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.attestation_status = 'ATTESTED' AND NEW.evidence_digest_sha256 <> OLD.evidence_digest_sha256 THEN
        RAISE EXCEPTION 'Cannot modify evidence_digest_sha256 on an already attested audit record';
    END IF;
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_attestation_immutability ON public.independent_audit_attestations;
CREATE TRIGGER trg_audit_attestation_immutability
    BEFORE UPDATE ON public.independent_audit_attestations
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_attestation_evidence_immutability();

-- ============================================================================
-- 2. WORKER DISPUTE APPEALS (Pillar D)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.worker_dispute_appeals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appeal_code TEXT NOT NULL UNIQUE,                           -- e.g. 'APPL-2026-XXXX'
    dispute_id UUID NOT NULL REFERENCES public.worker_payout_dispute_records(id) ON DELETE CASCADE,
    worker_id UUID NOT NULL REFERENCES public.worker_profiles(id) ON DELETE CASCADE,
    appellant_role TEXT NOT NULL CHECK (appellant_role IN ('worker', 'contractor', 'customer')),
    tribunal_member_name TEXT NOT NULL,
    tribunal_member_role TEXT NOT NULL CHECK (tribunal_member_role IN (
        'independent_ombudsperson',
        'legal_counsel',
        'worker_advocate',
        'district_lead'
    )),
    grounds_of_appeal TEXT NOT NULL,
    prior_resolution_summary TEXT NOT NULL,
    worker_relief_sought NUMERIC(12,2) NOT NULL CHECK (worker_relief_sought >= 0),
    appeal_status TEXT NOT NULL DEFAULT 'filed' CHECK (appeal_status IN (
        'filed',
        'under_tribunal_review',
        'hearing_scheduled',
        'evidence_requested',
        'upheld_worker',
        'upheld_partial',
        'denied',
        'settled'
    )),
    final_determination TEXT,
    relief_awarded_amount NUMERIC(12,2) DEFAULT 0.00 CHECK (relief_awarded_amount >= 0),
    non_retaliation_certified BOOLEAN NOT NULL DEFAULT true,
    filed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dispute_appeals_worker 
    ON public.worker_dispute_appeals(worker_id);

CREATE INDEX IF NOT EXISTS idx_dispute_appeals_dispute 
    ON public.worker_dispute_appeals(dispute_id);

CREATE INDEX IF NOT EXISTS idx_dispute_appeals_status 
    ON public.worker_dispute_appeals(appeal_status);

ALTER TABLE public.worker_dispute_appeals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workers can read own dispute appeals"
    ON public.worker_dispute_appeals FOR SELECT
    TO authenticated
    USING (
        worker_id IN (
            SELECT id FROM public.worker_profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Workers can insert own dispute appeals"
    ON public.worker_dispute_appeals FOR INSERT
    TO authenticated
    WITH CHECK (
        worker_id IN (
            SELECT id FROM public.worker_profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Service role can manage dispute appeals"
    ON public.worker_dispute_appeals FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Anti-retaliation trigger: ensures non_retaliation_certified is true on insert
CREATE OR REPLACE FUNCTION public.enforce_appeal_non_retaliation()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.non_retaliation_certified IS NOT TRUE THEN
        RAISE EXCEPTION 'Worker dispute appeals require non_retaliation_certified = true';
    END IF;
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_dispute_appeal_non_retaliation ON public.worker_dispute_appeals;
CREATE TRIGGER trg_dispute_appeal_non_retaliation
    BEFORE INSERT OR UPDATE ON public.worker_dispute_appeals
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_appeal_non_retaliation();

-- ============================================================================
-- 3. PRODUCTION DR EXECUTION LOG (Pillar G)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.production_dr_execution_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    drill_code TEXT NOT NULL UNIQUE,                           -- e.g. 'DR-2026-XXXX'
    environment_classification TEXT NOT NULL CHECK (environment_classification IN (
        'LOCAL_SANDBOX',
        'STAGING_SIMULATION',
        'PRODUCTION_FAILOVER'
    )),
    drill_type TEXT NOT NULL CHECK (drill_type IN (
        'PITR_RESTORE',
        'DATABASE_FAILOVER',
        'CROSS_REGION_STORAGE',
        'FULL_SYSTEM_RECOVERY'
    )),
    authorized_by TEXT NOT NULL,
    authorization_reference TEXT NOT NULL,
    primary_region TEXT NOT NULL,
    recovery_region TEXT NOT NULL,
    target_rto_seconds INTEGER NOT NULL,
    actual_rto_seconds INTEGER NOT NULL,
    target_rpo_seconds INTEGER NOT NULL,
    actual_rpo_seconds INTEGER NOT NULL,
    data_integrity_verified BOOLEAN NOT NULL DEFAULT false,
    verified_records_count BIGINT NOT NULL DEFAULT 0,
    checksum_verification_status TEXT NOT NULL CHECK (checksum_verification_status IN (
        'PASSED',
        'FAILED',
        'PENDING'
    )),
    findings JSONB NOT NULL DEFAULT '{}'::jsonb,
    executed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dr_log_env 
    ON public.production_dr_execution_log(environment_classification);

CREATE INDEX IF NOT EXISTS idx_dr_log_code 
    ON public.production_dr_execution_log(drill_code);

ALTER TABLE public.production_dr_execution_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read for DR execution logs"
    ON public.production_dr_execution_log FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Service role can insert DR execution logs"
    ON public.production_dr_execution_log FOR INSERT
    TO service_role
    WITH CHECK (true);

-- Immutability guard: DR execution records are historical audit artifacts and cannot be modified or deleted
CREATE OR REPLACE FUNCTION public.enforce_dr_log_immutability()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'production_dr_execution_log records are immutable compliance logs and cannot be updated or deleted';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_dr_log_immutability ON public.production_dr_execution_log;
CREATE TRIGGER trg_dr_log_immutability
    BEFORE UPDATE OR DELETE ON public.production_dr_execution_log
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_dr_log_immutability();
