/**
 * KAAMSETU Persistent Rate Limiting, Fail-Closed Architecture & HMAC Integrity Test Suite
 *
 * Validates:
 * 1. Privacy preservation (HMAC-SHA256 key hashing with dedicated RATE_LIMIT_HMAC_SECRET)
 * 2. Domain separation (phone:send, phone:verify, ip:send produce distinct digests for identical input)
 * 3. 256-bit entropy enforcement on RATE_LIMIT_HMAC_SECRET (fails closed if missing or weak in production)
 * 4. Dual-secret rotation preservation (active lockouts remain enforceable under previous secret)
 * 5. Persistent atomic tracking in PostgreSQL auth_rate_limits
 * 6. Threshold blocking and remaining cooldown duration calculation
 * 7. Persistent OTP verify brute-force lockout (5 attempts -> 15 min lock)
 * 8. Persistent lockout clearing on successful verification
 * 9. Fail-closed production architecture (unconfigured Supabase, connection errors, RPC failures deny access)
 * 10. Development sandbox gating (explicit ENABLE_IN_MEMORY_RATE_LIMIT_MOCK required for mock fallback)
 * 11. High-concurrency atomic serialization across multiple PostgreSQL connections
 * 12. Concurrent verification failures recorded atomically without loss
 * 13. Logging privacy assertion (no plaintext phone, OTP, or secret in logs or diagnostics)
 */

import { Client } from "pg";
import {
  hashRateLimitKey,
  checkRateLimit,
  validateOtpVerifyAttempt,
  recordFailedOtpAttempt,
  clearFailedOtpAttempts,
  validateOtpSendRateLimit,
  getRateLimitHmacSecret,
} from "../src/lib/security/rate-limiter";
import { maskPhone, maskEmail, maskSecret, sanitizeLogData } from "../src/lib/security/privacy-logger";

const DB_CONFIG = {
  host: process.env.PGHOST || "localhost",
  port: parseInt(process.env.PGPORT || "5432", 10),
  database: process.env.PGDATABASE || "kaamsetu_rls_test",
  user: process.env.PGUSER || "mayankgautam",
  password: process.env.PGPASSWORD || "",
};

interface TestResult {
  scenarioId: number;
  name: string;
  expected: string;
  actual: string;
  passed: boolean;
}

const results: TestResult[] = [];

async function main() {
  console.log("===============================================================================");
  console.log("KAAMSETU PERSISTENT RATE LIMITING & FAIL-CLOSED DEFENSE TEST SUITE");
  console.log("Standard: Atomic PostgreSQL RPCs + Privacy Hashing + Fail-Closed Architecture");
  console.log("===============================================================================\n");

  const pgClient = new Client(DB_CONFIG);
  await pgClient.connect();

  const originalEnv = { ...process.env };
  (process.env as Record<string, string | undefined>).NODE_ENV = "test";
  process.env.RATE_LIMIT_HMAC_SECRET = "kaamsetu-test-hmac-rate-limit-secret-32-chars-long";

  try {
    // -------------------------------------------------------------------------
    // Scenario 1: Privacy Preservation via SHA-256 HMAC Key Hashing
    // -------------------------------------------------------------------------
    {
      const rawPhone = "+91 98765 43210";
      const rawIp = "192.168.1.100";

      const hashedPhoneKey = hashRateLimitKey("phone:verify", rawPhone);
      const hashedIpKey = hashRateLimitKey("ip:send", rawIp);

      const containsRawPhone = hashedPhoneKey.includes("9876543210") || hashedPhoneKey.includes("98765");
      const containsRawIp = hashedIpKey.includes("192.168.1.100");
      const isExpectedFormat = hashedPhoneKey.startsWith("phone:verify:") && hashedPhoneKey.length > 25;

      const passed = !containsRawPhone && !containsRawIp && isExpectedFormat;
      results.push({
        scenarioId: 1,
        name: "Privacy-Preserving SHA-256 HMAC Key Hashing",
        expected: "Raw PII excluded from rate-limit keys",
        actual: passed ? "Digest generated without leaking phone or IP" : "FAILED: Raw PII leaked",
        passed,
      });
    }

    // -------------------------------------------------------------------------
    // Scenario 2: Domain Separation (Identical Input in Different Namespaces)
    // -------------------------------------------------------------------------
    {
      const identicalInput = "919876543210";
      const sendKey = hashRateLimitKey("phone:send", identicalInput);
      const verifyKey = hashRateLimitKey("phone:verify", identicalInput);

      const sendDigest = sendKey.split(":")[2];
      const verifyDigest = verifyKey.split(":")[2];
      const passed = sendDigest !== verifyDigest;

      results.push({
        scenarioId: 2,
        name: "Domain Separation Across Namespaces",
        expected: "Different digests for phone:send vs phone:verify",
        actual: passed ? "Distinct HMAC digests generated" : "FAILED: Namespace collision",
        passed,
      });
    }

    // -------------------------------------------------------------------------
    // Scenario 3: Missing RATE_LIMIT_HMAC_SECRET in Production Fails Closed
    // -------------------------------------------------------------------------
    {
      let blockedInProd = false;
      try {
        (process.env as any).NODE_ENV = "production";
        delete process.env.RATE_LIMIT_HMAC_SECRET;
        getRateLimitHmacSecret();
      } catch (err: unknown) {
        blockedInProd = true;
      } finally {
        (process.env as any).NODE_ENV = "test";
      }

      results.push({
        scenarioId: 3,
        name: "Missing RATE_LIMIT_HMAC_SECRET in Production Fails Closed",
        expected: "throw Fatal Configuration Error",
        actual: blockedInProd ? "Fatal Error Thrown (Blocked)" : "Silent Fallback (VULNERABILITY)",
        passed: blockedInProd,
      });
    }

    // -------------------------------------------------------------------------
    // Scenario 4: Weak RATE_LIMIT_HMAC_SECRET (< 32 bytes) Fails Closed
    // -------------------------------------------------------------------------
    {
      let weakKeyBlocked = false;
      try {
        (process.env as any).NODE_ENV = "production";
        process.env.RATE_LIMIT_HMAC_SECRET = "short_insecure_key_16_bytes";
        getRateLimitHmacSecret();
      } catch (err: unknown) {
        weakKeyBlocked = true;
      } finally {
        (process.env as any).NODE_ENV = "test";
        delete process.env.RATE_LIMIT_HMAC_SECRET;
      }

      results.push({
        scenarioId: 4,
        name: "Weak RATE_LIMIT_HMAC_SECRET (<32 bytes) Rejected",
        expected: "throw Fatal Configuration Error on weak entropy",
        actual: weakKeyBlocked ? "Weak Key Rejected (Blocked)" : "Weak Key Allowed (VULNERABILITY)",
        passed: weakKeyBlocked,
      });
    }

    // -------------------------------------------------------------------------
    // Scenario 5: Dual-Secret Rotation Preserves Active Lockout
    // -------------------------------------------------------------------------
    {
      const oldSecret = "b2xkX2htYWNfc2VjcmV0X2Zvcl9yb3RhdGlvbl8zMmJ5dGVz";
      const newSecret = "bmV3X2htYWNfc2VjcmV0X2Zvcl9yb3RhdGlvbl8zMmJ5dGVz";
      const testPhone = "919999900088";

      // 1. Lock out phone under old secret in both DB and memory store
      process.env.RATE_LIMIT_HMAC_SECRET = oldSecret;
      process.env.ENABLE_IN_MEMORY_RATE_LIMIT_MOCK = "true";
      delete process.env.RATE_LIMIT_HMAC_SECRET_PREVIOUS;

      const oldVerifyKey = hashRateLimitKey("phone:verify", testPhone, oldSecret);
      await pgClient.query("DELETE FROM public.auth_rate_limits WHERE key = $1;", [oldVerifyKey]);

      for (let i = 0; i < 5; i++) {
        await pgClient.query(
          "SELECT * FROM public.check_and_increment_rate_limit($1, 5, 900, 900);",
          [oldVerifyKey]
        );
        await recordFailedOtpAttempt(testPhone);
      }

      // Verify that database status RPC detects the lockout under oldVerifyKey
      const dbStatusRes = await pgClient.query(
        "SELECT * FROM public.get_rate_limit_status($1);",
        [oldVerifyKey]
      );
      const isDbBlocked = dbStatusRes.rows[0]?.is_blocked === true;

      // 2. Rotate secret: active secret becomes newSecret, oldSecret becomes previous
      process.env.RATE_LIMIT_HMAC_SECRET = newSecret;
      process.env.RATE_LIMIT_HMAC_SECRET_PREVIOUS = oldSecret;

      // Lockout check must detect the active lockout under previous secret
      const lockoutCheck = await validateOtpVerifyAttempt(testPhone);
      const passed = isDbBlocked && lockoutCheck.allowed === false;

      // Clean up
      await pgClient.query("DELETE FROM public.auth_rate_limits WHERE key = $1;", [oldVerifyKey]);
      await clearFailedOtpAttempts(testPhone);
      delete process.env.RATE_LIMIT_HMAC_SECRET;
      delete process.env.RATE_LIMIT_HMAC_SECRET_PREVIOUS;
      delete process.env.ENABLE_IN_MEMORY_RATE_LIMIT_MOCK;

      results.push({
        scenarioId: 5,
        name: "Dual-Secret Rotation Preserves Active Lockout",
        expected: "allowed: false (lockout preserved across key rotation)",
        actual: `allowed: ${lockoutCheck.allowed} (${lockoutCheck.reason})`,
        passed,
      });
    }

    // -------------------------------------------------------------------------
    // Scenario 6: Direct Database RPC Incrementation (Positive Check)
    // -------------------------------------------------------------------------
    {
      const testKey = `test:direct_rpc:${Date.now()}`;
      const res = await pgClient.query(
        "SELECT * FROM public.check_and_increment_rate_limit($1, 5, 60, 300);",
        [testKey]
      );
      const row = res.rows[0];
      const passed = row && row.allowed === true && row.current_count === 1;

      // Clean up
      await pgClient.query("DELETE FROM public.auth_rate_limits WHERE key = $1;", [testKey]);

      results.push({
        scenarioId: 6,
        name: "Atomic PostgreSQL check_and_increment_rate_limit RPC",
        expected: "allowed: true, current_count: 1",
        actual: `allowed: ${row?.allowed}, count: ${row?.current_count}`,
        passed,
      });
    }

    // -------------------------------------------------------------------------
    // Scenario 7: Threshold Enforcement & Block Duration in Database
    // -------------------------------------------------------------------------
    {
      const testKey = `test:threshold:${Date.now()}`;
      // Max 3 attempts, 60s window, 600s block
      for (let i = 0; i < 3; i++) {
        await pgClient.query(
          "SELECT * FROM public.check_and_increment_rate_limit($1, 3, 60, 600);",
          [testKey]
        );
      }

      // 4th attempt should be blocked
      const blockRes = await pgClient.query(
        "SELECT * FROM public.check_and_increment_rate_limit($1, 3, 60, 600);",
        [testKey]
      );
      const blockedRow = blockRes.rows[0];

      // Status check RPC
      const statusRes = await pgClient.query(
        "SELECT * FROM public.get_rate_limit_status($1);",
        [testKey]
      );
      const statusRow = statusRes.rows[0];

      const passed =
        blockedRow?.allowed === false &&
        statusRow?.is_blocked === true &&
        statusRow?.remaining_seconds > 500;

      // Clean up
      await pgClient.query("DELETE FROM public.auth_rate_limits WHERE key = $1;", [testKey]);

      results.push({
        scenarioId: 7,
        name: "Threshold Exceeded Triggers Block Duration",
        expected: "allowed: false, is_blocked: true, remaining > 500s",
        actual: `allowed: ${blockedRow?.allowed}, is_blocked: ${statusRow?.is_blocked}, remaining: ${statusRow?.remaining_seconds}s`,
        passed,
      });
    }

    // -------------------------------------------------------------------------
    // Scenario 8: Persistent 5-Attempt Lockout Enforcement
    // -------------------------------------------------------------------------
    {
      const testPhone = "919999900001";
      const verifyKey = hashRateLimitKey("phone:verify", testPhone);

      // Clean slate
      await pgClient.query("DELETE FROM public.auth_rate_limits WHERE key = $1;", [verifyKey]);

      // Simulate 5 failed verification attempts
      for (let i = 0; i < 5; i++) {
        await pgClient.query(
          "SELECT * FROM public.check_and_increment_rate_limit($1, 5, 900, 900);",
          [verifyKey]
        );
      }

      // 6th attempt: should be blocked
      const checkRes = await pgClient.query(
        "SELECT * FROM public.get_rate_limit_status($1);",
        [verifyKey]
      );
      const status = checkRes.rows[0];
      const isLockedOut = status?.is_blocked === true;

      results.push({
        scenarioId: 8,
        name: "Persistent 5-Attempt Lockout Enforcement",
        expected: "is_blocked: true, remaining_seconds <= 900",
        actual: `is_blocked: ${status?.is_blocked}, remaining: ${status?.remaining_seconds}s`,
        passed: isLockedOut,
      });

      // -----------------------------------------------------------------------
      // Scenario 9: Persistent Lockout Reset via clear_rate_limit RPC
      // -----------------------------------------------------------------------
      await pgClient.query("SELECT public.clear_rate_limit($1);", [verifyKey]);

      const afterClearRes = await pgClient.query(
        "SELECT * FROM public.get_rate_limit_status($1);",
        [verifyKey]
      );
      const statusAfterClear = afterClearRes.rows[0];
      const isCleared = statusAfterClear?.is_blocked === false && statusAfterClear?.current_count === 0;

      results.push({
        scenarioId: 9,
        name: "Persistent Lockout Reset via clear_rate_limit RPC",
        expected: "is_blocked: false, current_count: 0",
        actual: `is_blocked: ${statusAfterClear?.is_blocked}, count: ${statusAfterClear?.current_count}`,
        passed: isCleared,
      });
    }

    // -------------------------------------------------------------------------
    // Scenario 10: Production Fail-Closed Architecture (Unconfigured Supabase)
    // -------------------------------------------------------------------------
    {
      (process.env as Record<string, string | undefined>).NODE_ENV = "production";
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://placeholder-kaamsetu.supabase.co";

      const result = await checkRateLimit("test:prod_fail_closed", 5, 60, 60);
      const passed = result.allowed === false && Boolean(result.reason);

      results.push({
        scenarioId: 10,
        name: "Production Fail-Closed Architecture (No Silent Memory Bypass)",
        expected: "allowed: false (reject without database in production)",
        actual: `allowed: ${result.allowed}, reason: "${result.reason}"`,
        passed,
      });
    }

    // -------------------------------------------------------------------------
    // Scenario 11: Production OTP Verify Fails Closed Without Database
    // -------------------------------------------------------------------------
    {
      (process.env as Record<string, string | undefined>).NODE_ENV = "production";
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://placeholder-kaamsetu.supabase.co";

      const verifyCheck = await validateOtpVerifyAttempt("+91 99999 88888");
      const passed = verifyCheck.allowed === false;

      results.push({
        scenarioId: 11,
        name: "Production OTP Verify Fails Closed Without Database",
        expected: "allowed: false (never allow OTP verify without database)",
        actual: `allowed: ${verifyCheck.allowed}, reason: "${verifyCheck.reason}"`,
        passed,
      });
    }

    // -------------------------------------------------------------------------
    // Scenario 12: Offline Development Sandbox Rejection Without Explicit Mock Flag
    // -------------------------------------------------------------------------
    {
      (process.env as Record<string, string | undefined>).NODE_ENV = "development";
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://placeholder-kaamsetu.supabase.co";
      delete process.env.ENABLE_IN_MEMORY_RATE_LIMIT_MOCK;

      const result = await checkRateLimit("test:dev_no_mock", 5, 60, 60);
      const passed = Boolean(result.allowed === false && result.reason?.includes("ENABLE_IN_MEMORY_RATE_LIMIT_MOCK"));

      results.push({
        scenarioId: 12,
        name: "Development Fail-Closed Without Explicit Mock Opt-In",
        expected: "allowed: false (explicit ENABLE_IN_MEMORY_RATE_LIMIT_MOCK required)",
        actual: `allowed: ${result.allowed}, reason: "${result.reason}"`,
        passed,
      });
    }

    // -------------------------------------------------------------------------
    // Scenario 13: Development In-Memory Store When Explicitly Enabled
    // -------------------------------------------------------------------------
    {
      (process.env as Record<string, string | undefined>).NODE_ENV = "development";
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://placeholder-kaamsetu.supabase.co";
      process.env.ENABLE_IN_MEMORY_RATE_LIMIT_MOCK = "true";

      const mockKey = `test:mock_sandbox:${Date.now()}`;
      const res1 = await checkRateLimit(mockKey, 2, 60, 60);
      const res2 = await checkRateLimit(mockKey, 2, 60, 60);
      const res3 = await checkRateLimit(mockKey, 2, 60, 60); // 3rd exceeds max 2

      const passed = res1.allowed === true && res2.allowed === true && res3.allowed === false;
      results.push({
        scenarioId: 13,
        name: "Development In-Memory Mock Store with Explicit Flag",
        expected: "res1: true, res2: true, res3: false",
        actual: `res1: ${res1.allowed}, res2: ${res2.allowed}, res3: ${res3.allowed}`,
        passed,
      });
    }

    // -------------------------------------------------------------------------
    // Scenario 14: Atomic Concurrency Serialization (10 Simultaneous Connections)
    // -------------------------------------------------------------------------
    {
      const concurrencyKey = `concurrency_rl_test_${Date.now()}`;
      const parallelClients: Client[] = [];

      for (let i = 0; i < 10; i++) {
        const c = new Client(DB_CONFIG);
        await c.connect();
        parallelClients.push(c);
      }

      let allSucceeded = false;
      let finalCount = 0;

      try {
        const promises = parallelClients.map((c) =>
          c.query(
            "SELECT * FROM public.check_and_increment_rate_limit($1, 20, 60, 60);",
            [concurrencyKey]
          )
        );

        const resultsArray = await Promise.all(promises);
        allSucceeded = resultsArray.every((r) => r.rows.length === 1 && r.rows[0].allowed === true);

        const countRes = await pgClient.query(
          "SELECT count FROM public.auth_rate_limits WHERE key = $1;",
          [concurrencyKey]
        );
        finalCount = countRes.rows[0]?.count;

        await pgClient.query("DELETE FROM public.auth_rate_limits WHERE key = $1;", [concurrencyKey]);
      } finally {
        for (const c of parallelClients) {
          await c.end();
        }
      }

      const passed = allSucceeded && finalCount === 10;
      results.push({
        scenarioId: 14,
        name: "Atomic Concurrency Serialization on First Key Insertion",
        expected: "all 10 queries allowed: true, final count = 10",
        actual: `allSucceeded: ${allSucceeded}, final count: ${finalCount}`,
        passed,
      });
    }

    // -------------------------------------------------------------------------
    // Scenario 15: Concurrent Failed Verification Attempts (5 Simultaneous Failures)
    // -------------------------------------------------------------------------
    {
      const failPhone = "919999988877";
      const failKey = hashRateLimitKey("phone:verify", failPhone);
      await pgClient.query("DELETE FROM public.auth_rate_limits WHERE key = $1;", [failKey]);

      const failureClients: Client[] = [];
      for (let i = 0; i < 5; i++) {
        const c = new Client(DB_CONFIG);
        await c.connect();
        failureClients.push(c);
      }

      try {
        // 5 simultaneous failed attempts across separate connections
        const failPromises = failureClients.map((c) =>
          c.query(
            "SELECT * FROM public.check_and_increment_rate_limit($1, 5, 900, 900);",
            [failKey]
          )
        );
        await Promise.all(failPromises);

        // 6th attempt: Must be blocked
        const sixthRes = await pgClient.query(
          "SELECT * FROM public.check_and_increment_rate_limit($1, 5, 900, 900);",
          [failKey]
        );
        const sixthRow = sixthRes.rows[0];

        const passed = sixthRow?.allowed === false && sixthRow?.remaining_seconds > 800;
        await pgClient.query("DELETE FROM public.auth_rate_limits WHERE key = $1;", [failKey]);

        results.push({
          scenarioId: 15,
          name: "Concurrent Failed Attempts Serialized and Locked",
          expected: "5 concurrent failures recorded; 6th attempt blocked",
          actual: passed ? "Locked: 6th attempt rejected" : "FAILED: Lockout missed",
          passed,
        });
      } finally {
        for (const c of failureClients) {
          await c.end();
        }
      }
    }

    // -------------------------------------------------------------------------
    // Scenario 16: Multi-Tier OTP Send Validation Integration
    // -------------------------------------------------------------------------
    {
      (process.env as Record<string, string | undefined>).NODE_ENV = "development";
      process.env.ENABLE_IN_MEMORY_RATE_LIMIT_MOCK = "true";

      const phone = "919876543299";
      const ip = "10.0.0.1";

      // First send request: allowed
      const firstAttempt = await validateOtpSendRateLimit(phone, ip);

      // Immediate second request: blocked by 60-second cooldown
      const cooldownAttempt = await validateOtpSendRateLimit(phone, ip);

      const passed = firstAttempt.allowed === true && cooldownAttempt.allowed === false && Boolean(cooldownAttempt.remainingSeconds);
      results.push({
        scenarioId: 16,
        name: "Multi-Tier OTP Send Validation (60s Cooldown Enforcement)",
        expected: "first: allowed: true, second: allowed: false with cooldown",
        actual: `first: ${firstAttempt.allowed}, second: ${cooldownAttempt.allowed} (${cooldownAttempt.reason})`,
        passed,
      });
    }

    // -------------------------------------------------------------------------
    // Scenario 17: Logging Privacy & Diagnostic Masking Assertion
    // -------------------------------------------------------------------------
    {
      const rawPhone = "+91 98765 43210";
      const rawEmail = "rameshwar.electrician@kaamsetu.in";
      const rawOtp = "492817";
      const rawSigningSecret = "top-secret-signing-key-material-256";

      const maskedPhone = maskPhone(rawPhone);
      const maskedEmail = maskEmail(rawEmail);
      const maskedSecretVal = maskSecret(rawSigningSecret);

      const logPayload = sanitizeLogData({
        userPhone: rawPhone,
        userEmail: rawEmail,
        smsOtp: rawOtp,
        serviceKey: rawSigningSecret,
        workerName: "Rameshwar Sharma",
      }) as Record<string, unknown>;

      const passed =
        maskedPhone === "******3210" &&
        maskedEmail === "r***@kaamsetu.in" &&
        maskedSecretVal === "[REDACTED_SECRET]" &&
        logPayload.userPhone === "******3210" &&
        logPayload.userEmail === "r***@kaamsetu.in" &&
        logPayload.smsOtp === "[REDACTED_SECRET]" &&
        logPayload.serviceKey === "[REDACTED_SECRET]";

      results.push({
        scenarioId: 17,
        name: "Logging Privacy & Diagnostic Masking Assertion",
        expected: "Phone, email, OTP, and secrets masked in diagnostics",
        actual: passed ? "All PII and secrets safely redacted" : "FAILED: Sensitive data unmasked",
        passed,
      });
    }

  } finally {
    process.env = originalEnv;
    await pgClient.end();
  }

  // Print results
  console.log("------------------------------------------------------------------------------------------------------------------");
  console.log("ID  Scenario                                            Expected / Result                 Status");
  console.log("------------------------------------------------------------------------------------------------------------------");
  for (const r of results) {
    const id = String(r.scenarioId).padEnd(4, " ");
    const name = r.name.padEnd(52, " ");
    const status = r.passed ? "PASSED [OK]" : "FAILED [X]";
    console.log(`${id}${name}${r.actual.padEnd(34, " ")}${status}`);
  }
  console.log("------------------------------------------------------------------------------------------------------------------");

  const allPassed = results.every((r) => r.passed);
  console.log(`\nSummary: ${results.filter((r) => r.passed).length} / ${results.length} Scenarios Passed.`);

  if (!allPassed) {
    console.error("RATE LIMITER VERIFICATION FAILED: One or more scenarios did not meet security requirements.");
    process.exit(1);
  }

  console.log("ALL 17 PERSISTENT RATE LIMITING SCENARIOS INDEPENDENTLY VERIFIED SECURE.\n");
}

main().catch((err) => {
  console.error("Fatal error during rate limiter test execution:", err);
  process.exit(1);
});
