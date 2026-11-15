# KAAMSETU — PHASE 17 MULTI-REGION DATABASE ARCHITECTURE
## Primary-Replica Topology, Write Consistency & Low-Latency Routing for Eastern India

---

## 1. Architectural Topology & Rationale

As KAAMSETU scales across the North East and Eastern Indian states (Assam, Meghalaya, Tripura, West Bengal), API latency over high-latency cellular networks (2G/3G/4G in hilly terrains) must remain snappy ($\text{P95} \le 120\text{ ms}$).

### Infrastructure Topology:
- **Authoritative Primary Node (`primary_mumbai` / AWS `ap-south-1`)**: All database writes, transactional state changes (escrow, payouts, bookings, consent grants), and critical security reads execute exclusively on the primary node.
- **Eastern Read Replica (`replica_kolkata` / AWS `ap-east-kolkata` or low-latency CDN PoP)**: Serves high-volume read queries (public worker directory, skills taxonomy, trade benchmarks, non-sensitive search) for traffic originating from `IN-AS`, `IN-ML`, `IN-TR`, and `IN-WB`.
- **Northern Read Replica (`replica_delhi` / AWS `ap-north-delhi`)**: Redundant disaster recovery and northern enterprise corridor read node.

```mermaid
flowchart TD
    Client["Client / Coordinator Tablet"] --> Router["MultiRegionRoutingService (src/lib/infrastructure)"]
    Router --> CheckWrite{"Is Operation Type == 'write'?"}
    CheckWrite -->|Yes| Primary[("Primary DB (Mumbai): Read-Write / Authoritative")]
    CheckWrite -->|No| CheckCritical{"Is Critical (Auth / Payout / Consent)?"}
    CheckCritical -->|Yes| Primary
    CheckCritical -->|No| CheckLag{"Replica Lag <= 2000ms?"}
    CheckLag -->|Yes| ReplicaEast[("Read Replica (Kolkata): Read-Only / Edge")]
    CheckLag -->|No (Stale)| Primary
    
    Primary -.->|Streaming Asynchronous WAL Replication| ReplicaEast
    style Primary fill:#15803d,stroke:#166534,stroke-width:2px,color:#fff
    style ReplicaEast fill:#2563eb,stroke:#1d4ed8,stroke-width:2px,color:#fff
```

---

## 2. Strict Read-After-Write Consistency Discipline

To eliminate split-brain states or stale balance displays:
1. **Critical Path Routing**: Auth sessions, payment releases, dispute updates, and consent grants bypass replicas entirely.
2. **Lag Threshold Fallback**: If streaming replication lag exceeds **2,000 ms (2.0s)**, the routing service automatically fails back to the primary database node (`primary_mumbai`).
3. **Tenant & RLS Preservation**: 100% of PostgreSQL Row-Level Security policies apply identically on primary and read-replica instances.

---

## 3. Test Verification
Verified in `test/phase-17-national-ecosystem.test.ts` (Tests 57–61):
- Writes route to Mumbai.
- Critical operations route to Mumbai.
- Eastern reads route to Kolkata.
- High replica lag (> 2000ms) triggers automated primary fallback.
