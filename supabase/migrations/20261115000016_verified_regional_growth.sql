-- Migration 16: Phase 15 Verified Regional Growth & Workforce Network
-- Adds regional liquidity snapshots, worker payout confirmations, customer success events,
-- institutional onboarding lifecycle, worker support assignments, and analytics provenance.

-- 1. Regional Network Liquidity Snapshots
CREATE TABLE IF NOT EXISTS public.regional_network_liquidity_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region_code TEXT NOT NULL,
  snapshot_date DATE NOT NULL,
  reporting_window TEXT NOT NULL DEFAULT '30d' CHECK (reporting_window IN ('7d', '30d', '90d')),
  registered_workers INTEGER NOT NULL DEFAULT 0,
  confirmed_workers INTEGER NOT NULL DEFAULT 0,
  credential_verified_workers INTEGER NOT NULL DEFAULT 0,
  recently_active_workers INTEGER NOT NULL DEFAULT 0,
  available_workers INTEGER NOT NULL DEFAULT 0,
  interstate_mobility_workers INTEGER NOT NULL DEFAULT 0,
  job_completing_workers INTEGER NOT NULL DEFAULT 0,
  active_contractors INTEGER NOT NULL DEFAULT 0,
  active_customers INTEGER NOT NULL DEFAULT 0,
  projects_published INTEGER NOT NULL DEFAULT 0,
  qualified_matches INTEGER NOT NULL DEFAULT 0,
  accepted_opportunities INTEGER NOT NULL DEFAULT 0,
  confirmed_bookings INTEGER NOT NULL DEFAULT 0,
  completed_jobs INTEGER NOT NULL DEFAULT 0,
  avg_time_to_first_match_ms NUMERIC(10,2) DEFAULT 0,
  avg_time_to_first_booking_ms NUMERIC(10,2) DEFAULT 0,
  booking_completion_rate NUMERIC(5,2) DEFAULT 0,
  repeat_booking_rate NUMERIC(5,2) DEFAULT 0,
  opportunity_fulfilment_rate NUMERIC(5,2) DEFAULT 0,
  liquidity_status TEXT NOT NULL DEFAULT 'emerging' CHECK (liquidity_status IN ('dormant', 'emerging', 'liquid', 'undersupplied', 'underdemanded')),
  action_recommendation TEXT NOT NULL CHECK (action_recommendation IN ('continue_controlled_operations', 'increase_worker_acquisition', 'increase_customer_acquisition', 'improve_trade_coverage', 'improve_field_support', 'pause_expansion', 'enter_operational_review')),
  is_simulated BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT regional_liquidity_snapshot_unique UNIQUE (region_code, snapshot_date, reporting_window)
);

CREATE INDEX IF NOT EXISTS idx_reg_liquidity_region_date ON public.regional_network_liquidity_snapshots(region_code, snapshot_date);
ALTER TABLE public.regional_network_liquidity_snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read active operational liquidity snapshots" ON public.regional_network_liquidity_snapshots;
CREATE POLICY "Public read active operational liquidity snapshots"
  ON public.regional_network_liquidity_snapshots FOR SELECT
  TO authenticated, anon
  USING (true);

DROP POLICY IF EXISTS "Admins have full access to regional liquidity snapshots" ON public.regional_network_liquidity_snapshots;
CREATE POLICY "Admins have full access to regional liquidity snapshots"
  ON public.regional_network_liquidity_snapshots
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 2. Worker Payout Confirmations
CREATE TABLE IF NOT EXISTS public.worker_payout_confirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_record_id UUID REFERENCES public.payment_records_ledger(id) ON DELETE CASCADE,
  worker_profile_id UUID NOT NULL REFERENCES public.worker_profiles(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  contractor_organization_id UUID REFERENCES public.contractor_organizations(id) ON DELETE SET NULL,
  contractor_declared_amount NUMERIC(10,2) NOT NULL CHECK (contractor_declared_amount >= 0),
  worker_agreed_amount NUMERIC(10,2) NOT NULL CHECK (worker_agreed_amount >= 0),
  actual_payout_amount NUMERIC(10,2) NOT NULL CHECK (actual_payout_amount >= 0),
  payout_method TEXT NOT NULL CHECK (payout_method IN ('bank_transfer', 'upi', 'cash_voucher_verified')),
  payout_reference TEXT,
  payout_date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  worker_confirmation_status TEXT NOT NULL DEFAULT 'pending' CHECK (worker_confirmation_status IN ('pending', 'confirmed_received', 'disputed_amount', 'disputed_unpaid')),
  worker_confirmed_at TIMESTAMPTZ,
  worker_disputed_amount NUMERIC(10,2) DEFAULT 0.00,
  worker_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_payout_worker ON public.worker_payout_confirmations(worker_profile_id);
CREATE INDEX IF NOT EXISTS idx_payout_contractor ON public.worker_payout_confirmations(contractor_organization_id);
CREATE INDEX IF NOT EXISTS idx_payout_record ON public.worker_payout_confirmations(payment_record_id);
ALTER TABLE public.worker_payout_confirmations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Workers can view and confirm their own payouts" ON public.worker_payout_confirmations;
CREATE POLICY "Workers can view and confirm their own payouts"
  ON public.worker_payout_confirmations FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.worker_profiles wp WHERE wp.id = worker_payout_confirmations.worker_profile_id AND wp.user_id = auth.uid()));

DROP POLICY IF EXISTS "Workers can update their confirmation status" ON public.worker_payout_confirmations;
CREATE POLICY "Workers can update their confirmation status"
  ON public.worker_payout_confirmations FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.worker_profiles wp WHERE wp.id = worker_payout_confirmations.worker_profile_id AND wp.user_id = auth.uid()));

DROP POLICY IF EXISTS "Contractors can view payouts for their projects" ON public.worker_payout_confirmations;
CREATE POLICY "Contractors can view payouts for their projects"
  ON public.worker_payout_confirmations FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.contractor_organizations co
    JOIN public.contractor_team_members ctm ON ctm.organization_id = co.id
    WHERE co.id = worker_payout_confirmations.contractor_organization_id AND ctm.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Admins have full access to worker payouts" ON public.worker_payout_confirmations;
CREATE POLICY "Admins have full access to worker payouts"
  ON public.worker_payout_confirmations
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 3. Contractor Customer Success Events
CREATE TABLE IF NOT EXISTS public.contractor_customer_success_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.contractor_organizations(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('trial_started', 'trial_converted', 'plan_renewed', 'plan_upgraded', 'plan_downgraded', 'churn_warning', 'cancellation_requested', 'support_ticket_resolved')),
  previous_tier TEXT,
  new_tier TEXT,
  health_score INTEGER NOT NULL DEFAULT 100 CHECK (health_score BETWEEN 0 AND 100),
  roster_utilization_percent NUMERIC(5,2) DEFAULT 0,
  active_projects_count INTEGER DEFAULT 0,
  churn_risk_level TEXT NOT NULL DEFAULT 'low' CHECK (churn_risk_level IN ('low', 'medium', 'high', 'critical')),
  cancellation_reason TEXT,
  support_resolution_ms BIGINT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_customer_success_org ON public.contractor_customer_success_events(organization_id);
ALTER TABLE public.contractor_customer_success_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Contractor members can view their own success events" ON public.contractor_customer_success_events;
CREATE POLICY "Contractor members can view their own success events"
  ON public.contractor_customer_success_events FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.contractor_team_members ctm
    WHERE ctm.organization_id = contractor_customer_success_events.organization_id AND ctm.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Admins have full access to contractor success events" ON public.contractor_customer_success_events;
CREATE POLICY "Admins have full access to contractor success events"
  ON public.contractor_customer_success_events
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 4. Institutional Onboarding Lifecycle
CREATE TABLE IF NOT EXISTS public.institutional_onboarding_lifecycle (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  stage TEXT NOT NULL DEFAULT 'initial_application' CHECK (stage IN ('initial_application', 'organization_verified', 'signatory_validated', 'integration_review', 'sandbox_testing', 'security_approved', 'production_active', 'periodic_reverification')),
  stage_status TEXT NOT NULL DEFAULT 'in_progress' CHECK (stage_status IN ('in_progress', 'completed', 'blocked', 'failed')),
  completed_stages TEXT[] DEFAULT ARRAY[]::TEXT[],
  mou_reference TEXT,
  mou_signed_at TIMESTAMPTZ,
  technical_integration_verified BOOLEAN NOT NULL DEFAULT false,
  sandbox_test_passed BOOLEAN NOT NULL DEFAULT false,
  security_signoff_by UUID REFERENCES public.profiles(id),
  authorized_signatory_name TEXT,
  authorized_signatory_designation TEXT,
  blockers TEXT[] DEFAULT ARRAY[]::TEXT[],
  last_reverified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_inst_onboarding_institution ON public.institutional_onboarding_lifecycle(institution_id);
ALTER TABLE public.institutional_onboarding_lifecycle ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Institutions and admins can view onboarding lifecycle" ON public.institutional_onboarding_lifecycle;
CREATE POLICY "Institutions and admins can view onboarding lifecycle"
  ON public.institutional_onboarding_lifecycle FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND (p.role = 'admin'::app_role OR p.role = 'institution'::app_role)
  ));

DROP POLICY IF EXISTS "Admins have full access to institutional onboarding lifecycle" ON public.institutional_onboarding_lifecycle;
CREATE POLICY "Admins have full access to institutional onboarding lifecycle"
  ON public.institutional_onboarding_lifecycle
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 5. Worker Support Assignments
CREATE TABLE IF NOT EXISTS public.worker_support_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_profile_id UUID NOT NULL REFERENCES public.worker_profiles(id) ON DELETE CASCADE,
  support_category TEXT NOT NULL CHECK (support_category IN ('immediate_safety_risk', 'wage_dispute', 'identity_theft', 'fraud', 'retaliation', 'discrimination', 'service_complaint')),
  priority TEXT NOT NULL DEFAULT 'tier_3_standard' CHECK (priority IN ('tier_1_critical', 'tier_2_urgent', 'tier_3_standard')),
  assigned_coordinator_id UUID REFERENCES public.profiles(id),
  region_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'acknowledged', 'action_taken', 'resolved', 'escalated', 'reopened')),
  intake_notes TEXT,
  action_summary TEXT,
  resolution_notes TEXT,
  acknowledged_at TIMESTAMPTZ,
  first_action_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  worker_satisfaction_score INTEGER CHECK (worker_satisfaction_score BETWEEN 1 AND 5),
  is_whistleblower BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_support_worker ON public.worker_support_assignments(worker_profile_id);
CREATE INDEX IF NOT EXISTS idx_support_coord ON public.worker_support_assignments(assigned_coordinator_id);
CREATE INDEX IF NOT EXISTS idx_support_region ON public.worker_support_assignments(region_code);
ALTER TABLE public.worker_support_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Workers can view their own support assignments" ON public.worker_support_assignments;
CREATE POLICY "Workers can view their own support assignments"
  ON public.worker_support_assignments FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.worker_profiles wp WHERE wp.id = worker_support_assignments.worker_profile_id AND wp.user_id = auth.uid()));

DROP POLICY IF EXISTS "Field coordinators can view regional support assignments" ON public.worker_support_assignments;
CREATE POLICY "Field coordinators can view regional support assignments"
  ON public.worker_support_assignments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.regional_administrators ra
      JOIN public.operational_regions opr ON opr.id = ra.region_id
      WHERE ra.user_id = auth.uid() AND opr.region_code = worker_support_assignments.region_code
    )
    OR
    assigned_coordinator_id = auth.uid()
  );

DROP POLICY IF EXISTS "Admins have full access to worker support assignments" ON public.worker_support_assignments;
CREATE POLICY "Admins have full access to worker support assignments"
  ON public.worker_support_assignments
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 6. Analytics Provenance Events
CREATE TABLE IF NOT EXISTS public.analytics_provenance_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('worker', 'contractor', 'institution', 'booking', 'match', 'opportunity')),
  entity_id TEXT NOT NULL,
  region_code TEXT NOT NULL,
  is_simulated BOOLEAN NOT NULL DEFAULT false,
  model_version TEXT,
  prompt_version TEXT,
  extraction_confidence NUMERIC(5,2),
  worker_confirmed BOOLEAN,
  worker_corrected BOOLEAN,
  payload_hash VARCHAR(64) NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_analytics_provenance_entity ON public.analytics_provenance_events(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_analytics_provenance_region ON public.analytics_provenance_events(region_code);
ALTER TABLE public.analytics_provenance_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins have full access to analytics provenance events" ON public.analytics_provenance_events;
CREATE POLICY "Admins have full access to analytics provenance events"
  ON public.analytics_provenance_events
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
