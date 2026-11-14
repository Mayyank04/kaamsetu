import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isConfigured } from "@/lib/env";
import { RegionalExpansionReadiness } from "@/types/database.types";
import { logger } from "@/lib/security/privacy-logger";

export interface DistrictReadinessEvaluation {
  state: string;
  district: string;
  contractorDemandScore: number;
  artisanDensityScore: number;
  institutionalAccessScore: number;
  proximityScore: number;
  connectivityScore: number;
  languageReadinessScore: number;
  cacEfficiencyScore: number;
  status: "active_base" | "selected_expansion" | "pipeline" | "exploratory";
  localOperatingPartner?: string;
}

export const REGIONAL_SCORECARD_EVALUATIONS: DistrictReadinessEvaluation[] = [
  {
    state: "Assam",
    district: "Kamrup Metropolitan",
    contractorDemandScore: 9.5,
    artisanDensityScore: 9.0,
    institutionalAccessScore: 9.5,
    proximityScore: 10.0,
    connectivityScore: 9.5,
    languageReadinessScore: 10.0,
    cacEfficiencyScore: 9.0,
    status: "active_base",
    localOperatingPartner: "Assam Skill Development Mission (ASDM)",
  },
  {
    state: "Assam",
    district: "Kamrup Rural",
    contractorDemandScore: 8.5,
    artisanDensityScore: 9.0,
    institutionalAccessScore: 8.5,
    proximityScore: 9.0,
    connectivityScore: 8.0,
    languageReadinessScore: 10.0,
    cacEfficiencyScore: 8.5,
    status: "selected_expansion",
    localOperatingPartner: "ITI Rangia & Sualkuchi Silk Cooperative",
  },
  {
    state: "Assam",
    district: "Nagaon",
    contractorDemandScore: 7.5,
    artisanDensityScore: 8.0,
    institutionalAccessScore: 7.5,
    proximityScore: 6.5,
    connectivityScore: 7.5,
    languageReadinessScore: 9.5,
    cacEfficiencyScore: 7.0,
    status: "pipeline",
    localOperatingPartner: "Green Valley Agro Engineering",
  },
  {
    state: "Meghalaya",
    district: "East Khasi Hills (Shillong)",
    contractorDemandScore: 7.0,
    artisanDensityScore: 7.5,
    institutionalAccessScore: 8.0,
    proximityScore: 7.0,
    connectivityScore: 8.0,
    languageReadinessScore: 7.5,
    cacEfficiencyScore: 6.5,
    status: "selected_expansion",
    localOperatingPartner: "Meghalaya State Skill Development Society (MSSDS)",
  },
  {
    state: "Assam",
    district: "Sonitpur (Tezpur)",
    contractorDemandScore: 6.5,
    artisanDensityScore: 7.0,
    institutionalAccessScore: 7.0,
    proximityScore: 5.5,
    connectivityScore: 7.5,
    languageReadinessScore: 9.0,
    cacEfficiencyScore: 6.5,
    status: "pipeline",
    localOperatingPartner: "Tezpur Polytechnic",
  },
  {
    state: "West Bengal",
    district: "Darjeeling & Siliguri Corridor",
    contractorDemandScore: 8.0,
    artisanDensityScore: 7.5,
    institutionalAccessScore: 7.0,
    proximityScore: 6.0,
    connectivityScore: 8.5,
    languageReadinessScore: 8.5,
    cacEfficiencyScore: 7.0,
    status: "pipeline",
    localOperatingPartner: "North Bengal Construction Guild",
  },
];

/**
 * Calculates weighted readiness score (out of 10)
 */
export function calculateWeightedReadiness(evalItem: DistrictReadinessEvaluation): number {
  const weighted =
    evalItem.contractorDemandScore * 0.25 +
    evalItem.artisanDensityScore * 0.20 +
    evalItem.institutionalAccessScore * 0.15 +
    evalItem.proximityScore * 0.15 +
    evalItem.connectivityScore * 0.10 +
    evalItem.languageReadinessScore * 0.10 +
    evalItem.cacEfficiencyScore * 0.05;

  return Math.round(weighted * 10) / 10;
}

/**
 * Seeds regional expansion evaluations into the database idempotently.
 */
export async function seedRegionalExpansionDirectory(): Promise<number> {
  if (!isConfigured.supabase) {
    return REGIONAL_SCORECARD_EVALUATIONS.length;
  }

  const supabase = await createServerSupabaseClient();
  let count = 0;

  for (const item of REGIONAL_SCORECARD_EVALUATIONS) {
    const readiness = calculateWeightedReadiness(item);
    const { error } = await supabase
      .from("regional_expansion_readiness")
      .upsert(
        {
          state: item.state,
          district: item.district,
          contractor_demand_score: item.contractorDemandScore,
          artisan_density_score: item.artisanDensityScore,
          institutional_access_score: item.institutionalAccessScore,
          readiness_score: readiness,
          status: item.status,
          local_operating_partner: item.localOperatingPartner || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "district" }
      );

    if (!error) count++;
  }

  return count;
}

/**
 * Retrieves the regional expansion directory.
 */
export async function getRegionalExpansionDirectory(): Promise<RegionalExpansionReadiness[]> {
  if (!isConfigured.supabase) {
    return REGIONAL_SCORECARD_EVALUATIONS.map((item, idx) => ({
      id: `region-mock-${idx + 1}`,
      state: item.state,
      district: item.district,
      contractor_demand_score: item.contractorDemandScore,
      artisan_density_score: item.artisanDensityScore,
      institutional_access_score: item.institutionalAccessScore,
      readiness_score: calculateWeightedReadiness(item),
      status: item.status,
      local_operating_partner: item.localOperatingPartner || null,
      updated_at: new Date().toISOString(),
    }));
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("regional_expansion_readiness")
    .select("*")
    .order("readiness_score", { ascending: false });

  if (error) {
    logger.error("Failed to query regional expansion directory", { error: String(error) });
    throw error;
  }
  return data || [];
}
