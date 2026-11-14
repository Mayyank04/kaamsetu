import { NextRequest, NextResponse } from "next/server";
import { exportCohortOutcomeReport } from "@/lib/supabase/db/institutional-ops";
import { handleApiError, createSuccessResponse } from "@/lib/error/handler";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: cohortId } = await params;
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
  } catch (error) {
    return handleApiError(error);
  }
}
