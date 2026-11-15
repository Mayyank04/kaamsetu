/**
 * Institutional Instrument Assurance & Legal Review Service
 * Pillar F: Institutional Ratification & 10-Status Legal Lifecycle
 *
 * MISSION INVARIANT: "Every skill deserves to be seen, even without a degree."
 * GOVERNING RULE: An executed MoU is not proof of operational activity.
 * An executed contract is not proof of worker deployment.
 */

import crypto from "crypto";

export type LegalReviewStatus =
  | "research_only"
  | "discussion"
  | "proposal_submitted"
  | "draft_under_review"
  | "awaiting_signature"
  | "executed"
  | "effective"
  | "suspended"
  | "expired"
  | "terminated";

export interface InstitutionalInstrumentRecord {
  id: string;
  institutionCode: string;
  institutionName: string;
  category: "state_skill_mission" | "open_network_ondc" | "open_network_onest" | "regulated_nbfc" | "enterprise_epc" | "training_partner";
  instrumentType: "institutional_mou" | "network_whitelisting_key" | "tripartite_lsp_agreement" | "commercial_contract" | "accreditation_charter";
  legalEntityName: string;
  authorizedSignatory: string;
  documentReference: string | null;
  executionDate: string | null;
  effectiveDate: string | null;
  expiryDate: string | null;
  geographicScope: string;
  legalReviewStatus: LegalReviewStatus;
  independentEvidenceRef: string;
  reviewedBy: string;
  evidenceSha256: string;
  updatedAt: string;
}

/**
 * Builds an institutional instrument review with strict status gating.
 */
export function buildInstitutionalInstrumentReview(params: {
  institutionCode: string;
  institutionName: string;
  category: InstitutionalInstrumentRecord["category"];
  instrumentType: InstitutionalInstrumentRecord["instrumentType"];
  legalEntityName: string;
  authorizedSignatory: string;
  documentReference?: string;
  executionDate?: string;
  effectiveDate?: string;
  expiryDate?: string;
  geographicScope: string;
  legalReviewStatus: LegalReviewStatus;
  independentEvidenceRef: string;
  reviewedBy: string;
}): InstitutionalInstrumentRecord {
  // Prohibit executed/effective status without valid document reference and execution date
  if (
    (params.legalReviewStatus === "executed" || params.legalReviewStatus === "effective") &&
    (!params.documentReference || !params.executionDate)
  ) {
    throw new Error(
      `Cannot certify instrument status as '${params.legalReviewStatus}' without an authentic document reference and execution date.`
    );
  }

  const now = new Date().toISOString();
  const id = `inst-rev-${params.institutionCode.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${crypto.randomUUID().slice(0, 8)}`;

  const rawDigest = {
    code: params.institutionCode,
    name: params.institutionName,
    entity: params.legalEntityName,
    status: params.legalReviewStatus,
    ref: params.documentReference || null,
    execDate: params.executionDate || null,
  };
  const evidenceSha256 = crypto
    .createHash("sha256")
    .update(JSON.stringify(rawDigest))
    .digest("hex");

  return {
    id,
    institutionCode: params.institutionCode,
    institutionName: params.institutionName,
    category: params.category,
    instrumentType: params.instrumentType,
    legalEntityName: params.legalEntityName,
    authorizedSignatory: params.authorizedSignatory,
    documentReference: params.documentReference || null,
    executionDate: params.executionDate || null,
    effectiveDate: params.effectiveDate || null,
    expiryDate: params.expiryDate || null,
    geographicScope: params.geographicScope,
    legalReviewStatus: params.legalReviewStatus,
    independentEvidenceRef: params.independentEvidenceRef,
    reviewedBy: params.reviewedBy,
    evidenceSha256,
    updatedAt: now,
  };
}

/**
 * Returns the comprehensive registry of institutional instruments.
 */
export function getRegisteredInstitutionalInstruments(): InstitutionalInstrumentRecord[] {
  return [
    buildInstitutionalInstrumentReview({
      institutionCode: "GOV-ASDM-01",
      institutionName: "Assam Skill Development Mission",
      category: "state_skill_mission",
      instrumentType: "institutional_mou",
      legalEntityName: "Assam Skill Development Mission, Skill Employment & Entrepreneurship Dept, Govt of Assam",
      authorizedSignatory: "Mission Director, ASDM",
      documentReference: "ASDM/KAAMSETU/MOU/2026/01",
      executionDate: "2026-01-15",
      effectiveDate: "2026-01-15",
      expiryDate: "2028-01-14",
      geographicScope: "State of Assam (All 35 Districts)",
      legalReviewStatus: "effective",
      independentEvidenceRef: "STAMP-PAPER-RS100-KAMRUP-2026-8912",
      reviewedBy: "KAAMSETU-LEGAL-COUNSEL",
    }),
    buildInstitutionalInstrumentReview({
      institutionCode: "ONDC-BPP-ADAPTER",
      institutionName: "Open Network for Digital Commerce",
      category: "open_network_ondc",
      instrumentType: "network_whitelisting_key",
      legalEntityName: "Open Network for Digital Commerce (Section 8 Company, DPIIT)",
      authorizedSignatory: "VP Network Operations, ONDC",
      geographicScope: "National Digital Commerce Network",
      legalReviewStatus: "awaiting_signature", // Staging passed, production key ceremony pending
      independentEvidenceRef: "ONDC-STAGING-CERT-10OF10-PASS",
      reviewedBy: "KAAMSETU-OPEN-NETWORK-LEAD",
    }),
    buildInstitutionalInstrumentReview({
      institutionCode: "ONEST-DSEP-ADAPTER",
      institutionName: "ONest DSEP Workforce Consortium",
      category: "open_network_onest",
      instrumentType: "network_whitelisting_key",
      legalEntityName: "ONest DSEP Open Skilling Consortium",
      authorizedSignatory: "Lead Architect, ONest Network Registry",
      geographicScope: "National Decentralized Skilling Network",
      legalReviewStatus: "awaiting_signature",
      independentEvidenceRef: "ONEST-SCHEMA2.0-CONFORMANCE-PASS",
      reviewedBy: "KAAMSETU-OPEN-NETWORK-LEAD",
    }),
    buildInstitutionalInstrumentReview({
      institutionCode: "NBFC-TOOL-FIN-01",
      institutionName: "North East Micro & Tool Finance NBFC",
      category: "regulated_nbfc",
      instrumentType: "tripartite_lsp_agreement",
      legalEntityName: "North East Micro & Tool Finance Limited (RBI Regulated NBFC-ML)",
      authorizedSignatory: "Head of Credit & Digital Lending",
      geographicScope: "Assam and Meghalaya Corridors",
      legalReviewStatus: "draft_under_review",
      independentEvidenceRef: "RBI-2022-KFS-COMPLIANCE-SANDBOX-TEST",
      reviewedBy: "KAAMSETU-FINANCIAL-CONTROLLER",
    }),
    buildInstitutionalInstrumentReview({
      institutionCode: "EPC-NHIDCL-AS-01",
      institutionName: "Assam Highway Infra Projects",
      category: "enterprise_epc",
      instrumentType: "commercial_contract",
      legalEntityName: "Assam Highway Infrastructure Projects Pvt Ltd (Prime NHIDCL EPC Contractor)",
      authorizedSignatory: "Rajesh Baruah (VP Operations)",
      geographicScope: "NH-27 Highway Expansion Sector, Kamrup Metro",
      legalReviewStatus: "draft_under_review",
      independentEvidenceRef: "GEM-CONTRACT-FORM-B-ROSTER-SYNC-45",
      reviewedBy: "KAAMSETU-ENTERPRISE-LEAD",
    }),
    buildInstitutionalInstrumentReview({
      institutionCode: "GOV-TSDM-01",
      institutionName: "Tripura Skill Development Mission",
      category: "state_skill_mission",
      instrumentType: "institutional_mou",
      legalEntityName: "Tripura Skill Development Mission, Govt of Tripura",
      authorizedSignatory: "Director of Skill Development, Tripura",
      geographicScope: "State of Tripura",
      legalReviewStatus: "research_only",
      independentEvidenceRef: "TSDM-RPL-EXPLORATORY-NOTE-2026",
      reviewedBy: "KAAMSETU-REGIONAL-STRATEGIST",
    }),
  ];
}
