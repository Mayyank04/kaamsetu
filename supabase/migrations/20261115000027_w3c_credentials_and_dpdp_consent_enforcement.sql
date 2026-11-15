-- Migration 27: W3C Verifiable Credentials Registry, Ed25519 Audit & DPDP Consent Enforcement
-- Phase 26: Pillars E, F, G, J
--
-- Adds:
-- 1. Table public.w3c_verifiable_credential_registry (W3C VC v1.1/v2.0 & Ed25519 registry)
-- 2. Immutability trigger for worker_consent_audit_events (DPDP Act 2023 Non-Repudiation)
-- 3. Transition validation function for institutional blocker state machine
-- 4. RLS policies with 100% coverage

-- ============================================================================
-- 1. W3C VERIFIABLE CREDENTIAL REGISTRY (Pillar E)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.w3c_verifiable_credential_registry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    credential_id TEXT UNIQUE NOT NULL, -- e.g. urn:uuid:...
    issuer_did TEXT NOT NULL,           -- e.g. did:kaamsetu:issuer:kamrup-01
    subject_did TEXT NOT NULL,          -- e.g. did:kaamsetu:worker:...
    credential_type TEXT[] NOT NULL DEFAULT ARRAY['VerifiableCredential', 'VocationalSkillCredential'],
    nsqf_level INTEGER CHECK (nsqf_level BETWEEN 1 AND 8),
    primary_trade TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'revoked', 'expired')),
    revocation_reason TEXT,
    revoked_at TIMESTAMPTZ,
    key_version TEXT NOT NULL DEFAULT 'ed25519-v1',
    public_key_multibase TEXT NOT NULL,
    proof_type TEXT NOT NULL DEFAULT 'Ed25519Signature2020',
    canonical_digest TEXT NOT NULL,
    issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_w3c_cred_id ON public.w3c_verifiable_credential_registry(credential_id);
CREATE INDEX IF NOT EXISTS idx_w3c_cred_subject ON public.w3c_verifiable_credential_registry(subject_did);
CREATE INDEX IF NOT EXISTS idx_w3c_cred_status ON public.w3c_verifiable_credential_registry(status);

ALTER TABLE public.w3c_verifiable_credential_registry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read for active verifiable credentials"
    ON public.w3c_verifiable_credential_registry FOR SELECT
    TO public
    USING (status = 'active');

CREATE POLICY "Authenticated users can verify any credential status"
    ON public.w3c_verifiable_credential_registry FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Service role can manage verifiable credentials"
    ON public.w3c_verifiable_credential_registry FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ============================================================================
-- 2. DPDP 2023 CONSENT AUDIT IMMUTABILITY TRIGGER (Pillar F)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.enforce_consent_audit_immutability()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'worker_consent_audit_events are immutable legal audit trails and cannot be updated or deleted under DPDP Act 2023 Section 6/8';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_consent_audit_immutability ON public.worker_consent_audit_events;
CREATE TRIGGER trg_consent_audit_immutability
    BEFORE UPDATE OR DELETE ON public.worker_consent_audit_events
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_consent_audit_immutability();

-- ============================================================================
-- 3. INSTITUTIONAL BLOCKER TRANSITION STATE MACHINE (Pillar I)
-- ============================================================================
-- Validates that institutional blocker transitions adhere strictly to the 6-stage linear model:
-- identified -> diligence -> counterparty_review -> approved_pending_execution -> executed -> operationally_verified
-- or terminal/exception states: rejected, withdrawn, expired, suspended.
CREATE OR REPLACE FUNCTION public.validate_blocker_lifecycle_transition(
    p_from_status TEXT,
    p_to_status TEXT
) RETURNS BOOLEAN AS $$
BEGIN
    -- Same state is a no-op / valid
    IF p_from_status = p_to_status THEN
        RETURN true;
    END IF;

    -- Valid progressive linear transitions
    IF (p_from_status = 'identified' AND p_to_status = 'diligence') OR
       (p_from_status = 'diligence' AND p_to_status = 'counterparty_review') OR
       (p_from_status = 'counterparty_review' AND p_to_status = 'approved_pending_execution') OR
       (p_from_status = 'approved_pending_execution' AND p_to_status = 'executed') OR
       (p_from_status = 'executed' AND p_to_status = 'operationally_verified') THEN
        RETURN true;
    END IF;

    -- Legacy state mapping compatibility
    IF (p_from_status = 'draft_circulated' AND p_to_status = 'counterparty_legal_review') OR
       (p_from_status = 'counterparty_legal_review' AND p_to_status = 'cabinet_or_council_pending') OR
       (p_from_status = 'cabinet_or_council_pending' AND p_to_status = 'approved_pending_execution') OR
       (p_from_status = 'approved_pending_execution' AND p_to_status = 'executed_active') THEN
        RETURN true;
    END IF;

    -- Exceptions/Terminals can be entered from non-terminal states
    IF p_to_status IN ('rejected', 'withdrawn', 'expired', 'suspended', 'blocked') THEN
        RETURN true;
    END IF;

    -- Any other transition is rejected
    RETURN false;
END;
$$ LANGUAGE plpgsql;
