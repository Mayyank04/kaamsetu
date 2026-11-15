/**
 * Regional Operating Standard & Supply Status Service
 * Pillar E: Assam and Meghalaya Operational Repeatability (SROP)
 *
 * MISSION INVARIANT: "Every skill deserves to be seen, even without a degree."
 * GOVERNING RULE: Do not count historical registrations as active supply.
 * Standardizes supply reporting across the 7-tier worker taxonomy.
 */

import crypto from "crypto";

export interface SevenTierSupplyBreakdown {
  registeredWorkers: number;
  contactableWorkers: number;
  availableWorkers: number;
  verifiedWorkers: number;
  recentCompletedWork: number;
  independentlyVerifiedPayments: number;
  inactiveWorkers: number;
}

export interface RegionalOperatingReviewRecord {
  id: string;
  regionCode: string;
  regionName: string;
  districtName: string;
  reviewCycle: string;
  operatingStatus: "research" | "candidate" | "readiness_assessment" | "conditionally_ready" | "controlled_pilot" | "active" | "suspended" | "closed";
  supply: SevenTierSupplyBreakdown;
  sropConformanceScorePct: number;
  leadReviewer: string;
  evidenceSha256: string;
  limitationsNotes: string | null;
  updatedAt: string;
}

/**
 * Validates the 7-tier worker supply hierarchy to ensure active supply is never inflated.
 */
export function validateSevenTierSupplyHierarchy(supply: SevenTierSupplyBreakdown): {
  isValid: boolean;
  violations: string[];
} {
  const violations: string[] = [];

  if (supply.contactableWorkers > supply.registeredWorkers) {
    violations.push("Contactable workers count cannot exceed registered workers count.");
  }
  if (supply.availableWorkers > supply.contactableWorkers) {
    violations.push("Available workers count cannot exceed contactable workers count.");
  }
  if (supply.verifiedWorkers > supply.registeredWorkers) {
    violations.push("Verified workers count cannot exceed registered workers count.");
  }
  if (supply.independentlyVerifiedPayments > supply.recentCompletedWork) {
    violations.push("Independently verified payments cannot exceed recent completed work count.");
  }
  if (supply.inactiveWorkers + supply.availableWorkers > supply.registeredWorkers) {
    violations.push("Sum of active available workers and inactive workers cannot exceed registered workers.");
  }

  return {
    isValid: violations.length === 0,
    violations,
  };
}

/**
 * Evaluates standard regional operating performance.
 */
export function evaluateRegionalOperatingStandard(params: {
  regionCode: string;
  regionName: string;
  districtName: string;
  reviewCycle: string;
  operatingStatus: "research" | "candidate" | "readiness_assessment" | "conditionally_ready" | "controlled_pilot" | "active" | "suspended" | "closed";
  supply: SevenTierSupplyBreakdown;
  sropChecksPassed: number; // 0 to 12
  leadReviewer: string;
  limitationsNotes?: string;
}): RegionalOperatingReviewRecord {
  const hierarchyCheck = validateSevenTierSupplyHierarchy(params.supply);
  if (!hierarchyCheck.isValid) {
    throw new Error(`Seven-tier supply hierarchy invalid: ${hierarchyCheck.violations.join("; ")}`);
  }

  const sropConformanceScorePct = Math.round(((params.sropChecksPassed / 12) * 100) * 10) / 10;
  const now = new Date().toISOString();
  const id = `srop-${params.regionCode.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${crypto.randomUUID().slice(0, 8)}`;

  const rawDigest = {
    region: params.regionCode,
    district: params.districtName,
    cycle: params.reviewCycle,
    status: params.operatingStatus,
    score: sropConformanceScorePct,
    supply: params.supply,
  };
  const evidenceSha256 = crypto
    .createHash("sha256")
    .update(JSON.stringify(rawDigest))
    .digest("hex");

  return {
    id,
    regionCode: params.regionCode,
    regionName: params.regionName,
    districtName: params.districtName,
    reviewCycle: params.reviewCycle,
    operatingStatus: params.operatingStatus,
    supply: params.supply,
    sropConformanceScorePct,
    leadReviewer: params.leadReviewer,
    evidenceSha256,
    limitationsNotes: params.limitationsNotes || null,
    updatedAt: now,
  };
}
