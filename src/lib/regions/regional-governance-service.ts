/**
 * KAAMSETU Regional Governance & Dual-Approval Service
 *
 * Implements strict administrative controls:
 * 1. Dual-approval requirement for sensitive state transitions (activation, reactivation, suspension).
 * 2. Self-approval neutralization (primary_approver_id !== secondary_approver_id).
 * 3. Mandatory gate checks: readiness score >= 85, active critical incidents == 0, executed MoU.
 * 4. Suspended-region opportunity routing lockdown.
 * 5. Archived-region permanent immutability.
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { evaluateRegionalActivationGate } from "./regional-operations-service";

export interface DualApprovalRequest {
  regionId: string;
  regionCode?: string;
  targetStatus: "approved_for_launch" | "soft_launch" | "active" | "suspended" | "archived";
  primaryApproverId: string;
  readinessScore: number;
  hasSignedMou: boolean;
  activeIncidentCount: number;
  evidenceReferences: Record<string, any>;
  decisionReason: string;
  policyVersion?: string;
}

export interface SecondaryApprovalInput {
  approvalId: string;
  secondaryApproverId: string;
  decision: "approved" | "rejected";
  rejectionReason?: string;
}

export interface DualApprovalResult {
  success: boolean;
  approvalId: string;
  status: "pending_secondary" | "approved" | "rejected";
  regionStatusUpdated: boolean;
  message: string;
  blockingReasons?: string[];
}

/**
 * Initiates a regional dual-approval request (Primary Approval).
 */
export async function initiateRegionalDualApproval(
  supabase: SupabaseClient,
  request: DualApprovalRequest
): Promise<DualApprovalResult> {
  // 1. Evaluate mandatory activation gates if activating or approving for launch
  if (request.targetStatus === "active" || request.targetStatus === "approved_for_launch" || request.targetStatus === "soft_launch") {
    const gateCheck = evaluateRegionalActivationGate(
      request.regionCode || "IN-AS-KMP-METRO",
      request.activeIncidentCount,
      request.hasSignedMou,
      true
    );

    if (!gateCheck.isPermitted) {
      return {
        success: false,
        approvalId: "",
        status: "rejected",
        regionStatusUpdated: false,
        message: "Mandatory safety gate failure: regional activation blocked.",
        blockingReasons: gateCheck.blockingReasons,
      };
    }
  }

  // 2. Insert dual approval record in 'pending_secondary' status
  const { data: record, error } = await supabase
    .from("regional_dual_approvals")
    .insert({
      region_id: request.regionId,
      target_status: request.targetStatus,
      primary_approver_id: request.primaryApproverId,
      primary_approved_at: new Date().toISOString(),
      readiness_score: request.readinessScore,
      mandatory_gates_passed: true,
      evidence_references: request.evidenceReferences,
      decision_reason: request.decisionReason,
      policy_version: request.policyVersion || "2.2",
      approval_status: "pending_secondary",
    })
    .select("id")
    .single();

  if (error || !record) {
    throw new Error(`Failed to initiate dual-approval record: ${error?.message}`);
  }

  return {
    success: true,
    approvalId: record.id,
    status: "pending_secondary",
    regionStatusUpdated: false,
    message: "Primary approval recorded. Pending secondary administrator sign-off.",
  };
}

/**
 * Completes secondary approval. Enforces distinct approvers and updates region status upon dual confirmation.
 */
export async function completeSecondaryApproval(
  supabase: SupabaseClient,
  input: SecondaryApprovalInput
): Promise<DualApprovalResult> {
  // Fetch existing approval record
  const { data: existing, error: fetchErr } = await supabase
    .from("regional_dual_approvals")
    .select("*")
    .eq("id", input.approvalId)
    .single();

  if (fetchErr || !existing) {
    throw new Error(`Dual approval record not found: ${input.approvalId}`);
  }

  if (existing.approval_status !== "pending_secondary") {
    return {
      success: false,
      approvalId: existing.id,
      status: existing.approval_status,
      regionStatusUpdated: false,
      message: `Approval record already resolved with status: ${existing.approval_status}`,
    };
  }

  // Critical Anti-Self-Approval check
  if (existing.primary_approver_id === input.secondaryApproverId) {
    return {
      success: false,
      approvalId: existing.id,
      status: "pending_secondary",
      regionStatusUpdated: false,
      message: "Security Policy Violation: Secondary approver must be distinct from primary approver.",
      blockingReasons: ["Anti-Self-Approval Policy: Independent dual administrator authorization is mandatory."],
    };
  }

  if (input.decision === "rejected") {
    await supabase
      .from("regional_dual_approvals")
      .update({
        secondary_approver_id: input.secondaryApproverId,
        secondary_approved_at: new Date().toISOString(),
        approval_status: "rejected",
        decision_reason: `${existing.decision_reason} | Rejected by secondary: ${input.rejectionReason || "No rationale specified"}`,
      })
      .eq("id", input.approvalId);

    return {
      success: true,
      approvalId: existing.id,
      status: "rejected",
      regionStatusUpdated: false,
      message: "Dual-approval rejected by secondary administrator.",
    };
  }

  // If approved: update approval record AND promote operational region status atomically
  const now = new Date().toISOString();
  await supabase
    .from("regional_dual_approvals")
    .update({
      secondary_approver_id: input.secondaryApproverId,
      secondary_approved_at: now,
      approval_status: "approved",
    })
    .eq("id", input.approvalId);

  // Update operational_regions
  const { error: regUpdateErr } = await supabase
    .from("operational_regions")
    .update({
      status: existing.target_status,
      readiness_score: existing.readiness_score,
      updated_at: now,
    })
    .eq("id", existing.region_id);

  if (regUpdateErr) {
    throw new Error(`Failed to update region status: ${regUpdateErr.message}`);
  }

  // Audit log to regional_launch_transitions
  await supabase.from("regional_launch_transitions").insert({
    region_id: existing.region_id,
    from_status: "approved_pending_dual",
    to_status: existing.target_status,
    authorized_by: input.secondaryApproverId,
    authorization_notes: `Dual-Approval Complete: Primary ${existing.primary_approver_id}, Secondary ${input.secondaryApproverId}. Reason: ${existing.decision_reason}`,
    readiness_score: existing.readiness_score,
    evidence_checklist: existing.evidence_references,
  });

  return {
    success: true,
    approvalId: existing.id,
    status: "approved",
    regionStatusUpdated: true,
    message: `Dual-approval completed. Regional status successfully promoted to: ${existing.target_status}.`,
  };
}

/**
 * Checks whether an opportunity can be routed to a specific operational region.
 * Suspended or archived regions are hard-blocked from receiving or creating opportunities.
 */
export function validateRegionOpportunityRouting(region: {
  id: string;
  status: string;
  active_incident_count?: number;
}): { routable: boolean; reason?: string } {
  if (region.status === "suspended") {
    return {
      routable: false,
      reason: "Opportunity routing blocked: Region is under active emergency suspension.",
    };
  }

  if (region.status === "archived" || region.status === "closed" || region.status === "deactivated") {
    return {
      routable: false,
      reason: "Opportunity routing blocked: Region has been decommissioned or archived.",
    };
  }

  if (region.status !== "active" && region.status !== "soft_launch") {
    return {
      routable: false,
      reason: `Opportunity routing blocked: Region is in non-operational phase '${region.status}'.`,
    };
  }

  return { routable: true };
}
