import { NextRequest } from "next/server";
import { requireAdmin, requireAuthenticatedUser } from "@/lib/auth/server";
import { handleApiError, createSuccessResponse } from "@/lib/error/handler";
import {
  transitionRegionLifecycle,
  getRegionLifecycleHistory,
  evaluateRegionalReadinessScorecard,
  RegionalLifecycleStage,
} from "@/lib/regions/regional-lifecycle-service";
import { getOperationalRegions } from "@/lib/regions/regional-service";

export async function GET(req: NextRequest) {
  try {
    await requireAuthenticatedUser();
    const regionId = req.nextUrl.searchParams.get("regionId");
    const regionCode = req.nextUrl.searchParams.get("regionCode");

    if (regionCode) {
      const scorecard = evaluateRegionalReadinessScorecard(regionCode);
      return createSuccessResponse({ scorecard });
    }

    if (regionId) {
      const history = await getRegionLifecycleHistory(regionId);
      return createSuccessResponse({ history });
    }

    const regions = await getOperationalRegions();
    return createSuccessResponse({ regions });
  } catch (err: any) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();

    const result = await transitionRegionLifecycle({
      regionId: body.regionId,
      toStatus: body.toStatus as RegionalLifecycleStage,
      authorizedBy: admin.id,
      authorizationNotes: body.authorizationNotes,
      readinessScore: body.readinessScore ? Number(body.readinessScore) : null,
      evidenceChecklist: body.evidenceChecklist || {},
    });

    return createSuccessResponse({
      ...result,
      message: `Region successfully transitioned to ${body.toStatus}`,
    });
  } catch (err: any) {
    return handleApiError(err);
  }
}
