/**
 * Cryptographic Credential Signing and Verification Engine for KAAMSETU
 *
 * Implements:
 * 1. Ed25519 Asymmetric W3C Verifiable Credential Signing & Verification (Public Key Architecture)
 * 2. RFC 8785 Canonical JSON Serialization (JCS)
 * 3. Constant-Time Verification & Key Rotation / Revocation Lifecycle
 * 4. Backward-Compatible Labeled Internal HMAC-SHA256 for Session Integrity
 *
 * Strictly server-side: private signing keys are NEVER exposed to the browser or logged.
 */

import * as crypto from "crypto";
import {
  assertCryptographicKeyQuality,
  validateCryptographicKeyMaterial,
} from "./key-validator";

export interface CanonicalCredentialPayload {
  registryId: string;
  workerProfileId: string;
  fullName: string;
  primaryTrade: string;
  category: string;
  nsqfLevel: number | null;
  issuer: "KAAMSETU National Workforce Trust Protocol";
  issuedAt: string;
  expiresAt?: string | null;
  status: "active" | "suspended" | "revoked";
  keyVersion?: string;
  keyId?: string;
}

export interface CredentialSignatureResult {
  registryId: string;
  canonicalHash: string;
  signature: string;
  algorithm: "HMAC-SHA256" | "Ed25519";
  issuedAt: string;
  status: "active" | "suspended" | "revoked";
  keyVersion: string;
  publicKeyHex?: string;
}

export interface VerificationResult {
  isValid: boolean;
  status: "active" | "suspended" | "revoked" | "tampered" | "expired" | "unknown";
  canonicalHash: string;
  keyVersion?: string;
  keyId?: string;
  reason?: string;
  payload?: CanonicalCredentialPayload;
}

export const DEFAULT_KEY_VERSION = "v1";

// ============================================================================
// 1. DETERMINISTIC RFC 8785 JSON CANONICALIZATION (JCS)
// ============================================================================

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

export function computeCanonicalHash(payload: CanonicalCredentialPayload): string {
  const canonicalString = canonicalizeJson(payload);
  return crypto.createHash("sha256").update(canonicalString, "utf8").digest("hex");
}

// ============================================================================
// 2. ED25519 ASYMMETRIC KEY LIFECYCLE (W3C VERIFIABLE CREDENTIALS)
// ============================================================================

interface Ed25519KeyEntry {
  keyId: string;
  version: string;
  privateKey: crypto.KeyObject;
  publicKey: crypto.KeyObject;
  publicKeyHex: string;
  publicKeyPem: string;
  isRevoked: boolean;
}

// In-memory key store for registered Ed25519 keys
const ed25519KeyRegistry = new Map<string, Ed25519KeyEntry>();

// Initialize default active Ed25519 keypair
function initializeDefaultEd25519Key(): Ed25519KeyEntry {
  const existing = ed25519KeyRegistry.get(DEFAULT_KEY_VERSION);
  if (existing) return existing;

  const { publicKey, privateKey } = crypto.generateKeyPairSync("ed25519");
  const publicKeyPem = publicKey.export({ type: "spki", format: "pem" }) as string;
  const publicKeyDer = publicKey.export({ type: "spki", format: "der" }) as Buffer;
  const publicKeyHex = publicKeyDer.toString("hex");

  const entry: Ed25519KeyEntry = {
    keyId: `did:kaamsetu:keys:${DEFAULT_KEY_VERSION}`,
    version: DEFAULT_KEY_VERSION,
    privateKey,
    publicKey,
    publicKeyHex,
    publicKeyPem,
    isRevoked: false,
  };

  ed25519KeyRegistry.set(DEFAULT_KEY_VERSION, entry);
  return entry;
}

// Ensure default key exists
initializeDefaultEd25519Key();

/**
 * Registers an Ed25519 key for key rotation or test injection.
 */
export function registerEd25519Key(version: string, isRevoked = false): Ed25519KeyEntry {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("ed25519");
  const publicKeyPem = publicKey.export({ type: "spki", format: "pem" }) as string;
  const publicKeyDer = publicKey.export({ type: "spki", format: "der" }) as Buffer;
  const publicKeyHex = publicKeyDer.toString("hex");

  const entry: Ed25519KeyEntry = {
    keyId: `did:kaamsetu:keys:${version}`,
    version,
    privateKey,
    publicKey,
    publicKeyHex,
    publicKeyPem,
    isRevoked,
  };

  ed25519KeyRegistry.set(version.toLowerCase().trim(), entry);
  return entry;
}

/**
 * Revokes an existing Ed25519 key version.
 */
export function revokeEd25519Key(version: string): void {
  const entry = ed25519KeyRegistry.get(version.toLowerCase().trim());
  if (entry) {
    entry.isRevoked = true;
  }
}

/**
 * Retrieves the published Ed25519 public key (PEM format) for asymmetric verification.
 */
export function getEd25519PublicKey(version: string = DEFAULT_KEY_VERSION): {
  keyId: string;
  publicKeyPem: string;
  publicKeyHex: string;
  isRevoked: boolean;
} | null {
  const entry = ed25519KeyRegistry.get(version.toLowerCase().trim());
  if (!entry) return null;
  return {
    keyId: entry.keyId,
    publicKeyPem: entry.publicKeyPem,
    publicKeyHex: entry.publicKeyHex,
    isRevoked: entry.isRevoked,
  };
}

/**
 * Signs a canonical credential payload using authentic Ed25519 asymmetric cryptography.
 */
export function signEd25519Credential(
  payload: CanonicalCredentialPayload,
  options?: { keyVersion?: string }
): CredentialSignatureResult {
  const keyVersion = options?.keyVersion || payload.keyVersion || DEFAULT_KEY_VERSION;
  const entry = ed25519KeyRegistry.get(keyVersion.toLowerCase().trim());

  if (!entry) {
    throw new Error(`Ed25519 signing failed: Key version '${keyVersion}' is not registered.`);
  }

  if (entry.isRevoked) {
    throw new Error(`Ed25519 signing failed: Key version '${keyVersion}' has been revoked.`);
  }

  const canonicalPayload: CanonicalCredentialPayload = {
    ...payload,
    keyVersion,
    keyId: entry.keyId,
  };

  const canonicalHash = computeCanonicalHash(canonicalPayload);
  const dataToSign = Buffer.from(canonicalHash, "utf8");

  // Sign with Ed25519 private key
  const signatureBuffer = crypto.sign(null, dataToSign, entry.privateKey);
  const signatureHex = signatureBuffer.toString("hex");

  return {
    registryId: payload.registryId,
    canonicalHash,
    signature: signatureHex,
    algorithm: "Ed25519",
    issuedAt: payload.issuedAt,
    status: payload.status,
    keyVersion,
    publicKeyHex: entry.publicKeyHex,
  };
}

/**
 * Verifies an Ed25519 signature against a canonical credential payload using the public key.
 */
export function verifyEd25519Credential(
  payload: CanonicalCredentialPayload,
  signatureHex: string,
  options?: { keyVersion?: string; externalPublicKey?: crypto.KeyObject }
): VerificationResult {
  const keyVersion = options?.keyVersion || payload.keyVersion || DEFAULT_KEY_VERSION;
  const entry = ed25519KeyRegistry.get(keyVersion.toLowerCase().trim());

  const canonicalPayload: CanonicalCredentialPayload = {
    ...payload,
    keyVersion,
    keyId: payload.keyId || (entry ? entry.keyId : undefined),
  };

  const canonicalHash = computeCanonicalHash(canonicalPayload);
  const dataToVerify = Buffer.from(canonicalHash, "utf8");

  let publicKey: crypto.KeyObject;

  if (options?.externalPublicKey) {
    publicKey = options.externalPublicKey;
  } else {
    if (!entry) {
      return {
        isValid: false,
        status: "unknown",
        canonicalHash,
        keyVersion,
        reason: `Unknown or unconfigured Ed25519 key version '${keyVersion}'.`,
        payload: canonicalPayload,
      };
    }

    if (entry.isRevoked) {
      return {
        isValid: false,
        status: "revoked",
        canonicalHash,
        keyVersion,
        keyId: entry.keyId,
        reason: `The Ed25519 signing key '${keyVersion}' for this credential has been revoked.`,
        payload: canonicalPayload,
      };
    }

    publicKey = entry.publicKey;
  }

  try {
    const sigBuffer = Buffer.from(signatureHex, "hex");
    const isSignatureValid = crypto.verify(null, dataToVerify, publicKey, sigBuffer);

    if (!isSignatureValid) {
      return {
        isValid: false,
        status: "tampered",
        canonicalHash,
        keyVersion,
        reason: "Cryptographic signature mismatch: Credential data has been tampered with or signature is invalid.",
        payload: canonicalPayload,
      };
    }
  } catch (err: any) {
    return {
      isValid: false,
      status: "tampered",
      canonicalHash,
      keyVersion,
      reason: `Signature verification failed: ${err.message}`,
      payload: canonicalPayload,
    };
  }

  // Expiration check
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

  // Revocation status check
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

// ============================================================================
// 3. INTERNAL HMAC-SHA256 SESSION CREDENTIAL SIGNER (Labeled Internal)
// ============================================================================

const legacyTestKeyStore = new Map<string, string | null>();

export function __setTestSigningKeyForVersion(version: string, key: string | null): void {
  if (process.env.NODE_ENV === "production") {
    throw new Error("FATAL: Test signing key injection is strictly forbidden in production.");
  }
  legacyTestKeyStore.set(version.toLowerCase().trim(), key);
}

export function __resetTestSigningKeys(): void {
  if (process.env.NODE_ENV === "production") {
    throw new Error("FATAL: Test key reset is strictly forbidden in production.");
  }
  legacyTestKeyStore.clear();
}

export function getSigningKeyForVersion(version: string = DEFAULT_KEY_VERSION): {
  key: string | null;
  isRevoked: boolean;
  version: string;
} {
  const normVersion = version.toLowerCase().trim();
  const revokedVersions = (process.env.REVOKED_SIGNING_KEY_VERSIONS || "")
    .split(",")
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);

  if (revokedVersions.includes(normVersion)) {
    return { key: null, isRevoked: true, version: normVersion };
  }

  if (process.env.NODE_ENV !== "production" && legacyTestKeyStore.has(normVersion)) {
    return { key: legacyTestKeyStore.get(normVersion) || null, isRevoked: false, version: normVersion };
  }

  const envVar = `CREDENTIAL_SIGNING_KEY_${normVersion.toUpperCase()}`;
  const versionSecret = process.env[envVar];
  const fallbackSecret = normVersion === DEFAULT_KEY_VERSION ? process.env.CREDENTIAL_SIGNING_KEY : undefined;
  const secret = versionSecret || fallbackSecret;

  if ((process.env.NODE_ENV as string) === "production") {
    if (!secret) {
      return { key: null, isRevoked: false, version: normVersion };
    }
    assertCryptographicKeyQuality(secret, versionSecret ? envVar : "CREDENTIAL_SIGNING_KEY");
    return { key: secret, isRevoked: false, version: normVersion };
  }

  if (secret) {
    return { key: secret, isRevoked: false, version: normVersion };
  }

  // Non-production fallback ONLY for the default key version in local development demos.
  // Explicit unknown key versions (e.g. v99_nonexistent) must still fail closed with key: null.
  if (normVersion === DEFAULT_KEY_VERSION && process.env.NODE_ENV !== "test") {
    return {
      key: "kaamsetu-credential-signing-key-minimum-32-chars-long",
      isRevoked: false,
      version: normVersion,
    };
  }

  return { key: null, isRevoked: false, version: normVersion };
}

export function getActiveKeyVersion(): string {
  return process.env.ACTIVE_SIGNING_KEY_VERSION || DEFAULT_KEY_VERSION;
}

export function signCredentialPayload(
  payload: CanonicalCredentialPayload,
  options?: { keyVersion?: string; algorithm?: "HMAC-SHA256" | "Ed25519" }
): CredentialSignatureResult {
  if (options?.algorithm === "Ed25519") {
    return signEd25519Credential(payload, options);
  }

  const keyVersion = options?.keyVersion || payload.keyVersion || getActiveKeyVersion();
  const keyResolution = getSigningKeyForVersion(keyVersion);

  if (keyResolution.isRevoked || !keyResolution.key) {
    throw new Error(`Cannot sign credential: Key version '${keyVersion}' is revoked or unavailable.`);
  }

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

export function verifyCredentialSignature(
  payload: CanonicalCredentialPayload,
  signature: string,
  options?: { keyVersion?: string; algorithm?: "HMAC-SHA256" | "Ed25519" }
): VerificationResult {
  if (options?.algorithm === "Ed25519" || signature.length === 128) {
    return verifyEd25519Credential(payload, signature, options);
  }

  const keyVersion = options?.keyVersion || payload.keyVersion || DEFAULT_KEY_VERSION;
  const canonicalPayload: CanonicalCredentialPayload = {
    ...payload,
    keyVersion,
  };

  const canonicalHash = computeCanonicalHash(canonicalPayload);
  const keyResolution = getSigningKeyForVersion(keyVersion);

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
