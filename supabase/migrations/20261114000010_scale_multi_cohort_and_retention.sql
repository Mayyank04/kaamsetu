-- ==============================================================================
-- KAAMSETU DATABASE MIGRATION 10: SCALE, MULTI-COHORT, RETENTION & REGIONAL OPS
-- ==============================================================================
-- Purpose:
-- 1. Contractor team administration & multi-supervisor roles (Contractor Pro/Biz)
-- 2. Project crew assignments and workforce utilization scheduling
-- 3. Contractor customer health scoring and retention telemetry
-- 4. Worker portable identity export audit log (DPDP Section 12)
-- 5. Regional expansion readiness metadata & district scorecard
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. CONTRACTOR TEAM MEMBERS (Role-Based Administration)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contractor_team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.contractor_organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'project_supervisor', 'site_thekedaar', 'finance_admin')),
    permissions JSONB NOT NULL DEFAULT '{"can_invite_workers": true, "can_assign_projects": true, "can_view_billing": false}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(organization_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_contractor_team_org ON public.contractor_team_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_contractor_team_user ON public.contractor_team_members(user_id);

ALTER TABLE public.contractor_team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Contractor team members can view own organization team"
    ON public.contractor_team_members
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.contractor_organizations co
            WHERE co.id = organization_id AND (
                co.owner_id = auth.uid() OR
                EXISTS (SELECT 1 FROM public.contractor_team_members tm WHERE tm.organization_id = co.id AND tm.user_id = auth.uid())
            )
        )
    );

CREATE POLICY "Contractor organization owner can manage team members"
    ON public.contractor_team_members
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.contractor_organizations co
            WHERE co.id = organization_id AND co.owner_id = auth.uid()
        )
    );

-- ------------------------------------------------------------------------------
-- 2. PROJECT CREW ASSIGNMENTS (Multi-Project Workforce Allocation)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.project_crew_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.contractor_projects(id) ON DELETE CASCADE,
    workforce_id UUID NOT NULL REFERENCES public.contractor_workforce(id) ON DELETE CASCADE,
    assigned_by UUID NOT NULL,
    assigned_role TEXT NOT NULL,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    status TEXT NOT NULL CHECK (status IN ('scheduled', 'active', 'completed', 'released')) DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(project_id, workforce_id)
);

CREATE INDEX IF NOT EXISTS idx_crew_assignments_proj ON public.project_crew_assignments(project_id);
CREATE INDEX IF NOT EXISTS idx_crew_assignments_wf ON public.project_crew_assignments(workforce_id);

ALTER TABLE public.project_crew_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Contractors can manage crew assignments for their projects"
    ON public.project_crew_assignments
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.contractor_projects cp
            JOIN public.contractor_organizations co ON co.id = cp.organization_id
            WHERE cp.id = project_id AND co.owner_id = auth.uid()
        )
    );

CREATE POLICY "Workers can view their own project assignments"
    ON public.project_crew_assignments
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.contractor_workforce cw
            JOIN public.worker_profiles wp ON wp.id = cw.worker_profile_id
            WHERE cw.id = workforce_id AND wp.user_id = auth.uid()
        )
    );

-- ------------------------------------------------------------------------------
-- 3. CONTRACTOR CUSTOMER HEALTH & RETENTION TELEMETRY
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contractor_customer_health (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.contractor_organizations(id) ON DELETE CASCADE UNIQUE,
    health_score INTEGER NOT NULL CHECK (health_score >= 0 AND health_score <= 100) DEFAULT 85,
    churn_risk TEXT NOT NULL CHECK (churn_risk IN ('low', 'medium', 'high')) DEFAULT 'low',
    weekly_active_days INTEGER NOT NULL DEFAULT 4,
    roster_utilization_pct NUMERIC(5,2) NOT NULL DEFAULT 72.0,
    renewal_reminder_sent BOOLEAN NOT NULL DEFAULT false,
    last_activity_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.contractor_customer_health ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Contractors can view their own health score"
    ON public.contractor_customer_health
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.contractor_organizations co
            WHERE co.id = organization_id AND co.owner_id = auth.uid()
        )
    );

CREATE POLICY "Admins and service role have full health score access"
    ON public.contractor_customer_health
    FOR ALL
    USING (
        auth.role() = 'service_role' OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- ------------------------------------------------------------------------------
-- 4. WORKER IDENTITY EXPORTS (DPDP Act Portable Identity Audit Log)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.worker_identity_exports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_profile_id UUID NOT NULL REFERENCES public.worker_profiles(id) ON DELETE CASCADE,
    export_format TEXT NOT NULL CHECK (export_format IN ('json', 'pdf', 'csv')) DEFAULT 'json',
    cryptographic_hash TEXT NOT NULL,
    exported_by UUID NOT NULL,
    exported_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_worker_id_exports_wp ON public.worker_identity_exports(worker_profile_id);

ALTER TABLE public.worker_identity_exports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workers can view and insert their own identity exports"
    ON public.worker_identity_exports
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.worker_profiles wp
            WHERE wp.id = worker_profile_id AND wp.user_id = auth.uid()
        )
    );

-- ------------------------------------------------------------------------------
-- 5. REGIONAL EXPANSION READINESS (District Scorecard & Metadata)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.regional_expansion_readiness (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    state TEXT NOT NULL,
    district TEXT NOT NULL UNIQUE,
    contractor_demand_score NUMERIC(3,1) NOT NULL,
    artisan_density_score NUMERIC(3,1) NOT NULL,
    institutional_access_score NUMERIC(3,1) NOT NULL,
    readiness_score NUMERIC(3,1) NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('active_base', 'selected_expansion', 'pipeline', 'exploratory')),
    local_operating_partner TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.regional_expansion_readiness ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access to regional expansion directory"
    ON public.regional_expansion_readiness
    FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage regional expansion directory"
    ON public.regional_expansion_readiness
    FOR ALL
    USING (
        auth.role() = 'service_role' OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );
