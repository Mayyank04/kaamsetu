# KAAMSETU — PHASE 39.6 PRODUCTION DEPLOYMENT EVIDENCE

**Document ID:** `KAAMSETU-39-6-DEPLOYMENT-EVIDENCE`  
**Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**Repository:** `Mayyank04/kaamsetu`  
**Branch:** `phase-39-6-production-auth-infrastructure-repair`  
**Target Domain:** `https://kaamsetu-neon.vercel.app`  
**Status:** `VERIFIED_LOCALLY` / `BLOCKED_BY_OPERATOR_ACTION` (Remote Supabase Migration)

---

## 1. Subsystem Evidence & Status Taxonomy

| Subsystem | Evidence & Diagnostic Artifacts | Status |
|---|---|---|
| **Source Code & Typing** | `npx tsc --noEmit` exited with code 0. Zero TypeScript errors. | `VERIFIED_LOCALLY` |
| **Lint & Quality Standards** | `npm run lint` reported 0 ESLint warnings or errors. | `VERIFIED_LOCALLY` |
| **Next.js Production Build** | `npm run build` compiled successfully in 3.4s; 114 static pages generated. | `VERIFIED_LOCALLY` |
| **Regression Suite** | 36/36 tests passed in `test/phase-39-6-root-cause-recovery.test.ts` (includes all 21 mandatory scenarios). | `VERIFIED_LOCALLY` |
| **Preflight Audit** | `scripts/verify-deployment-preflight.ts` ran and diagnosed remote Supabase schema state. | `VERIFIED_LOCALLY` |
| **Remote Supabase Objects** | SQL inspection query returned `NULL` on remote database. Tables and RPCs are unmigrated. | `BLOCKED_BY_OPERATOR_ACTION` |
| **Vercel Production Deployment** | Branch `phase-39-6-production-auth-infrastructure-repair` ready for deployment once SQL migration runs. | `IMPLEMENTED_NOT_DEPLOYED` |

---

## 2. Operator Execution Runbook (Unblocking Remote Supabase)

To unblock the remote Supabase production instance:

1. Open the Supabase Web Console for project `anwppwjlismjyovbyfmb`:  
   `https://supabase.com/dashboard/project/anwppwjlismjyovbyfmb`
2. Open the **SQL Editor** in the left sidebar.
3. Paste and execute the master migration:  
   [supabase/migrations/20261117_master_infrastructure_repair.sql](file:///Users/mayankgautam/Desktop/stitch_kaamsetu_digital_identity_platform/supabase/migrations/20261117_master_infrastructure_repair.sql)
4. Execute the verification query:
   ```sql
   SELECT
     to_regclass('public.auth_rate_limits') AS rate_limit_table,
     to_regclass('public.otp_challenges') AS otp_table,
     to_regprocedure(
       'public.check_and_increment_rate_limit(text,integer,integer,integer)'
     ) AS rate_limit_function,
     to_regprocedure(
       'public.verify_and_consume_otp(text,text)'
     ) AS verify_otp_function;
   ```
5. Confirm that all four values resolve to their respective database objects.
6. Run the local preflight verification script:
   ```bash
   npx tsx scripts/verify-deployment-preflight.ts
   ```
7. Verify status displays `STATUS: PREFLIGHT CERTIFIED`.
8. Deploy branch `phase-39-6-production-auth-infrastructure-repair` on Vercel.
