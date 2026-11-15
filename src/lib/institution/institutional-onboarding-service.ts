/**
 * Institutional Onboarding & Lifecycle Governance Service
 * Pillar E: Enforces the formal 8-stage institutional onboarding workflow,
 * validates required proofs at each stage, and distinguishes legal MoUs from active technical integrations.
 */

export type InstitutionalOnboardingStage =
  | "initial_application"
  | "organization_verified"
  | "signatory_validated"
  | "integration_review"
  | "sandbox_testing"
  | "security_approved"
  | "production_active"
  | "periodic_reverification";

const ORDERED_STAGES: InstitutionalOnboardingStage[] = [
  "initial_application",
  "organization_verified",
  "signatory_validated",
  "integration_review",
  "sandbox_testing",
  "security_approved",
  "production_active",
  "periodic_reverification",
];

export interface InstitutionalLifecycleRecord {
  id?: string;
  institutionId: string;
  stage: InstitutionalOnboardingStage;
  stageStatus: "in_progress" | "completed" | "blocked" | "failed";
  completedStages: InstitutionalOnboardingStage[];
  mouReference?: string;
  mouSignedAt?: string;
  technicalIntegrationVerified: boolean;
  sandboxTestPassed: boolean;
  securitySignoffBy?: string;
  authorizedSignatoryName?: string;
  authorizedSignatoryDesignation?: string;
  blockers: string[];
  lastReverifiedAt?: string;
}

export function validateInstitutionalStageTransition(
  currentRecord: InstitutionalLifecycleRecord,
  targetStage: InstitutionalOnboardingStage
): { canTransition: boolean; blockingReasons: string[] } {
  const blockingReasons: string[] = [];

  const currentIndex = ORDERED_STAGES.indexOf(currentRecord.stage);
  const targetIndex = ORDERED_STAGES.indexOf(targetStage);

  if (targetIndex < 0) {
    blockingReasons.push(`Invalid target stage: ${targetStage}`);
    return { canTransition: false, blockingReasons };
  }

  // Stages cannot be skipped forward arbitrarily
  if (targetIndex > currentIndex + 1 && targetStage !== "periodic_reverification") {
    blockingReasons.push(
      `Cannot skip stages: currently at ${currentRecord.stage}, cannot jump directly to ${targetStage}`
    );
  }

  // Specific prerequisite validations per stage
  if (targetStage === "organization_verified" && !currentRecord.mouSignedAt) {
    blockingReasons.push("Bilateral Institutional MoU signed date is missing.");
  }

  if (targetStage === "signatory_validated" && !currentRecord.authorizedSignatoryName) {
    blockingReasons.push("Authorized signatory identity and key fingerprint must be registered.");
  }

  if (targetStage === "security_approved" && !currentRecord.sandboxTestPassed) {
    blockingReasons.push("Sandbox API test suite must be passed before security signoff.");
  }

  if (targetStage === "production_active") {
    if (!currentRecord.technicalIntegrationVerified) {
      blockingReasons.push("Technical API integration is not verified.");
    }
    if (!currentRecord.sandboxTestPassed) {
      blockingReasons.push("Sandbox verification test has not passed.");
    }
    if (!currentRecord.securitySignoffBy) {
      blockingReasons.push("Security officer signoff is required for production activation.");
    }
  }

  return {
    canTransition: blockingReasons.length === 0,
    blockingReasons,
  };
}

export function evaluateInstitutionProductionReadiness(record: InstitutionalLifecycleRecord): {
  isProductionReady: boolean;
  statusLabel: string;
  reason?: string;
} {
  // A signed MoU alone DOES NOT equal production readiness
  if (record.mouSignedAt && record.stage !== "production_active") {
    return {
      isProductionReady: false,
      statusLabel: "mou_signed_integration_pending",
      reason: "Bilateral agreement signed, but technical onboarding workflow is still in progress.",
    };
  }

  if (record.stage === "production_active" && record.technicalIntegrationVerified && record.securitySignoffBy) {
    return {
      isProductionReady: true,
      statusLabel: "production_verified",
    };
  }

  return {
    isProductionReady: false,
    statusLabel: "onboarding_in_progress",
    reason: `Currently in stage '${record.stage}' with status '${record.stageStatus}'.`,
  };
}
