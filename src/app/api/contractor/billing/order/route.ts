import { NextRequest } from "next/server";
import { requireContractor } from "@/lib/auth/server";
import { getContractorOrganization } from "@/lib/supabase/db/contractors";
import { createSubscriptionOrder } from "@/lib/billing/payment-service";
import { SubscriptionTier, BillingCycle } from "@/lib/config/pricing-plans";
import { handleApiError, createSuccessResponse } from "@/lib/error/handler";

export async function POST(request: NextRequest) {
  try {
    const user = await requireContractor();
    const org = await getContractorOrganization(user.id);
    if (!org) {
      return handleApiError(new Error("Contractor organization not found."));
    }

    const body = await request.json();
    const { tier, cycle, customerConsentAgreed } = body as {
      tier: SubscriptionTier;
      cycle?: BillingCycle;
      customerConsentAgreed?: boolean;
    };

    if (!tier || !["starter", "pro", "business"].includes(tier)) {
      return handleApiError(new Error("Invalid subscription plan tier."));
    }

    if (!customerConsentAgreed) {
      return handleApiError(
        new Error("Explicit customer agreement to subscription billing and renewal terms is required.")
      );
    }

    const { order, breakdown } = await createSubscriptionOrder({
      organizationId: org.id,
      tier,
      cycle: cycle || "monthly",
      customerConsentAgreed: true,
    });

    return createSuccessResponse(
      { order, breakdown },
      { message: "Subscription billing order generated successfully." }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
