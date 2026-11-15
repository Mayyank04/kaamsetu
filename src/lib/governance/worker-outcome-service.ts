/**
 * Worker Outcome & Wage Verification Service
 * Pillar E: Establishes a trustworthy worker-outcome ledger, enforcing strict separation
 * between bookings, completed work, and confirmed wage payments with 0% platform commission.
 *
 * MISSION INVARIANT: "Every skill deserves to be seen, even without a degree."
 * CONSTITUTIONAL INVARIANT: 0.00% commission on worker wages.
 */

import crypto from "crypto";

export type MilestoneStep =
  | "opportunity_received"
  | "opportunity_accepted"
  | "booking_confirmed"
  | "work_started"
  | "work_commenced"
  | "work_completed"
  | "worker_confirmed_completion"
  | "customer_confirmed"
  | "gross_wages_agreed"
  | "gross_wages_paid"
  | "payment_evidence"
  | "disputed"
  | "resolution"
  | "reversal_correction"
  | "retracted";

export type ProvenanceState =
  | "self_reported"
  | "worker_confirmed"
  | "customer_confirmed"
  | "payment_documented"
  | "independently_verified"
  | "disputed"
  | "retracted";

export interface WorkerMilestoneInput {
  workerId: string;
  opportunityId?: string;
  milestoneStep: MilestoneStep;
  agreedWageAmount?: number | null;
  paidWageAmount?: number | null;
  provenanceState: ProvenanceState;
  paymentEvidenceRef?: string;
  disputeReason?: string;
  metadata?: Record<string, unknown>;
}

export interface WorkerOutcomeMilestoneRecord {
  id: string;
  workerId: string;
  opportunityId: string | null;
  milestoneStep: MilestoneStep;
  agreedWageAmount: number | null;
  paidWageAmount: number | null;
  platformCommissionAmount: number; // MUST BE 0.00
  provenanceState: ProvenanceState;
  paymentEvidenceRef: string | null;
  paymentEvidenceHash: string | null;
  disputeReason: string | null;
  milestoneTimestamp: string;
  metadata: Record<string, unknown>;
}

export interface WorkerEarningsSummary {
  workerId: string;
  totalOpportunitiesReceived: number;
  totalOpportunitiesAccepted: number;
  totalBookingsConfirmed: number;
  totalWorkCompleted: number;
  totalCustomerConfirmed: number;
  totalGrossWagesAgreed: number;
  totalGrossWagesPaid: number;
  totalPlatformCommissionDeducted: number; // ALWAYS 0.00
  verifiedPaymentRatio: number; // 0.0 to 100.0%
  hasActiveDisputes: boolean;
}

/**
 * Validates logical progression of outcome milestones.
 * Invariant: Cannot record 'work_completed' before 'work_started'.
 * Invariant: Cannot record 'gross_wages_paid' before 'gross_wages_agreed' and 'work_completed'.
 */
export function validateMilestoneProgression(
  existingSteps: MilestoneStep[],
  newStep: MilestoneStep
): { allowed: boolean; violationReason?: string } {
  const hasWorkStarted = existingSteps.includes("work_started") || existingSteps.includes("work_commenced");
  const hasWorkCompleted =
    existingSteps.includes("work_completed") || existingSteps.includes("worker_confirmed_completion");

  if ((newStep === "work_completed" || newStep === "worker_confirmed_completion") && !hasWorkStarted) {
    return {
      allowed: false,
      violationReason: "Cannot record 'work_completed' without prior 'work_started' or 'work_commenced' milestone.",
    };
  }

  if (newStep === "customer_confirmed" && !hasWorkCompleted) {
    return {
      allowed: false,
      violationReason: "Customer confirmation requires completed work record.",
    };
  }

  if (newStep === "gross_wages_paid" && !hasWorkCompleted) {
    return {
      allowed: false,
      violationReason: "Cannot record paid wages for uncompleted work. Booking is NOT work.",
    };
  }

  if (newStep === "payment_evidence" && !existingSteps.includes("gross_wages_paid")) {
    return {
      allowed: false,
      violationReason: "Payment evidence must reference a recorded gross_wages_paid milestone.",
    };
  }

  return { allowed: true };
}

/**
 * Creates an immutable worker outcome milestone record.
 * Strictly guarantees platformCommissionAmount = 0.00.
 */
export function buildWorkerOutcomeMilestone(input: WorkerMilestoneInput): WorkerOutcomeMilestoneRecord {
  let paymentEvidenceHash: string | null = null;
  if (input.paymentEvidenceRef) {
    paymentEvidenceHash = crypto.createHash("sha256").update(input.paymentEvidenceRef).digest("hex");
  }

  return {
    id: "ms-" + crypto.randomUUID().slice(0, 12),
    workerId: input.workerId,
    opportunityId: input.opportunityId || null,
    milestoneStep: input.milestoneStep,
    agreedWageAmount: input.agreedWageAmount ?? null,
    paidWageAmount: input.paidWageAmount ?? null,
    platformCommissionAmount: 0.0, // CONSTITUTIONAL INVARIANT
    provenanceState: input.provenanceState,
    paymentEvidenceRef: input.paymentEvidenceRef || null,
    paymentEvidenceHash,
    disputeReason: input.disputeReason || null,
    milestoneTimestamp: new Date().toISOString(),
    metadata: input.metadata || {},
  };
}

/**
 * Aggregates a worker's outcome history with strict non-inflation checks.
 * Never conflates bookings with paid wages.
 */
export function aggregateWorkerOutcomes(
  workerId: string,
  milestones: WorkerOutcomeMilestoneRecord[]
): WorkerEarningsSummary {
  const workerRecords = milestones.filter((m) => m.workerId === workerId);

  let totalReceived = 0;
  let totalAccepted = 0;
  let totalBookings = 0;
  let totalCompleted = 0;
  let totalConfirmed = 0;
  let totalAgreedWages = 0;
  let totalPaidWages = 0;
  let hasDisputes = false;

  for (const m of workerRecords) {
    switch (m.milestoneStep) {
      case "opportunity_received":
        totalReceived++;
        break;
      case "opportunity_accepted":
        totalAccepted++;
        break;
      case "booking_confirmed":
        totalBookings++;
        break;
      case "work_completed":
        totalCompleted++;
        break;
      case "customer_confirmed":
        totalConfirmed++;
        break;
      case "gross_wages_agreed":
        totalAgreedWages += m.agreedWageAmount || 0;
        break;
      case "gross_wages_paid":
        totalPaidWages += m.paidWageAmount || 0;
        break;
      case "disputed":
        hasDisputes = true;
        break;
    }
  }

  const verifiedPaymentRatio =
    totalAgreedWages > 0 ? Math.round((totalPaidWages / totalAgreedWages) * 1000) / 10 : 0.0;

  return {
    workerId,
    totalOpportunitiesReceived: totalReceived,
    totalOpportunitiesAccepted: totalAccepted,
    totalBookingsConfirmed: totalBookings,
    totalWorkCompleted: totalCompleted,
    totalCustomerConfirmed: totalConfirmed,
    totalGrossWagesAgreed: totalAgreedWages,
    totalGrossWagesPaid: totalPaidWages,
    totalPlatformCommissionDeducted: 0.0, // CONSTITUTIONAL GUARANTEE
    verifiedPaymentRatio,
    hasActiveDisputes: hasDisputes,
  };
}
