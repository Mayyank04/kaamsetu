/**
 * Commercial Settlement Reconciliation Service
 * Pillar G: 10-State Commercial Settlement & Gateway-to-Bank Reconciliation
 *
 * MISSION INVARIANT: "Every skill deserves to be seen, even without a degree."
 * CONSTITUTIONAL INVARIANT: 0.00% commission on worker wages.
 * INTEGRITY PRINCIPLE: Payment gateway confirmation does not equal merchant bank settlement.
 * Test ledger entries must never be reported as realized corporate cash.
 */

import crypto from "crypto";

export type SettlementState =
  | "test_ledger"
  | "invoice_generated"
  | "payment_initiated"
  | "payment_gateway_confirmed"
  | "merchant_settlement_pending"
  | "merchant_settlement_completed"
  | "refund"
  | "chargeback"
  | "tax_liability"
  | "reconciliation_exception";

export type CommercialRevenueStream =
  | "enterprise_saas_subscription"
  | "contractor_job_posting_fee"
  | "premium_analytics_tier"
  | "partner_api_access"
  | "worker_wage_transfer"; // ONLY FOR FLOW TRACKING: Commission MUST BE 0.00

export interface CommercialTransactionInput {
  transactionId?: string;
  stream: CommercialRevenueStream;
  tenantId: string;
  description: string;
  grossAmount: number; // In INR
  isSimulated?: boolean;
  gatewayProvider?: string;
  gatewayReference?: string;
  merchantBankReference?: string;
  gstRate?: number; // 0.18 for B2B SaaS, 0.00 for worker wages
}

export interface CommercialTransactionRecord {
  id: string;
  stream: CommercialRevenueStream;
  tenantId: string;
  description: string;
  grossAmount: number;
  netBaseAmount: number;
  taxAmount: number; // GST
  platformCommissionRate: number; // MUST BE 0.00 if stream === "worker_wage_transfer"
  platformCommissionAmount: number; // MUST BE 0.00 if stream === "worker_wage_transfer"
  state: SettlementState;
  isSimulated: boolean;
  gatewayProvider: string | null;
  gatewayReference: string | null;
  merchantBankReference: string | null;
  settlementTimestamp: string | null;
  reconciliationNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SettlementLedgerSummary {
  totalGrossRecorded: number;
  totalSimulatedTestLedger: number;
  totalGatewayConfirmed: number;
  totalBankSettledRealized: number;
  totalPendingSettlement: number;
  totalTaxLiabilityGst: number;
  totalWorkerWageTransferred: number;
  totalWorkerCommissionDeducted: number; // MUST BE EXACTLY 0.00
  settlementRealizationRatio: number; // Realized bank / (Realized + Pending)
}

/**
 * Builds a commercial transaction record enforcing 0% worker commission and GST segregation.
 */
export function buildCommercialTransaction(input: CommercialTransactionInput): CommercialTransactionRecord {
  const now = new Date().toISOString();
  const id = input.transactionId || "tx-" + crypto.randomUUID().slice(0, 12);
  const isWorkerWage = input.stream === "worker_wage_transfer";

  // Constitutional Invariant
  const commissionRate = isWorkerWage ? 0.0 : 0.0; // Worker wage commission is strictly 0%
  const commissionAmount = 0.0;

  // Tax calculation: Worker wages have 0% GST, B2B SaaS services typically have 18% GST
  const gstRate = isWorkerWage ? 0.0 : (input.gstRate ?? 0.18);
  const netBaseAmount = Math.round((input.grossAmount / (1 + gstRate)) * 100) / 100;
  const taxAmount = Math.round((input.grossAmount - netBaseAmount) * 100) / 100;

  const initialState: SettlementState = input.isSimulated
    ? "test_ledger"
    : input.gatewayReference
    ? "payment_gateway_confirmed"
    : "invoice_generated";

  return {
    id,
    stream: input.stream,
    tenantId: input.tenantId,
    description: input.description,
    grossAmount: input.grossAmount,
    netBaseAmount,
    taxAmount,
    platformCommissionRate: commissionRate,
    platformCommissionAmount: commissionAmount,
    state: initialState,
    isSimulated: input.isSimulated ?? false,
    gatewayProvider: input.gatewayProvider || null,
    gatewayReference: input.gatewayReference || null,
    merchantBankReference: input.merchantBankReference || null,
    settlementTimestamp: null,
    reconciliationNotes: input.isSimulated ? "SIMULATED_TEST_LEDGER_DO_NOT_RECOGNIZE_AS_CASH" : null,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Transitions settlement state with strict validation of bank clearing.
 * Invariant: Cannot move to 'merchant_settlement_completed' without a verified merchantBankReference.
 */
export function transitionSettlementState(params: {
  transaction: CommercialTransactionRecord;
  targetState: SettlementState;
  merchantBankReference?: string;
  notes?: string;
}): { allowed: boolean; updatedTransaction: CommercialTransactionRecord; reason?: string } {
  const allowedTransitions: Record<SettlementState, SettlementState[]> = {
    test_ledger: ["invoice_generated"],
    invoice_generated: ["payment_initiated", "reconciliation_exception"],
    payment_initiated: ["payment_gateway_confirmed", "reconciliation_exception"],
    payment_gateway_confirmed: ["merchant_settlement_pending", "refund", "chargeback", "reconciliation_exception"],
    merchant_settlement_pending: ["merchant_settlement_completed", "reconciliation_exception"],
    merchant_settlement_completed: ["tax_liability", "refund", "chargeback"],
    refund: [],
    chargeback: [],
    tax_liability: [],
    reconciliation_exception: ["payment_initiated", "merchant_settlement_pending", "refund"],
  };

  const allowed = allowedTransitions[params.transaction.state]?.includes(params.targetState);
  if (!allowed) {
    return {
      allowed: false,
      updatedTransaction: params.transaction,
      reason: `Illegal settlement transition from '${params.transaction.state}' to '${params.targetState}'.`,
    };
  }

  // Strict bank clearing requirement
  if (params.targetState === "merchant_settlement_completed") {
    const bankRef = params.merchantBankReference || params.transaction.merchantBankReference;
    if (!bankRef) {
      return {
        allowed: false,
        updatedTransaction: params.transaction,
        reason: "Cannot complete settlement without authentic merchant bank clearing reference (UTR / NEFT).",
      };
    }
  }

  const now = new Date().toISOString();
  const updated: CommercialTransactionRecord = {
    ...params.transaction,
    state: params.targetState,
    merchantBankReference: params.merchantBankReference || params.transaction.merchantBankReference,
    settlementTimestamp: params.targetState === "merchant_settlement_completed" ? now : params.transaction.settlementTimestamp,
    reconciliationNotes: params.notes || params.transaction.reconciliationNotes,
    updatedAt: now,
  };

  return {
    allowed: true,
    updatedTransaction: updated,
  };
}

/**
 * Reconciles the commercial settlement ledger.
 * Strictly separates simulated test transactions, pending gateway transactions, and cleared bank funds.
 */
export function reconcileSettlementLedger(transactions: CommercialTransactionRecord[]): SettlementLedgerSummary {
  let totalGross = 0;
  let totalSimulated = 0;
  let totalGatewayConfirmed = 0;
  let totalBankSettled = 0;
  let totalPending = 0;
  let totalTax = 0;
  let totalWorkerWage = 0;
  let totalWorkerCommission = 0;

  for (const tx of transactions) {
    totalGross += tx.grossAmount;

    if (tx.stream === "worker_wage_transfer") {
      totalWorkerWage += tx.grossAmount;
      totalWorkerCommission += tx.platformCommissionAmount; // Must be 0
    }

    if (tx.isSimulated || tx.state === "test_ledger") {
      totalSimulated += tx.grossAmount;
      continue; // Simulated funds are not part of commercial realization
    }

    if (tx.state === "payment_gateway_confirmed") {
      totalGatewayConfirmed += tx.grossAmount;
    }

    if (tx.state === "merchant_settlement_pending") {
      totalPending += tx.grossAmount;
    }

    if (tx.state === "merchant_settlement_completed" || tx.state === "tax_liability") {
      totalBankSettled += tx.grossAmount;
      totalTax += tx.taxAmount;
    }
  }

  const combinedRealizedAndPending = totalBankSettled + totalPending;
  const settlementRealizationRatio =
    combinedRealizedAndPending > 0
      ? Math.round((totalBankSettled / combinedRealizedAndPending) * 1000) / 10
      : 0.0;

  return {
    totalGrossRecorded: Math.round(totalGross * 100) / 100,
    totalSimulatedTestLedger: Math.round(totalSimulated * 100) / 100,
    totalGatewayConfirmed: Math.round(totalGatewayConfirmed * 100) / 100,
    totalBankSettledRealized: Math.round(totalBankSettled * 100) / 100,
    totalPendingSettlement: Math.round(totalPending * 100) / 100,
    totalTaxLiabilityGst: Math.round(totalTax * 100) / 100,
    totalWorkerWageTransferred: Math.round(totalWorkerWage * 100) / 100,
    totalWorkerCommissionDeducted: Math.round(totalWorkerCommission * 100) / 100, // Always 0.00
    settlementRealizationRatio,
  };
}
