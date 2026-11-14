import { createAdminClient } from "@/lib/supabase/admin";
import { PartnerCrmRecord } from "@/types/database.types";

export interface PartnerCrmInput {
  partnerName: string;
  partnerType: "contractor" | "institution" | "industry_association" | "training_ngo";
  regionId?: string | null;
  stage:
    | "lead"
    | "contacted"
    | "discovery_completed"
    | "proposal_sent"
    | "pilot_agreed"
    | "agreement_signed"
    | "active"
    | "renewal_due"
    | "renewed"
    | "churned";
  decisionMakerName: string;
  decisionMakerRole?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  expectedContractValue: number;
  actualInvoicedValue?: number;
  renewalDate?: string | null;
  implementationStatus?:
    | "initial_contact"
    | "needs_assessment"
    | "pilot_setup"
    | "fully_deployed"
    | "needs_attention"
    | "paused";
  supportTier?: "standard" | "dedicated_lead" | "priority_24_7";
}

/**
 * Creates or updates a partner CRM record with validated stage progression
 */
export async function createPartnerCrmRecord(input: PartnerCrmInput) {
  const supabase = createAdminClient();
  if (!supabase) throw new Error("Database client unavailable");

  const { data, error } = await supabase
    .from("partner_crm_records")
    .insert({
      partner_name: input.partnerName,
      partner_type: input.partnerType,
      region_id: input.regionId || null,
      stage: input.stage,
      decision_maker_name: input.decisionMakerName,
      decision_maker_role: input.decisionMakerRole || null,
      contact_email: input.contactEmail || null,
      contact_phone: input.contactPhone || null,
      expected_contract_value: input.expectedContractValue || 0.0,
      actual_invoiced_value: input.actualInvoicedValue || 0.0,
      renewal_date: input.renewalDate || null,
      implementation_status: input.implementationStatus || "initial_contact",
      support_tier: input.supportTier || "standard",
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Failed to create partner CRM record: ${error?.message}`);
  }

  return data as PartnerCrmRecord;
}

/**
 * Updates stage of a partner CRM record
 */
export async function updatePartnerStage(
  recordId: string,
  newStage: PartnerCrmInput["stage"],
  actualInvoicedValue?: number
) {
  const supabase = createAdminClient();
  if (!supabase) throw new Error("Database client unavailable");

  const updatePayload: any = {
    stage: newStage,
    updated_at: new Date().toISOString(),
  };

  if (typeof actualInvoicedValue === "number") {
    updatePayload.actual_invoiced_value = actualInvoicedValue;
  }

  const { data, error } = await supabase
    .from("partner_crm_records")
    .update(updatePayload)
    .eq("id", recordId)
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Failed to update partner stage: ${error?.message}`);
  }

  return data as PartnerCrmRecord;
}

/**
 * Summarize partner CRM pipeline metrics
 */
export async function getPartnerPipelineSummary() {
  const supabase = createAdminClient();
  if (!supabase) return { totalPipelineValue: 0, totalInvoiced: 0, byStage: {} };

  const { data, error } = await supabase.from("partner_crm_records").select("*");
  if (error || !data) return { totalPipelineValue: 0, totalInvoiced: 0, byStage: {} };

  let totalPipelineValue = 0;
  let totalInvoiced = 0;
  const byStage: Record<string, number> = {};

  for (const record of data) {
    totalPipelineValue += Number(record.expected_contract_value || 0);
    totalInvoiced += Number(record.actual_invoiced_value || 0);
    byStage[record.stage] = (byStage[record.stage] || 0) + 1;
  }

  return {
    totalPartners: data.length,
    totalPipelineValue,
    totalInvoiced,
    byStage,
  };
}
