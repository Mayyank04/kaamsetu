import { createAdminClient } from "@/lib/supabase/admin";
import { isConfigured } from "@/lib/env";

export interface GstInvoiceInput {
  organizationId: string;
  regionId?: string | null;
  taxableAmount: number;
  contractorStateCode: string;
  platformStateCode?: string; // Default Assam (18)
}

export interface GstTaxBreakdown {
  invoiceNumber: string;
  taxableAmount: number;
  gstRate: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalTaxAmount: number;
  grandTotal: number;
  isInterstate: boolean;
  stateCode: string;
}

/**
 * Computes compliant 18% GST breakdown (CGST+SGST for intra-state, IGST for inter-state)
 */
export function calculateGstInvoice(input: GstInvoiceInput): GstTaxBreakdown {
  const platformState = input.platformStateCode || "18"; // Assam state code: 18
  const isInterstate = input.contractorStateCode !== platformState;

  const taxable = Number(input.taxableAmount.toFixed(2));
  const gstRate = 18.0;
  const totalTax = Number(((taxable * gstRate) / 100).toFixed(2));
  const grandTotal = Number((taxable + totalTax).toFixed(2));

  let cgst = 0;
  let sgst = 0;
  let igst = 0;

  if (isInterstate) {
    igst = totalTax;
  } else {
    cgst = Number((totalTax / 2).toFixed(2));
    sgst = Number((totalTax - cgst).toFixed(2));
  }

  const invoiceNumber = `KST-INV-${Date.now().toString().slice(-8)}-${Math.floor(Math.random() * 1000)}`;

  return {
    invoiceNumber,
    taxableAmount: taxable,
    gstRate,
    cgstAmount: cgst,
    sgstAmount: sgst,
    igstAmount: igst,
    totalTaxAmount: totalTax,
    grandTotal,
    isInterstate,
    stateCode: input.contractorStateCode,
  };
}

/**
 * Records a reconciled GST invoice in the financial ledger
 */
export async function recordGstInvoice(input: GstInvoiceInput) {
  const breakdown = calculateGstInvoice(input);

  if (!isConfigured.supabase) {
    return {
      id: crypto.randomUUID(),
      invoice_number: breakdown.invoiceNumber,
      organization_id: input.organizationId,
      region_id: input.regionId || null,
      taxable_amount: breakdown.taxableAmount,
      gst_rate: breakdown.gstRate,
      cgst_amount: breakdown.cgstAmount,
      sgst_amount: breakdown.sgstAmount,
      igst_amount: breakdown.igstAmount,
      total_tax_amount: breakdown.totalTaxAmount,
      grand_total: breakdown.grandTotal,
      state_code: breakdown.stateCode,
      is_interstate: breakdown.isInterstate,
      payment_date: new Date().toISOString(),
      reconciliation_status: "reconciled" as const,
      created_at: new Date().toISOString(),
    };
  }

  const supabase = createAdminClient();
  if (!supabase) throw new Error("Database client unavailable");

  const { data, error } = await supabase
    .from("financial_gst_ledger")
    .insert({
      invoice_number: breakdown.invoiceNumber,
      organization_id: input.organizationId,
      region_id: input.regionId || null,
      taxable_amount: breakdown.taxableAmount,
      gst_rate: breakdown.gstRate,
      cgst_amount: breakdown.cgstAmount,
      sgst_amount: breakdown.sgstAmount,
      igst_amount: breakdown.igstAmount,
      total_tax_amount: breakdown.totalTaxAmount,
      grand_total: breakdown.grandTotal,
      state_code: breakdown.stateCode,
      is_interstate: breakdown.isInterstate,
      reconciliation_status: "reconciled",
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to record GST invoice: ${error.message}`);
  }

  return data;
}

/**
 * Computes verifiable SaaS revenue metrics ensuring ARR never conflates one-time payments
 */
export function computeFinancialSaaSMetrics(subscriptions: {
  monthlyRecurringBase: number;
  oneTimePilotFees?: number;
  activeContractorCount: number;
}) {
  const mrr = subscriptions.monthlyRecurringBase;
  const arr = mrr * 12; // Strictly recurring MRR * 12
  const grossCollections = mrr + (subscriptions.oneTimePilotFees || 0);
  const gstCollected = Number(((grossCollections * 18) / 100).toFixed(2));
  const netRevenue = grossCollections;

  return {
    mrr,
    arr,
    grossCollections,
    gstCollected,
    netRevenue,
    activeContractorCount: subscriptions.activeContractorCount,
    commissionTakeRateOnWorkers: 0.0, // Constitutional invariant: 0.00%
  };
}
