# KAAMSETU — INDEPENDENT ATTESTATION STANDARD
## Verifier Authentication, Role-Scoping, Anti-Self-Approval & Dual-Signoff Engine

**Core Standard:** ISO/IEC 17020 & W3C Verifiable Credentials Conformance  
**Repository Table:** `public.evidence_attestation_events`  
**Migration:** `20261115000021_evidence_registry_v2_and_attestation.sql`  
**Service Implementation:** `src/lib/governance/attestation-workflow-service.ts`

---

### 1. Attestation Governance & Core Requirements

An attestation is an immutable cryptographic statement by an authorized identity affirming that an evidence claim has been evaluated against empirical verification standards.

Under Phase 20, the platform eliminates informal or developer-driven certifications by establishing a rigorous **Independent Attestation Standard**:

1. **Explicit Role-Scoping:** Only authorized entities with designated roles (`independent_auditor`, `credential_issuer`, `institutional_partner`) can promote a claim to `independently_verified`.
2. **Conflict of Interest & Anti-Self-Approval:** A claim submitter or platform administrator cannot verify their own submission. Any attestation where `claim_owner === verifier_identity` is rejected immediately.
3. **Dual Independent Signoff Engine:** Sensitive and high-impact categories cannot achieve independent verification through a single auditor. They mandate two distinct approvals by independent identities.
4. **Permanent Audit Trail:** Every review, approval, clarification request, rejection, or revocation generates an immutable row in `public.evidence_attestation_events` with cryptographic signature digests.

---

### 2. Attestation Event Schema

```sql
CREATE TABLE IF NOT EXISTS public.evidence_attestation_events (
  id text PRIMARY KEY,
  claim_id text NOT NULL REFERENCES public.evidence_registry_records(claim_id) ON DELETE CASCADE,
  attestation_type text NOT NULL CHECK (attestation_type IN (
    'submitted',
    'observed',
    'attested',
    'rejected',
    'disputed',
    'clarification_requested',
    'revoked',
    'expired'
  )),
  actor_id text NOT NULL,
  actor_role text NOT NULL CHECK (actor_role IN (
    'worker',
    'customer',
    'contractor',
    'enterprise_partner',
    'institutional_partner',
    'financial_partner',
    'credential_issuer',
    'independent_auditor',
    'platform_admin'
  )),
  methodology text NOT NULL,
  reviewed_artifacts jsonb DEFAULT '[]'::jsonb,
  scope_and_limitations text NOT NULL,
  signature_digest text NOT NULL,
  dual_approved_by text,
  notes text,
  created_at timestamp with time zone DEFAULT now()
);
```

---

### 3. Dual-Approval Engine Specifications

To prevent unilateral certification of high-stakes claims, `requiresDualApproval()` enforces mandatory secondary sign-off for the following sensitive categories:

| Category | Rationale for Dual Approval | Secondary Approver Profile |
| :--- | :--- | :--- |
| `enterprise_pilot` | Multi-crore commercial contracts, worker wage liabilities | Lead Legal Counsel / External Procurement Auditor |
| `responsible_finance` | RBI regulatory compliance, informal borrower protection | Regulated NBFC Compliance Officer / Escrow Trustee |
| `commercial_revenue` | Corporate SaaS MRR/ARR realization, tax reporting | Certified Financial Controller / Statutory Auditor |
| `regional_gate` | State-level launch authorization, interstate mobility | State Nodal Officer / Regional Expansion Directorate |

#### Dual Approval State Logic:
- If a single independent auditor reviews a claim in a dual-approval category without providing `dualApprovedBy`, the engine halts status promotion and transitions the claim to `clarification_requested` with note `"Awaiting secondary independent reviewer sign-off."`
- Independent verification is granted only when both primary and secondary reviewers are distinct identities (`dualApprovedBy !== verifierIdentity`).

---

### 4. Conflict of Interest Mitigation Matrix

| Submitter Role | Candidate Verifier Role | Allowed Status Target | Conflict Mitigation Rule |
| :--- | :--- | :--- | :--- |
| Platform Engineer | Platform Engineer | `system_observed` | Cannot promote to `independently_verified`. |
| Contractor Org | Contractor Org | `self_reported` | Contractor cannot attest own site wage payment. |
| Enterprise Client | Enterprise Site Supervisor | `partner_confirmed` | Requires distinct corporate signatory for full verification. |
| External Auditor | Independent Working Group | `independently_verified` | Valid if verified against source artifacts and dual-signed. |

---

### 5. Cryptographic Non-Repudiation

Each attestation record generates an RFC 8785 canonical signature digest:
$$\text{SignatureDigest} = \text{SHA256}(\text{claimId} \parallel \text{verifierIdentity} \parallel \text{actorRole} \parallel \text{methodology} \parallel \text{timestamp})$$

This ensures that once an attestation is written to the ledger, neither the verifier nor the platform can retroactively alter the evaluation criteria or repudiate the finding.
