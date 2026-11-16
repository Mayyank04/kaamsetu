/**
 * KAAMSETU — Worker Repository
 * Encapsulates database access for artisan profiles, skills, and portfolio items.
 */

import {
  getPublishedWorkerProfiles,
  getWorkerProfileBySlug,
  getWorkerProfileById,
  updateWorkerProfile,
  WorkerFilterParams,
  WorkerProfileWithRelations,
} from "@/lib/supabase/db/profiles";
import { WorkerProfile } from "@/types/database.types";
import { NotFoundError } from "@/lib/errors/app-error";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isConfigured } from "@/lib/env";

export class WorkerRepository {
  /**
   * Retrieves published worker profiles matching search filters
   */
  public static async findPublished(filters: WorkerFilterParams = {}): Promise<WorkerProfile[]> {
    return getPublishedWorkerProfiles(filters);
  }

  /**
   * Retrieves complete worker profile with relations by slug
   */
  public static async findBySlug(slug: string): Promise<WorkerProfileWithRelations> {
    const profile = await getWorkerProfileBySlug(slug);
    if (!profile) {
      throw new NotFoundError("Worker profile", slug);
    }
    return profile;
  }

  /**
   * Retrieves worker profile by ID
   */
  public static async findById(id: string): Promise<WorkerProfile> {
    const profile = await getWorkerProfileById(id);
    if (!profile) {
      throw new NotFoundError("Worker profile", id);
    }
    return profile;
  }

  /**
   * Retrieves worker profile by authenticated user ID
   */
  public static async findByUserId(userId: string): Promise<WorkerProfile | null> {
    if (!isConfigured.supabase) {
      return getWorkerProfileById("w-pro-01");
    }
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("worker_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      throw error;
    }
    return data;
  }

  /**
   * Updates an existing worker profile
   */
  public static async update(
    id: string,
    updates: Partial<WorkerProfile>
  ): Promise<WorkerProfile> {
    const updated = await updateWorkerProfile(id, updates);
    if (!updated) {
      throw new NotFoundError("Worker profile", id);
    }
    return updated;
  }

  /**
   * Toggles self-sovereign public visibility
   */
  public static async setPublished(id: string, isPublished: boolean): Promise<WorkerProfile> {
    return this.update(id, { is_published: isPublished });
  }
}
