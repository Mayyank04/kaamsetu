import { NextRequest, NextResponse } from "next/server";
import { GeographicAuthorizationService } from "@/lib/geo/geographic-authorization-service";
import { createSuccessResponse, handleApiError } from "@/lib/error/handler";

export const dynamic = "force-dynamic";

/**
 * GET /api/geo/districts?state=Assam
 * Returns all recognized districts and major cities for the given state.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stateName = searchParams.get("state");

    if (!stateName) {
      return NextResponse.json(
        { error: "Query parameter 'state' is required." },
        { status: 400 }
      );
    }

    const stateObj = GeographicAuthorizationService.getState(stateName);
    if (!stateObj) {
      return NextResponse.json(
        {
          error: `State or Union Territory '${stateName}' not recognized.`,
          hint: "Provide an authoritative Indian state or UT name.",
        },
        { status: 404 }
      );
    }

    const districts = GeographicAuthorizationService.getDistrictsForState(stateName);

    return createSuccessResponse(districts, {
      state: stateObj.name,
      code: stateObj.code,
      capital: stateObj.capital,
      isUnionTerritory: stateObj.isUnionTerritory,
      totalDistricts: districts.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
