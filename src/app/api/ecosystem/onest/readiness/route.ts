import { requireAdmin } from "@/lib/auth/server";
import { handleApiError } from "@/lib/error/handler";
import { NextRequest, NextResponse } from "next/server";
import {
  buildOnestProviderProfile,
  validateOnestOpportunity,
  protectWorkerClaimsFromOnestMutation,
  OnestOpportunitySyncRequest,
} from "@/lib/ecosystem/onest/onest-live-service";

export async function GET() {
  try { await requireAdmin(); } catch (authError) { return handleApiError(authError); }
  try {
    const profile = buildOnestProviderProfile();
    return NextResponse.json({
      success: true,
      provider: profile,
      sovereignImmutabilityEnforced: true,
      zeroCommissionEnforced: true,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to retrieve ONest provider readiness" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try { await requireAdmin(); } catch (authError) { return handleApiError(authError); }
  try {
    const body = await req.json();

    // Check if this is an opportunity validation or mutation protection test
    if (body.type === "mutation_check") {
      const { originalProfile, proposedMutation } = body;
      const result = protectWorkerClaimsFromOnestMutation(originalProfile, proposedMutation);
      return NextResponse.json({
        success: true,
        mutationBlocked: result.isViolation,
        violationFields: result.violationFields,
        protectedProfile: result.protectedProfile,
      });
    }

    // Default: opportunity validation
    const opportunityReq: OnestOpportunitySyncRequest = body.opportunity || body;
    const validation = validateOnestOpportunity(opportunityReq);

    if (!validation.isValid) {
      return NextResponse.json(
        { error: "Opportunity validation failed", reason: validation.reason },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      normalizedOpportunityId: validation.normalizedOpportunityId,
      statutoryWageCompliant: true,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to process ONest request" },
      { status: 500 }
    );
  }
}
