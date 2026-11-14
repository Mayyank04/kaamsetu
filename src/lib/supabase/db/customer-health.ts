import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isConfigured } from "@/lib/env";
import { ContractorCustomerHealth } from "@/types/database.types";
import { logger } from "@/lib/security/privacy-logger";

export interface ComputeHealthParams {
  organizationId: string;
  weeklyActiveDays: number;
  totalRosterWorkers: number;
  maxRosterWorkers: number;
  activeProjectsCount: number;
  daysUntilExpiry?: number;
}

/**
 * Computes an objective customer health score (0-100) based on product adoption metrics.
 * 
 * Factors:
 * 1. Weekly Active Usage (40 pts): 4+ days = 40, 2-3 days = 25, 1 day = 10, 0 = 0
 * 2. Roster Utilization (30 pts): 60-100% capacity = 30, 30-59% = 20, <30% = 10
 * 3. Active Projects (20 pts): 2+ active sites = 20, 1 site = 15, 0 = 5
 * 4. Subscription Buffer (10 pts): >14 days to expiry = 10, 7-14 days = 5, <7 days = 0
 */
export function calculateContractorHealthScore(params: ComputeHealthParams): {
  healthScore: number;
  churnRisk: "low" | "medium" | "high";
  rosterUtilizationPct: number;
} {
  let score = 0;

  // 1. Weekly Active Days
  if (params.weeklyActiveDays >= 4) score += 40;
  else if (params.weeklyActiveDays >= 2) score += 25;
  else if (params.weeklyActiveDays >= 1) score += 10;

  // 2. Roster Utilization
  const rosterUtil = params.maxRosterWorkers > 0 
    ? Math.min(100, Math.round((params.totalRosterWorkers / params.maxRosterWorkers) * 100))
    : 0;

  if (rosterUtil >= 60) score += 30;
  else if (rosterUtil >= 30) score += 20;
  else if (rosterUtil > 0) score += 10;

  // 3. Active Projects
  if (params.activeProjectsCount >= 2) score += 20;
  else if (params.activeProjectsCount >= 1) score += 15;
  else score += 5;

  // 4. Expiry Buffer
  const daysLeft = params.daysUntilExpiry ?? 30;
  if (daysLeft > 14) score += 10;
  else if (daysLeft >= 7) score += 5;

  const finalScore = Math.min(100, Math.max(0, score));
  let churnRisk: "low" | "medium" | "high" = "low";
  if (finalScore < 50) churnRisk = "high";
  else if (finalScore < 75) churnRisk = "medium";

  return {
    healthScore: finalScore,
    churnRisk,
    rosterUtilizationPct: rosterUtil,
  };
}

/**
 * Updates or initialises telemetry in contractor_customer_health table.
 */
export async function syncContractorHealth(
  organizationId: string,
  params: ComputeHealthParams
): Promise<ContractorCustomerHealth> {
  const { healthScore, churnRisk, rosterUtilizationPct } = calculateContractorHealthScore(params);

  if (!isConfigured.supabase) {
    return {
      id: `health-mock-${organizationId}`,
      organization_id: organizationId,
      health_score: healthScore,
      churn_risk: churnRisk,
      weekly_active_days: params.weeklyActiveDays,
      roster_utilization_pct: rosterUtilizationPct,
      renewal_reminder_sent: (params.daysUntilExpiry ?? 30) <= 7,
      last_activity_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("contractor_customer_health")
    .upsert({
      organization_id: organizationId,
      health_score: healthScore,
      churn_risk: churnRisk,
      weekly_active_days: params.weeklyActiveDays,
      roster_utilization_pct: rosterUtilizationPct,
      renewal_reminder_sent: (params.daysUntilExpiry ?? 30) <= 7,
      last_activity_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error) {
    logger.error("Failed to sync contractor customer health", { error: String(error) });
    throw error;
  }
  return data;
}

/**
 * Fetches health score for an organization.
 */
export async function getContractorHealth(
  organizationId: string
): Promise<ContractorCustomerHealth | null> {
  if (!isConfigured.supabase) {
    return {
      id: `health-mock-${organizationId}`,
      organization_id: organizationId,
      health_score: 85,
      churn_risk: "low",
      weekly_active_days: 4,
      roster_utilization_pct: 72.0,
      renewal_reminder_sent: false,
      last_activity_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("contractor_customer_health")
    .select("*")
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) throw error;
  return data;
}
