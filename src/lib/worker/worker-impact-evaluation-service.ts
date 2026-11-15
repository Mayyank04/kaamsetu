/**
 * KAAMSETU Worker Outcome & Impact Evaluation Service
 * Phase 23 — Pillar G: Longitudinal Worker Impact & Net Take-Home Realization
 */

import crypto from "crypto";

export interface WorkerImpactEvaluationInput {
  cohortName: string;
  regionCode: string;
  tradeCategory: string;
  observationPeriodStart: string;
  observationPeriodEnd: string;
  sampleSize: number;
  baselineDailyEarnings: number;
  postParticipationDailyEarnings: number;
  monthlyPaidWorkingDaysBaseline: number;
  monthlyPaidWorkingDaysPost: number;
  averageDirectExpenses: number;
  platformCommissionDeduction?: number;
  averagePaymentDelayHours: number;
  repeatWorkRetentionRate: number;
  customerConcentrationTop1Percent: number;
  satisfactionScoreOutOf5: number;
  workerRetentionPercent: number;
  confoundingFactors: string[];
  confidenceLimitations: string;
}

export interface WorkerImpactEvaluationRecord {
  id: string;
  cohortName: string;
  regionCode: string;
  tradeCategory: string;
  observationPeriodStart: string;
  observationPeriodEnd: string;
  sampleSize: number;
  baselineDailyEarnings: number;
  postParticipationDailyEarnings: number;
  monthlyPaidWorkingDaysBaseline: number;
  monthlyPaidWorkingDaysPost: number;
  averageDirectExpenses: number;
  averageNetTakeHome: number;
  platformCommissionDeduction: number;
  averagePaymentDelayHours: number;
  repeatWorkRetentionRate: number;
  customerConcentrationTop1Percent: number;
  satisfactionScoreOutOf5: number;
  workerRetentionPercent: number;
  monthlyNetGain: number;
  percentEarningsImprovement: number;
  confoundingFactors: string[];
  confidenceLimitations: string;
  evidenceDigest: string;
  createdAt: string;
  updatedAt: string;
}

export function computeWorkerImpactDigest(input: WorkerImpactEvaluationInput): string {
  const canonical = JSON.stringify({
    cohortName: input.cohortName,
    regionCode: input.regionCode,
    sampleSize: input.sampleSize,
    baselineDaily: input.baselineDailyEarnings,
    postDaily: input.postParticipationDailyEarnings,
    daysBaseline: input.monthlyPaidWorkingDaysBaseline,
    daysPost: input.monthlyPaidWorkingDaysPost,
    commission: 0.00,
  });
  return crypto.createHash("sha256").update(canonical).digest("hex");
}

export function validateWorkerImpactData(input: WorkerImpactEvaluationInput): {
  isValid: boolean;
  errors: string[];
  monthlyNetGain: number;
  percentEarningsImprovement: number;
  averageNetTakeHome: number;
} {
  const errors: string[] = [];

  // Sample size check
  if (input.sampleSize < 10) {
    errors.push("Sample size must be at least 10 workers for statistically reviewable cohort evaluation");
  }

  // Realistic daily rates (informal skilled artisans in India: Rs 400 - Rs 2500)
  if (input.baselineDailyEarnings < 300 || input.baselineDailyEarnings > 3000) {
    errors.push(`Baseline daily earnings (₹${input.baselineDailyEarnings}) is outside realistic market boundaries (₹300 - ₹3,000)`);
  }
  if (input.postParticipationDailyEarnings < 300 || input.postParticipationDailyEarnings > 3000) {
    errors.push(`Post-participation daily earnings (₹${input.postParticipationDailyEarnings}) is outside realistic market boundaries`);
  }

  // CONSTITUTIONAL INVARIANT: Commission must strictly be 0.00
  if (input.platformCommissionDeduction !== undefined && input.platformCommissionDeduction !== 0) {
    errors.push(`CONSTITUTIONAL INVARIANT VIOLATION: platform_commission_deduction must be exactly 0.00, received ₹${input.platformCommissionDeduction}`);
  }

  // Working days bounds (max 30 days/month)
  if (input.monthlyPaidWorkingDaysBaseline > 30 || input.monthlyPaidWorkingDaysPost > 30) {
    errors.push("Monthly paid working days cannot exceed 30");
  }

  // Net take-home calculation
  const monthlyGrossPost = input.postParticipationDailyEarnings * input.monthlyPaidWorkingDaysPost;
  const averageNetTakeHome = monthlyGrossPost - input.averageDirectExpenses;

  const monthlyGrossBaseline = input.baselineDailyEarnings * input.monthlyPaidWorkingDaysBaseline;
  const monthlyNetGain = averageNetTakeHome - monthlyGrossBaseline;
  const percentEarningsImprovement = monthlyGrossBaseline > 0
    ? Number(((monthlyNetGain / monthlyGrossBaseline) * 100).toFixed(1))
    : 0;

  // Confidence limitations cannot be blank
  if (!input.confidenceLimitations || input.confidenceLimitations.trim().length < 20) {
    errors.push("Confidence limitations and evaluation design methodology cannot be empty (min 20 chars)");
  }

  return {
    isValid: errors.length === 0,
    errors,
    monthlyNetGain,
    percentEarningsImprovement,
    averageNetTakeHome,
  };
}

export function createWorkerImpactEvaluationRecord(
  input: WorkerImpactEvaluationInput
): WorkerImpactEvaluationRecord {
  const validation = validateWorkerImpactData(input);
  if (!validation.isValid) {
    throw new Error(`Worker impact evaluation validation failed: ${validation.errors.join("; ")}`);
  }

  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    cohortName: input.cohortName,
    regionCode: input.regionCode,
    tradeCategory: input.tradeCategory,
    observationPeriodStart: input.observationPeriodStart,
    observationPeriodEnd: input.observationPeriodEnd,
    sampleSize: input.sampleSize,
    baselineDailyEarnings: input.baselineDailyEarnings,
    postParticipationDailyEarnings: input.postParticipationDailyEarnings,
    monthlyPaidWorkingDaysBaseline: input.monthlyPaidWorkingDaysBaseline,
    monthlyPaidWorkingDaysPost: input.monthlyPaidWorkingDaysPost,
    averageDirectExpenses: input.averageDirectExpenses,
    averageNetTakeHome: validation.averageNetTakeHome,
    platformCommissionDeduction: 0.00,
    averagePaymentDelayHours: input.averagePaymentDelayHours,
    repeatWorkRetentionRate: input.repeatWorkRetentionRate,
    customerConcentrationTop1Percent: input.customerConcentrationTop1Percent,
    satisfactionScoreOutOf5: input.satisfactionScoreOutOf5,
    workerRetentionPercent: input.workerRetentionPercent,
    monthlyNetGain: validation.monthlyNetGain,
    percentEarningsImprovement: validation.percentEarningsImprovement,
    confoundingFactors: input.confoundingFactors,
    confidenceLimitations: input.confidenceLimitations,
    evidenceDigest: computeWorkerImpactDigest(input),
    createdAt: now,
    updatedAt: now,
  };
}
