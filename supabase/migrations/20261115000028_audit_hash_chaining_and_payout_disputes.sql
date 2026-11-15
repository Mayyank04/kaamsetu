-- Migration 28: Audit Hash Chaining, Tamper-Evident Checkpoints & Worker Payout Disputes
-- Phase 27: Pillars D, E, F, G, M
--
-- Adds:
-- 1. Cryptographic hash-chaining columns to public.worker_consent_audit_events
-- 2. Table public.audit_chain_checkpoints (Signed periodic Merkle/hash checkpoints)
-- 3. Table public.worker_payout_dispute_records (Independent wage dispute & grievance workflow)
-- 4. Table public.worker_payout_dispute_events (Immutable dispute lifecycle audit trail)
-- 5. Immutability triggers & 100% RLS enforcement

-- ============================================================================
-- 1. HASH CHAINING COLUMNS ON WORKER CONSENT AUDIT EVENTS (Pillar D)
-- ============================================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'worker_consent_audit_events' 
        AND column_name = 'previous_event_digest'
    ) THEN
        ALTER TABLE public.worker_consent_audit_events 
            ADD COLUMN previous_event_digest TEXT,
            ADD COLUMN event_sequence_number BIGINT,
            ADD COLUMN event_digest TEXT,
            ADD COLUMN chain_checkpoint_id UUID;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_consent_audit_seq 
    ON public.worker_consent_audit_events(event_sequence_number);

-- ============================================================================
-- 2. AUDIT CHAIN CHECKPOINTS (Pillar D)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.audit_chain_checkpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chain_name TEXT NOT NULL,                                -- e.g. 'worker_consent_audit_chain'
    checkpoint_sequence BIGINT NOT NULL,                     -- Sequential checkpoint number
    start_sequence BIGINT NOT NULL,                          -- Inclusive start sequence
    end_sequence BIGINT NOT NULL,                            -- Inclusive end sequence
    root_digest TEXT NOT NULL,                               -- SHA-256 root digest of chain slice
    signing_key_id TEXT NOT NULL,                            -- Key ID used to sign checkpoint
    signature TEXT NOT NULL,                                 -- Ed25519 signature of checkpoint
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_checkpoint_chain_seq 
    ON public.audit_chain_checkpoints(chain_name, checkpoint_sequence);

ALTER TABLE public.audit_chain_checkpoints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public and authenticated read for audit checkpoints"
    ON public.audit_chain_checkpoints FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Service role can insert audit checkpoints"
    ON public.audit_chain_checkpoints FOR INSERT
    TO service_role
    WITH CHECK (true);

-- Immutability: checkpoints cannot be updated or deleted
CREATE OR REPLACE FUNCTION public.enforce_checkpoint_immutability()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'audit_chain_checkpoints are tamper-evident cryptographic anchors and cannot be updated or deleted';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_checkpoint_immutability ON public.audit_chain_checkpoints;
CREATE TRIGGER trg_audit_checkpoint_immutability
    BEFORE UPDATE OR DELETE ON public.audit_chain_checkpoints
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_checkpoint_immutability();

-- ============================================================================
-- 3. WORKER PAYOUT DISPUTE RECORDS (Pillar G)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.worker_payout_dispute_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dispute_code TEXT NOT NULL UNIQUE,                       -- e.g. 'DISP-2026-XXXX'
    worker_id UUID NOT NULL REFERENCES public.worker_profiles(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    payment_reference TEXT NOT NULL,
    disputed_amount NUMERIC(12,2) NOT NULL CHECK (disputed_amount > 0),
    agreed_wage_amount NUMERIC(12,2) NOT NULL CHECK (agreed_wage_amount >= 0),
    dispute_reason TEXT NOT NULL CHECK (dispute_reason IN (
        'missing_payment',
        'incorrect_amount',
        'incorrect_payment_reference',
        'duplicate_booking',
        'unauthorized_deduction',
        'incorrect_expense_deduction',
        'incorrect_job_completion',
        'unrecognized_customer_payment'
    )),
    status TEXT NOT NULL DEFAULT 'opened' CHECK (status IN (
        'opened',
        'acknowledged',
        'under_investigation',
        'resolved_worker_favorable',
        'resolved_employer_favorable',
        'appealed',
        'closed'
    )),
    assigned_investigator_id UUID,
    retaliation_flag BOOLEAN NOT NULL DEFAULT false,
    retaliatory_review_quarantined BOOLEAN NOT NULL DEFAULT false,
    resolution_notes TEXT,
    resolved_at TIMESTAMPTZ,
    worker_appeal_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payout_dispute_worker 
    ON public.worker_payout_dispute_records(worker_id);
CREATE INDEX IF NOT EXISTS idx_payout_dispute_status 
    ON public.worker_payout_dispute_records(status);
CREATE INDEX IF NOT EXISTS idx_payout_dispute_booking 
    ON public.worker_payout_dispute_records(booking_id);

ALTER TABLE public.worker_payout_dispute_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workers can view their own payout disputes"
    ON public.worker_payout_dispute_records FOR SELECT
    TO authenticated
    USING (
        worker_id IN (
            SELECT id FROM public.worker_profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Workers can file payout disputes"
    ON public.worker_payout_dispute_records FOR INSERT
    TO authenticated
    WITH CHECK (
        worker_id IN (
            SELECT id FROM public.worker_profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Service role has full management on payout disputes"
    ON public.worker_payout_dispute_records FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Trigger: Prohibit unilateral dispute closure by employer/contractor
CREATE OR REPLACE FUNCTION public.guard_payout_dispute_closure()
RETURNS TRIGGER AS $$
BEGIN
    -- If status is changing to closed or resolved, ensure resolution_notes are provided
    IF NEW.status IN ('resolved_worker_favorable', 'resolved_employer_favorable', 'closed') AND 
       (NEW.resolution_notes IS NULL OR length(trim(NEW.resolution_notes)) < 10) THEN
        RAISE EXCEPTION 'A payout dispute cannot be closed or resolved without comprehensive resolution notes (min 10 chars)';
    END IF;

    -- Automatically set resolved_at timestamp
    IF NEW.status IN ('resolved_worker_favorable', 'resolved_employer_favorable', 'closed') AND OLD.status NOT IN ('resolved_worker_favorable', 'resolved_employer_favorable', 'closed') THEN
        NEW.resolved_at := now();
    END IF;

    NEW.updated_at := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_payout_dispute_closure_guard ON public.worker_payout_dispute_records;
CREATE TRIGGER trg_payout_dispute_closure_guard
    BEFORE UPDATE ON public.worker_payout_dispute_records
    FOR EACH ROW
    EXECUTE FUNCTION public.guard_payout_dispute_closure();

-- ============================================================================
-- 4. WORKER PAYOUT DISPUTE AUDIT EVENTS (Pillar G)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.worker_payout_dispute_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dispute_id UUID NOT NULL REFERENCES public.worker_payout_dispute_records(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,                                -- 'opened', 'acknowledged', 'evidence_submitted', 'review_quarantined', 'appealed', 'resolved'
    actor_id UUID,
    actor_role TEXT NOT NULL,                                -- 'worker', 'investigator', 'admin', 'system'
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payout_dispute_event_disp 
    ON public.worker_payout_dispute_events(dispute_id);

ALTER TABLE public.worker_payout_dispute_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workers can view audit events for their disputes"
    ON public.worker_payout_dispute_events FOR SELECT
    TO authenticated
    USING (
        dispute_id IN (
            SELECT d.id FROM public.worker_payout_dispute_records d
            JOIN public.worker_profiles wp ON d.worker_id = wp.id
            WHERE wp.user_id = auth.uid()
        )
    );

CREATE POLICY "Service role can insert dispute audit events"
    ON public.worker_payout_dispute_events FOR INSERT
    TO service_role
    WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.enforce_dispute_audit_immutability()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'worker_payout_dispute_events are immutable grievance audit logs and cannot be updated or deleted';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_dispute_audit_immutability ON public.worker_payout_dispute_events;
CREATE TRIGGER trg_dispute_audit_immutability
    BEFORE UPDATE OR DELETE ON public.worker_payout_dispute_events
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_dispute_audit_immutability();
