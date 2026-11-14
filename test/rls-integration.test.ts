/**
 * KAAMSETU PostgreSQL & Supabase RLS Integration Test Suite
 *
 * Tests 10 Real Attack Vectors using direct PostgreSQL authenticated sessions:
 * - Worker A: 33333333-3333-3333-3333-333333330001 (Rameshwar Sharma)
 * - Worker B: 33333333-3333-3333-3333-333333330002 (Sunita Devi)
 * - Customer A: 44444444-4444-4444-4444-444444440001 (Vikrant Singhania)
 * - Customer B: 44444444-4444-4444-4444-444444440003 (Pooja Agarwal)
 * - Contractor: 44444444-4444-4444-4444-444444440002 (DLF Projects Lead)
 * - Unauthenticated Visitor: role 'anon', no uid
 */

import { Client } from "pg";

const DB_CONFIG = {
  host: process.env.PGHOST || "localhost",
  port: parseInt(process.env.PGPORT || "5432", 10),
  database: process.env.PGDATABASE || "kaamsetu_rls_test",
  user: process.env.PGUSER || "mayankgautam",
  password: process.env.PGPASSWORD || "",
};

const WORKER_A_ID = "33333333-3333-3333-3333-333333330001";
const WORKER_B_ID = "33333333-3333-3333-3333-333333330002";
const WORKER_A_PROFILE_ID = "55555555-5555-5555-5555-555555550001";
const WORKER_B_PROFILE_ID = "55555555-5555-5555-5555-555555550002";
const CUSTOMER_A_ID = "44444444-4444-4444-4444-444444440001";
const CUSTOMER_B_ID = "44444444-4444-4444-4444-444444440003";
const CUSTOMER_B_BOOKING_ID = "66666666-6666-6666-6666-666666660003";

interface TestResult {
  attackId: number;
  name: string;
  category: string;
  expected: string;
  actual: string;
  passed: boolean;
  notes?: string;
}

const results: TestResult[] = [];

async function runSessionTest<T>(
  client: Client,
  role: "authenticated" | "anon",
  userId: string | null,
  operation: () => Promise<T>
): Promise<T> {
  await client.query("BEGIN;");
  try {
    await client.query(`SET LOCAL role = '${role}';`);
    if (userId) {
      await client.query(`SET LOCAL "request.jwt.claim.sub" = '${userId}';`);
      await client.query(`SET LOCAL "request.jwt.claim.role" = '${role}';`);
    } else {
      await client.query(`RESET "request.jwt.claim.sub";`);
      await client.query(`SET LOCAL "request.jwt.claim.role" = 'anon';`);
    }
    const res = await operation();
    await client.query("COMMIT;");
    return res;
  } catch (err) {
    await client.query("ROLLBACK;");
    throw err;
  }
}

async function main() {
  console.log("===============================================================================");
  console.log("KAAMSETU LIVE POSTGRESQL & SUPABASE RLS INTEGRATION TEST SUITE");
  console.log(`Connecting to: postgresql://${DB_CONFIG.user}@${DB_CONFIG.host}:${DB_CONFIG.port}/${DB_CONFIG.database}`);
  console.log("===============================================================================\n");

  const client = new Client(DB_CONFIG);
  await client.connect();

  try {
    // -------------------------------------------------------------------------
    // ATTACK 1: Worker A attempts to read Worker B's private data (phone number)
    // -------------------------------------------------------------------------
    {
      const rows = await runSessionTest(client, "authenticated", WORKER_A_ID, async () => {
        const res = await client.query(
          "SELECT id, full_name, phone FROM public.profiles WHERE id = $1;",
          [WORKER_B_ID]
        );
        return res.rows;
      });

      const passed = rows.length === 0;
      results.push({
        attackId: 1,
        name: "Worker A reads Worker B private data",
        category: "Privacy & Identification",
        expected: "0 rows returned (SELECT blocked by RLS)",
        actual: `${rows.length} rows returned`,
        passed,
        notes: passed ? "Worker B's private phone number completely shielded from Worker A" : "FAILED: Phone leaked",
      });
    }

    // -------------------------------------------------------------------------
    // ATTACK 2: Worker A attempts to edit Worker B's profile
    // -------------------------------------------------------------------------
    {
      const updatedCount = await runSessionTest(client, "authenticated", WORKER_A_ID, async () => {
        const res = await client.query(
          "UPDATE public.profiles SET full_name = 'Compromised Name' WHERE id = $1;",
          [WORKER_B_ID]
        );
        return res.rowCount || 0;
      });

      const passed = updatedCount === 0;
      results.push({
        attackId: 2,
        name: "Worker A edits Worker B profile",
        category: "Profile Sovereignty",
        expected: "0 rows affected (UPDATE blocked by RLS)",
        actual: `${updatedCount} rows affected`,
        passed,
        notes: passed ? "Worker A cannot tamper with Worker B's identity record" : "FAILED: Profile updated",
      });
    }

    // -------------------------------------------------------------------------
    // ATTACK 3: Worker A attempts to delete Worker B's portfolio
    // -------------------------------------------------------------------------
    {
      // First ensure Worker B has a portfolio item
      const itemCheck = await client.query(
        "SELECT id FROM public.portfolio WHERE worker_profile_id = $1 LIMIT 1;",
        [WORKER_B_PROFILE_ID]
      );
      const bItemId = itemCheck.rows[0]?.id;

      let deletedCount = 0;
      if (bItemId) {
        deletedCount = await runSessionTest(client, "authenticated", WORKER_A_ID, async () => {
          const res = await client.query(
            "DELETE FROM public.portfolio WHERE id = $1;",
            [bItemId]
          );
          return res.rowCount || 0;
        });
      }

      const passed = deletedCount === 0 && !!bItemId;
      results.push({
        attackId: 3,
        name: "Worker A deletes Worker B portfolio",
        category: "Portfolio Evidence Integrity",
        expected: "0 rows affected (DELETE blocked by RLS)",
        actual: `${deletedCount} rows deleted`,
        passed,
        notes: passed ? "Worker B's portfolio evidence cannot be deleted by other workers" : "FAILED: Portfolio deleted",
      });
    }

    // -------------------------------------------------------------------------
    // ATTACK 4: Customer A attempts to read Customer B's booking
    // -------------------------------------------------------------------------
    {
      const rows = await runSessionTest(client, "authenticated", CUSTOMER_A_ID, async () => {
        const res = await client.query(
          "SELECT id, customer_id, worker_profile_id FROM public.bookings WHERE id = $1;",
          [CUSTOMER_B_BOOKING_ID]
        );
        return res.rows;
      });

      const passed = rows.length === 0;
      results.push({
        attackId: 4,
        name: "Customer A reads Customer B booking",
        category: "Booking Privacy",
        expected: "0 rows returned (SELECT blocked by RLS)",
        actual: `${rows.length} rows returned`,
        passed,
        notes: passed ? "Booking details isolated strictly to booking participants" : "FAILED: Booking leaked",
      });
    }

    // -------------------------------------------------------------------------
    // ATTACK 5: Customer A attempts to modify Worker B's booking
    // -------------------------------------------------------------------------
    {
      const updatedCount = await runSessionTest(client, "authenticated", CUSTOMER_A_ID, async () => {
        const res = await client.query(
          "UPDATE public.bookings SET status = 'cancelled' WHERE id = $1;",
          [CUSTOMER_B_BOOKING_ID]
        );
        return res.rowCount || 0;
      });

      const passed = updatedCount === 0;
      results.push({
        attackId: 5,
        name: "Customer A modifies Worker B booking",
        category: "Booking Integrity",
        expected: "0 rows affected (UPDATE blocked by RLS)",
        actual: `${updatedCount} rows affected`,
        passed,
        notes: passed ? "Unrelated customer cannot cancel or alter another party's booking" : "FAILED: Booking modified",
      });
    }

    // -------------------------------------------------------------------------
    // ATTACK 6: Customer A attempts to submit a review for an unrelated booking
    // -------------------------------------------------------------------------
    {
      let errorThrown = false;
      let errorMsg = "";
      try {
        await runSessionTest(client, "authenticated", CUSTOMER_A_ID, async () => {
          await client.query(`
            INSERT INTO public.reviews (
              booking_id, worker_profile_id, customer_id, rating, comment
            ) VALUES ($1, $2, $3, 5, 'Illegitimate Review');
          `, [CUSTOMER_B_BOOKING_ID, WORKER_B_PROFILE_ID, CUSTOMER_A_ID]);
        });
      } catch (err: unknown) {
        errorThrown = true;
        errorMsg = err instanceof Error ? err.message : String(err);
      }

      const passed = errorThrown && (errorMsg.includes("row-level security") || errorMsg.includes("policy"));
      results.push({
        attackId: 6,
        name: "Customer A submits review for unrelated booking",
        category: "Trust & Review Authenticity",
        expected: "RLS policy error on INSERT",
        actual: errorThrown ? `Blocked: ${errorMsg.slice(0, 45)}...` : "Allowed (VULNERABILITY)",
        passed,
        notes: passed ? "Reviews strictly gated by completed booking ownership check" : "FAILED: Review accepted",
      });
    }

    // -------------------------------------------------------------------------
    // ATTACK 7: Unauthenticated visitor attempts to access private profile fields
    // -------------------------------------------------------------------------
    {
      const rows = await runSessionTest(client, "anon", null, async () => {
        const res = await client.query(
          "SELECT id, full_name, phone FROM public.profiles WHERE id = $1;",
          [WORKER_B_ID]
        );
        return res.rows;
      });

      const passed = rows.length === 0;
      results.push({
        attackId: 7,
        name: "Unauthenticated visitor accesses private profile fields",
        category: "Data Protection & Anonymity",
        expected: "0 rows returned (SELECT blocked by RLS for anon)",
        actual: `${rows.length} rows returned`,
        passed,
        notes: passed ? "Direct profiles table inaccessible to anonymous users" : "FAILED: Private profile leaked to anon",
      });
    }

    // -------------------------------------------------------------------------
    // ATTACK 8: Authenticated user attempts to change their own role to admin
    // -------------------------------------------------------------------------
    {
      const checkBefore = await client.query(
        "SELECT role, is_verified FROM public.profiles WHERE id = $1;",
        [CUSTOMER_A_ID]
      );
      const originalRole = checkBefore.rows[0]?.role;

      await runSessionTest(client, "authenticated", CUSTOMER_A_ID, async () => {
        await client.query(
          "UPDATE public.profiles SET role = 'admin', is_verified = true WHERE id = $1;",
          [CUSTOMER_A_ID]
        );
      });

      const checkAfter = await client.query(
        "SELECT role, is_verified FROM public.profiles WHERE id = $1;",
        [CUSTOMER_A_ID]
      );
      const finalRole = checkAfter.rows[0]?.role;
      const finalVerified = checkAfter.rows[0]?.is_verified;

      const passed = finalRole === originalRole && finalVerified === false;
      results.push({
        attackId: 8,
        name: "Authenticated user elevates own role to admin",
        category: "Privilege Escalation Defense",
        expected: `role remains '${originalRole}', is_verified remains false`,
        actual: `role: '${finalRole}', is_verified: ${finalVerified}`,
        passed,
        notes: passed ? "Database trigger silently neutralizes unauthorized privilege escalation" : "FAILED: User elevated to admin",
      });
    }

    // -------------------------------------------------------------------------
    // ATTACK 9: Worker attempts to mark self-declared work record as verified
    // -------------------------------------------------------------------------
    {
      const insertResult = await runSessionTest(client, "authenticated", WORKER_A_ID, async () => {
        const res = await client.query(`
          INSERT INTO public.work_records (
            worker_profile_id, project_title, contractor_or_client, location, start_date, trade_category, verified_by_contractor, verification_hash
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING id, project_title, verified_by_contractor, verification_hash;
        `, [
          WORKER_A_PROFILE_ID,
          "RLS Test Self-Verification",
          "Fabricated Client",
          "Jaipur",
          "2026-01-01",
          "Electrical",
          true,
          "fake-signature-hash-9988",
        ]);
        return res.rows[0];
      });

      const passed = insertResult?.verified_by_contractor === false && insertResult?.verification_hash === null;

      // Clean up test record
      if (insertResult?.id) {
        await client.query("DELETE FROM public.work_records WHERE id = $1;", [insertResult.id]);
      }

      results.push({
        attackId: 9,
        name: "Worker marks self-declared work as contractor-verified",
        category: "Work Record Anti-Tamper",
        expected: "verified_by_contractor = false, verification_hash = null",
        actual: `verified: ${insertResult?.verified_by_contractor}, hash: ${insertResult?.verification_hash}`,
        passed,
        notes: passed ? "Anti-tamper trigger strictly strips unverified claims from worker inserts" : "FAILED: Self-verification persisted",
      });
    }

    // -------------------------------------------------------------------------
    // ATTACK 10: User attempts to upload or delete from another user's storage folder
    // -------------------------------------------------------------------------
    {
      // Sub-test 10A: Upload to another user's storage folder
      let uploadBlocked = false;
      let uploadErr = "";
      try {
        await runSessionTest(client, "authenticated", WORKER_A_ID, async () => {
          await client.query(`
            INSERT INTO storage.objects (
              id, bucket_id, name, owner
            ) VALUES (
              gen_random_uuid(), 'portfolio-images', '${WORKER_B_ID}/malicious-attack.jpg', '${WORKER_A_ID}'
            );
          `);
        });
      } catch (err: unknown) {
        uploadBlocked = true;
        uploadErr = err instanceof Error ? err.message : String(err);
      }

      // Sub-test 10B: Worker A uploads to own folder
      const ownFileId = "88888888-8888-8888-8888-888888880002";
      await runSessionTest(client, "authenticated", WORKER_A_ID, async () => {
        await client.query(`
          INSERT INTO storage.objects (
            id, bucket_id, name, owner
          ) VALUES (
            $1, 'portfolio-images', '${WORKER_A_ID}/valid-project.jpg', '${WORKER_A_ID}'
          );
        `, [ownFileId]);
      });

      // Sub-test 10C: Worker B attempts to delete Worker A's file
      const bDeleteCount = await runSessionTest(client, "authenticated", WORKER_B_ID, async () => {
        const res = await client.query("DELETE FROM storage.objects WHERE id = $1;", [ownFileId]);
        return res.rowCount || 0;
      });

      // Clean up own test file
      await client.query("DELETE FROM storage.objects WHERE id = $1;", [ownFileId]);

      const passed = uploadBlocked && bDeleteCount === 0;
      results.push({
        attackId: 10,
        name: "User uploads or deletes from another user storage folder",
        category: "Storage Folder Isolation",
        expected: "Upload to foreign folder blocked by RLS; delete foreign file affects 0 rows",
        actual: `Upload blocked: ${uploadBlocked}, Foreign delete count: ${bDeleteCount}`,
        passed,
        notes: passed ? "Storage RLS strictly isolates storage path prefixes to authenticated user UUID" : "FAILED: Storage isolation breached",
      });
    }

    // Print Results Table
    console.log("------------------------------------------------------------------------------------------------------");
    console.log(
      "ID".padEnd(4) +
      "Attack Vector".padEnd(46) +
      "Category".padEnd(30) +
      "Result".padEnd(10)
    );
    console.log("------------------------------------------------------------------------------------------------------");

    let allPassed = true;
    for (const r of results) {
      if (!r.passed) allPassed = false;
      const statusStr = r.passed ? "PASSED [OK]" : "FAILED [X]";
      console.log(
        String(r.attackId).padEnd(4) +
        r.name.padEnd(46) +
        r.category.padEnd(30) +
        statusStr.padEnd(10)
      );
    }
    console.log("------------------------------------------------------------------------------------------------------\n");

    console.log(`Summary: ${results.filter((r) => r.passed).length} / ${results.length} Attacks Successfully Defeated.`);
    if (allPassed) {
      console.log("ALL 10 REAL DATABASE RLS ATTACK SCENARIOS INDEPENDENTLY REPRODUCED AND VERIFIED SECURE.\n");
    } else {
      console.error("SOME ATTACK SCENARIOS FAILED! INVESTIGATE IMMEDIATELY.");
      process.exit(1);
    }
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
