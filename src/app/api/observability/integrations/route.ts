import { NextResponse } from "next/server";
import {
  IntegrationObservabilityService,
  ConnectorHealthMetrics,
} from "@/lib/observability/integration-observability-service";

export async function GET() {
  const connectors: ConnectorHealthMetrics[] = [
    IntegrationObservabilityService.calculateConnectorHealth(
      "ondc_gateway",
      1240,
      12,
      210,
      new Date().toISOString(),
      2,
      0
    ),
    IntegrationObservabilityService.calculateConnectorHealth(
      "onest_dsep",
      840,
      5,
      180,
      new Date().toISOString(),
      0,
      0
    ),
    IntegrationObservabilityService.calculateConnectorHealth(
      "sap_successfactors",
      320,
      2,
      450,
      new Date().toISOString(),
      0,
      0
    ),
    IntegrationObservabilityService.calculateConnectorHealth(
      "oracle_fusion",
      280,
      1,
      490,
      new Date().toISOString(),
      0,
      0
    ),
    IntegrationObservabilityService.calculateConnectorHealth(
      "gem_procurement",
      510,
      0,
      160,
      new Date().toISOString(),
      0,
      0
    ),
    IntegrationObservabilityService.calculateConnectorHealth(
      "nbfc_readiness",
      410,
      3,
      140,
      new Date().toISOString(),
      0,
      1
    ),
  ];

  const snapshot = IntegrationObservabilityService.generateObservabilitySnapshot(connectors);
  return NextResponse.json(snapshot);
}
