import { NextRequest } from "next/server";
import { addPortfolioItem, deletePortfolioItem } from "@/lib/supabase/db/portfolio";
import { handleApiError, createSuccessResponse, AuthenticationError, AuthorizationError, NotFoundError } from "@/lib/error/handler";
import { requireWorker, requireOwnedWorkerProfile } from "@/lib/auth/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isConfigured } from "@/lib/env";
import { z } from "zod";

const portfolioCreateSchema = z.object({
  worker_profile_id: z.string().optional(),
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().max(1000).optional().default(""),
  image_url: z.string().url("Valid image URL is required"),
  category: z.string().max(50).optional().default("Craft"),
  project_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)").optional().default(new Date().toISOString().split("T")[0]),
  client_testimony: z.string().max(500).optional().default(""),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireWorker();
    const json = await request.json();
    const data = portfolioCreateSchema.parse(json);

    // Resolve target worker profile and verify ownership
    const targetProfileId = data.worker_profile_id || user.workerProfileId || "w-pro-01";
    await requireOwnedWorkerProfile(targetProfileId);

    const item = await addPortfolioItem({
      worker_profile_id: targetProfileId,
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
    const user = await requireWorker();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return handleApiError(new Error("Portfolio item ID is required."));
    }

    if (isConfigured.supabase) {
      const supabase = await createServerSupabaseClient();
      // Verify ownership of the portfolio item
      const { data: item, error: fetchErr } = await supabase
        .from("portfolio")
        .select("id, worker_profile_id, worker_profiles!inner(user_id)")
        .eq("id", id)
        .maybeSingle();

      if (fetchErr) {
        throw fetchErr;
      }

      if (!item) {
        throw new NotFoundError("Portfolio item not found.");
      }

      const ownerUserId = (item as any)?.worker_profiles?.user_id;
      if (ownerUserId !== user.id) {
        throw new AuthorizationError("You do not have permission to delete this portfolio item.");
      }
    }

    await deletePortfolioItem(id);
    return createSuccessResponse({ id, deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
