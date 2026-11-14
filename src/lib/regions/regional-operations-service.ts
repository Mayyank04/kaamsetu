import { createAdminClient } from "@/lib/supabase/admin";
import { isConfigured } from "@/lib/env";
import { evaluateRegionalReadinessScorecard } from "./regional-lifecycle-service";

export interface LaunchMilestoneInput {
  regionId: string;
  stage: string;
  milestoneName: string;
  accountableOwnerId?: string | null;
  targetDate?: string | null;
  evidenceNotes?: string | null;
  riskAssessment?: string | null;
}

export interface ReportIncidentInput {
  regionId: string;
  title: string;
  incidentType:
    | "wage_theft"
    | "labor_violence"
    | "safety_violation"
    | "system_outage"
    | "credential_fraud"
    | "data_breach"
    | "regulatory_action";
  severity?: "low" | "medium" | "high" | "critical";
  details: string;
  reportedBy?: string | null;
}

/**
 * Standard 12-milestone template for repeatable regional launches
 */
export const STATE_LAUNCH_PLAYBOOK_TEMPLATES = [
  { stage: "research_in_progress", milestoneName: "1. Regional Labor Market & Migration Corridors Research" },
  { stage: "research_in_progress", milestoneName: "2. Local Trade Taxonomy & Vernacular Dialect Mapping" },
  { stage: "worker_demand_validation", milestoneName: "3. Grassroots Worker Outreach & Chowk Needs Assessment" },
  { stage: "partner_validation", milestoneName: "4. State Skill Mission & Accredited ITI Partner Validation" },
  { stage: "partner_validation", milestoneName: "5. Commercial Contractor Demand Assessment & Advisory Council" },
  { stage: "operational_preparation", milestoneName: "6. Dialect Voice NLP Model Tuning & Localised Soundbites" },
  { stage: "operational_preparation", milestoneName: "7. Field Coordinator Recruitment & Thermal QR Printer Deployment" },
  { stage: "controlled_pilot", milestoneName: "8. Closed Pilot Cohort Onboarding (25-50 Skilled Workers)" },
  { stage: "controlled_pilot", milestoneName: "9. Initial Project Staffing & Zero-Commission Wage Flow Verification" },
  { stage: "operational_review", milestoneName: "10. Post-Pilot Wage Fulfillment & Dispute Resolution Audit" },
  { stage: "operational_review", milestoneName: "11. Readiness Scorecard Evaluation & Safety Gate Certification" },
  { stage: "active", milestoneName: "12. Controlled Public Activation & Enterprise Contractor Rollout" },
];

/**
 * Instantiates the standard 12-milestone launch playbook for a newly proposed region
 */
export async function initializeRegionalLaunchPlaybook(
  regionId: string,
  accountableOwnerId?: string | null
) {
  if (!isConfigured.supabase) {
    return STATE_LAUNCH_PLAYBOOK_TEMPLATES.map((tpl, i) => ({
      id: `milestone-${i + 1}`,
      region_id: regionId,
      stage: tpl.stage,
      milestone_name: tpl.milestoneName,
      status: "pending" as const,
      accountable_owner_id: accountableOwnerId || null,
      target_date: null,
      completed_at: null,
      evidence_notes: null,
      risk_assessment: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
  }

  const supabase = createAdminClient();
  if (!supabase) throw new Error("Database client unavailable");

  const records = STATE_LAUNCH_PLAYBOOK_TEMPLATES.map((tpl) => ({
    region_id: regionId,
    stage: tpl.stage,
    milestone_name: tpl.milestoneName,
    status: "pending",
    accountable_owner_id: accountableOwnerId || null,
  }));

  const { data, error } = await supabase
    .from("regional_launch_milestones")
    .insert(records as any)
    .select();

  if (error) {
    throw new Error(`Failed to initialize launch playbook: ${error.message}`);
  }

  return data;
}

/**
 * Reports a regional operational incident and increments region active incident counter
 */
export async function reportRegionalIncident(input: ReportIncidentInput) {
  if (!isConfigured.supabase) {
    return {
      id: crypto.randomUUID(),
      region_id: input.regionId,
      title: input.title,
      incident_type: input.incidentType,
      severity: input.severity || "medium",
      status: "open",
      details: input.details,
      reported_by: input.reportedBy || null,
      resolved_by: null,
      resolved_at: null,
      resolution_notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  const supabase = createAdminClient();
  if (!supabase) throw new Error("Database client unavailable");

  const { data, error } = await supabase
    .from("regional_operational_incidents")
    .insert({
      region_id: input.regionId,
      title: input.title,
      incident_type: input.incidentType,
      severity: input.severity || "medium",
      status: "open",
      details: input.details,
      reported_by: input.reportedBy || null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to record operational incident: ${error.message}`);
  }

  // Increment incident counter
  try {
    await supabase.rpc("increment_region_incident_count", { target_region_id: input.regionId });
  } catch {
    // Graceful fallback if RPC not declared
  }

  return data;
}

/**
 * Resolves a regional operational incident with formal resolution notes
 */
export async function resolveRegionalIncident(
  incidentId: string,
  resolvedBy: string,
  resolutionNotes: string
) {
  if (!isConfigured.supabase) {
    return {
      id: incidentId,
      status: "resolved",
      resolved_by: resolvedBy,
      resolved_at: new Date().toISOString(),
      resolution_notes: resolutionNotes,
      updated_at: new Date().toISOString(),
    };
  }

  const supabase = createAdminClient();
  if (!supabase) throw new Error("Database client unavailable");

  const { data, error } = await supabase
    .from("regional_operational_incidents")
    .update({
      status: "resolved",
      resolved_by: resolvedBy,
      resolved_at: new Date().toISOString(),
      resolution_notes: resolutionNotes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", incidentId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to resolve incident: ${error.message}`);
  }

  return data;
}

/**
 * Evaluates whether a candidate region satisfies all hard safety gates to advance to active
 */
export function evaluateRegionalActivationGate(
  regionCode: string,
  activeCriticalIncidentsCount: number,
  partnerMoUSigned: boolean,
  localCoordinatorActive: boolean
): {
  isPermitted: boolean;
  scorecardTotal: number;
  blockingReasons: string[];
} {
  const scorecard = evaluateRegionalReadinessScorecard(regionCode);
  const blockingReasons: string[] = [];

  if (scorecard.totalScore < 80) {
    blockingReasons.push(`Readiness score (${scorecard.totalScore}/100) below required 80-point threshold`);
  }

  if (activeCriticalIncidentsCount > 0) {
    blockingReasons.push(`Active critical operational incidents (${activeCriticalIncidentsCount}) must be resolved`);
  }

  if (!partnerMoUSigned) {
    blockingReasons.push("Mandatory institutional anchor partner MoU must be formally executed");
  }

  if (!localCoordinatorActive) {
    blockingReasons.push("Local field operations coordinator must be actively deployed");
  }

  return {
    isPermitted: blockingReasons.length === 0,
    scorecardTotal: scorecard.totalScore,
    blockingReasons,
  };
}

/**
 * Emergency regional suspension workflow with immutable audit log
 */
export async function suspendRegionWorkflow(options: {
  regionId: string;
  reason: string;
  actorId: string;
}) {
  if (!isConfigured.supabase) {
    return {
      regionId: options.regionId,
      previousStatus: "active",
      newStatus: "suspended",
      suspendedAt: new Date().toISOString(),
      reason: options.reason,
    };
  }

  const supabase = createAdminClient();
  if (!supabase) throw new Error("Database client unavailable");

  const { data: region, error: regErr } = await supabase
    .from("operational_regions")
    .select("id, status")
    .eq("id", options.regionId)
    .single();

  if (regErr || !region) throw new Error("Region not found");

  const previousStatus = region.status;

  const { error: updateErr } = await supabase
    .from("operational_regions")
    .update({ status: "suspended", updated_at: new Date().toISOString() })
    .eq("id", options.regionId);

  if (updateErr) throw new Error(`Failed to suspend region: ${updateErr.message}`);

  await supabase.from("regional_launch_transitions").insert({
    region_id: options.regionId,
    from_status: previousStatus,
    to_status: "suspended",
    transition_reason: options.reason,
    initiated_by: options.actorId,
    readiness_score_at_transition: 0,
    evidence_payload: { action: "emergency_suspension", timestamp: new Date().toISOString() },
  });

  return {
    regionId: options.regionId,
    previousStatus,
    newStatus: "suspended",
    suspendedAt: new Date().toISOString(),
    reason: options.reason,
  };
}
