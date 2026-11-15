/**
 * Worker Dispute Governance & Non-Silencing Service
 * Pillar E & F: Dispute Resolution, Anti-Silencing, and Worker Protection
 *
 * MISSION INVARIANT: "Every skill deserves to be seen, even without a degree."
 * INVARIANT: Disputed records cannot be treated as verified outcomes or successfully paid wages.
 * Workers maintain sovereign right to contest false customer or contractor completion confirmations.
 */

import crypto from "crypto";

export type DisputeStatus =
  | "submitted"
  | "acknowledged"
  | "evidence_requested"
  | "under_review"
  | "in_mediation"
  | "resolved_worker_upheld"
  | "resolved_counterparty_upheld"
  | "resolved"
  | "dismissed"
  | "rejected"
  | "withdrawn"
  | "appealed";

export type DisputeReasonCode =
  | "unpaid_wages"
  | "wage_theft_underpayment"
  | "incorrect_work_record"
  | "false_review"
  | "unauthorized_sharing"
  | "credential_discrepancy"
  | "contractor_harassment"
  | "account_recovery"
  | "false_customer_denial"
  | "unauthorized_work_expansion"
  | "unsafe_working_conditions"
  | "identity_misrepresentation"
  | "other";

export interface DisputeSubmissionInput {
  disputeId?: string;
  workerId: string;
  respondentId: string; // contractor, customer, or enterprise
  opportunityId?: string;
  milestoneId?: string;
  reasonCode: DisputeReasonCode;
  description: string;
  claimedAmount?: number;
  evidenceAttachments?: Array<{ name: string; url: string; sha256: string }>;
}

export interface DisputeRecord {
  id: string;
  workerId: string;
  respondentId: string;
  opportunityId: string | null;
  milestoneId: string | null;
  reasonCode: DisputeReasonCode;
  description: string;
  claimedAmount: number | null;
  evidenceAttachments: Array<{ name: string; url: string; sha256: string }>;
  status: DisputeStatus;
  resolutionSummary: string | null;
  resolvedAmount: number | null;
  resolvedBy: string | null;
  timeline: Array<{
    stage: DisputeStatus;
    actorId: string;
    actionNote: string;
    timestamp: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Creates a formal worker dispute record.
 * Generates an immutable tracking ID and initializes the non-silencing timeline.
 */
export function createWorkerDispute(input: DisputeSubmissionInput): DisputeRecord {
  const now = new Date().toISOString();
  const id = input.disputeId || "disp-" + crypto.randomUUID().slice(0, 12);

  return {
    id,
    workerId: input.workerId,
    respondentId: input.respondentId,
    opportunityId: input.opportunityId || null,
    milestoneId: input.milestoneId || null,
    reasonCode: input.reasonCode,
    description: input.description,
    claimedAmount: input.claimedAmount ?? null,
    evidenceAttachments: input.evidenceAttachments || [],
    status: "submitted",
    resolutionSummary: null,
    resolvedAmount: null,
    resolvedBy: null,
    timeline: [
      {
        stage: "submitted",
        actorId: input.workerId,
        actionNote: "Worker filed formal dispute.",
        timestamp: now,
      },
    ],
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Transition dispute along the 6-stage lifecycle.
 * Invariant: Cannot resolve without documented resolution summary.
 */
export function transitionDisputeStage(params: {
  dispute: DisputeRecord;
  targetStage: DisputeStatus;
  actorId: string;
  note: string;
  resolvedAmount?: number | null;
  resolutionSummary?: string | null;
}): { allowed: boolean; updatedDispute: DisputeRecord; reason?: string } {
  const validTransitions: Record<DisputeStatus, DisputeStatus[]> = {
    submitted: ["acknowledged", "under_review", "in_mediation", "withdrawn", "rejected", "dismissed"],
    acknowledged: ["evidence_requested", "under_review", "in_mediation", "withdrawn"],
    evidence_requested: ["under_review", "in_mediation", "withdrawn"],
    under_review: ["in_mediation", "resolved", "resolved_worker_upheld", "resolved_counterparty_upheld", "rejected", "dismissed", "withdrawn"],
    in_mediation: ["resolved", "resolved_worker_upheld", "resolved_counterparty_upheld", "rejected", "dismissed", "withdrawn"],
    resolved: ["appealed"],
    resolved_worker_upheld: ["appealed"],
    resolved_counterparty_upheld: ["appealed"],
    rejected: ["appealed"],
    dismissed: ["appealed"],
    withdrawn: [],
    appealed: ["under_review", "in_mediation", "resolved", "resolved_worker_upheld", "resolved_counterparty_upheld", "rejected", "dismissed"],
  };

  const allowed = validTransitions[params.dispute.status]?.includes(params.targetStage);
  if (!allowed) {
    return {
      allowed: false,
      updatedDispute: params.dispute,
      reason: `Invalid dispute state transition from '${params.dispute.status}' to '${params.targetStage}'.`,
    };
  }

  if (params.targetStage === "resolved" && !params.resolutionSummary) {
    return {
      allowed: false,
      updatedDispute: params.dispute,
      reason: "Dispute resolution requires a documented resolution summary.",
    };
  }

  const now = new Date().toISOString();
  const updated: DisputeRecord = {
    ...params.dispute,
    status: params.targetStage,
    resolutionSummary: params.resolutionSummary || params.dispute.resolutionSummary,
    resolvedAmount: params.resolvedAmount !== undefined ? params.resolvedAmount : params.dispute.resolvedAmount,
    resolvedBy: params.targetStage === "resolved" ? params.actorId : params.dispute.resolvedBy,
    updatedAt: now,
    timeline: [
      ...params.dispute.timeline,
      {
        stage: params.targetStage,
        actorId: params.actorId,
        actionNote: params.note,
        timestamp: now,
      },
    ],
  };

  return {
    allowed: true,
    updatedDispute: updated,
  };
}

/**
 * Validates whether an outcome milestone can be certified.
 * Invariant: An active dispute freezes milestone verification until formal resolution.
 */
export function isMilestoneCertifiableWithDisputes(
  milestoneId: string,
  disputes: DisputeRecord[]
): { certifiable: boolean; blockerDisputeId?: string; reason?: string } {
  const activeStatuses: DisputeStatus[] = [
    "submitted",
    "acknowledged",
    "evidence_requested",
    "under_review",
    "in_mediation",
    "appealed",
  ];

  const activeDispute = disputes.find(
    (d) => d.milestoneId === milestoneId && activeStatuses.includes(d.status)
  );

  if (activeDispute) {
    return {
      certifiable: false,
      blockerDisputeId: activeDispute.id,
      reason: `Milestone ${milestoneId} cannot be certified while open dispute ${activeDispute.id} is active (${activeDispute.status}).`,
    };
  }

  return { certifiable: true };
}
