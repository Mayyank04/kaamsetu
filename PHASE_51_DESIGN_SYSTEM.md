# KAAMSETU DESIGN SYSTEM — PHASE 51 SPECIFICATION

**Mission:** Every skill deserves to be seen, even without a degree.  
**Aesthetic Principle:** Tactile Institutional Dignity — grounded daylight parchment, crisp 1px boundaries, zero decorative noise, readable across 39 Indian scripts.

---

## 1. Brand & Semantic Color Tokens (`src/app/globals.css`)

| Token Role | CSS Variable | Hex / Value | Usage Rule |
| :--- | :--- | :--- | :--- |
| **Primary** | `--primary` / `#153E35` | `#153E35` | Primary buttons, header anchors, credential banners |
| **Primary Hover** | `--primary-hover` | `#1A4B40` | Hover state for primary controls |
| **Primary Active** | `--primary-active` | `#0F2F28` | Pressed state (`active:scale-[0.99]`) |
| **Background** | `--background` | `#F7F5F0` | Warm Ivory page canvas (never pure cold white for body) |
| **Surface** | `--card` / `--surface` | `#FFFFFF` | Document & form card surface |
| **Elevated Surface** | `--surface-elevated` | `#FCFBF7` | Popovers, dropdown menus, summary strips |
| **Text Primary** | `--foreground` | `#171D1A` | Deep Charcoal high-contrast body text ($>12:1$ on Ivory) |
| **Text Secondary** | `--muted-foreground` | `#414846` | Supporting descriptions, timestamps, hints ($>7:1$) |
| **Accent (Sand)** | `--secondary` | `#E8C999` | Active location highlights, primary credential seals |
| **Border / Divider** | `--border` / `--divider` | `rgba(21, 62, 53, 0.14)` | Standard 1px hairline borders; dividers at 10% |
| **Success** | `--status-success` | `#14532D` | Verified actions, confirmed payouts |
| **Warning** | `--status-warning` | `#854D0E` | Non-dispatch pilot disclosures, draft badges |
| **Error** | `--destructive` | `#991B1B` | Form validation failures, revoked credentials |
| **Information** | `--status-info` | `#153E35` | System guidance and language notices |
| **Disabled** | `--disabled` | `rgba(23, 29, 26, 0.38)` | Disabled control text/surfaces (`opacity-50`) |
| **Focus Ring** | `--ring` | `#153E35` | 2px accessible focus outline (`focus-visible:ring-2`) |

---

## 2. Multilingual Typography & Script Stack

KAAMSETU serves workers reading Latin, Devanagari (Hindi, Marathi, Nepali, Sanskrit), Bengali-Assamese (Assamese, Bengali), Tamil, Telugu, Gujarati, Gurmukhi, Odia, Malayalam, Kannada, and Perso-Arabic (Urdu, Kashmiri).

- **Font Stack (`--font-sans`):** `Plus Jakarta Sans` + `Noto Sans Devanagari` + `Noto Sans Bengali` + `Noto Sans Tamil` + `Noto Sans Telugu` + OS system UI fallbacks.
- **Line Height Rules:**
  - Body text: minimum `1.55` (`leading-relaxed`) to prevent stacked Indic matras (*आ, ई, ा, ि, ী*) from colliding vertically.
  - Display headings: `1.18` with `-0.02em` tracking.
- **Readability Floor:** Primary UI controls, form labels, and mobile body copy target `>= 12px–14px`; eliminate unnecessary `<10px` decorative micro-copy on mobile.

---

## 3. Calibrated Spacing, Radii & Elevation

- **Spacing Scale:** Strict 4px/8px grid (`4, 8, 12, 16, 24, 32, 48, 64px`).
- **Mobile Bottom Clearance:** Root `<main>` applies `pb-20 md:pb-0` plus `env(safe-area-inset-bottom)` so mobile sticky navigation never obscures content.
- **Radii:**
  - `rounded-xs` (`2px`): Monospace codes, registry IDs, tight metadata tags.
  - `rounded-sm` (`4px`): Buttons (`min-h-[44px]` for mobile tap ergonomics), inputs (`h-11`), small badges.
  - `rounded-md` (`6px`): Cards, panels, dialogs.
  - `rounded-xl`, `rounded-2xl`, `rounded-3xl`: **Prohibited** on cards, alerts, and containers.
- **Shadows:** Restrained document elevations (`shadow-sovereign-sm`, `shadow-sovereign-md`). No neon glows or decorative frosted glass blur blobs.

---

## 4. Standardized Component & Anti-Slop Rules

- **Iconography:** Lucide SVG icons in consistent stroke weight. Zero `Sparkles` icons; zero emojis standing in for UI icons.
- **Truthful Labeling:** Self-declared skills are clearly distinct from peer-endorsed or DigiLocker-linked evidence. Illustrative sample cards are labeled `[DEMO RECORD]` or `[ILLUSTRATIVE PROFILE]`.
- **Interactive States:** Every actionable control implements `hover`, `focus-visible`, `active`, `disabled`, and `loading` feedback without moving layout geometry (`no hover:-translate-y` / sliding arrow gimmicks).
- **Reduced Motion:** `@media (prefers-reduced-motion: reduce)` disables all non-essential transitions and animations.
