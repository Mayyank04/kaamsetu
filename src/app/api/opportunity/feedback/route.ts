import { NextRequest } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth/server";
import { handleApiError, createSuccessResponse } from "@/lib/error/handler";
import {
  submitOpportunityFeedback,
  getOpportunityFeedback,
  OpportunityReportType,
} from "@/lib/opportunity/feedback-service";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuthenticatedUser();
    const body = await req.json();

    const report = await submitOpportunityFeedback({
      opportunityId: body.opportunityId,
      reporterProfileId: user.id,
      reportType: body.reportType as OpportunityReportType,
      details: body.details,
    });

    return createSuccessResponse({
      report,
      message: "Feedback report submitted successfully for integrity review",
    });
  } catch (err: any) {
    return handleApiError(err);
  }
}

export async function GET(req: NextRequest) {
  try {
    const opportunityId = req.nextUrl.searchParams.get("opportunityId");
    if (!opportunityId) {
      return handleApiError(new Error("opportunityId parameter is required"));
    }

    const reports = await getOpportunityFeedback(opportunityId);
    return createSuccessResponse({ reports });
  } catch (err: any) {
    return handleApiError(err);
  }
}
