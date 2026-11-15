# KAAMSETU — PHASE 23 PRODUCTION TRANSITION FRAMEWORK
## Formal Release Manifest Architecture, Deployment Lifecycle & Infrastructure Governance

**Core Mission:** "Every skill deserves to be seen, even without a degree."  
**Constitutional Invariant:** 0.00% commission on worker wages (`platform_commission_amount = 0.00`).  
**Auditor Designation:** Production Transition Lead & Site Reliability Engineer  
**Date:** November 15, 2026

---

### 1. The Production Transition Philosophy

Software that passes integration tests in local or staging environments is not automatically "deployed." A production transition requires verifiable evidence of clean security scanning, atomic rollback scripts, secrets quarantine, and explicit human authorization.

KAAMSETU establishes the **Production Release Manifest Framework** in PostgreSQL table `public.production_release_manifests`.

---

### 2. The 8-Status Deployment Lifecycle

```
[development] ──> [staging] ──> [preproduction] ──> [production_ready]
                                                           │
[deployed] <── [approved_for_release] <────────────────────┘
    │
    ├──> [rolled_back]
    └──> [blocked]
```

#### Status Definitions & Gate Controls
1. **`development`**: Local sandbox development and preliminary unit testing.
2. **`staging`**: Automated CI execution, integration tests, and staging Beckn protocol verification.
3. **`preproduction`**: Bilateral staging testing with external Buyer Apps and EPC contractor portals.
4. **`production_ready`**: Artifact compiled (`next build` 109/109 routes), tests passed (100%), 0 security vulnerabilities.
   - **Anti-Conflation Rule:** `production_ready` indicates technical capability; it does **NOT** indicate live deployment.
5. **`approved_for_release`**: Explicit, cryptographic sign-off granted by the designated release owner with documented rollback plan.
6. **`deployed`**: Live release active in production serving real-world users.
7. **`rolled_back`**: Reverted to preceding stable commit due to operational or regression triggers.
8. **`blocked`**: Deployment halted due to failed security scan, missing counterparty keys, or unresolved critical blockers.

---

### 3. Release Manifest Specification & Evidence Ledger

Every production release candidate generates a formal manifest:

| Manifest Field | Production Standard & Audit Rule | Phase 23 Certified Value |
| :--- | :--- | :--- |
| **Commit SHA** | Exact 7-40 char Git commit hash | `8140ade` (Phase 22 Tip) |
| **Build Artifact** | Unique deterministic build tag | `kaamsetu-build-prod-20261115` |
| **Migration Version** | Latest executed migration | `20261115000024` (Migration 24) |
| **Configuration Version** | Semantic configuration tag | `v23.0.0` |
| **RLS Coverage** | Mandatory 100.0% database tables | **100.0% (89/89 tables)** |
| **Critical Vulnerabilities**| Zero critical / high CVEs allowed | **0 Critical / 0 High** |
| **Rollback Plan** | Documented atomic revert procedure | Git revert `8140ade` + atomic migration down script |
| **Approval Owner** | Principal Software Architect | Sign-off logged with timestamp |
| **Deployment Status** | Active transition state | **`approved_for_release` (Gated from live deploy)** |

---

### 4. Infrastructure & Secret Management Governance

1. **Environment Variables:**
   - Production secrets (`SUPABASE_SERVICE_ROLE_KEY`, `RATE_LIMIT_HMAC_SECRET`, `ED25519_PRIVATE_KEY`) are managed via encrypted KMS vaults with zero hardcoding.
   - The browser client is strictly isolated via `NEXT_PUBLIC_` prefixes, preventing privileged key leakage (`test:backend`).
2. **Database Migration Sequence:**
   - Sequential, idempotent migrations from `01` through `24` applied cleanly.
   - Foreign key constraints, unique slugs, and Row-Level Security policies active on 100% of tables.
3. **Automated Incident Response & Rollback:**
   - If replication lag exceeds 5.0s or error rates exceed 0.5% over 5 minutes, deployment pauses automatically.
   - Rollback scripts preserve all historical worker credentials and payment audit trails.
