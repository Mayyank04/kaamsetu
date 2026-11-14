/**
 * Contractor Customer Success & Retention Service
 * Pillar D: Calculates traceable health scores, tracks customer lifecycle,
 * measures retention/churn, and guarantees worker identity preservation upon cancellation.
 */

export interface ContractorHealthInput {
  organizationId: string;
  subscriptionTier: "starter" | "pro" | "enterprise";
  subscriptionStatus: "active" | "trialing" | "past_due" | "cancelled";
  rosterUtilizationPercent: number; // 0-100%
  activeProjectsCount: number;
  openGrievancesCount: number;
  daysSinceLastActive: number;
  unresolvedSupportTicketsCount: number;
}

export interface ContractorHealthOutput {
  organizationId: string;
  compositeHealthScore: number; // 0-100
  riskLevel: "low" | "medium" | "high" | "critical";
  scoreBreakdown: {
    utilizationScore: number; // max 25
    activityScore: number; // max 25
    complianceScore: number; // max 25
    supportScore: number; // max 25
  };
  recommendedIntervention?: string;
}

export function computeContractorHealthScore(input: ContractorHealthInput): ContractorHealthOutput {
  // 1. Roster Utilization Score (0-25 pts)
  const utilizationScore = Math.min(25, Math.round((input.rosterUtilizationPercent / 100) * 25));

  // 2. Activity Score (0-25 pts)
  let activityScore = 25;
  if (input.daysSinceLastActive > 30) {
    activityScore = 0;
  } else if (input.daysSinceLastActive > 14) {
    activityScore = 10;
  } else if (input.daysSinceLastActive > 7) {
    activityScore = 18;
  }
  if (input.activeProjectsCount === 0) {
    activityScore = Math.min(activityScore, 10);
  }

  // 3. Wage & Compliance Score (0-25 pts)
  let complianceScore = 25;
  if (input.openGrievancesCount > 2) {
    complianceScore = 0;
  } else if (input.openGrievancesCount > 0) {
    complianceScore = 10;
  }
  if (input.subscriptionStatus === "past_due") {
    complianceScore = Math.min(complianceScore, 5);
  }

  // 4. Support & Stability Score (0-25 pts)
  let supportScore = 25;
  if (input.unresolvedSupportTicketsCount > 3) {
    supportScore = 5;
  } else if (input.unresolvedSupportTicketsCount > 0) {
    supportScore = 15;
  }

  const compositeHealthScore = utilizationScore + activityScore + complianceScore + supportScore;

  let riskLevel: "low" | "medium" | "high" | "critical" = "low";
  let recommendedIntervention: string | undefined;

  if (input.subscriptionStatus === "cancelled") {
    riskLevel = "critical";
    recommendedIntervention = "Subscription cancelled. Preserve worker data and trigger offboarding review.";
  } else if (compositeHealthScore < 40 || input.openGrievancesCount > 2) {
    riskLevel = "critical";
    recommendedIntervention = "Urgent Customer Success follow-up: high churn risk / active labor disputes.";
  } else if (compositeHealthScore < 60 || input.daysSinceLastActive > 14) {
    riskLevel = "high";
    recommendedIntervention = "Proactive check-in: engagement drop detected in last 14 days.";
  } else if (compositeHealthScore < 80) {
    riskLevel = "medium";
    recommendedIntervention = "Encourage project creation and roster staffing.";
  } else {
    riskLevel = "low";
  }

  return {
    organizationId: input.organizationId,
    compositeHealthScore,
    riskLevel,
    scoreBreakdown: {
      utilizationScore,
      activityScore,
      complianceScore,
      supportScore,
    },
    recommendedIntervention,
  };
}

export function computeSaaSRetentionMetrics(params: {
  totalStartingOrgs: number;
  churnedOrgs: number;
  startingMrr: number;
  churnedMrr: number;
  expansionMrr: number;
  totalSalesAndMarketingCost: number;
  newOrgsAcquired: number;
}) {
  const logoChurnRate =
    params.totalStartingOrgs > 0
      ? Number(((params.churnedOrgs / params.totalStartingOrgs) * 100).toFixed(2))
      : 0;

  const netMrrGrowth = params.expansionMrr - params.churnedMrr;
  const netRevenueRetention =
    params.startingMrr > 0
      ? Number((((params.startingMrr + netMrrGrowth) / params.startingMrr) * 100).toFixed(2))
      : 100;

  const cac =
    params.newOrgsAcquired > 0
      ? Number((params.totalSalesAndMarketingCost / params.newOrgsAcquired).toFixed(2))
      : 0;

  const avgMrrPerOrg =
    params.totalStartingOrgs > 0 ? params.startingMrr / params.totalStartingOrgs : 2499;

  const paybackPeriodMonths =
    avgMrrPerOrg > 0 ? Number((cac / avgMrrPerOrg).toFixed(1)) : 0;

  return {
    logoChurnRate,
    netRevenueRetention,
    cac,
    paybackPeriodMonths,
  };
}

export function assertSubscriptionCancellationWorkerPreservation(params: {
  contractorSubscriptionStatus: "cancelled";
  workerProfileId: string;
  workerProfileStatus: string;
  workerCredentialsCount: number;
  workerWorkRecordsCount: number;
}): { preserved: boolean; violationReason?: string } {
  // CONSTITUTIONAL RULE: Contractor cancellation must NEVER cascade to worker data
  if (params.workerProfileStatus === "suspended" || params.workerProfileStatus === "deleted") {
    return {
      preserved: false,
      violationReason: "Worker profile status was improperly modified upon contractor tier cancellation.",
    };
  }

  if (params.workerCredentialsCount === 0 && params.workerWorkRecordsCount === 0) {
    return {
      preserved: false,
      violationReason: "Worker historical records or credentials were wiped upon contractor cancellation.",
    };
  }

  return {
    preserved: true,
  };
}
