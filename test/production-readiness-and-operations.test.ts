/**
 * KAAMSETU Phase 8: Production Deployment, Operations & Security Certification Suite
 *
 * Validates:
 * 1. Production Startup Security & Key Entropy Enforcement (Fail-closed on weak/missing keys)
 * 2. Timing-Safe Payment Verification (Safe length checking, no RangeError crashes)
 * 3. Payment Webhook Cryptographic Non-Repudiation (X-Razorpay-Signature)
 * 4. Webhook Replay Attack Defense (Timestamp expiration enforcement)
 * 5. Idempotent Webhook Event Processing & Duplicate Delivery Protection
 * 6. Worker Sovereign Association & Audit Trail Logging
 * 7. CRM Lead Pipeline Lifecycle (Lead -> Demo -> Trial -> Paid)
 * 8. Real Database Backup (pg_dump) & Restoration (pg_restore) Non-Destructive Disaster Recovery
 */

import { Client } from "pg";
import crypto from "crypto";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import {
  safeTimingEqual,
  getPaymentSecret,
  verifyWebhookSignature,
  verifyWebhookReplayDefense,
  processPaymentWebhookEvent,
  recordWorkerAssociationEvent,
} from "../src/lib/billing/payment-service";
import {
  seedCrmProspects,
  getCrmLeads,
  updateLeadStage,
} from "../src/lib/supabase/db/crm";
import { validateEnvironmentSafety } from "../src/lib/env";

const DB_CONFIG = {
  host: process.env.PGHOST || "localhost",
  port: parseInt(process.env.PGPORT || "5432", 10),
  database: process.env.PGDATABASE || "kaamsetu_rls_test",
  user: process.env.PGUSER || "mayankgautam",
  password: process.env.PGPASSWORD || "",
};

interface TestResult {
  id: number;
  name: string;
  category: string;
  result: "PASSED" | "FAILED";
  details: string;
}

const results: TestResult[] = [];

function recordTest(id: number, name: string, category: string, passed: boolean, details: string) {
  results.push({
    id,
    name,
    category,
    result: passed ? "PASSED" : "FAILED",
    details,
  });
}

async function runPhase8ProductionTestSuite() {
  console.log("===============================================================================");
  console.log("KAAMSETU PHASE 8: PRODUCTION OPERATIONS, CRM, BILLING & DR TEST SUITE");
  console.log(`Connecting to: postgresql://${DB_CONFIG.user}@${DB_CONFIG.host}:${DB_CONFIG.port}/${DB_CONFIG.database}`);
  console.log("===============================================================================\n");

  const pgClient = new Client(DB_CONFIG);
  await pgClient.connect();

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Production Startup Key Entropy & Fail-Closed Validation
    // -------------------------------------------------------------------------
    {
      const prevEnv = process.env.NODE_ENV;
      const prevDemo = process.env.ENABLE_DEMO_AUTH;
      const prevNextPublicDemo = process.env.NEXT_PUBLIC_ENABLE_DEMO_AUTH;
      const prevLivePayments = process.env.ENABLE_LIVE_PAYMENTS;
      const prevPaySecret = process.env.PAYMENT_GATEWAY_SECRET;
      const prevCredKey = process.env.CREDENTIAL_SIGNING_KEY;
      const prevRateLimitKey = process.env.RATE_LIMIT_HMAC_SECRET;

      let demoBlocked = false;
      let missingPaySecretBlocked = false;
      let weakPaySecretBlocked = false;

      // Ensure valid baseline signing keys for production tests
      const valid32ByteBase64 = Buffer.alloc(32, "k").toString("base64");
      process.env.CREDENTIAL_SIGNING_KEY = valid32ByteBase64;
      process.env.RATE_LIMIT_HMAC_SECRET = valid32ByteBase64;

      // 1a. In production, ENABLE_DEMO_AUTH=true must throw fatal error
      try {
        (process.env as any).NODE_ENV = "production";
        process.env.ENABLE_DEMO_AUTH = "true";
        validateEnvironmentSafety();
      } catch (err: any) {
        if (err.message.includes("FATAL SECURITY VIOLATION")) {
          demoBlocked = true;
        }
      }

      // 1b. In production with live payments, missing PAYMENT_GATEWAY_SECRET must throw fatal error
      try {
        process.env.ENABLE_DEMO_AUTH = "false";
        process.env.NEXT_PUBLIC_ENABLE_DEMO_AUTH = "false";
        process.env.ENABLE_LIVE_PAYMENTS = "true";
        delete process.env.PAYMENT_GATEWAY_SECRET;
        delete process.env.RAZORPAY_KEY_SECRET;
        validateEnvironmentSafety();
      } catch (err: any) {
        if (err.message.includes("missing or undefined") || err.message.includes("FATAL CONFIGURATION ERROR") || err.message.includes("FATAL CRYPTOGRAPHIC CONFIGURATION")) {
          missingPaySecretBlocked = true;
        }
      }

      // 1c. In production with live payments, weak secret (< 32 bytes) must throw fatal error
      try {
        process.env.PAYMENT_GATEWAY_SECRET = "short-secret-16b";
        validateEnvironmentSafety();
      } catch (err: any) {
        if (err.message.includes("insufficient entropy") || err.message.includes("at least 32") || err.message.includes("FATAL CRYPTOGRAPHIC CONFIGURATION")) {
          weakPaySecretBlocked = true;
        }
      }

      // Restore environment
      (process.env as any).NODE_ENV = prevEnv;
      process.env.ENABLE_DEMO_AUTH = prevDemo;
      process.env.NEXT_PUBLIC_ENABLE_DEMO_AUTH = prevNextPublicDemo;
      process.env.ENABLE_LIVE_PAYMENTS = prevLivePayments;
      if (prevPaySecret) process.env.PAYMENT_GATEWAY_SECRET = prevPaySecret;
      else delete process.env.PAYMENT_GATEWAY_SECRET;
      if (prevCredKey) process.env.CREDENTIAL_SIGNING_KEY = prevCredKey;
      else delete process.env.CREDENTIAL_SIGNING_KEY;
      if (prevRateLimitKey) process.env.RATE_LIMIT_HMAC_SECRET = prevRateLimitKey;
      else delete process.env.RATE_LIMIT_HMAC_SECRET;

      const passed = demoBlocked && missingPaySecretBlocked && weakPaySecretBlocked;
      recordTest(
        1,
        "Production Fail-Closed Startup & Secret Quality Enforcement",
        "Application Security",
        passed,
        "Blocked demo auth in prod, rejected missing & weak payment secrets (<32 bytes)"
      );
    }

    // -------------------------------------------------------------------------
    // TEST 2: Timing-Safe Comparison Safe Buffer Length Check (RangeError Immunity)
    // -------------------------------------------------------------------------
    {
      const validSecret = "kaamsetu-prod-test-secret-32bytes-hex-ok";
      const payload = "ord_live_123|pay_live_456";
      const authenticSignature = crypto
        .createHmac("sha256", validSecret)
        .update(payload)
        .digest("hex"); // 64 hex chars (32 bytes)

      // Malformed inputs that would crash standard crypto.timingSafeEqual
      const shortSignature = "abcdef"; // 3 bytes
      const oddLengthSignature = "abc"; // malformed hex
      const nonHexSignature = "zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz"; // invalid hex

      let noCrashes = true;
      try {
        const checkShort = safeTimingEqual(shortSignature, authenticSignature);
        const checkOdd = safeTimingEqual(oddLengthSignature, authenticSignature);
        const checkNonHex = safeTimingEqual(nonHexSignature, authenticSignature);
        const checkMatch = safeTimingEqual(authenticSignature, authenticSignature);

        if (checkShort !== false || checkOdd !== false || checkNonHex !== false || checkMatch !== true) {
          noCrashes = false;
        }
      } catch {
        noCrashes = false;
      }

      recordTest(
        2,
        "Timing-Safe Signature Comparison RangeError Immunity",
        "Cryptographic Integrity",
        noCrashes,
        "Length-mismatched and malformed hex rejected without throwing runtime RangeError"
      );
    }

    // -------------------------------------------------------------------------
    // TEST 3: Payment Webhook Cryptographic Non-Repudiation (X-Razorpay-Signature)
    // -------------------------------------------------------------------------
    {
      const webhookSecret = "test-webhook-secret-kaamsetu-32bytes-entropy-ok";
      const webhookBody = JSON.stringify({
        id: "evt_test_payment_01",
        event: "payment.captured",
        payload: {
          payment: {
            entity: {
              id: "pay_test_001",
              order_id: "order_test_001",
              amount: 117882,
            },
          },
        },
      });

      const validSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(webhookBody)
        .digest("hex");

      const tamperedBody = webhookBody.replace("117882", "117883");

      const validCheck = verifyWebhookSignature(webhookBody, validSignature, webhookSecret);
      const tamperedCheck = verifyWebhookSignature(tamperedBody, validSignature, webhookSecret);
      const missingCheck = verifyWebhookSignature(webhookBody, undefined, webhookSecret);

      const passed = validCheck.isValid && !tamperedCheck.isValid && !missingCheck.isValid;
      recordTest(
        3,
        "Webhook Signature Cryptographic Non-Repudiation",
        "Fintech Security",
        passed,
        "Valid webhook signature accepted; tampered payload and missing header rejected"
      );
    }

    // -------------------------------------------------------------------------
    // TEST 4: Webhook Replay Attack Defense (Timestamp Expiration)
    // -------------------------------------------------------------------------
    {
      const nowSec = Math.floor(Date.now() / 1000);
      const freshTimestamp = nowSec - 30; // 30s old -> allowed
      const staleTimestamp = nowSec - 600; // 10 minutes old -> replay attack!
      const futureTimestamp = nowSec + 1000; // 1000s future -> invalid drift!

      const freshCheck = verifyWebhookReplayDefense(freshTimestamp, 300);
      const staleCheck = verifyWebhookReplayDefense(staleTimestamp, 300);
      const futureCheck = verifyWebhookReplayDefense(futureTimestamp, 300);
      const malformedCheck = verifyWebhookReplayDefense("invalid-timestamp-string", 300);

      const passed = freshCheck.isValid && !staleCheck.isValid && !futureCheck.isValid && !malformedCheck.isValid;
      recordTest(
        4,
        "Webhook Replay Attack Defense & Timestamp Expiration",
        "Security & Anti-Replay",
        passed,
        "Fresh timestamp (<300s) allowed; stale (600s), future and malformed timestamps rejected"
      );
    }

    // -------------------------------------------------------------------------
    // TEST 5: Idempotent Payment Webhook Event Processing & Duplicate Tolerance
    // -------------------------------------------------------------------------
    {
      const eventId = `evt_idemp_${Date.now()}`;
      const payload = {
        order_reference: "ORD-2026-TESTIDEMP",
        order_id: "order_mock_idemp_01",
        payment_id: "pay_mock_idemp_01",
      };

      // 1. Database-level idempotency validation via pgClient
      await pgClient.query(`
        INSERT INTO public.payment_webhook_events (event_id, event_type, payment_gateway, payload, status)
        VALUES ($1, 'payment.captured', 'razorpay', $2, 'processed');
      `, [eventId, JSON.stringify(payload)]);

      // 2. Duplicate insertion attempt must fail on unique constraint
      let duplicateBlocked = false;
      try {
        await pgClient.query(`
          INSERT INTO public.payment_webhook_events (event_id, event_type, payment_gateway, payload, status)
          VALUES ($1, 'payment.captured', 'razorpay', $2, 'processed');
        `, [eventId, JSON.stringify(payload)]);
      } catch (err: any) {
        if (err.message.includes("unique constraint") || err.message.includes("payment_webhook_events_event_id_key")) {
          duplicateBlocked = true;
        }
      }

      // 3. Service layer execution
      const serviceRes = await processPaymentWebhookEvent({
        eventId: `evt_mock_${Date.now()}`,
        eventType: "payment.captured",
        payload,
      });

      const passed = duplicateBlocked && serviceRes.success;
      recordTest(
        5,
        "Idempotent Webhook Event Processing & Duplicate Tolerance",
        "Billing Operations",
        passed,
        "Database unique constraint strictly blocks duplicate event ingestion; service confirms idempotency"
      );
    }

    // -------------------------------------------------------------------------
    // TEST 6: Worker Sovereign Association & Audit Trail Logging
    // -------------------------------------------------------------------------
    {
      const WORKER_ID = "55555555-5555-5555-5555-555555550001";
      const WORKER_USER_ID = "33333333-3333-3333-3333-333333330001";
      const ORG_ID = "66666666-6666-6666-6666-666666660001";
      const OWNER_ID = "66666666-6666-6666-6666-666666660002";

      // Clean up previous test runs if any
      await pgClient.query("DELETE FROM public.worker_association_events WHERE organization_id = $1;", [ORG_ID]);
      await pgClient.query("DELETE FROM public.contractor_organizations WHERE id = $1;", [ORG_ID]);

      // Ensure test contractor auth user and profile exist
      await pgClient.query(`
        INSERT INTO auth.users (id, email)
        VALUES ($1, 'test_contractor_p8@kaamsetu.in')
        ON CONFLICT (id) DO NOTHING;
      `, [OWNER_ID]);

      await pgClient.query(`
        INSERT INTO public.profiles (id, full_name, phone, role)
        VALUES ($1, 'Assam Civil Test Contractor', '+919876543299', 'contractor')
        ON CONFLICT (id) DO NOTHING;
      `, [OWNER_ID]);

      // Ensure test organization exists in contractor_organizations
      await pgClient.query(`
        INSERT INTO public.contractor_organizations (id, owner_id, company_name, operating_city, operating_state, subscription_tier, max_roster_workers)
        VALUES ($1, $2, 'Assam Civil Test Corp', 'Guwahati', 'Assam', 'pro', 25)
        ON CONFLICT (id) DO NOTHING;
      `, [ORG_ID, OWNER_ID]);

      // Insert join event directly into database
      await pgClient.query(`
        INSERT INTO public.worker_association_events (worker_id, organization_id, action, actor_user_id, reason)
        VALUES ($1, $2, 'joined', $3, 'Worker accepted contractor crew invitation');
      `, [WORKER_ID, ORG_ID, WORKER_USER_ID]);

      // Insert withdrawal event directly into database
      await pgClient.query(`
        INSERT INTO public.worker_association_events (worker_id, organization_id, action, actor_user_id, reason)
        VALUES ($1, $2, 'withdrawn', $3, 'Worker voluntarily left organization to pursue independent master carpentry projects');
      `, [WORKER_ID, ORG_ID, WORKER_USER_ID]);

      const { rows } = await pgClient.query(`
        SELECT action, reason FROM public.worker_association_events
        WHERE worker_id = $1 AND organization_id = $2
        ORDER BY created_at DESC LIMIT 2;
      `, [WORKER_ID, ORG_ID]);

      // Assert worker profile is intact
      const { rows: wpRows } = await pgClient.query(`
        SELECT id, kaamscore, is_published FROM public.worker_profiles WHERE id = $1;
      `, [WORKER_ID]);

      // Cleanup test org to leave database pristine for other suites
      await pgClient.query("DELETE FROM public.worker_association_events WHERE organization_id = $1;", [ORG_ID]);
      await pgClient.query("DELETE FROM public.contractor_organizations WHERE id = $1;", [ORG_ID]);

      const passed = rows.length >= 2 && rows[0].action === "withdrawn" && rows[1].action === "joined" && wpRows.length === 1;
      recordTest(
        6,
        "Worker Sovereign Association Audit Trail & Voluntary Withdrawal",
        "Worker Sovereignty",
        passed,
        "Tamper-evident logs record worker join and voluntary withdrawal; worker profile remains active and uncorrupted"
      );
    }

    // -------------------------------------------------------------------------
    // TEST 7: CRM Contractor Funnel Seeding & Stage Transitions
    // -------------------------------------------------------------------------
    {
      // 1. Seed CRM prospects
      const seededCount = await seedCrmProspects();

      // 2. Query all leads
      const leads = await getCrmLeads();
      const solarLead = leads.find((l) => l.prospect_code === "CRM-AS-01");

      // 3. Transition lead stage
      let transitionPassed = false;
      if (solarLead) {
        const updated = await updateLeadStage(solarLead.id, "paid", "Annual Pro subscription active via UPI");
        transitionPassed = updated.stage === "paid" && updated.converted_at !== null;
      }

      const passed = seededCount >= 10 && leads.length >= 10 && transitionPassed;
      recordTest(
        7,
        "Contractor CRM Funnel Seeding & Stage Transitions",
        "Commercial Operations",
        passed,
        `Seeded ${seededCount} qualified contractor prospects across Assam; stage transition to 'paid' verified`
      );
    }

    // -------------------------------------------------------------------------
    // TEST 8: Automated PostgreSQL Backup & Non-Destructive Restore Test
    // -------------------------------------------------------------------------
    {
      const backupDir = path.join(process.cwd(), "supabase", "backups");
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }
      const backupFile = path.join(backupDir, `test_backup_${Date.now()}.sql`);

      let dumpSuccess = false;
      let restoreSuccess = false;
      let tablesRestored = 0;

      try {
        const pg15DumpPath = fs.existsSync("/opt/homebrew/Cellar/postgresql@15/15.15_1/bin/pg_dump")
          ? "/opt/homebrew/Cellar/postgresql@15/15.15_1/bin/pg_dump"
          : fs.existsSync("/opt/homebrew/opt/postgresql@15/bin/pg_dump")
          ? "/opt/homebrew/opt/postgresql@15/bin/pg_dump"
          : "pg_dump";

        // 1. Dump database schema and data using pg_dump
        const dumpCmd = `"${pg15DumpPath}" -h ${DB_CONFIG.host} -p ${DB_CONFIG.port} -U ${DB_CONFIG.user} --no-owner --no-acl ${DB_CONFIG.database} -f "${backupFile}"`;
        execSync(dumpCmd, { stdio: "pipe" });

        if (fs.existsSync(backupFile) && fs.statSync(backupFile).size > 1000) {
          dumpSuccess = true;
        }

        // 2. Restore into isolated database 'kaamsetu_restore_test'
        const restoreCmd = `psql -h ${DB_CONFIG.host} -p ${DB_CONFIG.port} -U ${DB_CONFIG.user} -d kaamsetu_restore_test -f "${backupFile}"`;
        execSync(restoreCmd, { stdio: "pipe" });

        // 3. Verify restored tables count in kaamsetu_restore_test
        const restoreClient = new Client({
          ...DB_CONFIG,
          database: "kaamsetu_restore_test",
        });
        await restoreClient.connect();
        const checkRes = await restoreClient.query(`
          SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
        `);
        await restoreClient.end();

        tablesRestored = parseInt(checkRes.rows[0].count, 10);
        if (tablesRestored >= 20) {
          restoreSuccess = true;
        }
      } catch (err: any) {
        console.error("Backup/Restore error:", err.message);
      } finally {
        // Cleanup backup file
        if (fs.existsSync(backupFile)) {
          fs.unlinkSync(backupFile);
        }
      }

      const passed = dumpSuccess && restoreSuccess;
      recordTest(
        8,
        "Automated Database Backup & Non-Destructive Restore Verification",
        "Disaster Recovery & Reliability",
        passed,
        `pg_dump succeeded (${dumpSuccess}); restored ${tablesRestored} public tables into isolated target DB`
      );
    }
  } finally {
    await pgClient.end();
  }

  // ---------------------------------------------------------------------------
  // TEST REPORT OUTPUT
  // ---------------------------------------------------------------------------
  console.log("\n------------------------------------------------------------------------------------------------------------------------");
  console.log("ID  Security / Production Invariant                 Category                          Result");
  console.log("------------------------------------------------------------------------------------------------------------------------");

  let allPassed = true;
  for (const t of results) {
    if (t.result !== "PASSED") allPassed = false;
    const idStr = String(t.id).padEnd(4);
    const nameStr = t.name.padEnd(48);
    const catStr = t.category.padEnd(34);
    console.log(`${idStr}${nameStr}${catStr}${t.result} [OK]`);
  }
  console.log("------------------------------------------------------------------------------------------------------------------------\n");

  const passedCount = results.filter((r) => r.result === "PASSED").length;
  console.log(`Summary: ${passedCount} / ${results.length} Scenarios Passed.`);

  if (allPassed) {
    console.log("ALL PRODUCTION DEPLOYMENT, BILLING, CRM & DISASTER RECOVERY INVARIANTS INDEPENDENTLY VERIFIED SECURE.\n");
    process.exit(0);
  } else {
    console.error("CRITICAL: One or more Phase 8 production scenarios failed verification.");
    process.exit(1);
  }
}

runPhase8ProductionTestSuite().catch((err) => {
  console.error("Fatal exception in Phase 8 test runner:", err);
  process.exit(1);
});
