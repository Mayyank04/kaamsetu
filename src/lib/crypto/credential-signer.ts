/**
 * Cryptographic Credential Signing and Verification Engine for KAAMSETU
 *
 * Implements RFC 8785 Canonical JSON Serialization (JCS), HMAC-SHA256 Signatures,
 * Constant-Time Verification, and Key Versioning / Rotation.
 *
 * Strictly server-side: signing keys are NEVER exposed to the browser or logged.
 * In production, missing or weak keys FAIL CLOSED immediately.
 */

import * as crypto from "crypto";

export interface CanonicalCredentialPayload {
  registryId: string;
  workerProfileId: string;
  fullName: string;
  primaryTrade: string;
  category: string;
  nsqfLevel: number;
  issuer: "KAAMSETU National Workforce Trust Protocol";
  issuedAt: string;
  expiresAt?: string | null;
  status: "active" | "suspended" | "revoked";
  keyVersion?: string;
}

export interface CredentialSignatureResult {
  registryId: string;
  canonicalHash: string;
  signature: string;
  algorithm: "HMAC-SHA256";
  issuedAt: string;
  status: "active" | "suspended" | "revoked";
  keyVersion: string;
}

export interface VerificationResult {
  isValid: boolean;
  status: "active" | "suspended" | "revoked" | "tampered" | "expired" | "unknown";
  canonicalHash: string;
  keyVersion?: string;
  reason?: string;
  payload?: CanonicalCredentialPayload;
}

interface KeyResolutionResult {
  key: string | null;
  isRevoked: boolean;
  version: string;
}

export const DEFAULT_KEY_VERSION = "v1";

/**
 * Gets the current active signing key version from environment.
 */
export function getActiveKeyVersion(): string {
  return process.env.ACTIVE_SIGNING_KEY_VERSION || DEFAULT_KEY_VERSION;
}

/**
 * Resolves the signing key for a given key version.
 * Supports key rotation, versioning, and revocation lists.
 * In production, fails closed if key is missing or lacks sufficient entropy (256-bit / 32 chars).
 */
export function getSigningKeyForVersion(version: string = DEFAULT_KEY_VERSION): KeyResolutionResult {
  const normVersion = version.toLowerCase().trim();

  // Check if key version is explicitly revoked in environment
  const revokedVersions = (process.env.REVOKED_SIGNING_KEY_VERSIONS || "")
    .split(",")
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);

  if (revokedVersions.includes(normVersion)) {
    return { key: null, isRevoked: true, version: normVersion };
  }

  // Version-specific key: CREDENTIAL_SIGNING_KEY_V1, CREDENTIAL_SIGNING_KEY_V2, etc.
  const envVarName = `CREDENTIAL_SIGNING_KEY_${normVersion.toUpperCase()}`;
  let secret = process.env[envVarName];

  // Fallback to primary CREDENTIAL_SIGNING_KEY for default version
  if (!secret && normVersion === DEFAULT_KEY_VERSION) {
    secret = process.env.CREDENTIAL_SIGNING_KEY;
  }

  const isProduction = (process.env.NODE_ENV as string) === "production";

  if (isProduction) {
    if (!secret || secret.length < 32) {
      throw new Error(
        `FATAL SECURITY CONFIGURATION: Signing key for version '${normVersion}' is missing or below minimum 256-bit requirement (32 chars) in production.`
      );
    }
    return { key: secret || null, isRevoked: false, version: normVersion };
  }

  // If a specific version was requested (not default v1) and not found in environment, it is unknown
  if (!secret && normVersion !== DEFAULT_KEY_VERSION) {
    return { key: null, isRevoked: false, version: normVersion };
  }

  // Non-production test/development fallback ONLY for default version v1
  if (!secret && normVersion === DEFAULT_KEY_VERSION) {
    if (process.env.NODE_ENV === "test") {
      secret = "kaamsetu-test-suite-dedicated-signing-key-minimum-32-chars";
    } else {
      secret = process.env.CREDENTIAL_SIGNING_KEY || "kaamsetu-dev-signing-key-minimum-32-characters-long";
    }
  }

  return { key: secret || null, isRevoked: false, version: normVersion };
}

/**
 * Deterministic RFC 8785 JSON Canonicalization Scheme (JCS).
 * Keys are sorted lexicographically in Unicode code point order.
 */
export function canonicalizeJson(obj: unknown): string {
  if (obj === null || typeof obj !== "object") {
    return JSON.stringify(obj);
  }

  if (Array.isArray(obj)) {
    return "[" + obj.map((item) => canonicalizeJson(item)).join(",") + "]";
  }

  const record = obj as Record<string, unknown>;
  const sortedKeys = Object.keys(record).sort();
  const entries: string[] = [];

  for (const key of sortedKeys) {
    const val = record[key];
    if (val !== undefined) {
      entries.push(`${JSON.stringify(key)}:${canonicalizeJson(val)}`);
    }
  }

  return "{" + entries.join(",") + "}";
}

/**
 * Computes SHA-256 hash of canonical JSON bytes.
 */
export function computeCanonicalHash(payload: CanonicalCredentialPayload): string {
  const canonicalString = canonicalizeJson(payload);
  return crypto.createHash("sha256").update(canonicalString, "utf8").digest("hex");
}

/**
 * Signs a canonical credential payload using HMAC-SHA256 with key versioning.
 */
export function signCredentialPayload(
  payload: CanonicalCredentialPayload,
  options?: { keyVersion?: string; customSecret?: string }
): CredentialSignatureResult {
  const keyVersion = options?.keyVersion || payload.keyVersion || getActiveKeyVersion();
  const keyResolution = options?.customSecret
    ? { key: options.customSecret, isRevoked: false, version: keyVersion }
    : getSigningKeyForVersion(keyVersion);

  if (keyResolution.isRevoked || !keyResolution.key) {
    throw new Error(`Cannot sign credential: Key version '${keyVersion}' is revoked or unavailable.`);
  }

  // Ensure payload explicitly reflects the key version
  const canonicalPayload: CanonicalCredentialPayload = {
    ...payload,
    keyVersion,
  };

  const canonicalHash = computeCanonicalHash(canonicalPayload);

  const signature = crypto
    .createHmac("sha256", keyResolution.key)
    .update(canonicalHash, "utf8")
    .digest("hex");

  return {
    registryId: payload.registryId,
    canonicalHash,
    signature,
    algorithm: "HMAC-SHA256",
    issuedAt: payload.issuedAt,
    status: payload.status,
    keyVersion,
  };
}

/**
 * Independently verifies a credential payload against a provided cryptographic signature.
 * Enforces key rotation, constant-time comparison, revocation check, and expiration check.
 */
export function verifyCredentialSignature(
  payload: CanonicalCredentialPayload,
  signature: string,
  options?: { keyVersion?: string; customSecret?: string }
): VerificationResult {
  const keyVersion = options?.keyVersion || payload.keyVersion || DEFAULT_KEY_VERSION;
  const canonicalPayload: CanonicalCredentialPayload = {
    ...payload,
    keyVersion,
  };

  const canonicalHash = computeCanonicalHash(canonicalPayload);

  // Check key revocation / resolution
  const keyResolution = options?.customSecret
    ? { key: options.customSecret, isRevoked: false, version: keyVersion }
    : getSigningKeyForVersion(keyVersion);

  if (keyResolution.isRevoked) {
    return {
      isValid: false,
      status: "revoked",
      canonicalHash,
      keyVersion,
      reason: `The cryptographic signing key version '${keyVersion}' for this credential has been revoked.`,
      payload: canonicalPayload,
    };
  }

  if (!keyResolution.key) {
    return {
      isValid: false,
      status: "unknown",
      canonicalHash,
      keyVersion,
      reason: `Unknown or unconfigured signing key version '${keyVersion}'.`,
      payload: canonicalPayload,
    };
  }

  const expectedSignature = crypto
    .createHmac("sha256", keyResolution.key)
    .update(canonicalHash, "utf8")
    .digest("hex");

  // Constant-time comparison to prevent timing attacks
  const signatureBuffer = Buffer.from(signature, "hex");
  const expectedBuffer = Buffer.from(expectedSignature, "hex");

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return {
      isValid: false,
      status: "tampered",
      canonicalHash,
      keyVersion,
      reason: "Cryptographic signature mismatch: Credential data has been tampered with or signature is invalid.",
      payload: canonicalPayload,
    };
  }

  // Check expiration if present
  if (canonicalPayload.expiresAt) {
    const expiryDate = new Date(canonicalPayload.expiresAt).getTime();
    if (Date.now() > expiryDate) {
      return {
        isValid: false,
        status: "expired",
        canonicalHash,
        keyVersion,
        reason: `Credential expired on ${new Date(canonicalPayload.expiresAt).toLocaleDateString()}.`,
        payload: canonicalPayload,
      };
    }
  }

  // Check status attribute
  if (canonicalPayload.status === "revoked") {
    return {
      isValid: false,
      status: "revoked",
      canonicalHash,
      keyVersion,
      reason: "This workforce credential has been formally revoked by the issuing authority.",
      payload: canonicalPayload,
    };
  }

  if (canonicalPayload.status === "suspended") {
    return {
      isValid: false,
      status: "suspended",
      canonicalHash,
      keyVersion,
      reason: "This workforce credential is currently suspended pending review.",
      payload: canonicalPayload,
    };
  }

  return {
    isValid: true,
    status: "active",
    canonicalHash,
    keyVersion,
    payload: canonicalPayload,
  };
}
