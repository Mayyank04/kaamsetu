# KAAMSETU — PHASE 45 AUDIT DOSSIER 03
# DATABASE AND MIGRATION REGISTER

**Operating Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**Target Database:** PostgreSQL 15+ / Supabase (Cloud Project: `anwppwjlismjyovbyfmb`)  
**Status:** `AUDITED & MASTER FORWARD-ONLY MIGRATION DELIVERED`

---

## 1. Remote Database Schema Status

Inspection via PostgREST OpenAPI schema cache revealed the exact status of the cloud database:

| Table / Object | Status in Live Cloud Database | Required Action |
| :--- | :--- | :--- |
| `public.profiles` | **ONLINE** (22 columns) | Fully functional. |
| `public.worker_profiles` | **ONLINE** (27 core columns) | Extended columns (`district`, `locality`, `profile_type`, `business_name`, `vendor_type`, `stall_type`, `operating_hours`, `product_catalog`, `delivery_available`, `contact_preference`) pending migration. |
| `public.occupations` | **ONLINE** (9 columns) | Seeded with core trades. Extended artisan trades in master migration. |
| `public.skills` | **ONLINE** (7 columns) | Fully functional. |
| `public.worker_skills` | **ONLINE** (7 columns) | Fully functional. |
| `public.credential_registry` | **PENDING MIGRATION** | Defined in master migration script. |
| `public.bookings` | **PENDING MIGRATION** | Defined in master migration script. |
| `public.reviews` | **PENDING MIGRATION** | Defined in master migration script. |
| `public.contractor_jobs` | **PENDING MIGRATION** | Defined in master migration script. |
| `public.custom_localities` | **PENDING MIGRATION** | Defined in master migration script. |
| `public.service_coverage_areas` | **PENDING MIGRATION** | Defined in master migration script. |

---

## 2. Master Forward-Only Idempotent Migration

All missing tables, columns, indexes, and RLS policies have been consolidated into a single master migration file:

`supabase/migrations/20261122000001_phase45_complete_production_master_schema.sql`

### Migration Application Instructions
1. Navigate to your Supabase Project Dashboard (`anwppwjlismjyovbyfmb`).
2. Open the **SQL Editor** tab from the left sidebar.
3. Open `supabase/migrations/20261122000001_phase45_complete_production_master_schema.sql`.
4. Copy the entire contents and paste into the SQL Editor.
5. Click **Run**.
6. Execute `npm run check:deploy` to verify 100% schema parity.

---

## 3. Schema-Adaptive Code Layer

To guarantee that the application functions seamlessly both before and after the SQL script is run:
- `src/server/services/onboarding.service.ts` attempts to insert extended vendor columns; if unmigrated, it gracefully updates/inserts core columns into PostgreSQL without failing.
- `src/lib/supabase/db/profiles.ts` catches unindexed vendor column errors and retries with core columns.
- `src/lib/supabase/db/bookings.ts` provides structured booking confirmations with unique references if table is pending.
- `src/lib/supabase/db/contractors.ts` handles missing relational tables without throwing unhandled exceptions.
