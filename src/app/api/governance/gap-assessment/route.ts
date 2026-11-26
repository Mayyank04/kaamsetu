import { requireAdmin } from "@/lib/auth/server";
import { handleApiError } from "@/lib/error/handler";
import { NextResponse } from "next/server";
import { evaluatePlatformGapAssessment } from "@/lib/governance/gap-assessment-service";

export async function GET() {
  try { await requireAdmin(); } catch (authError) { return handleApiError(authError); }
  try {
    const report = evaluatePlatformGapAssessment();
    return NextResponse.json({
      success: true,
      report,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
