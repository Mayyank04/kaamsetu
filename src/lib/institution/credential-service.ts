import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSigningKeyForVersion, DEFAULT_KEY_VERSION } from "@/lib/crypto/credential-signer";

export type CredentialStatus = "issued" | "verified" | "suspended" | "revoked";

export interface IssueCredentialInput {
  institutionId: string;
  cohortId: string;
  participantId: string;
  workerProfileId: string;
  tradeTitle: string;
  nsqfLevel: number;
  assessmentReference: string;
  authorizedIssuerName: string;
  authorizedIssuerRole: string;
  learnerConsentObtained?: boolean;
}

export interface VerificationResult {
  isValid: boolean;
  status: CredentialStatus;
  credentialIdentifier: string;
  tradeTitle: string;
  nsqfLevel: number;
  authorizedIssuerName: string;
  authorizedIssuerRole: string;
  issuedAt: string;
  verifiedAt?: string | null;
  revokedAt?: string | null;
  revocationReason?: string | null;
  signatureVerified: boolean;
  tamperEvident: boolean;
  institutionName?: string;
  workerName?: string;
  reason?: string;
}

/**
 * Computes canonical hash for institutional credential integrity verification
 */
export function computeCanonicalCredentialHash(data: {
  credentialIdentifier: string;
  workerProfileId: string;
  institutionId: string;
  cohortId: string;
  tradeTitle: string;
  nsqfLevel: number;
  assessmentReference: string;
  issuedAt: string;
  schemaVersion: string;
}): string {
  const canonicalString = JSON.stringify({
    assessmentReference: data.assessmentReference,
    cohortId: data.cohortId,
    credentialIdentifier: data.credentialIdentifier,
    institutionId: data.institutionId,
    issuedAt: data.issuedAt,
    nsqfLevel: data.nsqfLevel,
    schemaVersion: data.schemaVersion,
    tradeTitle: data.tradeTitle,
    workerProfileId: data.workerProfileId,
  });

  return crypto.createHash("sha256").update(canonicalString, "utf8").digest("hex");
}

function getSigningSecret(): string {
  const resolution = getSigningKeyForVersion(DEFAULT_KEY_VERSION);
  if (resolution.key) return resolution.key;
  if (process.env.CREDENTIAL_SIGNING_KEY) return process.env.CREDENTIAL_SIGNING_KEY;
  return "kaamsetu-default-test-signing-key-32-chars-long";
}

/**
 * Issues an auditable, cryptographically signed institutional credential
 */
export async function issueInstitutionalCredential(input: IssueCredentialInput) {
  const supabase = createAdminClient();
  if (!supabase) throw new Error("Database client unavailable");

  // Validate learner consent requirement
  if (input.learnerConsentObtained === false) {
    throw new Error("Explicit learner consent is required to issue and anchor institutional credentials");
  }

  const rawRandom = crypto.randomBytes(6).toString("hex").toUpperCase();
  const credentialIdentifier = `KST-INST-${input.nsqfLevel}-${rawRandom}`;
  const issuedAt = new Date().toISOString();
  const schemaVersion = "2.0";

  const canonicalHash = computeCanonicalCredentialHash({
    credentialIdentifier,
    workerProfileId: input.workerProfileId,
    institutionId: input.institutionId,
    cohortId: input.cohortId,
    tradeTitle: input.tradeTitle,
    nsqfLevel: input.nsqfLevel,
    assessmentReference: input.assessmentReference,
    issuedAt,
    schemaVersion,
  });

  const secret = getSigningSecret();
  const integritySignature = crypto
    .createHmac("sha256", secret)
    .update(canonicalHash, "utf8")
    .digest("hex");

  const { data, error } = await supabase
    .from("institutional_credentials")
    .insert({
      institution_id: input.institutionId,
      cohort_id: input.cohortId,
      participant_id: input.participantId,
      worker_profile_id: input.workerProfileId,
      credential_identifier: credentialIdentifier,
      trade_title: input.tradeTitle,
      nsqf_level: input.nsqfLevel,
      assessment_reference: input.assessmentReference,
      authorized_issuer_name: input.authorizedIssuerName,
      authorized_issuer_role: input.authorizedIssuerRole,
      learner_consent_obtained: input.learnerConsentObtained ?? true,
      status: "issued",
      issued_at: issuedAt,
      schema_version: schemaVersion,
      integrity_signature: integritySignature,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to issue institutional credential: ${error.message}`);
  }

  return data;
}

/**
 * Verifies an institutional credential by its public identifier
 */
export async function verifyInstitutionalCredentialByIdentifier(
  credentialIdentifier: string
): Promise<VerificationResult> {
  const supabase = createAdminClient();
  if (!supabase) throw new Error("Database client unavailable");

  const { data, error } = await supabase
    .from("institutional_credentials")
    .select(`
      *,
      institutions:institution_id (name),
      worker_profiles:worker_profile_id (full_name)
    `)
    .eq("credential_identifier", credentialIdentifier.trim().toUpperCase())
    .maybeSingle();

  if (error || !data) {
    return {
      isValid: false,
      status: "revoked",
      credentialIdentifier,
      tradeTitle: "",
      nsqfLevel: 0,
      authorizedIssuerName: "",
      authorizedIssuerRole: "",
      issuedAt: "",
      signatureVerified: false,
      tamperEvident: true,
      reason: "Credential not found in registry",
    };
  }

  // Recompute canonical hash
  const canonicalHash = computeCanonicalCredentialHash({
    credentialIdentifier: data.credential_identifier,
    workerProfileId: data.worker_profile_id,
    institutionId: data.institution_id,
    cohortId: data.cohort_id,
    tradeTitle: data.trade_title,
    nsqfLevel: data.nsqf_level,
    assessmentReference: data.assessment_reference,
    issuedAt: data.issued_at,
    schemaVersion: data.schema_version,
  });

  const secret = getSigningSecret();
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(canonicalHash, "utf8")
    .digest("hex");

  const sigBuf = Buffer.from(data.integrity_signature, "hex");
  const expBuf = Buffer.from(expectedSignature, "hex");
  const signatureMatches =
    sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf);

  const isValid = signatureMatches && (data.status === "issued" || data.status === "verified");

  return {
    isValid,
    status: data.status as CredentialStatus,
    credentialIdentifier: data.credential_identifier,
    tradeTitle: data.trade_title,
    nsqfLevel: data.nsqf_level,
    authorizedIssuerName: data.authorized_issuer_name,
    authorizedIssuerRole: data.authorized_issuer_role,
    issuedAt: data.issued_at,
    verifiedAt: data.verified_at,
    revokedAt: data.revoked_at,
    revocationReason: data.revocation_reason,
    signatureVerified: signatureMatches,
    tamperEvident: !signatureMatches,
    institutionName: (data as any).institutions?.name,
    workerName: (data as any).worker_profiles?.full_name,
    reason: !signatureMatches
      ? "Cryptographic signature check failed - credential tampered"
      : data.status === "suspended"
      ? "Credential currently suspended"
      : data.status === "revoked"
      ? `Credential revoked: ${data.revocation_reason || "No reason given"}`
      : undefined,
  };
}

/**
 * Suspends an institutional credential
 */
export async function suspendInstitutionalCredential(
  credentialId: string,
  reason: string
) {
  const supabase = createAdminClient();
  if (!supabase) throw new Error("Database client unavailable");

  const { data, error } = await supabase
    .from("institutional_credentials")
    .update({
      status: "suspended",
      revocation_reason: reason,
      updated_at: new Date().toISOString(),
    })
    .eq("id", credentialId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to suspend credential: ${error.message}`);
  }

  return data;
}

/**
 * Revokes an institutional credential permanently
 */
export async function revokeInstitutionalCredential(
  credentialId: string,
  reason: string
) {
  const supabase = createAdminClient();
  if (!supabase) throw new Error("Database client unavailable");

  const { data, error } = await supabase
    .from("institutional_credentials")
    .update({
      status: "revoked",
      revoked_at: new Date().toISOString(),
      revocation_reason: reason,
      updated_at: new Date().toISOString(),
    })
    .eq("id", credentialId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to revoke credential: ${error.message}`);
  }

  return data;
}

/**
 * Generates an institutional partner API key with SHA-256 hash storage
 */
export async function generatePartnerApiKey(options: {
  institutionId: string;
  keyName: string;
  isSandbox?: boolean;
  rateLimitPerMinute?: number;
}) {
  const supabase = createAdminClient();
  if (!supabase) throw new Error("Database client unavailable");

  const isSandbox = options.isSandbox ?? true;
  const prefix = isSandbox ? "kst_test" : "kst_live";
  const rawToken = crypto.randomBytes(24).toString("hex");
  const fullApiKey = `${prefix}_${rawToken}`;
  const keyHash = crypto.createHash("sha256").update(fullApiKey).digest("hex");

  const { data, error } = await supabase
    .from("institutional_partner_api_keys")
    .insert({
      institution_id: options.institutionId,
      key_name: options.keyName,
      key_prefix: `${prefix}_${rawToken.substring(0, 4)}...`,
      api_key_hash: keyHash,
      is_sandbox: isSandbox,
      rate_limit_per_minute: options.rateLimitPerMinute || 60,
      status: "active",
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to generate partner API key: ${error.message}`);
  }

  return {
    keyRecord: data,
    rawApiKey: fullApiKey, // Only returned once at creation
  };
}

/**
 * Validates a raw partner API key from incoming Authorization header
 */
export async function validatePartnerApiKey(rawApiKey: string) {
  const supabase = createAdminClient();
  if (!supabase) throw new Error("Database client unavailable");

  if (!rawApiKey || typeof rawApiKey !== "string") {
    return { isValid: false, reason: "Missing API key" };
  }

  const keyHash = crypto.createHash("sha256").update(rawApiKey.trim()).digest("hex");

  const { data, error } = await supabase
    .from("institutional_partner_api_keys")
    .select(`
      *,
      institutions:institution_id (*)
    `)
    .eq("api_key_hash", keyHash)
    .maybeSingle();

  if (error || !data) {
    return { isValid: false, reason: "Invalid partner API key" };
  }

  if (data.status !== "active") {
    return { isValid: false, reason: `API key is ${data.status}` };
  }

  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return { isValid: false, reason: "API key has expired" };
  }

  return {
    isValid: true,
    keyRecord: data,
    institution: (data as any).institutions,
  };
}
