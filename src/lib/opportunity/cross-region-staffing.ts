import { createAdminClient } from "@/lib/supabase/admin";
import { isConfigured } from "@/lib/env";

export type StaffingStatus =
  | "proposed"
  | "offered"
  | "accepted"
  | "deployed"
  | "completed"
  | "declined"
  | "cancelled";

export interface CreateStaffingOfferInput {
  organizationId: string;
  opportunityId?: string | null;
  sourceRegionId: string;
  targetRegionId: string;
  workerProfileId: string;
  tradeRequired: string;
  crewRole?: string;
  durationDays?: number;
  dailyWage: number;
  travelStipend?: number;
  accommodationProvided?: boolean;
  workerTravelWillingness?: "same_district" | "adjacent_districts" | "interstate" | "remote_only";
}

/**
 * Creates a cross-region project staffing offer.
 * Enforces worker travel willingness preference and explicit worker consent.
 */
export async function createStaffingOffer(input: CreateStaffingOfferInput) {
  if (!input.dailyWage || input.dailyWage <= 0) {
    throw new Error("dailyWage must be a positive number");
  }

  let travelWillingness = input.workerTravelWillingness || "adjacent_districts";

  if (isConfigured.supabase) {
    try {
      const supabase = createAdminClient();
      const { data: worker } = await supabase
        .from("worker_profiles")
        .select("id, travel_willingness, city, state")
        .eq("id", input.workerProfileId)
        .single();

      if (worker?.travel_willingness) {
        travelWillingness = worker.travel_willingness;
      }
    } catch {
      // offline/test environment
    }
  }

  const isCrossRegion = input.sourceRegionId !== input.targetRegionId;

  if (isCrossRegion && travelWillingness === "same_district") {
    throw new Error(
      `Worker travel preference is strictly 'same_district'. Cross-region staffing offer blocked.`
    );
  }

  if (!isConfigured.supabase) {
    return {
      id: crypto.randomUUID(),
      organization_id: input.organizationId,
      opportunity_id: input.opportunityId || null,
      source_region_id: input.sourceRegionId,
      target_region_id: input.targetRegionId,
      worker_profile_id: input.workerProfileId,
      trade_required: input.tradeRequired,
      crew_role: input.crewRole || "Specialist Artisan",
      duration_days: input.durationDays || 14,
      daily_wage: input.dailyWage,
      travel_stipend: input.travelStipend || 0.00,
      accommodation_provided: input.accommodationProvided ?? true,
      worker_consent_obtained: false,
      status: "offered",
      created_at: new Date().toISOString(),
    };
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("cross_region_project_staffing")
    .insert({
      organization_id: input.organizationId,
      opportunity_id: input.opportunityId || null,
      source_region_id: input.sourceRegionId,
      target_region_id: input.targetRegionId,
      worker_profile_id: input.workerProfileId,
      trade_required: input.tradeRequired,
      crew_role: input.crewRole || "Specialist Artisan",
      duration_days: input.durationDays || 14,
      daily_wage: input.dailyWage,
      travel_stipend: input.travelStipend || 0.00,
      accommodation_provided: input.accommodationProvided ?? true,
      worker_consent_obtained: false, // Explicit worker acceptance required
      status: "offered",
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create staffing offer: ${error.message}`);
  }

  return data;
}

/**
 * Worker responds to a cross-region staffing offer (accept or decline).
 * Guarantees worker self-sovereignty: contractor cannot force deployment without consent.
 */
export async function respondToStaffingOffer(
  staffingId: string,
  workerProfileId: string,
  accept: boolean
) {
  const targetStatus: StaffingStatus = accept ? "accepted" : "declined";

  if (!isConfigured.supabase) {
    return {
      id: staffingId,
      worker_profile_id: workerProfileId,
      status: targetStatus,
      worker_consent_obtained: accept,
      updated_at: new Date().toISOString(),
    };
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("cross_region_project_staffing")
    .update({
      status: targetStatus,
      worker_consent_obtained: accept,
      updated_at: new Date().toISOString(),
    })
    .eq("id", staffingId)
    .eq("worker_profile_id", workerProfileId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update staffing response: ${error.message}`);
  }

  return data;
}

/**
 * Retrieves staffing offers for a worker
 */
export async function getStaffingOffersForWorker(workerProfileId: string) {
  const supabase = createAdminClient();
  if (!supabase) throw new Error("Database client unavailable");

  const { data, error } = await supabase
    .from("cross_region_project_staffing")
    .select(`
      *,
      contractor_organizations:organization_id (company_name, operating_city),
      source_region:source_region_id (region_code, primary_city, state),
      target_region:target_region_id (region_code, primary_city, state)
    `)
    .eq("worker_profile_id", workerProfileId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch worker staffing offers: ${error.message}`);
  }

  return data || [];
}
