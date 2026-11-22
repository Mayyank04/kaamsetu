# KAAMSETU — PHASE 45 DOSSIER 11: DEPLOYMENT RUNBOOK & PRODUCTION OPERATIONS

## 1. Executive Overview

This runbook specifies the step-by-step procedures for deploying, migrating, verifying, and operating KAAMSETU in staging and production environments.

- **Production Domain:** `https://kaamsetu-neon.vercel.app`
- **Hosting Platform:** Vercel (Edge & Node.js Serverless Runtime)
- **Database:** Supabase PostgreSQL (`anwppwjlismjyovbyfmb`)
- **Git Branch:** `phase-45-master-product-engineering`

---

## 2. Pre-Deployment Readiness Verification

Before triggering any production deployment, execute the automated pre-flight checker:

```bash
# 1. Run deployment health probe
npm run check:deploy

# 2. Run master test suite
npm run test:phase45

# 3. Run regression suites
npm run test:phase42:multilingual
npm run test:phase44

# 4. Verify TypeScript & Next.js production build
npm run lint
npm run build
```

Expected Output:
```
[CHECK] Environment Configuration: OK (4 / 4 required variables present)
[CHECK] Supabase PostgREST Gateway: OK (HTTP 200, latency: ~2400ms)
[CHECK] Deployment Readiness: PASS
```

---

## 3. Database Migration Execution Runbook

The master forward-only, idempotent migration file is located at:
`supabase/migrations/20261122000001_phase45_complete_production_master_schema.sql`

### 3.1 Applying Migration via Supabase Web Dashboard
1. Log in to the [Supabase Dashboard](https://supabase.com/dashboard/project/anwppwjlismjyovbyfmb).
2. Navigate to **SQL Editor** in the left navigation sidebar.
3. Click **New query**.
4. Open `supabase/migrations/20261122000001_phase45_complete_production_master_schema.sql` and copy its entire contents.
5. Paste into the SQL Editor and click **Run** (`⌘ + Enter` / `Ctrl + Enter`).
6. Verify output reports: `Success. No rows returned.`

### 3.2 Applying Migration via Supabase CLI (Alternative)
```bash
# Link local project to remote Supabase instance
npx supabase link --project-ref anwppwjlismjyovbyfmb

# Push pending migrations safely
npx supabase db push
```

### 3.3 What the Master Migration Safely Provisions
- **Missing Columns on `worker_profiles`:**
  - `district` (TEXT), `locality` (TEXT), `profile_type` (TEXT default `'service_professional'`), `business_name` (TEXT), `vendor_type` (TEXT), `stall_type` (TEXT), `operating_hours` (TEXT), `product_catalog` (JSONB default `'[]'`), `delivery_available` (BOOLEAN default false), `contact_preference` (TEXT default `'phone'`).
- **Missing Tables with RLS & Triggers:**
  - `bookings` (Customer inquiries, trade appointments, status transitions).
  - `reviews` (Client reviews, ratings, verified completion flags).
  - `contractor_jobs` (Subcontracting tenders, crew dispatch postings).
  - `credential_registry` (W3C verifiable credential hashes, Ed25519 signatures).
  - `custom_localities` (Crowdsourced and admin-approved micro-neighborhoods).
  - `service_coverage_areas` (Permitted dispatch zones & PIN code boundaries).
- **Seed Data:**
  - Seeds official Class B pilot coverage zones for Guwahati Urban (`781001`–`781039`) and Shillong Urban (`793001`–`793022`).

---

## 4. Production Environment Variable Scopes

The following environment variables must be configured in Vercel Project Settings under **Settings > Environment Variables** across Production and Preview scopes:

| Variable | Scope | Secret? | Description |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Production & Preview | No | Supabase API URL (`https://anwppwjlismjyovbyfmb.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production & Preview | Yes | Public Anon Key for browser client |
| `SUPABASE_SERVICE_ROLE_KEY` | Production & Preview | Yes | Privileged Service Role Key for server-side operations |
| `SESSION_SECRET` | Production & Preview | Yes | 32+ character entropy string for iron-session cookies |
| `NODE_ENV` | Production | No | Automatically set to `production` by Vercel |

---

## 5. Post-Deployment Verification & Health Probes

Immediately following a deployment, run the following probes against production:

```bash
# 1. Probe Application Health Endpoint
curl -i -s "https://kaamsetu-neon.vercel.app/api/health" | head -n 15

# 2. Probe Discovery Gateway
curl -i -s "https://kaamsetu-neon.vercel.app/api/discovery" | head -n 15

# 3. Probe Manifest & Service Worker
curl -i -s "https://kaamsetu-neon.vercel.app/manifest.json" | grep -o "KaamSetu"
curl -i -s "https://kaamsetu-neon.vercel.app/sw.js" | head -n 5
```

---

## 6. Rollback & Emergency Incident Protocols

1. **Immediate Vercel Rollback:**
   - In Vercel Dashboard > Deployments, locate the previous known-good deployment (Phase 42 baseline `676a69b`) and click **Promote to Production**. Instant rollback takes `< 5 seconds`.
2. **Database Rollback:**
   - The master migration is strictly additive (uses `ADD COLUMN IF NOT EXISTS` and `CREATE TABLE IF NOT EXISTS`). It does **not** drop existing columns, data, or tables, ensuring 100% backward compatibility if the frontend is reverted.
