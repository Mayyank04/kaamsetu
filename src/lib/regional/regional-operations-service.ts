/**
 * Regional Operations & District Footprint Service
 * Pillars A, B, C, D: Assam Anchor, Meghalaya Controlled, Siliguri Transit, Tripura Research
 *
 * MISSION INVARIANT: "Every skill deserves to be seen, even without a degree."
 * CONSTITUTIONAL INVARIANT: 0.00% commission on worker wages.
 * GOVERNING AXIOM: A regional operation is not verified because a dashboard says active.
 * A numerical score must NEVER override a mandatory qualitative failed gate.
 */

import crypto from "crypto";

export type DistrictOperationalStatus =
  | "research"
  | "candidate"
  | "readiness_assessment"
  | "conditionally_ready"
  | "controlled_pilot"
  | "active"
  | "suspended"
  | "closed";

export interface DistrictMetricBreakdown {
  registeredWorkers: number;
  consentingWorkers: number;
  discoverableWorkers: number;
  availableWorkers: number;
  enquiries: number;
  bookings: number;
  completedJobs: number;
  confirmedOutcomes: number;
  paidWork: number;
}

export interface MandatoryQualitativeGates {
  hasPhysicalFieldCoordinator: boolean;
  hasInstitutionalMoU: boolean;
  hasDualAdminApproval: boolean;
  hasEmergencyWorkerDesk: boolean;
  hasZeroWageCommissionAudit: boolean;
}

export interface DistrictOperationsRecord {
  regionCode: string;
  regionName: string;
  districtName: string;
  operationalStatus: DistrictOperationalStatus;
  metrics: DistrictMetricBreakdown;
  qualitativeGates: MandatoryQualitativeGates;
  fourteenStepScorePercent: number;
  isLaunchApproved: boolean;
  evidenceSha256: string;
  evaluatorIdentity: string;
  limitationsNotes: string | null;
  updatedAt: string;
}

/**
 * Validates the strict metric hierarchy:
 * registered >= consenting >= discoverable >= available
 * enquiries >= bookings >= completedJobs >= confirmedOutcomes >= paidWork
 */
export function validateMetricHierarchy(metrics: DistrictMetricBreakdown): { valid: boolean; violations: string[] } {
  const violations: string[] = [];

  if (metrics.consentingWorkers > metrics.registeredWorkers) {
    violations.push("Consenting workers cannot exceed registered workers.");
  }
  if (metrics.discoverableWorkers > metrics.consentingWorkers) {
    violations.push("Discoverable workers cannot exceed consented workers.");
  }
  if (metrics.availableWorkers > metrics.discoverableWorkers) {
    violations.push("Available workers cannot exceed discoverable workers.");
  }
  if (metrics.bookings > metrics.enquiries) {
    violations.push("Confirmed bookings cannot exceed customer enquiries.");
  }
  if (metrics.completedJobs > metrics.bookings) {
    violations.push("Completed jobs cannot exceed confirmed bookings.");
  }
  if (metrics.confirmedOutcomes > metrics.completedJobs) {
    violations.push("Confirmed outcomes cannot exceed completed jobs.");
  }
  if (metrics.paidWork > metrics.confirmedOutcomes) {
    violations.push("Paid work records cannot exceed confirmed completed outcomes.");
  }

  return {
    valid: violations.length === 0,
    violations,
  };
}

/**
 * Evaluates district readiness enforcing the Anti-Override Invariant.
 * A high quantitative percentage (e.g. 85.7% or 95%) can NEVER override a failed mandatory qualitative gate.
 */
export function evaluateDistrictReadiness(params: {
  regionCode: string;
  regionName: string;
  districtName: string;
  stepsCompleted14: number; // 0 to 14
  metrics: DistrictMetricBreakdown;
  qualitativeGates: MandatoryQualitativeGates;
  evaluatorIdentity: string;
  limitationsNotes?: string;
}): DistrictOperationsRecord {
  const scorePercent = Math.round(((params.stepsCompleted14 / 14) * 100) * 10) / 10;

  const allGatesPassed =
    params.qualitativeGates.hasPhysicalFieldCoordinator &&
    params.qualitativeGates.hasInstitutionalMoU &&
    params.qualitativeGates.hasDualAdminApproval &&
    params.qualitativeGates.hasEmergencyWorkerDesk &&
    params.qualitativeGates.hasZeroWageCommissionAudit;

  // Active status requires 100% mandatory gates AND score >= 85.0%
  const isLaunchApproved = allGatesPassed && scorePercent >= 85.0;

  let operationalStatus: DistrictOperationalStatus = "research";

  if (isLaunchApproved) {
    operationalStatus = "active";
  } else if (scorePercent >= 75.0) {
    operationalStatus = "conditionally_ready"; // E.g. Siliguri (85.7% score, but lease gate pending)
  } else if (scorePercent >= 60.0) {
    operationalStatus = "readiness_assessment";
  } else if (scorePercent >= 50.0) {
    operationalStatus = "candidate"; // E.g. Tripura (57.1% score, MoU pending)
  } else {
    operationalStatus = "research";
  }

  const rawDigestPayload = {
    regionCode: params.regionCode,
    districtName: params.districtName,
    scorePercent,
    allGatesPassed,
    operationalStatus,
    metrics: params.metrics,
  };

  const evidenceSha256 = crypto
    .createHash("sha256")
    .update(JSON.stringify(rawDigestPayload, Object.keys(rawDigestPayload).sort()))
    .digest("hex");

  return {
    regionCode: params.regionCode,
    regionName: params.regionName,
    districtName: params.districtName,
    operationalStatus,
    metrics: params.metrics,
    qualitativeGates: params.qualitativeGates,
    fourteenStepScorePercent: scorePercent,
    isLaunchApproved,
    evidenceSha256,
    evaluatorIdentity: params.evaluatorIdentity,
    limitationsNotes: params.limitationsNotes || null,
    updatedAt: new Date().toISOString(),
  };
}
