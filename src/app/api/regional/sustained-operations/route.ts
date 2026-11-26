import { requireAdmin } from "@/lib/auth/server";
import { handleApiError } from "@/lib/error/handler";
import { NextResponse } from "next/server";
import {
  CANONICAL_SUSTAINED_REGIONAL_RECORDS,
  evaluateSustainedRegionalPerformance,
} from "@/lib/regional/sustained-operations-service";

export async function GET(request: Request) {
  try { await requireAdmin(); } catch (authError) { return handleApiError(authError); }
  try {
    const { searchParams } = new URL(request.url);
    const regionFilter = searchParams.get("region");

    const records = regionFilter
      ? CANONICAL_SUSTAINED_REGIONAL_RECORDS.filter((r) => r.regionCode === regionFilter)
      : CANONICAL_SUSTAINED_REGIONAL_RECORDS;

    const evaluations = records.map((record) => ({
      regionCode: record.regionCode,
      reportingMonth: record.reportingMonth,
      evaluation: evaluateSustainedRegionalPerformance(record),
    }));

    const allCompliant = evaluations.every((e) => e.evaluation.isCompliant);

    return NextResponse.json({
      success: true,
      count: records.length,
      records,
      evaluations,
      allCompliant,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
