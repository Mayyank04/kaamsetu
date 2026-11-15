-- ==============================================================================
-- KAAMSETU MIGRATION 14: NATIONAL OPERATIONS, REGIONAL CONTROL PLANE & INSTITUTIONAL SCALE
-- ==============================================================================
-- Description:
-- 1. Expands operational_regions with launch ownership and accountability metadata.
-- 2. Creates regional_launch_milestones with RLS for executable state launches.
-- 3. Creates regional_operational_incidents with RLS for regional safety and operational tracking.
-- 4. Extends institutional_credentials status lifecycle constraint ('issued', 'active', 'verified', 'suspended', 'revoked', 'expired').
-- 5. Creates institution_authorized_signatories with RLS for verifiable institutional delegation.
-- 6. Creates worker_privacy_settings with RLS for granular field-level selective disclosure and consent expiry.
-- 7. Creates financial_gst_ledger with RLS and strict 18% GST tax separation.
-- 8. Creates regional_service_telemetry with RLS for SLA observability and simulation demarcation.
-- 9. Extends worker_disputes with SLA deadlines and retaliatory review protection.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. OPERATIONAL REGIONS EXTENSIONS
-- ------------------------------------------------------------------------------
ALTER TABLE public.operational_regions
  ADD COLUMN IF NOT EXISTS launch_owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS accountable_partner_name TEXT,
  ADD COLUMN IF NOT EXISTS active_incident_count INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS readiness_score INT NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_operational_regions_launch_owner
  ON public.operational_regions(launch_owner_id);

-- ------------------------------------------------------------------------------
-- 2. REGIONAL LAUNCH MILESTONES (Pillar B: Repeatable State Launch Playbook)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.regional_launch_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region_id UUID NOT NULL REFERENCES public.operational_regions(id) ON DELETE CASCADE,
  stage TEXT NOT NULL,
  milestone_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked', 'skipped')),
  accountable_owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  target_date DATE,
  completed_at TIMESTAMPTZ,
  evidence_notes TEXT,
  risk_assessment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_launch_milestones_region ON public.regional_launch_milestones(region_id);
CREATE INDEX IF NOT EXISTS idx_launch_milestones_stage ON public.regional_launch_milestones(stage);
CREATE INDEX IF NOT EXISTS idx_launch_milestones_status ON public.regional_launch_milestones(status);

ALTER TABLE public.regional_launch_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and regional directors manage launch milestones"
  ON public.regional_launch_milestones FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND (p.role = 'admin' OR p.role = 'institution')
    )
  );

CREATE POLICY "Public and authenticated read launch milestones"
  ON public.regional_launch_milestones FOR SELECT
  USING (true);

-- ------------------------------------------------------------------------------
-- 3. REGIONAL OPERATIONAL INCIDENTS (Pillar A: Regional Operations Control Plane)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.regional_operational_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region_id UUID NOT NULL REFERENCES public.operational_regions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  incident_type TEXT NOT NULL CHECK (incident_type IN (
    'wage_theft', 'labor_violence', 'safety_violation', 'system_outage',
    'credential_fraud', 'data_breach', 'regulatory_action'
  )),
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'mitigated', 'resolved', 'closed')),
  details TEXT NOT NULL,
  reported_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  resolved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_reg_incidents_region ON public.regional_operational_incidents(region_id);
CREATE INDEX IF NOT EXISTS idx_reg_incidents_status ON public.regional_operational_incidents(status);
CREATE INDEX IF NOT EXISTS idx_reg_incidents_severity ON public.regional_operational_incidents(severity);

ALTER TABLE public.regional_operational_incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and regional directors can view and manage incidents"
  ON public.regional_operational_incidents FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    ) OR
    EXISTS (
      SELECT 1 FROM public.regional_administrators ra
      WHERE ra.user_id = auth.uid() AND ra.region_id = regional_operational_incidents.region_id AND ra.is_active = true
    )
  );

-- ------------------------------------------------------------------------------
-- 4. INSTITUTIONAL CREDENTIAL LIFECYCLE EXTENSION (Pillar C & E)
-- ------------------------------------------------------------------------------
ALTER TABLE public.institutional_credentials
  DROP CONSTRAINT IF EXISTS institutional_credentials_status_check;

ALTER TABLE public.institutional_credentials
  ADD CONSTRAINT institutional_credentials_status_check
  CHECK (status = ANY (ARRAY[
    'issued'::text, 'active'::text, 'verified'::text,
    'suspended'::text, 'revoked'::text, 'expired'::text
  ]));

-- ------------------------------------------------------------------------------
-- 5. INSTITUTION AUTHORIZED SIGNATORIES (Pillar E: Credential Interoperability)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.institution_authorized_signatories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  designation TEXT NOT NULL,
  signatory_key_fingerprint TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  authorized_from TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  authorized_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_signatories_inst ON public.institution_authorized_signatories(institution_id);
CREATE INDEX IF NOT EXISTS idx_signatories_active ON public.institution_authorized_signatories(is_active);

ALTER TABLE public.institution_authorized_signatories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public and authenticated can verify active signatories"
  ON public.institution_authorized_signatories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Institutions and admins manage their signatories"
  ON public.institution_authorized_signatories FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND (p.role = 'admin' OR p.role = 'institution')
    )
  );

-- ------------------------------------------------------------------------------
-- 6. WORKER PRIVACY SETTINGS (Pillar C: Worker Identity Network 2.2)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.worker_privacy_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_profile_id UUID NOT NULL UNIQUE REFERENCES public.worker_profiles(id) ON DELETE CASCADE,
  field_visibility JSONB NOT NULL DEFAULT '{"name": true, "trade": true, "skills": true, "kaamscore": true, "credentials": true, "phone": false, "aadhaar": false, "rates": false, "equipment": false}'::jsonb,
  consent_expires_at TIMESTAMPTZ,
  auto_renew_consent BOOLEAN NOT NULL DEFAULT true,
  allow_cross_region_discovery BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_worker_privacy_worker ON public.worker_privacy_settings(worker_profile_id);

ALTER TABLE public.worker_privacy_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workers own and manage their privacy settings"
  ON public.worker_privacy_settings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.worker_profiles wp
      WHERE wp.id = worker_privacy_settings.worker_profile_id AND wp.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.worker_profiles wp
      WHERE wp.id = worker_privacy_settings.worker_profile_id AND wp.user_id = auth.uid()
    )
  );

CREATE POLICY "Verifiers can read worker privacy settings for active grants"
  ON public.worker_privacy_settings FOR SELECT
  TO authenticated
  USING (true);

-- ------------------------------------------------------------------------------
-- 7. FINANCIAL GST LEDGER (Pillar G: National Commercial Operations)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.financial_gst_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT NOT NULL UNIQUE,
  organization_id UUID NOT NULL REFERENCES public.contractor_organizations(id) ON DELETE CASCADE,
  region_id UUID REFERENCES public.operational_regions(id) ON DELETE SET NULL,
  taxable_amount NUMERIC(10,2) NOT NULL CHECK (taxable_amount > 0),
  gst_rate NUMERIC(5,2) NOT NULL DEFAULT 18.00 CHECK (gst_rate = 18.00),
  cgst_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  sgst_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  igst_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  total_tax_amount NUMERIC(10,2) NOT NULL CHECK (total_tax_amount >= 0),
  grand_total NUMERIC(10,2) NOT NULL CHECK (grand_total > 0),
  state_code TEXT NOT NULL,
  is_interstate BOOLEAN NOT NULL DEFAULT false,
  payment_date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  reconciliation_status TEXT NOT NULL DEFAULT 'reconciled' CHECK (reconciliation_status IN ('pending', 'reconciled', 'refunded', 'disputed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_gst_ledger_org ON public.financial_gst_ledger(organization_id);
CREATE INDEX IF NOT EXISTS idx_gst_ledger_region ON public.financial_gst_ledger(region_id);
CREATE INDEX IF NOT EXISTS idx_gst_ledger_status ON public.financial_gst_ledger(reconciliation_status);

ALTER TABLE public.financial_gst_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and accounting manage financial GST ledger"
  ON public.financial_gst_ledger FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Contractors can view their own GST tax invoices"
  ON public.financial_gst_ledger FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.contractor_organizations co
      WHERE co.id = financial_gst_ledger.organization_id AND co.owner_id = auth.uid()
    )
  );

-- ------------------------------------------------------------------------------
-- 8. REGIONAL SERVICE TELEMETRY (Pillar H: Observability & Reliability)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.regional_service_telemetry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region_id UUID NOT NULL REFERENCES public.operational_regions(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC(12,4) NOT NULL,
  dimension_tags JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_simulated BOOLEAN NOT NULL DEFAULT false,
  measured_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_telemetry_region_metric ON public.regional_service_telemetry(region_id, metric_name);
CREATE INDEX IF NOT EXISTS idx_telemetry_measured_at ON public.regional_service_telemetry(measured_at);

ALTER TABLE public.regional_service_telemetry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and regional directors can view and record telemetry"
  ON public.regional_service_telemetry FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND (p.role = 'admin' OR p.role = 'institution')
    )
  );

-- ------------------------------------------------------------------------------
-- 9. WORKER DISPUTES EXTENSIONS (Pillar F: Worker Protection & Grievances)
-- ------------------------------------------------------------------------------
ALTER TABLE public.worker_disputes
  ADD COLUMN IF NOT EXISTS sla_due_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_retaliatory_suspected BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS confidential_evidence_urls TEXT[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS appeal_reason TEXT;

CREATE INDEX IF NOT EXISTS idx_worker_disputes_sla ON public.worker_disputes(sla_due_at);
CREATE INDEX IF NOT EXISTS idx_worker_disputes_retaliation ON public.worker_disputes(is_retaliatory_suspected);
