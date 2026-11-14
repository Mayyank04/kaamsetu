/**
 * KAAMSETU Cryptographic Credential Signature & Key Integrity Test Suite
 *
 * Validates:
 * 1. RFC 8785 Canonical JSON (JCS) deterministic encoding
 * 2. HMAC-SHA256 non-repudiation signature generation and constant-time verification
 * 3. Removal of customSecret from production signing and verification APIs
 * 4. Test-only dependency injection isolation (forbidden in production)
 * 5. Multi-version key rotation (historical credentials remain valid under previous keys)
 * 6. Revocation lists (revoked key versions fail closed immediately)
 * 7. Key material quality & 256-bit entropy enforcement (rejects placeholders and weak keys)
 * 8. Expiration, suspension, and registry tampering detection
 */

import {
  signCredentialPayload,
  verifyCredentialSignature,
  canonicalizeJson,
  computeCanonicalHash,
  CanonicalCredentialPayload,
  __setTestSigningKeyForVersion,
  __resetTestSigningKeys,
} from "../src/lib/crypto/credential-signer";
import {
  validateCryptographicKeyMaterial,
  assertCryptographicKeyQuality,
} from "../src/lib/crypto/key-validator";

interface ScenarioResult {
  scenarioId: number;
  name: string;
  expectedStatus: string;
  actualStatus: string;
  isValid: boolean;
  passed: boolean;
  details?: string;
}

const scenarioResults: ScenarioResult[] = [];

async function runSuite() {
  console.log("===============================================================================");
  console.log("KAAMSETU CRYPTOGRAPHIC CREDENTIAL INTEGRITY & KEY ROTATION TEST SUITE");
  console.log("Standard: RFC 8785 Canonical JSON (JCS) + HMAC-SHA256 Non-Repudiation");
  console.log("===============================================================================\n");

  const basePayload: CanonicalCredentialPayload = {
    registryId: "IN-RJ-2026-8802-KS",
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

  // 256-bit cryptographically secure test keys
  const keyV1 = "eHRvWnF0V21ZOGJ3UjRuVzV0TTh4Y09yWTV0TTB4YzE="; // 32 bytes base64
  const keyV2 = "YjNtVjl4Y09yWTV0TTB4YzF4dG9acXRXbVk4YndSNG4="; // 32 bytes base64
  const wrongKey = "d3Jvbmcxa2V5MWZvcmVpZ24xbWluaW11bTEzMmNoYXI="; // 32 bytes base64

  // Set test keys via isolated test-only dependency injection
  __setTestSigningKeyForVersion("v1", keyV1);
  __setTestSigningKeyForVersion("v2", keyV2);

  // Sign original valid payload with v1
  const signedV1 = signCredentialPayload(basePayload, { keyVersion: "v1" });

  // ---------------------------------------------------------------------------
  // SCENARIO 1: Valid signature verification
  // ---------------------------------------------------------------------------
  {
    const ver = verifyCredentialSignature(basePayload, signedV1.signature, { keyVersion: "v1" });
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
    const ver = verifyCredentialSignature(tamperedPayload, signedV1.signature, { keyVersion: "v1" });
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
  // SCENARIO 3: Wrong key rejection
  // ---------------------------------------------------------------------------
  {
    __setTestSigningKeyForVersion("v1_wrong", wrongKey);
    const ver = verifyCredentialSignature(basePayload, signedV1.signature, { keyVersion: "v1_wrong" });
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
  // SCENARIO 4: Missing secret enforcement in production (Fails Closed)
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
  // SCENARIO 5: Unknown key version rejection
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
  // SCENARIO 6: Revoked key version rejection
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
  // SCENARIO 7: Expired credential detection
  // ---------------------------------------------------------------------------
  {
    const expiredPayload: CanonicalCredentialPayload = {
      ...basePayload,
      issuedAt: "2023-01-01T00:00:00.000Z",
      expiresAt: "2024-01-01T00:00:00.000Z",
    };
    const expiredSigned = signCredentialPayload(expiredPayload, { keyVersion: "v1" });
    const ver = verifyCredentialSignature(expiredPayload, expiredSigned.signature, { keyVersion: "v1" });
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
  // SCENARIO 8: Suspended credential handling
  // ---------------------------------------------------------------------------
  {
    const suspendedPayload: CanonicalCredentialPayload = {
      ...basePayload,
      status: "suspended",
    };
    const suspendedSigned = signCredentialPayload(suspendedPayload, { keyVersion: "v1" });
    const ver = verifyCredentialSignature(suspendedPayload, suspendedSigned.signature, { keyVersion: "v1" });
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
  // SCENARIO 9: Revoked credential identification
  // ---------------------------------------------------------------------------
  {
    const revokedPayload: CanonicalCredentialPayload = {
      ...basePayload,
      status: "revoked",
    };
    const revokedSigned = signCredentialPayload(revokedPayload, { keyVersion: "v1" });
    const ver = verifyCredentialSignature(revokedPayload, revokedSigned.signature, { keyVersion: "v1" });
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
  // SCENARIO 10: Signature byte tampering rejection
  // ---------------------------------------------------------------------------
  {
    const tamperedHex = signedV1.signature.slice(0, -2) + (signedV1.signature.slice(-2) === "00" ? "ff" : "00");
    const ver = verifyCredentialSignature(basePayload, tamperedHex, { keyVersion: "v1" });
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
  // SCENARIO 11: RFC 8785 Canonical JSON sorting & Unicode invariance
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
  // SCENARIO 12: Multi-version key rotation support
  // ---------------------------------------------------------------------------
  {
    process.env.CREDENTIAL_SIGNING_KEY_V1 = keyV1;
    process.env.CREDENTIAL_SIGNING_KEY_V2 = keyV2;
    process.env.ACTIVE_SIGNING_KEY_VERSION = "v2";

    // 1. Old credential issued under v1 remains valid
    const verOld = verifyCredentialSignature(basePayload, signedV1.signature, { keyVersion: "v1" });

    // 2. New credential issued under active key v2
    const payloadV2: CanonicalCredentialPayload = {
      ...basePayload,
      registryId: "IN-AS-2026-9901-KS",
      keyVersion: "v2",
    };
    const signedV2 = signCredentialPayload(payloadV2, { keyVersion: "v2" });
    const verNew = verifyCredentialSignature(payloadV2, signedV2.signature, { keyVersion: "v2" });

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
  // SCENARIO 13: Registry identifier mismatch rejection
  // ---------------------------------------------------------------------------
  {
    const spoofedRegistryPayload: CanonicalCredentialPayload = {
      ...basePayload,
      registryId: "IN-DL-2026-9999-KS",
    };
    const ver = verifyCredentialSignature(spoofedRegistryPayload, signedV1.signature, { keyVersion: "v1" });
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

  // ---------------------------------------------------------------------------
  // SCENARIO 14: Removal of customSecret from Production Interfaces
  // ---------------------------------------------------------------------------
  {
    // Calling signCredentialPayload with arbitrary custom secret property must NOT bypass key resolver
    const maliciousSecret = "attacker-controlled-arbitrary-signing-secret-key-32";
    const signedWithFakeOption = (signCredentialPayload as any)(basePayload, {
      keyVersion: "v1",
      customSecret: maliciousSecret,
    });

    // The signature MUST match keyV1, NOT maliciousSecret
    const verUnderRealKey = verifyCredentialSignature(basePayload, signedWithFakeOption.signature, { keyVersion: "v1" });

    // Attempting to verify with maliciousSecret should fail because verifier ignores customSecret
    const passed = verUnderRealKey.isValid === true;
    scenarioResults.push({
      scenarioId: 14,
      name: "Arbitrary customSecret cannot bypass key resolver",
      expectedStatus: "customSecret ignored (valid: true under real key)",
      actualStatus: passed ? "customSecret Ignored by Engine" : "Custom Secret Accepted (VULNERABILITY)",
      isValid: passed,
      passed,
      details: "Production signing and verification interfaces ignore untrusted secret parameters",
    });
  }

  // ---------------------------------------------------------------------------
  // SCENARIO 15: Test-only Dependency Injection Forbidden in Production
  // ---------------------------------------------------------------------------
  {
    let injectionBlockedInProd = false;
    const originalEnv = process.env.NODE_ENV;
    try {
      (process.env as any).NODE_ENV = "production";
      __setTestSigningKeyForVersion("v_evil", "malicious_key_in_production_attempt");
    } catch (err: unknown) {
      injectionBlockedInProd = true;
    } finally {
      (process.env as any).NODE_ENV = originalEnv;
    }

    scenarioResults.push({
      scenarioId: 15,
      name: "Test-only injection strictly throws in production",
      expectedStatus: "throw Fatal Security Violation",
      actualStatus: injectionBlockedInProd ? "Fatal Error Thrown" : "Allowed in Production (VULNERABILITY)",
      isValid: injectionBlockedInProd,
      passed: injectionBlockedInProd,
      details: "__setTestSigningKeyForVersion guards against execution in production mode",
    });
  }

  // ---------------------------------------------------------------------------
  // SCENARIO 16: Cryptographic Key Quality & 256-bit Entropy Assertion
  // ---------------------------------------------------------------------------
  {
    // 1. Weak key (< 32 bytes)
    const shortKeyRes = validateCryptographicKeyMaterial("short_key_16_byt", "ShortKey");
    // 2. Predictable placeholder
    const placeholderRes = validateCryptographicKeyMaterial("placeholder-signing-key-minimum-32-chars-long", "PlaceholderKey");
    // 3. Low character diversity
    const repetitiveRes = validateCryptographicKeyMaterial("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", "RepetitiveKey");
    // 4. Valid 256-bit Base64 key
    const validKeyRes = validateCryptographicKeyMaterial(keyV1, "ValidKey");

    const passed =
      shortKeyRes.valid === false &&
      placeholderRes.valid === false &&
      repetitiveRes.valid === false &&
      validKeyRes.valid === true &&
      validKeyRes.byteLength >= 32;

    scenarioResults.push({
      scenarioId: 16,
      name: "Cryptographic key material quality & entropy enforcement",
      expectedStatus: "reject weak/predictable, accept 256-bit",
      actualStatus: passed ? "Strict Entropy Validated (>=32 bytes)" : "Weak Key Allowed",
      isValid: passed,
      passed,
      details: "Validates decoded byte length and rejects predictable or low-entropy patterns",
    });
  }

  // Print Results Table
  console.log("------------------------------------------------------------------------------------------------------");
  console.log(
    "ID".padEnd(4) +
    "Credential Scenario".padEnd(48) +
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
      r.name.padEnd(48) +
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
    console.log("ALL 16 CRYPTOGRAPHIC CREDENTIAL & KEY ROTATION SCENARIOS INDEPENDENTLY VERIFIED.\n");
  }
}

runSuite().catch((err) => {
  console.error("Fatal error in credential test suite:", err);
  process.exit(1);
});
