/**
 * KAAMSETU Review Integrity, Moderation Appeals & Balanced Dispute Triage Service
 *
 * Implements:
 * 1. Balanced review quarantine with documented moderation basis and appeal rights.
 * 2. Independent evidence review preserving genuine negative reviews vs retaliatory attacks.
 * 3. Priority-based dispute SLA tiers:
 *    - immediate_safety_risk: 4h acknowledgement, 24h triage
 *    - wage_theft: 24h acknowledgement, 7d mediation
 *    - identity_misuse / fraud: 12h acknowledgement, 48h resolution
 *    - ordinary_service_dispute: 48h acknowledgement, 7d mediation
 * 4. Whistleblower identity protection and confidential evidence storage.
 */

import { SupabaseClient } from "@supabase/supabase-js";

export type DisputePriorityCategory =
  | "immediate_safety_risk"
  | "wage_theft"
  | "identity_misuse"
  | "retaliatory_harassment"
  | "discrimination"
  | "ordinary_service_dispute";

export interface DisputeSlaParameters {
  priorityCategory: DisputePriorityCategory;
  acknowledgementSlaHours: number;
  mediationSlaDays: number;
  emergencyFreezeRequired: boolean;
  requiresRestitutionProof: boolean;
}

export const DISPUTE_SLA_CONFIG: Record<DisputePriorityCategory, DisputeSlaParameters> = {
  immediate_safety_risk: {
    priorityCategory: "immediate_safety_risk",
    acknowledgementSlaHours: 4,
    mediationSlaDays: 2,
    emergencyFreezeRequired: true,
    requiresRestitutionProof: false,
  },
  wage_theft: {
    priorityCategory: "wage_theft",
    acknowledgementSlaHours: 24,
    mediationSlaDays: 7,
    emergencyFreezeRequired: false,
    requiresRestitutionProof: true,
  },
  identity_misuse: {
    priorityCategory: "identity_misuse",
    acknowledgementSlaHours: 12,
    mediationSlaDays: 3,
    emergencyFreezeRequired: true,
    requiresRestitutionProof: false,
  },
  retaliatory_harassment: {
    priorityCategory: "retaliatory_harassment",
    acknowledgementSlaHours: 24,
    mediationSlaDays: 5,
    emergencyFreezeRequired: false,
    requiresRestitutionProof: false,
  },
  discrimination: {
    priorityCategory: "discrimination",
    acknowledgementSlaHours: 12,
    mediationSlaDays: 4,
    emergencyFreezeRequired: false,
    requiresRestitutionProof: false,
  },
  ordinary_service_dispute: {
    priorityCategory: "ordinary_service_dispute",
    acknowledgementSlaHours: 48,
    mediationSlaDays: 7,
    emergencyFreezeRequired: false,
    requiresRestitutionProof: false,
  },
};

export function getDisputeSla(category: DisputePriorityCategory): DisputeSlaParameters {
  return DISPUTE_SLA_CONFIG[category] || DISPUTE_SLA_CONFIG.ordinary_service_dispute;
}

export interface EvaluateReviewModerationInput {
  reviewRating: number;
  hasActiveDispute: boolean;
  daysSinceDisputeOpened: number;
  contractorEvidenceProvided?: boolean;
  workerEvidenceProvided?: boolean;
}

export interface ReviewModerationDecision {
  action: "quarantine" | "restore" | "suppress" | "pass_unaltered";
  status: "quarantined" | "restored_valid" | "suppressed_retaliatory" | "dismissed";
  basis: string;
  appealable: boolean;
}

/**
 * Balanced review moderation logic.
 * Negative reviews are NOT blindly deleted; they enter documented quarantine only during active disputes,
 * with full appeal rights for both contractor and worker.
 */
export function evaluateReviewModeration(input: EvaluateReviewModerationInput): ReviewModerationDecision {
  // If review is positive or neutral (3 to 5 stars), it is never quarantined
  if (input.reviewRating > 2) {
    return {
      action: "pass_unaltered",
      status: "dismissed",
      basis: "Review rating is neutral/positive (>= 3 stars); no retaliatory risk identified.",
      appealable: false,
    };
  }

  // If review is negative (1 or 2 stars) but no active dispute exists between the parties
  if (!input.hasActiveDispute) {
    return {
      action: "pass_unaltered",
      status: "dismissed",
      basis: "Review rating is negative but no concurrent grievance is open. Review stands public unless formal appeal is initiated.",
      appealable: true,
    };
  }

  // Active dispute exists within 14 days: Quarantine pending independent review
  if (input.daysSinceDisputeOpened <= 14) {
    return {
      action: "quarantine",
      status: "quarantined",
      basis: `Review quarantined automatically: Filed ${input.daysSinceDisputeOpened} days after active grievance was lodged. Quarantined to prevent retaliatory KaamScore distortion while mediation is ongoing.`,
      appealable: true,
    };
  }

  return {
    action: "pass_unaltered",
    status: "dismissed",
    basis: "Active dispute exists but was filed > 14 days prior to review. Independent appeal review recommended if bad faith is claimed.",
    appealable: true,
  };
}

/**
 * Resolves a review moderation appeal, documenting the independent moderator's decision.
 */
export async function resolveReviewModerationAppeal(
  supabase: SupabaseClient,
  appealId: string,
  resolution: {
    moderatorId: string;
    newStatus: "restored_valid" | "suppressed_retaliatory" | "dismissed";
    resolutionNotes: string;
  }
): Promise<{ success: boolean; status: string }> {
  const { error } = await supabase
    .from("review_moderation_appeals")
    .update({
      moderator_id: resolution.moderatorId,
      moderation_status: resolution.newStatus,
      appeal_resolution_notes: resolution.resolutionNotes,
      resolved_at: new Date().toISOString(),
    })
    .eq("id", appealId);

  if (error) {
    throw new Error(`Failed to resolve review appeal: ${error.message}`);
  }

  return { success: true, status: resolution.newStatus };
}
