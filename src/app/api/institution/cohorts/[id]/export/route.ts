import { NextRequest, NextResponse } from "next/server";
import { exportCohortOutcomeReport } from "@/lib/supabase/db/institutional-ops";
import { handleApiError, createSuccessResponse } from "@/lib/error/handler";
import { requireInstitutionCohortOwnership, AuthError } from "@/lib/auth/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: cohortId } = await params;
    
    // Strict institutional authorization and cohort ownership verification
    await requireInstitutionCohortOwnership(cohortId);

    const { searchParams } = new URL(request.url);
    const format = (searchParams.get("format") || "json") as "json" | "csv";

    const { data, mimeType } = await exportCohortOutcomeReport(cohortId, format);

    if (format === "csv") {
      return new NextResponse(data as string, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="cohort_${cohortId}_outcomes.csv"`,
        },
      });
    }

    return createSuccessResponse(data, { cohortId, format });
  } catch (error: any) {
    if (error.name === "AuthError" || error.statusCode) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode || 401 });
    }
    return handleApiError(error);
  }
}
