import { NextRequest } from "next/server";
import {
  MARKETPLACE_CATEGORIES,
  getAllCategories,
  getCategoryBySlug,
  searchCategories,
} from "@/lib/constants/marketplace-categories";
import { createSuccessResponse, handleApiError } from "@/lib/error/handler";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const query = searchParams.get("q") || searchParams.get("query");

    if (slug) {
      const category = getCategoryBySlug(slug);
      if (!category) {
        return createSuccessResponse(null, {
          found: false,
          message: `Category with slug '${slug}' not found`,
        });
      }
      return createSuccessResponse(category, { found: true });
    }

    if (query) {
      const matching = searchCategories(query);
      return createSuccessResponse(matching, {
        total: matching.length,
        query,
      });
    }

    const categories = getAllCategories();
    return createSuccessResponse(categories, {
      total: categories.length,
      rolloutClassification: "CLASS_B_CONTROLLED_ROLLOUT",
      authorizedZones: ["Guwahati Urban", "Shillong Urban"],
    });
  } catch (error) {
    return handleApiError(error);
  }
}
