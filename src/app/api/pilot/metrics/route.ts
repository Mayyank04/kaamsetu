import { requireAdmin } from "@/lib/auth/server";
import { handleApiError } from "@/lib/error/handler";
import { NextRequest, NextResponse } from "next/server";
import { computePilotAggregateMetrics, getPilotParticipants } from "@/lib/pilot/registry";
import { createSuccessResponse } from "@/lib/error/handler";

export async function GET(request: NextRequest) {
  try { await requireAdmin(); } catch (authError) { return handleApiError(authError); }
  try {
    const aggregate = computePilotAggregateMetrics();
    const participants = getPilotParticipants();

    // Sanitize participants to ensure zero PII leakage
    const sanitizedParticipants = participants.map((p) => ({
      id: p.id,
      cohort: p.cohort,
      occupation: p.occupation,
      tradeCategory: p.tradeCategory,
      preferredLanguage: p.preferredLanguage,
      area: p.location.area,
      consentStatus: p.consent.status,
      allowsPublicListing: p.consent.allowsPublicListing,
      onboardingMode: p.onboarding.mode,
      onboardingStatus: p.onboarding.status,
      timeSpentSeconds: p.onboarding.timeSpentSeconds,
      assistanceLevel: p.onboarding.assistanceLevel,
      qrGenerated: p.credential.qrGenerated,
      qrScannedSuccessfully: p.credential.qrScannedSuccessfully,
      enquiriesReceived: p.customerValidation.enquiriesReceived,
      bookingsCompleted: p.customerValidation.bookingsCompleted,
      satisfactionRating: p.feedback?.satisfactionRating,
    }));

    return createSuccessResponse({
      cohort: "guwahati_pilot_v1",
      aggregate,
      participants: sanitizedParticipants,
      disclaimer: "Strictly pseudonymous field pilot registry data. No real-world PII is retained or exposed.",
    });
  } catch (error) {
    console.error("Failed to compile pilot metrics:", error);
    return NextResponse.json(
      { success: false, message: "Unable to retrieve pilot metrics." },
      { status: 500 }
    );
  }
}
