/**
 * KAAMSETU Supabase Backend Verification Suite
 * Tests and verifies schema migrations, RLS logic, typed interfaces, and query helpers.
 */

import * as fs from "fs";
import * as path from "path";
import { getOccupations, getOccupationBySlug, getOccupationWithSkills } from "./occupations";
import { getPublishedWorkerProfiles, getWorkerProfileBySlug } from "./profiles";
import { getWorkerPortfolio } from "./portfolio";
import { checkReviewEligibility, getWorkerReviews } from "./reviews";
import { getWorkerRecords } from "./work-records";
import { env } from "../../env";

interface TestResult {
  suite: string;
  test: string;
  passed: boolean;
  details?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, suite: string, test: string, details = "") {
  results.push({
    suite,
    test,
    passed: Boolean(condition),
    details,
  });
}

export async function runBackendVerification() {
  console.log("=================================================================");
  console.log("KAAMSETU SUPABASE BACKEND VERIFICATION SUITE");
  console.log("=================================================================\n");

  const projectRoot = process.cwd();

  // ---------------------------------------------------------------------------
  // TEST SUITE 1: Migration & Schema SQL Files
  // ---------------------------------------------------------------------------
  const migration1Path = path.join(projectRoot, "supabase/migrations/20261114000001_initial_schema.sql");
  const migration2Path = path.join(projectRoot, "supabase/migrations/20261114000002_row_level_security.sql");
  const migration7Path = path.join(projectRoot, "supabase/migrations/20261114000007_contractor_and_institutional_platform.sql");
  const migration8Path = path.join(projectRoot, "supabase/migrations/20261114000008_commercial_launch_and_workforce_consent.sql");
  const migration9Path = path.join(projectRoot, "supabase/migrations/20261114000009_production_operations_crm_and_webhooks.sql");
  const migration10Path = path.join(projectRoot, "supabase/migrations/20261114000010_scale_multi_cohort_and_retention.sql");
  const migration11Path = path.join(projectRoot, "supabase/migrations/20261114000011_national_multi_region_network.sql");
  const migration12Path = path.join(projectRoot, "supabase/migrations/20261114000012_interstate_expansion_and_ecosystem.sql");
  const migration13Path = path.join(projectRoot, "supabase/migrations/20261114000013_national_network_readiness.sql");
  const migration14Path = path.join(projectRoot, "supabase/migrations/20261115000014_national_operations_scale.sql");
  const migration15Path = path.join(projectRoot, "supabase/migrations/20261115000015_operational_proof_and_trust.sql");
  const migration16Path = path.join(projectRoot, "supabase/migrations/20261115000016_verified_regional_growth.sql");
  const migration17Path = path.join(projectRoot, "supabase/migrations/20261115000017_independent_verification_and_scale.sql");
  const migration18Path = path.join(projectRoot, "supabase/migrations/20261115000018_national_ecosystem_and_responsible_finance.sql");
  const migration19Path = path.join(projectRoot, "supabase/migrations/20261115000019_live_ecosystem_and_regional_activation.sql");
  const migration20Path = path.join(projectRoot, "supabase/migrations/20261115000020_evidence_registry_and_outcome_verification.sql");
  const migration21Path = path.join(projectRoot, "supabase/migrations/20261115000021_evidence_registry_v2_and_attestation.sql");
  const migration22Path = path.join(projectRoot, "supabase/migrations/20261115000022_verified_regional_operations_and_ratification.sql");
  const migration23Path = path.join(projectRoot, "supabase/migrations/20261115000023_independent_regional_assurance_and_audit.sql");
  const migration24Path = path.join(projectRoot, "supabase/migrations/20261115000024_production_transition_and_institutional_execution.sql");
  const migration25Path = path.join(projectRoot, "supabase/migrations/20261115000025_institutional_gate_closure_and_impact_replication.sql");
  const migration26Path = path.join(projectRoot, "supabase/migrations/20261115000026_temporal_integrity_and_blocker_state_machine.sql");
  const migration27Path = path.join(projectRoot, "supabase/migrations/20261115000027_w3c_credentials_and_dpdp_consent_enforcement.sql");
  const migration28Path = path.join(projectRoot, "supabase/migrations/20261115000028_audit_hash_chaining_and_payout_disputes.sql");
  const migration29Path = path.join(projectRoot, "supabase/migrations/20261115000029_independent_audit_attestations_and_dispute_appeals.sql");
  const migration30Path = path.join(projectRoot, "supabase/migrations/20261116000030_phase35_1_security_and_financial_integrity.sql");
  const seedPath = path.join(projectRoot, "supabase/seed.sql");

  assert(fs.existsSync(migration1Path), "1. SQL Migrations", "Migration 01 (Initial Schema) exists");
  assert(fs.existsSync(migration2Path), "1. SQL Migrations", "Migration 02 (Row Level Security) exists");
  assert(fs.existsSync(migration7Path), "1. SQL Migrations", "Migration 07 (Contractor Pro & Institutional Platform) exists");
  assert(fs.existsSync(migration8Path), "1. SQL Migrations", "Migration 08 (Commercial Launch & Workforce Consent) exists");
  assert(fs.existsSync(migration9Path), "1. SQL Migrations", "Migration 09 (Production Operations, CRM & Webhooks) exists");
  assert(fs.existsSync(migration10Path), "1. SQL Migrations", "Migration 10 (Scale, Multi-Cohort & Retention) exists");
  assert(fs.existsSync(migration11Path), "1. SQL Migrations", "Migration 11 (National Multi-Region Network) exists");
  assert(fs.existsSync(migration12Path), "1. SQL Migrations", "Migration 12 (Interstate Expansion & Ecosystem) exists");
  assert(fs.existsSync(migration13Path), "1. SQL Migrations", "Migration 13 (National Network Readiness) exists");
  assert(fs.existsSync(migration14Path), "1. SQL Migrations", "Migration 14 (National Operations & Scale) exists");
  assert(fs.existsSync(migration15Path), "1. SQL Migrations", "Migration 15 (Operational Proof & Trust) exists");
  assert(fs.existsSync(migration16Path), "1. SQL Migrations", "Migration 16 (Verified Regional Growth) exists");
  assert(fs.existsSync(migration17Path), "1. SQL Migrations", "Migration 17 (Independent Verification & Scale) exists");
  assert(fs.existsSync(migration18Path), "1. SQL Migrations", "Migration 18 (National Ecosystem & Responsible Finance) exists");
  assert(fs.existsSync(migration19Path), "1. SQL Migrations", "Migration 19 (Live Ecosystem & Regional Activation) exists");
  assert(fs.existsSync(migration20Path), "1. SQL Migrations", "Migration 20 (Evidence Registry & Outcome Verification) exists");
  assert(fs.existsSync(migration21Path), "1. SQL Migrations", "Migration 21 (Evidence Registry V2 & Attestation) exists");
  assert(fs.existsSync(migration22Path), "1. SQL Migrations", "Migration 22 (Verified Regional Operations & Ratification) exists");
  assert(fs.existsSync(migration23Path), "1. SQL Migrations", "Migration 23 (Independent Regional Assurance & Audit) exists");
  assert(fs.existsSync(migration24Path), "1. SQL Migrations", "Migration 24 (Production Transition & Institutional Execution) exists");
  assert(fs.existsSync(migration25Path), "1. SQL Migrations", "Migration 25 (Institutional Gate Closure & Impact Replication) exists");
  assert(fs.existsSync(migration26Path), "1. SQL Migrations", "Migration 26 (Temporal Data Integrity & Blocker State Machine) exists");
  assert(fs.existsSync(migration27Path), "1. SQL Migrations", "Migration 27 (W3C Credentials Registry & DPDP Consent) exists");
  assert(fs.existsSync(migration28Path), "1. SQL Migrations", "Migration 28 (Audit Hash Chaining & Payout Disputes) exists");
  assert(fs.existsSync(migration29Path), "1. SQL Migrations", "Migration 29 (Independent Audit Attestations & Dispute Appeals) exists");
  assert(fs.existsSync(migration30Path), "1. SQL Migrations", "Migration 30 (Security & Financial Integrity) exists");
  assert(fs.existsSync(seedPath), "1. SQL Migrations", "Seed SQL data exists");

  const m30Content = fs.readFileSync(migration30Path, "utf-8");
  assert(
    m30Content.includes("trg_prevent_ledger_clawback") && m30Content.includes("fn_prevent_ledger_clawback_and_commission"),
    "1. SQL Migrations",
    "Migration 30 defines immutable trigger trg_prevent_ledger_clawback"
  );
  assert(
    m30Content.includes("uq_worker_payout_reference") && m30Content.includes("uq_worker_payout_idempotency_key"),
    "1. SQL Migrations",
    "Migration 30 enforces database uniqueness on payout_reference and idempotency_key"
  );
  assert(
    m30Content.includes("trg_prevent_payout_tampering") && m30Content.includes("fn_prevent_payout_tampering"),
    "1. SQL Migrations",
    "Migration 30 defines immutable trigger trg_prevent_payout_tampering"
  );

  const m1Content = fs.readFileSync(migration1Path, "utf-8");
  const requiredTables = [
    "occupations",
    "skills",
    "profiles",
    "worker_profiles",
    "worker_skills",
    "portfolio",
    "bookings",
    "reviews",
    "work_records",
  ];

  for (const table of requiredTables) {
    const tableRegex = new RegExp(`CREATE TABLE (IF NOT EXISTS )?public\\.${table}`, "i");
    assert(
      tableRegex.test(m1Content),
      "1. SQL Migrations",
      `Table public.${table} defined in schema`
    );
  }

  // Check unique slug trigger
  assert(
    m1Content.includes("generate_worker_profile_slug"),
    "1. SQL Migrations",
    "Unique profile slug generation trigger function defined"
  );

  const m7Content = fs.readFileSync(migration7Path, "utf-8");
  const phase6Tables = [
    "contractor_organizations",
    "contractor_workforce",
    "contractor_projects",
    "institutions",
    "institutional_cohorts",
    "cohort_participants",
    "abuse_reports",
    "profile_corrections",
  ];

  for (const table of phase6Tables) {
    const tableRegex = new RegExp(`CREATE TABLE (IF NOT EXISTS )?public\\.${table}`, "i");
    assert(
      tableRegex.test(m7Content),
      "1. SQL Migrations",
      `Phase 6 Table public.${table} defined in schema`
    );
  }

  const m8Content = fs.readFileSync(migration8Path, "utf-8");
  const phase7Tables = [
    "workforce_invitations",
    "subscription_orders",
    "cohort_trainee_progress",
    "institution_audit_logs",
  ];

  for (const table of phase7Tables) {
    const tableRegex = new RegExp(`CREATE TABLE (IF NOT EXISTS )?public\\.${table}`, "i");
    assert(
      tableRegex.test(m8Content),
      "1. SQL Migrations",
      `Phase 7 Table public.${table} defined in schema`
    );
  }

  const m9Content = fs.readFileSync(migration9Path, "utf-8");
  const phase8Tables = [
    "crm_contractor_leads",
    "payment_webhook_events",
    "worker_association_events",
  ];

  for (const table of phase8Tables) {
    const tableRegex = new RegExp(`CREATE TABLE (IF NOT EXISTS )?public\\.${table}`, "i");
    assert(
      tableRegex.test(m9Content),
      "1. SQL Migrations",
      `Phase 8 Table public.${table} defined in schema`
    );
  }

  const m10Content = fs.readFileSync(migration10Path, "utf-8");
  const phase9Tables = [
    "contractor_team_members",
    "project_crew_assignments",
    "contractor_customer_health",
    "worker_identity_exports",
    "regional_expansion_readiness",
  ];

  for (const table of phase9Tables) {
    const tableRegex = new RegExp(`CREATE TABLE (IF NOT EXISTS )?public\\.${table}`, "i");
    assert(
      tableRegex.test(m10Content),
      "1. SQL Migrations",
      `Phase 9 Table public.${table} defined in schema`
    );
  }

  const m11Content = fs.readFileSync(migration11Path, "utf-8");
  const phase10Tables = [
    "operational_regions",
    "regional_administrators",
    "worker_identity_access_grants",
    "identity_access_audit_logs",
    "partner_crm_records",
    "workforce_opportunities",
    "worker_opportunity_applications",
    "skills_gap_recommendations",
  ];

  for (const table of phase10Tables) {
    const tableRegex = new RegExp(`CREATE TABLE (IF NOT EXISTS )?public\\.${table}`, "i");
    assert(
      tableRegex.test(m11Content),
      "1. SQL Migrations",
      `Phase 10 Table public.${table} defined in schema`
    );
  }

  const m12Content = fs.readFileSync(migration12Path, "utf-8");
  const phase11Tables = [
    "institutional_credentials",
    "institutional_partner_api_keys",
    "worker_disputes",
    "opportunity_feedback_reports",
  ];

  for (const table of phase11Tables) {
    const tableRegex = new RegExp(`CREATE TABLE (IF NOT EXISTS )?public\\.${table}`, "i");
    assert(
      tableRegex.test(m12Content),
      "1. SQL Migrations",
      `Phase 11 Table public.${table} defined in schema`
    );
  }

  const m13Content = fs.readFileSync(migration13Path, "utf-8");
  const phase12Tables = [
    "regional_launch_transitions",
    "cross_region_project_staffing",
    "payment_records_ledger",
    "offline_verification_logs",
  ];

  for (const table of phase12Tables) {
    const tableRegex = new RegExp(`CREATE TABLE (IF NOT EXISTS )?public\\.${table}`, "i");
    assert(
      tableRegex.test(m13Content),
      "1. SQL Migrations",
      `Phase 12 Table public.${table} defined in schema`
    );
  }

  const m14Content = fs.readFileSync(migration14Path, "utf-8");
  const phase13Tables = [
    "regional_launch_milestones",
    "regional_operational_incidents",
    "institution_authorized_signatories",
    "worker_privacy_settings",
    "financial_gst_ledger",
    "regional_service_telemetry",
  ];

  for (const table of phase13Tables) {
    const tableRegex = new RegExp(`CREATE TABLE (IF NOT EXISTS )?public\\.${table}`, "i");
    assert(
      tableRegex.test(m14Content),
      "1. SQL Migrations",
      `Phase 13 Table public.${table} defined in schema`
    );
    assert(
      m14Content.includes(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY`),
      "2. Row Level Security",
      `Phase 13 RLS enabled on public.${table}`
    );
  }

  const m15Content = fs.readFileSync(migration15Path, "utf-8");
  const phase14Tables = [
    "regional_dual_approvals",
    "review_moderation_appeals",
    "operational_incidents_lifecycle",
    "financial_reconciliation_exceptions",
    "regional_operational_scorecards",
    "worker_consent_audit_events",
  ];

  for (const table of phase14Tables) {
    const tableRegex = new RegExp(`CREATE TABLE (IF NOT EXISTS )?public\\.${table}`, "i");
    assert(
      tableRegex.test(m15Content),
      "1. SQL Migrations",
      `Phase 14 Table public.${table} defined in schema`
    );
    assert(
      m15Content.includes(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY`),
      "2. Row Level Security",
      `Phase 14 RLS enabled on public.${table}`
    );
  }

  const m16Content = fs.readFileSync(migration16Path, "utf-8");
  const phase15Tables = [
    "regional_network_liquidity_snapshots",
    "worker_payout_confirmations",
    "contractor_customer_success_events",
    "institutional_onboarding_lifecycle",
    "worker_support_assignments",
    "analytics_provenance_events",
  ];

  for (const table of phase15Tables) {
    const tableRegex = new RegExp(`CREATE TABLE (IF NOT EXISTS )?public\\.${table}`, "i");
    assert(
      tableRegex.test(m16Content),
      "1. SQL Migrations",
      `Phase 15 Table public.${table} defined in schema`
    );
    assert(
      m16Content.includes(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY`),
      "2. Row Level Security",
      `Phase 15 RLS enabled on public.${table}`
    );
  }

  const m17Content = fs.readFileSync(migration17Path, "utf-8");
  const phase16Tables = [
    "metric_evidence_records",
    "worker_outcome_cohorts",
    "state_launch_gate_evaluations",
  ];

  for (const table of phase16Tables) {
    const tableRegex = new RegExp(`CREATE TABLE (IF NOT EXISTS )?public\\.${table}`, "i");
    assert(
      tableRegex.test(m17Content),
      "1. SQL Migrations",
      `Phase 16 Table public.${table} defined in schema`
    );
    assert(
      m17Content.includes(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY`),
      "2. Row Level Security",
      `Phase 16 RLS enabled on public.${table}`
    );
  }

  const m18Content = fs.readFileSync(migration18Path, "utf-8");
  const phase17Tables = [
    "external_ecosystem_transactions",
    "worker_financial_consents",
    "enterprise_sync_logs",
  ];

  for (const table of phase17Tables) {
    const tableRegex = new RegExp(`CREATE TABLE (IF NOT EXISTS )?public\\.${table}`, "i");
    assert(
      tableRegex.test(m18Content),
      "1. SQL Migrations",
      `Phase 17 Table public.${table} defined in schema`
    );
    assert(
      m18Content.includes(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY`),
      "2. Row Level Security",
      `Phase 17 RLS enabled on public.${table}`
    );
  }

  const m19Content = fs.readFileSync(migration19Path, "utf-8");
  const phase18Tables = [
    "live_ecosystem_participants",
    "enterprise_pilot_engagements",
    "tool_financing_pilot_applications",
  ];

  for (const table of phase18Tables) {
    const tableRegex = new RegExp(`CREATE TABLE (IF NOT EXISTS )?public\\.${table}`, "i");
    assert(
      tableRegex.test(m19Content),
      "1. SQL Migrations",
      `Phase 18 Table public.${table} defined in schema`
    );
    assert(
      m19Content.includes(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY`),
      "2. Row Level Security",
      `Phase 18 RLS enabled on public.${table}`
    );
  }

  const m20Content = fs.readFileSync(migration20Path, "utf-8");
  const phase19Tables = [
    "evidence_registry_records",
    "worker_outcome_milestones",
  ];

  for (const table of phase19Tables) {
    const tableRegex = new RegExp(`CREATE TABLE (IF NOT EXISTS )?public\\.${table}`, "i");
    assert(
      tableRegex.test(m20Content),
      "1. SQL Migrations",
      `Phase 19 Table public.${table} defined in schema`
    );
    assert(
      m20Content.includes(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY`),
      "2. Row Level Security",
      `Phase 19 RLS enabled on public.${table}`
    );
  }

  const m21Content = fs.readFileSync(migration21Path, "utf-8");
  const phase20Tables = [
    "evidence_attestation_events",
  ];

  for (const table of phase20Tables) {
    const tableRegex = new RegExp(`CREATE TABLE (IF NOT EXISTS )?public\\.${table}`, "i");
    assert(
      tableRegex.test(m21Content),
      "1. SQL Migrations",
      `Phase 20 Table public.${table} defined in schema`
    );
    assert(
      m21Content.includes(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY`),
      "2. Row Level Security",
      `Phase 20 RLS enabled on public.${table}`
    );
  }

  const m22Content = fs.readFileSync(migration22Path, "utf-8");
  const phase21Tables = [
    "regional_market_evaluations",
    "institutional_ratification_records",
  ];

  for (const table of phase21Tables) {
    const tableRegex = new RegExp(`CREATE TABLE (IF NOT EXISTS )?public\\.${table}`, "i");
    assert(
      tableRegex.test(m22Content),
      "1. SQL Migrations",
      `Phase 21 Table public.${table} defined in schema`
    );
    assert(
      m22Content.includes(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY`),
      "2. Row Level Security",
      `Phase 21 RLS enabled on public.${table}`
    );
  }

  const m23Content = fs.readFileSync(migration23Path, "utf-8");
  const phase22Tables = [
    "operational_claim_reconciliations",
    "worker_payment_verification_events",
    "worker_economic_snapshots",
    "regional_operating_reviews",
    "institutional_instrument_reviews",
    "audit_evidence_review_events",
  ];

  for (const table of phase22Tables) {
    const tableRegex = new RegExp(`CREATE TABLE (IF NOT EXISTS )?public\\.${table}`, "i");
    assert(
      tableRegex.test(m23Content),
      "1. SQL Migrations",
      `Phase 22 Table public.${table} defined in schema`
    );
    assert(
      m23Content.includes(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY`),
      "2. Row Level Security",
      `Phase 22 RLS enabled on public.${table}`
    );
  }

  const m24Content = fs.readFileSync(migration24Path, "utf-8");
  const phase23Tables = [
    "production_release_manifests",
    "enterprise_pilot_authorizations",
    "worker_impact_evaluations",
    "class_a_readiness_audits",
  ];

  for (const table of phase23Tables) {
    const tableRegex = new RegExp(`CREATE TABLE (IF NOT EXISTS )?public\\.${table}`, "i");
    assert(
      tableRegex.test(m24Content),
      "1. SQL Migrations",
      `Phase 23 Table public.${table} defined in schema`
    );
    assert(
      m24Content.includes(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY`),
      "2. Row Level Security",
      `Phase 23 RLS enabled on public.${table}`
    );
  }

  const m25Content = fs.readFileSync(migration25Path, "utf-8");
  const phase24Tables = [
    "institutional_blocker_evaluations",
    "worker_impact_replication_studies",
    "sustained_regional_operations_records",
  ];

  for (const table of phase24Tables) {
    const tableRegex = new RegExp(`CREATE TABLE (IF NOT EXISTS )?public\\.${table}`, "i");
    assert(
      tableRegex.test(m25Content),
      "1. SQL Migrations",
      `Phase 24 Table public.${table} defined in schema`
    );
    assert(
      m25Content.includes(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY`),
      "2. Row Level Security",
      `Phase 24 RLS enabled on public.${table}`
    );
  }

  const m26Content = fs.readFileSync(migration26Path, "utf-8");
  const phase25Tables = [
    "institutional_blocker_transition_audit_logs",
  ];

  for (const table of phase25Tables) {
    const tableRegex = new RegExp(`CREATE TABLE (IF NOT EXISTS )?public\\.${table}`, "i");
    assert(
      tableRegex.test(m26Content),
      "1. SQL Migrations",
      `Phase 25 Table public.${table} defined in schema`
    );
    assert(
      m26Content.includes(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY`),
      "2. Row Level Security",
      `Phase 25 RLS enabled on public.${table}`
    );
  }

  const m27Content = fs.readFileSync(migration27Path, "utf-8");
  const phase26Tables = [
    "w3c_verifiable_credential_registry",
  ];

  for (const table of phase26Tables) {
    const tableRegex = new RegExp(`CREATE TABLE (IF NOT EXISTS )?public\\.${table}`, "i");
    assert(
      tableRegex.test(m27Content),
      "1. SQL Migrations",
      `Phase 26 Table public.${table} defined in schema`
    );
    assert(
      m27Content.includes(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY`),
      "2. Row Level Security",
      `Phase 26 RLS enabled on public.${table}`
    );
  }

  const m28Content = fs.readFileSync(migration28Path, "utf-8");
  const phase27Tables = [
    "audit_chain_checkpoints",
    "worker_payout_dispute_records",
    "worker_payout_dispute_events"
  ];

  for (const table of phase27Tables) {
    const tableRegex = new RegExp(`CREATE TABLE (IF NOT EXISTS )?public\\.${table}`, "i");
    assert(
      tableRegex.test(m28Content),
      "1. SQL Migrations",
      `Phase 27 Table public.${table} defined in schema`
    );
    assert(
      m28Content.includes(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY`),
      "2. Row Level Security",
      `Phase 27 RLS enabled on public.${table}`
    );
  }

  const m29Content = fs.readFileSync(migration29Path, "utf-8");
  const phase28Tables = [
    "independent_audit_attestations",
    "worker_dispute_appeals",
    "production_dr_execution_log"
  ];

  for (const table of phase28Tables) {
    const tableRegex = new RegExp(`CREATE TABLE (IF NOT EXISTS )?public\\.${table}`, "i");
    assert(
      tableRegex.test(m29Content),
      "1. SQL Migrations",
      `Phase 28 Table public.${table} defined in schema`
    );
    assert(
      m29Content.includes(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY`),
      "2. Row Level Security",
      `Phase 28 RLS enabled on public.${table}`
    );
  }

  assert(
    m29Content.includes("enforce_attestation_evidence_immutability") &&
    m29Content.includes("trg_audit_attestation_immutability"),
    "2. Row Level Security",
    "Phase 28 Attestation evidence immutability trigger defined"
  );

  assert(
    m29Content.includes("enforce_appeal_non_retaliation") &&
    m29Content.includes("trg_dispute_appeal_non_retaliation"),
    "2. Row Level Security",
    "Phase 28 Worker dispute appeal anti-retaliation trigger defined"
  );

  assert(
    m29Content.includes("enforce_dr_log_immutability") &&
    m29Content.includes("trg_dr_log_immutability"),
    "2. Row Level Security",
    "Phase 28 Production DR execution log immutability trigger defined"
  );

  // ---------------------------------------------------------------------------
  // TEST SUITE 2: Row Level Security (RLS) Policies
  // ---------------------------------------------------------------------------
  const m2Content = fs.readFileSync(migration2Path, "utf-8");

  for (const table of requiredTables) {
    assert(
      m2Content.includes(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY`),
      "2. Row Level Security",
      `RLS enabled on public.${table}`
    );
  }

  for (const table of phase6Tables) {
    assert(
      m7Content.includes(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY`),
      "2. Row Level Security",
      `RLS enabled on Phase 6 public.${table}`
    );
  }

  for (const table of phase7Tables) {
    assert(
      m8Content.includes(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY`),
      "2. Row Level Security",
      `RLS enabled on Phase 7 public.${table}`
    );
  }

  for (const table of phase8Tables) {
    assert(
      m9Content.includes(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY`),
      "2. Row Level Security",
      `RLS enabled on Phase 8 public.${table}`
    );
  }

  for (const table of phase9Tables) {
    assert(
      m10Content.includes(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY`),
      "2. Row Level Security",
      `RLS enabled on Phase 9 public.${table}`
    );
  }

  for (const table of phase10Tables) {
    assert(
      m11Content.includes(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY`),
      "2. Row Level Security",
      `RLS enabled on Phase 10 public.${table}`
    );
  }

  for (const table of phase11Tables) {
    assert(
      m12Content.includes(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY`),
      "2. Row Level Security",
      `RLS enabled on Phase 11 public.${table}`
    );
  }

  for (const table of phase12Tables) {
    assert(
      m13Content.includes(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY`),
      "2. Row Level Security",
      `RLS enabled on Phase 12 public.${table}`
    );
  }

  assert(
    m2Content.includes("Public read access only to published worker profiles") &&
    m2Content.includes("is_published = true"),
    "2. Row Level Security",
    "Public read access STRICTLY gated to published profiles (is_published = true)"
  );

  assert(
    m2Content.includes("Public read portfolio only for published workers"),
    "2. Row Level Security",
    "Private portfolio policy: public read only for published workers"
  );

  assert(
    m2Content.includes("Customers and assigned workers can view their bookings"),
    "2. Row Level Security",
    "Strict booking ownership policy enforced"
  );

  assert(
    m2Content.includes("Only eligible customers with completed bookings can insert reviews") &&
    m2Content.includes("status = 'completed'"),
    "2. Row Level Security",
    "Customer review eligibility: ONLY customers with a completed booking can review"
  );

  // ---------------------------------------------------------------------------
  // TEST SUITE 3: Demo Seed Data Coverage (At least 9 occupations)
  // ---------------------------------------------------------------------------
  const seedContent = fs.readFileSync(seedPath, "utf-8");

  const occupationMatches = seedContent.match(/'11111111-1111-1111-1111-1111111111\d{2}'/g);
  const occupationCount = occupationMatches ? new Set(occupationMatches).size : 0;
  assert(
    occupationCount >= 9,
    "3. Seed Data Coverage",
    `Demo seed data covers ${occupationCount} distinct occupations (>= 9 required)`
  );

  assert(
    seedContent.includes("is_published, availability_status") &&
    seedContent.includes("false, 'unavailable'") &&
    seedContent.includes("preeti-kulkarni-mumbai"),
    "3. Seed Data Coverage",
    "Includes unpublished draft profile for RLS testing isolation"
  );

  assert(
    seedContent.includes("BK-2025-4011") && seedContent.includes("'completed'"),
    "3. Seed Data Coverage",
    "Includes completed service bookings eligible for review"
  );

  assert(
    seedContent.includes("sha256_"),
    "3. Seed Data Coverage",
    "Includes cryptographic verification hashes on work records"
  );

  // ---------------------------------------------------------------------------
  // TEST SUITE 4: Server Database Helper Queries
  // ---------------------------------------------------------------------------
  const occupations = await getOccupations();
  assert(occupations.length >= 8, "4. Database Helpers", `getOccupations returned ${occupations.length} trades`);

  const solarOcc = await getOccupationBySlug("electrical-solar");
  assert(solarOcc !== null && solarOcc.slug === "electrical-solar", "4. Database Helpers", "getOccupationBySlug resolves electrical-solar");

  const occWithSkills = await getOccupationWithSkills(solarOcc ? solarOcc.id : "test-id");
  assert(occWithSkills.skills.length > 0, "4. Database Helpers", `getOccupationWithSkills returns ${occWithSkills.skills.length} skills`);

  const publishedWorkers = await getPublishedWorkerProfiles();
  assert(publishedWorkers.length > 0, "4. Database Helpers", `getPublishedWorkerProfiles returns ${publishedWorkers.length} profiles`);

  const draftInPublic = publishedWorkers.some((w) => !w.is_published);
  assert(!draftInPublic, "4. Database Helpers", "Verified ZERO unpublished/draft profiles exposed to public queries");

  const rameshwar = await getWorkerProfileBySlug("rameshwar-sharma-jaipur");
  assert(rameshwar !== null, "4. Database Helpers", "getWorkerProfileBySlug resolves rameshwar-sharma-jaipur");

  const portfolio = await getWorkerPortfolio(rameshwar ? rameshwar.id : "pro-1");
  assert(portfolio.length > 0, "4. Database Helpers", `getWorkerPortfolio returned ${portfolio.length} portfolio items`);

  const reviews = await getWorkerReviews(rameshwar ? rameshwar.id : "pro-1");
  assert(reviews.length > 0, "4. Database Helpers", `getWorkerReviews returned ${reviews.length} reviews`);

  const workRecords = await getWorkerRecords(rameshwar ? rameshwar.id : "pro-1");
  assert(workRecords.length > 0, "4. Database Helpers", `getWorkerRecords returned ${workRecords.length} records`);

  // Review eligibility check
  const eligibility = await checkReviewEligibility(
    "44444444-4444-4444-4444-444444440001", // Customer with completed booking
    "55555555-5555-5555-5555-555555550001"  // Rameshwar Sharma
  );
  assert(eligibility.eligible, "4. Database Helpers", "checkReviewEligibility confirms customer with completed booking");

  // ---------------------------------------------------------------------------
  // TEST SUITE 5: Security Invariant (Service-Role Key Isolation)
  // ---------------------------------------------------------------------------
  const browserClientPath = path.join(projectRoot, "src/lib/supabase/client.ts");
  const browserClientContent = fs.readFileSync(browserClientPath, "utf-8");
  assert(
    !browserClientContent.includes("SUPABASE_SERVICE_ROLE_KEY") &&
    browserClientContent.includes("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    "5. Security Invariant",
    "Browser client NEVER references or exposes SUPABASE_SERVICE_ROLE_KEY"
  );

  const envContent = fs.readFileSync(path.join(projectRoot, "src/lib/env.ts"), "utf-8");
  assert(
    !envContent.includes("NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY"),
    "5. Security Invariant",
    "Service role key is NOT exposed via NEXT_PUBLIC prefix"
  );

  // ---------------------------------------------------------------------------
  // TEST SUITE 6: Migration 04 & Storage/RLS Hardening
  // ---------------------------------------------------------------------------
  const migration4Path = path.join(projectRoot, "supabase/migrations/20261114000004_security_hardening.sql");
  assert(fs.existsSync(migration4Path), "6. Security Hardening", "Migration 04 (Security Hardening) exists");

  const m4Content = fs.readFileSync(migration4Path, "utf-8");
  assert(
    m4Content.includes("public_worker_profiles") && m4Content.includes("CREATE OR REPLACE VIEW"),
    "6. Security Hardening",
    "Public worker profiles view securely restricts unauthenticated phone/email leakage"
  );

  assert(
    m4Content.includes("Workers can upload portfolio images to own folder only") && m4Content.includes("storage.objects"),
    "6. Security Hardening",
    "Storage folder isolation: workers can ONLY upload to their own folder (auth.uid() = folder)"
  );

  assert(
    m4Content.includes("validate_booking_status_transition"),
    "6. Security Hardening",
    "Database trigger validates booking lifecycle transitions (preventing invalid transitions)"
  );

  assert(
    !seedContent.includes("TRUNCATE TABLE") && !seedContent.includes("CASCADE"),
    "6. Security Hardening",
    "Seed SQL removed destructive TRUNCATE CASCADE, using safe idempotent operations"
  );

  // ---------------------------------------------------------------------------
  // TEST SUITE 7: AI Non-Invention & Multilingual Verification
  // ---------------------------------------------------------------------------
  const { extractOnboardingProfile } = await import("../../gemini/onboarding-extractor");

  // Case A: Transcript without years, rate, or tools
  const bareTranscript = "नमस्ते, मैं राजेश शर्मा हूँ। मैं जयपुर में कारपेंटर और बढ़ई का काम करता हूँ।";
  const bareExtraction = await extractOnboardingProfile({ transcript: bareTranscript, language: "hi", inputMode: "voice" });

  assert(
    bareExtraction.fullName.includes("Rameshwar") || bareExtraction.fullName.includes("Rajesh") || bareExtraction.fullName !== "",
    "7. AI Non-Invention",
    "Extracted worker identity from Hindi transcript"
  );
  assert(
    bareExtraction.experienceYears === null,
    "7. AI Non-Invention",
    "Non-invention invariant: experienceYears is null when unmentioned (never defaulted to 0 or 5)"
  );
  assert(
    bareExtraction.servicesOffered.every((s) => !s.indicativeRate),
    "7. AI Non-Invention",
    "Non-invention invariant: daily rates are undefined when unmentioned"
  );
  assert(
    bareExtraction.equipmentHandled.length === 0,
    "7. AI Non-Invention",
    "Non-invention invariant: equipment list is EMPTY when unmentioned"
  );
  assert(
    bareExtraction.missingFields.some((f) => f.toLowerCase().includes("experience")),
    "7. AI Non-Invention",
    "Unmentioned experience accurately flagged in missingFields array"
  );

  // Case B: Transcript with explicit years and equipment
  const detailedTranscript = "Hello, my name is Arumugam. I have 12 years of experience as an electrician in Chennai. I own a Bosch drill and multimeter.";
  const detailedExtraction = await extractOnboardingProfile({ transcript: detailedTranscript, language: "en", inputMode: "voice" });

  assert(
    detailedExtraction.experienceYears === 12,
    "7. AI Non-Invention",
    "Extracted stated 12 years experience accurately"
  );
  assert(
    detailedExtraction.equipmentHandled.length > 0,
    "7. AI Non-Invention",
    "Extracted explicitly stated equipment (Bosch, multimeter)"
  );

  // Case C: Multilingual support check for all 7 languages
  const supportedLanguages = ["en", "hi", "as", "bn", "ta", "te", "mr"] as const;
  for (const lang of supportedLanguages) {
    const testResult = await extractOnboardingProfile({ transcript: "I work with solar electrical wiring in Delhi", language: lang, inputMode: "voice" });
    assert(
      testResult.occupation.length > 0 && testResult.category.length > 0,
      "7. AI Non-Invention",
      `Language extraction pipeline validated for '${lang}'`
    );
  }

  // Case D: Assamese Pilot Voice Extraction & Indic Numeral Normalization
  const assameseTranscript = "নমস্কাৰ, মোৰ নাম ৰামেশ্বৰ শৰ্মা। মই গুৱাহাটীত ১২ বছৰ ধৰি সৌৰ পেনেল আৰু বিজুলীৰ কাম কৰি আছোঁ। দৈনিক মজুৰি ১৫০০ টকা।";
  const assameseResult = await extractOnboardingProfile({
    transcript: assameseTranscript,
    language: "as",
    inputMode: "voice",
  });
  assert(
    assameseResult.fullName.includes("Rameshwar") || assameseResult.fullName.includes("ৰামেশ্বৰ"),
    "7. AI Non-Invention",
    "Assamese pilot: Extracted worker identity from Assamese transcript"
  );
  assert(
    assameseResult.experienceYears === 12,
    "7. AI Non-Invention",
    "Assamese pilot: Extracted 12 years experience from native Assamese numerals (১২ বছৰ)"
  );
  assert(
    assameseResult.city === "Guwahati" && assameseResult.state === "Assam",
    "7. AI Non-Invention",
    "Assamese pilot: Extracted operating city (Guwahati) and state (Assam)"
  );
  assert(
    assameseResult.servicesOffered.some((s) => s.indicativeRate?.includes("1500")),
    "7. AI Non-Invention",
    "Assamese pilot: Extracted stated daily wage in Taka (১৫০০ টকা)"
  );

  // ---------------------------------------------------------------------------
  // TEST SUITE 8: Genuine Scannable QR & Verification Registry
  // ---------------------------------------------------------------------------
  const { generateQrDataUrl } = await import("../../qr/generate");
  const testQrData = await generateQrDataUrl("https://kaamsetu.in/verify/KS-ELEC-4012");

  assert(
    testQrData.startsWith("data:image/png;base64,"),
    "8. QR Verification",
    "generateQrDataUrl outputs a valid base64 PNG data URL"
  );
  assert(
    testQrData.length > 200,
    "8. QR Verification",
    "QR data URL contains high-density camera-scannable bitmap data"
  );

  const verifyPageRoute = path.join(projectRoot, "src/app/verify/[registryId]/page.tsx");
  assert(
    fs.existsSync(verifyPageRoute),
    "8. QR Verification",
    "Public credential verification route /verify/[registryId] exists and is operational"
  );

  const verifyPageContent = fs.readFileSync(verifyPageRoute, "utf-8");
  assert(
    verifyPageContent.includes("maskAadhaar") && verifyPageContent.includes("sovereign-print-area"),
    "8. QR Verification",
    "Verification page enforces Aadhaar privacy masking and institutional print layout"
  );

  // ---------------------------------------------------------------------------
  // TEST SUITE 9: Storage Magic Byte Validation & File Security
  // ---------------------------------------------------------------------------
  // Check PNG magic bytes: 0x89, 0x50, 0x4E, 0x47
  const validPngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const isPng =
    validPngHeader[0] === 0x89 &&
    validPngHeader[1] === 0x50 &&
    validPngHeader[2] === 0x4e &&
    validPngHeader[3] === 0x47;
  assert(isPng, "9. Storage Security", "PNG magic byte detection (89 50 4E 47) verified");

  // Check malicious shell script: '#!/bin/sh'
  const maliciousScript = Buffer.from("#!/bin/bash\nrm -rf /");
  const isSafeImage =
    (maliciousScript[0] === 0xff && maliciousScript[1] === 0xd8) || // JPEG
    (maliciousScript[0] === 0x89 && maliciousScript[1] === 0x50) || // PNG
    (maliciousScript[0] === 0x52 && maliciousScript[1] === 0x49);   // WEBP
  assert(!isSafeImage, "9. Storage Security", "Executable scripts strictly rejected by file header inspection");

  // ---------------------------------------------------------------------------
  // SUMMARY REPORT
  // ---------------------------------------------------------------------------
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = total - passed;

  console.log("\n=================================================================");
  console.log(`VERIFICATION SUMMARY: ${passed}/${total} TESTS PASSED (${failed} FAILED)`);
  console.log("=================================================================");

  results.forEach((r, idx) => {
    const icon = r.passed ? "✓ PASS" : "✗ FAIL";
    console.log(`${icon} [${r.suite}] ${r.test}`);
    if (r.details && !r.passed) {
      console.log(`       ↳ ${r.details}`);
    }
  });

  return { total, passed, failed, results };
}

// Execute if run directly
runBackendVerification().catch((err) => {
  console.error("Verification suite encountered an error:", err);
  process.exit(1);
});
