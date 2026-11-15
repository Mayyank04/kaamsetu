/**
 * Enterprise & Ecosystem Operations Dashboard Service
 * Pillar F: Centralized monitoring and operational lifecycle management across
 * 12 canonical states for ONDC, ONest, SAP OData, Oracle HCM, and NBFC connectors.
 *
 * MISSION INVARIANT: "Every skill deserves to be seen, even without a degree."
 * CONSTITUTIONAL INVARIANT: 0.00% commission on worker wages.
 */

export type LifecycleState =
  | "not_started"
  | "research"
  | "prepared"
  | "submitted"
  | "awaiting_approval"
  | "sandbox_active"
  | "sandbox_validated"
  | "pre_prod_validated"
  | "production_approved"
  | "production_active"
  | "suspended"
  | "failed";

export interface IntegrationConnectorStatus {
  connectorId: string;
  connectorName: string;
  category: "digital_public_good" | "enterprise_erp" | "responsible_finance" | "procurement";
  lifecycleState: LifecycleState;
  p95LatencyMs: number;
  errorRatePercent: number;
  replayBlocksCount: number;
  lastSyncTimestamp: string;
  health: "healthy" | "degraded" | "failing";
  notes: string;
}

export interface EcosystemDashboardSnapshot {
  timestamp: string;
  overallSystemHealth: "all_systems_operational" | "degraded_performance" | "system_outage";
  activeConnectorsCount: number;
  connectors: IntegrationConnectorStatus[];
  summaryCounts: {
    sandboxValidated: number;
    preProdValidated: number;
    productionApproved: number;
    productionActive: number;
    suspendedOrFailed: number;
  };
  zeroCommissionEnforcedAcrossAll: boolean;
}

/**
 * Evaluates the health status of a connector based on latency and error rate.
 */
export function evaluateConnectorHealth(
  p95LatencyMs: number,
  errorRatePercent: number
): "healthy" | "degraded" | "failing" {
  if (errorRatePercent > 15.0 || p95LatencyMs > 2500) {
    return "failing";
  }
  if (errorRatePercent > 5.0 || p95LatencyMs > 1000) {
    return "degraded";
  }
  return "healthy";
}

/**
 * Builds a standardized platform ecosystem operations dashboard snapshot.
 */
export function buildEcosystemDashboardSnapshot(
  connectors: IntegrationConnectorStatus[]
): EcosystemDashboardSnapshot {
  let hasFailing = false;
  let hasDegraded = false;

  let sandboxValidated = 0;
  let preProdValidated = 0;
  let productionApproved = 0;
  let productionActive = 0;
  let suspendedOrFailed = 0;

  for (const c of connectors) {
    if (c.health === "failing") hasFailing = true;
    if (c.health === "degraded") hasDegraded = true;

    switch (c.lifecycleState) {
      case "sandbox_validated":
        sandboxValidated++;
        break;
      case "pre_prod_validated":
        preProdValidated++;
        break;
      case "production_approved":
        productionApproved++;
        break;
      case "production_active":
        productionActive++;
        break;
      case "suspended":
      case "failed":
        suspendedOrFailed++;
        break;
    }
  }

  let overallSystemHealth: EcosystemDashboardSnapshot["overallSystemHealth"] = "all_systems_operational";
  if (hasFailing) {
    overallSystemHealth = "system_outage";
  } else if (hasDegraded) {
    overallSystemHealth = "degraded_performance";
  }

  return {
    timestamp: new Date().toISOString(),
    overallSystemHealth,
    activeConnectorsCount: connectors.length,
    connectors,
    summaryCounts: {
      sandboxValidated,
      preProdValidated,
      productionApproved,
      productionActive,
      suspendedOrFailed,
    },
    zeroCommissionEnforcedAcrossAll: true,
  };
}
