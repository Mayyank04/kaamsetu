/**
 * North Bengal / Siliguri Corridor Gate Evaluation Service
 * Pillar E: Evaluates 14-step state launch assessment, 5 mandatory gates,
 * and controlled commercial activation for the North Bengal / Siliguri corridor.
 *
 * MISSION INVARIANT: "Every skill deserves to be seen, even without a degree."
 * CONSTITUTIONAL INVARIANT: 0.00% commission on worker wages.
 */

import {
  evaluateStateLaunchGates,
  LaunchGateEvaluationInput,
  StateLaunchReadinessDecision,
  STATE_LAUNCH_STEPS_14,
} from "./state-launch-gate-service";

export interface RegionalCorridorMetrics {
  regionCode: string;
  regionName: string;
  stepsCompleted14: number; // 0 to 14
  hasInstitutionalMoU: boolean;
  verifiedWorkerCount: number;
  payingContractorCount: number;
  hasPhysicalFieldCoordinator: boolean;
  primaryAdminApproved: boolean;
  secondaryAdminApproved: boolean;
  distinctApprovers: boolean;
}

export interface CorridorReadinessEvaluation {
  regionCode: string;
  regionName: string;
  fourteenStepScorePercent: number;
  fourteenStepCount: number;
  mandatoryGatesDecision: StateLaunchReadinessDecision;
  isLaunchApproved: boolean;
  launchStatus: "active" | "pilot_candidate" | "gated_in_research";
  statusSummary: string;
}

/**
 * Evaluates North Bengal / Siliguri Corridor launch readiness.
 */
export function evaluateSiliguriCorridorReadiness(
  metrics: RegionalCorridorMetrics
): CorridorReadinessEvaluation {
  const gateInput: LaunchGateEvaluationInput = {
    regionCode: metrics.regionCode,
    hasInstitutionalMoU: metrics.hasInstitutionalMoU,
    verifiedWorkerCount: metrics.verifiedWorkerCount,
    payingContractorCount: metrics.payingContractorCount,
    hasPhysicalFieldCoordinator: metrics.hasPhysicalFieldCoordinator,
    primaryAdminApproved: metrics.primaryAdminApproved,
    secondaryAdminApproved: metrics.secondaryAdminApproved,
    distinctApprovers: metrics.distinctApprovers,
  };

  const gatesDecision = evaluateStateLaunchGates(gateInput);
  const scorePercent = (metrics.stepsCompleted14 / 14) * 100;
  const roundedScore = Math.round(scorePercent * 10) / 10;

  // Controlled activation requires:
  // 1. All 5 mandatory gates passed
  // 2. 14-step score >= 85.0%
  const isApproved = gatesDecision.allGatesPassed && roundedScore >= 85.0;

  let launchStatus: CorridorReadinessEvaluation["launchStatus"] = "gated_in_research";
  let statusSummary = "";

  if (isApproved) {
    launchStatus = "active";
    statusSummary = `North Bengal / Siliguri Corridor certified for active commercial operations (${roundedScore}% readiness, all 5 mandatory gates satisfied).`;
  } else if (roundedScore >= 60.0) {
    launchStatus = "pilot_candidate";
    statusSummary = `North Bengal / Siliguri Corridor is a pilot candidate (${roundedScore}% readiness). Gate clearance pending.`;
  } else {
    launchStatus = "gated_in_research";
    statusSummary = `North Bengal / Siliguri Corridor maintained in research state (${roundedScore}% readiness).`;
  }

  return {
    regionCode: metrics.regionCode,
    regionName: metrics.regionName,
    fourteenStepScorePercent: roundedScore,
    fourteenStepCount: metrics.stepsCompleted14,
    mandatoryGatesDecision: gatesDecision,
    isLaunchApproved: isApproved,
    launchStatus,
    statusSummary,
  };
}

/**
 * Evaluates candidate state (e.g. Tripura IN-TR) readiness.
 * Proves gating invariant: missing institutional MoU or low worker supply
 * prevents automated activation.
 */
export function evaluateTripuraCandidateReadiness(
  metrics: RegionalCorridorMetrics
): CorridorReadinessEvaluation {
  return evaluateSiliguriCorridorReadiness(metrics);
}
