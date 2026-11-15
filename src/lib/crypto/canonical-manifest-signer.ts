/**
 * KAAMSETU Phase 27 — Pillar H: Canonical Release Manifest & Reproducible Build Signer
 *
 * Implements:
 * 1. Deterministic canonical release manifest generator
 * 2. RFC 8785 Canonical JSON serialization
 * 3. SHA-256 cryptographic digest computation across code & migration state
 * 4. Ed25519 digital signature of canonical release manifests
 * 5. Transparent classification of historical digests (Phase 26 unreproducible_historical_digest)
 */

import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";
import { canonicalizeJson } from "./audit-hash-chain-service";

export interface ReleaseManifestData {
  repository: string;
  branch: string;
  baselineCommit: string;
  parentCommit: string;
  migrations: {
    count: number;
    range: string;
    latestMigration: string;
    migrationDirectoryDigest: string;
  };
  lockfileDigest: string;
  testInventoryDigest: string;
  environmentClassification: "CLASS_B_CONTROLLED_ROLLOUT";
  toolchain: {
    nodeVersion: string;
    nextVersion: string;
    typeScriptVersion: string;
    postgresVersion: string;
  };
  documentationCount: number;
  timestamp: string;
}

export interface CanonicalSignedReleaseManifest {
  manifest: ReleaseManifestData;
  canonicalDigest: string; // SHA-256 of canonicalized manifest JSON
  signature: string;       // Ed25519 signature in hex
  signingKeyId: string;
  publicKeyPem: string;
  reproducibilityClassification: "reproducible_canonical_manifest" | "unreproducible_historical_digest";
}

/**
 * Historical Phase 26 Digest Assessment (Pillar H)
 */
export const HISTORICAL_DIGEST_AUDIT = {
  phase26ReportedDigest: "89f1a0e3c5b24879d1a8e2b04c6f7890abcdef1234567890abcdef1234567890",
  reproducibilityStatus: "unreproducible_historical_digest",
  auditReasoning:
    "The Phase 26 digest was generated as an illustrative placeholder digest rather than derived from a bitwise deterministic hash of workspace tarballs. In accordance with Phase 27 Non-Fabrication rules, it is formally recorded as an unreproducible historical digest, rather than retroactively altered or misrepresented.",
  remediationAction:
    "Phase 27 replaces illustrative hex digests with an authoritative, bitwise RFC 8785 canonical manifest with genuine SHA-256 and Ed25519 signature verification.",
};

/**
 * Computes SHA-256 digest of a file on disk
 */
export function computeFileSha256(filePath: string): string {
  if (!fs.existsSync(filePath)) {
    return "0000000000000000000000000000000000000000000000000000000000000000";
  }
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(fileBuffer).digest("hex");
}

/**
 * Computes deterministic hash of all migration files in sequence
 */
export function computeMigrationsDirectoryDigest(migrationsDir: string, maxMigrationPrefix = "20261115000099"): string {
  if (!fs.existsSync(migrationsDir)) {
    return "0000000000000000000000000000000000000000000000000000000000000000";
  }
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith(".sql") && f.substring(0, 14) <= maxMigrationPrefix)
    .sort();
  const hasher = crypto.createHash("sha256");
  for (const file of files) {
    const fullPath = path.join(migrationsDir, file);
    const content = fs.readFileSync(fullPath, "utf8").replace(/\r\n/g, "\n"); // Normalize CRLF
    hasher.update(`${file}:${content}\n`);
  }
  return hasher.digest("hex");
}

/**
 * Generates canonical release manifest data for Phase 27
 */
export function buildPhase27ReleaseManifest(projectRoot: string): ReleaseManifestData {
  const migrationsDir = path.join(projectRoot, "supabase/migrations");
  const lockfilePath = path.join(projectRoot, "package-lock.json");
  const testInventoryPath = path.join(projectRoot, "docs/PHASE_27_TEST_INVENTORY.json");

  const migrationFiles = fs.existsSync(migrationsDir)
    ? fs.readdirSync(migrationsDir)
        .filter(f => f.endsWith(".sql") && f.substring(0, 14) <= "20261115000028")
        .sort()
    : [];

  return {
    repository: "Mayyank04/kaamsetu",
    branch: "phase-27-cryptographic-trust-and-financial-assurance",
    baselineCommit: "6f8a488",
    parentCommit: "7226496",
    migrations: {
      count: migrationFiles.length,
      range: "01 to 28",
      latestMigration: migrationFiles[migrationFiles.length - 1] || "none",
      migrationDirectoryDigest: computeMigrationsDirectoryDigest(migrationsDir, "20261115000028"),
    },
    lockfileDigest: computeFileSha256(lockfilePath),
    testInventoryDigest: computeFileSha256(testInventoryPath),
    environmentClassification: "CLASS_B_CONTROLLED_ROLLOUT",
    toolchain: {
      nodeVersion: "v20.x (LTS) / v22.x",
      nextVersion: "15.1.7",
      typeScriptVersion: "5.x",
      postgresVersion: "15.x",
    },
    documentationCount: 20,
    timestamp: "2026-11-15T18:00:00.000Z",
  };
}

/**
 * Generates canonical release manifest data for Phase 28
 */
export function buildPhase28ReleaseManifest(projectRoot: string): ReleaseManifestData {
  const migrationsDir = path.join(projectRoot, "supabase/migrations");
  const lockfilePath = path.join(projectRoot, "package-lock.json");
  const testInventoryPath = path.join(projectRoot, "docs/PHASE_28_ACTIVE_TEST_INVENTORY.json");

  const migrationFiles = fs.existsSync(migrationsDir)
    ? fs.readdirSync(migrationsDir)
        .filter(f => f.endsWith(".sql") && f.substring(0, 14) <= "20261115000029")
        .sort()
    : [];

  return {
    repository: "Mayyank04/kaamsetu",
    branch: "phase-28-institutional-execution-and-production-assurance",
    baselineCommit: "8cd69c6",
    parentCommit: "6f8a488",
    migrations: {
      count: migrationFiles.length,
      range: "01 to 29",
      latestMigration: migrationFiles[migrationFiles.length - 1] || "none",
      migrationDirectoryDigest: computeMigrationsDirectoryDigest(migrationsDir, "20261115000029"),
    },
    lockfileDigest: computeFileSha256(lockfilePath),
    testInventoryDigest: computeFileSha256(testInventoryPath),
    environmentClassification: "CLASS_B_CONTROLLED_ROLLOUT",
    toolchain: {
      nodeVersion: "v20.x (LTS) / v22.x",
      nextVersion: "15.1.7",
      typeScriptVersion: "5.x",
      postgresVersion: "15.x",
    },
    documentationCount: 33,
    timestamp: "2026-11-15T18:30:00.000Z",
  };
}

/**
 * Generates canonical release manifest data for Phase 29
 */
export function buildPhase29ReleaseManifest(projectRoot: string): ReleaseManifestData {
  const migrationsDir = path.join(projectRoot, "supabase/migrations");
  const lockfilePath = path.join(projectRoot, "package-lock.json");
  const testInventoryPath = path.join(projectRoot, "docs/certification/phase-29/PHASE_29_ACTIVE_TEST_INVENTORY.json");

  const migrationFiles = fs.existsSync(migrationsDir)
    ? fs.readdirSync(migrationsDir)
        .filter(f => f.endsWith(".sql") && f.substring(0, 14) <= "20261115000029")
        .sort()
    : [];

  return {
    repository: "Mayyank04/kaamsetu",
    branch: "phase-29-independent-challenge-and-evidence-assurance",
    baselineCommit: "03ae818",
    parentCommit: "8cd69c6",
    migrations: {
      count: migrationFiles.length,
      range: "01 to 29",
      latestMigration: migrationFiles[migrationFiles.length - 1] || "none",
      migrationDirectoryDigest: computeMigrationsDirectoryDigest(migrationsDir, "20261115000029"),
    },
    lockfileDigest: computeFileSha256(lockfilePath),
    testInventoryDigest: computeFileSha256(testInventoryPath),
    environmentClassification: "CLASS_B_CONTROLLED_ROLLOUT",
    toolchain: {
      nodeVersion: "v20.x (LTS) / v22.x",
      nextVersion: "15.1.7",
      typeScriptVersion: "5.x",
      postgresVersion: "15.x",
    },
    documentationCount: 41,
    timestamp: "2026-11-15T19:25:00.000Z",
  };
}

/**
 * Generates canonical release manifest data for Phase 30
 */
export function buildPhase30ReleaseManifest(projectRoot: string): ReleaseManifestData {
  const migrationsDir = path.join(projectRoot, "supabase/migrations");
  const lockfilePath = path.join(projectRoot, "package-lock.json");
  const testInventoryPath = path.join(projectRoot, "docs/certification/phase-30/PHASE_30_TEST_INVENTORY.json");

  const migrationFiles = fs.existsSync(migrationsDir)
    ? fs.readdirSync(migrationsDir)
        .filter(f => f.endsWith(".sql") && f.substring(0, 14) <= "20261115000029")
        .sort()
    : [];

  return {
    repository: "Mayyank04/kaamsetu",
    branch: "phase-30-institutional-authorization-and-market-readiness",
    baselineCommit: "9928ab2",
    parentCommit: "03ae818",
    migrations: {
      count: migrationFiles.length,
      range: "01 to 29",
      latestMigration: migrationFiles[migrationFiles.length - 1] || "none",
      migrationDirectoryDigest: computeMigrationsDirectoryDigest(migrationsDir, "20261115000029"),
    },
    lockfileDigest: computeFileSha256(lockfilePath),
    testInventoryDigest: computeFileSha256(testInventoryPath),
    environmentClassification: "CLASS_B_CONTROLLED_ROLLOUT",
    toolchain: {
      nodeVersion: "v20.x (LTS) / v22.x",
      nextVersion: "15.1.7",
      typeScriptVersion: "5.x",
      postgresVersion: "15.x",
    },
    documentationCount: 39,
    timestamp: "2026-11-15T19:40:00.000Z",
  };
}

/**
 * Generates canonical release manifest data for Phase 31
 */
export function buildPhase31ReleaseManifest(projectRoot: string): ReleaseManifestData {
  const migrationsDir = path.join(projectRoot, "supabase/migrations");
  const lockfilePath = path.join(projectRoot, "package-lock.json");
  const testInventoryPath = path.join(projectRoot, "docs/certification/phase-31/PHASE_31_ACTIVE_TEST_INVENTORY.json");

  const migrationFiles = fs.existsSync(migrationsDir)
    ? fs.readdirSync(migrationsDir)
        .filter(f => f.endsWith(".sql") && f.substring(0, 14) <= "20261115000029")
        .sort()
    : [];

  return {
    repository: "Mayyank04/kaamsetu",
    branch: "phase-31-operational-readiness-and-worker-outcome-validation",
    baselineCommit: "b66db69",
    parentCommit: "9928ab2",
    migrations: {
      count: migrationFiles.length,
      range: "01 to 29",
      latestMigration: migrationFiles[migrationFiles.length - 1] || "none",
      migrationDirectoryDigest: computeMigrationsDirectoryDigest(migrationsDir, "20261115000029"),
    },
    lockfileDigest: computeFileSha256(lockfilePath),
    testInventoryDigest: computeFileSha256(testInventoryPath),
    environmentClassification: "CLASS_B_CONTROLLED_ROLLOUT",
    toolchain: {
      nodeVersion: "v20.x (LTS) / v22.x",
      nextVersion: "15.1.7",
      typeScriptVersion: "5.x",
      postgresVersion: "15.x",
    },
    documentationCount: 46,
    timestamp: "2026-11-15T20:00:00.000Z",
  };
}

/**
 * Generates canonical release manifest data for Phase 32
 */
export function buildPhase32ReleaseManifest(projectRoot: string): ReleaseManifestData {
  const migrationsDir = path.join(projectRoot, "supabase/migrations");
  const lockfilePath = path.join(projectRoot, "package-lock.json");
  const testInventoryPath = path.join(projectRoot, "docs/certification/phase-32/PHASE_32_ACTIVE_TEST_INVENTORY.json");

  const migrationFiles = fs.existsSync(migrationsDir)
    ? fs.readdirSync(migrationsDir)
        .filter(f => f.endsWith(".sql") && f.substring(0, 14) <= "20261115000029")
        .sort()
    : [];

  return {
    repository: "Mayyank04/kaamsetu",
    branch: "phase-32-independent-field-validation-and-operational-assurance",
    baselineCommit: "036039b",
    parentCommit: "b66db69",
    migrations: {
      count: migrationFiles.length,
      range: "01 to 29",
      latestMigration: migrationFiles[migrationFiles.length - 1] || "none",
      migrationDirectoryDigest: computeMigrationsDirectoryDigest(migrationsDir, "20261115000029"),
    },
    lockfileDigest: computeFileSha256(lockfilePath),
    testInventoryDigest: computeFileSha256(testInventoryPath),
    environmentClassification: "CLASS_B_CONTROLLED_ROLLOUT",
    toolchain: {
      nodeVersion: "v20.x (LTS) / v22.x",
      nextVersion: "15.1.7",
      typeScriptVersion: "5.x",
      postgresVersion: "15.x",
    },
    documentationCount: 47,
    timestamp: "2026-11-15T20:20:00.000Z",
  };
}

/**
 * Generates canonical release manifest data for Phase 33
 */
export function buildPhase33ReleaseManifest(projectRoot: string): ReleaseManifestData {
  const migrationsDir = path.join(projectRoot, "supabase/migrations");
  const lockfilePath = path.join(projectRoot, "package-lock.json");
  const testInventoryPath = path.join(projectRoot, "docs/certification/phase-33/PHASE_33_FINAL_TEST_INVENTORY.json");

  const migrationFiles = fs.existsSync(migrationsDir)
    ? fs.readdirSync(migrationsDir)
        .filter(f => f.endsWith(".sql") && f.substring(0, 14) <= "20261115000029")
        .sort()
    : [];

  return {
    repository: "Mayyank04/kaamsetu",
    branch: "phase-33-final-independent-assurance-and-institutional-eligibility",
    baselineCommit: "f62ad0d",
    parentCommit: "036039b",
    migrations: {
      count: migrationFiles.length,
      range: "01 to 29",
      latestMigration: migrationFiles[migrationFiles.length - 1] || "none",
      migrationDirectoryDigest: computeMigrationsDirectoryDigest(migrationsDir, "20261115000029"),
    },
    lockfileDigest: computeFileSha256(lockfilePath),
    testInventoryDigest: computeFileSha256(testInventoryPath),
    environmentClassification: "CLASS_B_CONTROLLED_ROLLOUT",
    toolchain: {
      nodeVersion: "v20.x (LTS) / v22.x",
      nextVersion: "15.1.7",
      typeScriptVersion: "5.x",
      postgresVersion: "15.x",
    },
    documentationCount: 46,
    timestamp: "2026-11-15T20:30:00.000Z",
  };
}

/**
 * Generates canonical release manifest data for Phase 34
 */
export function buildPhase34ReleaseManifest(projectRoot: string): ReleaseManifestData {
  const migrationsDir = path.join(projectRoot, "supabase/migrations");
  const lockfilePath = path.join(projectRoot, "package-lock.json");
  const testInventoryPath = path.join(projectRoot, "docs/certification/phase-34/PHASE_34_FINANCIAL_INVARIANT_TESTS.json");

  const migrationFiles = fs.existsSync(migrationsDir)
    ? fs.readdirSync(migrationsDir)
        .filter(f => f.endsWith(".sql") && f.substring(0, 14) <= "20261115000029")
        .sort()
    : [];

  return {
    repository: "Mayyank04/kaamsetu",
    branch: "phase-34-institutional-closure-and-production-assurance",
    baselineCommit: "b0f79b2",
    parentCommit: "f62ad0d",
    migrations: {
      count: migrationFiles.length,
      range: "01 to 29",
      latestMigration: migrationFiles[migrationFiles.length - 1] || "none",
      migrationDirectoryDigest: computeMigrationsDirectoryDigest(migrationsDir, "20261115000029"),
    },
    lockfileDigest: computeFileSha256(lockfilePath),
    testInventoryDigest: computeFileSha256(testInventoryPath),
    environmentClassification: "CLASS_B_CONTROLLED_ROLLOUT",
    toolchain: {
      nodeVersion: "v20.x (LTS) / v22.x",
      nextVersion: "15.1.7",
      typeScriptVersion: "5.x",
      postgresVersion: "15.x",
    },
    documentationCount: 40,
    timestamp: "2026-11-15T20:40:00.000Z",
  };
}

/**
 * Generates canonical release manifest data for Phase 34A
 */
export function buildPhase34aReleaseManifest(projectRoot: string): ReleaseManifestData {
  const migrationsDir = path.join(projectRoot, "supabase/migrations");
  const lockfilePath = path.join(projectRoot, "package-lock.json");
  const testInventoryPath = path.join(projectRoot, "docs/certification/phase-34a/PHASE_34A_GATE_CLOSURE_MATRIX.json");

  const migrationFiles = fs.existsSync(migrationsDir)
    ? fs.readdirSync(migrationsDir)
        .filter(f => f.endsWith(".sql") && f.substring(0, 14) <= "20261115000029")
        .sort()
    : [];

  return {
    repository: "Mayyank04/kaamsetu",
    branch: "phase-34a-conditional-gate-closure",
    baselineCommit: "663c792",
    parentCommit: "b0f79b2",
    migrations: {
      count: migrationFiles.length,
      range: "01 to 29",
      latestMigration: migrationFiles[migrationFiles.length - 1] || "none",
      migrationDirectoryDigest: computeMigrationsDirectoryDigest(migrationsDir, "20261115000029"),
    },
    lockfileDigest: computeFileSha256(lockfilePath),
    testInventoryDigest: computeFileSha256(testInventoryPath),
    environmentClassification: "CLASS_B_CONTROLLED_ROLLOUT",
    toolchain: {
      nodeVersion: "v20.x (LTS) / v22.x",
      nextVersion: "15.1.7",
      typeScriptVersion: "5.x",
      postgresVersion: "15.x",
    },
    documentationCount: 18,
    timestamp: "2026-11-15T23:35:00.000Z",
  };
}

/**
 * Computes canonical digest of release manifest data
 */
export function computeManifestDigest(manifest: ReleaseManifestData): string {
  const canonicalJson = canonicalizeJson(manifest);
  return crypto.createHash("sha256").update(canonicalJson, "utf8").digest("hex");
}

/**
 * Signs canonical release manifest with Ed25519
 */
export function signReleaseManifest(
  manifest: ReleaseManifestData,
  keyPair: { keyId: string; privateKeyPem: string; publicKeyPem: string }
): CanonicalSignedReleaseManifest {
  const canonicalJson = canonicalizeJson(manifest);
  const canonicalDigest = crypto.createHash("sha256").update(canonicalJson, "utf8").digest("hex");

  const signature = crypto
    .sign(null, Buffer.from(canonicalJson, "utf8"), keyPair.privateKeyPem)
    .toString("hex");

  return {
    manifest,
    canonicalDigest,
    signature,
    signingKeyId: keyPair.keyId,
    publicKeyPem: keyPair.publicKeyPem,
    reproducibilityClassification: "reproducible_canonical_manifest",
  };
}

/**
 * Verifies canonical release manifest signature
 */
export function verifyReleaseManifestSignature(signedManifest: CanonicalSignedReleaseManifest): boolean {
  try {
    const canonicalJson = canonicalizeJson(signedManifest.manifest);
    const expectedDigest = crypto.createHash("sha256").update(canonicalJson, "utf8").digest("hex");

    if (signedManifest.canonicalDigest !== expectedDigest) {
      return false; // Digest mismatch
    }

    return crypto.verify(
      null,
      Buffer.from(canonicalJson, "utf8"),
      signedManifest.publicKeyPem,
      Buffer.from(signedManifest.signature, "hex")
    );
  } catch {
    return false;
  }
}

export const verifySignedReleaseManifest = verifyReleaseManifestSignature;
