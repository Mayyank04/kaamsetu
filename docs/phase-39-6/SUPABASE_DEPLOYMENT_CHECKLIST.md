# KAAMSETU — PHASE 39.6 SUPABASE DEPLOYMENT CHECKLIST

**Project Reference:** `anwppwjlismjyovbyfmb`  
**Endpoint:** `https://anwppwjlismjyovbyfmb.supabase.co`  
**Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**Authoritative Migration:** `supabase/migrations/20261117_master_infrastructure_repair.sql`

---

## 1. Remote Object Verification Status (Live Diagnostic)

Ran: `npx tsx scripts/verify-deployment-preflight.ts`

| Database Object | Type | Remote PostgREST Status | Action Required |
|---|---|---|---|
| `public.auth_rate_limits` | Table | ❌ `PGRST205` Missing table | Run migration script |
| `public.otp_challenges` | Table | ❌ `PGRST205` Missing table | Run migration script |
| `public.profiles` | Table | ❌ `PGRST205` Missing table | Run migration script |
| `public.user_consents` | Table | ❌ `PGRST205` Missing table | Run migration script |
| `public.contractor_organizations` | Table | ❌ `PGRST205` Missing table | Run migration script |
| `public.worker_profiles` | Table | ❌ `PGRST205` Missing table | Run migration script |
| `check_and_increment_rate_limit` | RPC | ❌ `PGRST202` Missing procedure | Run migration script |
| `verify_and_consume_otp` | RPC | ❌ `PGRST202` Missing procedure | Run migration script |
| `register_user_account` | RPC | ❌ `PGRST202` Missing procedure | Run migration script |
| `get_rate_limit_status` | RPC | ❌ `PGRST202` Missing procedure | Run migration script |

---

## 2. Deployment Steps for Database Administrator

1. Open Supabase Web Console: `https://supabase.com/dashboard/project/anwppwjlismjyovbyfmb`.
2. Navigate to the **SQL Editor** on the left navigation bar.
3. Open or paste the full contents of:  
   `supabase/migrations/20261117_master_infrastructure_repair.sql`
4. Click **Run** to execute the script.
5. Verify output shows `Success. No rows returned`.
6. Run the local preflight verification script:
   ```bash
   npx tsx scripts/verify-deployment-preflight.ts
   ```
7. Confirm all 10 checks turn to:
   ```
   ✅ [DATABASE] TABLE: auth_rate_limits: Verified in remote schema
   ✅ [DATABASE] TABLE: otp_challenges: Verified in remote schema
   ✅ [DATABASE] TABLE: profiles: Verified in remote schema
   ✅ [DATABASE] TABLE: user_consents: Verified in remote schema
   ✅ [DATABASE] TABLE: contractor_organizations: Verified in remote schema
   ✅ [DATABASE] TABLE: worker_profiles: Verified in remote schema
   ✅ [DATABASE] RPC: check_and_increment_rate_limit: Verified in remote schema
   ✅ [DATABASE] RPC: verify_and_consume_otp: Verified in remote schema
   ✅ [DATABASE] RPC: register_user_account: Verified in remote schema
   ✅ [DATABASE] RPC: get_rate_limit_status: Verified in remote schema
   ```

---

## 3. PostgREST Cache Invalidation
The migration ends with:
```sql
NOTIFY pgrst, 'reload schema';
```
This forces PostgREST to reload its schema cache immediately, ensuring new stored procedures and tables are accessible over REST without requiring a database restart.
