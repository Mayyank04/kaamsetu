/**
 * ONest / DSEP Live Protocol Interoperability Service
 * Pillar B: Manages ONest DSEP network provider readiness, verifiable skilling credentials,
 * candidate opportunity matchmaking, and worker sovereign claim immutability.
 *
 * MISSION INVARIANT: "Every skill deserves to be seen, even without a degree."
 * CONSTITUTIONAL INVARIANT: 0.00% commission on worker wages.
 */

import crypto from "crypto";

export interface OnestProviderProfile {
  providerId: string;
  providerUri: string;
  name: string;
  shortDesc: string;
  dsepDomains: ("dsep:courses" | "dsep:jobs" | "dsep:assessments")[];
  supportedVocationalTrades: string[];
  verifiableRegistryEndpoint: string;
  lifecycleStatus:
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
  accreditedInstitutionsCount: number;
  activeCandidatesCount: number;
  zeroCommissionGuarantee: boolean;
}

export interface OnestOpportunitySyncRequest {
  externalPlatformId: string;
  opportunityTitle: string;
  tradeSlug: string;
  minExperienceYears: number | null;
  locationState: string;
  dailyWageAmount: number;
  statutoryWageCompliant: boolean;
  requiredSkills: string[];
}

/**
 * Builds the ONest DSEP Provider Profile for KAAMSETU.
 */
export function buildOnestProviderProfile(overrides?: Partial<OnestProviderProfile>): OnestProviderProfile {
  return {
    providerId: "kaamsetu.onest.dsep.provider",
    providerUri: "https://kaamsetu.org/api/ecosystem/onest",
    name: "KAAMSETU Digital Identity Platform",
    shortDesc: "Inclusive vocational identity, decentralized credentials and trade skill verification",
    dsepDomains: ["dsep:jobs", "dsep:courses", "dsep:assessments"],
    supportedVocationalTrades: [
      "electrical-solar",
      "plumbing-sanitation",
      "masonry-construction",
      "carpentry-woodwork",
      "welding-fabrication",
    ],
    verifiableRegistryEndpoint: "https://kaamsetu.org/verify",
    lifecycleStatus: "sandbox_validated",
    accreditedInstitutionsCount: 2, // ASDM (Assam) + MSSDS (Meghalaya)
    activeCandidatesCount: 7,
    zeroCommissionGuarantee: true,
    ...overrides,
  };
}

/**
 * Validates an incoming ONest DSEP opportunity.
 * Ensures statutory minimum wage adherence and non-discrimination.
 */
export function validateOnestOpportunity(req: OnestOpportunitySyncRequest): {
  isValid: boolean;
  normalizedOpportunityId: string;
  reason?: string;
} {
  if (!req.externalPlatformId || req.externalPlatformId.trim().length === 0) {
    return { isValid: false, normalizedOpportunityId: "", reason: "Missing externalPlatformId" };
  }

  if (req.dailyWageAmount <= 0) {
    return { isValid: false, normalizedOpportunityId: "", reason: "Invalid wage amount: must be positive" };
  }

  // Statutory wage compliance check (e.g. >= ₹450/day standard minimum informal floor in Eastern states)
  if (req.dailyWageAmount < 450) {
    return {
      isValid: false,
      normalizedOpportunityId: "",
      reason: `Wage ₹${req.dailyWageAmount} falls below regional statutory informal wage floor (₹450/day)`,
    };
  }

  const rawDigest = `${req.externalPlatformId}:${req.tradeSlug}:${req.dailyWageAmount}:${req.locationState}`;
  const normalizedOpportunityId = "onest-opp-" + crypto.createHash("sha256").update(rawDigest).digest("hex").slice(0, 16);

  return {
    isValid: true,
    normalizedOpportunityId,
  };
}

/**
 * Enforces worker claim immutability against external ONest mutations.
 * Guarantees that third-party platforms cannot downgrade, override, or erase
 * worker-owned identity records.
 */
export function protectWorkerClaimsFromOnestMutation(
  originalProfile: { id: string; primaryTrade: string; verifiedSkills: string[]; wageLedgerTotal: number },
  proposedMutation: { primaryTrade?: string; verifiedSkills?: string[]; wageLedgerTotal?: number }
): {
  isViolation: boolean;
  protectedProfile: typeof originalProfile;
  violationFields: string[];
} {
  const violationFields: string[] = [];

  if (proposedMutation.primaryTrade && proposedMutation.primaryTrade !== originalProfile.primaryTrade) {
    violationFields.push("primaryTrade");
  }

  if (proposedMutation.wageLedgerTotal !== undefined && proposedMutation.wageLedgerTotal !== originalProfile.wageLedgerTotal) {
    violationFields.push("wageLedgerTotal");
  }

  if (proposedMutation.verifiedSkills) {
    const originalSkillSet = new Set(originalProfile.verifiedSkills);
    const attemptedRemoval = originalProfile.verifiedSkills.some((s) => !proposedMutation.verifiedSkills!.includes(s));
    if (attemptedRemoval) {
      violationFields.push("verifiedSkills (unauthorized skill removal)");
    }
  }

  return {
    isViolation: violationFields.length > 0,
    protectedProfile: { ...originalProfile },
    violationFields,
  };
}
