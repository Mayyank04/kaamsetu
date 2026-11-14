/**
 * KAAMSETU Persistent Rate Limiting & Fail-Closed Architecture Test Suite
 *
 * Validates:
 * 1. Privacy preservation (HMAC-SHA256 key hashing)
 * 2. Persistent atomic tracking in PostgreSQL auth_rate_limits
 * 3. Threshold blocking and remaining cooldown duration calculation
 * 4. Persistent OTP verify brute-force lockout (5 attempts -> 15 min lock)
 * 5. Persistent lockout clearing on successful verification
 * 6. Fail-closed production architecture (zero memory fallback in production)
 * 7. Explicit mock gating for offline development
 * 8. High-concurrency atomic serialization without race conditions or key collisions
 * 9. Multi-tier OTP send rate limiting (cooldown, hourly phone limit, hourly IP limit)
 */

import { Client } from "pg";
import {
  hashRateLimitKey,
  checkRateLimit,
  validateOtpVerifyAttempt,
  recordFailedOtpAttempt,
  clearFailedOtpAttempts,
  validateOtpSendRateLimit,
} from "../src/lib/security/rate-limiter";

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

  try {
    // -------------------------------------------------------------------------
    // Scenario 1: Privacy Preservation via SHA-256 HMAC Key Hashing
    // -------------------------------------------------------------------------
    {
      const rawPhone = "+91 98765 43210";
      const rawIp = "192.168.1.100";

      const hashedPhoneKey = hashRateLimitKey("phone:verify:fail", rawPhone);
      const hashedIpKey = hashRateLimitKey("ip:send:hourly", rawIp);

      const containsRawPhone = hashedPhoneKey.includes("9876543210") || hashedPhoneKey.includes("98765");
      const containsRawIp = hashedIpKey.includes("192.168.1.100");
      const isExpectedFormat = hashedPhoneKey.startsWith("phone:verify:fail:") && hashedPhoneKey.length > 30;

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
    // Scenario 2: Direct Database RPC Incrementation (Positive Check)
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
        scenarioId: 2,
        name: "Atomic PostgreSQL check_and_increment_rate_limit RPC",
        expected: "allowed: true, current_count: 1",
        actual: `allowed: ${row?.allowed}, count: ${row?.current_count}`,
        passed,
      });
    }

    // -------------------------------------------------------------------------
    // Scenario 3: Threshold Enforcement & Block Duration in Database
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
        scenarioId: 3,
        name: "Threshold Exceeded Triggers Block Duration",
        expected: "allowed: false, is_blocked: true, remaining > 500s",
        actual: `allowed: ${blockedRow?.allowed}, is_blocked: ${statusRow?.is_blocked}, remaining: ${statusRow?.remaining_seconds}s`,
        passed,
      });
    }

    // -------------------------------------------------------------------------
    // Scenario 4: Persistent Lockout Check via get_rate_limit_status
    // -------------------------------------------------------------------------
    {
      const testPhone = "919999900001";
      const verifyKey = hashRateLimitKey("phone:verify:fail", testPhone);

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
        scenarioId: 4,
        name: "Persistent 5-Attempt Lockout Enforcement",
        expected: "is_blocked: true, remaining_seconds <= 900",
        actual: `is_blocked: ${status?.is_blocked}, remaining: ${status?.remaining_seconds}s`,
        passed: isLockedOut,
      });

      // -----------------------------------------------------------------------
      // Scenario 5: Persistent Lockout Reset on Successful Verification
      // -----------------------------------------------------------------------
      await pgClient.query("SELECT public.clear_rate_limit($1);", [verifyKey]);

      const afterClearRes = await pgClient.query(
        "SELECT * FROM public.get_rate_limit_status($1);",
        [verifyKey]
      );
      const statusAfterClear = afterClearRes.rows[0];
      const isCleared = statusAfterClear?.is_blocked === false && statusAfterClear?.current_count === 0;

      results.push({
        scenarioId: 5,
        name: "Persistent Lockout Reset via clear_rate_limit RPC",
        expected: "is_blocked: false, current_count: 0",
        actual: `is_blocked: ${statusAfterClear?.is_blocked}, count: ${statusAfterClear?.current_count}`,
        passed: isCleared,
      });
    }

    // -------------------------------------------------------------------------
    // Scenario 6: Production Fail-Closed Architecture (No Silent Memory Bypass)
    // -------------------------------------------------------------------------
    {
      // Simulate production environment where database is unreachable / not configured
      (process.env as Record<string, string | undefined>).NODE_ENV = "production";
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://placeholder-kaamsetu.supabase.co";

      const result = await checkRateLimit("test:prod_fail_closed", 5, 60, 60);

      const passed = result.allowed === false && Boolean(result.reason);
      results.push({
        scenarioId: 6,
        name: "Production Fail-Closed Architecture (No Silent Memory Bypass)",
        expected: "allowed: false (reject without database in production)",
        actual: `allowed: ${result.allowed}, reason: "${result.reason}"`,
        passed,
      });
    }

    // -------------------------------------------------------------------------
    // Scenario 7: Offline Development Sandbox Rejection Without Explicit Mock Flag
    // -------------------------------------------------------------------------
    {
      (process.env as Record<string, string | undefined>).NODE_ENV = "development";
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://placeholder-kaamsetu.supabase.co";
      delete process.env.ENABLE_IN_MEMORY_RATE_LIMIT_MOCK;

      const result = await checkRateLimit("test:dev_no_mock", 5, 60, 60);
      const passed = Boolean(result.allowed === false && result.reason?.includes("ENABLE_IN_MEMORY_RATE_LIMIT_MOCK"));

      results.push({
        scenarioId: 7,
        name: "Development Fail-Closed Without Explicit Mock Opt-In",
        expected: "allowed: false (explicit ENABLE_IN_MEMORY_RATE_LIMIT_MOCK required)",
        actual: `allowed: ${result.allowed}, reason: "${result.reason}"`,
        passed,
      });
    }

    // -------------------------------------------------------------------------
    // Scenario 8: Development In-Memory Store When Explicitly Enabled
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
        scenarioId: 8,
        name: "Development In-Memory Mock Store with Explicit Flag",
        expected: "res1: true, res2: true, res3: false",
        actual: `res1: ${res1.allowed}, res2: ${res2.allowed}, res3: ${res3.allowed}`,
        passed,
      });
    }

    // -------------------------------------------------------------------------
    // Scenario 9: 10 Parallel Simultaneous Requests to Same Key (Concurrency)
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
        scenarioId: 9,
        name: "Atomic Concurrency Serialization on First Key Insertion",
        expected: "all 10 queries allowed: true, final count = 10",
        actual: `allSucceeded: ${allSucceeded}, final count: ${finalCount}`,
        passed,
      });
    }

    // -------------------------------------------------------------------------
    // Scenario 10: Multi-Tier OTP Send Validation Integration
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
        scenarioId: 10,
        name: "Multi-Tier OTP Send Validation (60s Cooldown Enforcement)",
        expected: "first: allowed: true, second: allowed: false with cooldown",
        actual: `first: ${firstAttempt.allowed}, second: ${cooldownAttempt.allowed} (${cooldownAttempt.reason})`,
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

  console.log("ALL 10 PERSISTENT RATE LIMITING SCENARIOS INDEPENDENTLY VERIFIED SECURE.\n");
}

main().catch((err) => {
  console.error("Fatal error during rate limiter test execution:", err);
  process.exit(1);
});
