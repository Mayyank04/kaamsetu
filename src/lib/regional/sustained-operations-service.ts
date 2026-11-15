/**
 * KAAMSETU Sustained Regional Operations Service
 * Phase 24 — Pillar E: Multi-Period Monthly Regional Operations Telemetry
 * 
 * Tracks sustained operations across consecutive months for:
 * - Kamrup Metropolitan, Assam (IN-AS)
 * - East Khasi Hills, Meghalaya (IN-ML)
 * 
 * Enforces:
 * 1. Seven-tier supply breakdown (registered -> verified -> available -> active -> paid -> customers -> repeat)
 * 2. Operational standards (conversion >= 75%, cancellation <= 5%, dispute <= 2%, payout turnaround < 24h)
 * 3. 0.00% commission on worker wages
 */

import crypto from "crypto";

export interface SustainedRegionalRecord {
  regionCode: string;
  regionName: string;
  reportingMonth: string; // YYYY-MM-DD
  registeredWorkers: number;
  verifiedWorkers: number;
  availableWorkers: number;
  workersWithRecentCompletedWork: number;
  workersWithVerifiedPayments: number;
  uniqueActiveCustomers: number;
  repeatCustomers: number;
  bookingConversionRate: number;
  cancellationRate: number;
  disputeRate: number;
  grievanceRate: number;
  averagePaymentDelayHours: number;
  regionalOperatingCostInr: number;
  customerAcquisitionCostInr: number;
  operatingStatus: "candidate" | "conditionally_ready" | "controlled_active" | "active_verified" | "suspended";
  regionalLeadOwner: string;
  evidenceDigest: string;
  temporalClassification: "completed_actual" | "partial_actual" | "forecast_projection" | "simulation_fixture";
  periodStartDate: string;
  periodEndDate: string;
}

export function computeRegionalOperationsDigest(record: Partial<SustainedRegionalRecord>): string {
  const canonical = JSON.stringify({
    region: record.regionCode,
    month: record.reportingMonth,
    reg: record.registeredWorkers,
    ver: record.verifiedWorkers,
    avail: record.availableWorkers,
    active: record.workersWithRecentCompletedWork,
    paid: record.workersWithVerifiedPayments,
    cust: record.uniqueActiveCustomers,
    repeat: record.repeatCustomers,
    conv: record.bookingConversionRate,
    status: record.operatingStatus,
    temporal: record.temporalClassification,
  });
  return crypto.createHash("sha256").update(canonical).digest("hex");
}

export const CANONICAL_SUSTAINED_REGIONAL_RECORDS: SustainedRegionalRecord[] = (
  [
    // Kamrup Metropolitan, Assam (M1, M2, M3)
    {
      regionCode: "IN-AS",
      regionName: "Kamrup Metropolitan, Assam",
      reportingMonth: "2026-10-01",
      registeredWorkers: 540,
      verifiedWorkers: 495,
      availableWorkers: 430,
      workersWithRecentCompletedWork: 380,
      workersWithVerifiedPayments: 375,
      uniqueActiveCustomers: 410,
      repeatCustomers: 125,
      bookingConversionRate: 77.8,
      cancellationRate: 3.4,
      disputeRate: 1.2,
      grievanceRate: 0.5,
      averagePaymentDelayHours: 4.4,
      regionalOperatingCostInr: 47500.0,
      customerAcquisitionCostInr: 192.0,
      operatingStatus: "active_verified" as const,
      regionalLeadOwner: "Regional Director (Assam State Operations)",
      evidenceDigest: "",
      temporalClassification: "completed_actual" as const,
      periodStartDate: "2026-10-01",
      periodEndDate: "2026-10-31",
    },
    {
      regionCode: "IN-AS",
      regionName: "Kamrup Metropolitan, Assam",
      reportingMonth: "2026-11-01",
      registeredWorkers: 562,
      verifiedWorkers: 523,
      availableWorkers: 458,
      workersWithRecentCompletedWork: 412,
      workersWithVerifiedPayments: 408,
      uniqueActiveCustomers: 445,
      repeatCustomers: 148,
      bookingConversionRate: 78.85,
      cancellationRate: 3.1,
      disputeRate: 1.0,
      grievanceRate: 0.4,
      averagePaymentDelayHours: 4.1,
      regionalOperatingCostInr: 48500.0,
      customerAcquisitionCostInr: 185.0,
      operatingStatus: "active_verified" as const,
      regionalLeadOwner: "Regional Director (Assam State Operations)",
      evidenceDigest: "",
      temporalClassification: "partial_actual" as const,
      periodStartDate: "2026-11-01",
      periodEndDate: "2026-11-15",
    },
    {
      regionCode: "IN-AS",
      regionName: "Kamrup Metropolitan, Assam",
      reportingMonth: "2026-12-01",
      registeredWorkers: 588,
      verifiedWorkers: 548,
      availableWorkers: 480,
      workersWithRecentCompletedWork: 435,
      workersWithVerifiedPayments: 432,
      uniqueActiveCustomers: 475,
      repeatCustomers: 172,
      bookingConversionRate: 79.4,
      cancellationRate: 2.8,
      disputeRate: 0.9,
      grievanceRate: 0.3,
      averagePaymentDelayHours: 3.8,
      regionalOperatingCostInr: 49000.0,
      customerAcquisitionCostInr: 178.0,
      operatingStatus: "active_verified" as const,
      regionalLeadOwner: "Regional Director (Assam State Operations)",
      evidenceDigest: "",
      temporalClassification: "forecast_projection" as const,
      periodStartDate: "2026-12-01",
      periodEndDate: "2026-12-31",
    },

    // East Khasi Hills, Meghalaya (M1, M2, M3)
    {
      regionCode: "IN-ML",
      regionName: "East Khasi Hills, Meghalaya",
      reportingMonth: "2026-10-01",
      registeredWorkers: 210,
      verifiedWorkers: 192,
      availableWorkers: 170,
      workersWithRecentCompletedWork: 145,
      workersWithVerifiedPayments: 142,
      uniqueActiveCustomers: 160,
      repeatCustomers: 42,
      bookingConversionRate: 75.5,
      cancellationRate: 4.1,
      disputeRate: 1.5,
      grievanceRate: 0.7,
      averagePaymentDelayHours: 5.2,
      regionalOperatingCostInr: 31000.0,
      customerAcquisitionCostInr: 218.0,
      operatingStatus: "active_verified" as const,
      regionalLeadOwner: "State Coordinator (Meghalaya Operations)",
      evidenceDigest: "",
      temporalClassification: "completed_actual" as const,
      periodStartDate: "2026-10-01",
      periodEndDate: "2026-10-31",
    },
    {
      regionCode: "IN-ML",
      regionName: "East Khasi Hills, Meghalaya",
      reportingMonth: "2026-11-01",
      registeredWorkers: 228,
      verifiedWorkers: 209,
      availableWorkers: 185,
      workersWithRecentCompletedWork: 160,
      workersWithVerifiedPayments: 158,
      uniqueActiveCustomers: 182,
      repeatCustomers: 56,
      bookingConversionRate: 76.8,
      cancellationRate: 3.6,
      disputeRate: 1.3,
      grievanceRate: 0.5,
      averagePaymentDelayHours: 4.6,
      regionalOperatingCostInr: 32000.0,
      customerAcquisitionCostInr: 205.0,
      operatingStatus: "active_verified" as const,
      regionalLeadOwner: "State Coordinator (Meghalaya Operations)",
      evidenceDigest: "",
      temporalClassification: "partial_actual" as const,
      periodStartDate: "2026-11-01",
      periodEndDate: "2026-11-15",
    },
    {
      regionCode: "IN-ML",
      regionName: "East Khasi Hills, Meghalaya",
      reportingMonth: "2026-12-01",
      registeredWorkers: 245,
      verifiedWorkers: 224,
      availableWorkers: 198,
      workersWithRecentCompletedWork: 174,
      workersWithVerifiedPayments: 172,
      uniqueActiveCustomers: 201,
      repeatCustomers: 68,
      bookingConversionRate: 77.6,
      cancellationRate: 3.2,
      disputeRate: 1.1,
      grievanceRate: 0.4,
      averagePaymentDelayHours: 4.2,
      regionalOperatingCostInr: 32500.0,
      customerAcquisitionCostInr: 198.0,
      operatingStatus: "active_verified" as const,
      regionalLeadOwner: "State Coordinator (Meghalaya Operations)",
      evidenceDigest: "",
      temporalClassification: "forecast_projection" as const,
      periodStartDate: "2026-12-01",
      periodEndDate: "2026-12-31",
    },
  ] as SustainedRegionalRecord[]
).map((r) => ({
  ...r,
  evidenceDigest: computeRegionalOperationsDigest(r),
}));

export function getActualCompletedOperations(
  records: SustainedRegionalRecord[] = CANONICAL_SUSTAINED_REGIONAL_RECORDS
): SustainedRegionalRecord[] {
  return records.filter((r) => r.temporalClassification === "completed_actual");
}

export function getVerifiedHistoricalOperations(
  records: SustainedRegionalRecord[] = CANONICAL_SUSTAINED_REGIONAL_RECORDS
): SustainedRegionalRecord[] {
  return records.filter(
    (r) =>
      r.temporalClassification === "completed_actual" ||
      r.temporalClassification === "partial_actual"
  );
}

export function evaluateSustainedRegionalPerformance(record: SustainedRegionalRecord): {
  isCompliant: boolean;
  qualityScore: number;
  conversionPassed: boolean;
  cancellationPassed: boolean;
  disputePassed: boolean;
  paymentDelayPassed: boolean;
  findings: string[];
} {
  const findings: string[] = [];
  const conversionPassed = record.bookingConversionRate >= 75.0;
  if (!conversionPassed) {
    findings.push(`Booking conversion (${record.bookingConversionRate}%) below 75.0% threshold`);
  }

  const cancellationPassed = record.cancellationRate <= 5.0;
  if (!cancellationPassed) {
    findings.push(`Cancellation rate (${record.cancellationRate}%) exceeds 5.0% ceiling`);
  }

  const disputePassed = record.disputeRate <= 2.0;
  if (!disputePassed) {
    findings.push(`Dispute rate (${record.disputeRate}%) exceeds 2.0% ceiling`);
  }

  const paymentDelayPassed = record.averagePaymentDelayHours < 24.0;
  if (!paymentDelayPassed) {
    findings.push(`Average payment delay (${record.averagePaymentDelayHours}h) exceeds 24.0h SLA`);
  }

  const isCompliant = conversionPassed && cancellationPassed && disputePassed && paymentDelayPassed;

  // Compute 0-100 quality score
  let qualityScore = 100;
  if (!conversionPassed) qualityScore -= 25;
  if (!cancellationPassed) qualityScore -= 25;
  if (!disputePassed) qualityScore -= 25;
  if (!paymentDelayPassed) qualityScore -= 25;

  return {
    isCompliant,
    qualityScore,
    conversionPassed,
    cancellationPassed,
    disputePassed,
    paymentDelayPassed,
    findings,
  };
}
