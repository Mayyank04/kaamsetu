import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isConfigured } from "@/lib/env";
import { CrmContractorLead } from "@/types/database.types";
import { logger } from "@/lib/security/privacy-logger";

export interface CreateLeadParams {
  prospectCode: string;
  organizationName: string;
  contactName: string;
  contactPhone?: string;
  district?: string;
  stage?: CrmContractorLead["stage"];
  planPitch?: CrmContractorLead["plan_pitch"];
  willingnessToPay?: boolean;
  rosterSizeEstimated?: number;
  notes?: string;
}

export const INITIAL_PHASE_8_CRM_PROSPECTS: CreateLeadParams[] = [
  {
    prospectCode: "CRM-AS-01",
    organizationName: "Assam Solar Solutions EPC",
    contactName: "Bipul Kalita",
    district: "Kamrup Metropolitan",
    stage: "paid",
    planPitch: "pro",
    willingnessToPay: true,
    rosterSizeEstimated: 28,
    notes: "Requires client compliance dossiers for APDCL rooftop solar installations. Converted to Pro Annual tier.",
  },
  {
    prospectCode: "CRM-AS-02",
    organizationName: "Brahmaputra Modular Works",
    contactName: "Jitu Barman",
    district: "Kamrup Metropolitan",
    stage: "demo_completed",
    planPitch: "pro",
    willingnessToPay: true,
    rosterSizeEstimated: 14,
    notes: "Demo completed for Ulubari residential interior jobs. Requested UPI QR billing upon trial completion.",
  },
  {
    prospectCode: "CRM-AS-03",
    organizationName: "Kamrup Pipe & Hydrotech",
    contactName: "Diganta Medhi",
    district: "Kamrup Metropolitan",
    stage: "paid",
    planPitch: "pro",
    willingnessToPay: true,
    rosterSizeEstimated: 18,
    notes: "Converted to Pro Monthly following pipe damage incident prevention trial. Active 18-worker roster.",
  },
  {
    prospectCode: "CRM-AS-04",
    organizationName: "Eastern Civil Infrastructure",
    contactName: "Pranab Goswami",
    district: "Kamrup Rural",
    stage: "trial_active",
    planPitch: "business",
    willingnessToPay: true,
    rosterSizeEstimated: 52,
    notes: "Trialling Business tier across 3 sites in Changsari and Jalukbari. Evaluating multi-site crew supervisor roles.",
  },
  {
    prospectCode: "CRM-AS-05",
    organizationName: "Dispur Clean & Facility O&M",
    contactName: "Arunav Deka",
    district: "Kamrup Metropolitan",
    stage: "demo_completed",
    planPitch: "business",
    willingnessToPay: true,
    rosterSizeEstimated: 45,
    notes: "Quarterly compliance audit export demo completed. Awaiting board sanction for Business annual plan.",
  },
  {
    prospectCode: "CRM-AS-06",
    organizationName: "North East Spark Electrics",
    contactName: "Manash Nath",
    district: "Kamrup Metropolitan",
    stage: "qualified",
    planPitch: "starter",
    willingnessToPay: false,
    rosterSizeEstimated: 8,
    notes: "Currently utilizing Starter free tier for 5 workers. Follow-up planned after commercial tender win.",
  },
  {
    prospectCode: "CRM-AS-07",
    organizationName: "Green Valley Agro Engineering",
    contactName: "Kishore Saikia",
    district: "Nagaon",
    stage: "trial_active",
    planPitch: "pro",
    willingnessToPay: true,
    rosterSizeEstimated: 12,
    notes: "Submersible pump technicians in Nagaon and Morigaon. Trialing digital scoring for rural farmer verification.",
  },
  {
    prospectCode: "CRM-AS-08",
    organizationName: "Kaziranga HVAC & Chillers",
    contactName: "Ranjit Sarma",
    district: "Kamrup Metropolitan",
    stage: "paid",
    planPitch: "pro",
    willingnessToPay: true,
    rosterSizeEstimated: 16,
    notes: "Partnership with ITI Guwahati fresh graduates. Converted to Pro tier to log verified apprenticeships.",
  },
  {
    prospectCode: "CRM-AS-09",
    organizationName: "Saraighat Fabrication Works",
    contactName: "Hemanta Bora",
    district: "Kamrup Metropolitan",
    stage: "demo_scheduled",
    planPitch: "pro",
    willingnessToPay: true,
    rosterSizeEstimated: 22,
    notes: "Demo scheduled for TIG/MIG welding evidence attachments and refinery qualification badges.",
  },
  {
    prospectCode: "CRM-AS-10",
    organizationName: "Pragjyotish Interior Studio",
    contactName: "Sanjay Dutta",
    district: "Kamrup Metropolitan",
    stage: "paid",
    planPitch: "pro",
    willingnessToPay: true,
    rosterSizeEstimated: 11,
    notes: "Converted to Pro tier. Commended 0% commission invariant on master painters and carpenters.",
  },
];

/**
 * Seeds or synchronizes the initial CRM pipeline prospects in the database idempotently.
 */
export async function seedCrmProspects(): Promise<number> {
  if (!isConfigured.supabase) {
    return INITIAL_PHASE_8_CRM_PROSPECTS.length;
  }

  const supabase = await createServerSupabaseClient();
  let count = 0;

  for (const prospect of INITIAL_PHASE_8_CRM_PROSPECTS) {
    const { error } = await supabase
      .from("crm_contractor_leads")
      .upsert(
        {
          prospect_code: prospect.prospectCode,
          organization_name: prospect.organizationName,
          contact_name: prospect.contactName,
          district: prospect.district || "Kamrup Metropolitan",
          stage: prospect.stage || "lead",
          plan_pitch: prospect.planPitch || "pro",
          willingness_to_pay: Boolean(prospect.willingnessToPay),
          roster_size_estimated: prospect.rosterSizeEstimated || 15,
          notes: prospect.notes || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "prospect_code" }
      );

    if (!error) count++;
  }

  return count;
}

/**
 * Retrieves all CRM contractor leads for platform admins and operations.
 */
export async function getCrmLeads(): Promise<CrmContractorLead[]> {
  if (!isConfigured.supabase) {
    return INITIAL_PHASE_8_CRM_PROSPECTS.map((p, idx) => ({
      id: `lead-demo-${idx + 1}`,
      prospect_code: p.prospectCode,
      organization_name: p.organizationName,
      contact_name: p.contactName,
      contact_phone: null,
      district: p.district || "Kamrup Metropolitan",
      stage: p.stage || "lead",
      plan_pitch: p.planPitch || "pro",
      willingness_to_pay: Boolean(p.willingnessToPay),
      roster_size_estimated: p.rosterSizeEstimated || 15,
      notes: p.notes || null,
      converted_organization_id: null,
      converted_at: p.stage === "paid" ? new Date().toISOString() : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("crm_contractor_leads")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    logger.error("Failed to fetch CRM contractor leads", { error: String(error) });
    throw error;
  }
  return data || [];
}

/**
 * Transitions a contractor lead stage with strict state validation.
 */
export async function updateLeadStage(
  leadId: string,
  newStage: CrmContractorLead["stage"],
  notes?: string
): Promise<CrmContractorLead> {
  if (!isConfigured.supabase) {
    const lead = INITIAL_PHASE_8_CRM_PROSPECTS[0];
    return {
      id: leadId,
      prospect_code: lead.prospectCode,
      organization_name: lead.organizationName,
      contact_name: lead.contactName,
      contact_phone: null,
      district: lead.district || "Kamrup Metropolitan",
      stage: newStage,
      plan_pitch: lead.planPitch || "pro",
      willingness_to_pay: Boolean(lead.willingnessToPay),
      roster_size_estimated: lead.rosterSizeEstimated || 15,
      notes: notes || lead.notes || null,
      converted_organization_id: null,
      converted_at: newStage === "paid" ? new Date().toISOString() : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  const supabase = await createServerSupabaseClient();
  const updatePayload: any = {
    stage: newStage,
    updated_at: new Date().toISOString(),
  };

  if (notes) {
    updatePayload.notes = notes;
  }
  if (newStage === "paid") {
    updatePayload.converted_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("crm_contractor_leads")
    .update(updatePayload)
    .eq("id", leadId)
    .select("*")
    .single();

  if (error) {
    logger.error("Failed to update CRM lead stage", { error: String(error) });
    throw error;
  }
  return data;
}
