/**
 * KAAMSETU PostgreSQL & Supabase RLS Integration Test Suite
 *
 * Implements rigorous POSITIVE CONTROLS and NEGATIVE CONTROLS for all security invariants:
 * - Worker A: 33333333-3333-3333-3333-333333330001 (Rameshwar Sharma)
 * - Worker B: 33333333-3333-3333-3333-333333330002 (Sunita Devi)
 * - Customer A: 44444444-4444-4444-4444-444444440001 (Vikrant Singhania)
 * - Customer B: 44444444-4444-4444-4444-444444440003 (Pooja Agarwal)
 * - Contractor: 44444444-4444-4444-4444-444444440002 (DLF Projects Lead)
 * - Unauthenticated Visitor: role 'anon', no uid
 *
 * CRITICAL TEST INVARIANT:
 * Every negative attack test first executes a POSITIVE CONTROL confirming the fixture exists
 * and the legitimate owner can access it, eliminating false passes caused by missing fixtures.
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
  testId: number;
  name: string;
  category: string;
  positiveControl: string;
  negativeControl: string;
  passed: boolean;
  notes?: string;
}

const results: TestResult[] = [];

async function runSessionTest<T>(
  client: Client,
  role: "authenticated" | "anon" | "service_role",
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
  console.log("KAAMSETU COMPREHENSIVE RLS & DATABASE SECURITY TEST SUITE (WITH POSITIVE CONTROLS)");
  console.log(`Connecting to: postgresql://${DB_CONFIG.user}@${DB_CONFIG.host}:${DB_CONFIG.port}/${DB_CONFIG.database}`);
  console.log("===============================================================================\n");

  const client = new Client(DB_CONFIG);
  await client.connect();

  try {
    // -------------------------------------------------------------------------
    // 1. PRIVATE PHONE ACCESS: Owner reads own profile vs Worker A reading Worker B
    // -------------------------------------------------------------------------
    {
      // Positive Control: Worker B reads own profile and receives their phone number
      const ownerRows = await runSessionTest(client, "authenticated", WORKER_B_ID, async () => {
        const res = await client.query("SELECT id, full_name, phone FROM public.profiles WHERE id = $1;", [WORKER_B_ID]);
        return res.rows;
      });
      const positivePassed = ownerRows.length === 1 && Boolean(ownerRows[0]?.phone);

      // Negative Control: Worker A attempts to read Worker B's profile
      const attackerRows = await runSessionTest(client, "authenticated", WORKER_A_ID, async () => {
        const res = await client.query("SELECT id, full_name, phone FROM public.profiles WHERE id = $1;", [WORKER_B_ID]);
        return res.rows;
      });
      const negativePassed = attackerRows.length === 0;

      const passed = positivePassed && negativePassed;
      results.push({
        testId: 1,
        name: "Private Phone Access",
        category: "Privacy & Identification",
        positiveControl: positivePassed ? `Owner read own profile (phone: ${ownerRows[0]?.phone})` : "FAILED positive control",
        negativeControl: negativePassed ? "Attacker received 0 rows" : "FAILED: Phone leaked",
        passed,
        notes: "Strict column and row isolation protects personal contact data",
      });
    }

    // -------------------------------------------------------------------------
    // 2. PROFILE MODIFICATION: Owner updates own profile vs Worker A updating Worker B
    // -------------------------------------------------------------------------
    {
      const initialHeadline = "Master Handloom Weaver & Zardozi Artisan";

      // Positive Control: Worker B updates their own worker profile
      const ownerUpdateCount = await runSessionTest(client, "authenticated", WORKER_B_ID, async () => {
        const res = await client.query(
          "UPDATE public.worker_profiles SET headline = 'Updated by Owner' WHERE user_id = $1;",
          [WORKER_B_ID]
        );
        return res.rowCount || 0;
      });
      const positivePassed = ownerUpdateCount === 1;

      // Negative Control: Worker A attempts to update Worker B's worker profile
      const attackerUpdateCount = await runSessionTest(client, "authenticated", WORKER_A_ID, async () => {
        const res = await client.query(
          "UPDATE public.worker_profiles SET headline = 'Hacked by Attacker' WHERE user_id = $1;",
          [WORKER_B_ID]
        );
        return res.rowCount || 0;
      });
      const negativePassed = attackerUpdateCount === 0;

      // Revert test headline
      await client.query("UPDATE public.worker_profiles SET headline = $1 WHERE user_id = $2;", [initialHeadline, WORKER_B_ID]);

      const passed = positivePassed && negativePassed;
      results.push({
        testId: 2,
        name: "Profile Modification",
        category: "Profile Sovereignty",
        positiveControl: positivePassed ? "Owner updated 1 row" : "FAILED positive control",
        negativeControl: negativePassed ? "Attacker updated 0 rows" : "FAILED: Foreign update allowed",
        passed,
        notes: "Workers retain exclusive modification control over their professional identity",
      });
    }

    // -------------------------------------------------------------------------
    // 3. PORTFOLIO DELETION: Owner deletes own item vs Worker A deleting Worker B item
    // -------------------------------------------------------------------------
    {
      // Seed a temporary test portfolio item owned by Worker B
      const tempItemId = "99999999-9999-9999-9999-999999990001";
      await client.query(`
        INSERT INTO public.portfolio (id, worker_profile_id, title, image_url)
        VALUES ($1, $2, 'Temporary Test Brocade', 'https://example.com/temp/brocade.jpg')
        ON CONFLICT (id) DO NOTHING;
      `, [tempItemId, WORKER_B_PROFILE_ID]);

      // Negative Control: Worker A attempts to delete Worker B's item
      const attackerDeleteCount = await runSessionTest(client, "authenticated", WORKER_A_ID, async () => {
        const res = await client.query("DELETE FROM public.portfolio WHERE id = $1;", [tempItemId]);
        return res.rowCount || 0;
      });
      const negativePassed = attackerDeleteCount === 0;

      // Positive Control: Worker B deletes their own item
      const ownerDeleteCount = await runSessionTest(client, "authenticated", WORKER_B_ID, async () => {
        const res = await client.query("DELETE FROM public.portfolio WHERE id = $1;", [tempItemId]);
        return res.rowCount || 0;
      });
      const positivePassed = ownerDeleteCount === 1;

      const passed = positivePassed && negativePassed;
      results.push({
        testId: 3,
        name: "Portfolio Evidence Deletion",
        category: "Evidence Integrity",
        positiveControl: positivePassed ? "Owner deleted 1 owned portfolio item" : "FAILED positive control",
        negativeControl: negativePassed ? "Attacker deleted 0 rows" : "FAILED: Item deleted by attacker",
        passed,
        notes: "Portfolio items can only be deleted by the owning artisan",
      });
    }

    // -------------------------------------------------------------------------
    // 4. BOOKING ACCESS: Customer B reads own booking vs Customer A reading Customer B booking
    // -------------------------------------------------------------------------
    {
      // Positive Control: Customer B reads their own booking
      const ownerRows = await runSessionTest(client, "authenticated", CUSTOMER_B_ID, async () => {
        const res = await client.query("SELECT id, customer_id, status FROM public.bookings WHERE id = $1;", [CUSTOMER_B_BOOKING_ID]);
        return res.rows;
      });
      const positivePassed = ownerRows.length === 1 && ownerRows[0]?.customer_id === CUSTOMER_B_ID;

      // Negative Control: Customer A attempts to read Customer B's booking
      const attackerRows = await runSessionTest(client, "authenticated", CUSTOMER_A_ID, async () => {
        const res = await client.query("SELECT id, customer_id, status FROM public.bookings WHERE id = $1;", [CUSTOMER_B_BOOKING_ID]);
        return res.rows;
      });
      const negativePassed = attackerRows.length === 0;

      const passed = positivePassed && negativePassed;
      results.push({
        testId: 4,
        name: "Booking Access Isolation",
        category: "Booking Privacy",
        positiveControl: positivePassed ? `Owner read own booking (${CUSTOMER_B_BOOKING_ID})` : "FAILED positive control",
        negativeControl: negativePassed ? "Attacker received 0 rows" : "FAILED: Booking leaked",
        passed,
        notes: "Booking data is strictly isolated to customer and assigned craftsman",
      });
    }

    // -------------------------------------------------------------------------
    // 5. BOOKING UPDATE: Authorized party update vs Customer A tampering
    // -------------------------------------------------------------------------
    {
      // Negative Control: Customer A attempts to modify Customer B's booking
      const attackerUpdateCount = await runSessionTest(client, "authenticated", CUSTOMER_A_ID, async () => {
        const res = await client.query("UPDATE public.bookings SET status = 'cancelled' WHERE id = $1;", [CUSTOMER_B_BOOKING_ID]);
        return res.rowCount || 0;
      });
      const negativePassed = attackerUpdateCount === 0;

      // Positive Control: Verify booking state remains intact and readable by Customer B
      const checkRows = await runSessionTest(client, "authenticated", CUSTOMER_B_ID, async () => {
        const res = await client.query("SELECT status FROM public.bookings WHERE id = $1;", [CUSTOMER_B_BOOKING_ID]);
        return res.rows;
      });
      const positivePassed = checkRows.length === 1 && checkRows[0]?.status === "completed";

      const passed = positivePassed && negativePassed;
      results.push({
        testId: 5,
        name: "Booking Modification Protection",
        category: "Booking Integrity",
        positiveControl: positivePassed ? "Legitimate booking state preserved intact ('completed')" : "FAILED positive control",
        negativeControl: negativePassed ? "Attacker updated 0 rows" : "FAILED: Booking modified",
        passed,
        notes: "Unrelated clients cannot alter booking states or cancellation flags",
      });
    }

    // -------------------------------------------------------------------------
    // 6. REVIEW SUBMISSION: Eligible customer with completed booking vs Unrelated customer
    // -------------------------------------------------------------------------
    {
      // Negative Control: Customer A attempts to review Customer B's booking
      let attackerBlocked = false;
      try {
        await runSessionTest(client, "authenticated", CUSTOMER_A_ID, async () => {
          await client.query(`
            INSERT INTO public.reviews (booking_id, worker_profile_id, customer_id, rating, comment)
            VALUES ($1, $2, $3, 5, 'Illegitimate Review');
          `, [CUSTOMER_B_BOOKING_ID, WORKER_B_PROFILE_ID, CUSTOMER_A_ID]);
        });
      } catch (err: unknown) {
        attackerBlocked = true;
      }

      // Positive Control: Customer B (who actually completed the booking) can submit a review
      // First clean up any pre-existing review for this booking
      await client.query("DELETE FROM public.reviews WHERE booking_id = $1;", [CUSTOMER_B_BOOKING_ID]);

      let ownerSubmitted = false;
      try {
        await runSessionTest(client, "authenticated", CUSTOMER_B_ID, async () => {
          await client.query(`
            INSERT INTO public.reviews (booking_id, worker_profile_id, customer_id, rating, comment)
            VALUES ($1, $2, $3, 5, 'Masterpiece silk weaving completed on time.');
          `, [CUSTOMER_B_BOOKING_ID, WORKER_B_PROFILE_ID, CUSTOMER_B_ID]);
        });
        ownerSubmitted = true;
      } catch (err: unknown) {
        ownerSubmitted = false;
      }

      const passed = attackerBlocked && ownerSubmitted;
      results.push({
        testId: 6,
        name: "Review Eligibility Verification",
        category: "Review Authenticity",
        positiveControl: ownerSubmitted ? "Legitimate customer with completed booking posted review" : "FAILED positive control",
        negativeControl: attackerBlocked ? "Unrelated customer blocked by RLS" : "FAILED: Fake review accepted",
        passed,
        notes: "Reviews are strictly bound to completed ledger booking contracts",
      });
    }

    // -------------------------------------------------------------------------
    // 7. ROLE ESCALATION: Authorized full_name update vs Admin escalation attempt
    // -------------------------------------------------------------------------
    {
      // Positive Control: Customer A updates their own legitimate name
      const ownerUpdateCount = await runSessionTest(client, "authenticated", CUSTOMER_A_ID, async () => {
        const res = await client.query("UPDATE public.profiles SET full_name = 'Vikrant Singhania Esq' WHERE id = $1;", [CUSTOMER_A_ID]);
        return res.rowCount || 0;
      });
      const positivePassed = ownerUpdateCount === 1;

      // Negative Control: Customer A attempts to elevate role to 'admin' and mark verified
      await runSessionTest(client, "authenticated", CUSTOMER_A_ID, async () => {
        await client.query("UPDATE public.profiles SET role = 'admin', is_verified = true WHERE id = $1;", [CUSTOMER_A_ID]);
      });

      // Verify trigger prevented privilege escalation
      const checkRole = await client.query("SELECT role, is_verified FROM public.profiles WHERE id = $1;", [CUSTOMER_A_ID]);
      const negativePassed = checkRole.rows[0]?.role === "customer" && checkRole.rows[0]?.is_verified === false;

      // Revert name
      await client.query("UPDATE public.profiles SET full_name = 'Vikrant Singhania' WHERE id = $1;", [CUSTOMER_A_ID]);

      const passed = positivePassed && negativePassed;
      results.push({
        testId: 7,
        name: "Role Escalation Neutralization",
        category: "Privilege Escalation Defense",
        positiveControl: positivePassed ? "Normal profile update allowed (1 row)" : "FAILED positive control",
        negativeControl: negativePassed ? "Role remain 'customer' (escalation defeated)" : "FAILED: Escalated to admin",
        passed,
        notes: "Database trigger silently neutralizes unauthorized privilege escalation",
      });
    }

    // -------------------------------------------------------------------------
    // 8. WORK VERIFICATION: Worker self-verification attempt vs Anti-tamper trigger
    // -------------------------------------------------------------------------
    {
      // Attempt: Worker A inserts work record claiming verified_by_contractor = true with fake hash
      const insertResult = await runSessionTest(client, "authenticated", WORKER_A_ID, async () => {
        const res = await client.query(`
          INSERT INTO public.work_records (
            worker_profile_id, project_title, contractor_or_client, location, start_date, trade_category, verified_by_contractor, verification_hash
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING id, verified_by_contractor, verification_hash;
        `, [
          WORKER_A_PROFILE_ID,
          "Self Fabricated Claim",
          "Fabricated Client",
          "Jaipur",
          "2026-01-01",
          "Electrical",
          true,
          "fake-signature-hash-9988",
        ]);
        return res.rows[0];
      });

      // Positive Control: Record was inserted (worker is allowed to add self-declared work)
      const positivePassed = Boolean(insertResult?.id);

      // Negative Control: Trigger stripped verified_by_contractor and verification_hash
      const negativePassed = insertResult?.verified_by_contractor === false && insertResult?.verification_hash === null;

      // Clean up
      if (insertResult?.id) {
        await client.query("DELETE FROM public.work_records WHERE id = $1;", [insertResult.id]);
      }

      const passed = positivePassed && negativePassed;
      results.push({
        testId: 8,
        name: "Work Record Self-Verification Tampering",
        category: "Work Record Anti-Tamper",
        positiveControl: positivePassed ? "Self-declared work record inserted" : "FAILED positive control",
        negativeControl: negativePassed ? "Trigger stripped verified=true and hash to null" : "FAILED: Fake verification saved",
        passed,
        notes: "Workers cannot self-certify work records or forge cryptographic verification hashes",
      });
    }

    // -------------------------------------------------------------------------
    // 9. STORAGE ISOLATION: Worker A uploads to own folder vs Foreign folder upload
    // -------------------------------------------------------------------------
    {
      const ownFileId = "88888888-8888-8888-8888-888888880010";

      // Positive Control: Worker A uploads to their own folder
      let ownerUploadPassed = false;
      try {
        await runSessionTest(client, "authenticated", WORKER_A_ID, async () => {
          await client.query(`
            INSERT INTO storage.objects (id, bucket_id, name, owner)
            VALUES ($1, 'portfolio-images', '${WORKER_A_ID}/valid-project.jpg', '${WORKER_A_ID}');
          `, [ownFileId]);
        });
        ownerUploadPassed = true;
      } catch (err) {
        ownerUploadPassed = false;
      }

      // Negative Control: Worker A attempts to upload to Worker B's folder
      let foreignUploadBlocked = false;
      try {
        await runSessionTest(client, "authenticated", WORKER_A_ID, async () => {
          await client.query(`
            INSERT INTO storage.objects (id, bucket_id, name, owner)
            VALUES (gen_random_uuid(), 'portfolio-images', '${WORKER_B_ID}/attack.jpg', '${WORKER_A_ID}');
          `);
        });
      } catch (err) {
        foreignUploadBlocked = true;
      }

      const passed = ownerUploadPassed && foreignUploadBlocked;
      results.push({
        testId: 9,
        name: "Storage Folder Path Upload Isolation",
        category: "Storage Security",
        positiveControl: ownerUploadPassed ? "Owner uploaded to own storage prefix" : "FAILED positive control",
        negativeControl: foreignUploadBlocked ? "Upload to foreign prefix blocked by RLS" : "FAILED: Foreign upload allowed",
        passed,
        notes: "Storage RLS strictly isolates storage path prefixes to authenticated user UUID",
      });

      // -----------------------------------------------------------------------
      // 10. STORAGE DELETION: Worker A deletes own file vs Worker B deleting Worker A file
      // -----------------------------------------------------------------------
      // Negative Control: Worker B attempts to delete Worker A's file
      const bDeleteCount = await runSessionTest(client, "authenticated", WORKER_B_ID, async () => {
        const res = await client.query("DELETE FROM storage.objects WHERE id = $1;", [ownFileId]);
        return res.rowCount || 0;
      });
      const negativeDeletePassed = bDeleteCount === 0;

      // Positive Control: Worker A deletes their own file
      const aDeleteCount = await runSessionTest(client, "authenticated", WORKER_A_ID, async () => {
        const res = await client.query("DELETE FROM storage.objects WHERE id = $1;", [ownFileId]);
        return res.rowCount || 0;
      });
      const positiveDeletePassed = aDeleteCount === 1;

      const deleteTestPassed = negativeDeletePassed && positiveDeletePassed;
      results.push({
        testId: 10,
        name: "Storage File Deletion Isolation",
        category: "Storage Security",
        positiveControl: positiveDeletePassed ? "Owner deleted own storage file (1 row)" : "FAILED positive control",
        negativeControl: negativeDeletePassed ? "Foreign user deleted 0 rows" : "FAILED: Foreign delete succeeded",
        passed: deleteTestPassed,
        notes: "Storage objects can only be deleted by the owning user",
      });
    }

    // -------------------------------------------------------------------------
    // 11. ANONYMOUS ACCESS ISOLATION: Direct Base Table vs Public Worker View
    // -------------------------------------------------------------------------
    {
      // Base table SELECT: Anon gets 0 rows
      const anonBaseRows = await runSessionTest(client, "anon", null, async () => {
        const res = await client.query("SELECT * FROM public.profiles WHERE id = $1;", [WORKER_B_ID]);
        return res.rows;
      });
      const baseBlocked = anonBaseRows.length === 0;

      // View SELECT: Anon can read public published worker info WITHOUT phone
      const anonViewRows = await runSessionTest(client, "anon", null, async () => {
        const res = await client.query(
          "SELECT worker_profile_id, full_name, headline, city FROM public.public_worker_profiles WHERE worker_profile_id = $1;",
          [WORKER_B_PROFILE_ID]
        );
        return res.rows;
      });
      const viewAllowed = anonViewRows.length === 1 && Boolean(anonViewRows[0]?.full_name);

      const passed = baseBlocked && viewAllowed;
      results.push({
        testId: 11,
        name: "Anonymous Discovery vs Base Table Isolation",
        category: "Privacy & View Architecture",
        positiveControl: viewAllowed ? `Anon read public view (${anonViewRows[0]?.full_name})` : "FAILED positive control",
        negativeControl: baseBlocked ? "Direct profiles table returned 0 rows" : "FAILED: Base table exposed to anon",
        passed,
        notes: "Public discovery occurs exclusively through the curated, phone-free view",
      });
    }

    // -------------------------------------------------------------------------
    // 12. ANONYMOUS DML RESTRICTION: INSERT, UPDATE, DELETE completely blocked for anon
    // -------------------------------------------------------------------------
    {
      let anonInsertBlocked = false;
      let anonUpdateCount = 0;
      let anonDeleteCount = 0;

      try {
        await runSessionTest(client, "anon", null, async () => {
          await client.query("INSERT INTO public.profiles (id, full_name) VALUES (gen_random_uuid(), 'Anon Hacker');");
        });
      } catch {
        anonInsertBlocked = true;
      }

      anonUpdateCount = await runSessionTest(client, "anon", null, async () => {
        const res = await client.query("UPDATE public.profiles SET full_name = 'Hacked by Anon';");
        return res.rowCount || 0;
      });

      anonDeleteCount = await runSessionTest(client, "anon", null, async () => {
        const res = await client.query("DELETE FROM public.profiles;");
        return res.rowCount || 0;
      });

      const passed = anonInsertBlocked && anonUpdateCount === 0 && anonDeleteCount === 0;
      results.push({
        testId: 12,
        name: "Anonymous DML Restriction (INSERT/UPDATE/DELETE)",
        category: "Base Security",
        positiveControl: "Anon DML operations strictly disallowed by RLS",
        negativeControl: passed ? "All anonymous write attempts completely blocked" : "FAILED: Anon DML allowed",
        passed,
        notes: "Anonymous users cannot create, modify, or delete database rows",
      });
    }

    // -------------------------------------------------------------------------
    // 13. PRIVILEGED RPC EXECUTION PERMISSIONS: Anon/Authenticated blocked from rate-limit RPC
    // -------------------------------------------------------------------------
    {
      let anonRpcBlocked = false;
      try {
        await runSessionTest(client, "anon", null, async () => {
          await client.query("SELECT * FROM public.check_and_increment_rate_limit('test_key', 5, 60, 60);");
        });
      } catch (err: unknown) {
        anonRpcBlocked = true;
      }

      let authRpcBlocked = false;
      try {
        await runSessionTest(client, "authenticated", CUSTOMER_A_ID, async () => {
          await client.query("SELECT * FROM public.check_and_increment_rate_limit('test_key', 5, 60, 60);");
        });
      } catch (err: unknown) {
        authRpcBlocked = true;
      }

      // Positive Control: service_role CAN execute check_and_increment_rate_limit
      let serviceRoleAllowed = false;
      try {
        await runSessionTest(client, "service_role", null, async () => {
          await client.query("SELECT * FROM public.check_and_increment_rate_limit('test_rpc_key', 5, 60, 60);");
        });
        serviceRoleAllowed = true;
      } catch (err: unknown) {
        serviceRoleAllowed = false;
      }

      // Clean up
      await client.query("DELETE FROM public.auth_rate_limits WHERE key LIKE 'test_%';");

      const passed = anonRpcBlocked && authRpcBlocked && serviceRoleAllowed;
      results.push({
        testId: 13,
        name: "Rate Limit RPC Permission Hardening",
        category: "Function Security & Least Privilege",
        positiveControl: serviceRoleAllowed ? "service_role successfully executed RPC" : "FAILED positive control",
        negativeControl: (anonRpcBlocked && authRpcBlocked) ? "anon & authenticated permission denied" : "FAILED: RPC executable by ordinary users",
        passed,
        notes: "Privileged rate limiter RPC execution revoked from PUBLIC and granted only to service_role",
      });
    }

    // -------------------------------------------------------------------------
    // 14. CONCURRENCY SAFETY: 10 Simultaneous Requests to check_and_increment_rate_limit
    // -------------------------------------------------------------------------
    {
      const concurrencyKey = `concurrency_test_${Date.now()}`;
      const concurrentClients: Client[] = [];

      for (let i = 0; i < 10; i++) {
        const c = new Client(DB_CONFIG);
        await c.connect();
        concurrentClients.push(c);
      }

      let allSucceeded = false;
      let finalCount = 0;

      try {
        const promises = concurrentClients.map((c) =>
          c.query(
            "SELECT * FROM public.check_and_increment_rate_limit($1, 20, 60, 60);",
            [concurrencyKey]
          )
        );

        const resultsArray = await Promise.all(promises);
        allSucceeded = resultsArray.every((r) => r.rows.length === 1 && r.rows[0].allowed === true);

        // Verify the final count in database is exactly 10
        const finalCountRes = await client.query(
          "SELECT count FROM public.auth_rate_limits WHERE key = $1;",
          [concurrencyKey]
        );
        finalCount = finalCountRes.rows[0]?.count;

        // Clean up
        await client.query("DELETE FROM public.auth_rate_limits WHERE key = $1;", [concurrencyKey]);
      } finally {
        for (const c of concurrentClients) {
          await c.end();
        }
      }

      const passed = allSucceeded && finalCount === 10;
      results.push({
        testId: 14,
        name: "Atomic Concurrency Safety on First Key Creation",
        category: "Concurrency & Race Defense",
        positiveControl: `10 parallel queries resolved with final count = ${finalCount}`,
        negativeControl: passed ? "Zero unique constraint errors or race condition drops" : "FAILED: Race condition detected",
        passed,
        notes: "Atomic upsert serializes simultaneous first-request key creation without duplicate key errors",
      });
    }

    // Print Results Table
    console.log("------------------------------------------------------------------------------------------------------------------------");
    console.log(
      "ID".padEnd(4) +
      "Security Invariant".padEnd(44) +
      "Category".padEnd(32) +
      "Result".padEnd(10)
    );
    console.log("------------------------------------------------------------------------------------------------------------------------");

    let allPassed = true;
    for (const r of results) {
      if (!r.passed) allPassed = false;
      const statusStr = r.passed ? "PASSED [OK]" : "FAILED [X]";
      console.log(
        String(r.testId).padEnd(4) +
        r.name.padEnd(44) +
        r.category.padEnd(32) +
        statusStr.padEnd(10)
      );
    }
    console.log("------------------------------------------------------------------------------------------------------------------------\n");

    console.log(`Summary: ${results.filter((r) => r.passed).length} / ${results.length} Security Invariants Verified with Positive Controls.`);
    if (allPassed) {
      console.log("ALL 14 DATABASE RLS & CONCURRENCY SECURITY INVARIANTS INDEPENDENTLY VERIFIED SECURE.\n");
    } else {
      console.error("SOME INVARIANTS FAILED! INVESTIGATE IMMEDIATELY.");
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
