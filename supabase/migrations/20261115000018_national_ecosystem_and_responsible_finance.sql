-- Migration 18: National Digital Ecosystem Integration, Enterprise Interoperability & Responsible Worker Finance
-- Branch: phase-17-national-ecosystem-and-financial-inclusion
-- Description: Establishes schema for ONDC/ONest protocol transactions, worker-consented financial readiness sharing, and enterprise ERP sync audit trails.

-- 1. External Ecosystem Transactions (ONDC, ONest, Beckn Network Protocol events)
CREATE TABLE IF NOT EXISTS public.external_ecosystem_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    protocol_type TEXT NOT NULL CHECK (protocol_type IN ('ondc', 'onest', 'beckn_generic')),
    action TEXT NOT NULL CHECK (action IN ('search', 'on_search', 'select', 'on_select', 'init', 'on_init', 'confirm', 'on_confirm', 'status', 'on_status', 'track', 'on_track', 'cancel', 'on_cancel', 'update', 'on_update')),
    transaction_id TEXT NOT NULL,
    message_id TEXT NOT NULL,
    bap_id TEXT NOT NULL,
    bpp_id TEXT NOT NULL,
    signature_verified BOOLEAN NOT NULL DEFAULT false,
    idempotency_key TEXT NOT NULL,
    request_timestamp TIMESTAMPTZ NOT NULL,
    response_status TEXT NOT NULL CHECK (response_status IN ('acknowledged', 'nack', 'failed', 'timeout')),
    error_code TEXT,
    error_message TEXT,
    payload_hash TEXT NOT NULL, -- SHA-256 hash of canonicalized payload (RFC 8785)
    worker_contact_masked BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexing for ONDC/ONest replay defense and fast transaction lookup
CREATE UNIQUE INDEX IF NOT EXISTS idx_external_ecosystem_msg_dedup ON public.external_ecosystem_transactions (protocol_type, message_id);
CREATE INDEX IF NOT EXISTS idx_external_ecosystem_tx_id ON public.external_ecosystem_transactions (transaction_id);
CREATE INDEX IF NOT EXISTS idx_external_ecosystem_bap_bpp ON public.external_ecosystem_transactions (bap_id, bpp_id);
CREATE INDEX IF NOT EXISTS idx_external_ecosystem_created_at ON public.external_ecosystem_transactions (created_at DESC);

-- Enable RLS
ALTER TABLE public.external_ecosystem_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Ecosystem transactions are restricted to platform administrators
CREATE POLICY "ecosystem_transactions_admin_access"
    ON public.external_ecosystem_transactions
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'::app_role
        )
    );

CREATE POLICY "ecosystem_transactions_service_insert"
    ON public.external_ecosystem_transactions
    FOR INSERT
    TO authenticated
    WITH CHECK (true);


-- 2. Worker Financial Consents (Time-bounded, worker-revocable consent for RBI-regulated NBFC/Bank readiness review)
CREATE TABLE IF NOT EXISTS public.worker_financial_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    partner_id UUID NOT NULL REFERENCES public.profiles(id),
    partner_name TEXT NOT NULL,
    partner_type TEXT NOT NULL CHECK (partner_type IN ('rbi_regulated_nbfc', 'scheduled_commercial_bank', 'sidbi_micro_lender')),
    consented_categories TEXT[] NOT NULL DEFAULT '{}', -- e.g. ['completed_jobs', 'payout_consistency', 'verified_credentials']
    purpose TEXT NOT NULL DEFAULT 'micro_enterprise_tool_financing',
    data_freshness_days INTEGER NOT NULL DEFAULT 90,
    valid_until TIMESTAMPTZ NOT NULL,
    is_revoked BOOLEAN NOT NULL DEFAULT false,
    revoked_at TIMESTAMPTZ,
    revocation_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexing for fast consent evaluation
CREATE INDEX IF NOT EXISTS idx_worker_financial_consents_worker ON public.worker_financial_consents (worker_id, is_revoked);
CREATE INDEX IF NOT EXISTS idx_worker_financial_consents_partner ON public.worker_financial_consents (partner_id, is_revoked);
CREATE INDEX IF NOT EXISTS idx_worker_financial_consents_expiry ON public.worker_financial_consents (valid_until);

-- Enable RLS
ALTER TABLE public.worker_financial_consents ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Workers have complete sovereignty over their consents
CREATE POLICY "worker_manage_own_financial_consent"
    ON public.worker_financial_consents
    FOR ALL
    TO authenticated
    USING (worker_id = auth.uid())
    WITH CHECK (worker_id = auth.uid());

CREATE POLICY "partner_read_consented_records"
    ON public.worker_financial_consents
    FOR SELECT
    TO authenticated
    USING (
        partner_id = auth.uid()
        AND is_revoked = false
        AND valid_until > timezone('utc'::text, now())
    );

CREATE POLICY "admin_read_financial_consents"
    ON public.worker_financial_consents
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'::app_role
        )
    );


-- 3. Enterprise Sync Logs (Audit trail for SAP SuccessFactors, Oracle Fusion, and GeM enterprise connectors)
CREATE TABLE IF NOT EXISTS public.enterprise_sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contractor_org_id UUID NOT NULL REFERENCES public.contractor_organizations(id) ON DELETE CASCADE,
    system_type TEXT NOT NULL CHECK (system_type IN ('sap_successfactors', 'oracle_fusion_hcm', 'gem_procurement', 'generic_scim_erp')),
    sync_direction TEXT NOT NULL CHECK (sync_direction IN ('inbound', 'outbound', 'bidirectional')),
    external_job_reference TEXT,
    records_synced INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL CHECK (status IN ('success', 'partial_success', 'failed', 'blocked_consent_missing')),
    idempotency_hash TEXT NOT NULL,
    anonymized_telemetry BOOLEAN NOT NULL DEFAULT true,
    error_summary TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexing for enterprise sync monitoring
CREATE INDEX IF NOT EXISTS idx_enterprise_sync_logs_org ON public.enterprise_sync_logs (contractor_org_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enterprise_sync_logs_system ON public.enterprise_sync_logs (system_type, status);
CREATE INDEX IF NOT EXISTS idx_enterprise_sync_logs_idempotency ON public.enterprise_sync_logs (idempotency_hash);

-- Enable RLS
ALTER TABLE public.enterprise_sync_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Contractor organizations can inspect only their own sync logs
CREATE POLICY "contractor_org_read_own_sync_logs"
    ON public.enterprise_sync_logs
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.contractor_organizations
            WHERE contractor_organizations.id = enterprise_sync_logs.contractor_org_id
            AND contractor_organizations.owner_id = auth.uid()
        )
    );

CREATE POLICY "contractor_org_insert_own_sync_logs"
    ON public.enterprise_sync_logs
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.contractor_organizations
            WHERE contractor_organizations.id = enterprise_sync_logs.contractor_org_id
            AND contractor_organizations.owner_id = auth.uid()
        )
    );

CREATE POLICY "admin_all_enterprise_sync_logs"
    ON public.enterprise_sync_logs
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'::app_role
        )
    );

-- Migration 18 Rollback instructions (for emergency rollback if needed):
-- DROP TABLE IF EXISTS public.enterprise_sync_logs CASCADE;
-- DROP TABLE IF EXISTS public.worker_financial_consents CASCADE;
-- DROP TABLE IF EXISTS public.external_ecosystem_transactions CASCADE;
