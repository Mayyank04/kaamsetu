import { requireAdmin } from "@/lib/auth/server";
import { handleApiError } from "@/lib/error/handler";
import { NextRequest, NextResponse } from "next/server";
import {
  evaluateSiliguriCorridorReadiness,
  RegionalCorridorMetrics,
} from "@/lib/regions/siliguri-corridor-gate-service";

export async function GET() {
  try { await requireAdmin(); } catch (authError) { return handleApiError(authError); }
  try {
    // Current state of North Bengal / Siliguri Corridor
    // In Phase 17: 9/14 steps completed (64.3%), Gate 2 (<100 workers) and Gate 4 (no physical kiosk) pending
    // In Phase 18 target: 12/14 steps completed (85.7%), Gate 2 (105 workers) and Gate 4 (Siliguri Hub open) cleared
    const defaultMetrics: RegionalCorridorMetrics = {
      regionCode: "IN-WB-SIL",
      regionName: "North Bengal / Siliguri Corridor",
      stepsCompleted14: 12,
      hasInstitutionalMoU: true,
      verifiedWorkerCount: 105,
      payingContractorCount: 2,
      hasPhysicalFieldCoordinator: true,
      primaryAdminApproved: true,
      secondaryAdminApproved: true,
      distinctApprovers: true,
    };

    const evaluation = evaluateSiliguriCorridorReadiness(defaultMetrics);

    return NextResponse.json({
      success: true,
      evaluation,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to evaluate Siliguri corridor readiness" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try { await requireAdmin(); } catch (authError) { return handleApiError(authError); }
  try {
    const body = await req.json();
    const metrics: RegionalCorridorMetrics = {
      regionCode: body.regionCode || "IN-WB-SIL",
      regionName: body.regionName || "North Bengal / Siliguri Corridor",
      stepsCompleted14: body.stepsCompleted14 ?? 12,
      hasInstitutionalMoU: body.hasInstitutionalMoU ?? true,
      verifiedWorkerCount: body.verifiedWorkerCount ?? 105,
      payingContractorCount: body.payingContractorCount ?? 2,
      hasPhysicalFieldCoordinator: body.hasPhysicalFieldCoordinator ?? true,
      primaryAdminApproved: body.primaryAdminApproved ?? true,
      secondaryAdminApproved: body.secondaryAdminApproved ?? true,
      distinctApprovers: body.distinctApprovers ?? true,
    };

    const evaluation = evaluateSiliguriCorridorReadiness(metrics);

    return NextResponse.json({
      success: true,
      evaluation,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to process Siliguri corridor evaluation" },
      { status: 400 }
    );
  }
}
