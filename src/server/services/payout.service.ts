/**
 * KAAMSETU — Payout Service
 * Coordinates artisan payout confirmations, zero wage deductions, and immutable financial ledgers.
 */

import { ValidationError } from "@/lib/errors/app-error";
import { evaluatePayoutProvenance, PayoutConfirmationRecord } from "@/lib/worker/worker-outcome-service";

export interface PayoutDisbursementInput {
  workerProfileId: string;
  contractorOrganizationId: string;
  actualPayoutAmount: number;
  contractorDeclaredAmount: number;
  workerAgreedAmount: number;
  payoutMethod: "bank_transfer" | "upi" | "cash_voucher_verified" | "direct_debit";
  payoutReference: string;
  payoutDate?: string | null;
  idempotencyKey?: string | null;
}

export class PayoutService {
  /**
   * Asserts zero platform fee extraction on artisan payouts
   */
  public static validateZeroCommission(payout: PayoutDisbursementInput): void {
    if (payout.actualPayoutAmount !== payout.contractorDeclaredAmount) {
      if (payout.actualPayoutAmount < payout.contractorDeclaredAmount) {
        throw new ValidationError(
          "Constitutional Invariant Violation: Platform deduction is strictly forbidden. 100% of declared wages must be disbursed."
        );
      }
    }
  }

  /**
   * Evaluates payout provenance and ensures contractor declaration alone is never proof
   */
  public static evaluateProvenance(payout: PayoutConfirmationRecord) {
    return evaluatePayoutProvenance(payout);
  }
}
