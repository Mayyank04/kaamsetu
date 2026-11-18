import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3001";

describe("PHASE 41: Responsive Frontend Reconstruction & Cross-Device Compatibility", () => {
  describe("1. Navigation Reconstruction & Zero-Gap Breakpoint Alignment", () => {
    test("InstitutionalHeader uses lg breakpoint for desktop nav links and mobile drawer toggle", () => {
      const headerPath = path.join(process.cwd(), "src/components/layout/institutional-header.tsx");
      const content = fs.readFileSync(headerPath, "utf-8");

      // Verify desktop navigation uses lg:flex
      assert.match(
        content,
        /hidden\s+lg:flex\s+items-center/i,
        "Desktop navigation links must use lg:flex (1024px+) to prevent gap between 768px and 1280px"
      );

      // Verify mobile hamburger button uses lg:hidden
      assert.match(
        content,
        /lg:hidden\s+flex\s+h-10\s+w-10/i,
        "Mobile hamburger button must use lg:hidden (<1024px) so it is visible across 768px-1023px tablets"
      );

      // Verify no remaining xl:flex gap in navigation
      assert.doesNotMatch(
        content,
        /<nav className="hidden xl:flex/i,
        "Must not hide navigation on tablet viewports between 768px and 1280px"
      );
    });

    test("InstitutionalHeader implements accessibility and drawer lifecycle handlers", () => {
      const headerPath = path.join(process.cwd(), "src/components/layout/institutional-header.tsx");
      const content = fs.readFileSync(headerPath, "utf-8");

      // ARIA attributes
      assert.match(content, /aria-expanded=\{mobileMenuOpen\}/, "Hamburger button must have aria-expanded");
      assert.match(content, /aria-controls="mobile-navigation"/, "Hamburger button must have aria-controls");
      assert.match(content, /aria-label=/i, "Hamburger button must have accessible aria-label");

      // Body scroll lock
      assert.match(
        content,
        /document\.body\.style\.overflow\s*=\s*"hidden"/,
        "Mobile menu must lock body scrolling when open"
      );

      // Escape key listener
      assert.match(
        content,
        /e\.key\s*===\s*"Escape"/,
        "Mobile menu must close on Escape key"
      );

      // Close on route change
      assert.match(
        content,
        /setMobileMenuOpen\(false\)/,
        "Mobile menu must close when pathname changes"
      );

      // Backdrop overlay
      assert.match(
        content,
        /bg-forest-950\/40\s+backdrop-blur-xs\s+lg:hidden/,
        "Mobile drawer must have semi-transparent backdrop overlay"
      );
    });

    test("InstitutionalFooter implements responsive grid stacking", () => {
      const footerPath = path.join(process.cwd(), "src/components/layout/institutional-footer.tsx");
      const content = fs.readFileSync(footerPath, "utf-8");

      assert.match(
        content,
        /grid\s+grid-cols-1\s+sm:grid-cols-2\s+lg:grid-cols-4\s+gap-8/,
        "Footer must stack as 1 col on mobile, 2 cols on tablet, 4 cols on desktop"
      );
    });
  });

  describe("2. Modal & Dialog Foundation Standardization", () => {
    test("DialogContent in dialog.tsx enforces dynamic viewport height and overflow-y-auto", () => {
      const dialogPath = path.join(process.cwd(), "src/components/ui/dialog.tsx");
      const content = fs.readFileSync(dialogPath, "utf-8");

      assert.match(
        content,
        /max-h-\[calc\(100dvh-2rem\)\]/,
        "DialogContent must enforce max-h-[calc(100dvh-2rem)]"
      );
      assert.match(
        content,
        /overflow-y-auto/,
        "DialogContent must enforce overflow-y-auto"
      );
      assert.match(
        content,
        /w-\[calc\(100%-2rem\)\]/,
        "DialogContent must enforce w-[calc(100%-2rem)] for mobile margin clearance"
      );
    });

    test("QRDialog modal enforces independent scroll container and viewport constraint", () => {
      const qrPath = path.join(process.cwd(), "src/components/profile/qr-dialog.tsx");
      const content = fs.readFileSync(qrPath, "utf-8");

      assert.match(
        content,
        /max-h-\[calc\(100dvh-2rem\)\]\s+overflow-y-auto/,
        "QRDialog card must have max-h-[calc(100dvh-2rem)] overflow-y-auto"
      );
    });

    test("BookingRequestDialog modal enforces independent scroll container and responsive padding", () => {
      const bookingPath = path.join(process.cwd(), "src/components/profile/booking-request-dialog.tsx");
      const content = fs.readFileSync(bookingPath, "utf-8");

      assert.match(
        content,
        /max-h-\[calc\(100dvh-2rem\)\]\s+overflow-y-auto/,
        "BookingRequestDialog card must have max-h-[calc(100dvh-2rem)] overflow-y-auto"
      );
      assert.match(
        content,
        /p-4\s+sm:p-6/,
        "BookingRequestDialog card must use responsive padding p-4 sm:p-6"
      );
    });

    test("Onboarding wizard direct auth modal enforces dynamic viewport constraint", () => {
      const wizardPath = path.join(process.cwd(), "src/components/onboarding/onboarding-wizard.tsx");
      const content = fs.readFileSync(wizardPath, "utf-8");

      assert.match(
        content,
        /max-h-\[calc\(100dvh-2rem\)\]\s+overflow-y-auto/,
        "Direct auth modal in onboarding wizard must have max-h-[calc(100dvh-2rem)] overflow-y-auto"
      );
      assert.match(
        content,
        /p-4\s+sm:p-6/,
        "Direct auth modal must use responsive padding p-4 sm:p-6"
      );
    });

    test("Contractor dashboard modals enforce dynamic viewport constraints", () => {
      const contractorPath = path.join(process.cwd(), "src/components/dashboard/contractor-dashboard-view.tsx");
      const content = fs.readFileSync(contractorPath, "utf-8");

      // Upgrade modal
      assert.match(
        content,
        /showUpgradeModal[\s\S]*?max-h-\[calc\(100dvh-2rem\)\]\s+overflow-y-auto/,
        "Upgrade modal must have max-h-[calc(100dvh-2rem)] overflow-y-auto"
      );

      // Invite worker modal
      assert.match(
        content,
        /showInviteWorkerModal[\s\S]*?max-h-\[calc\(100dvh-2rem\)\]\s+overflow-y-auto/,
        "Invite worker modal must have max-h-[calc(100dvh-2rem)] overflow-y-auto"
      );

      // New project modal
      assert.match(
        content,
        /showNewProjectModal[\s\S]*?max-h-\[calc\(100dvh-2rem\)\]\s+overflow-y-auto/,
        "New project modal must have max-h-[calc(100dvh-2rem)] overflow-y-auto"
      );
    });
  });

  describe("3. Responsive Layout & Horizontal Overflow Prevention", () => {
    test("globals.css enforces max-width 100vw and overflow-x hidden on html and body", () => {
      const cssPath = path.join(process.cwd(), "src/app/globals.css");
      const content = fs.readFileSync(cssPath, "utf-8");

      assert.match(content, /html,\s*body\s*\{[\s\S]*?max-width:\s*100vw;/, "html, body must have max-width: 100vw");
      assert.match(content, /html,\s*body\s*\{[\s\S]*?overflow-x:\s*hidden;/, "html, body must have overflow-x: hidden");
    });

    test("Root layout defines standard device-width viewport metadata", () => {
      const layoutPath = path.join(process.cwd(), "src/app/layout.tsx");
      const content = fs.readFileSync(layoutPath, "utf-8");

      assert.match(content, /width:\s*"device-width"/, "Root layout must configure width: 'device-width'");
      assert.match(content, /initialScale:\s*1/, "Root layout must configure initialScale: 1");
    });

    test("Homepage hero metric strip uses responsive grid gap and font size", () => {
      const pagePath = path.join(process.cwd(), "src/app/page.tsx");
      const content = fs.readFileSync(pagePath, "utf-8");

      assert.match(
        content,
        /grid\s+grid-cols-3\s+gap-3\s+sm:gap-6/,
        "Hero metrics strip must use responsive gap-3 sm:gap-6"
      );
      assert.match(
        content,
        /text-xl\s+sm:text-2xl\s+lg:text-3xl/,
        "Hero metrics numbers must scale fluidly across viewports"
      );
    });

    test("SovereignCard uses responsive padding and truncation to prevent blowout on 320px screens", () => {
      const cardPath = path.join(process.cwd(), "src/components/identity/sovereign-card.tsx");
      const content = fs.readFileSync(cardPath, "utf-8");

      assert.match(content, /px-4\s+py-3\s+sm:px-6\s+sm:py-4/, "SovereignCard header must use responsive padding");
      assert.match(content, /p-4\s+sm:p-6/, "SovereignCard body must use responsive padding");
      assert.match(content, /min-w-0\s+flex-1/, "SovereignCard worker details must have min-w-0 flex-1");
    });

    test("Explore page filter dropdowns use responsive multi-column grid", () => {
      const explorePath = path.join(process.cwd(), "src/app/explore/page.tsx");
      const content = fs.readFileSync(explorePath, "utf-8");

      assert.match(
        content,
        /grid\s+grid-cols-1\s+sm:grid-cols-2\s+md:grid-cols-3\s+lg:grid-cols-5\s+gap-3/,
        "Explore filters must scale from 1 col on mobile to 2 on mobile landscape, 3 on tablet, 5 on desktop"
      );
    });
  });

  describe("4. Authentication & Onboarding UX Responsiveness", () => {
    test("Registration page form card uses responsive padding and accessible touch targets", () => {
      const regPath = path.join(process.cwd(), "src/app/auth/register/page.tsx");
      const content = fs.readFileSync(regPath, "utf-8");

      assert.match(content, /p-4\s+sm:p-7/, "Register card must use responsive padding p-4 sm:p-7");
      assert.match(content, /h-11/, "Input fields must have h-11 (44px) for accessible touch targets");
      assert.doesNotMatch(content, /verifyOtp/i, "Registration must not require phone OTP");
    });

    test("Login page form card uses responsive padding and accessible touch targets", () => {
      const loginPath = path.join(process.cwd(), "src/app/login/page.tsx");
      const content = fs.readFileSync(loginPath, "utf-8");

      assert.match(content, /p-4\s+sm:p-7/, "Login card must use responsive padding p-4 sm:p-7");
      assert.match(content, /h-11/, "Login inputs must have h-11 (44px) for accessible touch targets");
    });

    test("Extraction editor uses responsive card padding and stacked location inputs", () => {
      const editorPath = path.join(process.cwd(), "src/components/onboarding/extraction-editor.tsx");
      const content = fs.readFileSync(editorPath, "utf-8");

      assert.match(content, /p-4\s+sm:p-6/, "Extraction editor must use responsive padding p-4 sm:p-6");
      assert.match(
        content,
        /grid\s+grid-cols-1\s+sm:grid-cols-3\s+gap-2/,
        "City, state, pincode inputs must stack on mobile and span 3 columns on tablet/desktop"
      );
    });
  });

  describe("5. Live Server Route Status & Accessibility Verification", () => {
    const routes = [
      { path: "/", name: "Homepage" },
      { path: "/explore", name: "Explore Professionals" },
      { path: "/how-it-works", name: "How It Works" },
      { path: "/onboarding", name: "Worker Onboarding" },
      { path: "/auth/register", name: "Direct Registration" },
      { path: "/login", name: "Sign In" },
      { path: "/terms", name: "Terms of Service" },
      { path: "/privacy", name: "Privacy Policy" },
    ];

    for (const route of routes) {
      test(`GET ${route.path} (${route.name}) returns HTTP 200 with valid HTML`, async () => {
        const res = await fetch(`${BASE_URL}${route.path}`, {
          headers: { "User-Agent": "KaamsetuResponsiveTest/1.0" },
        });

        assert.equal(res.status, 200, `Route ${route.path} must return 200 OK`);
        const html = await res.text();
        assert.ok(html.includes("<!DOCTYPE html>") || html.includes("<html"), `Route ${route.path} must return HTML`);
        assert.ok(html.includes("KAAMSETU"), `Route ${route.path} must contain brand anchor KAAMSETU`);
      });
    }

    test("GET /api/auth/health returns 200 OK OPERATIONAL", async () => {
      const res = await fetch(`${BASE_URL}/api/auth/health`);
      assert.equal(res.status, 200, "Auth health API must return 200 OK");
      const json = await res.json();
      assert.equal(json.operational, true, "Auth health must be operational");
      assert.equal(json.status, "OPERATIONAL", "Auth health status must be OPERATIONAL");
    });
  });
});
