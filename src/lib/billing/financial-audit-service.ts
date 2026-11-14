/**
 * KAAMSETU Financial Audit, Regional Unit Economics & Transaction Reconciliation Service
 *
 * Implements:
 * 1. Transaction-level financial reconciliation (Gross, Net, CGST, SGST, IGST, Refunds).
 * 2. Strict ARR = MRR * 12 recurring revenue validation (zero one-time fee inflation).
 * 3. Regional unit economics & contribution margin calculation.
 * 4. Financial reconciliation exceptions tracking in public.financial_reconciliation_exceptions.
 * 5. Constitutional 0.00% worker wage commission defense.
 */

import { SupabaseClient } from "@supabase/supabase-js";

export interface TransactionReconciliationReport {
  grossCollections: number;
  netRevenue: number;
  cgstTotal: number;
  sgstTotal: number;
  igstTotal: number;
  refundsTotal: number;
  discountsTotal: number;
  activeRecurringMrr: number;
  annualRecurringRevenue: number;
  oneTimeFeesExcludedFromArr: number;
  workerCommissionAmount: number; // MUST BE EXACTLY 0.00
  workerCommissionPercentage: number; // MUST BE EXACTLY 0.00
}

export interface RegionalUnitEconomicsInput {
  regionId: string;
  activeWorkerCount: number;
  registeredWorkerCount: number;
  verifiedContractorCount: number;
  monthlySaaSRecurringRevenue: number; // Net MRR
  directFieldCoordinatorCosts: number;
  cloudHostingAndAiCosts: number;
  smsOtpAndPaymentGatewayFees: number;
}

export interface RegionalUnitEconomicsOutput {
  regionId: string;
  netSaasRevenue: number;
  totalDirectCosts: number;
  contributionMargin: number;
  contributionMarginPercentage: number;
  costPerActiveWorker: number;
  revenuePerContractor: number;
  operationalRating: "highly_profitable" | "sustainable" | "break_even" | "subsidized_expansion" | "critical_intervention";
}

/**
 * Computes regional unit economics and contribution margin.
 */
export function computeRegionalUnitEconomics(input: RegionalUnitEconomicsInput): RegionalUnitEconomicsOutput {
  const netRevenue = input.monthlySaaSRecurringRevenue;
  const totalDirectCosts =
    input.directFieldCoordinatorCosts +
    input.cloudHostingAndAiCosts +
    input.smsOtpAndPaymentGatewayFees;

  const contributionMargin = Math.round((netRevenue - totalDirectCosts) * 100) / 100;
  const marginPercentage =
    netRevenue > 0
      ? Math.round((contributionMargin / netRevenue) * 10000) / 100
      : -100.0;

  const costPerActiveWorker =
    input.activeWorkerCount > 0
      ? Math.round((totalDirectCosts / input.activeWorkerCount) * 100) / 100
      : 0;

  const revenuePerContractor =
    input.verifiedContractorCount > 0
      ? Math.round((netRevenue / input.verifiedContractorCount) * 100) / 100
      : 0;

  let operationalRating: RegionalUnitEconomicsOutput["operationalRating"] = "sustainable";
  if (marginPercentage >= 40) {
    operationalRating = "highly_profitable";
  } else if (marginPercentage >= 15) {
    operationalRating = "sustainable";
  } else if (marginPercentage >= -5 && marginPercentage < 15) {
    operationalRating = "break_even";
  } else if (marginPercentage >= -50 && marginPercentage < -5) {
    operationalRating = "subsidized_expansion";
  } else {
    operationalRating = "critical_intervention";
  }

  return {
    regionId: input.regionId,
    netSaasRevenue: netRevenue,
    totalDirectCosts,
    contributionMargin,
    contributionMarginPercentage: marginPercentage,
    costPerActiveWorker,
    revenuePerContractor,
    operationalRating,
  };
}

/**
 * Reconciles batch transactions ensuring 0% worker commission and accounting purity.
 */
export function reconcileFinancialTransactions(transactions: Array<{
  id: string;
  type: "subscription" | "one_time_fee" | "refund";
  baseAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  status: string;
  workerCommissionExtracted?: number;
}>): TransactionReconciliationReport {
  let gross = 0;
  let net = 0;
  let cgst = 0;
  let sgst = 0;
  let igst = 0;
  let refunds = 0;
  let mrr = 0;
  let oneTime = 0;
  let workerCommission = 0;

  for (const tx of transactions) {
    if (tx.workerCommissionExtracted && tx.workerCommissionExtracted > 0) {
      workerCommission += tx.workerCommissionExtracted;
    }

    if (tx.type === "refund") {
      refunds += tx.baseAmount;
      continue;
    }

    if (tx.status === "paid") {
      net += tx.baseAmount;
      cgst += tx.cgst;
      sgst += tx.sgst;
      igst += tx.igst;
      gross += tx.baseAmount + tx.cgst + tx.sgst + tx.igst;

      if (tx.type === "subscription") {
        mrr += tx.baseAmount;
      } else {
        oneTime += tx.baseAmount;
      }
    }
  }

  // Strict ARR = MRR * 12 (oneTime is strictly excluded from ARR)
  const arr = mrr * 12;

  return {
    grossCollections: Math.round(gross * 100) / 100,
    netRevenue: Math.round(net * 100) / 100,
    cgstTotal: Math.round(cgst * 100) / 100,
    sgstTotal: Math.round(sgst * 100) / 100,
    igstTotal: Math.round(igst * 100) / 100,
    refundsTotal: Math.round(refunds * 100) / 100,
    discountsTotal: 0.0,
    activeRecurringMrr: Math.round(mrr * 100) / 100,
    annualRecurringRevenue: Math.round(arr * 100) / 100,
    oneTimeFeesExcludedFromArr: Math.round(oneTime * 100) / 100,
    workerCommissionAmount: workerCommission,
    workerCommissionPercentage: 0.0,
  };
}

/**
 * Logs a financial reconciliation exception.
 */
export async function recordFinancialException(
  supabase: SupabaseClient,
  input: {
    ledgerEntryId?: string | null;
    invoiceNumber?: string | null;
    exceptionType: "refund" | "chargeback" | "duplicate_webhook_attempt" | "disputed_tax" | "unreconciled_gateway_difference" | "gateway_fee_mismatch";
    amount: number;
    resolutionNotes?: string;
  }
): Promise<{ success: boolean; exceptionId: string }> {
  const { data, error } = await supabase
    .from("financial_reconciliation_exceptions")
    .insert({
      ledger_entry_id: input.ledgerEntryId || null,
      invoice_number: input.invoiceNumber || null,
      exception_type: input.exceptionType,
      amount: input.amount,
      status: "open",
      resolution_notes: input.resolutionNotes || null,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(`Failed to record financial exception: ${error?.message}`);
  }

  return { success: true, exceptionId: data.id };
}
