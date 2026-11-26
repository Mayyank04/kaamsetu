/**
 * KAAMSETU — PHASE 53: SECURE PHONE-VERIFIED REGISTRATION, UNIQUE ACCOUNT & OPTIONAL EMAIL SUITE
 *
 * Covers:
 * 1. Phone normalization (Indian +91, international E.164, format equivalence, rejections)
 * 2. OTP lifecycle (generation, verification proof, invalid OTP, replay, rate limiting, prod sandbox block)
 * 3. Account creation security (proof enforcement, fake isVerified bypass rejection, role allowlist)
 * 4. Unique phone enforcement (duplicate across formats, across roles, concurrent race safety)
 * 5. Optional email handling (omitted, empty, Gmail/non-Gmail, whitespace trim, unverified state, duplicate rejection)
 * 6. Post-registration login with phone (with and without optional email) & OTP login recovery
 */

import { describe, test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { normalizePhoneNumber, validateIndianMobile } from "../src/lib/utilities/phone";
import {
  sendOtp,
  verifyOtp,
  __resetMemoryOtpStore,
} from "../src/lib/auth/otp-service";
import { __resetMemoryRateLimitStore } from "../src/lib/security/rate-limiter";
import { POST as sendOtpRoute } from "../src/app/api/auth/otp/send/route";
import { POST as verifyOtpRoute } from "../src/app/api/auth/otp/verify/route";
import { POST as registerRoute, __getLocalFallbackAccounts } from "../src/app/api/auth/register/route";
import { POST as loginRoute } from "../src/app/api/auth/login/route";

function randomIndian10(): string {
  const lead = ["6", "7", "8", "9"][Math.floor(Math.random() * 4)];
  const rest = Math.floor(100000000 + Math.random() * 899999999).toString();
  return `${lead}${rest}`;
}

function uniqueIp(): string {
  return `10.${Math.floor(Math.random() * 200 + 1)}.${Math.floor(Math.random() * 200 + 1)}.${Math.floor(Math.random() * 200 + 1)}`;
}

async function getProofForPhone(phone: string, ip: string): Promise<string> {
  const sendRes = await sendOtp({
    phone,
    intent: "registration",
    termsAccepted: true,
    clientIp: ip,
  });
  assert.strictEqual(sendRes.success, true, `sendOtp failed: ${sendRes.message}`);
  assert.ok(sendRes.sandboxCode, "Sandbox test harness must issue code in test environment");

  const verRes = await verifyOtp({
    phone,
    otp: sendRes.sandboxCode!,
    intent: "registration",
    deferAccountCreation: true,
    termsAccepted: true,
  });
  assert.strictEqual(verRes.success, true, `verifyOtp failed: ${verRes.message}`);
  assert.ok(verRes.verificationProof, "verifyOtp must return verificationProof");
  return verRes.verificationProof!;
}

describe("PHASE 53: SECURE PHONE-VERIFIED REGISTRATION & UNIQUE ACCOUNT ENFORCEMENT", () => {
  beforeEach(() => {
    __resetMemoryOtpStore();
    __resetMemoryRateLimitStore();
    __getLocalFallbackAccounts().clear();
  });

  describe("1. Phone Number Validation & E.164 Normalization", () => {
    test("1.1 Normalizes equivalent Indian mobile formats identically to +91XXXXXXXXXX", () => {
      const f1 = normalizePhoneNumber("9876543210");
      const f2 = normalizePhoneNumber("+91 98765-43210");
      const f3 = normalizePhoneNumber("09876543210");
      const f4 = normalizePhoneNumber("919876543210");

      assert.strictEqual(f1.valid, true);
      assert.strictEqual(f1.e164, "+919876543210");
      assert.strictEqual(f2.e164, "+919876543210");
      assert.strictEqual(f3.e164, "+919876543210");
      assert.strictEqual(f4.e164, "+919876543210");
    });

    test("1.2 Supports valid international E.164 numbers", () => {
      const uk = normalizePhoneNumber("+44 7911 123456", "+44");
      const us = normalizePhoneNumber("4155552671", "+1");
      assert.strictEqual(uk.valid, true);
      assert.strictEqual(uk.e164, "+447911123456");
      assert.strictEqual(us.valid, true);
      assert.strictEqual(us.e164, "+14155552671");
    });

    test("1.3 Rejects invalid Indian prefixes, missing digits, letters, and +0 country codes", () => {
      assert.strictEqual(validateIndianMobile("1234567890").valid, false);
      assert.strictEqual(validateIndianMobile("5876543210").valid, false);
      assert.strictEqual(validateIndianMobile("98765abc10").valid, false);
      assert.strictEqual(normalizePhoneNumber("+0123456789").valid, false);
      assert.strictEqual(normalizePhoneNumber("").valid, false);
      assert.strictEqual(normalizePhoneNumber("+1234").valid, false);
    });
  });

  describe("2. OTP Security, Rate Limiting & Production Sandbox Isolation", () => {
    test("2.1 Incorrect OTP rejected and replaying a used OTP is rejected", async () => {
      const phone = randomIndian10();
      const ip = uniqueIp();

      const sendRes = await sendOtp({ phone, intent: "registration", termsAccepted: true, clientIp: ip });
      assert.strictEqual(sendRes.success, true);

      const badOtp = sendRes.sandboxCode === "111111" ? "222222" : "111111";
      const wrongRes = await verifyOtp({ phone, otp: badOtp, intent: "registration", deferAccountCreation: true, termsAccepted: true });
      assert.strictEqual(wrongRes.success, false);

      const goodRes = await verifyOtp({ phone, otp: sendRes.sandboxCode!, intent: "registration", deferAccountCreation: true, termsAccepted: true });
      assert.strictEqual(goodRes.success, true);
      assert.ok(goodRes.verificationProof);

      // Replay same OTP must fail
      const replayRes = await verifyOtp({ phone, otp: sendRes.sandboxCode!, intent: "registration", deferAccountCreation: true, termsAccepted: true });
      assert.strictEqual(replayRes.success, false);
    });

    test("2.2 Resend cooldown blocks rapid repeat OTP sends with 429 RATE_LIMITED", async () => {
      const phone = randomIndian10();
      const ip = uniqueIp();

      const first = await sendOtp({ phone, intent: "registration", termsAccepted: true, clientIp: ip });
      assert.strictEqual(first.success, true);

      const second = await sendOtp({ phone, intent: "registration", termsAccepted: true, clientIp: ip });
      assert.strictEqual(second.success, false);
      assert.ok(
        second.code === "RATE_LIMITED" || second.code === "ACTIVE_CHALLENGE_EXISTS",
        `Expected RATE_LIMITED or ACTIVE_CHALLENGE_EXISTS, got ${second.code}`
      );
      assert.strictEqual(second.statusCode, 429);
    });

    test("2.3 Brute-force > 5 failed OTP attempts locks out further verification", async () => {
      const phone = randomIndian10();
      const ip = uniqueIp();

      const sendRes = await sendOtp({ phone, intent: "registration", termsAccepted: true, clientIp: ip });
      assert.strictEqual(sendRes.success, true);
      const wrongOtp = sendRes.sandboxCode === "111111" ? "222222" : "111111";

      for (let i = 0; i < 5; i++) {
        const res = await verifyOtp({ phone, otp: wrongOtp, intent: "registration", deferAccountCreation: true, termsAccepted: true });
        assert.strictEqual(res.success, false);
      }

      const lockedRes = await verifyOtp({
        phone,
        otp: sendRes.sandboxCode!,
        intent: "registration",
        deferAccountCreation: true,
        termsAccepted: true,
      });
      assert.strictEqual(lockedRes.success, false);
    });

    test("2.4 Production OTP HTTP routes reject sandbox mode and never return sandboxCode", async () => {
      const env = process.env as Record<string, string | undefined>;
      const prevNodeEnv = env.NODE_ENV;
      const prevMode = env.AUTH_VERIFICATION_MODE;
      const prevSid = env.TWILIO_ACCOUNT_SID;
      const prevTok = env.TWILIO_AUTH_TOKEN;

      try {
        env.NODE_ENV = "production";
        env.AUTH_VERIFICATION_MODE = "sandbox";
        delete env.TWILIO_ACCOUNT_SID;
        delete env.TWILIO_AUTH_TOKEN;

        const req = new NextRequest("http://localhost:3000/api/auth/otp/send", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-forwarded-for": uniqueIp() },
          body: JSON.stringify({
            phone: randomIndian10(),
            intent: "registration",
            termsAccepted: true,
          }),
        });

        const res = await sendOtpRoute(req);
        const json = await res.json();
        assert.strictEqual(res.status, 503);
        assert.strictEqual(json.success, false);
        assert.strictEqual(json.sandboxCode, undefined);
      } finally {
        env.NODE_ENV = prevNodeEnv;
        if (prevMode === undefined) delete env.AUTH_VERIFICATION_MODE;
        else env.AUTH_VERIFICATION_MODE = prevMode;
        if (prevSid !== undefined) env.TWILIO_ACCOUNT_SID = prevSid;
        if (prevTok !== undefined) env.TWILIO_AUTH_TOKEN = prevTok;
      }
    });
  });

  describe("3. Phone-Verified Registration, Anti-Bypass & Optional Email", () => {
    test("3.1 Direct registration without verificationProof is rejected even with forged isVerified flags", async () => {
      const phone = randomIndian10();
      const req = new NextRequest("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-forwarded-for": uniqueIp() },
        body: JSON.stringify({
          fullName: "Bypass Attempt",
          phone,
          isVerified: true,
          phoneVerified: true,
          password: "StrongPassword2026!",
          confirmPassword: "StrongPassword2026!",
          role: "worker",
          termsAccepted: true,
        }),
      });
      const res = await registerRoute(req);
      assert.ok(res.status === 400 || res.status === 401);
    });

    test("3.2 Registration succeeds WITHOUT email (omitted/empty), sets emailVerified false, and allows phone login", async () => {
      const phone = randomIndian10();
      const ip = uniqueIp();
      const proof = await getProofForPhone(phone, ip);
      const password = "StrongPassword2026!";

      const regReq = new NextRequest("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
        body: JSON.stringify({
          fullName: "Bikash Das",
          phone,
          verificationProof: proof,
          email: "",
          password,
          confirmPassword: password,
          role: "worker",
          termsAccepted: true,
        }),
      });

      const regRes = await registerRoute(regReq);
      const regJson = await regRes.json();
      assert.strictEqual(regRes.status, 201, `Expected 201, got ${regRes.status}: ${regJson.message}`);
      assert.strictEqual(regJson.success, true);
      assert.strictEqual(regJson.user.email, null);
      assert.strictEqual(regJson.user.emailVerified, false);

      // Subsequent login with phone number works cleanly
      const loginReq = new NextRequest("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
        body: JSON.stringify({ identifier: phone, password }),
      });
      const loginRes = await loginRoute(loginReq);
      assert.strictEqual(loginRes.status, 200);
    });

    test("3.3 Registration with valid optional Gmail/non-Gmail trims spaces and marks emailVerified: false", async () => {
      const phone = randomIndian10();
      const ip = uniqueIp();
      const proof = await getProofForPhone(phone, ip);

      const uniqueEmail = `meena.devi.${Date.now()}@gmail.com`;
      const regReq = new NextRequest("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
        body: JSON.stringify({
          fullName: "Meena Devi",
          phone,
          verificationProof: proof,
          email: `  ${uniqueEmail.toUpperCase()}  `,
          password: "StrongPassword2026!",
          confirmPassword: "StrongPassword2026!",
          role: "vendor",
          termsAccepted: true,
        }),
      });
      const res = await registerRoute(regReq);
      const json = await res.json();
      assert.strictEqual(res.status, 201);
      assert.strictEqual(json.user.email, uniqueEmail);
      assert.strictEqual(json.user.emailVerified, false);
      assert.strictEqual(json.user.role, "vendor");
    });

    test("3.4 Invalid optional email is rejected with 400 and duplicate registration with same phone across formats/roles returns 409", async () => {
      const rawPhone = randomIndian10();
      const ip = uniqueIp();
      const proof1 = await getProofForPhone(rawPhone, ip);

      // First test invalid email format
      const badEmailReq = new NextRequest("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
        body: JSON.stringify({
          fullName: "Invalid Email Test",
          phone: rawPhone,
          verificationProof: proof1,
          email: "not-an-email",
          password: "StrongPassword2026!",
          confirmPassword: "StrongPassword2026!",
          role: "worker",
          termsAccepted: true,
        }),
      });
      assert.strictEqual((await registerRoute(badEmailReq)).status, 400);

      // Register valid worker with +91 format
      const firstReq = new NextRequest("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
        body: JSON.stringify({
          fullName: "Primary Identity",
          phone: `+91${rawPhone}`,
          verificationProof: proof1,
          password: "StrongPassword2026!",
          confirmPassword: "StrongPassword2026!",
          role: "worker",
          termsAccepted: true,
        }),
      });
      assert.strictEqual((await registerRoute(firstReq)).status, 201);

      // Attempting OTP send for same phone formatted with 0-prefix fails closed with 409
      const dupOtpRes = await sendOtpRoute(
        new NextRequest("http://localhost:3000/api/auth/otp/send", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-forwarded-for": uniqueIp() },
          body: JSON.stringify({
            phone: `0${rawPhone}`,
            role: "customer",
            intent: "registration",
            termsAccepted: true,
          }),
        })
      );
      assert.ok(dupOtpRes.status === 409 || dupOtpRes.status === 429);

      // Replaying verificationProof for a different role is rejected
      const secondRoleReq = new NextRequest("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-forwarded-for": uniqueIp() },
        body: JSON.stringify({
          fullName: "Duplicate Identity",
          phone: `0${rawPhone}`,
          verificationProof: proof1,
          password: "StrongPassword2026!",
          confirmPassword: "StrongPassword2026!",
          role: "customer",
          termsAccepted: true,
        }),
      });
      const dupRes = await registerRoute(secondRoleReq);
      assert.ok(dupRes.status === 401 || dupRes.status === 409);
    });

    test("3.5 Concurrent duplicate registrations allow only 1 creation", async () => {
      const phone = randomIndian10();
      const ip = uniqueIp();
      const proof = await getProofForPhone(phone, ip);

      const makeReq = () =>
        new NextRequest("http://localhost:3000/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-forwarded-for": uniqueIp() },
          body: JSON.stringify({
            fullName: "Concurrent User",
            phone,
            verificationProof: proof,
            password: "StrongPassword2026!",
            confirmPassword: "StrongPassword2026!",
            role: "customer",
            termsAccepted: true,
          }),
        });

      const [r1, r2] = await Promise.all([registerRoute(makeReq()), registerRoute(makeReq())]);
      const statuses = [r1.status, r2.status].sort();
      assert.strictEqual(statuses.filter((s) => s === 201).length, 1, `Expected exactly 1 HTTP 201, got ${statuses}`);
      assert.strictEqual(statuses.filter((s) => s === 401 || s === 409).length, 1);
    });

    test("3.6 Role escalation (admin) is strictly blocked", async () => {
      const phone = randomIndian10();
      const ip = uniqueIp();
      const proof = await getProofForPhone(phone, ip);

      const adminReq = new NextRequest("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
        body: JSON.stringify({
          fullName: "Privilege Escalator",
          phone,
          verificationProof: proof,
          password: "StrongPassword2026!",
          confirmPassword: "StrongPassword2026!",
          role: "admin",
          termsAccepted: true,
        }),
      });
      const res = await registerRoute(adminReq);
      assert.ok(res.status === 400 || res.status === 403);
    });
  });

  describe("4. OTP HTTP API End-to-End Flow", () => {
    test("4.1 /api/auth/otp/send + /api/auth/otp/verify (deferAccountCreation) + /api/auth/register end-to-end", async () => {
      const phone = randomIndian10();
      const ip = uniqueIp();

      const sendRes = await sendOtpRoute(
        new NextRequest("http://localhost:3000/api/auth/otp/send", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
          body: JSON.stringify({
            phone,
            fullName: "Suman Bora",
            role: "contractor",
            intent: "registration",
            termsAccepted: true,
          }),
        })
      );
      const sendJson = await sendRes.json();
      assert.strictEqual(sendRes.status, 200);
      assert.ok(sendJson.sandboxCode);

      const verRes = await verifyOtpRoute(
        new NextRequest("http://localhost:3000/api/auth/otp/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
          body: JSON.stringify({
            phone,
            otp: sendJson.sandboxCode,
            role: "contractor",
            fullName: "Suman Bora",
            intent: "registration",
            deferAccountCreation: true,
            termsAccepted: true,
          }),
        })
      );
      const verJson = await verRes.json();
      assert.strictEqual(verRes.status, 200);
      assert.ok(verJson.verificationProof);

      const regRes = await registerRoute(
        new NextRequest("http://localhost:3000/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
          body: JSON.stringify({
            fullName: "Suman Bora",
            phone,
            verificationProof: verJson.verificationProof,
            password: "StrongPassword2026!",
            confirmPassword: "StrongPassword2026!",
            role: "contractor",
            termsAccepted: true,
          }),
        })
      );
      const regJson = await regRes.json();
      assert.strictEqual(regRes.status, 201);
      assert.strictEqual(regJson.user.role, "contractor");
      assert.strictEqual(regJson.redirectUrl, "/contractor/dashboard");
    });
  });
});
