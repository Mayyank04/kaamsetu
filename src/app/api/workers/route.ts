import { NextRequest } from "next/server";
import { getPublishedWorkerProfiles } from "@/lib/supabase/db/profiles";
import { handleApiError, createSuccessResponse } from "@/lib/error/handler";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search") || undefined;
    const categorySlug = searchParams.get("category") || undefined;
    const skill = searchParams.get("skill") || undefined;
    const city = searchParams.get("city") || undefined;
    const minExperience = searchParams.get("minExp")
      ? parseInt(searchParams.get("minExp")!, 10)
      : undefined;
    const maxExperience = searchParams.get("maxExp")
      ? parseInt(searchParams.get("maxExp")!, 10)
      : undefined;
    const availability = (searchParams.get("availability") as
      | "all"
      | "available"
      | "on_site") || undefined;
    const minKaamScore = searchParams.get("minScore")
      ? parseInt(searchParams.get("minScore")!, 10)
      : undefined;
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!, 10)
      : 24;
    const offset = searchParams.get("offset")
      ? parseInt(searchParams.get("offset")!, 10)
      : 0;

    const workers = await getPublishedWorkerProfiles({
      search,
      categorySlug,
      skill,
      city,
      minExperience,
      maxExperience,
      availability,
      minKaamScore,
      limit,
      offset,
    });

    return createSuccessResponse(workers, {
      total: workers.length,
      filters: {
        search,
        categorySlug,
        skill,
        city,
        minExperience,
        maxExperience,
        availability,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
