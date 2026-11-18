# KAAMSETU — PHASE 40: MASTER DATABASE MIGRATION RUNBOOK

**Target Database:** Supabase PostgreSQL Cloud Instance  
**Project Reference:** `anwppwjlismjyovbyfmb`  
**Dashboard URL:** `https://supabase.com/dashboard/project/anwppwjlismjyovbyfmb`  
**Master Corrective Script:** `supabase/migrations/20261118000001_phase40_root_cause_master_schema.sql`  
**Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  

---

## 1. Prerequisites

Before executing the migration:
1. Ensure you have administrative access to the Supabase Dashboard project `anwppwjlismjyovbyfmb`.
2. Ensure you have network connectivity to the Supabase Console.
3. Keep the file `supabase/migrations/20261118000001_phase40_root_cause_master_schema.sql` open in your local repository.

---

## 2. Step-by-Step Execution Procedure

### Step 1: Log in to Supabase Console
Navigate to:
```
https://supabase.com/dashboard/project/anwppwjlismjyovbyfmb
```

### Step 2: Open the SQL Editor
1. In the left-hand navigation panel, click on **SQL Editor** (the terminal `>_` icon).
2. Click **+ New query** to open a blank SQL query window.
3. Rename the query tab to: `Phase 40 Master Schema Recovery`.

### Step 3: Paste the Master Migration Script
Copy the entire contents of the file:
```
supabase/migrations/20261118000001_phase40_root_cause_master_schema.sql
```
and paste it directly into the SQL Editor window.

### Step 4: Execute the SQL Script
Click the green **Run** button (or press `Cmd + Enter` / `Ctrl + Enter`).

### Step 5: Confirm Execution Output
The query should complete in approximately 1 to 3 seconds with the message:
```
Success. No rows returned.
```
This confirms that:
- Extensions `uuid-ossp` and `pgcrypto` were enabled.
- Enums `app_role`, `booking_status`, and `availability_state` were created.
- All 9 core tables were created with proper foreign keys and constraints.
- Seed data for 8 NSQF trade classifications was populated into `occupations`.
- Trigger `on_auth_user_created` was registered on `auth.users`.
- Stored procedures `check_and_increment_rate_limit` and `get_rate_limit_status` were created.
- Row Level Security (RLS) policies were activated.
- `NOTIFY pgrst, 'reload schema'` was dispatched to PostgREST.

---

## 3. Post-Migration Verification

### Verification Step 1: Run the Database Readiness CLI
In your local repository root, run:
```bash
npx tsx scripts/verify-database-readiness.ts
```

**Expected Result:**
Every check displays `✓ [PASS]`:
```
AUDIT CHECK MATRIX:
--------------------------------------------------------------------------------
✓ [PASS]   | CONFIG   | NEXT_PUBLIC_SUPABASE_URL            | ...
✓ [PASS]   | CONFIG   | SUPABASE_SERVICE_ROLE_KEY           | Configured
✓ [PASS]   | CONFIG   | RATE_LIMIT_HMAC_SECRET              | Configured
✓ [PASS]   | AUTH     | Supabase Auth Admin Service         | Connected
✓ [PASS]   | TABLE    | Table: profiles                     | Schema discovered
✓ [PASS]   | TABLE    | Table: worker_profiles              | Schema discovered
✓ [PASS]   | TABLE    | Table: occupations                  | Schema discovered
✓ [PASS]   | TABLE    | Table: skills                       | Schema discovered
✓ [PASS]   | TABLE    | Table: worker_skills                | Schema discovered
✓ [PASS]   | TABLE    | Table: user_consents                | Schema discovered
✓ [PASS]   | TABLE    | Table: auth_rate_limits             | Schema discovered
✓ [PASS]   | COLUMN   | Column: profiles.id                 | Column discovered
✓ [PASS]   | COLUMN   | Column: profiles.full_name          | Column discovered
✓ [PASS]   | COLUMN   | Column: profiles.role               | Column discovered
✓ [PASS]   | COLUMN   | Column: profiles.email              | Column discovered
✓ [PASS]   | COLUMN   | Column: profiles.phone              | Column discovered
✓ [PASS]   | COLUMN   | Column: profiles.account_status     | Column discovered
✓ [PASS]   | COLUMN   | Column: profiles.phone_verified     | Column discovered
✓ [PASS]   | RPC      | RPC: get_rate_limit_status          | Callable
✓ [PASS]   | RPC      | RPC: check_and_increment_rate_limit | Callable
--------------------------------------------------------------------------------
>>> ALL DATABASE SCHEMA AUDIT CHECKS PASSED: OPERATIONAL <<<
```

### Verification Step 2: Query the Health Check Endpoint
Query your live application health endpoint:
```bash
curl -s https://kaamsetu-neon.vercel.app/api/auth/health | jq .
```
or locally:
```bash
curl -s http://localhost:3001/api/auth/health | jq .
```

**Expected Result:** HTTP 200 OK
```json
{
  "status": "OPERATIONAL",
  "operational": true,
  "mode": "production",
  "missingTables": [],
  "missingColumns": [],
  "missingRpcs": []
}
```

---

## 4. Idempotency & Safety Guarantees

- **No Destructive Operations:** The script does not issue `DROP TABLE` or `DROP SCHEMA`.
- **Idempotent Clauses:** Every DDL statement utilizes `IF NOT EXISTS` or `DO $$ BEGIN ... EXCEPTION WHEN duplicate_object THEN null; END $$;`.
- **Re-runnable:** The migration can be safely re-run multiple times on the same database without data loss, constraint duplication, or integrity violations.
