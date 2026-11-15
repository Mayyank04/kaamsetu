-- Migration 22: Verified Regional Operations & Institutional Ratification
-- Expands enterprise pilot lifecycle, regional operational states, and creates ratification & market evaluation registries.

-- 1. Upgrade enterprise_pilot_engagements lifecycle states and proof references
ALTER TABLE public.enterprise_pilot_engagements
  DROP CONSTRAINT IF EXISTS enterprise_pilot_engagements_status_check;

ALTER TABLE public.enterprise_pilot_engagements
  ADD CONSTRAINT enterprise_pilot_engagements_status_check
  CHECK (status IN (
    'prospect',
    'due_diligence',
    'draft_agreement',
    'signed_agreement',
    'pilot_authorized',
    'worker_consent_verified',
    'roster_synced',
    'deployment_confirmed',
    'work_completed',
    'wage_payment_documented',
    'pilot_closed',
    'suspended',
    'terminated',
    'disputed',
    'draft',
    'consented',
    'pilot_active',
    'pilot_completed'
  ));

ALTER TABLE public.enterprise_pilot_engagements
  ADD COLUMN IF NOT EXISTS stamped_paper_ref text,
  ADD COLUMN IF NOT EXISTS authorized_signatory_name text,
  ADD COLUMN IF NOT EXISTS deployment_evidence_ref text,
  ADD COLUMN IF NOT EXISTS wage_payment_evidence_ref text;

-- 2. Upgrade operational_regions status check constraint to include 8-state taxonomy
ALTER TABLE public.operational_regions
  DROP CONSTRAINT IF EXISTS operational_regions_status_check;

ALTER TABLE public.operational_regions
  ADD CONSTRAINT operational_regions_status_check
  CHECK (status IN (
    'research',
    'candidate',
    'readiness_assessment',
    'conditionally_ready',
    'controlled_pilot',
    'active',
    'suspended',
    'closed',
    'proposed',
    'research_in_progress',
    'partner_validation',
    'worker_demand_validation',
    'operational_preparation',
    'operational_review',
    'planning',
    'deactivated'
  ));

-- 3. Create regional_market_evaluations table
CREATE TABLE IF NOT EXISTS public.regional_market_evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  region_code text NOT NULL,
  district_name text NOT NULL,
  evaluation_date date NOT NULL DEFAULT CURRENT_DATE,
  registered_workers_count integer NOT NULL DEFAULT 0 CHECK (registered_workers_count >= 0),
  consenting_workers_count integer NOT NULL DEFAULT 0 CHECK (consenting_workers_count >= 0),
  discoverable_workers_count integer NOT NULL DEFAULT 0 CHECK (discoverable_workers_count >= 0),
  available_workers_count integer NOT NULL DEFAULT 0 CHECK (available_workers_count >= 0),
  customer_enquiries_count integer NOT NULL DEFAULT 0 CHECK (customer_enquiries_count >= 0),
  confirmed_bookings_count integer NOT NULL DEFAULT 0 CHECK (confirmed_bookings_count >= 0),
  completed_jobs_count integer NOT NULL DEFAULT 0 CHECK (completed_jobs_count >= 0),
  confirmed_outcomes_count integer NOT NULL DEFAULT 0 CHECK (confirmed_outcomes_count >= 0),
  paid_work_count integer NOT NULL DEFAULT 0 CHECK (paid_work_count >= 0),
  active_disputes_count integer NOT NULL DEFAULT 0 CHECK (active_disputes_count >= 0),
  mandatory_gates_satisfied boolean NOT NULL DEFAULT false,
  operational_status text NOT NULL CHECK (operational_status IN (
    'research',
    'candidate',
    'readiness_assessment',
    'conditionally_ready',
    'controlled_pilot',
    'active',
    'suspended',
    'closed'
  )),
  evidence_sha256 text,
  evaluator_identity text NOT NULL,
  limitations_notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 4. Create institutional_ratification_records table
CREATE TABLE IF NOT EXISTS public.institutional_ratification_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_code text NOT NULL UNIQUE,
  institution_name text NOT NULL,
  institution_category text NOT NULL CHECK (institution_category IN (
    'open_network_ondc',
    'open_network_onest',
    'enterprise_epc',
    'regulated_nbfc',
    'state_skill_mission',
    'training_partner'
  )),
  legal_entity_verified boolean NOT NULL DEFAULT false,
  authorized_signatory_verified boolean NOT NULL DEFAULT false,
  instrument_type text NOT NULL CHECK (instrument_type IN (
    'stamped_commercial_agreement',
    'institutional_mou',
    'tripartite_lsp_agreement',
    'network_whitelisting_key',
    'training_accreditation_charter'
  )),
  execution_status text NOT NULL CHECK (execution_status IN (
    'uninitiated',
    'drafting',
    'legal_review',
    'counterparty_pending',
    'stamped_and_executed',
    'production_whitelisted',
    'suspended',
    'terminated',
    'disputed'
  )),
  instrument_reference text,
  effective_date date,
  expiry_date date,
  production_key_identifier text,
  worker_data_protection_terms boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT false,
  evidence_sha256 text,
  audit_notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 5. Enable Row-Level Security on newly created tables
ALTER TABLE public.regional_market_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutional_ratification_records ENABLE ROW LEVEL SECURITY;

-- 6. Define strict RLS policies for regional_market_evaluations
CREATE POLICY "Public read regional evaluations"
  ON public.regional_market_evaluations
  FOR SELECT
  USING (true);

CREATE POLICY "Admin write regional evaluations"
  ON public.regional_market_evaluations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 7. Define strict RLS policies for institutional_ratification_records
CREATE POLICY "Public read active institutional ratifications"
  ON public.institutional_ratification_records
  FOR SELECT
  USING (true);

CREATE POLICY "Admin write institutional ratifications"
  ON public.institutional_ratification_records
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
