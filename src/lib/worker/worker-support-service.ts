/**
 * Worker Safety & Field Support Service
 * Pillar G: Manages grassroots worker support requests, priority-based triage,
 * field coordinator regional scoping, whistleblower protection, and redressal tracking.
 */

export type SupportCategory =
  | "immediate_safety_risk"
  | "wage_dispute"
  | "identity_theft"
  | "fraud"
  | "retaliation"
  | "discrimination"
  | "service_complaint";

export type SupportPriority = "tier_1_critical" | "tier_2_urgent" | "tier_3_standard";

export interface SupportAssignmentInput {
  workerProfileId: string;
  supportCategory: SupportCategory;
  regionCode: string;
  intakeNotes: string;
  isWhistleblower?: boolean;
}

export function determineSupportPriority(category: SupportCategory): SupportPriority {
  switch (category) {
    case "immediate_safety_risk":
      return "tier_1_critical"; // 4 hours max initial response
    case "wage_dispute":
    case "identity_theft":
    case "fraud":
    case "retaliation":
      return "tier_2_urgent"; // 24 hours initial response, 7 days resolution
    case "discrimination":
    case "service_complaint":
    default:
      return "tier_3_standard"; // 48 hours response
  }
}

export function validateCoordinatorTerritoryAccess(params: {
  coordinatorUserId: string;
  coordinatorAssignedRegion: string;
  caseRegionCode: string;
  userRole: string;
}): boolean {
  if (params.userRole === "admin") {
    return true; // Platform admins have global access
  }

  // Field coordinators are strictly scoped to their assigned regional territory
  return params.coordinatorAssignedRegion === params.caseRegionCode;
}

export function redactWhistleblowerEvidence(params: {
  isWhistleblower: boolean;
  workerName: string;
  workerPhone: string;
  requestingPartyRole: "contractor" | "coordinator" | "admin";
}) {
  if (params.requestingPartyRole === "contractor" && params.isWhistleblower) {
    return {
      workerName: "ANONYMOUS_PROTECTED_WORKER",
      workerPhone: "+91-XXXXX-XXXXX",
      isIdentityProtected: true,
      notice: "Identity protected under KaamSetu Whistleblower Safety Protocol.",
    };
  }

  return {
    workerName: params.workerName,
    workerPhone: params.workerPhone,
    isIdentityProtected: false,
  };
}

export function computeSupportResolutionMetrics(params: {
  createdAt: string;
  acknowledgedAt?: string;
  firstActionAt?: string;
  resolvedAt?: string;
}) {
  const createdTime = new Date(params.createdAt).getTime();
  const ackTime = params.acknowledgedAt ? new Date(params.acknowledgedAt).getTime() : null;
  const actionTime = params.firstActionAt ? new Date(params.firstActionAt).getTime() : null;
  const resolvedTime = params.resolvedAt ? new Date(params.resolvedAt).getTime() : null;

  return {
    timeToAcknowledgeMinutes: ackTime ? Math.round((ackTime - createdTime) / 60000) : null,
    timeToFirstActionMinutes: actionTime ? Math.round((actionTime - createdTime) / 60000) : null,
    timeToResolutionHours: resolvedTime ? Number(((resolvedTime - createdTime) / 3600000).toFixed(1)) : null,
    isResolved: Boolean(resolvedTime),
  };
}
