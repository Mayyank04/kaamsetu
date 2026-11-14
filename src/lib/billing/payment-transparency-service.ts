import { createAdminClient } from "@/lib/supabase/admin";
import { isConfigured } from "@/lib/env";

export interface RecordPaymentSettlementInput {
  bookingId?: string | null;
  opportunityId?: string | null;
  workerProfileId: string;
  employerDeclaredAmount: number;
  workerAgreedAmount: number;
  amountInvoiced: number;
  amountPaid: number;
  platformCommissionAmount?: number;
  paymentDate?: string;
  paymentEvidenceRef?: string | null;
}

/**
 * Records a transparent payment settlement.
 * CONSTITUTIONAL INVARIANT: platform_commission_amount MUST BE EXACTLY 0.00.
 * Any non-zero take-rate on worker earnings strictly fails closed with an error.
 */
export async function recordPaymentSettlement(input: RecordPaymentSettlementInput) {
  // Enforce constitutional 0% take-rate invariant
  if (input.platformCommissionAmount !== undefined && input.platformCommissionAmount !== 0) {
    throw new Error(
      "CONSTITUTIONAL SECURITY VIOLATION: KAAMSETU platform take-rate is strictly 0.00%. No wage deductions permitted."
    );
  }

  if (input.amountInvoiced <= 0) {
    throw new Error("amountInvoiced must be a positive number");
  }

  if (!isConfigured.supabase) {
    return {
      id: crypto.randomUUID(),
      booking_id: input.bookingId || null,
      opportunity_id: input.opportunityId || null,
      worker_profile_id: input.workerProfileId,
      employer_declared_amount: input.employerDeclaredAmount,
      worker_agreed_amount: input.workerAgreedAmount,
      amount_invoiced: input.amountInvoiced,
      amount_paid: input.amountPaid,
      platform_commission_amount: 0.00,
      payment_date: input.paymentDate || new Date().toISOString(),
      payment_evidence_ref: input.paymentEvidenceRef || null,
      disputed_amount: 0.00,
      resolution_status: "settled",
      created_at: new Date().toISOString(),
    };
  }

  const supabase = createAdminClient();
  if (!supabase) throw new Error("Database client unavailable");

  const { data, error } = await supabase
    .from("payment_records_ledger")
    .insert({
      booking_id: input.bookingId || null,
      opportunity_id: input.opportunityId || null,
      worker_profile_id: input.workerProfileId,
      employer_declared_amount: input.employerDeclaredAmount,
      worker_agreed_amount: input.workerAgreedAmount,
      amount_invoiced: input.amountInvoiced,
      amount_paid: input.amountPaid,
      platform_commission_amount: 0.00,
      payment_date: input.paymentDate || new Date().toISOString(),
      payment_evidence_ref: input.paymentEvidenceRef || null,
      disputed_amount: 0.00,
      resolution_status: "settled",
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to record payment settlement: ${error.message}`);
  }

  return data;
}

/**
 * Retrieves payment records with complete provenance for a worker
 */
export async function getWorkerPaymentHistory(workerProfileId: string) {
  if (!isConfigured.supabase) {
    return [];
  }

  const supabase = createAdminClient();
  if (!supabase) throw new Error("Database client unavailable");

  const { data, error } = await supabase
    .from("payment_records_ledger")
    .select("*")
    .eq("worker_profile_id", workerProfileId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch payment records: ${error.message}`);
  }

  return data || [];
}

/**
 * Flags a payment record as disputed
 */
export async function flagPaymentDiscrepancy(
  paymentRecordId: string,
  disputedAmount: number,
  disputeReason: string
) {
  if (!isConfigured.supabase) {
    return {
      id: paymentRecordId,
      disputed_amount: disputedAmount,
      resolution_status: "disputed",
    };
  }

  const supabase = createAdminClient();
  if (!supabase) throw new Error("Database client unavailable");

  const { data, error } = await supabase
    .from("payment_records_ledger")
    .update({
      disputed_amount: disputedAmount,
      resolution_status: "disputed",
    })
    .eq("id", paymentRecordId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to flag payment discrepancy: ${error.message}`);
  }

  return data;
}
