import { createAdminClient } from "@/lib/supabase/admin";
import { OperationalRegion } from "@/types/database.types";

export interface RegionalConfig {
  regionCode: string;
  state: string;
  district: string;
  primaryCity: string;
  subdistrictBlocks: string[];
  pinCodes: string[];
  supportedLanguages: string[];
  tradeAliases: Record<string, string[]>;
  discoveryRadiusKm: number;
  status: "planning" | "active" | "suspended" | "deactivated";
  featureFlags: Record<string, boolean>;
}

export const FALLBACK_LANGUAGES = ["en", "as", "hi", "bn", "kha", "ne", "nag"] as const;
export type SupportedLanguage = (typeof FALLBACK_LANGUAGES)[number];

export const REGIONAL_LANGUAGE_CONFIG: Record<string, { default: SupportedLanguage; supported: SupportedLanguage[] }> = {
  "IN-AS-KMP-METRO": { default: "as", supported: ["as", "en", "bn", "hi"] },
  "IN-AS-KMP-RURAL": { default: "as", supported: ["as", "en", "bn", "hi"] },
  "IN-AS-UDL": { default: "as", supported: ["as", "en", "bn", "hi"] },
  "IN-ML-EKH": { default: "kha", supported: ["kha", "en", "as", "hi"] },
  "IN-TR-WTR": { default: "bn", supported: ["bn", "en", "hi"] },
  "IN-WB-DAR": { default: "bn", supported: ["bn", "ne", "en", "hi"] },
  "IN-NL-DIM": { default: "en", supported: ["en", "nag", "hi"] },
};

/**
 * Resolve language preference with multi-level fallback
 * Requested language -> Regional Default -> English
 */
export function resolveRegionalLanguage(
  regionCode: string,
  requestedLanguage?: string
): SupportedLanguage {
  const config = REGIONAL_LANGUAGE_CONFIG[regionCode];
  if (!config) {
    return (requestedLanguage && FALLBACK_LANGUAGES.includes(requestedLanguage as SupportedLanguage))
      ? (requestedLanguage as SupportedLanguage)
      : "en";
  }

  if (requestedLanguage && config.supported.includes(requestedLanguage as SupportedLanguage)) {
    return requestedLanguage as SupportedLanguage;
  }

  return config.default;
}

/**
 * Fetch active or planning operational regions from database
 */
export async function getOperationalRegions(): Promise<OperationalRegion[]> {
  const supabase = createAdminClient();
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("operational_regions")
    .select("*")
    .order("region_code", { ascending: true });

  if (error || !data) {
    console.error("Failed to load operational regions:", error);
    return [];
  }

  return data as OperationalRegion[];
}

/**
 * Get single operational region by code
 */
export async function getRegionByCode(regionCode: string): Promise<OperationalRegion | null> {
  const supabase = createAdminClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("operational_regions")
    .select("*")
    .eq("region_code", regionCode)
    .single();

  if (error || !data) return null;
  return data as OperationalRegion;
}

/**
 * Check if a feature is enabled in a specific region
 */
export async function isRegionFeatureEnabled(
  regionCode: string,
  featureName: string
): Promise<boolean> {
  const region = await getRegionByCode(regionCode);
  if (!region) return false;
  if (region.status !== "active" && region.status !== "planning") return false;

  const flags = (region.feature_flags as Record<string, boolean>) || {};
  return Boolean(flags[featureName]);
}
