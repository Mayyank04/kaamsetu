# KAAMSETU — PHASE 40: ROOT-CAUSE INCIDENT & ARCHITECTURAL REPORT

**Incident Classification:** Production Authentication & Database Outage  
**Target Environment:** Vercel Production (`https://kaamsetu-neon.vercel.app`) & Local (`http://localhost:3001`)  
**Database Authority:** Supabase Cloud Project `anwppwjlismjyovbyfmb`  
**Operational Rollout:** `CLASS_B_CONTROLLED_ROLLOUT` (Guwahati Urban & Shillong Urban)  
**Permanent Financial Invariant:** `platform_commission_amount = 0.00` on artisan wages  

---

## 1. Executive Summary

During release testing of Phase 39.7 on the Vercel production environment (`https://kaamsetu-neon.vercel.app`), account creation and worker onboarding on `/onboarding` and `/auth/register` failed with the following persistent error:

```
Database schema migration required: table 'public.profiles' does not exist in Supabase.
```

Investigation revealed that while Supabase Auth credentials (`NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`) were correctly configured and authorized, the remote PostgreSQL database had never executed the core DDL migrations. Consequently, PostgREST exposed zero tables in the `public` schema (`definitions: []`), returning error `PGRST205` whenever the application attempted to interact with `public.profiles`.

Phase 40 permanently eliminates this defect by delivering:
1. An idempotent, forward-only master corrective migration (`20261118000001_phase40_root_cause_master_schema.sql`).
2. Native Supabase Auth credential management (`admin.createUser` with `email_confirm: true` and cascade deletion).
3. Elimination of custom plaintext/hash password columns in `public.profiles`.
4. Truthful fail-closed error contracts (`SCHEMA_NOT_READY` with correlation IDs and operator runbooks).
5. Comprehensive schema readiness and health auditing endpoints (`/api/auth/health` and `scripts/verify-database-readiness.ts`).

---

## 2. Forensic Investigation & Evidence

### 2.1 Remote Supabase Auth Probing
Direct query to the Supabase Auth Admin endpoint using the production service-role key:
```bash
GET https://anwppwjlismjyovbyfmb.supabase.co/auth/v1/admin/users
```
**Result:** HTTP 200 OK  
`Users count: 0`  
**Finding:** The project URL and service-role key are valid and actively authorized against Supabase Auth.

### 2.2 PostgREST Schema Discovery
Querying the PostgREST root schema descriptor:
```bash
GET https://anwppwjlismjyovbyfmb.supabase.co/rest/v1/?apikey=...
```
**Result:** HTTP 200 OK  
`Exposed definitions: []`  
`Exposed paths: ["/"]`  
**Finding:** The remote PostgreSQL database contained **zero exposed tables** in the `public` schema. PostgREST had no schema cache entries for `profiles`, `worker_profiles`, `occupations`, `skills`, or `auth_rate_limits`.

### 2.3 PostgREST Query Response
Direct SELECT query on `public.profiles`:
```bash
GET https://anwppwjlismjyovbyfmb.supabase.co/rest/v1/profiles?select=*
```
**Result:** HTTP 404 / 503  
```json
{
  "code": "PGRST205",
  "details": null,
  "hint": null,
  "message": "Could not find the table 'public.profiles' in the schema cache"
}
```

---

## 3. Why Local Development Masked the Failure

In Phase 39.7, an in-memory fallback mechanism (`localFallbackAccounts`) was introduced to allow local offline testing when developers worked without cloud access.

However, in non-production environments where Supabase was partially configured but tables were missing, this fallback silently intercepted the database failure and returned a synthetic success response (`HTTP 201`). Consequently:
- Local tests evaluated against in-memory maps and passed.
- Local browser onboarding completed and appeared functional.
- In Vercel production, strict security controls bypassed local mock maps and directly hit the unmigrated Supabase database, exposing `PGRST205`.

---

## 4. Root Causes

1. **Unexecuted DDL Migrations:** The remote Supabase instance `anwppwjlismjyovbyfmb` had never executed the schema definitions.
2. **Schema Drift Across Iterations:** Multiple incremental migrations across Phases 30–39 were fragmented across different files, making end-to-end execution prone to missing prerequisites.
3. **Foreign Key Mismatch in Direct Registration:** Phase 39.7 attempted to insert custom UUIDs into `public.profiles.id`, while `public.profiles.id` was architected to reference `auth.users(id) ON DELETE CASCADE`. Without a corresponding `auth.users` row, database foreign key constraints would fail.
4. **Lack of Truthful Schema Readiness Validation:** The health check endpoint previously checked only basic table availability without reporting specific missing tables, columns, or actionable operator runbooks.

---

## 5. Master Corrective Architecture

```
                                  [ User Registration / Login ]
                                                │
                                                ▼
                                    [ Rate Limit Inspection ]
                                                │
                                                ▼
                                   [ Schema Readiness Probe ]
                                 (profiles.id, PGRST205 Check)
                                        /              \
                          (Missing Table)             (Table Ready)
                                  │                         │
                                  ▼                         ▼
                        HTTP 503 SCHEMA_NOT_READY   [ Supabase Auth ]
                         + Operator Runbook Path     admin.createUser /
                         + Correlation Audit ID      signInWithPassword
                                                            │
                                                            ▼
                                                    [ public.profiles ]
                                                    Upsert linked via
                                                    id REFERENCES auth.users(id)
                                                            │
                                                            ▼
                                                    [ Dual Session ]
                                                    - kaamsetu_session (HMAC)
                                                    - Supabase SSR Cookies
```

1. **Consolidated Idempotent Migration:** All 9 core tables, enums, triggers, RLS policies, and stored procedures consolidated into `supabase/migrations/20261118000001_phase40_root_cause_master_schema.sql`.
2. **Native Supabase Auth:** Real accounts created via `adminClient.auth.admin.createUser({ email, password, email_confirm: true })`. No custom password storage in `public.profiles`.
3. **Cascade Integrity:** Profiles are strictly linked to `auth.users(id)` via `ON DELETE CASCADE`. If profile upsert fails, auth user is rolled back atomically.
4. **Fail-Closed Truthful Reporting:** When schema is unmigrated, API returns HTTP 503 with structured code `SCHEMA_NOT_READY`, specific missing tables, and runbook instructions.
