/**
 * KAAMSETU Phase 16: Repeatable State Launch Framework & Readiness Gate Service
 *
 * Implements the 14-step state launch assessment, 5 mandatory launch gates,
 * and candidate region research isolation.
 */

export interface LaunchGateEvaluationInput {
  regionCode: string;
  hasInstitutionalMoU: boolean;
  verifiedWorkerCount: number;
  payingContractorCount: number;
  hasPhysicalFieldCoordinator: boolean;
  primaryAdminApproved: boolean;
  secondaryAdminApproved: boolean;
  distinctApprovers: boolean;
}

export interface GateResult {
  gateNumber: number;
  gateName: string;
  passed: boolean;
  details: string;
}

export interface StateLaunchReadinessDecision {
  regionCode: string;
  gates: GateResult[];
  allGatesPassed: boolean;
  recommendedStatus: "active" | "gated_in_research" | "roll_back";
  reason: string;
}

/**
 * 14-Step State Launch Protocol Definition
 */
export const STATE_LAUNCH_STEPS_14 = [
  "1. State and district feasibility assessment",
  "2. Local trade and demand research",
  "3. Worker organization and consent",
  "4. Local language validation",
  "5. Customer and contractor discovery",
  "6. Institutional partner verification",
  "7. Regional administrator authorization",
  "8. Security and privacy review",
  "9. Support and grievance readiness",
  "10. Pilot cohort enrollment",
  "11. Opportunity liquidity measurement",
  "12. Controlled activation",
  "13. Outcome evaluation",
  "14. Expansion or rollback decision",
] as const;

/**
 * Evaluates the 5 Mandatory Launch Gates for a geographic region.
 */
export function evaluateStateLaunchGates(input: LaunchGateEvaluationInput): StateLaunchReadinessDecision {
  const gates: GateResult[] = [];

  // Gate 1: Institutional Anchor (Signed Legal MoU)
  const gate1Passed = input.hasInstitutionalMoU === true;
  gates.push({
    gateNumber: 1,
    gateName: "Institutional Anchor (Signed Legal MoU)",
    passed: gate1Passed,
    details: gate1Passed
      ? "Executed bilateral MoU with State Skill Mission / Accredited ITI verified."
      : "MoU missing or not legally executed.",
  });

  // Gate 2: Worker Seed Liquidity (>= 100 verified workers)
  const gate2Passed = input.verifiedWorkerCount >= 100;
  gates.push({
    gateNumber: 2,
    gateName: "Worker Seed Liquidity (>= 100 verified workers)",
    passed: gate2Passed,
    details: gate2Passed
      ? `Worker seed liquidity threshold satisfied (${input.verifiedWorkerCount} >= 100).`
      : `Insufficient verified worker supply (${input.verifiedWorkerCount} < 100).`,
  });

  // Gate 3: Contractor Commercial Demand (>= 2 paying contractors)
  const gate3Passed = input.payingContractorCount >= 2;
  gates.push({
    gateNumber: 3,
    gateName: "Contractor Commercial Demand (>= 2 paying contractors)",
    passed: gate3Passed,
    details: gate3Passed
      ? `Commercial B2B demand verified (${input.payingContractorCount} >= 2 paid subscriptions).`
      : `Insufficient commercial demand (${input.payingContractorCount} < 2).`,
  });

  // Gate 4: Field Operations Node (Physical Ground Presence)
  const gate4Passed = input.hasPhysicalFieldCoordinator === true;
  gates.push({
    gateNumber: 4,
    gateName: "Field Operations Node (Physical Ground Presence)",
    passed: gate4Passed,
    details: gate4Passed
      ? "Designated, trained physical Field Coordinator stationed in territory."
      : "No physical on-ground coordinator active in district.",
  });

  // Gate 5: Dual Administrative Sign-off
  const gate5Passed =
    input.primaryAdminApproved &&
    input.secondaryAdminApproved &&
    input.distinctApprovers;
  gates.push({
    gateNumber: 5,
    gateName: "Dual Administrative Sign-off",
    passed: gate5Passed,
    details: gate5Passed
      ? "Dual independent administrative sign-off completed by distinct platform directors."
      : "Dual approval incomplete or self-approval violation detected.",
  });

  const allGatesPassed = gates.every((g) => g.passed);

  let recommendedStatus: StateLaunchReadinessDecision["recommendedStatus"] = "gated_in_research";
  let reason = "Candidate region fails one or more mandatory launch gates; maintain in research status.";

  if (allGatesPassed) {
    recommendedStatus = "active";
    reason = "All 5 mandatory state launch gates satisfied. Territory certified for controlled commercial activation.";
  }

  return {
    regionCode: input.regionCode,
    gates,
    allGatesPassed,
    recommendedStatus,
    reason,
  };
}
