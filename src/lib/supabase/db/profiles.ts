import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isConfigured } from "@/lib/env";
import { WorkerProfile, Occupation, Skill, PortfolioItem, Review, WorkRecord } from "@/types/database.types";
import { FEATURED_PROFESSIONALS } from "@/lib/data/professionals";

export interface WorkerFilterParams {
  categorySlug?: string;
  city?: string;
  minKaamScore?: number;
  limit?: number;
  offset?: number;
}

export interface WorkerProfileWithRelations extends WorkerProfile {
  occupation?: Occupation;
  skills?: Skill[];
  portfolio?: PortfolioItem[];
  reviews?: Review[];
  work_records?: WorkRecord[];
}

/**
 * Fetch published worker profiles.
 * Strict RLS ensures only `is_published = true` profiles are visible to general clients.
 */
export async function getPublishedWorkerProfiles(
  filters: WorkerFilterParams = {}
): Promise<WorkerProfile[]> {
  if (!isConfigured.supabase) {
    let result = FEATURED_PROFESSIONALS.map((p) => ({
      id: p.id,
      user_id: `33333333-3333-3333-3333-33333333000${p.id.slice(-1)}`,
      registry_id: p.registryId,
      slug: p.fullName.toLowerCase().replace(/\s+/g, "-") + "-" + p.location.city.toLowerCase(),
      occupation_id: "11111111-1111-1111-1111-111111111101",
      headline: p.primaryTrade,
      bio: p.bio,
      years_experience: p.yearsExperience,
      hourly_rate: 150.00,
      daily_rate_min: p.dailyRateEstimate?.min || 1000,
      daily_rate_max: p.dailyRateEstimate?.max || 1800,
      city: p.location.city,
      state: p.location.state,
      pincode: p.location.pincode,
      service_radius_km: 25,
      languages: p.languages,
      kaamscore: p.kaamScore.totalScore,
      kaamscore_level: p.kaamScore.level,
      aadhaar_verified: p.aadhaarVerified,
      digilocker_linked: p.digiLockerLinked,
      is_published: true,
      availability_status: p.availabilityStatus as "available",
      created_at: p.createdAt,
      updated_at: p.updatedAt,
    }));

    if (filters.city && filters.city !== "all") {
      result = result.filter((w) => w.city.toLowerCase() === filters.city!.toLowerCase());
    }
    if (filters.minKaamScore) {
      result = result.filter((w) => w.kaamscore >= filters.minKaamScore!);
    }

    return result.slice(filters.offset || 0, (filters.offset || 0) + (filters.limit || 20));
  }

  const supabase = await createServerSupabaseClient();
  let query = supabase
    .from("worker_profiles")
    .select(`
      *,
      occupation:occupations(*)
    `)
    .eq("is_published", true)
    .order("kaamscore", { ascending: false });

  if (filters.city && filters.city !== "all") {
    query = query.ilike("city", filters.city);
  }

  if (filters.minKaamScore) {
    query = query.gte("kaamscore", filters.minKaamScore);
  }

  if (filters.limit) {
    query = query.limit(filters.limit);
  }

  if (filters.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error fetching published worker profiles:", error);
    throw error;
  }

  return (data as unknown as WorkerProfile[]) || [];
}

/**
 * Fetch a worker profile by unique slug.
 */
export async function getWorkerProfileBySlug(slug: string): Promise<WorkerProfileWithRelations | null> {
  if (!isConfigured.supabase) {
    const demo = FEATURED_PROFESSIONALS[0];
    return {
      id: demo.id,
      user_id: "33333333-3333-3333-3333-333333330001",
      registry_id: demo.registryId,
      slug: slug || "rameshwar-sharma-jaipur",
      occupation_id: "11111111-1111-1111-1111-111111111101",
      headline: demo.primaryTrade,
      bio: demo.bio,
      years_experience: demo.yearsExperience,
      hourly_rate: 150.00,
      daily_rate_min: demo.dailyRateEstimate?.min || 1100,
      daily_rate_max: demo.dailyRateEstimate?.max || 1700,
      city: demo.location.city,
      state: demo.location.state,
      pincode: demo.location.pincode,
      service_radius_km: 30,
      languages: demo.languages,
      kaamscore: demo.kaamScore.totalScore,
      kaamscore_level: demo.kaamScore.level,
      aadhaar_verified: demo.aadhaarVerified,
      digilocker_linked: demo.digiLockerLinked,
      is_published: true,
      availability_status: "available",
      created_at: demo.createdAt,
      updated_at: demo.updatedAt,
      occupation: {
        id: "11111111-1111-1111-1111-111111111101",
        name: "Electrical & Solar",
        hindi_name: "विद्युत एवं सौर ऊर्जा",
        slug: "electrical-solar",
        description: "Industrial wiring & solar.",
        nsqf_level: 4,
        icon_name: "Zap",
        is_active: true,
        created_at: new Date().toISOString(),
      },
    };
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("worker_profiles")
    .select(`
      *,
      occupation:occupations(*),
      portfolio(*),
      reviews(*),
      work_records(*)
    `)
    .eq("slug", slug)
    .single();

  if (error || !data) return null;
  return data as unknown as WorkerProfileWithRelations;
}

/**
 * Fetch a worker profile by ID.
 */
export async function getWorkerProfileById(id: string): Promise<WorkerProfile | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("worker_profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data;
}
