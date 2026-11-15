-- Migration 21: Evidence Registry V2, Independent Attestation & Dispute Resolution
-- Branch: phase-20-evidence-backed-operations-and-governance
-- Description: Upgrades evidence registry with verifier separation, attestation history, and extended outcome milestones.

-- 1. Upgrade evidence_registry_records
ALTER TABLE public.evidence_registry_records
    ADD COLUMN IF NOT EXISTS claim_owner TEXT,
    ADD COLUMN IF NOT EXISTS verifier_identity TEXT,
    ADD COLUMN IF NOT EXISTS verification_method TEXT,
    ADD COLUMN IF NOT EXISTS revocation_reason TEXT,
    ADD COLUMN IF NOT EXISTS access_classification TEXT NOT NULL DEFAULT 'internal';

-- Add check constraint for access_classification
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'evidence_registry_access_classification_check'
    ) THEN
        ALTER TABLE public.evidence_registry_records
            ADD CONSTRAINT evidence_registry_access_classification_check
            CHECK (access_classification IN ('public', 'internal', 'confidential', 'restricted'));
    END IF;
END $$;

-- Update status constraint to include 'revoked'
ALTER TABLE public.evidence_registry_records
    DROP CONSTRAINT IF EXISTS evidence_registry_records_status_check;

ALTER TABLE public.evidence_registry_records
    ADD CONSTRAINT evidence_registry_records_status_check
    CHECK (status IN (
        'unverified', 'self_reported', 'system_observed', 'partner_confirmed',
        'independently_verified', 'expired', 'disputed', 'rejected', 'revoked'
    ));


-- 2. Upgrade worker_outcome_milestones step constraint
ALTER TABLE public.worker_outcome_milestones
    DROP CONSTRAINT IF EXISTS worker_outcome_milestones_milestone_step_check;

ALTER TABLE public.worker_outcome_milestones
    ADD CONSTRAINT worker_outcome_milestones_milestone_step_check
    CHECK (milestone_step IN (
        'opportunity_received', 'opportunity_accepted', 'booking_confirmed',
        'work_started', 'work_commenced', 'work_completed', 'worker_confirmed_completion',
        'customer_confirmed', 'gross_wages_agreed', 'gross_wages_paid',
        'payment_evidence', 'disputed', 'resolution', 'reversal_correction', 'retracted'
    ));


-- 3. Create Evidence Attestation Events (Immutable audit log of attestation and verifier actions)
CREATE TABLE IF NOT EXISTS public.evidence_attestation_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id TEXT NOT NULL REFERENCES public.evidence_registry_records(claim_id) ON DELETE CASCADE,
    attestation_type TEXT NOT NULL CHECK (attestation_type IN (
        'submitted', 'observed', 'attested', 'rejected', 'disputed', 'clarification_requested', 'revoked', 'expired'
    )),
    actor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    actor_role TEXT NOT NULL CHECK (actor_role IN (
        'worker', 'customer', 'contractor', 'enterprise_partner', 'institutional_partner',
        'financial_partner', 'credential_issuer', 'independent_auditor', 'platform_admin'
    )),
    methodology TEXT NOT NULL,
    reviewed_artifacts JSONB NOT NULL DEFAULT '[]'::jsonb,
    scope_and_limitations TEXT NOT NULL,
    signature_digest TEXT NOT NULL,
    dual_approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexing for attestation events
CREATE INDEX IF NOT EXISTS idx_attestation_claim_id ON public.evidence_attestation_events (claim_id);
CREATE INDEX IF NOT EXISTS idx_attestation_actor_id ON public.evidence_attestation_events (actor_id);
CREATE INDEX IF NOT EXISTS idx_attestation_type ON public.evidence_attestation_events (attestation_type);

-- Enable RLS
ALTER TABLE public.evidence_attestation_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies:
-- Admins can manage all
CREATE POLICY "attestation_admin_access"
    ON public.evidence_attestation_events
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'::app_role
        )
    );

-- Actors can view attestations they participated in
CREATE POLICY "attestation_actor_view"
    ON public.evidence_attestation_events
    FOR SELECT
    TO authenticated
    USING (actor_id = auth.uid() OR dual_approved_by = auth.uid());

-- Authenticated verifiers can record attestations
CREATE POLICY "attestation_actor_insert"
    ON public.evidence_attestation_events
    FOR INSERT
    TO authenticated
    WITH CHECK (actor_id = auth.uid());

-- Public can view attestations for public-safe claims
CREATE POLICY "attestation_public_read_safe"
    ON public.evidence_attestation_events
    FOR SELECT
    TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.evidence_registry_records
            WHERE evidence_registry_records.claim_id = evidence_attestation_events.claim_id
            AND evidence_registry_records.is_public_safe = true
        )
    );
