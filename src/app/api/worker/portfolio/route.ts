import { NextRequest } from "next/server";
import { addPortfolioItem, deletePortfolioItem } from "@/lib/supabase/db/portfolio";
import { handleApiError, createSuccessResponse } from "@/lib/error/handler";
import { z } from "zod";

const portfolioCreateSchema = z.object({
  worker_profile_id: z.string().default("w-pro-01"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional().default(""),
  image_url: z.string().min(5, "Image URL is required"),
  category: z.string().optional().default("Craft"),
  project_date: z.string().optional().default(new Date().toISOString().split("T")[0]),
  client_testimony: z.string().optional().default(""),
});

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const data = portfolioCreateSchema.parse(json);

    const item = await addPortfolioItem({
      worker_profile_id: data.worker_profile_id,
      title: data.title,
      description: data.description,
      image_url: data.image_url,
      category: data.category,
      project_date: data.project_date,
      client_testimony: data.client_testimony,
    });

    return createSuccessResponse(item, {
      message: "Portfolio project added successfully.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return handleApiError(new Error("Portfolio item ID is required."));
    }

    await deletePortfolioItem(id);
    return createSuccessResponse({ id, deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
