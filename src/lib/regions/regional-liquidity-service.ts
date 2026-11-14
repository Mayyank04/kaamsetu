/**
 * Regional Network Liquidity Service
 * Pillar A: Measures worker supply, customer/contractor demand, network quality,
 * and diagnostic recommendations across operational and candidate territories.
 */

export interface RegionalSupplyMetrics {
  registeredWorkers: number;
  confirmedWorkers: number;
  credentialVerifiedWorkers: number;
  recentlyActiveWorkers: number;
  availableWorkers: number;
  interstateMobilityWorkers: number;
  jobCompletingWorkers: number;
}

export interface RegionalDemandMetrics {
  activeContractors: number;
  activeCustomers: number;
  projectsPublished: number;
  qualifiedMatches: number;
  acceptedOpportunities: number;
  confirmedBookings: number;
  completedJobs: number;
}

export interface RegionalQualityMetrics {
  avgTimeToFirstMatchMs: number;
  avgTimeToFirstBookingMs: number;
  bookingCompletionRate: number; // percentage (0-100)
  repeatBookingRate: number; // percentage (0-100)
  opportunityFulfilmentRate: number; // percentage (0-100)
  unfilledDemandCount: number;
  workerInactivityRate: number; // percentage (0-100)
  customerInactivityRate: number; // percentage (0-100)
}

export type LiquidityStatus =
  | "dormant"
  | "emerging"
  | "liquid"
  | "undersupplied"
  | "underdemanded";

export type RegionalActionRecommendation =
  | "continue_controlled_operations"
  | "increase_worker_acquisition"
  | "increase_customer_acquisition"
  | "improve_trade_coverage"
  | "improve_field_support"
  | "pause_expansion"
  | "enter_operational_review";

export interface RegionalLiquidityDiagnostic {
  regionCode: string;
  reportingWindow: "7d" | "30d" | "90d";
  supply: RegionalSupplyMetrics;
  demand: RegionalDemandMetrics;
  quality: RegionalQualityMetrics;
  liquidityRatio: number; // availableWorkers / activeContractors
  liquidityStatus: LiquidityStatus;
  actionRecommendation: RegionalActionRecommendation;
  diagnosticNotes: string[];
}

export function computeRegionalLiquidityDiagnostic(params: {
  regionCode: string;
  reportingWindow?: "7d" | "30d" | "90d";
  supply: RegionalSupplyMetrics;
  demand: RegionalDemandMetrics;
  quality: RegionalQualityMetrics;
}): RegionalLiquidityDiagnostic {
  const window = params.reportingWindow || "30d";
  const { supply, demand, quality } = params;
  const diagnosticNotes: string[] = [];

  // Liquidity Ratio (Available workers per active contractor)
  const liquidityRatio =
    demand.activeContractors > 0
      ? Number((supply.availableWorkers / demand.activeContractors).toFixed(2))
      : supply.availableWorkers > 0
      ? 999.0
      : 0.0;

  // Determine Liquidity Status
  let liquidityStatus: LiquidityStatus = "emerging";

  if (supply.recentlyActiveWorkers === 0 && demand.activeContractors === 0) {
    liquidityStatus = "dormant";
    diagnosticNotes.push("Zero active supply or commercial demand in reporting window.");
  } else if (
    demand.activeContractors > 0 &&
    supply.availableWorkers < demand.activeContractors * 2
  ) {
    liquidityStatus = "undersupplied";
    diagnosticNotes.push(
      `Worker supply constrained: only ${supply.availableWorkers} available workers for ${demand.activeContractors} contractors.`
    );
  } else if (
    supply.availableWorkers >= 10 &&
    demand.activeContractors === 0 &&
    demand.projectsPublished === 0
  ) {
    liquidityStatus = "underdemanded";
    diagnosticNotes.push(
      `Substantial supply (${supply.availableWorkers} available workers) with zero active contractor demand.`
    );
  } else if (
    supply.availableWorkers >= 20 &&
    demand.activeContractors >= 2 &&
    quality.bookingCompletionRate >= 70 &&
    quality.opportunityFulfilmentRate >= 65
  ) {
    liquidityStatus = "liquid";
    diagnosticNotes.push(
      `Healthy network liquidity: ${liquidityRatio} workers/contractor with ${quality.bookingCompletionRate}% completion rate.`
    );
  } else {
    liquidityStatus = "emerging";
    diagnosticNotes.push("Early-stage network activity forming; controlled monitoring warranted.");
  }

  // Determine Action Recommendation
  let actionRecommendation: RegionalActionRecommendation = "continue_controlled_operations";

  if (quality.bookingCompletionRate > 0 && quality.bookingCompletionRate < 50) {
    actionRecommendation = "improve_field_support";
    diagnosticNotes.push(
      `Booking completion rate (${quality.bookingCompletionRate}%) below 50% threshold. Field coordinator intervention required.`
    );
  } else if (liquidityStatus === "undersupplied") {
    actionRecommendation = "increase_worker_acquisition";
    diagnosticNotes.push("Priority: Onboard and certify skilled workers in high-demand trades.");
  } else if (liquidityStatus === "underdemanded") {
    actionRecommendation = "increase_customer_acquisition";
    diagnosticNotes.push("Priority: Engage local contractors and infrastructure projects.");
  } else if (quality.unfilledDemandCount > 5 && quality.opportunityFulfilmentRate < 50) {
    actionRecommendation = "improve_trade_coverage";
    diagnosticNotes.push("Unfilled project demand detected due to missing specialized trades.");
  } else if (liquidityStatus === "dormant") {
    actionRecommendation = "enter_operational_review";
    diagnosticNotes.push("Territory inactive. Initiate operational review before committing field resources.");
  } else if (liquidityStatus === "liquid" && quality.bookingCompletionRate >= 80) {
    actionRecommendation = "continue_controlled_operations";
    diagnosticNotes.push("Network functioning sustainably. Continue controlled scaling.");
  }

  return {
    regionCode: params.regionCode,
    reportingWindow: window,
    supply,
    demand,
    quality,
    liquidityRatio,
    liquidityStatus,
    actionRecommendation,
    diagnosticNotes,
  };
}
