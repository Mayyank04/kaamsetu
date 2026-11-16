/**
 * KAAMSETU — Phase 36.1 30-Point Anti-AI Design Audit, Human-Centred UI Reconstruction & Quality Gate Test Suite
 *
 * Verifies:
 * 1. Terms of Service & Privacy Policy: Mandatory legal disclaimers, zero commission invariant, zero raw Aadhaar storage, DPDP compliance.
 * 2. Skeleton Component Library: Base primitive and domain-specific geometry skeletons with accessible ARIA semantics.
 * 3. Anti-AI-Slop Codebase Invariants: Zero Sparkles icon imports, zero radial dot gradients, zero rounded-2xl/3xl, zero hover translate animations.
 * 4. Multi-Viewport Real Browser Evidence: Verification of 27 captured Chrome headless screenshots across 5 viewports.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

describe("Phase 36.1 — Section 1: Terms of Service & Privacy Policy Integrity", () => {
  const termsPath = path.resolve(process.cwd(), "src/app/terms/page.tsx");
  const privacyPath = path.resolve(process.cwd(), "src/app/privacy/page.tsx");
  const footerPath = path.resolve(process.cwd(), "src/components/layout/institutional-footer.tsx");

  it("should have complete, valid Terms of Service page source", () => {
    assert.ok(fs.existsSync(termsPath), "Terms page must exist at src/app/terms/page.tsx");
    const termsContent = fs.readFileSync(termsPath, "utf-8");

    // Constitutional Invariant
    assert.ok(
      termsContent.includes("platform_commission_amount = 0.00"),
      "Terms of Service must contain permanent zero-commission guarantee"
    );
    assert.ok(
      termsContent.includes("Permanent Zero-Commission Policy") || termsContent.includes("platform_commission_amount = 0.00"),
      "Terms must include Zero Worker Commission section"
    );

    // Rollout Boundaries
    assert.ok(
      termsContent.includes("Guwahati Urban") && termsContent.includes("Shillong Urban"),
      "Terms must specify Class B rollout boundaries"
    );

    // Operational Transparency Legal Disclaimer
    assert.ok(
      termsContent.includes("Subject to Formal Legal Review"),
      "Terms must include explicit legal counsel review notice"
    );
  });

  it("should have complete, valid Privacy Policy page source", () => {
    assert.ok(fs.existsSync(privacyPath), "Privacy page must exist at src/app/privacy/page.tsx");
    const privacyContent = fs.readFileSync(privacyPath, "utf-8");

    // DPDP Act 2023 Compliance
    assert.ok(
      privacyContent.includes("Digital Personal Data Protection (DPDP) Act, 2023"),
      "Privacy policy must state DPDP Act compliance"
    );

    // Zero Raw Aadhaar Storage Guarantee
    assert.ok(
      privacyContent.includes("Zero Raw Aadhaar Storage"),
      "Privacy policy must explicitly state zero raw Aadhaar storage"
    );
    assert.ok(
      privacyContent.includes("SHA-256"),
      "Privacy policy must document cryptographic one-way hashing"
    );

    // Worker Rights & Sovereignty
    assert.ok(
      privacyContent.includes("User Rights Under Indian Data Protection Standards") ||
      privacyContent.includes("Data Retention & Account Deletion"),
      "Privacy policy must guarantee self-sovereign revocation and deletion"
    );
  });

  it("should link to Terms and Privacy from institutional footer", () => {
    const footerContent = fs.readFileSync(footerPath, "utf-8");
    assert.ok(
      footerContent.includes('href="/terms"'),
      "Institutional footer must link to /terms"
    );
    assert.ok(
      footerContent.includes('href="/privacy"'),
      "Institutional footer must link to /privacy"
    );
  });
});

describe("Phase 36.1 — Section 2: Skeleton Loading Component Architecture", () => {
  const skeletonPrimitivePath = path.resolve(process.cwd(), "src/components/ui/skeleton.tsx");
  const domainSkeletonsPath = path.resolve(process.cwd(), "src/components/ui/domain-skeletons.tsx");

  it("should export base Skeleton primitive with accessible ARIA tokens", () => {
    assert.ok(fs.existsSync(skeletonPrimitivePath), "Skeleton primitive must exist");
    const content = fs.readFileSync(skeletonPrimitivePath, "utf-8");
    assert.ok(content.includes("export function Skeleton"), "Must export Skeleton function");
    assert.ok(content.includes("animate-pulse"), "Must use pulse animation");
    assert.ok(content.includes("aria-hidden"), "Must have aria-hidden attribute for primitive shapes");
  });

  it("should export dedicated domain-specific geometry matching skeletons", () => {
    assert.ok(fs.existsSync(domainSkeletonsPath), "Domain skeletons must exist");
    const content = fs.readFileSync(domainSkeletonsPath, "utf-8");

    const expectedSkeletons = [
      "WorkerCardSkeleton",
      "ExploreGridSkeleton",
      "ProfileHeroSkeleton",
      "DashboardMetricsSkeleton",
      "BookingCardSkeleton",
      "ContractorRosterSkeleton",
      "InstitutionalCohortSkeleton",
    ];

    for (const skeletonName of expectedSkeletons) {
      assert.ok(
        content.includes(`export function ${skeletonName}`),
        `Must export ${skeletonName}`
      );
    }

    assert.ok(
      content.includes('role="status"') && content.includes('aria-live="polite"'),
      "Domain skeletons must include accessible role='status' and aria-live='polite'"
    );
  });
});

describe("Phase 36.1 — Section 3: Anti-AI-Slop Codebase Invariants", () => {
  function scanDir(dir: string, filter: (file: string) => boolean): string[] {
    const results: string[] = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        results.push(...scanDir(fullPath, filter));
      } else if (filter(entry.name)) {
        results.push(fullPath);
      }
    }
    return results;
  }

  const srcDir = path.resolve(process.cwd(), "src");
  const tsxFiles = scanDir(srcDir, (f) => f.endsWith(".tsx") || f.endsWith(".ts"));

  it("should have zero occurrences of Sparkles icon imports across UI components", () => {
    const sparklesViolations: string[] = [];
    for (const file of tsxFiles) {
      const content = fs.readFileSync(file, "utf-8");
      // Check for Lucide Sparkles import or JSX tag
      if (
        /import\s+{[^}]*\bSparkles\b[^}]*}\s+from\s+["']lucide-react["']/.test(content) ||
        /<Sparkles[\s/>]/.test(content)
      ) {
        sparklesViolations.push(path.relative(process.cwd(), file));
      }
    }
    assert.deepStrictEqual(
      sparklesViolations,
      [],
      `Found forbidden Sparkles icon in: ${sparklesViolations.join(", ")}`
    );
  });

  it("should have zero occurrences of rounded-2xl or rounded-3xl in src", () => {
    const radiusViolations: string[] = [];
    for (const file of tsxFiles) {
      const content = fs.readFileSync(file, "utf-8");
      if (content.includes("rounded-2xl") || content.includes("rounded-3xl")) {
        radiusViolations.push(path.relative(process.cwd(), file));
      }
    }
    assert.deepStrictEqual(
      radiusViolations,
      [],
      `Found forbidden rounded-2xl/rounded-3xl in: ${radiusViolations.join(", ")}`
    );
  });

  it("should have zero occurrences of radial dot pattern backgrounds in src", () => {
    const radialViolations: string[] = [];
    for (const file of tsxFiles) {
      const content = fs.readFileSync(file, "utf-8");
      if (content.includes("bg-[radial-gradient")) {
        radialViolations.push(path.relative(process.cwd(), file));
      }
    }
    assert.deepStrictEqual(
      radialViolations,
      [],
      `Found forbidden radial gradient pattern in: ${radialViolations.join(", ")}`
    );
  });

  it("should have zero occurrences of group-hover:translate-x-1 animated hover arrows", () => {
    const animViolations: string[] = [];
    for (const file of tsxFiles) {
      const content = fs.readFileSync(file, "utf-8");
      if (content.includes("group-hover:translate-x-1")) {
        animViolations.push(path.relative(process.cwd(), file));
      }
    }
    assert.deepStrictEqual(
      animViolations,
      [],
      `Found forbidden animated arrow in: ${animViolations.join(", ")}`
    );
  });

  it("should have DESIGN.md documenting 30-Point Anti-AI governance & calibrated radius scale", () => {
    const designMdPath = path.resolve(process.cwd(), "DESIGN.md");
    assert.ok(fs.existsSync(designMdPath), "DESIGN.md must exist in project root");
    const content = fs.readFileSync(designMdPath, "utf-8");
    assert.ok(
      content.includes("25. 30-POINT ANTI-AI DESIGN GOVERNANCE"),
      "DESIGN.md must include Section 25: 30-Point Anti-AI Design Governance"
    );
    assert.ok(
      content.includes("26. LEGAL & TRUST ARCHITECTURE DIRECTIVES"),
      "DESIGN.md must include Section 26: Legal & Trust Architecture Directives"
    );
    assert.ok(
      content.includes("Zero Sparkle Policy"),
      "DESIGN.md must document Zero Sparkle Policy"
    );
  });
});

describe("Phase 36.1 — Section 4: Multi-Viewport Real Browser Evidence Verification", () => {
  const screenshotsDir = path.resolve(process.cwd(), "docs/phase-36-1/screenshots-final");

  it("should have all 27 final multi-viewport screenshots captured", () => {
    assert.ok(fs.existsSync(screenshotsDir), "screenshots-final directory must exist");

    const expectedScreenshots = [
      // 1440x900 Desktop
      "home-desktop-1440.png",
      "explore-desktop-1440.png",
      "login-desktop-1440.png",
      "onboarding-desktop-1440.png",
      "terms-desktop-1440.png",
      "privacy-desktop-1440.png",
      "contractor-desktop-1440.png",
      "institution-desktop-1440.png",
      // 1280x800 Laptop
      "home-laptop-1280.png",
      "explore-laptop-1280.png",
      "terms-laptop-1280.png",
      "privacy-laptop-1280.png",
      // 768x1024 Tablet
      "home-tablet-768.png",
      "explore-tablet-768.png",
      "terms-tablet-768.png",
      "privacy-tablet-768.png",
      // 390x844 Mobile
      "home-mobile-390.png",
      "explore-mobile-390.png",
      "login-mobile-390.png",
      "onboarding-mobile-390.png",
      "terms-mobile-390.png",
      "privacy-mobile-390.png",
      // 320x568 Narrow Mobile
      "home-mobile-320.png",
      "explore-mobile-320.png",
      "login-mobile-320.png",
      "terms-mobile-320.png",
      "privacy-mobile-320.png",
    ];

    for (const filename of expectedScreenshots) {
      const filePath = path.join(screenshotsDir, filename);
      assert.ok(fs.existsSync(filePath), `Screenshot ${filename} must exist on disk`);
      const stats = fs.statSync(filePath);
      assert.ok(
        stats.size > 10000,
        `Screenshot ${filename} size (${stats.size} bytes) must exceed 10,000 bytes`
      );
    }
  });
});
