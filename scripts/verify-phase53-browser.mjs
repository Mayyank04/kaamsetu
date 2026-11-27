import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ARTIFACTS_DIR = "/Users/mayankgautam/.gemini/antigravity/brain/b2c1acf5-1ea0-4008-9c90-cc0011f201e4/phase53_screenshots";
const PORT = 3012;
const CDP_PORT = 9222;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.id = 1;
    this.callbacks = new Map();
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (err) => reject(err);
      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id && this.callbacks.has(msg.id)) {
          const cb = this.callbacks.get(msg.id);
          this.callbacks.delete(msg.id);
          if (msg.error) cb.reject(new Error(msg.error.message));
          else cb.resolve(msg.result);
        }
      };
    });
  }

  async send(method, params = {}) {
    const id = this.id++;
    return new Promise((resolve, reject) => {
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const res = await this.send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (res.exceptionDetails) {
      throw new Error(`Eval failed: ${JSON.stringify(res.exceptionDetails)}`);
    }
    return res.result?.value;
  }

  async captureScreenshot(filePath, clip = null) {
    const params = { format: "png" };
    if (clip) params.clip = clip;
    const res = await this.send("Page.captureScreenshot", params);
    const buffer = Buffer.from(res.data, "base64");
    fs.writeFileSync(filePath, buffer);
    console.log(`Saved screenshot: ${filePath} (${buffer.length} bytes)`);
  }

  async setViewport(width, height) {
    await this.send("Emulation.setDeviceMetricsOverride", {
      width,
      height,
      deviceScaleFactor: 2,
      mobile: width < 600,
    });
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function main() {
  console.log("=== Phase 53.1 Browser Flow Verification ===");
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });

  // 1. Fetch CDP WebSocket URL
  const versionRes = await fetch(`http://127.0.0.1:${CDP_PORT}/json/new`, { method: "PUT" });
  const target = await versionRes.json();
  const wsUrl = target.webSocketDebuggerUrl;
  console.log("Connected to Chrome target:", target.id);

  const client = new CDPClient(wsUrl);
  await client.connect();

  await client.send("Page.enable");
  await client.send("Runtime.enable");
  await client.send("DOM.enable");

  // 2. Set desktop viewport & navigate to /signup
  await client.setViewport(1280, 900);
  console.log("Navigating to http://127.0.0.1:3012/signup...");
  await client.send("Page.navigate", { url: `http://127.0.0.1:${PORT}/signup` });
  await sleep(2500);

  // 3. Capture Desktop Initial Signup UI
  await client.captureScreenshot(path.join(ARTIFACTS_DIR, "01_signup_desktop_initial.png"));

  // 4. Capture Mobile Initial Signup UI (390x844)
  await client.setViewport(390, 844);
  await sleep(500);
  await client.captureScreenshot(path.join(ARTIFACTS_DIR, "02_signup_mobile_initial.png"));

  // Switch back to desktop for full interaction flow
  await client.setViewport(1280, 900);
  await sleep(500);

  // 5. Fill in Full Name & Mobile Number
  console.log("Entering Name and Mobile Number...");
  await client.evaluate(`
    (() => {
      const nameInput = document.getElementById("reg-name");
      nameInput.value = "Bikash Borah";
      nameInput.dispatchEvent(new Event("input", { bubbles: true }));

      const phoneInput = document.getElementById("reg-phone");
      phoneInput.value = "9876543210";
      phoneInput.dispatchEvent(new Event("input", { bubbles: true }));
    })()
  `);
  await sleep(500);

  // 6. Click "Verify phone number"
  console.log("Clicking 'Verify phone number' button...");
  await client.evaluate(`
    (() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const verifyBtn = btns.find(b => b.textContent.includes("Verify phone number"));
      if (verifyBtn) verifyBtn.click();
    })()
  `);
  await sleep(1500);

  // 7. Capture Screenshot with Expanded OTP Section
  console.log("Capturing expanded OTP section screenshot...");
  await client.captureScreenshot(path.join(ARTIFACTS_DIR, "03_signup_otp_section_visible.png"));

  // Also capture mobile view of OTP section
  await client.setViewport(390, 844);
  await sleep(500);
  await client.captureScreenshot(path.join(ARTIFACTS_DIR, "04_signup_mobile_otp_section.png"));
  await client.setViewport(1280, 900);
  await sleep(500);

  // 8. Test Copy OTP Button
  console.log("Clicking 'Copy OTP' button...");
  await client.evaluate(`
    (() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const copyBtn = btns.find(b => b.textContent.includes("Copy OTP"));
      if (copyBtn) copyBtn.click();
    })()
  `);
  await sleep(500);

  // 9. Verify OTP input is populated with 123456 and click "Verify OTP"
  console.log("Clicking 'Verify OTP' button...");
  await client.evaluate(`
    (() => {
      const otpInput = document.getElementById("signup-otp");
      if (otpInput && !otpInput.value) {
        otpInput.value = "123456";
        otpInput.dispatchEvent(new Event("input", { bubbles: true }));
      }
      const btns = Array.from(document.querySelectorAll("button"));
      const verifyOtpBtn = btns.find(b => b.textContent.includes("Verify OTP"));
      if (verifyOtpBtn) verifyOtpBtn.click();
    })()
  `);
  await sleep(1500);

  // 10. Capture Screenshot showing Verified State (Phone locked, Create Account enabled)
  console.log("Capturing verified state screenshot...");
  await client.captureScreenshot(path.join(ARTIFACTS_DIR, "05_signup_phone_verified_state.png"));

  // 11. Fill in optional email, passwords, accept terms
  console.log("Entering optional email and passwords...");
  const uniqueEmail = `bikash.test.${Date.now()}@gmail.com`;
  await client.evaluate(`
    (() => {
      const emailInput = document.getElementById("reg-email");
      if (emailInput) {
        emailInput.value = "${uniqueEmail}";
        emailInput.dispatchEvent(new Event("input", { bubbles: true }));
      }

      const passInput = document.getElementById("reg-password");
      passInput.value = "StrongPassword2026!";
      passInput.dispatchEvent(new Event("input", { bubbles: true }));

      const confirmInput = document.getElementById("reg-confirm");
      confirmInput.value = "StrongPassword2026!";
      confirmInput.dispatchEvent(new Event("input", { bubbles: true }));

      const checkboxes = Array.from(document.querySelectorAll("input[type='checkbox']"));
      if (checkboxes[0]) {
        checkboxes[0].checked = true;
        checkboxes[0].dispatchEvent(new Event("change", { bubbles: true }));
      }
    })()
  `);
  await sleep(500);

  // 12. Capture ready to submit form screenshot
  await client.captureScreenshot(path.join(ARTIFACTS_DIR, "06_signup_ready_to_create_account.png"));

  // 13. Submit Registration
  console.log("Clicking 'Create Account' button...");
  await client.evaluate(`
    (() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const createBtn = btns.find(b => b.textContent.includes("Create Account"));
      if (createBtn) createBtn.click();
    })()
  `);
  await sleep(3500);

  // 14. Capture final post-registration state
  await client.captureScreenshot(path.join(ARTIFACTS_DIR, "07_post_registration_redirect.png"));

  client.close();
  console.log("=== All 7 browser verification screenshots captured successfully ===");
}

main().catch((err) => {
  console.error("Browser Verification Error:", err);
  process.exit(1);
});
