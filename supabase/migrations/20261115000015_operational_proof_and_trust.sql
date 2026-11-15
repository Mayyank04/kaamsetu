-- ============================================================================
-- KAAMSETU MIGRATION 15: Operational Proof, Trust Governance & Regional Sustainability
-- Description:
--   1. Regional dual-approval workflows for activation and sensitive status changes.
--   2. Review moderation, quarantine audit, and appeal lifecycle records.
--   3. Formal 7-stage incident response lifecycle tracking.
--   4. Financial reconciliation exceptions, refund/chargeback audit ledger.
--   5. Regional operational scorecards & unit economics contribution margin tracking.
--   6. Worker consent audit events for DPDP compliance and access history.
-- ============================================================================

-- 1. REGIONAL DUAL APPROVALS
-- Requires both a primary and secondary administrator approval before activating/reactivating a region.
CREATE TABLE IF NOT EXISTS public.regional_dual_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  region_id uuid NOT NULL REFERENCES public.operational_regions(id) ON DELETE CASCADE,
  target_status text NOT NULL,
  primary_approver_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  primary_approved_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  secondary_approver_id uuid REFERENCES public.profiles(id) ON DELETE RESTRICT,
  secondary_approved_at timestamptz,
  readiness_score numeric(5,2) NOT NULL,
  mandatory_gates_passed boolean NOT NULL DEFAULT false,
  evidence_references jsonb NOT NULL DEFAULT '{}'::jsonb,
  decision_reason text NOT NULL,
  policy_version text NOT NULL DEFAULT '2.2',
  approval_status text NOT NULL DEFAULT 'pending_secondary',
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT regional_dual_approvals_status_check
    CHECK (approval_status IN ('pending_secondary', 'approved', 'rejected')),
  CONSTRAINT regional_dual_approvals_target_status_check
    CHECK (target_status IN ('approved_for_launch', 'soft_launch', 'active', 'suspended', 'archived')),
  CONSTRAINT regional_dual_approvals_distinct_approvers
    CHECK (secondary_approver_id IS NULL OR secondary_approver_id <> primary_approver_id)
);

CREATE INDEX IF NOT EXISTS idx_reg_dual_approval_region ON public.regional_dual_approvals(region_id);
CREATE INDEX IF NOT EXISTS idx_reg_dual_approval_status ON public.regional_dual_approvals(approval_status);

-- 2. REVIEW MODERATION & APPEAL LIFECYCLE
-- Balanced review-integrity mechanism allowing documented review quarantine, independent mediation, and appeal.
CREATE TABLE IF NOT EXISTS public.review_moderation_appeals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  worker_profile_id uuid NOT NULL REFERENCES public.worker_profiles(id) ON DELETE CASCADE,
  contractor_organization_id uuid REFERENCES public.contractor_organizations(id) ON DELETE SET NULL,
  dispute_id uuid REFERENCES public.worker_disputes(id) ON DELETE SET NULL,
  original_rating integer NOT NULL CHECK (original_rating >= 1 AND original_rating <= 5),
  quarantine_reason text NOT NULL,
  submitted_evidence jsonb NOT NULL DEFAULT '[]'::jsonb,
  moderator_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  moderation_status text NOT NULL DEFAULT 'quarantined',
  appeal_reason text,
  appeal_resolution_notes text,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT review_moderation_status_check
    CHECK (moderation_status IN ('quarantined', 'restored_valid', 'suppressed_retaliatory', 'under_appeal', 'dismissed'))
);

CREATE INDEX IF NOT EXISTS idx_rev_mod_review ON public.review_moderation_appeals(review_id);
CREATE INDEX IF NOT EXISTS idx_rev_mod_worker ON public.review_moderation_appeals(worker_profile_id);
CREATE INDEX IF NOT EXISTS idx_rev_mod_status ON public.review_moderation_appeals(moderation_status);

-- 3. FORMAL INCIDENT RESPONSE LIFECYCLE (detected -> triaged -> contained -> investigated -> remediated -> recovered -> reviewed)
CREATE TABLE IF NOT EXISTS public.operational_incidents_lifecycle (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id uuid NOT NULL REFERENCES public.regional_operational_incidents(id) ON DELETE CASCADE,
  current_stage text NOT NULL DEFAULT 'detected',
  accountable_owner_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  containment_steps text,
  affected_entities jsonb NOT NULL DEFAULT '{}'::jsonb,
  notification_required boolean NOT NULL DEFAULT false,
  notification_dispatched_at timestamptz,
  post_incident_review_notes text,
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT incident_lifecycle_stage_check
    CHECK (current_stage IN ('detected', 'triaged', 'contained', 'investigated', 'remediated', 'recovered', 'reviewed'))
);

CREATE INDEX IF NOT EXISTS idx_inc_lifecycle_incident ON public.operational_incidents_lifecycle(incident_id);
CREATE INDEX IF NOT EXISTS idx_inc_lifecycle_stage ON public.operational_incidents_lifecycle(current_stage);

-- 4. FINANCIAL RECONCILIATION EXCEPTIONS
-- Tracks transaction anomalies, refunds, credit notes, and gateway reconciliation differences.
CREATE TABLE IF NOT EXISTS public.financial_reconciliation_exceptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ledger_entry_id uuid REFERENCES public.financial_gst_ledger(id) ON DELETE SET NULL,
  invoice_number text,
  exception_type text NOT NULL,
  amount numeric(10,2) NOT NULL DEFAULT 0.00,
  currency text NOT NULL DEFAULT 'INR',
  status text NOT NULL DEFAULT 'open',
  resolution_notes text,
  resolved_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT fin_rec_exception_type_check
    CHECK (exception_type IN ('refund', 'chargeback', 'duplicate_webhook_attempt', 'disputed_tax', 'unreconciled_gateway_difference', 'gateway_fee_mismatch')),
  CONSTRAINT fin_rec_exception_status_check
    CHECK (status IN ('open', 'investigating', 'resolved_credited', 'resolved_adjusted', 'written_off'))
);

CREATE INDEX IF NOT EXISTS idx_fin_rec_exc_status ON public.financial_reconciliation_exceptions(status);
CREATE INDEX IF NOT EXISTS idx_fin_rec_exc_type ON public.financial_reconciliation_exceptions(exception_type);

-- 5. REGIONAL OPERATIONAL SCORECARDS & CONTRIBUTION MARGIN
-- Tracks regional unit economics, active vs registered workers, and real operational sustainability.
CREATE TABLE IF NOT EXISTS public.regional_operational_scorecards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  region_id uuid NOT NULL REFERENCES public.operational_regions(id) ON DELETE CASCADE,
  evaluation_period_start date NOT NULL,
  evaluation_period_end date NOT NULL,
  active_worker_count integer NOT NULL DEFAULT 0,
  registered_worker_count integer NOT NULL DEFAULT 0,
  verified_contractor_count integer NOT NULL DEFAULT 0,
  gross_collections numeric(10,2) NOT NULL DEFAULT 0.00,
  net_saas_mrr numeric(10,2) NOT NULL DEFAULT 0.00,
  direct_field_costs numeric(10,2) NOT NULL DEFAULT 0.00,
  direct_hosting_ai_costs numeric(10,2) NOT NULL DEFAULT 0.00,
  contribution_margin numeric(10,2) NOT NULL DEFAULT 0.00,
  margin_percentage numeric(5,2) NOT NULL DEFAULT 0.00,
  operational_rating text NOT NULL DEFAULT 'sustainable',
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT reg_scorecard_rating_check
    CHECK (operational_rating IN ('highly_profitable', 'sustainable', 'break_even', 'subsidized_expansion', 'critical_intervention'))
);

CREATE INDEX IF NOT EXISTS idx_reg_scorecard_region ON public.regional_operational_scorecards(region_id);
CREATE INDEX IF NOT EXISTS idx_reg_scorecard_period ON public.regional_operational_scorecards(evaluation_period_start, evaluation_period_end);

-- 6. WORKER CONSENT AUDIT EVENTS
-- Detailed audit trail of worker data disclosures, renewals, and revocations for DPDP compliance.
CREATE TABLE IF NOT EXISTS public.worker_consent_audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_profile_id uuid NOT NULL REFERENCES public.worker_profiles(id) ON DELETE CASCADE,
  recipient_entity_type text NOT NULL,
  recipient_entity_id uuid,
  action text NOT NULL,
  disclosed_fields text[] NOT NULL DEFAULT '{}',
  policy_version text NOT NULL DEFAULT '2.2',
  actor_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT worker_consent_audit_action_check
    CHECK (action IN ('granted', 'renewed', 'expired', 'revoked', 'modified')),
  CONSTRAINT worker_consent_audit_recipient_check
    CHECK (recipient_entity_type IN ('contractor', 'institution', 'verifier', 'public', 'system'))
);

CREATE INDEX IF NOT EXISTS idx_worker_consent_audit_worker ON public.worker_consent_audit_events(worker_profile_id);
CREATE INDEX IF NOT EXISTS idx_worker_consent_audit_action ON public.worker_consent_audit_events(action);
CREATE INDEX IF NOT EXISTS idx_worker_consent_audit_created ON public.worker_consent_audit_events(created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY ENFORCEMENT ON ALL 6 NEW TABLES (100% RLS MANDATE)
-- ============================================================================

ALTER TABLE public.regional_dual_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_moderation_appeals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operational_incidents_lifecycle ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_reconciliation_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regional_operational_scorecards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_consent_audit_events ENABLE ROW LEVEL SECURITY;

-- 1. Policies for regional_dual_approvals
CREATE POLICY "Admins have full access to regional dual approvals"
  ON public.regional_dual_approvals
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Regional coordinators can view approvals for their region"
  ON public.regional_dual_approvals
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.regional_administrators ra
      WHERE ra.user_id = auth.uid()
        AND ra.region_id = regional_dual_approvals.region_id
        AND ra.is_active = true
    )
  );

-- 2. Policies for review_moderation_appeals
CREATE POLICY "Admins have full access to review moderation appeals"
  ON public.review_moderation_appeals
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Workers can view moderation appeals for their own reviews"
  ON public.review_moderation_appeals
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.worker_profiles wp
      WHERE wp.id = review_moderation_appeals.worker_profile_id
        AND wp.user_id = auth.uid()
    )
  );

-- 3. Policies for operational_incidents_lifecycle
CREATE POLICY "Admins have full access to incident lifecycles"
  ON public.operational_incidents_lifecycle
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Regional coordinators can view incidents for their assigned regions"
  ON public.operational_incidents_lifecycle
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.regional_operational_incidents roi
      JOIN public.regional_administrators ra ON ra.region_id = roi.region_id
      WHERE roi.id = operational_incidents_lifecycle.incident_id
        AND ra.user_id = auth.uid()
        AND ra.is_active = true
    )
  );

-- 4. Policies for financial_reconciliation_exceptions
CREATE POLICY "Admins have full access to financial exceptions"
  ON public.financial_reconciliation_exceptions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- 5. Policies for regional_operational_scorecards
CREATE POLICY "Admins have full access to regional scorecards"
  ON public.regional_operational_scorecards
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Regional coordinators can view scorecards for their region"
  ON public.regional_operational_scorecards
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.regional_administrators ra
      WHERE ra.user_id = auth.uid()
        AND ra.region_id = regional_operational_scorecards.region_id
        AND ra.is_active = true
    )
  );

-- 6. Policies for worker_consent_audit_events
CREATE POLICY "Workers can view their own consent audit events"
  ON public.worker_consent_audit_events
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.worker_profiles wp
      WHERE wp.id = worker_consent_audit_events.worker_profile_id
        AND wp.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all consent audit events"
  ON public.worker_consent_audit_events
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );
