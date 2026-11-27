import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ARTIFACTS_DIR = "/Users/mayankgautam/.gemini/antigravity/brain/b2c1acf5-1ea0-4008-9c90-cc0011f201e4/phase54_screenshots";
const PORT = 3014;
const CDP_PORT = 9223;

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

  async captureScreenshot(filePath) {
    const res = await this.send("Page.captureScreenshot", { format: "png" });
    const buffer = Buffer.from(res.data, "base64");
    fs.writeFileSync(filePath, buffer);
    console.log(`Saved screenshot: ${filePath} (${buffer.length} bytes)`);
  }

  async setViewport(width, height) {
    await this.send("Emulation.setDeviceMetricsOverride", {
      width,
      height,
      deviceScaleFactor: 2,
      mobile: width < 768,
    });
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function main() {
  console.log("=== KAAMSETU Phase 54 Visual QA & Browser Inspection ===");
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });

  // 1. Start background Chrome instance
  const chromeProc = spawn(
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    [
      "--headless=new",
      `--remote-debugging-port=${CDP_PORT}`,
      "--no-first-run",
      "--no-default-browser-check",
      "--user-data-dir=/tmp/chrome-phase54-profile",
      "about:blank",
    ],
    { stdio: "ignore" }
  );

  // Give Chrome time to initialize CDP port
  await sleep(1500);

  try {
    // 2. Fetch CDP WebSocket URL
    const versionRes = await fetch(`http://127.0.0.1:${CDP_PORT}/json/new`, { method: "PUT" });
    const target = await versionRes.json();
    const wsUrl = target.webSocketDebuggerUrl;
    console.log("Connected to Chrome target:", target.id);

    const client = new CDPClient(wsUrl);
    await client.connect();

    await client.send("Page.enable");
    await client.send("Runtime.enable");
    await client.send("DOM.enable");

    // =======================================================================
    // PART 1: MULTI-VIEWPORT INSPECTION OF /find-professionals
    // =======================================================================
    const viewports = [
      { name: "01_marketplace_mobile_320", width: 320, height: 640 },
      { name: "02_marketplace_mobile_360", width: 360, height: 780 },
      { name: "03_marketplace_mobile_390", width: 390, height: 844 },
      { name: "04_marketplace_mobile_430", width: 430, height: 932 },
      { name: "05_marketplace_tablet_768", width: 768, height: 1024 },
      { name: "06_marketplace_tablet_1024", width: 1024, height: 768 },
      { name: "07_marketplace_laptop_1280", width: 1280, height: 800 },
      { name: "08_marketplace_desktop_1440", width: 1440, height: 900 },
    ];

    console.log(`Navigating to http://127.0.0.1:${PORT}/find-professionals...`);
    await client.setViewport(1440, 900);
    await client.send("Page.navigate", { url: `http://127.0.0.1:${PORT}/find-professionals` });
    await sleep(2500);

    for (const vp of viewports) {
      console.log(`Capturing viewport ${vp.name} (${vp.width}x${vp.height})...`);
      await client.setViewport(vp.width, vp.height);
      await sleep(500);
      await client.captureScreenshot(path.join(ARTIFACTS_DIR, `${vp.name}.png`));
    }

    // =======================================================================
    // PART 2: INTERACTIVE DISCOVERY & SEARCH WORKFLOWS
    // =======================================================================
    await client.setViewport(1280, 850);
    await sleep(400);

    // Click Category: Electrical
    console.log("Clicking 'Electrical' category card...");
    await client.evaluate(`
      (() => {
        const catBtn = document.querySelector('[data-testid="category-card-electrical"]');
        if (catBtn) catBtn.click();
      })()
    `);
    await sleep(1000);
    await client.captureScreenshot(path.join(ARTIFACTS_DIR, "09_marketplace_category_electrical_active.png"));

    // Filter by Carrier Phone Verified
    console.log("Selecting 'Phone Verified (SMS OTP)' in verification filter...");
    await client.evaluate(`
      (() => {
        const filterSelect = document.querySelector('[data-testid="filter-phone-verification"]');
        if (filterSelect) {
          filterSelect.value = "sms_verified";
          filterSelect.dispatchEvent(new Event("change", { bubbles: true }));
        }
      })()
    `);
    await sleep(1000);
    await client.captureScreenshot(path.join(ARTIFACTS_DIR, "10_marketplace_verified_phone_filter.png"));

    // Enter Search term "plumber"
    console.log("Entering search query 'Plumber'...");
    await client.evaluate(`
      (() => {
        const searchInput = document.querySelector('[data-testid="input-marketplace-search"]');
        if (searchInput) {
          searchInput.value = "Plumber";
          searchInput.dispatchEvent(new Event("input", { bubbles: true }));
        }
        const searchBtn = document.querySelector('[data-testid="btn-search-professionals"]');
        if (searchBtn) searchBtn.click();
      })()
    `);
    await sleep(1200);
    await client.captureScreenshot(path.join(ARTIFACTS_DIR, "11_marketplace_search_results.png"));

    // Open Service Request Modal on first result
    console.log("Opening Service Request booking dialog...");
    await client.evaluate(`
      (() => {
        const reqBtn = document.querySelector('[data-testid^="btn-request-service-"]');
        if (reqBtn) reqBtn.click();
      })()
    `);
    await sleep(1000);
    await client.captureScreenshot(path.join(ARTIFACTS_DIR, "12_service_request_dialog_opened.png"));

    // Close Dialog
    await client.evaluate(`
      (() => {
        const closeBtn = document.querySelector('button[aria-label="Close dialog"]');
        if (closeBtn) closeBtn.click();
      })()
    `);
    await sleep(500);

    // =======================================================================
    // PART 3: WORKER PROFILE VIEW WITH VERIFIED BADGE
    // =======================================================================
    console.log("Navigating to Rameshwar Sharma profile...");
    await client.send("Page.navigate", { url: `http://127.0.0.1:${PORT}/profile/rameshwar-sharma-jaipur` });
    await sleep(2000);
    await client.captureScreenshot(path.join(ARTIFACTS_DIR, "13_worker_profile_verified_phone.png"));

    // =======================================================================
    // PART 4: SIGNUP PHONE VERIFICATION & OPTIONAL EMAIL
    // =======================================================================
    console.log("Navigating to /signup...");
    await client.send("Page.navigate", { url: `http://127.0.0.1:${PORT}/signup` });
    await sleep(2000);
    await client.captureScreenshot(path.join(ARTIFACTS_DIR, "14_signup_phone_and_optional_email.png"));

    client.close();
    console.log("=== All 14 visual QA browser screenshots successfully captured ===");
  } finally {
    chromeProc.kill("SIGTERM");
  }
}

main().catch((err) => {
  console.error("Visual QA Error:", err);
  process.exit(1);
});
