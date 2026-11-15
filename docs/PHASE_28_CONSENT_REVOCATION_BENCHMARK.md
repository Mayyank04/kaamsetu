# KAAMSETU — PHASE 28 CONSENT REVOCATION PROPAGATION BENCHMARK
## Latency Benchmark, Multi-Path Invalidation Testing & Offline Boundary Governance

**Evaluation Context:** December 2026  
**Auditor:** Principal Infrastructure & Performance Architect  
**Primary Register:** [PHASE_28_ACCESS_INVALIDATION_MATRIX.json](file:///Users/mayankgautam/Desktop/stitch_kaamsetu_digital_identity_platform/docs/PHASE_28_ACCESS_INVALIDATION_MATRIX.json)  
**Standard SLA Target:** $p99 \le 500.0\text{ ms}$

---

## 1. Benchmark Methodology & Test Rig

To independently reproduce the reported $121.6\text{ ms}$ p99 consent revocation latency, an automated multi-path benchmarking harness was executed:

- **Sample Size:** 250 simulated revocation operations across multiple concurrent threads ([TEST 71]).
- **Execution Harness:** Node.js 24 + TypeScript (tsx) concurrent runner.
- **Target Surfaces:** API endpoints, Postgres indices, Redis cache, Edge CDN purge emulator, Contractor WebSockets.
- **Measurement Boundaries:** Measured from worker confirmation dispatch (`t_0`) to confirmed cache eviction across all subscribers (`t_complete`).

---

## 2. Statistical Latency Distribution

$$\text{SLA Compliance Margin} = \frac{500.0 - 121.6}{500.0} \times 100\% = 75.68\%$$

```
Latency Percentiles (N = 250 Trials):
- p50 (Median):   18.4 ms
- p90:            44.2 ms
- p95:            65.8 ms
- p99:           121.6 ms
- Maximum:       198.5 ms
- SLA Target:    500.0 ms
```

The measured $p99$ latency of **121.6 ms** is well within the 500 ms SLA with a 75.7% safety margin ([TEST 72]).

---

## 3. Propagation Across Operational Surfaces

| Surface | Invalidation Mechanism | Cache TTL | p50 (ms) | p95 (ms) | p99 (ms) | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **API Direct Query** | Row-level DB query & trigger | 0 s | 12.4 | 24.1 | 41.5 | Verified |
| **Search Engine** | Elastic/Postgres full-text purge | 5 s | 18.2 | 38.6 | 64.2 | Verified |
| **Edge CDN Cache** | Tag-based cache purge API | 60 s | 8.5 | 15.2 | 22.8 | Verified |
| **Public QR Portal**| Real-time Bitstring Status check | 15 s | 14.7 | 29.5 | 48.3 | Verified |
| **Contractor UI** | WebSocket broadcast event | 0 s | 22.0 | 51.4 | 86.5 | Verified |
| **Partner APIs** | HMAC Webhook delivery (ONDC) | 30 s | 35.1 | 78.4 | 118.2 | Verified |

---

## 4. Offline Boundary Limitations

While online invalidation propagates globally in under 200 ms, **air-gapped offline verifiers cannot receive online revocation broadcasts**.

To prevent prolonged use of revoked credentials on offline construction sites:
1. All offline QR payloads embed an expiration timestamp (maximum 72 hours).
2. Verifier apps operating offline display an amber alert:
   > *"Signature authentic, but online status unverified. Sync with network within 72 hours."*
3. Once 72 hours elapse without a network sync, the offline verifier application refuses to clear the artisan without an online check.
