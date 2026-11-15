# PHASE 19: EVIDENCE REGISTRY SPECIFICATION
## Central Immutable Ledger Architecture, RFC 8785 Canonical Hashing & State Transitions

**Mission Invariant:** *"Every skill deserves to be seen, even without a degree."*  
**Date:** 2026-11-15  
**Database Table:** `public.evidence_registry_records` (Migration 20)  
**Domain Service:** `src/lib/governance/evidence-registry-service.ts`  
**API Route:** `/api/governance/evidence-registry`  
**Test Coverage:** `test/phase-19-evidence-assurance.test.ts` (Tests 95–100)

---

### 1. Architectural Purpose

To permanently prevent regression into unverified claims, Phase 19 establishes a central **Evidence Registry** that records, cryptographically digests, and tracks the lifecycle of every material platform claim.

Every platform capability (RLS coverage, enterprise pilots, ONDC conformance, financial APR compliance) must be anchored to a primary reproducible artifact.

---

### 2. Schema Specification & Migration 20

```sql
CREATE TABLE IF NOT EXISTS public.evidence_registry_records (
  id TEXT PRIMARY KEY,
  claim_id TEXT NOT NULL UNIQUE,
  claim_description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'enterprise_pilot', 'erp_integration', 'ondc_network', 'onest_dsep',
    'responsible_finance', 'worker_outcome', 'commercial_revenue',
    'regional_gate', 'security_dpdp', 'multi_region_dr',
    'observability', 'worker_sovereignty'
  )),
  source_system TEXT NOT NULL,
  evidence_location TEXT NOT NULL,
  evidence_sha256 TEXT NOT NULL,
  collection_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  verification_timestamp TIMESTAMPTZ,
  verifier_role TEXT NOT NULL DEFAULT 'independent_auditor',
  scope_and_limitations TEXT NOT NULL,
  expiry_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'unverified' CHECK (status IN (
    'unverified', 'self_reported', 'system_observed', 'partner_confirmed',
    'independently_verified', 'expired', 'disputed', 'rejected'
  )),
  is_public_safe BOOLEAN NOT NULL DEFAULT true,
  redacted_summary TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### 3. Progressive Verification State Machine

Claims cannot be arbitrarily upgraded. The service enforces progressive verification transitions:

```
┌──────────────┐
│  unverified  │
└──────┬───────┘
       │
       ├─────────────────────────────────┐
       ▼                                 ▼
┌──────────────┐                  ┌──────────────┐
│self_reported │                  │system_observed│
└──────┬───────┘                  └──────┬───────┘
       │                                 │
       ▼                                 ├────────────────────────┐
┌──────────────┐                         ▼                        ▼
│   rejected   │                 ┌─────────────────┐    ┌────────────────────┐
└──────────────┘                 │partner_confirmed│    │independently_verified
                                 └────────┬────────┘    └────────┬───────────┘
                                          │                      │
                                          ▼                      ▼
                                 ┌─────────────────┐    ┌────────────────────┐
                                 │     expired     │    │      disputed      │
                                 └─────────────────┘    └────────────────────┘
```

- **Rule 1**: An `unverified` claim may transition only to `self_reported`, `system_observed`, or `rejected`.
- **Rule 2**: Attempting to jump directly from `unverified` to `independently_verified` without system observation is strictly rejected with an `INVALID_STATUS_TRANSITION` error (Test 98).

---

### 4. Canonical Hashing & Privacy Redaction

- **RFC 8785 Canonical Digest**: Payloads are sorted deterministically before computing the SHA-256 digest (`computeEvidenceHash`), guaranteeing identical digests regardless of JSON key order (Test 95).
- **Automated PII Scrubbing**: Constructing an evidence record whose public summary contains an Aadhaar pattern, raw 10-digit phone number, or Bearer authentication token is rejected immediately at construction time (Test 96).

---

### 5. Summary

The Evidence Registry provides cryptographic immutability, complete lifecycle traceability, and audit non-repudiation for all platform operations.
