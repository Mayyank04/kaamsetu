import { NextRequest, NextResponse } from "next/server";
import { approvedProfileSubmissionSchema } from "@/schemas/onboarding.schema";
import { handleApiError, createSuccessResponse } from "@/lib/errors";
import { requireAuthenticatedUser } from "@/lib/auth/server";
import { GeographicAuthorizationService } from "@/lib/geo/geographic-authorization-service";
import { OnboardingService } from "@/server/services/onboarding.service";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthenticatedUser();
    const json = await request.json();
    const data = approvedProfileSubmissionSchema.parse(json);

    // 1. Strict Geographic Authorization Check (Class B Controlled Rollout)
    const geoValidation = GeographicAuthorizationService.validateLocation({
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      latitude: data.latitude,
      longitude: data.longitude,
    });

    if (!geoValidation.allowed && !data.allowNonDispatchProfile) {
      return NextResponse.json(
        {
          error: geoValidation.reason || "Location outside authorized operating zone.",
          status: geoValidation.status,
          district: geoValidation.district,
        },
        { status: 403 }
      );
    }

    // 2. Delegate to Domain Onboarding Service
    const savedRecord = await OnboardingService.saveProfile(user, data);

    const message = !geoValidation.isDispatchEligible
      ? "Non-dispatch digital craft credential created successfully. Customer bookings are disabled for this location."
      : "Professional profile successfully created and saved.";

    return createSuccessResponse(savedRecord, {
      message,
      registryId: savedRecord.registryId,
      slug: savedRecord.slug,
      isDemo: user.isDemo,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
