-- ==============================================================================
-- KAAMSETU MIGRATION 12: INTERSTATE FIELD EXPANSION & ECOSYSTEM INTEGRATION
-- Standards: Auditable Institutional Credentials, Partner API Keys, Worker Grievance
-- and Dispute Resolution Ledger, and Opportunity Feedback Reporting.
-- ==============================================================================

-- 1. INSTITUTIONAL CREDENTIALS TABLE (AUDITABLE ISSUANCE & VERIFICATION LIFECYCLE)
CREATE TABLE IF NOT EXISTS public.institutional_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    cohort_id UUID NOT NULL REFERENCES public.institutional_cohorts(id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES public.cohort_participants(id) ON DELETE CASCADE,
    worker_profile_id UUID NOT NULL REFERENCES public.worker_profiles(id) ON DELETE CASCADE,
    credential_identifier TEXT UNIQUE NOT NULL,
    trade_title TEXT NOT NULL,
    nsqf_level INTEGER NOT NULL DEFAULT 4,
    assessment_reference TEXT NOT NULL,
    authorized_issuer_name TEXT NOT NULL,
    authorized_issuer_role TEXT NOT NULL,
    learner_consent_obtained BOOLEAN NOT NULL DEFAULT true,
    status TEXT NOT NULL DEFAULT 'issued' CHECK (status IN ('issued', 'verified', 'suspended', 'revoked')),
    issued_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    verified_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    revocation_reason TEXT,
    schema_version TEXT NOT NULL DEFAULT '2.0',
    integrity_signature TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_inst_creds_worker ON public.institutional_credentials(worker_profile_id);
CREATE INDEX IF NOT EXISTS idx_inst_creds_institution ON public.institutional_credentials(institution_id);
CREATE INDEX IF NOT EXISTS idx_inst_creds_status ON public.institutional_credentials(status);
CREATE INDEX IF NOT EXISTS idx_inst_creds_identifier ON public.institutional_credentials(credential_identifier);

-- 2. INSTITUTIONAL PARTNER API KEYS (SCOPED SANDBOX & PRODUCTION TOKENS)
CREATE TABLE IF NOT EXISTS public.institutional_partner_api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    key_name TEXT NOT NULL,
    key_prefix TEXT NOT NULL,
    api_key_hash TEXT UNIQUE NOT NULL,
    is_sandbox BOOLEAN NOT NULL DEFAULT true,
    rate_limit_per_minute INTEGER NOT NULL DEFAULT 60,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'revoked')),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '1 year'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_inst_api_keys_hash ON public.institutional_partner_api_keys(api_key_hash);
CREATE INDEX IF NOT EXISTS idx_inst_api_keys_inst ON public.institutional_partner_api_keys(institution_id);

-- 3. WORKER DISPUTES TABLE (AUDITABLE GRIEVANCE & DISPUTE LEDGER)
CREATE TABLE IF NOT EXISTS public.worker_disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_profile_id UUID NOT NULL REFERENCES public.worker_profiles(id) ON DELETE CASCADE,
    dispute_type TEXT NOT NULL CHECK (dispute_type IN (
        'unpaid_wages',
        'incorrect_work_record',
        'false_review',
        'unauthorized_sharing',
        'credential_discrepancy',
        'contractor_harassment',
        'account_recovery'
    )),
    target_id TEXT,
    counterparty_name TEXT NOT NULL,
    evidence_notes TEXT NOT NULL,
    claimed_amount NUMERIC(10,2),
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN (
        'submitted',
        'under_review',
        'in_mediation',
        'resolved_worker_upheld',
        'resolved_counterparty_upheld',
        'dismissed',
        'appealed'
    )),
    resolution_summary TEXT,
    assigned_reviewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_worker_disputes_worker ON public.worker_disputes(worker_profile_id);
CREATE INDEX IF NOT EXISTS idx_worker_disputes_status ON public.worker_disputes(status);
CREATE INDEX IF NOT EXISTS idx_worker_disputes_type ON public.worker_disputes(dispute_type);

-- 4. OPPORTUNITY FEEDBACK REPORTS TABLE (JOB AUTHENTICITY & SAFETY DEFENSE)
CREATE TABLE IF NOT EXISTS public.opportunity_feedback_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID NOT NULL REFERENCES public.workforce_opportunities(id) ON DELETE CASCADE,
    reporter_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    report_type TEXT NOT NULL CHECK (report_type IN (
        'misleading_terms',
        'unpaid_wages',
        'unsafe_conditions',
        'fake_opportunity',
        'discriminatory_treatment'
    )),
    details TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN (
        'submitted',
        'investigating',
        'action_taken',
        'dismissed'
    )),
    action_taken TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_opp_feedback_opp ON public.opportunity_feedback_reports(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_opp_feedback_status ON public.opportunity_feedback_reports(status);

-- 5. ACTIVATE INTERSTATE & ASSAM EXPANSION REGIONS FOR CONTROLLED PILOT
UPDATE public.operational_regions
SET status = 'active',
    updated_at = timezone('utc'::text, now())
WHERE region_code IN ('IN-AS-KMP-RURAL', 'IN-ML-EKH');

-- 6. ROW LEVEL SECURITY POLICIES

-- institutional_credentials
ALTER TABLE public.institutional_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public and verifiers can view issued credentials by identifier"
ON public.institutional_credentials FOR SELECT
USING (status = 'issued' OR status = 'verified');

CREATE POLICY "Workers can view all their own credentials"
ON public.institutional_credentials FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.worker_profiles wp
        WHERE wp.id = institutional_credentials.worker_profile_id
          AND wp.user_id = auth.uid()
    )
);

CREATE POLICY "Institutions and admins can manage credentials"
ON public.institutional_credentials FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
          AND (p.role = 'institution' OR p.role = 'admin')
    )
);

-- institutional_partner_api_keys
ALTER TABLE public.institutional_partner_api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins have full access to partner API keys"
ON public.institutional_partner_api_keys FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
          AND p.role = 'admin'
    )
);

-- worker_disputes
ALTER TABLE public.worker_disputes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workers can view and insert their own disputes"
ON public.worker_disputes FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.worker_profiles wp
        WHERE wp.id = worker_disputes.worker_profile_id
          AND wp.user_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.worker_profiles wp
        WHERE wp.id = worker_disputes.worker_profile_id
          AND wp.user_id = auth.uid()
    )
);

CREATE POLICY "Admins can view and update all worker disputes"
ON public.worker_disputes FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
          AND p.role = 'admin'
    )
);

-- opportunity_feedback_reports
ALTER TABLE public.opportunity_feedback_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can submit feedback reports"
ON public.opportunity_feedback_reports FOR INSERT
TO authenticated
WITH CHECK (reporter_profile_id = auth.uid());

CREATE POLICY "Users can view their own submitted reports"
ON public.opportunity_feedback_reports FOR SELECT
TO authenticated
USING (reporter_profile_id = auth.uid());

CREATE POLICY "Admins have full access to opportunity feedback reports"
ON public.opportunity_feedback_reports FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
          AND p.role = 'admin'
    )
);
