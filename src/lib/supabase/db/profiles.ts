import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isConfigured } from "@/lib/env";
import { WorkerProfile, Occupation, Skill, PortfolioItem, Review, WorkRecord } from "@/types/database.types";
import { FEATURED_PROFESSIONALS } from "@/lib/data/professionals";

export interface WorkerFilterParams {
  search?: string;
  categorySlug?: string;
  profileType?: "all" | "service_professional" | "goods_vendor" | "hybrid_artisan";
  vendorType?: string;
  stallType?: string;
  skill?: string;
  state?: string;
  district?: string;
  city?: string;
  pincode?: string;
  minExperience?: number;
  maxExperience?: number;
  availability?: "all" | "available" | "on_site";
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
 * Returns mock published worker profiles for local development and test resilience
 */
function getMockWorkerProfiles(filters: WorkerFilterParams): WorkerProfile[] {
  let result = FEATURED_PROFESSIONALS.map((p) => ({
    id: p.id,
    user_id: `33333333-3333-3333-3333-33333333000${p.id.slice(-1)}`,
    registry_id: p.registryId,
    slug: p.fullName.toLowerCase().replace(/\s+/g, "-") + "-" + p.location.city.toLowerCase(),
    occupation_id: "11111111-1111-1111-1111-111111111101",
    headline: p.primaryTrade,
    bio: p.bio,
    years_experience: p.yearsExperience,
    hourly_rate: 150.0,
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
    travel_willingness: "adjacent_districts" as const,
    profile_type: p.profileType || "service_professional",
    business_name: p.businessName || null,
    vendor_type: p.vendorType || null,
    stall_type: p.stallType || null,
    operating_hours: p.operatingHours || null,
    product_catalog: p.productCatalog || [],
    delivery_available: Boolean(p.deliveryAvailable),
    contact_preference: p.contactPreference || "phone",
    created_at: p.createdAt,
    updated_at: p.updatedAt,
    subTrades: p.subTrades,
    photoUrl: p.photoUrl,
  }));

  if (filters.profileType && filters.profileType !== "all") {
    result = result.filter(
      (w) => ((w as any).profile_type || "service_professional") === filters.profileType
    );
  }

  if (filters.vendorType && filters.vendorType !== "all") {
    result = result.filter(
      (w) => (w as any).vendor_type === filters.vendorType
    );
  }

  if (filters.stallType && filters.stallType !== "all") {
    result = result.filter(
      (w) => (w as any).stall_type === filters.stallType
    );
  }

  if (filters.search && filters.search.trim()) {
    const q = filters.search.toLowerCase().trim();
    result = result.filter(
      (w) =>
        w.headline.toLowerCase().includes(q) ||
        w.bio.toLowerCase().includes(q) ||
        w.city.toLowerCase().includes(q) ||
        w.state.toLowerCase().includes(q) ||
        w.registry_id.toLowerCase().includes(q) ||
        w.subTrades?.some((s) => s.toLowerCase().includes(q))
    );
  }

  if (filters.categorySlug && filters.categorySlug !== "all") {
    const q = filters.categorySlug.toLowerCase().replace(/-/g, " ");
    result = result.filter(
      (w) =>
        w.headline.toLowerCase().includes(q) ||
        w.subTrades?.some((s) => s.toLowerCase().includes(q))
    );
  }

  if (filters.skill && filters.skill !== "all") {
    const sk = filters.skill.toLowerCase();
    result = result.filter((w) =>
      w.subTrades?.some((s) => s.toLowerCase().includes(sk))
    );
  }

  if (filters.state && filters.state !== "all") {
    result = result.filter(
      (w) => w.state.toLowerCase() === filters.state!.toLowerCase()
    );
  }

  if (filters.district && filters.district !== "all") {
    result = result.filter(
      (w) => (w as any).district?.toLowerCase() === filters.district!.toLowerCase()
    );
  }

  if (filters.city && filters.city !== "all") {
    result = result.filter(
      (w) => w.city.toLowerCase() === filters.city!.toLowerCase()
    );
  }

  if (filters.pincode && filters.pincode.trim()) {
    result = result.filter(
      (w) => w.pincode === filters.pincode!.trim()
    );
  }

  if (filters.minExperience !== undefined) {
    result = result.filter((w) => w.years_experience >= filters.minExperience!);
  }

  if (filters.maxExperience !== undefined) {
    result = result.filter((w) => w.years_experience <= filters.maxExperience!);
  }

  if (filters.availability && filters.availability !== "all") {
    result = result.filter((w) => w.availability_status === filters.availability);
  }

  if (filters.minKaamScore) {
    result = result.filter((w) => w.kaamscore >= filters.minKaamScore!);
  }

  return result.slice(
    filters.offset || 0,
    (filters.offset || 0) + (filters.limit || 20)
  );
}

/**
 * Fetch published worker profiles.
 * Strict RLS ensures only `is_published = true` profiles are visible to general clients.
 */
export async function getPublishedWorkerProfiles(
  filters: WorkerFilterParams = {}
): Promise<WorkerProfile[]> {
  if (!isConfigured.supabase) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("FATAL DATABASE CONFIGURATION: Supabase is unconfigured in production. Cannot query worker profiles.");
    }
    return getMockWorkerProfiles(filters);
  }

  try {
    const supabase = await createServerSupabaseClient();
    let query = supabase
      .from("worker_profiles")
      .select(`
        *,
        occupation:occupations(*)
      `)
      .eq("is_published", true)
      .order("kaamscore", { ascending: false });

    if (filters.search && filters.search.trim()) {
      const q = `%${filters.search.trim()}%`;
      query = query.or(`headline.ilike.${q},bio.ilike.${q},city.ilike.${q}`);
    }

    if (filters.state && filters.state !== "all") {
      query = query.ilike("state", filters.state);
    }

    if (filters.district && filters.district !== "all") {
      query = query.ilike("district", filters.district);
    }

    if (filters.city && filters.city !== "all") {
      query = query.ilike("city", filters.city);
    }

    if (filters.pincode && filters.pincode.trim()) {
      query = query.eq("pincode", filters.pincode.trim());
    }

    if (filters.minExperience !== undefined) {
      query = query.gte("years_experience", filters.minExperience);
    }

    if (filters.maxExperience !== undefined) {
      query = query.lte("years_experience", filters.maxExperience);
    }

    if (filters.availability && filters.availability !== "all") {
      query = query.eq("availability_status", filters.availability);
    }

    if (filters.profileType && filters.profileType !== "all") {
      query = query.eq("profile_type", filters.profileType);
    }

    if (filters.vendorType && filters.vendorType !== "all") {
      query = query.eq("vendor_type", filters.vendorType);
    }

    if (filters.stallType && filters.stallType !== "all") {
      query = query.eq("stall_type", filters.stallType);
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
    if (error || (process.env.NODE_ENV !== "production" && (!data || data.length === 0 || (data[0] && !(data[0] as any).profile_type)))) {
      if (process.env.NODE_ENV !== "production") {
        if (error) {
          console.warn("[getPublishedWorkerProfiles] Remote schema mismatch or query error; returning local fixtures:", error.message);
        }
        return getMockWorkerProfiles(filters);
      }
      if (error) {
        console.error("Error fetching published worker profiles:", error);
        throw error;
      }
    }

    return (data as unknown as WorkerProfile[]) || [];
  } catch (err: any) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[getPublishedWorkerProfiles] Query exception; falling back to local worker dataset:", err.message);
      return getMockWorkerProfiles(filters);
    }
    throw err;
  }
}

/**
 * Fetch a worker profile by unique slug.
 */
export async function getWorkerProfileBySlug(slug: string): Promise<WorkerProfileWithRelations | null> {
  if (!isConfigured.supabase) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("FATAL DATABASE CONFIGURATION: Supabase is unconfigured in production. Cannot query worker profile.");
    }
    const demo =
      FEATURED_PROFESSIONALS.find((p) => {
        const pSlug =
          p.fullName.toLowerCase().replace(/\s+/g, "-") +
          "-" +
          p.location.city.toLowerCase();
        return pSlug === slug || p.id === slug || p.registryId === slug;
      }) || FEATURED_PROFESSIONALS[0];

    return {
      id: demo.id,
      user_id: `33333333-3333-3333-3333-33333333000${demo.id.slice(-1)}`,
      registry_id: demo.registryId,
      slug: slug || "rameshwar-sharma-jaipur",
      occupation_id: "11111111-1111-1111-1111-111111111101",
      headline: demo.primaryTrade,
      bio: demo.bio,
      years_experience: demo.yearsExperience,
      hourly_rate: 150.0,
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
      availability_status: (demo.availabilityStatus as any) || "available",
      travel_willingness: "adjacent_districts" as const,
      created_at: demo.createdAt,
      updated_at: demo.updatedAt,
      occupation: {
        id: "11111111-1111-1111-1111-111111111101",
        name: demo.primaryTrade.split("&")[0].trim(),
        hindi_name: "विद्युत एवं सौर ऊर्जा",
        slug: "electrical-solar",
        description: demo.primaryTrade,
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
  if (!isConfigured.supabase) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("FATAL DATABASE CONFIGURATION: Supabase is unconfigured in production. Cannot query worker profile.");
    }
    const p = await getWorkerProfileBySlug("rameshwar-sharma-jaipur");
    return p;
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("worker_profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data;
}

/**
 * Update worker profile details (headline, bio, rates, service radius, languages).
 * Worker self-sovereignty: ensures worker owns and controls their profile.
 */
export async function updateWorkerProfile(
  id: string,
  updates: Partial<WorkerProfile>
): Promise<WorkerProfile | null> {
  if (!isConfigured.supabase) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("FATAL DATABASE CONFIGURATION: Supabase is unconfigured in production. Cannot update worker profile.");
    }
    const existing = await getWorkerProfileBySlug("rameshwar-sharma-jaipur");
    if (!existing) return null;
    return {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString(),
    };
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("worker_profiles")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    console.error("Error updating worker profile:", error);
    throw error;
  }

  return data;
}

/**
 * Toggle publish status of the worker profile.
 * When is_published is false, profile is hidden from all public explore searches.
 */
export async function setWorkerPublished(
  id: string,
  isPublished: boolean
): Promise<boolean> {
  if (!isConfigured.supabase) {
    return true;
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("worker_profiles")
    .update({
      is_published: isPublished,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("Error setting worker publish status:", error);
    throw error;
  }

  return true;
}

/**
 * Update worker availability status ("available" | "on_site" | "unavailable").
 */
export async function updateWorkerAvailability(
  id: string,
  status: "available" | "on_site" | "unavailable"
): Promise<boolean> {
  if (!isConfigured.supabase) {
    return true;
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("worker_profiles")
    .update({
      availability_status: status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("Error updating availability status:", error);
    throw error;
  }

  return true;
}

/**
 * Add a skill to the worker profile.
 */
export async function addWorkerSkill(
  workerProfileId: string,
  skillId: string,
  isPrimary: boolean = false
) {
  if (!isConfigured.supabase) {
    return {
      id: `ws-${Date.now()}`,
      worker_profile_id: workerProfileId,
      skill_id: skillId,
      is_primary: isPrimary,
      verified_by_peer_count: 0,
      created_at: new Date().toISOString(),
    };
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("worker_skills")
    .insert({
      worker_profile_id: workerProfileId,
      skill_id: skillId,
      is_primary: isPrimary,
      verified_by_peer_count: 0,
    })
    .select("*")
    .single();

  if (error) {
    console.error("Error adding worker skill:", error);
    throw error;
  }

  return data;
}

/**
 * Remove a skill from the worker profile.
 */
export async function removeWorkerSkill(workerSkillId: string): Promise<boolean> {
  if (!isConfigured.supabase) {
    return true;
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("worker_skills")
    .delete()
    .eq("id", workerSkillId);

  if (error) {
    console.error("Error removing worker skill:", error);
    throw error;
  }

  return true;
}
