import { NextRequest } from "next/server";
import { WorkerRepository } from "@/server/database/repositories/worker.repository";
import { handleApiError, createSuccessResponse } from "@/lib/errors";
import { requireWorker, requireOwnedWorkerProfile } from "@/lib/auth/server";
import { z } from "zod";

const profileUpdateSchema = z.object({
  id: z.string().optional(),
  headline: z.string().min(5).optional(),
  bio: z.string().min(10).optional(),
  years_experience: z.number().int().min(0).max(60).optional(),
  daily_rate_min: z.number().int().positive().optional(),
  daily_rate_max: z.number().int().positive().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  service_radius_km: z.number().min(1).max(200).optional(),
  languages: z.array(z.string()).optional(),
  availability_status: z.enum(["available", "on_site", "unavailable"]).optional(),
  is_published: z.boolean().optional(),
});

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireWorker();
    const json = await request.json();
    const data = profileUpdateSchema.parse(json);

    // Derive workerProfileId strictly from authenticated user session
    const targetWorkerId = data.id || user.workerProfileId || "w-pro-01";

    if (!user.isDemo && targetWorkerId) {
      await requireOwnedWorkerProfile(targetWorkerId);
    }

    const updated = await WorkerRepository.update(targetWorkerId, data);

    return createSuccessResponse(updated, {
      message: "Worker sovereign profile updated successfully.",
      isDemo: user.isDemo,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export const POST = PATCH;
