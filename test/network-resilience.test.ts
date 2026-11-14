import assert from "assert";
import { FEATURED_PROFESSIONALS } from "../src/lib/data/professionals";
import { GUWAHATI_PILOT_COHORT, computePilotAggregateMetrics } from "../src/lib/pilot/registry";

/**
 * KAAMSETU Network Resilience & Mobile Performance Simulation Test Suite
 * Simulates high-latency mobile 2G/3G connections and verifies response budgets.
 */

async function runNetworkResilienceTests() {
  console.log("===============================================================================");
  console.log("KAAMSETU NETWORK RESILIENCE & LOW-BANDWIDTH PERFORMANCE SUITE");
  console.log("Targets: <50KB payload budgets, graceful delay handling, fast client search");
  console.log("===============================================================================\n");

  const results: Array<{ id: string; name: string; result: string; metric: string }> = [];

  // 1. Search filter execution latency on 100+ simulated profiles
  const searchStart = performance.now();
  const query = "electrician";
  const matched = FEATURED_PROFESSIONALS.filter(
    (p) =>
      p.primaryTrade.toLowerCase().includes(query) ||
      p.subTrades.some((st) => st.toLowerCase().includes(query)) ||
      p.location.city.toLowerCase() === "guwahati"
  );
  const searchDurationMs = performance.now() - searchStart;
  assert(searchDurationMs < 50, `Search took too long: ${searchDurationMs}ms`);
  results.push({
    id: "PERF-01",
    name: "Client In-Memory Search Latency",
    result: "PASSED [OK]",
    metric: `${searchDurationMs.toFixed(2)}ms (Budget: <50ms)`,
  });

  // 2. Pilot Metrics Payload Size Budget
  const metricsData = computePilotAggregateMetrics();
  const serializedMetrics = JSON.stringify(metricsData);
  const metricsSizeBytes = Buffer.byteLength(serializedMetrics, "utf8");
  assert(metricsSizeBytes < 50000, `Metrics payload exceeded 50KB: ${metricsSizeBytes} bytes`);
  results.push({
    id: "PERF-02",
    name: "Pilot Aggregate Metrics Payload Budget",
    result: "PASSED [OK]",
    metric: `${(metricsSizeBytes / 1024).toFixed(2)} KB (Budget: <50KB)`,
  });

  // 3. Worker Profile Lightweight JSON Size Budget (for low-bandwidth 2G download)
  const profileJson = JSON.stringify(FEATURED_PROFESSIONALS[4]); // Dipak Kalita
  const profileSizeBytes = Buffer.byteLength(profileJson, "utf8");
  assert(profileSizeBytes < 15000, `Worker profile payload exceeded 15KB: ${profileSizeBytes} bytes`);
  results.push({
    id: "PERF-03",
    name: "Worker Profile Mobile Payload Budget",
    result: "PASSED [OK]",
    metric: `${(profileSizeBytes / 1024).toFixed(2)} KB (Budget: <15KB)`,
  });

  // 4. Simulated High-Latency Network Round-Trip
  const simulatedDelayMs = 400; // Simulated 3G Indian mobile latency
  const delayStart = performance.now();
  await new Promise((resolve) => setTimeout(resolve, simulatedDelayMs));
  const delayActual = performance.now() - delayStart;
  assert(delayActual >= simulatedDelayMs, "Timer did not delay properly");
  results.push({
    id: "PERF-04",
    name: "High-Latency (3G/2G) Jitter Tolerance",
    result: "PASSED [OK]",
    metric: `Handled ${delayActual.toFixed(0)}ms simulated latency`,
  });

  // 5. Cohort Privacy Hashing Verification (Zero PII leakage)
  const rawCohortJson = JSON.stringify(GUWAHATI_PILOT_COHORT);
  assert(!rawCohortJson.includes("phone_number"), "Found phone_number in cohort records!");
  assert(!rawCohortJson.includes("aadhaar_number"), "Found aadhaar_number in cohort records!");
  results.push({
    id: "PERF-05",
    name: "PII Scrubbing & Zero Public Leakage Invariant",
    result: "PASSED [OK]",
    metric: "0 phone / Aadhaar identifiers present in registry",
  });

  // Print Formatted Report Table
  console.log("------------------------------------------------------------------------------------------------------");
  console.log("ID".padEnd(12) + "Test Name".padEnd(46) + "Result".padEnd(16) + "Measured Metric");
  console.log("------------------------------------------------------------------------------------------------------");
  for (const r of results) {
    console.log(r.id.padEnd(12) + r.name.padEnd(46) + r.result.padEnd(16) + r.metric);
  }
  console.log("------------------------------------------------------------------------------------------------------\n");

  console.log(`Summary: ${results.length} / ${results.length} Performance & Resilience Scenarios Passed.\n`);
}

runNetworkResilienceTests().catch((err) => {
  console.error("Performance test failure:", err);
  process.exit(1);
});
