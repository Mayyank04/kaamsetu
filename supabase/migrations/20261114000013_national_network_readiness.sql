-- ==============================================================================
-- KAAMSETU MIGRATION 13: NATIONAL NETWORK READINESS & REPEATABLE STATE LAUNCHES
-- Standards: Multi-Stage Regional Launch Lifecycle, Cross-Region Staffing with
-- Explicit Worker Consent, Constitutional 0% Fee Payment Provenance Ledger,
-- and Offline Verification Auditability.
-- ==============================================================================

-- 1. EXPAND REGIONAL LIFECYCLE CHECK CONSTRAINT
ALTER TABLE public.operational_regions DROP CONSTRAINT IF EXISTS operational_regions_status_check;
ALTER TABLE public.operational_regions ADD CONSTRAINT operational_regions_status_check CHECK (
    status IN (
        'proposed',
        'research_in_progress',
        'partner_validation',
        'worker_demand_validation',
        'operational_preparation',
        'controlled_pilot',
        'operational_review',
        'active',
        'suspended',
        'closed',
        'planning',
        'deactivated'
    )
);

-- 2. ADD WORKER TRAVEL WILLINGNESS PREFERENCE TO WORKER PROFILES
ALTER TABLE public.worker_profiles
ADD COLUMN IF NOT EXISTS travel_willingness TEXT NOT NULL DEFAULT 'adjacent_districts'
CHECK (travel_willingness IN ('same_district', 'adjacent_districts', 'interstate', 'remote_only'));

-- 3. ADD VERIFICATION STATUS TO INSTITUTIONS
ALTER TABLE public.institutions
ADD COLUMN IF NOT EXISTS verification_status TEXT NOT NULL DEFAULT 'registered'
CHECK (verification_status IN ('registered', 'in_review', 'verified', 'rejected', 'suspended'));

-- 4. REGIONAL LAUNCH TRANSITIONS (AUDITABLE LIFECYCLE PROGRESSION)
CREATE TABLE IF NOT EXISTS public.regional_launch_transitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_id UUID NOT NULL REFERENCES public.operational_regions(id) ON DELETE CASCADE,
    from_status TEXT NOT NULL,
    to_status TEXT NOT NULL,
    authorized_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    authorization_notes TEXT NOT NULL,
    readiness_score NUMERIC(5,2),
    evidence_checklist JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_reg_launch_region ON public.regional_launch_transitions(region_id);
CREATE INDEX IF NOT EXISTS idx_reg_launch_created ON public.regional_launch_transitions(created_at DESC);

-- 5. CROSS-REGION PROJECT STAFFING (INTERSTATE CREW DISPATCH WITH WORKER CONSENT)
CREATE TABLE IF NOT EXISTS public.cross_region_project_staffing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.contractor_organizations(id) ON DELETE CASCADE,
    opportunity_id UUID REFERENCES public.workforce_opportunities(id) ON DELETE SET NULL,
    source_region_id UUID NOT NULL REFERENCES public.operational_regions(id) ON DELETE CASCADE,
    target_region_id UUID NOT NULL REFERENCES public.operational_regions(id) ON DELETE CASCADE,
    worker_profile_id UUID NOT NULL REFERENCES public.worker_profiles(id) ON DELETE CASCADE,
    trade_required TEXT NOT NULL,
    crew_role TEXT NOT NULL DEFAULT 'Specialist Artisan',
    duration_days INTEGER NOT NULL DEFAULT 14,
    daily_wage NUMERIC(10,2) NOT NULL,
    travel_stipend NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    accommodation_provided BOOLEAN NOT NULL DEFAULT true,
    worker_consent_obtained BOOLEAN NOT NULL DEFAULT false,
    status TEXT NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed', 'offered', 'accepted', 'deployed', 'completed', 'declined', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_staffing_org ON public.cross_region_project_staffing(organization_id);
CREATE INDEX IF NOT EXISTS idx_staffing_worker ON public.cross_region_project_staffing(worker_profile_id);
CREATE INDEX IF NOT EXISTS idx_staffing_source ON public.cross_region_project_staffing(source_region_id);
CREATE INDEX IF NOT EXISTS idx_staffing_target ON public.cross_region_project_staffing(target_region_id);

-- 6. PAYMENT RECORDS LEDGER (PAYMENT PROVENANCE & CONSTITUTIONAL 0% COMMISSION ENFORCEMENT)
CREATE TABLE IF NOT EXISTS public.payment_records_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    opportunity_id UUID REFERENCES public.workforce_opportunities(id) ON DELETE SET NULL,
    worker_profile_id UUID NOT NULL REFERENCES public.worker_profiles(id) ON DELETE CASCADE,
    employer_declared_amount NUMERIC(10,2) NOT NULL,
    worker_agreed_amount NUMERIC(10,2) NOT NULL,
    amount_invoiced NUMERIC(10,2) NOT NULL,
    amount_paid NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    platform_commission_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (platform_commission_amount = 0.00),
    payment_date TIMESTAMPTZ,
    payment_evidence_ref TEXT,
    disputed_amount NUMERIC(10,2) DEFAULT 0.00,
    resolution_status TEXT NOT NULL DEFAULT 'settled' CHECK (resolution_status IN ('pending', 'settled', 'disputed', 'escalated')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_payment_ledger_worker ON public.payment_records_ledger(worker_profile_id);
CREATE INDEX IF NOT EXISTS idx_payment_ledger_booking ON public.payment_records_ledger(booking_id);
CREATE INDEX IF NOT EXISTS idx_payment_ledger_opp ON public.payment_records_ledger(opportunity_id);

-- 7. OFFLINE VERIFICATION AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.offline_verification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_profile_id UUID NOT NULL REFERENCES public.worker_profiles(id) ON DELETE CASCADE,
    verifier_identity TEXT NOT NULL,
    cached_key_version TEXT NOT NULL DEFAULT 'v1',
    last_sync_timestamp TIMESTAMPTZ NOT NULL,
    scan_timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    verification_result TEXT NOT NULL CHECK (verification_result IN ('valid_signature_cached', 'signature_mismatch', 'expired_cache', 'revoked_online_check')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_offline_logs_worker ON public.offline_verification_logs(worker_profile_id);

-- 8. SEED CANDIDATE EXPANSION REGIONS FOR FORMAL EVALUATION
INSERT INTO public.operational_regions (
    region_code, state, district, primary_city, subdistrict_blocks, pin_codes, supported_languages, trade_aliases, discovery_radius_km, status
) VALUES 
(
    'IN-TR-WTR', 'Tripura', 'West Tripura', 'Agartala',
    ARRAY['Agartala Municipal', 'Dukli', 'Mohanpur', 'Jirania'],
    ARRAY['799001', '799002', '799003', '799008'],
    ARRAY['bn', 'en', 'hi'],
    '{"electrician": ["ইলেকট্রিশিয়ান", "electrician"], "plumber": ["প্লাম্বার", "plumber"], "solar": ["সোলার টেকনিশিয়ান"]}',
    30, 'research_in_progress'
),
(
    'IN-WB-DAR', 'West Bengal', 'Darjeeling', 'Siliguri',
    ARRAY['Siliguri Municipal', 'Matigara', 'Naxalbari', 'Phansidewa'],
    ARRAY['734001', '734003', '734004', '734010'],
    ARRAY['bn', 'ne', 'en', 'hi'],
    '{"electrician": ["ইলেকট্রিশিয়ান", "electrician"], "carpenter": ["ছুতোর", "carpenter", "kathi"], "mason": ["রাজমিস্ত্রি", "mason"]}',
    35, 'partner_validation'
),
(
    'IN-NL-DIM', 'Nagaland', 'Dimapur', 'Dimapur',
    ARRAY['Dimapur Sadar', 'Chumukedima', 'Medziphema'],
    ARRAY['797112', '797103', '797106'],
    ARRAY['en', 'nag', 'hi'],
    '{"carpenter": ["carpenter", "woodworker"], "mason": ["mason", "builder"], "welder": ["welder", "fabricator"]}',
    25, 'proposed'
)
ON CONFLICT (region_code) DO NOTHING;

-- 9. ROW LEVEL SECURITY POLICIES

-- regional_launch_transitions
ALTER TABLE public.regional_launch_transitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public and authenticated can read regional launch transitions"
ON public.regional_launch_transitions FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Admins have full access to regional launch transitions"
ON public.regional_launch_transitions FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
          AND p.role = 'admin'
    )
);

-- cross_region_project_staffing
ALTER TABLE public.cross_region_project_staffing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Contractors can manage staffing for their organization"
ON public.cross_region_project_staffing FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.contractor_organizations co
        WHERE co.id = cross_region_project_staffing.organization_id
          AND co.owner_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.contractor_organizations co
        WHERE co.id = cross_region_project_staffing.organization_id
          AND co.owner_id = auth.uid()
    )
);

CREATE POLICY "Workers can view and respond to their own staffing offers"
ON public.cross_region_project_staffing FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.worker_profiles wp
        WHERE wp.id = cross_region_project_staffing.worker_profile_id
          AND wp.user_id = auth.uid()
    )
);

CREATE POLICY "Workers can update consent on their own staffing offers"
ON public.cross_region_project_staffing FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.worker_profiles wp
        WHERE wp.id = cross_region_project_staffing.worker_profile_id
          AND wp.user_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.worker_profiles wp
        WHERE wp.id = cross_region_project_staffing.worker_profile_id
          AND wp.user_id = auth.uid()
    )
);

CREATE POLICY "Admins have full access to cross region staffing"
ON public.cross_region_project_staffing FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
          AND p.role = 'admin'
    )
);

-- payment_records_ledger
ALTER TABLE public.payment_records_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workers can view their own payment ledger records"
ON public.payment_records_ledger FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.worker_profiles wp
        WHERE wp.id = payment_records_ledger.worker_profile_id
          AND wp.user_id = auth.uid()
    )
);

CREATE POLICY "Admins have full access to payment ledger records"
ON public.payment_records_ledger FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
          AND p.role = 'admin'
    )
);

-- offline_verification_logs
ALTER TABLE public.offline_verification_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workers can view their own offline verification logs"
ON public.offline_verification_logs FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.worker_profiles wp
        WHERE wp.id = offline_verification_logs.worker_profile_id
          AND wp.user_id = auth.uid()
    )
);

CREATE POLICY "Authenticated users can insert offline verification logs"
ON public.offline_verification_logs FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Admins have full access to offline verification logs"
ON public.offline_verification_logs FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
          AND p.role = 'admin'
    )
);
