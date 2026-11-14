import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { handleApiError, createSuccessResponse } from "@/lib/error/handler";
import {
  createPartnerCrmRecord,
  getPartnerPipelineSummary,
} from "@/lib/crm/partner-service";

export async function GET() {
  try {
    await requireAdmin();
    const supabase = await createServerSupabaseClient();

    const { data: records, error } = await supabase
      .from("partner_crm_records")
      .select("*, operational_regions(*)")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const summary = await getPartnerPipelineSummary();

    return createSuccessResponse({
      summary,
      records: records || [],
    });
  } catch (err: any) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();

    const record = await createPartnerCrmRecord({
      partnerName: body.partnerName,
      partnerType: body.partnerType || "contractor",
      regionId: body.regionId || null,
      stage: body.stage || "lead",
      decisionMakerName: body.decisionMakerName,
      decisionMakerRole: body.decisionMakerRole,
      contactEmail: body.contactEmail,
      contactPhone: body.contactPhone,
      expectedContractValue: Number(body.expectedContractValue || 0),
      actualInvoicedValue: Number(body.actualInvoicedValue || 0),
      renewalDate: body.renewalDate || null,
      implementationStatus: body.implementationStatus || "initial_contact",
      supportTier: body.supportTier || "standard",
    });

    return createSuccessResponse({ record });
  } catch (err: any) {
    return handleApiError(err);
  }
}
