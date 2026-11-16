# KAAMSETU — PHASE 36.1 INITIAL VISUAL AUDIT

**Programme:** KAAMSETU Digital Identity & Worker Empowerment Platform  
**Workstream:** Phase 36.1 — 30-Point Anti-AI Design Audit, Human-Centred UI Reconstruction & Quality Gate  
**Application URL:** `https://kaamsetu-neon.vercel.app`  
**Starting Baseline:** Commit `468fb92` on branch `phase-36-1-anti-ai-ui-reconstruction`  
**Operating Classification:** `CLASS_B_CONTROLLED_ROLLOUT` (Guwahati Urban & Shillong Urban)  
**Constitutional Invariant:** `platform_commission_amount = 0.00` permanently on artisan wages  
**Audit Date:** 16 November 2026  

---

## 1. Executive Summary

Prior to Phase 36.1 reconstruction, an independent visual inspection of the running KAAMSETU application was conducted across desktop (1440×900) and mobile (390×844) viewports. Screenshots were captured directly into `docs/phase-36-1/screenshots-initial/`.

While previous phases established functional foundations (Ed25519 asymmetric signatures, database invariants, geographic boundary gates, and rate-limiting fail-closed mechanisms), visual inspection revealed residual AI-generated UI tropes that undermined the product's institutional gravity and worker dignity.

Specific anti-patterns detected during initial inspection:
1. **Pervasive Lucide `Sparkles` Icon Overuse:** Used across 15+ components to represent AI transcription, draft restoration, sovereign credential cards, contractor matching, and portfolio additions.
2. **Oversized Soft Rounded Corners (`rounded-2xl`, `rounded-3xl`):** Applied uniformly to dashboard cards, modal containers, and metric summary boxes, giving the interface an unanchored, "toy-like" software appearance.
3. **Radial Dot Background Patterns (`bg-[radial-gradient]`):** Decorative dot grids present in identity widgets and onboarding success cards.
4. **Harsh and Unbalanced Gradients:** Multi-stop background gradients on login and footer call-to-action blocks.
5. **Micro-Interaction AI Gimmicks:** Animated sliding arrow icons (`group-hover:translate-x-1`) and liquid glass modal backdrops (`backdrop-blur-xs`).
6. **Missing Formal Legal Trust Anchors:** Absence of dedicated Terms of Service (`/terms`) and Privacy Policy (`/privacy`) routes linked from platform footers.
7. **Absence of Geometry-Matching Skeleton Loaders:** Sudden layout shifts during async data fetching.

---

## 2. Page-by-Page Baseline Inspection

### 2.1 Landing Page (`/`)
- **Desktop (1440px):**
  - Hero section was grounded in copy, but Section 8 used repetitive `CheckCircle2` icons.
  - Section 9 banner utilized an unnecessary two-stop gradient.
  - Metric containers used oversized `rounded-2xl` corners.
- **Mobile (390px):**
  - Hero stacked cleanly, but card padding varied inconsistently between trade categories.
  - Initial screenshot: `docs/phase-36-1/screenshots-initial/home-desktop-1440.png`, `home-mobile-390.png`.

### 2.2 Worker Directory & Discovery (`/explore`)
- **Desktop (1440px):**
  - Worker cards displayed authentic trade data, but card containers utilized `rounded-2xl` borders.
  - Empty or initial loading state lacked geometry-matched skeletons, causing content flashing.
- **Mobile (390px):**
  - Search input and trade filter chips collapsed well, but filter pill padding was uneven.
  - Initial screenshot: `docs/phase-36-1/screenshots-initial/explore-desktop-1440.png`, `explore-mobile-390.png`.

### 2.3 Authentication & Login (`/login`)
- **Desktop (1440px):**
  - The login card featured an animated sliding arrow (`group-hover:translate-x-1`) on the primary submit button.
  - Outer card wrapper used `rounded-2xl` and a multi-layer gradient backdrop.
  - Footer lacked persistent legal links to Terms of Service and Privacy Policy.
- **Mobile (390px):**
  - Form layout functioned, but modal card took 95% screen width with excessive internal padding.
  - Initial screenshot: `docs/phase-36-1/screenshots-initial/login-desktop-1440.png`, `login-mobile-390.png`.

### 2.4 Worker Onboarding Wizard (`/onboarding`)
- **Desktop (1440px):**
  - Voice recording step displayed `Sparkles` icon next to voice attestation.
  - Draft restoration banner used `Sparkles` icon rather than an operational restore icon.
  - Modal overlay used `backdrop-blur-xs` without crisp opacity boundary.
- **Mobile (390px):**
  - Multi-step stepper was readable, but trade suggestion label used em dashes (`—`) rather than clean colons.
  - Initial screenshot: `docs/phase-36-1/screenshots-initial/onboarding-desktop-1440.png`, `onboarding-mobile-390.png`.

### 2.5 Enterprise Contractor Dashboard (`/contractor/dashboard`)
- **Desktop (1440px):**
  - Raw `bg-white` panels clashed with the Warm Ivory (`#F7F5F0`) canvas token.
  - Roster containers, billing breakdown tables, and metric cards all used `rounded-2xl`.
  - Initial screenshot: `docs/phase-36-1/screenshots-initial/contractor-desktop-1440.png`.

### 2.6 State Institutional Dashboard (`/institution/dashboard`)
- **Desktop (1440px):**
  - Trainee outcome metric cards used uncalibrated `rounded-2xl` corners.
  - Cohort dossier selector used generic white cards without calibrated hairline borders.
  - Initial screenshot: `docs/phase-36-1/screenshots-initial/institution-desktop-1440.png`.

---

## 3. Baseline Defect Ledger

| Defect ID | Affected Component / Surface | Observed AI Pattern | Target Resolution |
|---|---|---|---|
| VIS-01 | `src/app/login/page.tsx` | Animated hover arrow (`group-hover:translate-x-1`), `rounded-2xl`, harsh gradient | Remove animation, normalize to `rounded-md`, solid card background |
| VIS-02 | `src/components/layout/institutional-footer.tsx` | Missing links to Terms and Privacy | Add permanent links to `/terms` and `/privacy` |
| VIS-03 | `src/components/onboarding/onboarding-wizard.tsx` | `Sparkles` icon on draft restore, step 2, and demo hint | Replace with `RotateCcw`, `Mic`, `ShieldCheck` |
| VIS-04 | `src/components/identity/sovereign-card.tsx` | `Sparkles` icon on gold seal | Replace with `Award` seal icon |
| VIS-05 | `src/components/dashboard/identity-widget.tsx` | Radial dot pattern, `rounded-2xl` | Remove dot pattern, normalize to `rounded-md` |
| VIS-06 | `src/components/onboarding/sovereign-success-card.tsx` | Radial dot pattern, `Sparkles` | Remove dot pattern, replace with `ShieldCheck` |
| VIS-07 | `src/components/dashboard/contractor-dashboard-view.tsx` | `rounded-2xl` on 9 cards/tables, raw `bg-white` | Replace with `rounded-md`, `bg-card`, calibrated hairlines |
| VIS-08 | `src/components/dashboard/institution-dashboard-view.tsx` | `rounded-2xl` on 8 cards/tables, raw `bg-white` | Replace with `rounded-md`, `bg-card`, calibrated hairlines |
| VIS-09 | Universal Async Pages | No geometry-matching skeleton loaders | Implement `src/components/ui/domain-skeletons.tsx` |
| VIS-10 | App Root | Missing `/terms` and `/privacy` routes | Implement complete, legally truthful pages |

---

## 4. Conclusion

The initial audit confirmed that the application's foundational data structures and security controls were robust, but the frontend suffered from accumulated visual slop. Phase 36.1 was therefore scoped to execute direct codebase modifications eliminating all identified tropes, establishing geometry skeletons, authoring legal terms, and verifying results in real Chrome across 5 viewports.
