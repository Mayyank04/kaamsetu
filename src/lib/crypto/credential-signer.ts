/**
 * Cryptographic Credential Signing and Verification Engine for KAAMSETU
 * Implements RFC 8785 Canonical JSON Serialization and HMAC-SHA256 Signatures.
 * Strictly server-side: signing keys are NEVER exposed to the browser.
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
}

export interface CredentialSignatureResult {
  registryId: string;
  canonicalHash: string;
  signature: string;
  algorithm: "HMAC-SHA256";
  issuedAt: string;
  status: "active" | "suspended" | "revoked";
}

export interface VerificationResult {
  isValid: boolean;
  status: "active" | "suspended" | "revoked" | "tampered" | "expired" | "unknown";
  canonicalHash: string;
  reason?: string;
  payload?: CanonicalCredentialPayload;
}

/**
 * Derives the server-side signing secret.
 * Priority:
 * 1. Explicit CREDENTIAL_SIGNING_KEY in environment
 * 2. Deterministic derivation from SUPABASE_SERVICE_ROLE_KEY
 * 3. Fallback deterministic seed for offline testing (NEVER exposed to client)
 */
function getSigningSecret(): string {
  if (process.env.CREDENTIAL_SIGNING_KEY && process.env.CREDENTIAL_SIGNING_KEY.length >= 32) {
    return process.env.CREDENTIAL_SIGNING_KEY;
  }

  const seed = process.env.SUPABASE_SERVICE_ROLE_KEY || "kaamsetu-sovereign-trust-protocol-seed-key-2026";
  return crypto.createHash("sha256").update(`kaamsetu-cred-signing:${seed}`).digest("hex");
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
 * Signs a canonical credential payload using HMAC-SHA256.
 */
export function signCredentialPayload(
  payload: CanonicalCredentialPayload
): CredentialSignatureResult {
  const canonicalHash = computeCanonicalHash(payload);
  const secret = getSigningSecret();

  const signature = crypto
    .createHmac("sha256", secret)
    .update(canonicalHash, "utf8")
    .digest("hex");

  return {
    registryId: payload.registryId,
    canonicalHash,
    signature,
    algorithm: "HMAC-SHA256",
    issuedAt: payload.issuedAt,
    status: payload.status,
  };
}

/**
 * Independently verifies a credential payload against a provided cryptographic signature.
 */
export function verifyCredentialSignature(
  payload: CanonicalCredentialPayload,
  signature: string
): VerificationResult {
  const canonicalHash = computeCanonicalHash(payload);
  const secret = getSigningSecret();

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(canonicalHash, "utf8")
    .digest("hex");

  // Constant-time comparison to prevent timing attacks
  const signatureBuffer = Buffer.from(signature, "hex");
  const expectedBuffer = Buffer.from(expectedSignature, "hex");

  if (signatureBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return {
      isValid: false,
      status: "tampered",
      canonicalHash,
      reason: "Cryptographic signature mismatch: Credential data has been tampered with or signature is invalid.",
    };
  }

  // Check expiration if present
  if (payload.expiresAt) {
    const expiryDate = new Date(payload.expiresAt).getTime();
    if (Date.now() > expiryDate) {
      return {
        isValid: false,
        status: "expired",
        canonicalHash,
        reason: `Credential expired on ${new Date(payload.expiresAt).toLocaleDateString()}.`,
        payload,
      };
    }
  }

  // Check revocation status
  if (payload.status === "revoked") {
    return {
      isValid: false,
      status: "revoked",
      canonicalHash,
      reason: "This workforce credential has been formally revoked by the issuing authority.",
      payload,
    };
  }

  if (payload.status === "suspended") {
    return {
      isValid: false,
      status: "suspended",
      canonicalHash,
      reason: "This workforce credential is currently suspended pending review.",
      payload,
    };
  }

  return {
    isValid: true,
    status: "active",
    canonicalHash,
    payload,
  };
}
