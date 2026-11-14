import { createAdminClient } from "@/lib/supabase/admin";
import { isConfigured } from "@/lib/env";

export interface SubmitGrievanceInput {
  workerProfileId: string;
  disputeType:
    | "unpaid_wages"
    | "incorrect_work_record"
    | "false_review"
    | "unauthorized_sharing"
    | "credential_discrepancy"
    | "contractor_harassment"
    | "account_recovery";
  counterpartyName: string;
  evidenceNotes: string;
  claimedAmount?: number;
  confidentialEvidenceUrls?: string[];
  isRetaliatorySuspected?: boolean;
}

/**
 * Submits a worker grievance with an automated 7-day mediation SLA
 */
export async function submitWorkerGrievance(input: SubmitGrievanceInput) {
  const slaDueDate = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();

  if (!isConfigured.supabase) {
    return {
      id: crypto.randomUUID(),
      worker_profile_id: input.workerProfileId,
      dispute_type: input.disputeType,
      counterparty_name: input.counterpartyName,
      evidence_notes: input.evidenceNotes,
      claimed_amount: input.claimedAmount || null,
      status: "submitted",
      sla_due_at: slaDueDate,
      is_retaliatory_suspected: Boolean(input.isRetaliatorySuspected),
      confidential_evidence_urls: input.confidentialEvidenceUrls || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  const supabase = createAdminClient();
  if (!supabase) throw new Error("Database client unavailable");

  const { data, error } = await supabase
    .from("worker_disputes")
    .insert({
      worker_profile_id: input.workerProfileId,
      dispute_type: input.disputeType,
      counterparty_name: input.counterpartyName,
      evidence_notes: input.evidenceNotes,
      claimed_amount: input.claimedAmount || null,
      status: "submitted",
      sla_due_at: slaDueDate,
      is_retaliatory_suspected: Boolean(input.isRetaliatorySuspected),
      confidential_evidence_urls: input.confidentialEvidenceUrls || [],
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to submit worker grievance: ${error.message}`);
  }

  return data;
}

/**
 * Quarantines potentially retaliatory reviews submitted by a counterparty under active dispute
 */
export function evaluateRetaliatoryReviewQuarantine(options: {
  reviewRating: number;
  hasActiveDisputeWithReviewer: boolean;
  daysSinceDisputeOpened: number;
}): {
  shouldQuarantine: boolean;
  quarantineReason?: string;
} {
  // If contractor gives <= 2 stars to a worker within 14 days of an active dispute
  if (
    options.hasActiveDisputeWithReviewer &&
    options.reviewRating <= 2 &&
    options.daysSinceDisputeOpened <= 14
  ) {
    return {
      shouldQuarantine: true,
      quarantineReason:
        "Review quarantined pending independent mediation due to active counterparty dispute filed within 14 days",
    };
  }

  return {
    shouldQuarantine: false,
  };
}

/**
 * Resolves a wage dispute with verified UPI/Bank UTR restitution evidence
 */
export async function resolveGrievanceWithRestitution(options: {
  disputeId: string;
  reviewerId: string;
  resolutionStatus: "resolved_worker_upheld" | "resolved_counterparty_upheld" | "dismissed";
  resolutionSummary: string;
  restitutionUtr?: string;
}) {
  if (
    options.resolutionStatus === "resolved_worker_upheld" &&
    !options.restitutionUtr
  ) {
    throw new Error(
      "Verified payment restitution evidence reference (Bank UTR / UPI Ref) is mandatory to uphold wage dispute resolution"
    );
  }

  if (!isConfigured.supabase) {
    return {
      id: options.disputeId,
      status: options.resolutionStatus,
      resolution_summary: options.resolutionSummary,
      assigned_reviewer_id: options.reviewerId,
      resolved_at: new Date().toISOString(),
    };
  }

  const supabase = createAdminClient();
  if (!supabase) throw new Error("Database client unavailable");

  const { data, error } = await supabase
    .from("worker_disputes")
    .update({
      status: options.resolutionStatus,
      resolution_summary: options.resolutionSummary,
      assigned_reviewer_id: options.reviewerId,
      resolved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", options.disputeId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to resolve grievance: ${error.message}`);
  }

  return data;
}
