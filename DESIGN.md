# KAAMSETU DESIGN SYSTEM SPECIFICATION (DESIGN.md)

**Product Mission:** "Every skill deserves to be seen, even without a degree."  
**Domain:** Sovereign Worker Identity, Cryptographic Trust, Fair Labor Economics, Institutional Skill Infrastructure.  
**Operating Classification:** `CLASS_B_CONTROLLED_ROLLOUT` (Guwahati Urban, Assam & Shillong Urban, Meghalaya).  
**Permanent Constitutional Invariant:** `platform_commission_amount = 0.00` on artisan earnings.  
**Specification Version:** 2.0 (Phase 36 Design Intelligence Standard)

---

## 1. BRAND PHILOSOPHY

KAAMSETU is built for informal artisans, master carpenters, solar electricians, masons, plumbers, small contractors, customers, and skill missions.

The platform fundamentally rejects generic SaaS clichés, atmospheric gradient blur blobs, high-gloss glassmorphism, and corporate hype.

Our aesthetic identity is rooted in **Tactile Dignity & Institutional Craftsmanship**:
- **Physical Credential Weight:** Interfaces evoke high-security paper documents, embossed guild seals, and immutable public ledgers.
- **Worker Respect:** Workers are treated as skilled professionals with deep hands-on expertise, not commoditized "gig units" or corporate products.
- **Dignity Over Decoration:** Clean typography, generous margins, tactile hairline borders, and zero decorative noise.
- **Multilingual Equality:** Indian vernaculars (Hindi, Assamese, Bengali, Tamil, Telugu, Marathi) receive equal typographic care, font rendering, and layout space without clipping or awkward line wraps.

---

## 2. VISUAL DIRECTION

- **Metaphor:** The Master Artisan's Registry and Guild Certificate.
- **Atmosphere:** Warm, grounded, authoritative, and human.
- **Canvas:** Natural Warm Ivory parchment canvas (`#F7F5F0`), eliminating cold blue-tinted screen glare.
- **Structural Weight:** Deep Forest Green (`#153E35`) provides steady institutional anchor lines and primary actions.
- **Warmth & Distinction:** Warm Sand (`#E8C999`) provides warm accents, trade specialization highlights, and endorsement ribbons.
- **Surfaces:** Flat, solid paper card surfaces with crisp 1px hairline boundaries (`border-forest/10` to `border-forest/15`). No floating drop shadows or fuzzy blur backgrounds.

---

## 3. COLOR TOKENS

### 3.1 Primary & Canvas Tokens
| Token Name | Hex Code | HSL / CSS Variable | Purpose |
|---|---|---|---|
| `forest` (Primary) | `#153E35` | `167 49% 16%` | Primary buttons, headers, active navigation, trust seals |
| `forest-50` | `#F2F7F5` | `167 30% 96%` | Ultra-light forest tint for subtle row zebra striping |
| `forest-100` | `#D8E7E2` | `167 25% 88%` | Light tint for borders, badge backgrounds |
| `forest-600` | `#1A4B40` | `167 48% 20%` | Primary hover state |
| `forest-900` | `#0B231E` | `167 52% 9%` | Physical credential card backdrops, deep dark accents |
| `ivory` (Background) | `#F7F5F0` | `43 30% 96%` | Universal canvas background, modal backdrop base |
| `sand` (Secondary) | `#E8C999` | `36 63% 75%` | Trade skill badges, endorsement ribbons, seal borders |
| `sand-light` | `#F5E8D3` | `36 60% 90%` | Muted sand tint for informational badges |
| `sand-dark` | `#8C6527` | `36 57% 35%` | High-contrast sand text on light backgrounds |

### 3.2 Semantic & Functional Tokens
| Token Name | Hex Code | Purpose |
|---|---|---|
| `charcoal` (Body Text) | `#171D1A` | High-contrast body typography (WCAG AAA compliant on `#F7F5F0`) |
| `charcoal-muted` | `#4B5551` | Secondary labels, timestamps, metadata, helper copy |
| `border-hairline` | `rgba(21, 62, 53, 0.12)` | Standard 1px calibrated hairline border for cards, inputs, tables |
| `border-subtle` | `rgba(21, 62, 53, 0.06)` | Dividing lines within cards and list items |
| `success-green` | `#14532D` | Confirmed payouts, active dispatch eligibility |
| `warning-amber` | `#78350F` | Non-dispatch geographic notice, unverified trade suggestion |
| `destructive-red` | `#991B1B` | Error states, key revocations, grievance escalations |
| `focus-ring` | `#153E35` | 2px solid offset outline for keyboard accessibility |

---

## 4. TYPOGRAPHY SYSTEM

### 4.1 Typefaces
- **Primary Display & Headings:** `Plus Jakarta Sans`, system-ui, -apple-system, sans-serif (Weights: 600, 700, 800; Letter-spacing: `tracking-tight`).
- **Body & Interface:** `Plus Jakarta Sans`, -apple-system, sans-serif (Weights: 400, 500; Line-height: 1.5).
- **Cryptographic & Financial Values:** `ui-monospace`, `SFMono-Regular`, `Menlo`, `Monaco`, monospace with `tabular-nums` for hashes, UTR numbers, PIN codes, and wage amounts.
- **Multilingual Support:** Natively fallbacks to standard system fonts for Devanagari (Hindi, Marathi), Eastern Nagari (Assamese, Bengali), and Dravidian scripts.

### 4.2 Type Scale
| Role | Desktop Size / Leading | Mobile Size / Leading | Weight | Tracking |
|---|---|---|---|---|
| **Display Hero** | 2.5rem (40px) / 1.15 | 2.0rem (32px) / 1.2 | 800 | `-0.025em` (`tracking-tight`) |
| **H1 (Page Title)** | 2.0rem (32px) / 1.2 | 1.625rem (26px) / 1.25 | 700 | `-0.02em` |
| **H2 (Section Header)** | 1.5rem (24px) / 1.3 | 1.25rem (20px) / 1.3 | 600 | `-0.015em` |
| **H3 (Card Title)** | 1.125rem (18px) / 1.35 | 1.0rem (16px) / 1.4 | 600 | `normal` |
| **Body (Default)** | 0.9375rem (15px) / 1.55 | 0.875rem (14px) / 1.5 | 400 | `normal` |
| **Body (Small / Meta)** | 0.8125rem (13px) / 1.45 | 0.75rem (12px) / 1.4 | 500 | `normal` |
| **Micro Tag / Badge** | 0.6875rem (11px) / 1.3 | 0.6875rem (11px) / 1.3 | 600 | `0.05em` (`tracking-wider` / uppercase) |

---

## 5. SPACING SCALE

Spacing adheres to a strict 4px/8px modular rhythm:
- `4px` (`gap-1`, `p-1`): Micro badge padding, inline icon gap.
- `8px` (`gap-2`, `p-2`): Tag groups, compact button padding, item list spacing.
- `12px` (`gap-3`, `p-3`): Input internal padding, alert box padding.
- `16px` (`gap-4`, `p-4`): Card mobile padding, standard form field spacing.
- `24px` (`gap-6`, `p-6`): Card desktop padding, section sub-block spacing.
- `32px` (`gap-8`, `p-8`): Large card desktop padding, grid gutter spacing.
- `48px` (`py-12`): Section vertical spacing on tablet/desktop.
- `64px`–`80px` (`py-16`–`py-20`): Page major section divides.

---

## 6. LAYOUT GRIDS & EQUAL EDGES

- **Container Max-Widths:**
  - Content / Editorial: `max-w-3xl` (768px)
  - Focused Forms / Onboarding: `max-w-4xl` (896px)
  - Application Dashboards: `max-w-6xl` (1152px)
  - Full Product Layouts: `max-w-7xl` (1280px)
- **Equal Margins & Padding:** Cards within the same section must always share equal horizontal and vertical padding.
- **No Asymmetric Wandering:** Grid items in search listings and dashboard overviews align to strict column baselines.

---

## 7. BREAKPOINTS

| Breakpoint | Width | Typical Target Device |
|---|---|---|
| `sm` | 640px | Large phone landscape / small tablet |
| `md` | 768px | iPad / Tablet portrait |
| `lg` | 1024px | iPad Pro landscape / small laptop |
| `xl` | 1280px | Standard desktop display |
| `2xl` | 1536px | Large desktop monitors |

---

## 8. BORDER & RADIUS RULES

- **Borders:** Tactile, calibrated hairline borders (`border border-forest/12`). No borderless floating elements.
- **Radius Scale:**
  - `rounded-xs` (2px): Code chips, monospace data tokens.
  - `rounded-sm` (4px): Form inputs, table cells, secondary tags.
  - `rounded-md` (6px): Default buttons, small cards, alert boxes.
  - `rounded-xl` (12px): Standard cards, dialog modals.
  - `rounded-2xl` (16px): Sovereign credential certificate cards.
  - `rounded-full`: Circular avatar portraits, status indicator dots.
  - ❌ **Prohibited:** Giant pill shapes (`rounded-full`) on standard cards or rectangular panels.

---

## 9. ELEVATION & SHADOW RULES

- KAAMSETU avoids blurry, multi-layer dramatic drop shadows.
- **Physical Document Elevation:**
  - `shadow-sovereign-sm`: `0 1px 2px rgba(21, 62, 53, 0.05)` (Standard card rest state).
  - `shadow-sovereign-md`: `0 2px 6px rgba(21, 62, 53, 0.08)` (Card hover, open dropdown).
  - `shadow-sovereign-lg`: `0 8px 24px -4px rgba(21, 62, 53, 0.12)` (Dialog modal, popover).
  - `shadow-sovereign-xl`: `0 16px 36px -8px rgba(11, 35, 30, 0.25)` (Sovereign ID certificate card).

---

## 10. BUTTON SYSTEM

| Variant | Styling | States (Hover / Active / Disabled) |
|---|---|---|
| **Primary** | Solid `#153E35` bg, `#F7F5F0` text, `rounded-md`, font-semibold | Hover: `#1A4B40`; Active: scale(0.99); Disabled: opacity 50%, no-drop |
| **Secondary** | Transparent bg, `#153E35` text, `border border-forest/20` | Hover: `bg-forest/5`; Active: `bg-forest/10`; Disabled: opacity 40% |
| **Sand Accent** | `#E8C999` bg, `#153E35` text, font-bold | Hover: `brightness-95`; Active: `brightness-90` |
| **Ghost / Link** | Transparent bg, `#153E35` text, underline on hover | Hover: `text-forest-600 underline` |
| **Destructive** | Solid `#991B1B` bg, `#FFFFFF` text | Hover: `#7F1D1D`; Active: scale(0.99) |
- **Minimum Tap Size:** `min-h-[44px]` and `min-w-[44px]` on touch devices.

---

## 11. FORM INPUTS & INTERACTION STATES

- **Height:** Standard `44px` (`h-11`) for touch accessibility.
- **Default State:** Solid white background, `border border-forest/20`, text `#171D1A`, placeholder `text-charcoal-muted/60`.
- **Focus State:** `border-forest outline-none ring-2 ring-forest/20`.
- **Error State:** `border-red-600 ring-2 ring-red-100 text-red-950`.
- **Help / Validation Copy:** Directly below the input in `0.75rem` (`text-xs`), with explicit error icons for screen readers.

---

## 12. CARDS & BADGES

- **Card Construction:** Solid `#FFFFFF` or `#FDFCF9` background, `border border-forest/12`, `rounded-xl`, `p-6`.
- **Badges:**
  - `Self-Declared Testimony`: `variant="outline"`, `bg-forest/5`, `text-forest`, `border-forest/20`.
  - `Trade suggestion — review and edit`: `variant="outline"`, `bg-amber-500/10`, `text-amber-900`, `border-amber-300`.
  - `Class B Active Dispatch`: `bg-emerald-50`, `text-emerald-900`, `border-emerald-300`.
  - `Non-Dispatch Profile`: `bg-amber-50`, `text-amber-900`, `border-amber-300`.

---

## 13. NAVIGATION

- **Header:** Sticky desktop navbar with crisp 1px bottom border (`border-b border-forest/10`).
- **Brand Title:** `KAAMSETU` in serif display with subtle subtitle `"Digital Identity & Worker Recognition"`.
- **Mobile Navigation:** Dedicated clean slide-over drawer or bottom bar with large 48px touch links. Zero clipped links or awkward horizontal scrolls.
- **Breadcrumbs:** Simple slash-divided hierarchy (`Dashboard / My Crew / Rameshwar Sharma`).

---

## 14. TABLES & DATA LEDGERS

- **Layout:** Monospace numerical alignments for currency, UTRs, and dates.
- **Headers:** `uppercase tracking-wider text-[11px] font-bold text-charcoal-muted bg-forest/5 border-b border-forest/12 py-3 px-4`.
- **Row Alternation:** Subtle zebra striping (`even:bg-forest-50/40`) with hover row highlight (`hover:bg-forest/5`).
- **Mobile Adaptation:** Tables gracefully collapse into card summaries or horizontal overflow with explicit touch scrolling hints.

---

## 15. DIALOGS & MODALS

- **Backdrop:** Deep Forest translucent overlay (`bg-forest/70 backdrop-blur-xs`).
- **Modal Box:** Solid white card, `rounded-2xl`, `border border-forest/20`, max width `max-w-md` to `max-w-xl`.
- **Focus Trap:** Keyboard focus trapped inside dialog; Escape key closes; explicit visible `X` close button at top-right.

---

## 16. ALERTS & NOTICES

- **Informational:** Light sand box (`bg-sand/20 border-sand/50 text-forest`).
- **Warning:** Amber box (`bg-amber-50 border-amber-300 text-amber-950`).
- **Destructive Error:** Light red box (`bg-red-50 border-red-300 text-red-950`).
- **Notice Structure:** Status icon on left, title and description on right, action button inline or right-aligned.

---

## 17. EMPTY STATES

Every empty state must provide:
1. Clear, non-technical explanation of why no records exist.
2. Direct, actionable primary step (e.g. "Add your first crew member", "Search nearby electricians").
3. Honest messaging without artificial placeholder data or fake testimonials.

---

## 18. LOADING STATES & SKELETONS

- In-place pulsing skeleton boxes matching the exact geometry of the loading cards (`bg-forest/5 animate-pulse rounded-md`).
- Explicit `aria-busy="true"` and live region announcement (`aria-live="polite"`).
- Never render blank white screens or generic unstyled spinners.

---

## 19. ICON RULES

- **Strict Purpose:** Icons serve orientation, navigation, or status recognition.
- **No Decorative Lucide Overdose:** Never prefix every headline or list item with arbitrary Lucide icons.
- **Sizing:** Standard `w-4 h-4` (16px) or `w-5 h-5` (20px) aligned to text cap-height.

---

## 20. MOTION RULES

- **Restraint:** Motion is purposeful and rapid (`duration-150` to `duration-200 ease-out`).
- **Transitions:** Color fades (`transition-colors`) and slight scale feedback on button click (`active:scale-[0.99]`).
- **Reduced Motion:** Full support for `prefers-reduced-motion: reduce` disabling all non-essential animations.

---

## 21. ACCESSIBILITY (a11y)

- **Contrast:** Strict WCAG 2.1 AAA for body text (Deep Charcoal `#171D1A` on Warm Ivory `#F7F5F0` = 12.8:1 ratio).
- **Focus Visible:** 2px high-contrast focus rings on all interactive elements.
- **Semantic Tags:** Native `<main>`, `<nav>`, `<header>`, `<footer>`, `<button>`, `<input>`, `<article>`.

---

## 22. RESPONSIVE BEHAVIOR

- Seamless rendering across 1440px (desktop), 1024px (tablet landscape), 768px (tablet portrait), 390px (mobile), and 320px (narrow mobile).
- Zero horizontal window scroll on mobile devices.
- Single-column flow on screens `< 640px`.

---

## 23. CONTENT & COPY PRINCIPLES (HUMANIZER RULES)

- **Authentic Worker Voice:** Speak to workers with dignity and clarity. Avoid calling workers "resources", "leads", or "gig units".
- **No Startup Hype:** Avoid "revolutionary", "seamless", "cutting-edge", "game-changing".
- **Clear Actions:** "Save draft", "Send OTP", "Verify number", "View certificate".

---

## 24. EXAMPLES OF CORRECT VS INCORRECT USAGE

| Context | ❌ Incorrect (AI Slop / Generic SaaS) | ✅ Correct (KAAMSETU Standard) |
|---|---|---|
| **Hero Title** | *"Revolutionize Your Workforce Identity with Sovereign AI"* | *"Your skills deserve recognition."* |
| **Subheading** | *"India's premier all-in-one institutional decentralized workforce enablement ecosystem."* | *"Build a verified profile around the craft you practice—electrician, carpenter, plumber or technician. Share your work with customers and contractors."* |
| **Card Style** | Glossy transparent glass with gradient border and floating blur background | Solid paper surface with crisp 1px hairline border (`border-forest/12`) |
| **Social Proof** | *"Trusted by 500,000+ top enterprises and 5.0 star rated by all users!"* | Truthful, grounded statistics backed by real database records or honest regional pilot indicators |
| **Trade Badge** | `variant="verified"` claiming *"NSQF Level 4 Government Certified"* without proof | `variant="outline"` stating *"Self-Declared Testimony"* and *"Trade suggestion — review and edit"* |
