-- ==============================================================================
-- KAAMSETU MIGRATION 07: Contractor Pro SaaS, Institutional Platform, Anti-Fraud & Scale
-- ==============================================================================

-- 1. Extend AppRole enum to include 'institution'
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'app_role' AND e.enumlabel = 'institution'
  ) THEN
    ALTER TYPE public.app_role ADD VALUE 'institution';
  END IF;
END $$;

-- 2. Contractor Pro SaaS: Organizations Table
CREATE TABLE IF NOT EXISTS public.contractor_organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  gstin TEXT,
  business_type TEXT NOT NULL DEFAULT 'proprietorship' CHECK (business_type IN ('proprietorship', 'partnership', 'private_limited', 'llp', 'individual')),
  operating_city TEXT NOT NULL,
  operating_state TEXT NOT NULL DEFAULT 'Assam',
  subscription_tier TEXT NOT NULL DEFAULT 'starter' CHECK (subscription_tier IN ('starter', 'pro', 'business')),
  subscription_status TEXT NOT NULL DEFAULT 'active' CHECK (subscription_status IN ('active', 'past_due', 'cancelled', 'trialing')),
  subscription_expires_at TIMESTAMPTZ,
  max_roster_workers INT NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT contractor_organizations_owner_unique UNIQUE (owner_id)
);

-- 3. Contractor Pro SaaS: Workforce Roster (Workers on Organization Roster)
CREATE TABLE IF NOT EXISTS public.contractor_workforce (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.contractor_organizations(id) ON DELETE CASCADE,
  worker_profile_id UUID NOT NULL REFERENCES public.worker_profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave')),
  project_role TEXT NOT NULL DEFAULT 'Crew Member',
  daily_wage_rate NUMERIC(10,2),
  added_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT contractor_workforce_org_worker_unique UNIQUE (organization_id, worker_profile_id)
);

-- 4. Contractor Pro SaaS: Projects Table
CREATE TABLE IF NOT EXISTS public.contractor_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.contractor_organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  client_name TEXT NOT NULL,
  location TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'in_progress', 'completed', 'on_hold')),
  budget NUMERIC(12,2),
  start_date DATE NOT NULL,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Institutional Partnerships: Partner Institutions Table
CREATE TABLE IF NOT EXISTS public.institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  institution_type TEXT NOT NULL CHECK (institution_type IN ('state_mission', 'vocational_iti', 'polytechnic', 'ngo', 'industry_association')),
  state TEXT NOT NULL DEFAULT 'Assam',
  district TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  partner_status TEXT NOT NULL DEFAULT 'in_discussion' CHECK (partner_status IN ('identified', 'contacted', 'in_discussion', 'pilot_proposal', 'agreement_signed', 'operational')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. Institutional Partnerships: Cohorts Table
CREATE TABLE IF NOT EXISTS public.institutional_cohorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  trade TEXT NOT NULL,
  target_capacity INT NOT NULL DEFAULT 30,
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('upcoming', 'active', 'completed', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. Institutional Partnerships: Cohort Participants Table (Granular Consent Enforced)
CREATE TABLE IF NOT EXISTS public.cohort_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id UUID NOT NULL REFERENCES public.institutional_cohorts(id) ON DELETE CASCADE,
  worker_profile_id UUID NOT NULL REFERENCES public.worker_profiles(id) ON DELETE CASCADE,
  consent_for_institution BOOLEAN NOT NULL DEFAULT false,
  training_completed BOOLEAN NOT NULL DEFAULT false,
  credential_issued BOOLEAN NOT NULL DEFAULT false,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT cohort_participants_unique UNIQUE (cohort_id, worker_profile_id)
);

-- 8. Trust, Reputation & Anti-Fraud: Abuse Reports
CREATE TABLE IF NOT EXISTS public.abuse_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('worker_profile', 'review', 'booking', 'contractor')),
  target_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. Trust, Reputation & Anti-Fraud: Worker Profile Correction Requests
CREATE TABLE IF NOT EXISTS public.profile_corrections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_profile_id UUID NOT NULL REFERENCES public.worker_profiles(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  correction_reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- PERFORMANCE & SEARCH INDEXES (Scaling Architecture)
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_worker_profiles_city_state ON public.worker_profiles(city, state);
CREATE INDEX IF NOT EXISTS idx_worker_profiles_occupation ON public.worker_profiles(occupation_id);
CREATE INDEX IF NOT EXISTS idx_contractor_workforce_org ON public.contractor_workforce(organization_id);
CREATE INDEX IF NOT EXISTS idx_contractor_projects_org ON public.contractor_projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_cohort_participants_cohort ON public.cohort_participants(cohort_id);
CREATE INDEX IF NOT EXISTS idx_cohort_participants_worker ON public.cohort_participants(worker_profile_id);
CREATE INDEX IF NOT EXISTS idx_abuse_reports_target ON public.abuse_reports(target_type, target_id);

-- ==============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ==============================================================================

-- A. contractor_organizations
ALTER TABLE public.contractor_organizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Contractors can view their own organization" ON public.contractor_organizations;
CREATE POLICY "Contractors can view their own organization"
  ON public.contractor_organizations FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "Contractors can insert their own organization" ON public.contractor_organizations;
CREATE POLICY "Contractors can insert their own organization"
  ON public.contractor_organizations FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "Contractors can update their own organization" ON public.contractor_organizations;
CREATE POLICY "Contractors can update their own organization"
  ON public.contractor_organizations FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- B. contractor_workforce
ALTER TABLE public.contractor_workforce ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Contractors can view their own workforce" ON public.contractor_workforce;
CREATE POLICY "Contractors can view their own workforce"
  ON public.contractor_workforce FOR SELECT
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

DROP POLICY IF EXISTS "Contractors can add workers to their workforce" ON public.contractor_workforce;
CREATE POLICY "Contractors can add workers to their workforce"
  ON public.contractor_workforce FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.contractor_organizations org
      WHERE org.id = organization_id AND org.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Contractors can update their workforce" ON public.contractor_workforce;
CREATE POLICY "Contractors can update their workforce"
  ON public.contractor_workforce FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.contractor_organizations org
      WHERE org.id = organization_id AND org.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Contractors can delete workers from their workforce" ON public.contractor_workforce;
CREATE POLICY "Contractors can delete workers from their workforce"
  ON public.contractor_workforce FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.contractor_organizations org
      WHERE org.id = organization_id AND org.owner_id = auth.uid()
    )
  );

-- C. contractor_projects
ALTER TABLE public.contractor_projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Contractors can view their own projects" ON public.contractor_projects;
CREATE POLICY "Contractors can view their own projects"
  ON public.contractor_projects FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.contractor_organizations org
      WHERE org.id = organization_id AND org.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Contractors can create projects" ON public.contractor_projects;
CREATE POLICY "Contractors can create projects"
  ON public.contractor_projects FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.contractor_organizations org
      WHERE org.id = organization_id AND org.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Contractors can update their own projects" ON public.contractor_projects;
CREATE POLICY "Contractors can update their own projects"
  ON public.contractor_projects FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.contractor_organizations org
      WHERE org.id = organization_id AND org.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Contractors can delete their own projects" ON public.contractor_projects;
CREATE POLICY "Contractors can delete their own projects"
  ON public.contractor_projects FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.contractor_organizations org
      WHERE org.id = organization_id AND org.owner_id = auth.uid()
    )
  );

-- D. institutions
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view partner institutions" ON public.institutions;
CREATE POLICY "Public can view partner institutions"
  ON public.institutions FOR SELECT
  TO authenticated, anon
  USING (true);

-- E. institutional_cohorts
ALTER TABLE public.institutional_cohorts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view institutional cohorts" ON public.institutional_cohorts;
CREATE POLICY "Public can view institutional cohorts"
  ON public.institutional_cohorts FOR SELECT
  TO authenticated, anon
  USING (true);

-- F. cohort_participants (Granular Consent Policy)
ALTER TABLE public.cohort_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Workers can view their own cohort participation" ON public.cohort_participants;
CREATE POLICY "Workers can view their own cohort participation"
  ON public.cohort_participants FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.worker_profiles wp
      WHERE wp.id = worker_profile_id AND wp.user_id = auth.uid()
    )
    OR
    consent_for_institution = true
  );

DROP POLICY IF EXISTS "Workers can update their own cohort consent" ON public.cohort_participants;
CREATE POLICY "Workers can update their own cohort consent"
  ON public.cohort_participants FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.worker_profiles wp
      WHERE wp.id = worker_profile_id AND wp.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.worker_profiles wp
      WHERE wp.id = worker_profile_id AND wp.user_id = auth.uid()
    )
  );

-- G. abuse_reports
ALTER TABLE public.abuse_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can submit abuse reports" ON public.abuse_reports;
CREATE POLICY "Authenticated users can submit abuse reports"
  ON public.abuse_reports FOR INSERT
  TO authenticated
  WITH CHECK (reporter_id = auth.uid());

DROP POLICY IF EXISTS "Reporters can view their own submitted reports" ON public.abuse_reports;
CREATE POLICY "Reporters can view their own submitted reports"
  ON public.abuse_reports FOR SELECT
  TO authenticated
  USING (reporter_id = auth.uid());

-- H. profile_corrections
ALTER TABLE public.profile_corrections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Workers can submit correction requests for their profile" ON public.profile_corrections;
CREATE POLICY "Workers can submit correction requests for their profile"
  ON public.profile_corrections FOR INSERT
  TO authenticated
  WITH CHECK (
    requested_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.worker_profiles wp
      WHERE wp.id = worker_profile_id AND wp.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Workers can view their own correction requests" ON public.profile_corrections;
CREATE POLICY "Workers can view their own correction requests"
  ON public.profile_corrections FOR SELECT
  TO authenticated
  USING (
    requested_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.worker_profiles wp
      WHERE wp.id = worker_profile_id AND wp.user_id = auth.uid()
    )
  );
