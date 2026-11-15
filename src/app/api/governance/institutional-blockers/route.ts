import { NextResponse } from "next/server";
import {
  CANONICAL_CLASS_A_BLOCKERS,
  assessInstitutionalGateReadiness,
} from "@/lib/governance/institutional-blocker-service";

export async function GET() {
  try {
    const assessment = assessInstitutionalGateReadiness(CANONICAL_CLASS_A_BLOCKERS);

    return NextResponse.json({
      success: true,
      blockers: CANONICAL_CLASS_A_BLOCKERS,
      assessment,
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
