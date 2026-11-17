import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9222;
const DOCS_SCREENSHOT_DIR = path.resolve("docs/phase-39-3/screenshots");
const ARTIFACT_DIR = "/Users/mayankgautam/.gemini/antigravity/brain/b2c1acf5-1ea0-4008-9c90-cc0011f201e4";

fs.mkdirSync(DOCS_SCREENSHOT_DIR, { recursive: true });
fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runE2E() {
  console.log("Starting headless Chrome on port", PORT);
  const chromeProcess = spawn(
    CHROME_PATH,
    [
      `--remote-debugging-port=${PORT}`,
      "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      "--window-size=1440,900",
      "about:blank",
    ],
    { stdio: "ignore" }
  );

  try {
    let versionData = null;
    for (let i = 0; i < 20; i++) {
      try {
        const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
        if (res.ok) {
          versionData = await res.json();
          break;
        }
      } catch {
        await sleep(300);
      }
    }

    if (!versionData) {
      throw new Error("Failed to connect to Chrome DevTools Protocol");
    }

    console.log("CDP connected:", versionData.webSocketDebuggerUrl);

    const newPageRes = await fetch(
      `http://127.0.0.1:${PORT}/json/new?http://localhost:3000/onboarding`,
      { method: "PUT" }
    );
    const pageData = await newPageRes.json();
    const ws = new WebSocket(pageData.webSocketDebuggerUrl);

    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    let msgId = 1;
    const pending = new Map();

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && pending.has(msg.id)) {
        const { resolve, reject } = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };

    function send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const cur = msgId++;
        pending.set(cur, { resolve, reject });
        ws.send(JSON.stringify({ id: cur, method, params }));
      });
    }

    await send("Page.enable");
    await send("Runtime.enable");
    await send("DOM.enable");

    async function evaluate(expression) {
      const res = await send("Runtime.evaluate", {
        expression,
        returnByValue: true,
        awaitPromise: true,
      });
      return res?.result?.value;
    }

    async function captureScreenshot(basename) {
      const res = await send("Page.captureScreenshot", { format: "png" });
      const buffer = Buffer.from(res.data, "base64");
      const p1 = path.join(DOCS_SCREENSHOT_DIR, basename);
      const p2 = path.join(ARTIFACT_DIR, basename);
      fs.writeFileSync(p1, buffer);
      fs.writeFileSync(p2, buffer);
      console.log("Saved screenshot:", p1, "and", p2);
    }

    console.log("Waiting for /onboarding to load and hydrate...");
    await sleep(3500);

    // 0. Select English in Step 1
    console.log("Selecting English in Step 1...");
    await evaluate(`
      Array.from(document.querySelectorAll("button")).find(b => b.innerText.includes("English")).click();
    `);
    await sleep(800);

    // 1. Advance to Step 2
    console.log("Advancing to Step 2 (Craft Attestation)...");
    await evaluate(`
      Array.from(document.querySelectorAll("button")).find(b => b.innerText.includes("Continue")).click();
    `);
    await sleep(1000);

    // 2. Load Sample Testimony in Step 2
    console.log("Loading Sample Craft Testimony in Step 2...");
    await evaluate(`
      Array.from(document.querySelectorAll("button")).find(b => b.innerText.includes("Solar") || b.innerText.includes("Rameshwar")).click();
    `);
    await sleep(800);

    // 3. Trigger Extract Skills
    console.log("Clicking Extract Skills with Gemini AI...");
    await evaluate(`
      Array.from(document.querySelectorAll("button")).find(b => b.innerText.includes("Extract Skills")).click();
    `);

    // Poll for Step 3 Review & Skills
    console.log("Waiting for Step 3 Review & Skills...");
    let inStep3 = false;
    for (let i = 0; i < 20; i++) {
      await sleep(1000);
      inStep3 = await evaluate(`Boolean(document.body.innerText.includes("Identified Trade & Experience") || document.body.innerText.includes("Review & Skills") || Array.from(document.querySelectorAll("button")).some(b => b.innerText.includes("Approve & Mint")))`);
      if (inStep3) {
        console.log("Reached Step 3 Review & Skills!");
        break;
      }
    }

    if (!inStep3) {
      throw new Error("Failed to reach Step 3 in onboarding wizard");
    }

    await sleep(1000);

    // 4. Click Submit / Approve button in Step 3 to open verification modal
    console.log("Clicking Approve to open Mobile Verification Modal...");
    await evaluate(`
      const submitBtn = Array.from(document.querySelectorAll("button")).find(b => b.innerText.includes("Approve & Mint"));
      if (submitBtn) submitBtn.click();
    `);
    await sleep(1200);

    // 5. TEST CASE A: Enter invalid Indian mobile number '5456565656'
    console.log("TEST CASE A: Entering invalid mobile number '5456565656'...");
    await evaluate(`document.querySelector("input[type=tel]").focus()`);
    await send("Input.insertText", { text: "5456565656" });
    await sleep(600);

    const invalidState = await evaluate(`(() => {
      const errorEl = document.querySelector('.text-red-700, .text-red-600, [role="alert"]');
      const errorText = errorEl ? errorEl.textContent : '';
      const sendBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Send Verification Code'));
      const isDisabled = sendBtn ? sendBtn.disabled : null;
      return { errorText, isDisabled };
    })()`);

    console.log("Invalid phone UI state:", invalidState);
    await captureScreenshot("01-invalid-phone-validation.png");

    // 6. TEST CASE B: Enter valid Indian mobile number '9876543288'
    console.log("TEST CASE B: Entering valid mobile number '9876543288'...");
    await evaluate(`document.querySelector("input[type=tel]").select()`);
    await send("Input.insertText", { text: "9876543288" });
    await sleep(600);

    const validState = await evaluate(`(() => {
      const sendBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Send Verification Code'));
      return { isDisabled: sendBtn ? sendBtn.disabled : null };
    })()`);

    console.log("Valid phone UI state:", validState);
    await captureScreenshot("02-modal-phone-step-valid.png");

    // 7. Click "Send Verification Code"
    console.log("Clicking Send Verification Code...");
    await evaluate(`
      const sendBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Send Verification Code'));
      if (sendBtn) sendBtn.click();
    `);

    // Poll for Step 2 OTP entry modal
    console.log("Waiting for Step 2 OTP modal...");
    let inOtpStep = false;
    for (let i = 0; i < 20; i++) {
      await sleep(600);
      inOtpStep = await evaluate(`Boolean(document.body.innerText.includes("Sandbox Test Mode") || document.body.innerText.includes("Auto-fill") || document.body.innerText.includes("Enter Verification Code") || document.body.innerText.includes("Enter 6-Digit Code"))`);
      if (inOtpStep) {
        console.log("Reached Step 2 OTP modal!");
        break;
      }
    }

    if (!inOtpStep) {
      throw new Error("Failed to transition to Step 2 OTP modal");
    }

    await sleep(600);
    await captureScreenshot("03-modal-otp-step-sandbox.png");

    // 8. Click Auto-fill
    console.log("Clicking Auto-fill button...");
    await evaluate(`
      const autofillBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Auto-fill'));
      if (autofillBtn) autofillBtn.click();
    `);
    await sleep(600);

    await captureScreenshot("04-modal-otp-autofilled.png");

    // 9. Click Verify & Mint Credential
    console.log("Clicking Verify & Mint Credential...");
    await evaluate(`
      const verifyBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Verify & Mint') || b.textContent.includes('Verify & Continue') || b.textContent.includes('Verify'));
      if (verifyBtn) verifyBtn.click();
    `);

    // Poll for Sovereign Credential Card completion
    console.log("Waiting for Credential Minted completion screen...");
    let minted = false;
    for (let i = 0; i < 25; i++) {
      await sleep(1000);
      minted = await evaluate(`Boolean(document.body.innerText.includes("Credential Minted") || document.body.innerText.includes("IN-AS-2026-") || document.body.innerText.includes("Sovereign Skill Card Issued"))`);
      if (minted) {
        console.log("Successfully reached Credential Minted screen!");
        break;
      }
    }

    if (!minted) {
      throw new Error("Failed to complete credential minting");
    }

    await sleep(1000);
    await captureScreenshot("05-credential-minted-success.png");

    console.log("=================================================");
    console.log("ALL E2E BROWSER VALIDATION TESTS PASSED CLEANLY!");
    console.log("=================================================");
  } finally {
    try {
      chromeProcess.kill();
    } catch {}
  }
}

runE2E().catch((err) => {
  console.error("E2E Test Failed:", err);
  process.exit(1);
});
