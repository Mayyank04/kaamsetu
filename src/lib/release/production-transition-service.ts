/**
 * KAAMSETU Production Transition & Release Manifest Service
 * Phase 23 — Pillar A: Formal Release Manifests & Deployment Governance
 */

import crypto from "crypto";

export type DeploymentEnvironment =
  | "development"
  | "staging"
  | "preproduction"
  | "production_ready"
  | "approved_for_release"
  | "deployed"
  | "rolled_back"
  | "blocked";

export interface ReleaseManifestInput {
  commitSha: string;
  buildArtifact: string;
  migrationVersion: string;
  environment: DeploymentEnvironment;
  configurationVersion: string;
  dependencyVersions: Record<string, string>;
  securityScanResult: {
    criticalVulnerabilities: number;
    highVulnerabilities: number;
    rlsCoveragePercent: number;
    scanner: string;
    passed: boolean;
  };
  approvalOwner: string;
  rollbackPlan: string;
  notes?: string;
}

export interface ProductionReleaseManifestRecord {
  id: string;
  commitSha: string;
  buildArtifact: string;
  migrationVersion: string;
  environment: DeploymentEnvironment;
  configurationVersion: string;
  dependencyVersions: Record<string, string>;
  securityScanResult: {
    criticalVulnerabilities: number;
    highVulnerabilities: number;
    rlsCoveragePercent: number;
    scanner: string;
    passed: boolean;
  };
  approvalOwner: string;
  deploymentStatus: DeploymentEnvironment;
  rollbackPlan: string;
  evidenceDigest: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export function computeReleaseManifestDigest(input: ReleaseManifestInput): string {
  const canonical = JSON.stringify({
    commitSha: input.commitSha,
    buildArtifact: input.buildArtifact,
    migrationVersion: input.migrationVersion,
    environment: input.environment,
    configurationVersion: input.configurationVersion,
    scannerPassed: input.securityScanResult.passed,
    approvalOwner: input.approvalOwner,
    rollbackPlan: input.rollbackPlan,
  });
  return crypto.createHash("sha256").update(canonical).digest("hex");
}

export function validateReleaseManifest(input: ReleaseManifestInput): {
  isValid: boolean;
  canDeploy: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Commit SHA must be 7-40 hex chars
  if (!/^[0-9a-f]{7,40}$/i.test(input.commitSha)) {
    errors.push("Invalid commit SHA: must be 7-40 hexadecimal characters");
  }

  // Security scan validation
  if (!input.securityScanResult.passed) {
    errors.push("Security scan failed: release blocked from production");
  }
  if (input.securityScanResult.criticalVulnerabilities > 0) {
    errors.push(`Critical vulnerabilities detected (${input.securityScanResult.criticalVulnerabilities}): deployment blocked`);
  }
  if (input.securityScanResult.rlsCoveragePercent < 100.0) {
    errors.push(`RLS coverage (${input.securityScanResult.rlsCoveragePercent}%) is below mandatory 100.0% threshold`);
  }

  // Rollback plan mandatory
  if (!input.rollbackPlan || input.rollbackPlan.trim().length < 20) {
    errors.push("Rollback plan is missing or too brief (minimum 20 characters required)");
  }

  // Strict transition rule: 'deployed' requires prior explicit approval
  let canDeploy = false;
  if (
    input.environment === "approved_for_release" &&
    input.securityScanResult.passed &&
    input.securityScanResult.criticalVulnerabilities === 0 &&
    input.securityScanResult.rlsCoveragePercent === 100.0
  ) {
    canDeploy = true;
  }

  // Anti-conflation: 'production_ready' is NOT 'deployed'
  if (input.environment === "production_ready") {
    // Valid state, but not deployed
    canDeploy = false;
  }

  return {
    isValid: errors.length === 0,
    canDeploy,
    errors,
  };
}

export function createReleaseManifestRecord(
  input: ReleaseManifestInput
): ProductionReleaseManifestRecord {
  const validation = validateReleaseManifest(input);
  if (!validation.isValid) {
    throw new Error(`Release manifest validation failed: ${validation.errors.join("; ")}`);
  }

  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    commitSha: input.commitSha,
    buildArtifact: input.buildArtifact,
    migrationVersion: input.migrationVersion,
    environment: input.environment,
    configurationVersion: input.configurationVersion,
    dependencyVersions: input.dependencyVersions,
    securityScanResult: input.securityScanResult,
    approvalOwner: input.approvalOwner,
    deploymentStatus: input.environment,
    rollbackPlan: input.rollbackPlan,
    evidenceDigest: computeReleaseManifestDigest(input),
    notes: input.notes || null,
    createdAt: now,
    updatedAt: now,
  };
}
