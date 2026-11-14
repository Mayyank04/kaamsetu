import { NextRequest } from "next/server";
import { requireContractor } from "@/lib/auth/server";
import {
  getContractorOrganization,
  updateContractorSubscription,
} from "@/lib/supabase/db/contractors";
import { CONTRACTOR_PLANS, SubscriptionTier } from "@/types/contractor";
import { handleApiError, createSuccessResponse } from "@/lib/error/handler";

export async function GET(request: NextRequest) {
  try {
    const user = await requireContractor();
    const org = await getContractorOrganization(user.id);

    return createSuccessResponse({
      currentTier: org?.subscription_tier || "starter",
      status: org?.subscription_status || "active",
      maxRosterWorkers: org?.max_roster_workers || 5,
      availablePlans: CONTRACTOR_PLANS,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireContractor();
    const org = await getContractorOrganization(user.id);
    if (!org) {
      return handleApiError(new Error("Contractor organization not found."));
    }

    const body = await request.json();
    const { tier } = body as { tier: SubscriptionTier };

    if (!tier || !["starter", "pro", "business"].includes(tier)) {
      return handleApiError(
        new Error("Invalid subscription tier. Choose from starter, pro, or business.")
      );
    }

    const updated = await updateContractorSubscription(org.id, tier);

    return createSuccessResponse(
      {
        organization: updated,
        plan: CONTRACTOR_PLANS[tier],
      },
      {
        message: `Subscription successfully upgraded to ${CONTRACTOR_PLANS[tier].name}. Roster capacity is now ${CONTRACTOR_PLANS[tier].maxRosterWorkers} workers.`,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
