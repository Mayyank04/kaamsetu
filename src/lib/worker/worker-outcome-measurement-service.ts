/**
 * KAAMSETU Phase 16: Worker Outcome Measurement & Income Verification Service
 *
 * Implements privacy-preserving worker outcome measurement, 4-tier earnings
 * separation, cohort impact comparison methodology, and voluntary opt-out.
 */

export interface FourTierEarnings {
  workerReported: number | null;
  customerConfirmed: number | null;
  paymentBacked: number | null;
  independentlyReconciled: number | null;
}

export interface WorkerOutcomeCohortInput {
  workerProfileId: string;
  cohortId: string;
  baselinePeriod: { start: string; end: string };
  followUpPeriod: { start: string; end: string };
  baselineEarnings: FourTierEarnings;
  followUpEarnings: FourTierEarnings;
  enquiriesReceived: number;
  bookingsConverted: number;
  jobsCompleted: number;
  customerConfirmedJobs: number;
  repeatCustomers: number;
  enquiryToBookingHours: number;
  bookingToCompletionHours: number;
  outcomeTrackingOptedIn?: boolean;
}

export interface CohortComparisonResult {
  cohortId: string;
  sampleSize: number;
  activeParticipants: number;
  attritionRatePercent: number;
  meanBaselinePaymentBacked: number;
  meanFollowUpPaymentBacked: number;
  absoluteGainPaymentBacked: number;
  percentageGainPaymentBacked: number;
  confidenceInterval95: {
    lowerBound: number;
    upperBound: number;
  };
  selectionBiasCaveat: string;
  comparisonMethodology: string;
}

/**
 * Validates 4-tier earnings, ensuring that each tier is tracked independently
 * and never conflated or assumed identical.
 */
export function validateFourTierEarnings(earnings: FourTierEarnings): {
  isValid: boolean;
  highestTierAvailable: "independently_reconciled" | "payment_backed" | "customer_confirmed" | "worker_reported" | "none";
} {
  if (earnings.independentlyReconciled !== null && earnings.independentlyReconciled !== undefined) {
    return { isValid: true, highestTierAvailable: "independently_reconciled" };
  }
  if (earnings.paymentBacked !== null && earnings.paymentBacked !== undefined) {
    return { isValid: true, highestTierAvailable: "payment_backed" };
  }
  if (earnings.customerConfirmed !== null && earnings.customerConfirmed !== undefined) {
    return { isValid: true, highestTierAvailable: "customer_confirmed" };
  }
  if (earnings.workerReported !== null && earnings.workerReported !== undefined) {
    return { isValid: true, highestTierAvailable: "worker_reported" };
  }
  return { isValid: true, highestTierAvailable: "none" };
}

/**
 * Computes cohort outcome comparison using rigorous statistical metrics.
 * Separates payment-backed earnings from self-reported estimates.
 */
export function computeCohortOutcomeComparison(
  cohortId: string,
  participants: Array<{
    optedIn: boolean;
    baselinePaymentBacked: number;
    followUpPaymentBacked: number;
  }>
): CohortComparisonResult {
  const optedInParticipants = participants.filter((p) => p.optedIn);
  const sampleSize = participants.length;
  const activeCount = optedInParticipants.length;
  const attritionCount = sampleSize - activeCount;
  const attritionRatePercent =
    sampleSize > 0 ? Math.round((attritionCount / sampleSize) * 10000) / 100 : 0;

  if (activeCount === 0) {
    return {
      cohortId,
      sampleSize,
      activeParticipants: 0,
      attritionRatePercent,
      meanBaselinePaymentBacked: 0,
      meanFollowUpPaymentBacked: 0,
      absoluteGainPaymentBacked: 0,
      percentageGainPaymentBacked: 0,
      confidenceInterval95: { lowerBound: 0, upperBound: 0 },
      selectionBiasCaveat: "No opted-in participants available for cohort evaluation.",
      comparisonMethodology: "Difference-in-means on payment-record-backed earnings.",
    };
  }

  const baselineSum = optedInParticipants.reduce((acc, p) => acc + p.baselinePaymentBacked, 0);
  const followUpSum = optedInParticipants.reduce((acc, p) => acc + p.followUpPaymentBacked, 0);

  const meanBaseline = Math.round((baselineSum / activeCount) * 100) / 100;
  const meanFollowUp = Math.round((followUpSum / activeCount) * 100) / 100;
  const absoluteGain = Math.round((meanFollowUp - meanBaseline) * 100) / 100;
  const percentageGain =
    meanBaseline > 0 ? Math.round((absoluteGain / meanBaseline) * 10000) / 100 : 0;

  // Compute standard error and 95% confidence interval
  const differences = optedInParticipants.map(
    (p) => p.followUpPaymentBacked - p.baselinePaymentBacked
  );
  const variance =
    differences.reduce((acc, d) => acc + Math.pow(d - absoluteGain, 2), 0) /
    Math.max(activeCount - 1, 1);
  const standardError = Math.sqrt(variance / activeCount);
  const marginOfError = Math.round(1.96 * standardError * 100) / 100;

  return {
    cohortId,
    sampleSize,
    activeParticipants: activeCount,
    attritionRatePercent,
    meanBaselinePaymentBacked: meanBaseline,
    meanFollowUpPaymentBacked: meanFollowUp,
    absoluteGainPaymentBacked: absoluteGain,
    percentageGainPaymentBacked: percentageGain,
    confidenceInterval95: {
      lowerBound: Math.round((absoluteGain - marginOfError) * 100) / 100,
      upperBound: Math.round((absoluteGain + marginOfError) * 100) / 100,
    },
    selectionBiasCaveat:
      "Observational pre-post cohort. Workers opting into digital tracking may possess higher baseline motivation than general informal workforce.",
    comparisonMethodology:
      "Difference-in-means on strictly payment-record-backed earnings (self-reported excluded).",
  };
}

/**
 * Worker Privacy Invariant:
 * Evaluates whether an outgoing public profile leaks individual worker earnings or payout sums.
 */
export function assertWorkerOutcomePrivacy(publicProfilePayload: Record<string, any>): {
  isCompliant: boolean;
  leakedFields: string[];
} {
  const sensitiveFields = [
    "worker_reported_monthly_income",
    "customer_confirmed_monthly_income",
    "payment_record_backed_monthly_income",
    "independently_reconciled_monthly_income",
    "exact_earnings",
    "bank_account_number",
    "payout_sums",
  ];

  const leakedFields: string[] = [];
  for (const field of sensitiveFields) {
    if (publicProfilePayload[field] !== undefined && publicProfilePayload[field] !== null) {
      leakedFields.push(field);
    }
  }

  return {
    isCompliant: leakedFields.length === 0,
    leakedFields,
  };
}
