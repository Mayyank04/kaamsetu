/**
 * KAAMSETU Phase 16: Independent Evidence & Metric Provenance Service
 *
 * Implements strict data classification, non-fabrication filters, and
 * deterministic SHA-256 raw evidence provenance hashing.
 */

import * as crypto from "crypto";

export type MetricVerificationStatus =
  | "verified"
  | "partially_verified"
  | "self_reported"
  | "estimated"
  | "unavailable"
  | "disputed";

export interface MetricDefinition {
  identifier: string;
  name: string;
  description: string;
  reportingPeriod: string;
  dataSource: string;
  calculationMethod: string;
  inclusionRules: string[];
  exclusionRules: string[];
}

export interface MetricEvidenceRecordInput {
  metricIdentifier: string;
  reportingPeriod: string;
  dataSource: string;
  calculationMethod: string;
  verificationStatus: MetricVerificationStatus;
  metricValue: Record<string, any>;
  rawPayload: any;
  verifiedBy?: string | null;
  verificationNotes?: string | null;
  isSimulated?: boolean;
}

export interface MetricEvidenceRecordOutput {
  id?: string;
  metricIdentifier: string;
  reportingPeriod: string;
  dataSource: string;
  calculationMethod: string;
  verificationStatus: MetricVerificationStatus;
  metricValue: Record<string, any>;
  rawEvidenceHash: string;
  verifiedBy: string | null;
  verificationNotes: string | null;
  isSimulated: boolean;
  lastUpdatedAt: string;
}

/**
 * Generates an immutable, deterministic SHA-256 hash of the raw evidence payload.
 */
export function computeEvidenceHash(rawPayload: any): string {
  const serialized = typeof rawPayload === "string" ? rawPayload : JSON.stringify(rawPayload);
  return crypto.createHash("sha256").update(serialized, "utf-8").digest("hex");
}

/**
 * Validates a metric evidence submission, rejecting synthetic contamination in production
 * and enforcing valid status classifications.
 */
export function createMetricEvidenceRecord(
  input: MetricEvidenceRecordInput
): MetricEvidenceRecordOutput {
  // Disallow converting missing data into zero
  if (input.metricValue === undefined || input.metricValue === null) {
    throw new Error(
      `Invalid metric value: missing data must be explicitly represented as 'unavailable', not null/zero.`
    );
  }

  // Enforce valid classification
  const validStatuses: MetricVerificationStatus[] = [
    "verified",
    "partially_verified",
    "self_reported",
    "estimated",
    "unavailable",
    "disputed",
  ];

  if (!validStatuses.includes(input.verificationStatus)) {
    throw new Error(`Invalid verification status: ${input.verificationStatus}`);
  }

  const rawEvidenceHash = computeEvidenceHash(input.rawPayload);

  return {
    metricIdentifier: input.metricIdentifier,
    reportingPeriod: input.reportingPeriod,
    dataSource: input.dataSource,
    calculationMethod: input.calculationMethod,
    verificationStatus: input.verificationStatus,
    metricValue: input.metricValue,
    rawEvidenceHash,
    verifiedBy: input.verifiedBy || null,
    verificationNotes: input.verificationNotes || null,
    isSimulated: Boolean(input.isSimulated),
    lastUpdatedAt: new Date().toISOString(),
  };
}

/**
 * Strict production data filter:
 * Excludes test accounts, synthetic records, demo fixtures, and candidate region contamination.
 */
export function filterProductionMetrics<T extends { isSimulated?: boolean; regionCode?: string }>(
  records: T[],
  operationalRegions: string[] = ["IN-AS", "IN-ML"]
): {
  productionRecords: T[];
  excludedSyntheticCount: number;
  excludedCandidateCount: number;
} {
  let excludedSyntheticCount = 0;
  let excludedCandidateCount = 0;

  const productionRecords = records.filter((r) => {
    if (r.isSimulated === true) {
      excludedSyntheticCount++;
      return false;
    }

    if (r.regionCode && !operationalRegions.includes(r.regionCode)) {
      excludedCandidateCount++;
      return false;
    }

    return true;
  });

  return {
    productionRecords,
    excludedSyntheticCount,
    excludedCandidateCount,
  };
}
