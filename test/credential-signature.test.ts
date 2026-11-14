/**
 * KAAMSETU Cryptographic Credential Test Suite
 *
 * Verifies RFC 8785 Canonical JSON hashing and HMAC-SHA256 signature verification across 7 scenarios:
 * 1. Valid credential signature verification
 * 2. Unknown / non-existent credential verification
 * 3. Modified / tampered payload detection (canonical hash change)
 * 4. Invalid / spoofed signature detection
 * 5. Revoked credential detection
 * 6. Suspended / Unpublished credential detection
 * 7. Expired credential detection
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
  console.log("KAAMSETU CRYPTOGRAPHIC CREDENTIAL INTEGRITY & SIGNING TEST SUITE");
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
  };

  // Sign original valid payload
  const signed = signCredentialPayload(basePayload);

  // ---------------------------------------------------------------------------
  // SCENARIO 1: Valid credential signature
  // ---------------------------------------------------------------------------
  {
    const ver = verifyCredentialSignature(basePayload, signed.signature);
    const passed = ver.isValid === true && ver.status === "active";
    scenarioResults.push({
      scenarioId: 1,
      name: "Valid credential verification",
      expectedStatus: "active (valid: true)",
      actualStatus: `${ver.status} (valid: ${ver.isValid})`,
      isValid: ver.isValid,
      passed,
      details: "Original canonical bytes match issued signature perfectly",
    });
  }

  // ---------------------------------------------------------------------------
  // SCENARIO 2: Unknown / missing credential payload
  // ---------------------------------------------------------------------------
  {
    const emptyPayload = {} as unknown as CanonicalCredentialPayload;
    const ver = verifyCredentialSignature(emptyPayload, "0000000000000000000000000000000000000000000000000000000000000000");
    const passed = ver.isValid === false && ver.status === "tampered";
    scenarioResults.push({
      scenarioId: 2,
      name: "Unknown / malformed credential payload",
      expectedStatus: "tampered (valid: false)",
      actualStatus: `${ver.status} (valid: ${ver.isValid})`,
      isValid: ver.isValid,
      passed,
      details: "Unknown/unregistered payloads fail cryptographic verification",
    });
  }

  // ---------------------------------------------------------------------------
  // SCENARIO 3: Modified / tampered payload (e.g. attacker alters NSQF level or trade)
  // ---------------------------------------------------------------------------
  {
    const tamperedPayload: CanonicalCredentialPayload = {
      ...basePayload,
      nsqfLevel: 8, // Attacker forged their qualification level from 4 to 8
    };
    const ver = verifyCredentialSignature(tamperedPayload, signed.signature);
    const passed = ver.isValid === false && ver.status === "tampered";
    scenarioResults.push({
      scenarioId: 3,
      name: "Tampered payload detection (forged NSQF Level)",
      expectedStatus: "tampered (valid: false)",
      actualStatus: `${ver.status} (valid: ${ver.isValid})`,
      isValid: ver.isValid,
      passed,
      details: "Canonical hash alteration detected; signature rejected in constant time",
    });
  }

  // ---------------------------------------------------------------------------
  // SCENARIO 4: Invalid / forged cryptographic signature
  // ---------------------------------------------------------------------------
  {
    const forgedSignature = "a".repeat(64); // Attacker provides random hex
    const ver = verifyCredentialSignature(basePayload, forgedSignature);
    const passed = ver.isValid === false && ver.status === "tampered";
    scenarioResults.push({
      scenarioId: 4,
      name: "Forged cryptographic signature rejection",
      expectedStatus: "tampered (valid: false)",
      actualStatus: `${ver.status} (valid: ${ver.isValid})`,
      isValid: ver.isValid,
      passed,
      details: "Invalid signature rejected via constant-time comparison",
    });
  }

  // ---------------------------------------------------------------------------
  // SCENARIO 5: Formally revoked credential
  // ---------------------------------------------------------------------------
  {
    const revokedPayload: CanonicalCredentialPayload = {
      ...basePayload,
      status: "revoked",
    };
    const revokedSigned = signCredentialPayload(revokedPayload);
    const ver = verifyCredentialSignature(revokedPayload, revokedSigned.signature);
    const passed = ver.isValid === false && ver.status === "revoked";
    scenarioResults.push({
      scenarioId: 5,
      name: "Revoked credential identification",
      expectedStatus: "revoked (valid: false)",
      actualStatus: `${ver.status} (valid: ${ver.isValid})`,
      isValid: ver.isValid,
      passed,
      details: "Revocation status accurately flagged to prevent usage of decommissioned credentials",
    });
  }

  // ---------------------------------------------------------------------------
  // SCENARIO 6: Suspended / under-review credential
  // ---------------------------------------------------------------------------
  {
    const suspendedPayload: CanonicalCredentialPayload = {
      ...basePayload,
      status: "suspended",
    };
    const suspendedSigned = signCredentialPayload(suspendedPayload);
    const ver = verifyCredentialSignature(suspendedPayload, suspendedSigned.signature);
    const passed = ver.isValid === false && ver.status === "suspended";
    scenarioResults.push({
      scenarioId: 6,
      name: "Suspended credential handling",
      expectedStatus: "suspended (valid: false)",
      actualStatus: `${ver.status} (valid: ${ver.isValid})`,
      isValid: ver.isValid,
      passed,
      details: "Suspended credential correctly identified as temporarily invalid",
    });
  }

  // ---------------------------------------------------------------------------
  // SCENARIO 7: Expired credential
  // ---------------------------------------------------------------------------
  {
    const expiredPayload: CanonicalCredentialPayload = {
      ...basePayload,
      issuedAt: "2023-01-01T00:00:00.000Z",
      expiresAt: "2024-01-01T00:00:00.000Z", // Past date
    };
    const expiredSigned = signCredentialPayload(expiredPayload);
    const ver = verifyCredentialSignature(expiredPayload, expiredSigned.signature);
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
  // CANONICALIZATION INVARIANT: Key Ordering & Whitespace Insensitivity
  // ---------------------------------------------------------------------------
  const obj1 = { b: 2, a: 1, c: { z: 26, y: 25 } };
  const obj2 = { a: 1, c: { y: 25, z: 26 }, b: 2 };
  const jcs1 = canonicalizeJson(obj1);
  const jcs2 = canonicalizeJson(obj2);
  const jcsMatch = jcs1 === jcs2 && jcs1 === '{"a":1,"b":2,"c":{"y":25,"z":26}}';

  // Print Table
  console.log("------------------------------------------------------------------------------------------------------");
  console.log(
    "ID".padEnd(4) +
    "Credential Scenario".padEnd(46) +
    "Expected".padEnd(26) +
    "Result".padEnd(10)
  );
  console.log("------------------------------------------------------------------------------------------------------");

  let allPassed = jcsMatch;
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

  console.log(`RFC 8785 Canonical JSON Invariant: ${jcsMatch ? "PASSED (Deterministic byte serialization)" : "FAILED"}`);
  console.log(`Summary: ${scenarioResults.filter((r) => r.passed).length} / ${scenarioResults.length} Scenarios Passed.`);

  if (!allPassed) {
    console.error("SOME CREDENTIAL SCENARIOS FAILED!");
    process.exit(1);
  } else {
    console.log("ALL 7 CRYPTOGRAPHIC CREDENTIAL SCENARIOS INDEPENDENTLY VERIFIED.\n");
  }
}

runSuite();
