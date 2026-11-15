# KAAMSETU — PHASE 28 SCHEMA CHANGE REGISTER
## Database Schema Modifications, Tables, Triggers & RLS Policy Additions

**Evaluation Context:** December 2026  
**Auditor:** Principal Database Architect & Migration Controller  
**Migration Reference:** `supabase/migrations/20261115000029_independent_audit_attestations_and_dispute_appeals.sql`

---

## 1. Migration Overview

Migration 29 was applied in Phase 28 to support independent external audit attestations, formal worker dispute appeals tribunals, and disaster recovery execution logs.

- **Migration File:** `supabase/migrations/20261115000029_independent_audit_attestations_and_dispute_appeals.sql`
- **Catalog State Post-Migration:** 100 base tables in `public` schema.
- **Row-Level Security (RLS) Coverage:** 100 of 100 base tables (100.0%).
- **Immutability Triggers:** 3 active triggers preventing tampering.

---

## 2. Table Additions & Detailed Specifications

### Table 1: `public.independent_audit_attestations`
- **Purpose:** Records formal third-party audit reports, auditor identities, cryptographic digest of evidence, and non-retaliation certifications.
- **Key Columns:**
  - `id` (UUID PK)
  - `attestation_code` (TEXT UNIQUE NOT NULL)
  - `auditor_entity` (TEXT NOT NULL)
  - `auditor_type` (TEXT CHECK IN (`ACCREDITED_FINANCIAL_AUDITOR`, `CYBERSECURITY_ASSURANCE_FIRM`, `WORKER_RIGHTS_OMBUDSPERSON`, `STATE_LABOUR_COMMISSION`))
  - `evaluation_phase` (TEXT NOT NULL)
  - `evidence_manifest_digest` (TEXT NOT NULL)
  - `non_retaliation_certified` (BOOLEAN DEFAULT TRUE)
  - `zero_commission_verified` (BOOLEAN DEFAULT TRUE)
  - `created_at` (TIMESTAMPTZ DEFAULT now())

### Table 2: `public.worker_dispute_appeals`
- **Purpose:** Tracks formal multi-tier appeals filed by workers against initial dispute resolutions.
- **Key Columns:**
  - `id` (UUID PK)
  - `appeal_code` (TEXT UNIQUE NOT NULL)
  - `dispute_code` (TEXT NOT NULL)
  - `worker_profile_id` (TEXT NOT NULL)
  - `appeal_tier` (TEXT CHECK IN (`TIER_1_CONCILIATION`, `TIER_2_OMBUDSPERSON`, `TIER_3_TRIBUNAL`))
  - `status` (TEXT CHECK IN (`FILED`, `HEARING_SCHEDULED`, `UNDER_ADJUDICATION`, `ADJUDICATED_FULL_RELIEF`, `DISMISSED`))
  - `ombudsperson_assigned` (TEXT NOT NULL)
  - `non_retaliation_certified` (BOOLEAN DEFAULT TRUE)
  - `created_at` (TIMESTAMPTZ DEFAULT now())

### Table 3: `public.production_dr_execution_log`
- **Purpose:** Formal audit trail for disaster recovery drills segregating staging simulations from production live failovers.
- **Key Columns:**
  - `id` (UUID PK)
  - `drill_code` (TEXT UNIQUE NOT NULL)
  - `drill_type` (TEXT CHECK IN (`STAGING_SIMULATION`, `PRODUCTION_FAILOVER`))
  - `target_environment` (TEXT NOT NULL)
  - `rto_seconds_measured` (INTEGER NOT NULL)
  - `rpo_seconds_measured` (INTEGER NOT NULL)
  - `data_corruption_detected` (BOOLEAN DEFAULT FALSE)
  - `created_at` (TIMESTAMPTZ DEFAULT now())

---

## 3. Immutability Triggers & RLS Policies

1. **`trg_dr_log_immutability`:** Prevents `UPDATE` and `DELETE` on `production_dr_execution_log`.
2. **`trg_dispute_appeal_non_retaliation`:** Ensures `non_retaliation_certified = TRUE` upon any dispute filing.
3. **RLS Policies:** Active on all 3 new tables, restricting writes to authorized ombudspersons and service roles while allowing authenticated workers to view their own dispute records.
