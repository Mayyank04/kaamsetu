/**
 * Worker Outcome Assurance & 11-Stage Verification Service
 * Pillar C: Independent Worker Outcome Verification & Provenance
 *
 * MISSION INVARIANT: "Every skill deserves to be seen, even without a degree."
 * CONSTITUTIONAL INVARIANT: 0.00% commission on worker wages forever.
 * ONTOLOGICAL AXIOMS:
 * - A booking is not a completed job.
 * - A completed job is not a paid job.
 * - A worker declaration is not an independent verification.
 * - An invoice is not proof of worker receipt.
 */

import crypto from "crypto";

export type OutcomeStage =
  | "enquiry_received"
  | "worker_contacted"
  | "booking_accepted"
  | "work_started"
  | "work_completed"
  | "customer_confirmation_received"
  | "wage_amount_agreed"
  | "payment_initiated"
  | "payment_independently_evidenced"
  | "payment_settlement_verified"
  | "dispute_or_reversal_checked";

export type PaymentVerificationStatus =
  | "worker_declared"
  | "customer_declared"
  | "payment_reference_submitted"
  | "bank_evidence_reviewed"
  | "settlement_confirmed"
  | "reversed_disputed_refunded";

export interface OutcomeVerificationRecord {
  id: string;
  bookingId: string;
  workerId: string;
  customerId: string;
  stage: OutcomeStage;
  wageAmountAgreed: number;
  platformCommissionDeduction: number; // MUST BE 0.00
  paymentStatus: PaymentVerificationStatus;
  bankUtrMasked: string | null;
  customerConfirmationOtpHash: string | null;
  primaryVerifierIdentity: string | null;
  secondaryVerifierIdentity: string | null;
  dualAuthorizationApproved: boolean;
  workerChallenged: boolean;
  challengeReason: string | null;
  evidenceSha256: string;
  settlementTimestamp: string | null;
  updatedAt: string;
}

const STAGE_ORDER: Record<OutcomeStage, number> = {
  enquiry_received: 1,
  worker_contacted: 2,
  booking_accepted: 3,
  work_started: 4,
  work_completed: 5,
  customer_confirmation_received: 6,
  wage_amount_agreed: 7,
  payment_initiated: 8,
  payment_independently_evidenced: 9,
  payment_settlement_verified: 10,
  dispute_or_reversal_checked: 11,
};

/**
 * Validates progression across the 11-stage outcome pipeline.
 * Prohibits skipping stages.
 */
export function validateOutcomeStageProgression(
  currentStage: OutcomeStage,
  targetStage: OutcomeStage
): { allowed: boolean; reason?: string } {
  const currentIdx = STAGE_ORDER[currentStage];
  const targetIdx = STAGE_ORDER[targetStage];

  if (targetIdx !== currentIdx + 1 && targetStage !== "dispute_or_reversal_checked") {
    return {
      allowed: false,
      reason: `Illegal outcome stage skip: cannot jump from '${currentStage}' (Stage ${currentIdx}) to '${targetStage}' (Stage ${targetIdx}). Stages must be verified sequentially.`,
    };
  }

  return { allowed: true };
}

/**
 * Creates an initial outcome record at stage 1.
 */
export function createOutcomeVerification(params: {
  bookingId: string;
  workerId: string;
  customerId: string;
  wageAmountAgreed: number;
}): OutcomeVerificationRecord {
  const now = new Date().toISOString();
  const id = "outc-" + crypto.randomUUID().slice(0, 12);
  const rawPayload = {
    bookingId: params.bookingId,
    workerId: params.workerId,
    stage: "enquiry_received",
    wage: params.wageAmountAgreed,
  };
  const evidenceSha256 = crypto
    .createHash("sha256")
    .update(JSON.stringify(rawPayload))
    .digest("hex");

  return {
    id,
    bookingId: params.bookingId,
    workerId: params.workerId,
    customerId: params.customerId,
    stage: "enquiry_received",
    wageAmountAgreed: params.wageAmountAgreed,
    platformCommissionDeduction: 0.0, // Constitutional Invariant
    paymentStatus: "worker_declared",
    bankUtrMasked: null,
    customerConfirmationOtpHash: null,
    primaryVerifierIdentity: null,
    secondaryVerifierIdentity: null,
    dualAuthorizationApproved: false,
    workerChallenged: false,
    challengeReason: null,
    evidenceSha256,
    settlementTimestamp: null,
    updatedAt: now,
  };
}

/**
 * Advances the outcome record with strict evidence checks and dual-authorization.
 */
export function advanceOutcomeStage(params: {
  record: OutcomeVerificationRecord;
  targetStage: OutcomeStage;
  paymentStatus?: PaymentVerificationStatus;
  bankUtrMasked?: string;
  customerOtpHash?: string;
  verifierIdentity?: string;
  secondaryVerifierIdentity?: string;
}): { success: boolean; record: OutcomeVerificationRecord; error?: string } {
  const progression = validateOutcomeStageProgression(params.record.stage, params.targetStage);
  if (!progression.allowed) {
    return { success: false, record: params.record, error: progression.reason };
  }

  // Stage 6: Customer confirmation requires customer OTP or signature digest
  if (params.targetStage === "customer_confirmation_received" && !params.customerOtpHash && !params.record.customerConfirmationOtpHash) {
    return {
      success: false,
      record: params.record,
      error: "Stage 6 (customer_confirmation_received) requires verified customer OTP or signature proof.",
    };
  }

  // Stage 9: Independent payment evidence requires payment reference / masked bank UTR
  if (params.targetStage === "payment_independently_evidenced" && !params.bankUtrMasked && !params.record.bankUtrMasked) {
    return {
      success: false,
      record: params.record,
      error: "Stage 9 (payment_independently_evidenced) requires verified bank payment reference or UTR.",
    };
  }

  // Stage 10: Settlement verification requires dual independent authorization
  let dualAuth = params.record.dualAuthorizationApproved;
  const primaryVerifier = params.verifierIdentity || params.record.primaryVerifierIdentity;
  const secondaryVerifier = params.secondaryVerifierIdentity || params.record.secondaryVerifierIdentity;

  if (params.targetStage === "payment_settlement_verified") {
    if (!primaryVerifier || !secondaryVerifier) {
      return {
        success: false,
        record: params.record,
        error: "Stage 10 (payment_settlement_verified) strictly requires dual independent authorization (primary + secondary verifier).",
      };
    }
    if (primaryVerifier === secondaryVerifier) {
      return {
        success: false,
        record: params.record,
        error: "Anti-self-approval violation: Primary verifier cannot act as secondary verifier for settlement verification.",
      };
    }
    dualAuth = true;
  }

  const now = new Date().toISOString();
  const updatedPaymentStatus = params.paymentStatus || (
    params.targetStage === "payment_settlement_verified"
      ? "settlement_confirmed"
      : params.targetStage === "payment_independently_evidenced"
      ? "bank_evidence_reviewed"
      : params.record.paymentStatus
  );

  const updated: OutcomeVerificationRecord = {
    ...params.record,
    stage: params.targetStage,
    paymentStatus: updatedPaymentStatus,
    bankUtrMasked: params.bankUtrMasked || params.record.bankUtrMasked,
    customerConfirmationOtpHash: params.customerOtpHash || params.record.customerConfirmationOtpHash,
    primaryVerifierIdentity: primaryVerifier,
    secondaryVerifierIdentity: secondaryVerifier,
    dualAuthorizationApproved: dualAuth,
    platformCommissionDeduction: 0.0, // Constitutional invariant: 0.00% forever
    settlementTimestamp: params.targetStage === "payment_settlement_verified" ? now : params.record.settlementTimestamp,
    updatedAt: now,
  };

  const rawDigest = {
    id: updated.id,
    bookingId: updated.bookingId,
    stage: updated.stage,
    wage: updated.wageAmountAgreed,
    commission: updated.platformCommissionDeduction,
    utr: updated.bankUtrMasked,
    dualAuth: updated.dualAuthorizationApproved,
  };
  updated.evidenceSha256 = crypto
    .createHash("sha256")
    .update(JSON.stringify(rawDigest))
    .digest("hex");

  return { success: true, record: updated };
}

/**
 * Allows a worker to challenge an outcome record (e.g., if payment was not received or disputed).
 */
export function challengeOutcomeRecord(
  record: OutcomeVerificationRecord,
  workerId: string,
  reason: string
): OutcomeVerificationRecord {
  if (record.workerId !== workerId) {
    throw new Error("Unauthorized: Only the assigned worker can challenge an outcome record.");
  }

  const now = new Date().toISOString();
  const updated: OutcomeVerificationRecord = {
    ...record,
    stage: "dispute_or_reversal_checked",
    paymentStatus: "reversed_disputed_refunded",
    workerChallenged: true,
    challengeReason: reason,
    updatedAt: now,
  };

  const rawDigest = {
    id: updated.id,
    stage: updated.stage,
    status: updated.paymentStatus,
    challenged: true,
    reason,
  };
  updated.evidenceSha256 = crypto
    .createHash("sha256")
    .update(JSON.stringify(rawDigest))
    .digest("hex");

  return updated;
}
