import { NextRequest } from "next/server";
import { requireContractor } from "@/lib/auth/server";
import { getContractorOrganization } from "@/lib/supabase/db/contractors";
import { getOrganizationBillingHistory } from "@/lib/billing/payment-service";
import { handleApiError, createSuccessResponse } from "@/lib/error/handler";

export async function GET(request: NextRequest) {
  try {
    const user = await requireContractor();
    const org = await getContractorOrganization(user.id);
    if (!org) {
      return createSuccessResponse([]);
    }

    const history = await getOrganizationBillingHistory(org.id);
    return createSuccessResponse(history);
  } catch (error) {
    return handleApiError(error);
  }
}
