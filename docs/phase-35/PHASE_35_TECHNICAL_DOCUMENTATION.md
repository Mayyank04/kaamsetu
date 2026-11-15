# KAAMSETU — PHASE 35 TECHNICAL DOCUMENTATION
## Architectural Specifications, Security Models, Cryptography & Data Flow

**Document Version:** 35.0.0  
**Phase:** 35 — Complete Remediation, Functional Integrity & Security Hardening  
**Target Release:** `phase-35-remediation-and-product-transformation`  
**Parent Main:** `3dff23c314eaba0f2eb66785033eda928146c0f8` (Preserved & Untouched)  

---

### 1. Architectural Principles

1. **Constitutional Zero-Commission Invariant:**
   $$\text{platform\_commission\_amount} = 0.00 \quad (0.0000\%)$$
   The platform charges zero percent on worker wages. This invariant is enforced in PostgreSQL schema constraints, database triggers, route handlers, and payout processing pipelines.
2. **Strict Multi-Tenant Isolation:**
   All 100 public database tables enforce Row Level Security (`rowsecurity = true`). Authenticated sessions can only read and mutate their own resources. Cross-worker, cross-customer, and cross-institution queries without authorization are blocked by RLS policies and server-side guards.
3. **Evidence-Driven Skill Progression:**
   A spoken claim is never automatically treated as verified competence. Skills follow a strict state machine:
   $$\text{self\_declared} \longrightarrow \text{voice\_submitted} \longrightarrow \text{peer\_confirmed} \longrightarrow \text{institutionally\_verified}$$
4. **Geographic Boundary Lock:**
   Operations are restricted to certified Class B districts:
   - Guwahati Urban (Kamrup Metropolitan, Assam)
   - Shillong Urban (East Khasi Hills, Meghalaya)
   All out-of-bounds requests are rejected with HTTP 403. Spoofed GPS coordinates are rejected with HTTP 422.

---

### 2. Server-Side Security & Authorization Architecture

Server-side route handlers use standard authorization guards from `src/lib/auth/server.ts`:
- `requireAuthenticatedUser()`: Verifies cryptographic SSR session cookie; throws HTTP 401 if unauthenticated.
- `requireWorker()`: Enforces `user.role === 'worker'`; throws HTTP 403 if unauthorized.
- `requireCustomer()`: Enforces customer role.
- `requireContractor()`: Enforces contractor / employer role.
- `requireInstitution()`: Enforces institutional partner credentials.
- `requireModerator()`: Enforces non-partisan ombudsperson / dispute moderator role.
- `requireAdmin()`: Enforces platform administrative privileges.
- `requireOwnedWorkerProfile(workerProfileId)`: Database-backed check ensuring the authenticated worker owns the target profile.
- `requireInstitutionCohortOwnership(cohortId)`: Verifies that the authenticated institution owns the target cohort before allowing trainee outcome exports.

---

### 3. Cryptographic Verification & W3C Verifiable Credentials

1. **Digital Signature Algorithm:**
   - Ed25519 asymmetric cryptography via Node `crypto.sign()` and `crypto.verify()`.
2. **Canonical Serialization:**
   - RFC 8785 JSON canonicalization ensures deterministic lexicographical property ordering and byte-for-byte reproducibility.
3. **Revocation Mechanism:**
   - `KaamsetuStatusList2026` bitstring handles real-time status queries without leaking subject identities.
4. **Offline Security:**
   - 72-hour maximum cache freshness SLA. Stale credentials (>7 days) flag an `offline_cache_stale` warning.
   - High-density QR codes generated with data minimization (raw Aadhaar numbers and bank account credentials strictly excluded).

---

### 4. Database Schema & Data Integrity

- **Database Engine:** PostgreSQL 15.x on Supabase.
- **Table Count:** Exactly 100 public base tables.
- **Migrations:** 29 sequential migration files (`supabase/migrations/`).
- **Immutable Triggers:**
  - `trg_prevent_ledger_clawback`: Blocks `UPDATE` and `DELETE` on settled payout records.
  - `trg_prevent_consent_tampering`: Blocks mutations to historical consent audit events.
  - Monotonic audit hash-chaining initialized with 64 zero characters (`0000...0000`).

---

### 5. Verification & Test Architecture

The platform runs 3 active automated verification suites:
1. `npm run test:phase35`: 33 security, authorization, geographic, and financial regression tests.
2. `npm run verify:db`: 275 database schema, RLS, migration, and helper assertions.
3. `npx tsc --noEmit`: Strict static TypeScript type checking with 0 compilation errors.
4. `npm run build`: Production Next.js build compiling all 112 static and dynamic routes.
