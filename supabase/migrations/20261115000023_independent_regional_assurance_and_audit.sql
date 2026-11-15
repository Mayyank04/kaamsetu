-- Migration 23: Independent Regional Assurance, Metric Reconciliation & Operational Governance
-- Phase 22: Pillars A, B, C, D, E, F, M
-- 
-- Adds:
-- 1. operational_claim_reconciliations (Pillar B: Metric Reconciliation & Discrepancy Auditing)
-- 2. worker_payment_verification_events (Pillar C: 11-stage Outcome & 6-status Payment Verification)
-- 3. worker_economic_snapshots (Pillar D: Worker Economics, Net Take-Home & 0% Wage Commission)
-- 4. regional_operating_reviews (Pillar E: SROP Repeatability & 7-tier Worker Supply Status)
-- 5. institutional_instrument_reviews (Pillar F: 10-status Legal Instrument Ratification)
-- 6. audit_evidence_review_events (Pillar M: 8-status Evidence Registry Review Lifecycle)

-- ============================================================================
-- 1. OPERATIONAL CLAIM RECONCILIATIONS (Pillar B)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.operational_claim_reconciliations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name TEXT NOT NULL,
    reported_value TEXT NOT NULL,
    reconciled_value TEXT NOT NULL,
    discrepancy_delta TEXT,
    source_table_or_doc TEXT NOT NULL,
    calculation_formula TEXT NOT NULL,
    reconciliation_result TEXT NOT NULL CHECK (
        reconciliation_result IN (
            'verified_exact',
            'reconciled_with_scope_clarification',
            'corrected',
            'disputed'
        )
    ),
    evidence_ref TEXT NOT NULL,
    responsible_reviewer TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'under_review' CHECK (
        status IN ('draft', 'under_review', 'reconciled', 'superseded')
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_op_claim_reconciliations_metric ON public.operational_claim_reconciliations(metric_name);
CREATE INDEX IF NOT EXISTS idx_op_claim_reconciliations_status ON public.operational_claim_reconciliations(status);

ALTER TABLE public.operational_claim_reconciliations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users and admins can read claim reconciliations"
    ON public.operational_claim_reconciliations FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Service role and admins can insert/update claim reconciliations"
    ON public.operational_claim_reconciliations FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ============================================================================
-- 2. WORKER PAYMENT VERIFICATION EVENTS (Pillar C)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.worker_payment_verification_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    worker_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    wage_amount NUMERIC(10,2) NOT NULL CHECK (wage_amount >= 0),
    platform_commission NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (platform_commission = 0.00), -- CONSTITUTIONAL INVARIANT
    verification_status TEXT NOT NULL CHECK (
        verification_status IN (
            'worker_declared',
            'customer_declared',
            'payment_reference_submitted',
            'bank_evidence_reviewed',
            'settlement_confirmed',
            'reversed_disputed_refunded'
        )
    ),
    bank_utr_masked TEXT, -- E.g. SBIN-NEFT-XXXX-8912; never store raw unredacted bank credentials
    evidence_document_ref TEXT,
    verifier_identity TEXT,
    dual_authorization_signoff BOOLEAN NOT NULL DEFAULT false,
    secondary_verifier_identity TEXT,
    settlement_timestamp TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wp_verification_booking ON public.worker_payment_verification_events(booking_id);
CREATE INDEX IF NOT EXISTS idx_wp_verification_worker ON public.worker_payment_verification_events(worker_id);
CREATE INDEX IF NOT EXISTS idx_wp_verification_status ON public.worker_payment_verification_events(verification_status);

ALTER TABLE public.worker_payment_verification_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workers can view their own payment verification events"
    ON public.worker_payment_verification_events FOR SELECT
    TO authenticated
    USING (auth.uid() = worker_id OR auth.uid() = customer_id);

CREATE POLICY "Admins and service role can manage payment verification events"
    ON public.worker_payment_verification_events FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ============================================================================
-- 3. WORKER ECONOMIC SNAPSHOTS (Pillar D)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.worker_economic_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    region_code TEXT NOT NULL,
    trade_code TEXT NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    gross_customer_paid NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (gross_customer_paid >= 0),
    platform_commission_deducted NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (platform_commission_deducted = 0.00), -- CONSTITUTIONAL INVARIANT
    worker_net_earnings NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (worker_net_earnings >= 0),
    worker_reported_expenses NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (worker_reported_expenses >= 0),
    net_take_home NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    paid_working_days INTEGER NOT NULL DEFAULT 0 CHECK (paid_working_days >= 0),
    completed_jobs_count INTEGER NOT NULL DEFAULT 0 CHECK (completed_jobs_count >= 0),
    repeat_customer_bookings_count INTEGER NOT NULL DEFAULT 0 CHECK (repeat_customer_bookings_count >= 0),
    avg_time_to_payment_hours NUMERIC(6,2),
    evidence_sha256 TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_net_take_home_math CHECK (net_take_home = worker_net_earnings - worker_reported_expenses)
);

CREATE INDEX IF NOT EXISTS idx_worker_econ_snapshots_worker ON public.worker_economic_snapshots(worker_id);
CREATE INDEX IF NOT EXISTS idx_worker_econ_snapshots_region ON public.worker_economic_snapshots(region_code);
CREATE INDEX IF NOT EXISTS idx_worker_econ_snapshots_period ON public.worker_economic_snapshots(period_start, period_end);

ALTER TABLE public.worker_economic_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workers can view their own economic snapshots"
    ON public.worker_economic_snapshots FOR SELECT
    TO authenticated
    USING (auth.uid() = worker_id);

CREATE POLICY "Service role and admins can manage economic snapshots"
    ON public.worker_economic_snapshots FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ============================================================================
-- 4. REGIONAL OPERATING REVIEWS (Pillar E)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.regional_operating_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_code TEXT NOT NULL,
    region_name TEXT NOT NULL,
    district_name TEXT NOT NULL,
    review_cycle TEXT NOT NULL,
    operating_status TEXT NOT NULL CHECK (
        operating_status IN (
            'research',
            'candidate',
            'readiness_assessment',
            'conditionally_ready',
            'controlled_pilot',
            'active',
            'suspended',
            'closed'
        )
    ),
    registered_count INTEGER NOT NULL DEFAULT 0 CHECK (registered_count >= 0),
    contactable_count INTEGER NOT NULL DEFAULT 0 CHECK (contactable_count >= 0),
    available_count INTEGER NOT NULL DEFAULT 0 CHECK (available_count >= 0),
    verified_count INTEGER NOT NULL DEFAULT 0 CHECK (verified_count >= 0),
    recent_completed_count INTEGER NOT NULL DEFAULT 0 CHECK (recent_completed_count >= 0),
    verified_paid_count INTEGER NOT NULL DEFAULT 0 CHECK (verified_paid_count >= 0),
    inactive_count INTEGER NOT NULL DEFAULT 0 CHECK (inactive_count >= 0),
    srop_conformance_score_pct NUMERIC(5,2) NOT NULL DEFAULT 0.00 CHECK (srop_conformance_score_pct >= 0 AND srop_conformance_score_pct <= 100),
    lead_reviewer TEXT NOT NULL,
    evidence_sha256 TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_regional_supply_sanity CHECK (
        contactable_count <= registered_count AND
        available_count <= contactable_count AND
        verified_paid_count <= recent_completed_count
    )
);

CREATE INDEX IF NOT EXISTS idx_reg_operating_reviews_region ON public.regional_operating_reviews(region_code);
CREATE INDEX IF NOT EXISTS idx_reg_operating_reviews_status ON public.regional_operating_reviews(operating_status);

ALTER TABLE public.regional_operating_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read for regional operating reviews summary"
    ON public.regional_operating_reviews FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Service role and admins manage regional operating reviews"
    ON public.regional_operating_reviews FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ============================================================================
-- 5. INSTITUTIONAL INSTRUMENT REVIEWS (Pillar F)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.institutional_instrument_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_code TEXT NOT NULL,
    institution_name TEXT NOT NULL,
    category TEXT NOT NULL,
    instrument_type TEXT NOT NULL,
    legal_entity_name TEXT NOT NULL,
    authorized_signatory TEXT NOT NULL,
    document_reference TEXT,
    execution_date DATE,
    effective_date DATE,
    expiry_date DATE,
    geographic_scope TEXT NOT NULL,
    legal_review_status TEXT NOT NULL CHECK (
        legal_review_status IN (
            'research_only',
            'discussion',
            'proposal_submitted',
            'draft_under_review',
            'awaiting_signature',
            'executed',
            'effective',
            'suspended',
            'expired',
            'terminated'
        )
    ),
    independent_evidence_ref TEXT NOT NULL,
    reviewed_by TEXT NOT NULL,
    evidence_sha256 TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inst_instrument_reviews_code ON public.institutional_instrument_reviews(institution_code);
CREATE INDEX IF NOT EXISTS idx_inst_instrument_reviews_status ON public.institutional_instrument_reviews(legal_review_status);

ALTER TABLE public.institutional_instrument_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read institutional reviews"
    ON public.institutional_instrument_reviews FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Service role and admins manage institutional reviews"
    ON public.institutional_instrument_reviews FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ============================================================================
-- 6. AUDIT EVIDENCE REVIEW EVENTS (Pillar M)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.audit_evidence_review_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id TEXT NOT NULL,
    claim_description TEXT NOT NULL,
    claim_category TEXT NOT NULL,
    region_code TEXT NOT NULL,
    reporting_period TEXT NOT NULL,
    evidence_source TEXT NOT NULL,
    evidence_owner TEXT NOT NULL,
    verification_method TEXT NOT NULL,
    reviewer_identity TEXT NOT NULL,
    reviewer_role TEXT NOT NULL,
    evidence_status TEXT NOT NULL CHECK (
        evidence_status IN (
            'not_submitted',
            'submitted',
            'under_review',
            'verified',
            'rejected',
            'expired',
            'superseded',
            'disputed'
        )
    ),
    integrity_hash_sha256 TEXT NOT NULL,
    correction_notes TEXT,
    review_timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_evidence_events_claim ON public.audit_evidence_review_events(claim_id);
CREATE INDEX IF NOT EXISTS idx_audit_evidence_events_status ON public.audit_evidence_review_events(evidence_status);
CREATE INDEX IF NOT EXISTS idx_audit_evidence_events_region ON public.audit_evidence_review_events(region_code);

ALTER TABLE public.audit_evidence_review_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read audit evidence events"
    ON public.audit_evidence_review_events FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Service role and admins manage audit evidence events"
    ON public.audit_evidence_review_events FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
