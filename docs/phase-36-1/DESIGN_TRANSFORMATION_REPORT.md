# KAAMSETU — PHASE 36.1 DESIGN TRANSFORMATION REPORT

**Programme:** KAAMSETU Digital Identity & Worker Empowerment Platform  
**Workstream:** Phase 36.1 — Human-Centred UI Reconstruction  
**Design Standard:** Antigravity Global Agent Instructions & Anti-AI-Slop Directive  
**Specification Reference:** `DESIGN.md` (Standard 2.1)  
**Date:** 16 November 2026  

---

## 1. Overview of Transformation

Phase 36.1 transformed KAAMSETU from a codebase with residual AI-generated UI tropes into an intentionally designed, tactile, and dignified institutional platform. The visual metaphor remains **The Master Artisan's Registry and Guild Certificate**, rooted in paper physical weight, authoritative typography, and clean hairline boundaries.

---

## 2. Core Token Hierarchy

### 2.1 Color Tokens
- **Canvas:** Natural Warm Ivory (`#F7F5F0`) across all public pages, modals, and layouts. Eliminates cold blue screen glare.
- **Structural Anchor:** Deep Forest Green (`#153E35`) for primary actions, navigation headers, trust seals, and key boundaries.
- **Accents:** Warm Sand (`#E8C999`) for trade badges, endorsement ribbons, and certificate highlights.
- **Surfaces:** Card Cream / Card Ivory (`bg-card`) with 1px calibrated hairline borders (`border-forest/15`). All raw `#FFFFFF` backgrounds on dashboard containers were eliminated.

### 2.2 Calibrated Radius Scale
Over-rounded soft corners (`rounded-2xl` and `rounded-3xl`) are a known AI generation tell that makes enterprise and civic platforms look like mobile consumer games. Phase 36.1 established a strict 3-tier radius scale:
- `rounded-xs` (2px): Code chips, monospace data tokens, small technical tags.
- `rounded-sm` (4px): Form inputs, table cells, secondary badges, small icon containers.
- `rounded-md` (6px): Standard cards, metric widgets, modal dialogs, certificate frames.
- `rounded-full`: Circular avatar portraits, status indicator dots.
- ❌ **Prohibited:** `rounded-2xl` (16px) and `rounded-3xl` (24px) are permanently forbidden across `src/`. Zero instances remain.

---

## 3. The Skeleton Loading Architecture

To prevent abrupt layout shifting (CLS) and eliminate unstyled blank spinners, Phase 36.1 introduced a two-layer skeleton system:

### 3.1 Base Primitive (`src/components/ui/skeleton.tsx`)
A minimal, lightweight pulsing element with accessible `aria-hidden="true"`:
```tsx
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-xs bg-forest-900/10 dark:bg-sand-100/10", className)}
      {...props}
    />
  );
}
```

### 3.2 Domain-Specific Geometry Skeletons (`src/components/ui/domain-skeletons.tsx`)
Exact geometric replicas of target components equipped with `role="status"` and `aria-live="polite"`:
1. `WorkerCardSkeleton`: Replicates worker search cards with avatar placeholder, name bar, trade chip, rating line, and action button.
2. `ExploreGridSkeleton`: Multi-column 6-card grid for the `/explore` directory.
3. `ProfileHeroSkeleton`: Replicates worker profile hero header with photo box, name, trade tags, and hire button.
4. `DashboardMetricsSkeleton`: 4-column metric summary boxes for artisan and contractor dashboards.
5. `BookingCardSkeleton`: Customer booking card with reference number, status chip, and action footer.
6. `ContractorRosterSkeleton`: Tabular rows replicating contractor crew rosters.
7. `InstitutionalCohortSkeleton`: Replicates training institute cohort cards and enrollment progress bars.

---

## 4. Before-and-After Component Ledger

| Component | Before Phase 36.1 | After Phase 36.1 |
|---|---|---|
| `login/page.tsx` | `rounded-2xl`, harsh gradient, `ArrowRight group-hover:translate-x-1` | `rounded-md`, flat solid card, stationary `ArrowRight`, Terms & Privacy links |
| `institutional-footer.tsx` | Unused `Sparkles` import, missing legal links | Clean imports, active links to `/terms` and `/privacy` |
| `sovereign-card.tsx` | `Sparkles` icon on gold seal, internal gradient | `Award` seal icon, solid textured card surface |
| `identity-widget.tsx` | Radial dot pattern, `rounded-2xl` | Clean solid background, `rounded-md`, hairline borders |
| `onboarding-wizard.tsx` | `Sparkles` on draft restore, step 2, demo hint; `backdrop-blur-xs` modal | `RotateCcw`, `Mic`, `ShieldCheck`; solid modal with crisp hairlines |
| `page.tsx` (Home) | `Sparkles` import, repetitive `CheckCircle2` in Section 8, bottom CTA gradient | `QrCode` import, domain icons (`Lock`, `Mic`, `QrCode`, `Users`), solid `bg-forest` |
| `contractor-dashboard-view.tsx` | 9 cards/tables with `bg-white rounded-2xl shadow-2xl` | Normalized to `bg-card rounded-md border border-forest/15 shadow-sovereign-sm` |
| `institution-dashboard-view.tsx` | 8 cards/tables with `bg-white rounded-2xl` | Normalized to `bg-card rounded-md border border-forest/15 shadow-sovereign-sm` |
| `professions.ts` | Handloom textiles icon set to `"Sparkles"` | Handloom textiles icon set to `"Scissors"` |

---

## 5. Verification & Testing

Every modification was tested against deterministic automated unit tests and compiled via `next build` (114/114 static pages generated with zero errors). Multi-viewport screenshots confirm visual alignment across desktop, tablet, and mobile displays.
