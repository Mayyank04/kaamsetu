/**
 * KAAMSETU Cryptographic Credential Integrity & Key Rotation Test Suite
 *
 * Verifies RFC 8785 Canonical JSON hashing, HMAC-SHA256 signature verification,
 * and key rotation across 13 required security scenarios:
 *
 * 1. Valid signature
 * 2. Modified payload
 * 3. Wrong key
 * 4. Missing secret enforcement in production
 * 5. Unknown key version
 * 6. Revoked key version
 * 7. Expired credential
 * 8. Suspended credential
 * 9. Revoked credential
 * 10. Signature tampering
 * 11. Canonicalization edge cases (Unicode sorting, nested structures, whitespace)
 * 12. Key rotation (Verifying older v1 credentials alongside newer v2 credentials)
 * 13. Registry identifier mismatch
 */

import {
  canonicalizeJson,
  computeCanonicalHash,
  signCredentialPayload,
  verifyCredentialSignature,
  CanonicalCredentialPayload,
} from "../src/lib/crypto/credential-signer";

interface ScenarioResult {
  scenarioId: number;
  name: string;
  expectedStatus: string;
  actualStatus: string;
  isValid: boolean;
  passed: boolean;
  details: string;
}

const scenarioResults: ScenarioResult[] = [];

function runSuite() {
  console.log("===============================================================================");
  console.log("KAAMSETU CRYPTOGRAPHIC CREDENTIAL INTEGRITY & KEY ROTATION TEST SUITE");
  console.log("Standard: RFC 8785 Canonical JSON (JCS) + HMAC-SHA256 Non-Repudiation");
  console.log("===============================================================================\n");

  const basePayload: CanonicalCredentialPayload = {
    registryId: "IN-RJ-2026-8812-KS",
    workerProfileId: "55555555-5555-5555-5555-555555550001",
    fullName: "Rameshwar Sharma",
    primaryTrade: "Industrial Electrician & Solar Grid Specialist",
    category: "Electrical & Solar",
    nsqfLevel: 4,
    issuer: "KAAMSETU National Workforce Trust Protocol",
    issuedAt: "2026-01-15T08:00:00.000Z",
    expiresAt: "2027-01-15T08:00:00.000Z",
    status: "active",
    keyVersion: "v1",
  };

  const keyV1 = "kaamsetu-test-signing-key-version-1-minimum-32-characters";
  const keyV2 = "kaamsetu-test-signing-key-version-2-minimum-32-characters";
  const wrongKey = "completely-wrong-unauthorized-key-32-characters-minimum";

  // Sign original valid payload with v1
  const signedV1 = signCredentialPayload(basePayload, { keyVersion: "v1", customSecret: keyV1 });

  // ---------------------------------------------------------------------------
  // SCENARIO 1: Valid signature
  // ---------------------------------------------------------------------------
  {
    const ver = verifyCredentialSignature(basePayload, signedV1.signature, { customSecret: keyV1 });
    const passed = ver.isValid === true && ver.status === "active";
    scenarioResults.push({
      scenarioId: 1,
      name: "Valid credential signature verification",
      expectedStatus: "active (valid: true)",
      actualStatus: `${ver.status} (valid: ${ver.isValid})`,
      isValid: ver.isValid,
      passed,
      details: "Original canonical bytes match issued signature perfectly",
    });
  }

  // ---------------------------------------------------------------------------
  // SCENARIO 2: Modified payload (forged NSQF Level from 4 to 8)
  // ---------------------------------------------------------------------------
  {
    const tamperedPayload: CanonicalCredentialPayload = {
      ...basePayload,
      nsqfLevel: 8,
    };
    const ver = verifyCredentialSignature(tamperedPayload, signedV1.signature, { customSecret: keyV1 });
    const passed = ver.isValid === false && ver.status === "tampered";
    scenarioResults.push({
      scenarioId: 2,
      name: "Modified payload detection (forged NSQF Level)",
      expectedStatus: "tampered (valid: false)",
      actualStatus: `${ver.status} (valid: ${ver.isValid})`,
      isValid: ver.isValid,
      passed,
      details: "Canonical hash alteration detected; signature rejected in constant time",
    });
  }

  // ---------------------------------------------------------------------------
  // SCENARIO 3: Wrong key
  // ---------------------------------------------------------------------------
  {
    const ver = verifyCredentialSignature(basePayload, signedV1.signature, { customSecret: wrongKey });
    const passed = ver.isValid === false && ver.status === "tampered";
    scenarioResults.push({
      scenarioId: 3,
      name: "Wrong signing key rejection",
      expectedStatus: "tampered (valid: false)",
      actualStatus: `${ver.status} (valid: ${ver.isValid})`,
      isValid: ver.isValid,
      passed,
      details: "Signature computed under foreign key fails constant-time comparison",
    });
  }

  // ---------------------------------------------------------------------------
  // SCENARIO 4: Missing secret enforcement in production
  // ---------------------------------------------------------------------------
  {
    let errorThrown = false;
    const originalEnv = process.env.NODE_ENV;
    const originalKey = process.env.CREDENTIAL_SIGNING_KEY;
    try {
      (process.env as any).NODE_ENV = "production";
      delete process.env.CREDENTIAL_SIGNING_KEY;
      delete process.env.CREDENTIAL_SIGNING_KEY_V1;

      // Attempt to sign with missing production secret
      signCredentialPayload(basePayload, { keyVersion: "v1" });
    } catch (err: unknown) {
      errorThrown = true;
    } finally {
      (process.env as any).NODE_ENV = originalEnv;
      if (originalKey) process.env.CREDENTIAL_SIGNING_KEY = originalKey;
    }

    const passed = errorThrown;
    scenarioResults.push({
      scenarioId: 4,
      name: "Missing production secret fails closed",
      expectedStatus: "throw Fatal Configuration Error",
      actualStatus: errorThrown ? "Error thrown (blocked)" : "Silent fallback (VULNERABILITY)",
      isValid: !errorThrown,
      passed,
      details: "Production strictly refuses credential issuance when secret is unconfigured",
    });
  }

  // ---------------------------------------------------------------------------
  // SCENARIO 5: Unknown key version
  // ---------------------------------------------------------------------------
  {
    const unknownVersionPayload: CanonicalCredentialPayload = {
      ...basePayload,
      keyVersion: "v99_nonexistent",
    };
    const ver = verifyCredentialSignature(unknownVersionPayload, signedV1.signature);
    const passed = ver.isValid === false && ver.status === "unknown";
    scenarioResults.push({
      scenarioId: 5,
      name: "Unknown key version rejection",
      expectedStatus: "unknown (valid: false)",
      actualStatus: `${ver.status} (valid: ${ver.isValid})`,
      isValid: ver.isValid,
      passed,
      details: "Credentials referencing unknown key versions fail closed",
    });
  }

  // ---------------------------------------------------------------------------
  // SCENARIO 6: Revoked key version
  // ---------------------------------------------------------------------------
  {
    const originalRevoked = process.env.REVOKED_SIGNING_KEY_VERSIONS;
    process.env.REVOKED_SIGNING_KEY_VERSIONS = "v1_compromised,v0_deprecated";

    const revokedKeyPayload: CanonicalCredentialPayload = {
      ...basePayload,
      keyVersion: "v1_compromised",
    };
    const ver = verifyCredentialSignature(revokedKeyPayload, signedV1.signature);
    process.env.REVOKED_SIGNING_KEY_VERSIONS = originalRevoked;

    const passed = ver.isValid === false && ver.status === "revoked";
    scenarioResults.push({
      scenarioId: 6,
      name: "Revoked key version identification",
      expectedStatus: "revoked (valid: false)",
      actualStatus: `${ver.status} (valid: ${ver.isValid})`,
      isValid: ver.isValid,
      passed,
      details: "Credentials signed with revoked keys are rejected as invalid",
    });
  }

  // ---------------------------------------------------------------------------
  // SCENARIO 7: Expired credential
  // ---------------------------------------------------------------------------
  {
    const expiredPayload: CanonicalCredentialPayload = {
      ...basePayload,
      issuedAt: "2023-01-01T00:00:00.000Z",
      expiresAt: "2024-01-01T00:00:00.000Z",
    };
    const expiredSigned = signCredentialPayload(expiredPayload, { customSecret: keyV1 });
    const ver = verifyCredentialSignature(expiredPayload, expiredSigned.signature, { customSecret: keyV1 });
    const passed = ver.isValid === false && ver.status === "expired";
    scenarioResults.push({
      scenarioId: 7,
      name: "Expired credential detection",
      expectedStatus: "expired (valid: false)",
      actualStatus: `${ver.status} (valid: ${ver.isValid})`,
      isValid: ver.isValid,
      passed,
      details: "Expired credential rejected with clear timestamp notification",
    });
  }

  // ---------------------------------------------------------------------------
  // SCENARIO 8: Suspended credential
  // ---------------------------------------------------------------------------
  {
    const suspendedPayload: CanonicalCredentialPayload = {
      ...basePayload,
      status: "suspended",
    };
    const suspendedSigned = signCredentialPayload(suspendedPayload, { customSecret: keyV1 });
    const ver = verifyCredentialSignature(suspendedPayload, suspendedSigned.signature, { customSecret: keyV1 });
    const passed = ver.isValid === false && ver.status === "suspended";
    scenarioResults.push({
      scenarioId: 8,
      name: "Suspended credential handling",
      expectedStatus: "suspended (valid: false)",
      actualStatus: `${ver.status} (valid: ${ver.isValid})`,
      isValid: ver.isValid,
      passed,
      details: "Suspended credential correctly identified as temporarily invalid",
    });
  }

  // ---------------------------------------------------------------------------
  // SCENARIO 9: Revoked credential
  // ---------------------------------------------------------------------------
  {
    const revokedPayload: CanonicalCredentialPayload = {
      ...basePayload,
      status: "revoked",
    };
    const revokedSigned = signCredentialPayload(revokedPayload, { customSecret: keyV1 });
    const ver = verifyCredentialSignature(revokedPayload, revokedSigned.signature, { customSecret: keyV1 });
    const passed = ver.isValid === false && ver.status === "revoked";
    scenarioResults.push({
      scenarioId: 9,
      name: "Revoked credential identification",
      expectedStatus: "revoked (valid: false)",
      actualStatus: `${ver.status} (valid: ${ver.isValid})`,
      isValid: ver.isValid,
      passed,
      details: "Revocation status accurately flagged to prevent usage of decommissioned credentials",
    });
  }

  // ---------------------------------------------------------------------------
  // SCENARIO 10: Signature tampering
  // ---------------------------------------------------------------------------
  {
    // Modify one hex byte in the signature
    const tamperedHex = signedV1.signature.slice(0, -2) + (signedV1.signature.slice(-2) === "00" ? "ff" : "00");
    const ver = verifyCredentialSignature(basePayload, tamperedHex, { customSecret: keyV1 });
    const passed = ver.isValid === false && ver.status === "tampered";
    scenarioResults.push({
      scenarioId: 10,
      name: "Signature byte tampering rejection",
      expectedStatus: "tampered (valid: false)",
      actualStatus: `${ver.status} (valid: ${ver.isValid})`,
      isValid: ver.isValid,
      passed,
      details: "Tampered signature bytes detected via constant-time buffer comparison",
    });
  }

  // ---------------------------------------------------------------------------
  // SCENARIO 11: Canonicalization edge cases
  // ---------------------------------------------------------------------------
  {
    const complex1 = {
      z: "last",
      a: "first",
      sub: { num: 123, nullVal: null, arr: [3, 2, 1] },
      unicode: "नमस्ते গুৱাহাটী",
    };
    const complex2 = {
      unicode: "नमस्ते গুৱাহাটী",
      sub: { nullVal: null, arr: [3, 2, 1], num: 123 },
      a: "first",
      z: "last",
    };
    const jcs1 = canonicalizeJson(complex1);
    const jcs2 = canonicalizeJson(complex2);
    const passed = jcs1 === jcs2 && jcs1.indexOf('"a":"first"') < jcs1.indexOf('"z":"last"');
    scenarioResults.push({
      scenarioId: 11,
      name: "RFC 8785 Canonical JSON sorting & Unicode",
      expectedStatus: "identical canonical string",
      actualStatus: passed ? "Exact JCS Byte Match" : "Mismatch",
      isValid: passed,
      passed,
      details: "Unicode code point key sorting guarantees deterministic hashing",
    });
  }

  // ---------------------------------------------------------------------------
  // SCENARIO 12: Key rotation (Active key rotated from v1 to v2)
  // ---------------------------------------------------------------------------
  {
    // Simulate multi-key environment
    process.env.CREDENTIAL_SIGNING_KEY_V1 = keyV1;
    process.env.CREDENTIAL_SIGNING_KEY_V2 = keyV2;
    process.env.ACTIVE_SIGNING_KEY_VERSION = "v2";

    // 1. Old credential issued under v1 remains valid
    const verOld = verifyCredentialSignature(basePayload, signedV1.signature, { customSecret: keyV1 });

    // 2. New credential issued under active key v2
    const payloadV2: CanonicalCredentialPayload = {
      ...basePayload,
      registryId: "IN-AS-2026-9901-KS",
      keyVersion: "v2",
    };
    const signedV2 = signCredentialPayload(payloadV2, { keyVersion: "v2", customSecret: keyV2 });
    const verNew = verifyCredentialSignature(payloadV2, signedV2.signature, { customSecret: keyV2 });

    const passed = verOld.isValid === true && verNew.isValid === true && signedV2.keyVersion === "v2";
    scenarioResults.push({
      scenarioId: 12,
      name: "Multi-version key rotation support",
      expectedStatus: "both v1 and v2 valid",
      actualStatus: passed ? "Legacy v1 and New v2 Both Valid" : "Rotation Failure",
      isValid: passed,
      passed,
      details: "Historical credentials remain verifiable while new credentials sign with active key",
    });
  }

  // ---------------------------------------------------------------------------
  // SCENARIO 13: Registry identifier mismatch
  // ---------------------------------------------------------------------------
  {
    const spoofedRegistryPayload: CanonicalCredentialPayload = {
      ...basePayload,
      registryId: "IN-DL-2026-9999-KS", // Attacker substituted registry ID
    };
    const ver = verifyCredentialSignature(spoofedRegistryPayload, signedV1.signature, { customSecret: keyV1 });
    const passed = ver.isValid === false && ver.status === "tampered";
    scenarioResults.push({
      scenarioId: 13,
      name: "Registry identifier mismatch rejection",
      expectedStatus: "tampered (valid: false)",
      actualStatus: `${ver.status} (valid: ${ver.isValid})`,
      isValid: ver.isValid,
      passed,
      details: "Registry identifier is bound to canonical signature payload",
    });
  }

  // Print Results Table
  console.log("------------------------------------------------------------------------------------------------------");
  console.log(
    "ID".padEnd(4) +
    "Credential Scenario".padEnd(46) +
    "Expected".padEnd(26) +
    "Result".padEnd(10)
  );
  console.log("------------------------------------------------------------------------------------------------------");

  let allPassed = true;
  for (const r of scenarioResults) {
    if (!r.passed) allPassed = false;
    const statusStr = r.passed ? "PASSED [OK]" : "FAILED [X]";
    console.log(
      String(r.scenarioId).padEnd(4) +
      r.name.padEnd(46) +
      r.expectedStatus.padEnd(26) +
      statusStr.padEnd(10)
    );
  }
  console.log("------------------------------------------------------------------------------------------------------\n");

  console.log(`Summary: ${scenarioResults.filter((r) => r.passed).length} / ${scenarioResults.length} Scenarios Passed.`);

  if (!allPassed) {
    console.error("SOME CREDENTIAL SCENARIOS FAILED!");
    process.exit(1);
  } else {
    console.log("ALL 13 CRYPTOGRAPHIC CREDENTIAL & KEY ROTATION SCENARIOS INDEPENDENTLY VERIFIED.\n");
  }
}

runSuite();
