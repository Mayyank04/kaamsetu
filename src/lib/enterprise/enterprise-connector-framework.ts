/**
 * Enterprise ERP Integration Framework
 * Pillar C: Implements provider-neutral connectors for SAP SuccessFactors,
 * Oracle Fusion Cloud HCM, and Government e-Marketplace (GeM) workforce compliance.
 *
 * MISSION INVARIANT: "Every skill deserves to be seen, even without a degree."
 * CONSTITUTIONAL INVARIANT: 0.00% commission on worker wages.
 */

import crypto from "crypto";

export type ErpSystemType =
  | "sap_successfactors"
  | "oracle_fusion_hcm"
  | "gem_procurement"
  | "generic_scim_erp";

export interface EnterpriseCredentials {
  systemType: ErpSystemType;
  clientId: string;
  clientSecret: string;
  endpointUrl: string;
  tenantId?: string;
  companyId?: string;
}

export interface NormalizedWorkforceRecord {
  externalWorkerRef: string; // Enterprise employee/contractor ID (e.g. "SAP-EMP-1002")
  kaamsetuWorkerId?: string; // Anonymized internal UUID
  trade: string;
  skills: string[];
  assignedProjectRef: string;
  deploymentLocation: {
    district: string;
    state: string;
  };
  statutoryWageCompliant: boolean;
  dailyRate: number;
  epfEsicEnrolled?: boolean;
}

export interface EnterpriseSyncRequest {
  contractorOrgId: string;
  systemType: ErpSystemType;
  direction: "inbound" | "outbound" | "bidirectional";
  workforceRecords: NormalizedWorkforceRecord[];
  idempotencyKey?: string;
}

export interface EnterpriseSyncResponse {
  syncId: string;
  status: "success" | "partial_success" | "failed" | "blocked_consent_missing";
  recordsProcessed: number;
  recordsFailed: number;
  idempotencyHash: string;
  errorSummary?: string;
  anonymizedTelemetry: boolean;
}

export class EnterpriseConnectorFramework {
  /**
   * Generates a deterministic idempotency hash for enterprise sync requests
   */
  public static computeSyncIdempotencyHash(req: EnterpriseSyncRequest): string {
    const raw = `${req.contractorOrgId}:${req.systemType}:${req.direction}:${req.workforceRecords.length}:${req.idempotencyKey || ""}`;
    return crypto.createHash("sha256").update(raw).digest("hex");
  }

  /**
   * Normalizes SAP SuccessFactors OData payload into KAAMSETU workforce records
   */
  public static mapSapSuccessFactorsPayload(sapData: {
    userId: string;
    title: string;
    department: string;
    location: string;
    skills?: string[];
    costCenter?: string;
  }): NormalizedWorkforceRecord {
    const locParts = sapData.location.split(",");
    const district = locParts[0]?.trim() || "Guwahati";
    const state = locParts[1]?.trim() || "Assam";

    return {
      externalWorkerRef: `SAP-${sapData.userId}`,
      trade: sapData.title || "Skilled Tradesperson",
      skills: sapData.skills || [sapData.department],
      assignedProjectRef: sapData.costCenter || "DEFAULT-PROJECT",
      deploymentLocation: {
        district,
        state,
      },
      statutoryWageCompliant: true,
      dailyRate: 950.0,
      epfEsicEnrolled: true,
    };
  }

  /**
   * Normalizes Oracle Fusion Cloud HCM REST payload
   */
  public static mapOracleFusionPayload(oracleData: {
    PersonNumber: string;
    JobName: string;
    WorkLocation: string;
    Competencies?: Array<{ CompetencyName: string }>;
    ProjectCode?: string;
  }): NormalizedWorkforceRecord {
    return {
      externalWorkerRef: `ORCL-${oracleData.PersonNumber}`,
      trade: oracleData.JobName || "Technician",
      skills: (oracleData.Competencies || []).map((c) => c.CompetencyName),
      assignedProjectRef: oracleData.ProjectCode || "ORCL-SITE-A",
      deploymentLocation: {
        district: oracleData.WorkLocation || "East Khasi Hills",
        state: "Meghalaya",
      },
      statutoryWageCompliant: true,
      dailyRate: 1000.0,
      epfEsicEnrolled: true,
    };
  }

  /**
   * Generates GeM (Government e-Marketplace) compliance verification token
   * Verifies local workforce quota adherence and statutory minimum wage compliance
   * without exposing workers' unconsented personal information.
   */
  public static generateGeMComplianceDescriptor(
    tenderId: string,
    contractorOrgId: string,
    deployedWorkers: NormalizedWorkforceRecord[]
  ): {
    tenderId: string;
    contractorOrgId: string;
    totalWorkforceDeployed: number;
    statutoryMinimumWageCompliantRatio: number;
    localDistrictWorkforceRatio: number;
    complianceStatus: "compliant" | "non_compliant" | "under_review";
    verificationDigest: string;
  } {
    const total = deployedWorkers.length;
    if (total === 0) {
      throw new Error("Cannot generate GeM compliance descriptor for empty workforce deployment.");
    }

    const wageCompliantCount = deployedWorkers.filter((w) => w.statutoryWageCompliant).length;
    const localWorkerCount = deployedWorkers.filter(
      (w) => w.deploymentLocation.state === "Assam" || w.deploymentLocation.state === "Meghalaya"
    ).length;

    const wageRatio = wageCompliantCount / total;
    const localRatio = localWorkerCount / total;

    const isCompliant = wageRatio >= 1.0 && localRatio >= 0.5; // 100% min wage + 50% local quota

    const digestPayload = `${tenderId}:${contractorOrgId}:${total}:${wageRatio}:${localRatio}`;
    const digest = crypto.createHash("sha256").update(digestPayload).digest("hex");

    return {
      tenderId,
      contractorOrgId,
      totalWorkforceDeployed: total,
      statutoryMinimumWageCompliantRatio: Number(wageRatio.toFixed(4)),
      localDistrictWorkforceRatio: Number(localRatio.toFixed(4)),
      complianceStatus: isCompliant ? "compliant" : "non_compliant",
      verificationDigest: digest,
    };
  }

  /**
   * Enforces separation of enterprise employee reference from sovereign worker identity
   */
  public static validateEnterpriseIdentifierBoundary(
    externalRef: string,
    internalKaamsetuId: string
  ): { isValid: boolean; reason?: string } {
    if (externalRef === internalKaamsetuId) {
      return {
        isValid: false,
        reason: "Enterprise reference must NOT be equal to internal worker UUID to prevent leakage of sovereign registry identifier.",
      };
    }
    return { isValid: true };
  }
}
