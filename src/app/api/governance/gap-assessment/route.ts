import { NextResponse } from "next/server";
import { evaluatePlatformGapAssessment } from "@/lib/governance/gap-assessment-service";

export async function GET() {
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
