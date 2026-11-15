/**
 * National Integration Observability Service
 * Pillar J: Aggregates real-time operational health, synchronization telemetry,
 * error rates, and security alarms across all external ecosystem connectors.
 *
 * MISSION INVARIANT: "Every skill deserves to be seen, even without a degree."
 * CONSTITUTIONAL INVARIANT: 0.00% commission on worker wages.
 */

export interface ConnectorHealthMetrics {
  connectorName: "ondc_gateway" | "onest_dsep" | "sap_successfactors" | "oracle_fusion" | "gem_procurement" | "nbfc_readiness";
  status: "healthy" | "degraded" | "failing" | "maintenance";
  uptimePercent: number;
  totalRequests24h: number;
  failedRequests24h: number;
  errorRatePercent: number;
  avgLatencyMs: number;
  lastSuccessfulSyncAt: string;
  replayAttacksBlocked24h: number;
  rateLimitHits24h: number;
}

export interface ObservabilitySnapshot {
  systemTimestamp: string;
  activeConnectorsCount: number;
  overallStatus: "all_systems_operational" | "degraded_performance" | "critical_attention_required";
  connectors: ConnectorHealthMetrics[];
  securityAlarms: string[];
}

export class IntegrationObservabilityService {
  /**
   * Evaluates connector operational health status from telemetry counters
   */
  public static calculateConnectorHealth(
    connectorName: ConnectorHealthMetrics["connectorName"],
    totalRequests: number,
    failedRequests: number,
    avgLatencyMs: number,
    lastSyncTimestamp: string,
    replayBlocks: number = 0,
    rateLimitHits: number = 0
  ): ConnectorHealthMetrics {
    const errorRate = totalRequests > 0 ? (failedRequests / totalRequests) * 100 : 0;
    const uptime = totalRequests > 0 ? Math.max(0, 100 - errorRate) : 100;

    let status: ConnectorHealthMetrics["status"] = "healthy";
    if (errorRate >= 15 || avgLatencyMs >= 3000) {
      status = "failing";
    } else if (errorRate >= 5 || avgLatencyMs >= 1000) {
      status = "degraded";
    }

    return {
      connectorName,
      status,
      uptimePercent: Number(uptime.toFixed(2)),
      totalRequests24h: totalRequests,
      failedRequests24h: failedRequests,
      errorRatePercent: Number(errorRate.toFixed(2)),
      avgLatencyMs,
      lastSuccessfulSyncAt: lastSyncTimestamp,
      replayAttacksBlocked24h: replayBlocks,
      rateLimitHits24h: rateLimitHits,
    };
  }

  /**
   * Compiles high-level platform observability dashboard snapshot
   */
  public static generateObservabilitySnapshot(
    connectors: ConnectorHealthMetrics[]
  ): ObservabilitySnapshot {
    const failingCount = connectors.filter((c) => c.status === "failing").length;
    const degradedCount = connectors.filter((c) => c.status === "degraded").length;

    let overallStatus: ObservabilitySnapshot["overallStatus"] = "all_systems_operational";
    if (failingCount > 0) {
      overallStatus = "critical_attention_required";
    } else if (degradedCount > 0) {
      overallStatus = "degraded_performance";
    }

    const securityAlarms: string[] = [];
    for (const c of connectors) {
      if (c.replayAttacksBlocked24h > 10) {
        securityAlarms.push(
          `Security Alert: High replay attack volume detected on ${c.connectorName} (${c.replayAttacksBlocked24h} attempts blocked).`
        );
      }
      if (c.rateLimitHits24h > 50) {
        securityAlarms.push(
          `Capacity Alert: Elevated partner rate-limit throttling on ${c.connectorName} (${c.rateLimitHits24h} throttles).`
        );
      }
    }

    return {
      systemTimestamp: new Date().toISOString(),
      activeConnectorsCount: connectors.length,
      overallStatus,
      connectors,
      securityAlarms,
    };
  }
}
