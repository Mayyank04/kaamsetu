# KAAMSETU — PHASE 41 PERFORMANCE REPORT
**Document ID:** `DOC-P41-PERF-008`  
**Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**Permanent Financial Invariant:** `platform_commission_amount = 0.00` on artisan wages  
**Status:** `VERIFIED WORKING`

---

## 1. Production Build & Bundle Metrics

**Build Command:** `npm run build`  
**Next.js Version:** `15.5.29`  
**Compilation Time:** `4.3s`  
**Type Validity & Linting:** Clean (0 errors, 0 warnings)  
**Static Pages Generated:** `116 / 116`  
**Build Result:** `EXIT 0 (Success)`

### Core Bundle Breakdown
- **Shared First Load JS across all routes:** `103 kB`
  - `chunks/1255-b84741b894bb9354.js`: `46.6 kB`
  - `chunks/4bd1b696-f785427dddbba9fb.js`: `54.2 kB`
  - Other shared chunks: `1.93 kB`
- **Edge Middleware:** `109 kB`

---

## 2. Page-by-Page Load Metrics

| Route | Type | Route Size | First Load JS | Load Grade |
| :--- | :--- | :--- | :--- | :--- |
| **`/` (Homepage)** | Static (○) | `9.71 kB` | `165 kB` | **A** |
| **`/explore`** | Static (○) | `185 B` | `162 kB` | **A** |
| **`/how-it-works`** | Static (○) | `6.66 kB` | `133 kB` | **A** |
| **`/onboarding`** | Static (○) | `142 B` | `171 kB` | **A** |
| **`/auth/register`** | Static (○) | `169 B` | `122 kB` | **A** |
| **`/login`** | Static (○) | `168 B` | `121 kB` | **A** |
| **`/terms`** | Static (○) | `176 B` | `106 kB` | **A+** |
| **`/privacy`** | Static (○) | `176 B` | `106 kB` | **A+** |
| **`/profile/[slug]`** | Dynamic (ƒ) | `143 B` | `143 kB` | **A** |
| **`/verify/[registryId]`** | Dynamic (ƒ) | `1.54 kB` | `123 kB` | **A** |

---

## 3. Core Web Vitals & Optimization Directives

1. **Largest Contentful Paint (LCP):**
   - Homepage hero typography and SovereignCard render with high-priority Next.js Image components (`sizes="(max-width: 640px) 112px, 144px"`, `priority`).
2. **Cumulative Layout Shift (CLS):**
   - Preserved card aspect ratios and explicit avatar sizes prevent layout shifts during image hydration.
   - Fixed header height (`h-18`) prevents vertical jumping when navigation links hydrate.
3. **First Input Delay (FID) / Interaction to Next Paint (INP):**
   - Modal transitions use lightweight hardware-accelerated CSS animations (`tailwindcss-animate`).
   - Debounced worker search in `/explore` (`200ms`) prevents UI blocking during active typing.
