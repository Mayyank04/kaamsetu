-- ==============================================================================
-- KAAMSETU MIGRATION 11: NATIONAL MULTI-REGION NETWORK & INFRASTRUCTURE
-- Standards: Multi-Region Geography, Portable Access Grants, Partner CRM Lifecycle,
-- Explainable Opportunity Matching, and Skills Gap Infrastructure.
-- ==============================================================================

-- 1. OPERATIONAL REGIONS TABLE
CREATE TABLE IF NOT EXISTS public.operational_regions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_code TEXT UNIQUE NOT NULL,
    state TEXT NOT NULL,
    district TEXT NOT NULL,
    subdistrict_blocks TEXT[] NOT NULL DEFAULT '{}',
    primary_city TEXT NOT NULL,
    pin_codes TEXT[] NOT NULL DEFAULT '{}',
    supported_languages TEXT[] NOT NULL DEFAULT '{"en"}',
    trade_aliases JSONB NOT NULL DEFAULT '{}'::jsonb,
    discovery_radius_km INTEGER NOT NULL DEFAULT 25,
    status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'suspended', 'deactivated')),
    feature_flags JSONB NOT NULL DEFAULT '{"voice_onboarding": true, "offline_kiosk_print": true, "direct_booking": true, "opportunity_matching": true}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_operational_regions_state_district ON public.operational_regions(state, district);
CREATE INDEX IF NOT EXISTS idx_operational_regions_status ON public.operational_regions(status);

-- 2. REGIONAL ADMINISTRATORS TABLE
CREATE TABLE IF NOT EXISTS public.regional_administrators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    region_id UUID NOT NULL REFERENCES public.operational_regions(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('regional_director', 'field_coordinator', 'compliance_auditor', 'support_agent')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, region_id)
);

CREATE INDEX IF NOT EXISTS idx_regional_admins_user ON public.regional_administrators(user_id);
CREATE INDEX IF NOT EXISTS idx_regional_admins_region ON public.regional_administrators(region_id);

-- 3. AUDITABLE INSTITUTIONAL LIFECYCLE ENHANCEMENT
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'cohort_participants' 
          AND column_name = 'lifecycle_stage'
    ) THEN
        ALTER TABLE public.cohort_participants 
        ADD COLUMN lifecycle_stage TEXT NOT NULL DEFAULT 'enrolled' 
        CHECK (lifecycle_stage IN (
            'enrolled', 
            'training_in_progress', 
            'assessment_attempted', 
            'assessment_passed', 
            'credential_issued', 
            'employer_introduced', 
            'placement_confirmed'
        ));
    END IF;
END $$;

-- 4. WORKER IDENTITY ACCESS GRANTS (SELECTIVE DISCLOSURE & REVOCATION)
CREATE TABLE IF NOT EXISTS public.worker_identity_access_grants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_profile_id UUID NOT NULL REFERENCES public.worker_profiles(id) ON DELETE CASCADE,
    grantee_name TEXT NOT NULL,
    grantee_type TEXT NOT NULL CHECK (grantee_type IN ('contractor', 'institution', 'prospective_employer', 'verifier')),
    access_token_hash TEXT NOT NULL UNIQUE,
    disclosed_sections JSONB NOT NULL DEFAULT '{"skills": true, "experience": true, "portfolio": false, "work_history": true, "credentials": true}'::jsonb,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired')),
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_id_access_grants_worker ON public.worker_identity_access_grants(worker_profile_id);
CREATE INDEX IF NOT EXISTS idx_id_access_grants_token ON public.worker_identity_access_grants(access_token_hash);

-- 5. IDENTITY ACCESS AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.identity_access_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grant_id UUID REFERENCES public.worker_identity_access_grants(id) ON DELETE SET NULL,
    worker_profile_id UUID NOT NULL REFERENCES public.worker_profiles(id) ON DELETE CASCADE,
    accessor_ip_hash TEXT,
    accessor_user_agent TEXT,
    action TEXT NOT NULL CHECK (action IN ('view', 'download', 'verify', 'revoke')),
    accessed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_id_access_logs_worker ON public.identity_access_audit_logs(worker_profile_id);

-- 6. PARTNER CRM RECORDS (STRUCTURED PARTNER LIFECYCLE)
CREATE TABLE IF NOT EXISTS public.partner_crm_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_name TEXT NOT NULL,
    partner_type TEXT NOT NULL CHECK (partner_type IN ('contractor', 'institution', 'industry_association', 'training_ngo')),
    region_id UUID REFERENCES public.operational_regions(id) ON DELETE SET NULL,
    stage TEXT NOT NULL DEFAULT 'lead' CHECK (stage IN (
        'lead', 
        'contacted', 
        'discovery_completed', 
        'proposal_sent', 
        'pilot_agreed', 
        'agreement_signed', 
        'active', 
        'renewal_due', 
        'renewed', 
        'churned'
    )),
    decision_maker_name TEXT NOT NULL,
    decision_maker_role TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    expected_contract_value NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    actual_invoiced_value NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    renewal_date DATE,
    implementation_status TEXT NOT NULL DEFAULT 'initial_contact' CHECK (implementation_status IN (
        'initial_contact', 
        'needs_assessment', 
        'pilot_setup', 
        'fully_deployed', 
        'needs_attention', 
        'paused'
    )),
    support_tier TEXT NOT NULL DEFAULT 'standard' CHECK (support_tier IN ('standard', 'dedicated_lead', 'priority_24_7')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_partner_crm_stage ON public.partner_crm_records(stage);
CREATE INDEX IF NOT EXISTS idx_partner_crm_region ON public.partner_crm_records(region_id);

-- 7. WORKFORCE OPPORTUNITIES TABLE
CREATE TABLE IF NOT EXISTS public.workforce_opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.contractor_organizations(id) ON DELETE SET NULL,
    region_id UUID REFERENCES public.operational_regions(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    trade_category TEXT NOT NULL,
    required_skills TEXT[] NOT NULL DEFAULT '{}',
    location_district TEXT NOT NULL,
    location_pincode TEXT,
    expected_duration_days INTEGER NOT NULL DEFAULT 7,
    daily_wage_range_min NUMERIC(10,2),
    daily_wage_range_max NUMERIC(10,2),
    payment_terms TEXT NOT NULL DEFAULT 'Direct payment by contractor upon weekly milestone completion',
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'matching', 'filled', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_workforce_opps_region ON public.workforce_opportunities(region_id);
CREATE INDEX IF NOT EXISTS idx_workforce_opps_trade ON public.workforce_opportunities(trade_category);
CREATE INDEX IF NOT EXISTS idx_workforce_opps_status ON public.workforce_opportunities(status);

-- 8. WORKER OPPORTUNITY APPLICATIONS (EXPLAINABLE & CONSENT-AWARE)
CREATE TABLE IF NOT EXISTS public.worker_opportunity_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID NOT NULL REFERENCES public.workforce_opportunities(id) ON DELETE CASCADE,
    worker_profile_id UUID NOT NULL REFERENCES public.worker_profiles(id) ON DELETE CASCADE,
    match_score NUMERIC(5,2) NOT NULL,
    match_explanation JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'matched' CHECK (status IN ('matched', 'viewed', 'applied', 'shortlisted', 'accepted', 'declined', 'withdrawn')),
    worker_consent_given BOOLEAN NOT NULL DEFAULT false,
    applied_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(opportunity_id, worker_profile_id)
);

CREATE INDEX IF NOT EXISTS idx_worker_opp_apps_worker ON public.worker_opportunity_applications(worker_profile_id);
CREATE INDEX IF NOT EXISTS idx_worker_opp_apps_opp ON public.worker_opportunity_applications(opportunity_id);

-- 9. SKILLS GAP RECOMMENDATIONS TABLE
CREATE TABLE IF NOT EXISTS public.skills_gap_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_profile_id UUID NOT NULL REFERENCES public.worker_profiles(id) ON DELETE CASCADE,
    target_trade TEXT NOT NULL,
    missing_skill TEXT NOT NULL,
    evidence_rationale TEXT NOT NULL,
    learning_resource_title TEXT NOT NULL,
    learning_resource_url TEXT NOT NULL,
    institution_provider TEXT NOT NULL,
    is_ai_generated BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_skills_gap_recs_worker ON public.skills_gap_recommendations(worker_profile_id);

-- 10. ROW LEVEL SECURITY POLICIES

-- operational_regions
ALTER TABLE public.operational_regions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public and authenticated can read active or planning operational regions"
ON public.operational_regions FOR SELECT
USING (true);

CREATE POLICY "Admins have full access to operational regions"
ON public.operational_regions FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
          AND profiles.role = 'admin'
    )
);

-- regional_administrators
ALTER TABLE public.regional_administrators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Regional administrators can view their own assignments"
ON public.regional_administrators FOR SELECT
TO authenticated
USING (
    user_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
          AND profiles.role = 'admin'
    )
);

-- worker_identity_access_grants
ALTER TABLE public.worker_identity_access_grants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workers can view and manage their own identity access grants"
ON public.worker_identity_access_grants FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.worker_profiles wp
        WHERE wp.id = worker_identity_access_grants.worker_profile_id
          AND wp.user_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.worker_profiles wp
        WHERE wp.id = worker_identity_access_grants.worker_profile_id
          AND wp.user_id = auth.uid()
    )
);

-- identity_access_audit_logs
ALTER TABLE public.identity_access_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workers can view access logs for their own identity profile"
ON public.identity_access_audit_logs FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.worker_profiles wp
        WHERE wp.id = identity_access_audit_logs.worker_profile_id
          AND wp.user_id = auth.uid()
    )
);

-- partner_crm_records
ALTER TABLE public.partner_crm_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and institutions can view partner CRM records"
ON public.partner_crm_records FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
          AND (profiles.role = 'admin' OR profiles.role = 'institution')
    )
);

CREATE POLICY "Admins and institutions can insert and update partner CRM records"
ON public.partner_crm_records FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
          AND (profiles.role = 'admin' OR profiles.role = 'institution')
    )
);

CREATE POLICY "Admins and institutions can update partner CRM records"
ON public.partner_crm_records FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
          AND (profiles.role = 'admin' OR profiles.role = 'institution')
    )
);

-- workforce_opportunities
ALTER TABLE public.workforce_opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public and authenticated users can view open workforce opportunities"
ON public.workforce_opportunities FOR SELECT
USING (status = 'open' OR status = 'matching');

CREATE POLICY "Contractors can manage opportunities for their organization"
ON public.workforce_opportunities FOR ALL
TO authenticated
USING (
    organization_id IS NULL OR
    EXISTS (
        SELECT 1 FROM public.contractor_organizations co
        WHERE co.id = workforce_opportunities.organization_id
          AND co.owner_id = auth.uid()
    )
)
WITH CHECK (
    organization_id IS NULL OR
    EXISTS (
        SELECT 1 FROM public.contractor_organizations co
        WHERE co.id = workforce_opportunities.organization_id
          AND co.owner_id = auth.uid()
    )
);

-- worker_opportunity_applications
ALTER TABLE public.worker_opportunity_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workers can view and manage their own applications"
ON public.worker_opportunity_applications FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.worker_profiles wp
        WHERE wp.id = worker_opportunity_applications.worker_profile_id
          AND wp.user_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.worker_profiles wp
        WHERE wp.id = worker_opportunity_applications.worker_profile_id
          AND wp.user_id = auth.uid()
    )
);

CREATE POLICY "Contractors can view applications for their opportunities"
ON public.worker_opportunity_applications FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.workforce_opportunities wo
        JOIN public.contractor_organizations co ON co.id = wo.organization_id
        WHERE wo.id = worker_opportunity_applications.opportunity_id
          AND co.owner_id = auth.uid()
    )
);

-- skills_gap_recommendations
ALTER TABLE public.skills_gap_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workers can view their own skills gap recommendations"
ON public.skills_gap_recommendations FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.worker_profiles wp
        WHERE wp.id = skills_gap_recommendations.worker_profile_id
          AND wp.user_id = auth.uid()
    )
);

-- 11. INITIAL SEED: OPERATIONAL PLANNING REGIONS
INSERT INTO public.operational_regions (
    region_code, state, district, subdistrict_blocks, primary_city, pin_codes, 
    supported_languages, trade_aliases, discovery_radius_km, status, feature_flags
)
VALUES 
(
    'IN-AS-KMP-METRO', 
    'Assam', 
    'Kamrup Metropolitan', 
    ARRAY['Guwahati', 'Dispur', 'Chandrapur', 'Dimoria'], 
    'Guwahati', 
    ARRAY['781001', '781003', '781005', '781006', '781009', '781022', '781028', '781035'], 
    ARRAY['as', 'en', 'bn', 'hi'], 
    '{"carpenter": ["কাঠমিস্ত্ৰী", "বঢ়ৈ", "woodworker"], "electrician": ["বিজুলী মিস্ত্ৰী", "wireman"], "plumber": ["নল মিস্ত্ৰী", "pipefitter"]}'::jsonb, 
    30, 
    'active', 
    '{"voice_onboarding": true, "offline_kiosk_print": true, "direct_booking": true, "opportunity_matching": true}'::jsonb
),
(
    'IN-AS-KMP-RURAL', 
    'Assam', 
    'Kamrup Rural', 
    ARRAY['Amingaon', 'Rangia', 'Hajo', 'Baihata Chariali', 'Kamalpur'], 
    'Amingaon', 
    ARRAY['781031', '781101', '781102', '781380'], 
    ARRAY['as', 'en', 'bn', 'hi'], 
    '{"carpenter": ["কাঠমিস্ত্ৰী"], "bamboo_artisan": ["বাঁহ কাৰিকৰ", "cane_artisan"], "welder": ["ৱেল্ডিং মিস্ত্ৰী"]}'::jsonb, 
    40, 
    'planning', 
    '{"voice_onboarding": true, "offline_kiosk_print": true, "direct_booking": false, "opportunity_matching": true}'::jsonb
),
(
    'IN-AS-UDL', 
    'Assam', 
    'Udalguri', 
    ARRAY['Udalguri', 'Tangla', 'Rowta', 'Khoirabari', 'Harisinga'], 
    'Udalguri', 
    ARRAY['784509', '784521', '784522'], 
    ARRAY['as', 'en', 'bn', 'hi'], 
    '{"bamboo_artisan": ["দাও আৰু বাঁহ কাৰিকৰ"], "weaver": ["তাঁতী", "handloom_artisan"], "carpenter": ["কাঠমিস্ত্ৰী"]}'::jsonb, 
    35, 
    'planning', 
    '{"voice_onboarding": true, "offline_kiosk_print": true, "direct_booking": false, "opportunity_matching": true}'::jsonb
),
(
    'IN-ML-EKH', 
    'Meghalaya', 
    'East Khasi Hills', 
    ARRAY['Mylliem', 'Mawkynrew', 'Mawphlang', 'Pynursla', 'Khatarshnong Laitkroh'], 
    'Shillong', 
    ARRAY['793001', '793002', '793003', '793008', '793014'], 
    ARRAY['en', 'kha', 'as', 'hi'], 
    '{"carpenter": ["nongthaw jingbam", "woodcraft"], "mason": ["nongtei maw", "stone_mason"], "electrician": ["electrician"]}'::jsonb, 
    25, 
    'planning', 
    '{"voice_onboarding": true, "offline_kiosk_print": true, "direct_booking": false, "opportunity_matching": true}'::jsonb
)
ON CONFLICT (region_code) DO UPDATE SET
    subdistrict_blocks = EXCLUDED.subdistrict_blocks,
    pin_codes = EXCLUDED.pin_codes,
    supported_languages = EXCLUDED.supported_languages,
    trade_aliases = EXCLUDED.trade_aliases,
    updated_at = timezone('utc'::text, now());
