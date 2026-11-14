import { NextRequest } from "next/server";
import { requireContractor } from "@/lib/auth/server";
import { getContractorOrganization } from "@/lib/supabase/db/contractors";
import { cancelContractorSubscription } from "@/lib/billing/payment-service";
import { handleApiError, createSuccessResponse } from "@/lib/error/handler";

export async function POST(request: NextRequest) {
  try {
    const user = await requireContractor();
    const org = await getContractorOrganization(user.id);
    if (!org) {
      return handleApiError(new Error("Contractor organization not found."));
    }

    const updated = await cancelContractorSubscription(org.id);

    return createSuccessResponse(updated, {
      message: "Subscription cancelled. Worker identity cards and credentials remain permanently free and active.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
