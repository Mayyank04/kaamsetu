-- ==============================================================================
-- KAAMSETU DATABASE MIGRATION 09: PRODUCTION OPERATIONS, CRM & WEBHOOKS
-- ==============================================================================
-- Purpose:
-- 1. Contractor CRM conversion tracking pipeline (Lead -> Paid)
-- 2. Idempotent payment webhook event logging & replay defense
-- 3. Worker sovereign association lifecycle & withdrawal audit
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. CRM CONTRACTOR LEADS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.crm_contractor_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prospect_code TEXT UNIQUE NOT NULL,
    organization_name TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    contact_phone TEXT,
    district TEXT NOT NULL DEFAULT 'Kamrup Metropolitan',
    stage TEXT NOT NULL CHECK (
        stage IN (
            'lead',
            'contacted',
            'qualified',
            'demo_scheduled',
            'demo_completed',
            'trial_active',
            'payment_pending',
            'paid',
            'lost',
            'follow_up_required'
        )
    ) DEFAULT 'lead',
    plan_pitch TEXT NOT NULL DEFAULT 'pro' CHECK (plan_pitch IN ('starter', 'pro', 'business')),
    willingness_to_pay BOOLEAN NOT NULL DEFAULT false,
    roster_size_estimated INTEGER NOT NULL DEFAULT 15,
    notes TEXT,
    converted_organization_id UUID REFERENCES public.contractor_organizations(id) ON DELETE SET NULL,
    converted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_crm_leads_stage ON public.crm_contractor_leads(stage);
CREATE INDEX IF NOT EXISTS idx_crm_leads_district ON public.crm_contractor_leads(district);

ALTER TABLE public.crm_contractor_leads ENABLE ROW LEVEL SECURITY;

-- CRM Access: Authenticated staff / admins or service_role
CREATE POLICY "Admins and service role have full CRM access"
    ON public.crm_contractor_leads
    FOR ALL
    USING (
        auth.role() = 'service_role' OR 
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND (role = 'admin' OR role = 'institution')
        )
    );

-- ------------------------------------------------------------------------------
-- 2. PAYMENT WEBHOOK EVENTS (IDEMPOTENCY & AUDIT)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payment_webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id TEXT UNIQUE NOT NULL,
    event_type TEXT NOT NULL,
    payment_gateway TEXT NOT NULL DEFAULT 'razorpay',
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL CHECK (status IN ('received', 'processed', 'ignored', 'failed')) DEFAULT 'received',
    error_message TEXT,
    processed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payment_webhooks_event_id ON public.payment_webhook_events(event_id);
CREATE INDEX IF NOT EXISTS idx_payment_webhooks_type ON public.payment_webhook_events(event_type);

ALTER TABLE public.payment_webhook_events ENABLE ROW LEVEL SECURITY;

-- Server-only access via service_role
CREATE POLICY "Server-only access to payment webhooks"
    ON public.payment_webhook_events
    FOR ALL
    USING (auth.role() = 'service_role');

-- ------------------------------------------------------------------------------
-- 3. WORKER ASSOCIATION EVENTS (WORKER SOVEREIGNTY AUDIT TRAIL)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.worker_association_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id UUID NOT NULL REFERENCES public.worker_profiles(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.contractor_organizations(id) ON DELETE CASCADE,
    action TEXT NOT NULL CHECK (action IN ('joined', 'hidden', 'made_public', 'withdrawn', 'revoked')),
    actor_user_id UUID NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_worker_assoc_events ON public.worker_association_events(worker_id, organization_id);

ALTER TABLE public.worker_association_events ENABLE ROW LEVEL SECURITY;

-- Workers can view their own association events
CREATE POLICY "Workers can view their own association events"
    ON public.worker_association_events
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.worker_profiles wp
            WHERE wp.id = worker_id AND wp.user_id = auth.uid()
        )
    );

-- Contractors can view association events for their organization
CREATE POLICY "Contractors can view their organization association events"
    ON public.worker_association_events
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.contractor_organizations co
            WHERE co.id = organization_id AND co.owner_id = auth.uid()
        )
    );

-- Authorized actors (worker or contractor owner) can insert association events
CREATE POLICY "Workers and contractors can insert association events"
    ON public.worker_association_events
    FOR INSERT
    WITH CHECK (
        auth.uid() = actor_user_id AND (
            EXISTS (
                SELECT 1 FROM public.worker_profiles wp
                WHERE wp.id = worker_id AND wp.user_id = auth.uid()
            ) OR
            EXISTS (
                SELECT 1 FROM public.contractor_organizations co
                WHERE co.id = organization_id AND co.owner_id = auth.uid()
            )
        )
    );
