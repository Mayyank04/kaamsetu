import { NextRequest, NextResponse } from "next/server";
import { GeographicAuthorizationService } from "@/lib/geo/geographic-authorization-service";
import { createSuccessResponse, handleApiError } from "@/lib/error/handler";

export const dynamic = "force-dynamic";

/**
 * GET /api/geo/states
 * Returns all 36 Indian States and Union Territories with metadata.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("type"); // "states" | "ut" | null

    let states = GeographicAuthorizationService.getAllStates();

    if (filter === "states") {
      states = states.filter((s) => !s.isUnionTerritory);
    } else if (filter === "ut") {
      states = states.filter((s) => s.isUnionTerritory);
    }

    return createSuccessResponse(states, {
      total: states.length,
      nationwide_coverage: true,
      total_states: 28,
      total_union_territories: 8,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
