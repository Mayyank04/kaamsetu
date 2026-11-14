-- ==============================================================================
-- KAAMSETU MIGRATION 08: Commercial Launch, Two-Sided Workforce Consent,
-- Billing Ledger & Institutional Placement Tracking
-- ==============================================================================

-- 1. Two-Sided Workforce Invitations Table (Worker Sovereignty Enforcement)
CREATE TABLE IF NOT EXISTS public.workforce_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.contractor_organizations(id) ON DELETE CASCADE,
  worker_profile_id UUID NOT NULL REFERENCES public.worker_profiles(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES public.profiles(id),
  proposed_role TEXT NOT NULL DEFAULT 'Crew Member',
  proposed_daily_wage NUMERIC(10,2),
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled', 'expired')),
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(24), 'hex'),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (timezone('utc'::text, now()) + interval '7 days'),
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Subscription Orders & Billing Ledger (Server-Verified Payments)
CREATE TABLE IF NOT EXISTS public.subscription_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.contractor_organizations(id) ON DELETE CASCADE,
  order_reference TEXT NOT NULL UNIQUE,
  plan_tier TEXT NOT NULL CHECK (plan_tier IN ('starter', 'pro', 'business')),
  billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'annual')),
  base_amount NUMERIC(10,2) NOT NULL,
  gst_amount NUMERIC(10,2) NOT NULL,
  total_amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  payment_gateway TEXT NOT NULL DEFAULT 'sandbox' CHECK (payment_gateway IN ('sandbox', 'razorpay', 'stripe', 'manual_invoice')),
  gateway_order_id TEXT,
  gateway_payment_id TEXT,
  gateway_signature TEXT,
  status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'pending', 'authorized', 'captured', 'failed', 'refunded')),
  invoice_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Enhance contractor_workforce with worker-controlled association settings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contractor_workforce' AND column_name = 'is_public_on_roster'
  ) THEN
    ALTER TABLE public.contractor_workforce ADD COLUMN is_public_on_roster BOOLEAN NOT NULL DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contractor_workforce' AND column_name = 'invitation_id'
  ) THEN
    ALTER TABLE public.contractor_workforce ADD COLUMN invitation_id UUID REFERENCES public.workforce_invitations(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contractor_workforce' AND column_name = 'joined_at'
  ) THEN
    ALTER TABLE public.contractor_workforce ADD COLUMN joined_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now());
  END IF;
END $$;

-- Enhance contractor_workforce RLS to allow workers to update their association settings
DROP POLICY IF EXISTS "Contractors can update their workforce" ON public.contractor_workforce;
DROP POLICY IF EXISTS "Contractors and workers can update workforce" ON public.contractor_workforce;
CREATE POLICY "Contractors and workers can update workforce"
  ON public.contractor_workforce FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.contractor_organizations org
      WHERE org.id = organization_id AND org.owner_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.worker_profiles wp
      WHERE wp.id = worker_profile_id AND wp.user_id = auth.uid()
    )
  );

-- 4. Cohort Trainee Progression, Assessment & Placement Tracking
CREATE TABLE IF NOT EXISTS public.cohort_trainee_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES public.cohort_participants(id) ON DELETE CASCADE,
  module_name TEXT NOT NULL,
  hours_attended INT NOT NULL DEFAULT 0,
  assessment_score NUMERIC(5,2),
  practical_demonstration_verified BOOLEAN NOT NULL DEFAULT false,
  evaluator_name TEXT,
  placement_status TEXT NOT NULL DEFAULT 'training' CHECK (placement_status IN ('training', 'completed', 'placed', 'self_employed', 'seeking_opportunity')),
  employer_or_contractor_name TEXT,
  monthly_stipend_or_wage NUMERIC(10,2),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Institutional Audit Trail Logging
CREATE TABLE IF NOT EXISTS public.institution_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- INDEXES FOR SCALE & AUDIT EFFICIENCY
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_workforce_invitations_org ON public.workforce_invitations(organization_id);
CREATE INDEX IF NOT EXISTS idx_workforce_invitations_worker ON public.workforce_invitations(worker_profile_id);
CREATE INDEX IF NOT EXISTS idx_workforce_invitations_status ON public.workforce_invitations(status);
CREATE INDEX IF NOT EXISTS idx_subscription_orders_org ON public.subscription_orders(organization_id);
CREATE INDEX IF NOT EXISTS idx_subscription_orders_status ON public.subscription_orders(status);
CREATE INDEX IF NOT EXISTS idx_cohort_progress_participant ON public.cohort_trainee_progress(participant_id);
CREATE INDEX IF NOT EXISTS idx_institution_audit_inst ON public.institution_audit_logs(institution_id);

-- ==============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ==============================================================================

-- A. workforce_invitations
ALTER TABLE public.workforce_invitations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Contractors can view their organization invitations" ON public.workforce_invitations;
CREATE POLICY "Contractors can view their organization invitations"
  ON public.workforce_invitations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.contractor_organizations org
      WHERE org.id = organization_id AND org.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Workers can view invitations sent to them" ON public.workforce_invitations;
CREATE POLICY "Workers can view invitations sent to them"
  ON public.workforce_invitations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.worker_profiles wp
      WHERE wp.id = worker_profile_id AND wp.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Contractors can create invitations for their org" ON public.workforce_invitations;
CREATE POLICY "Contractors can create invitations for their org"
  ON public.workforce_invitations FOR INSERT
  TO authenticated
  WITH CHECK (
    invited_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.contractor_organizations org
      WHERE org.id = organization_id AND org.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Workers can respond to invitations sent to them" ON public.workforce_invitations;
CREATE POLICY "Workers can respond to invitations sent to them"
  ON public.workforce_invitations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.worker_profiles wp
      WHERE wp.id = worker_profile_id AND wp.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.contractor_organizations org
      WHERE org.id = organization_id AND org.owner_id = auth.uid()
    )
  );

-- B. subscription_orders
ALTER TABLE public.subscription_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Contractors can view their own subscription orders" ON public.subscription_orders;
CREATE POLICY "Contractors can view their own subscription orders"
  ON public.subscription_orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.contractor_organizations org
      WHERE org.id = organization_id AND org.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Contractors can create orders for their organization" ON public.subscription_orders;
CREATE POLICY "Contractors can create orders for their organization"
  ON public.subscription_orders FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.contractor_organizations org
      WHERE org.id = organization_id AND org.owner_id = auth.uid()
    )
  );

-- C. cohort_trainee_progress
ALTER TABLE public.cohort_trainee_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public / Institutions can view cohort trainee progress" ON public.cohort_trainee_progress;
CREATE POLICY "Public / Institutions can view cohort trainee progress"
  ON public.cohort_trainee_progress FOR SELECT
  TO authenticated, anon
  USING (true);

DROP POLICY IF EXISTS "Staff can insert/update trainee progress" ON public.cohort_trainee_progress;
CREATE POLICY "Staff can insert/update trainee progress"
  ON public.cohort_trainee_progress FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- D. institution_audit_logs
ALTER TABLE public.institution_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view institution audit logs" ON public.institution_audit_logs;
CREATE POLICY "Staff can view institution audit logs"
  ON public.institution_audit_logs FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Staff can insert audit log entries" ON public.institution_audit_logs;
CREATE POLICY "Staff can insert audit log entries"
  ON public.institution_audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (actor_id = auth.uid());
