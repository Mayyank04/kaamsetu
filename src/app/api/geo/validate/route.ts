import { NextRequest, NextResponse } from "next/server";
import { GeographicAuthorizationService } from "@/lib/geo/geographic-authorization-service";
import { createSuccessResponse, handleApiError } from "@/lib/error/handler";

export const dynamic = "force-dynamic";

/**
 * POST /api/geo/validate
 * Validates a location payload and returns the decoupled capability matrix.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { city, state, district, pincode, latitude, longitude } = body;

    const validation = GeographicAuthorizationService.validateLocation({
      city: city || "",
      state: state || "",
      district: district || undefined,
      pincode: pincode || undefined,
      latitude: typeof latitude === "number" ? latitude : undefined,
      longitude: typeof longitude === "number" ? longitude : undefined,
    });

    return createSuccessResponse(validation, {
      nationwide_permitted: validation.allowedForRegistration,
      dispatch_authorized: validation.isDispatchEligible,
      operating_classification: "CLASS_B_CONTROLLED_ROLLOUT",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
