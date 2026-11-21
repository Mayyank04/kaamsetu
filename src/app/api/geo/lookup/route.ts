import { NextRequest, NextResponse } from "next/server";
import { GeographicAuthorizationService } from "@/lib/geo/geographic-authorization-service";
import { createSuccessResponse, handleApiError } from "@/lib/error/handler";

export const dynamic = "force-dynamic";

/**
 * GET /api/geo/lookup?pincode=781001 OR ?q=Guwahati
 * Resolves postal PIN code or auto-completes location query.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pincode = searchParams.get("pincode");
    const q = searchParams.get("q");

    if (pincode) {
      const pinResult = GeographicAuthorizationService.lookupPincode(pincode);
      if (!pinResult) {
        return NextResponse.json(
          {
            error: `PIN code '${pincode}' could not be resolved to a known Indian region.`,
            valid: false,
          },
          { status: 404 }
        );
      }
      return createSuccessResponse(pinResult, {
        pincode,
        valid: true,
      });
    }

    if (q) {
      const searchResults = GeographicAuthorizationService.searchLocations(q);
      return createSuccessResponse(searchResults, {
        query: q,
        total: searchResults.length,
      });
    }

    return NextResponse.json(
      { error: "Provide either '?pincode=' or '?q=' query parameter." },
      { status: 400 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
