/**
 * Worker Economics & Zero-Commission Wage Protection Service
 * Pillar D: Worker Economics & Defensible Net Take-Home Analysis
 *
 * MISSION INVARIANT: "Every skill deserves to be seen, even without a degree."
 * CONSTITUTIONAL INVARIANT: 0.00% commission on worker wages forever.
 * `platform_commission_amount = 0.00`
 *
 * GOVERNING RULE: Do not confuse gross customer payments with worker net income.
 */

import crypto from "crypto";

export interface WorkerEconomicMetrics {
  workerId: string;
  regionCode: string;
  tradeCode: string;
  periodStart: string;
  periodEnd: string;
  grossCustomerPaid: number;
  platformCommissionDeducted: number; // MUST BE 0.00
  workerNetEarnings: number;
  workerReportedExpenses: number; // Travel, consumable materials, equipment wear
  netTakeHome: number;
  paidWorkingDays: number;
  completedJobsCount: number;
  repeatCustomerBookingsCount: number;
  avgTimeToPaymentHours: number;
  evidenceSha256: string;
}

export function computeWorkerEconomicSnapshot(params: {
  workerId: string;
  regionCode: string;
  tradeCode: string;
  periodStart: string;
  periodEnd: string;
  grossCustomerPaid: number;
  workerReportedExpenses: number;
  paidWorkingDays: number;
  completedJobsCount: number;
  repeatCustomerBookingsCount: number;
  avgTimeToPaymentHours: number;
}): WorkerEconomicMetrics {
  // Constitutional Invariant: Platform commission MUST be 0.00
  const platformCommissionDeducted = 0.0;
  const workerNetEarnings = params.grossCustomerPaid - platformCommissionDeducted; // Equal to gross!
  const netTakeHome = workerNetEarnings - params.workerReportedExpenses;

  const rawDigest = {
    workerId: params.workerId,
    region: params.regionCode,
    gross: params.grossCustomerPaid,
    commission: platformCommissionDeducted,
    netEarnings: workerNetEarnings,
    expenses: params.workerReportedExpenses,
    takeHome: netTakeHome,
  };

  const evidenceSha256 = crypto
    .createHash("sha256")
    .update(JSON.stringify(rawDigest))
    .digest("hex");

  return {
    workerId: params.workerId,
    regionCode: params.regionCode,
    tradeCode: params.tradeCode,
    periodStart: params.periodStart,
    periodEnd: params.periodEnd,
    grossCustomerPaid: params.grossCustomerPaid,
    platformCommissionDeducted,
    workerNetEarnings,
    workerReportedExpenses: params.workerReportedExpenses,
    netTakeHome,
    paidWorkingDays: params.paidWorkingDays,
    completedJobsCount: params.completedJobsCount,
    repeatCustomerBookingsCount: params.repeatCustomerBookingsCount,
    avgTimeToPaymentHours: params.avgTimeToPaymentHours,
    evidenceSha256,
  };
}

/**
 * Validates that platform commission deduction is strictly 0.00.
 */
export function validateZeroCommissionInvariant(metrics: WorkerEconomicMetrics): {
  isCompliant: boolean;
  violations: string[];
} {
  const violations: string[] = [];

  if (metrics.platformCommissionDeducted !== 0.0) {
    violations.push(
      `Constitutional Violation: Platform commission deduction is ₹${metrics.platformCommissionDeducted}, expected ₹0.00.`
    );
  }

  if (metrics.workerNetEarnings !== metrics.grossCustomerPaid) {
    violations.push(
      `Earnings Mismatch: Worker net earnings (₹${metrics.workerNetEarnings}) must exactly equal gross customer paid (₹${metrics.grossCustomerPaid}) before worker expenses.`
    );
  }

  if (metrics.netTakeHome !== metrics.workerNetEarnings - metrics.workerReportedExpenses) {
    violations.push(
      `Arithmetic Inconsistency: Net take home (₹${metrics.netTakeHome}) does not match earnings minus expenses (₹${metrics.workerNetEarnings - metrics.workerReportedExpenses}).`
    );
  }

  return {
    isCompliant: violations.length === 0,
    violations,
  };
}
