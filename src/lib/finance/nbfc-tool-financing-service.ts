/**
 * NBFC Responsible Tool Financing Service
 * Pillar D: Implements RBI Digital Lending Directions (2022) compliant tool financing,
 * Key Fact Statement (KFS) generation, APR disclosure capping (<=14% p.a.),
 * mandatory 3-day cooling-off period, and constitutional 0.00% commission enforcement.
 *
 * MISSION INVARIANT: "Every skill deserves to be seen, even without a degree."
 * CONSTITUTIONAL INVARIANT: 0.00% commission on worker wages or financing.
 */

import crypto from "crypto";

export type ToolkitType =
  | "electrical_tooling"
  | "solar_installation_kit"
  | "plumbing_kit"
  | "carpentry_power_set"
  | "masonry_precision_pack";

export interface KeyFactStatement {
  kfsId: string;
  workerId: string;
  nbfcPartnerName: string;
  nbfcRbiRegistrationNumber: string;
  toolkitType: ToolkitType;
  principalAmount: number;
  annualPercentageRate: number; // Must be <= 14.00%
  tenureMonths: number;
  monthlyEmiAmount: number;
  totalInterestAmount: number;
  totalRepaymentAmount: number;
  coolingOffPeriodDays: number; // Must be >= 3 days
  processingFees: number; // Capped/zero
  prepaymentPenalty: number; // Strictly 0.00% under RBI guidelines
  platformCommissionRate: number; // MUST BE 0.00%
  kfsHash: string;
  issuedAt: string;
}

export interface ToolFinancingApplication {
  workerId: string;
  nbfcPartnerId: string;
  toolkitType: ToolkitType;
  requestedAmount: number;
  annualPercentageRate: number;
  tenureMonths: number;
  workerConsentRecorded: boolean;
}

/**
 * Calculates monthly EMI using standard reducing balance formula.
 * E = P * r * (1 + r)^n / ((1 + r)^n - 1)
 */
export function calculateMonthlyEmi(
  principal: number,
  annualRatePercent: number,
  tenureMonths: number
): {
  monthlyEmi: number;
  totalInterest: number;
  totalRepayment: number;
} {
  if (tenureMonths <= 0 || principal <= 0) {
    return { monthlyEmi: 0, totalInterest: 0, totalRepayment: 0 };
  }

  const monthlyRate = annualRatePercent / (12 * 100);
  if (monthlyRate === 0) {
    const emi = principal / tenureMonths;
    return { monthlyEmi: Math.round(emi), totalInterest: 0, totalRepayment: principal };
  }

  const factor = Math.pow(1 + monthlyRate, tenureMonths);
  const emi = (principal * monthlyRate * factor) / (factor - 1);
  const totalRepayment = emi * tenureMonths;
  const totalInterest = totalRepayment - principal;

  return {
    monthlyEmi: Math.round(emi * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
    totalRepayment: Math.round(totalRepayment * 100) / 100,
  };
}

/**
 * Generates an RBI-compliant Key Fact Statement (KFS) for worker tool financing.
 */
export function generateKeyFactStatement(params: {
  workerId: string;
  nbfcPartnerName: string;
  nbfcRbiRegistrationNumber: string;
  toolkitType: ToolkitType;
  principalAmount: number;
  annualPercentageRate: number;
  tenureMonths: number;
}): KeyFactStatement {
  // Validate maximum loan amount for informal tool advances
  if (params.principalAmount > 30000) {
    throw new Error(`Principal amount ₹${params.principalAmount} exceeds maximum tool financing ceiling (₹30,000)`);
  }

  // Validate APR ceiling (RBI Digital Lending guideline recommendation for micro-advances: max 14.0%)
  if (params.annualPercentageRate > 14.0) {
    throw new Error(`APR ${params.annualPercentageRate}% exceeds platform cap of 14.00% p.a.`);
  }

  const { monthlyEmi, totalInterest, totalRepayment } = calculateMonthlyEmi(
    params.principalAmount,
    params.annualPercentageRate,
    params.tenureMonths
  );

  const kfsId = "KFS-" + crypto.randomUUID().slice(0, 8).toUpperCase();
  const rawDigest = `${kfsId}:${params.workerId}:${params.principalAmount}:${params.annualPercentageRate}:${params.tenureMonths}:0.00`;
  const kfsHash = crypto.createHash("sha256").update(rawDigest).digest("hex");

  return {
    kfsId,
    workerId: params.workerId,
    nbfcPartnerName: params.nbfcPartnerName,
    nbfcRbiRegistrationNumber: params.nbfcRbiRegistrationNumber,
    toolkitType: params.toolkitType,
    principalAmount: params.principalAmount,
    annualPercentageRate: params.annualPercentageRate,
    tenureMonths: params.tenureMonths,
    monthlyEmiAmount: monthlyEmi,
    totalInterestAmount: totalInterest,
    totalRepaymentAmount: totalRepayment,
    coolingOffPeriodDays: 3, // Mandatory RBI cooling-off period
    processingFees: 0.0, // Zero processing fees for informal trades
    prepaymentPenalty: 0.0, // Zero prepayment penalty
    platformCommissionRate: 0.0, // CONSTITUTIONAL GUARANTEE
    kfsHash,
    issuedAt: new Date().toISOString(),
  };
}

/**
 * Validates eligibility of NBFC partner against RBI compliance criteria.
 */
export function evaluateNbfcPartnerEligibility(partner: {
  name: string;
  rbiRegNumber: string;
  isRbiRegistered: boolean;
  offersTransparentKfs: boolean;
  sharesNoPiiCrossSelling: boolean;
  maxAprOffered: number;
}): {
  isEligible: boolean;
  violations: string[];
} {
  const violations: string[] = [];

  if (!partner.isRbiRegistered || !partner.rbiRegNumber || partner.rbiRegNumber.trim().length === 0) {
    violations.push("Partner is not an RBI-registered NBFC / Bank");
  }

  if (!partner.offersTransparentKfs) {
    violations.push("Partner does not support standardized RBI Key Fact Statements");
  }

  if (!partner.sharesNoPiiCrossSelling) {
    violations.push("Partner refused strict non-cross-selling PII covenant");
  }

  if (partner.maxAprOffered > 14.0) {
    violations.push(`Partner APR (${partner.maxAprOffered}%) exceeds platform maximum cap of 14.00%`);
  }

  return {
    isEligible: violations.length === 0,
    violations,
  };
}

/**
 * Processes cancellation within statutory cooling-off window.
 */
export function evaluateCoolingOffCancellation(params: {
  applicationTimestamp: string;
  cancellationTimestamp: string;
  coolingOffDays: number;
}): {
  canCancelWithZeroPenalty: boolean;
  elapsedDays: number;
  reason?: string;
} {
  const appDate = new Date(params.applicationTimestamp).getTime();
  const cancelDate = new Date(params.cancellationTimestamp).getTime();
  const elapsedDays = (cancelDate - appDate) / (1000 * 60 * 60 * 24);

  if (elapsedDays <= params.coolingOffDays) {
    return {
      canCancelWithZeroPenalty: true,
      elapsedDays: Math.round(elapsedDays * 10) / 10,
    };
  }

  return {
    canCancelWithZeroPenalty: false,
    elapsedDays: Math.round(elapsedDays * 10) / 10,
    reason: `Cancellation requested at ${Math.round(elapsedDays * 10) / 10} days, which exceeds the ${params.coolingOffDays}-day statutory cooling-off window`,
  };
}
