---
name: Sovereign Trust
colors:
  surface: '#f5fbf6'
  surface-dim: '#d6dbd7'
  surface-bright: '#f5fbf6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff5f0'
  surface-container: '#e9efea'
  surface-container-high: '#e4eae5'
  surface-container-highest: '#dee4df'
  on-surface: '#171d1a'
  on-surface-variant: '#414846'
  inverse-surface: '#2c322f'
  inverse-on-surface: '#ecf2ed'
  outline: '#717976'
  outline-variant: '#c0c8c4'
  surface-tint: '#3e665b'
  primary: '#002820'
  on-primary: '#ffffff'
  primary-container: '#153e35'
  on-primary-container: '#80a99d'
  inverse-primary: '#a5cfc3'
  secondary: '#725b34'
  on-secondary: '#ffffff'
  secondary-container: '#fbdbaa'
  on-secondary-container: '#765f38'
  tertiary: '#440f00'
  on-tertiary: '#ffffff'
  tertiary-container: '#652107'
  on-tertiary-container: '#ea8665'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c1ecde'
  primary-fixed-dim: '#a5cfc3'
  on-primary-fixed: '#00201a'
  on-primary-fixed-variant: '#264e44'
  secondary-fixed: '#fedead'
  secondary-fixed-dim: '#e1c293'
  on-secondary-fixed: '#271900'
  on-secondary-fixed-variant: '#58431f'
  tertiary-fixed: '#ffdbd0'
  tertiary-fixed-dim: '#ffb59d'
  on-tertiary-fixed: '#390b00'
  on-tertiary-fixed-variant: '#7a3015'
  background: '#f5fbf6'
  on-background: '#171d1a'
  surface-variant: '#dee4df'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 34px
    fontWeight: '700'
    lineHeight: 42px
  display-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 38px
    fontWeight: '700'
    lineHeight: 46px
  display-md-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 20px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system establishes an institutional yet deeply human digital identity infrastructure for India's skilled, informal, and independent workforce. Combining the structural rigor of tier-one fintech with the warmth and dignity of an enduring civic institution, the UI projects authority, economic empowerment, and verified credibility.

The aesthetic fuses modern minimalist structural discipline with subtle tactile elevation. It rejects generic gig-economy visual tropes, hyper-saturated tech gradients, and playful cartoonish illustrations in favor of:
- Architectural grid balance with generous whitespace to convey transparency and prestige.
- Precision micro-borders (1px subtle rules) framing high-density identity modules and verification indicators.
- Curated authentic Indian workforce imagery treated with natural contrast and dignity, avoiding staged corporate tropes.
- High-legibility credentialing tokens, micro-badges, and quantified score displays designed to feel like unforgeable bank notes or digital sovereign credentials.

## Colors

The palette balances sovereign gravity with natural, grounded warmth. It evokes both high-trust institutional finance and the tactile reality of physical crafts and trade environments.

- **Primary (#153E35 — Deep Forest Green):** The bedrock anchor. Communicates permanence, validation, security, and institutional sovereign authority. Used for primary navigation, critical interactive states, high-level headers, and credential badges.
- **Secondary (#E8C999 — Warm Sand):** The warmth bridge. Provides an editorial counterbalance to forest green, lending tactile prestige to premium tiers, score rings, highlight containers, and secondary action surfaces.
- **Tertiary (#C46849 — Earthy Terracotta):** The vital spark. Used for urgent verification alerts, dynamic credential milestones, and high-impact calls-to-action requiring distinction from institutional green.
- **Accent Muted Sage (#5E8271):** A balancing tint used for positive verification states, subtle status chips, active tabs, and secondary data visualizations.
- **Background (#F7F5F0 — Warm Ivory):** Replaces clinical sterile white with an organic, archival tone reminiscent of high-grade paper credentials, eliminating glare while improving reading endurance.
- **Text & Foreground (#252B28 — Charcoal):** A softened black that maintains peak legibility without the harshness of `#000000`.

## Typography

The type system is powered entirely by **Plus Jakarta Sans**, chosen for its modern geometric foundation infused with subtle humanist contours. This provides an editorial, structured voice that performs reliably across vernacular transliterations and multilingual layouts typical in nationwide deployment.

- **Headlines & Display:** Set in confident weights (SemiBold 600 to Bold 700) with compact line-heights and tight character metrics, establishing institutional gravitas across landing, identity verification dashboards, and score breakdowns.
- **Body:** Set at 15px and 18px in Regular weight, utilizing generous line spacing to support prolonged reading comfort on both budget-tier smartphones and high-resolution desktop terminals.
- **Labels & Micro-Tokens:** Applied with uppercase or sentence-case SemiBold/Bold styling to frame metadata, verification states, and skill endorsement badges without visual clutter.

## Layout & Spacing

The layout is built around a rigorous 12-column responsive fluid grid on desktop (max content container: 1240px) with 24px (`1.5rem`) gutters and outer page margins of 32px (`2rem`). For tablet and mobile, the grid condenses into 8-column and 4-column layouts respectively, with margins tightening to 16px (`1rem`).

Rhythm guidelines:
- **Structural Integrity:** Space is never treated as void; it acts as an active grouping instrument. Components rely on proportional vertical stepping: tight internal padding (`space-xs` to `space-sm`) for atomic tags and data rows; expansive structural separation (`space-lg` to `space-xl`) between credential blocks, experience timelines, and metric cards.
- **Reflow Architecture:** On mobile viewports, dual-column verification cards reflow into unified vertical credential ribbons to prevent compressed data truncation and ensure finger-friendly scan surfaces.

## Elevation & Depth

Visual hierarchy rejects exaggerated, generic drop shadows in favor of **calibrated tonal layers paired with micro-borders and soft ambient diffusion**.

- **Canvas Base:** Flat Warm Ivory (`#F7F5F0`).
- **Surface Level 1 (Primary Cards & Identity Panels):** Pure solid white (`#FFFFFF`) with a delicate 1px boundary stroke in `#153E35` at 8% opacity. This produces a crisp paper-like separation without artificial drop shadows.
- **Surface Level 2 (Floating Modals, Verification Drawers, Credential Badges):** Layered white background underpinned by an ambient, tinted shadow: `box-shadow: 0 8px 24px -4px rgba(21, 62, 53, 0.08), 0 2px 6px -1px rgba(21, 62, 53, 0.04)`. The forest-green tint grounds the elevation within the brand’s color envelope rather than muddy grey.
- **Inset Credential Wells (Scores, Verification Checklists):** Toned surface tint using `#E8C999` at 12% opacity or `#153E35` at 3% opacity with an interior 1px micro-border, giving the tactile sensation of an embossed paper document or security seal.

## Shapes

The design system employs a **Soft (Level 1)** geometric language. Standard corners feature `0.25rem` (4px) curvature, moving to `0.5rem` (8px) for containers and cards, and `0.75rem` (12px) for contextual modal dialogs and identification shields.

This controlled radius retains the disciplined, civic silhouette of certificates, smart cards, and financial instruments. It decisively rejects the hyper-rounded, toy-like appearance of consumer lifestyle apps, establishing formal respect for the worker's digital credential.

## Components

### Buttons
- **Primary Institutional Button:** Filled Deep Forest Green (`#153E35`) background, Warm Ivory (`#F7F5F0`) label text, 4px border-radius, minimum height 48px. Includes 1px micro-border in Forest Green. Hover transforms through a deep, subtle luminance lift (`#1A4B40`).
- **Secondary Endorsement Button:** Warm Sand tint (`#E8C999` at 30% background opacity) with Forest Green text and a solid 1px border (`#153E35` at 20%).
- **Tertiary Action Button:** Transparent background, Terracotta text (`#C46849`), 1px dashed or subtle solid border for provisional or renewal tasks.

### Credibility Indicators & The KAAMSCORE Meter
- **KAAMSCORE Display:** Circular or linear indexed metric enclosure. Background utilizes Sand tint with an arc or track filled with Forest Green (`#153E35`) and Terracotta (`#C46849`) benchmark accents. The numeric score is rendered in high-contrast `display-md` weight paired with an adjacent uppercase micro-label (`VERIFIED LEVEL 3`).
- **Status Badges & Chips:** Compact height (24px–28px), 4px border-radius. Success / Verified states use Muted Sage (`#5E8271` at 15% fill with solid `#153E35` text and 1px micro-border). Unverified / Provisional chips utilize Warm Sand tint.

### Cards & Identity Ribbons
- **Worker Credential Card:** Built with `#FFFFFF` background, 8px radius, and a dual-zone hierarchy: an institutional top anchor bar in Deep Forest Green housing the worker's digital registry ID and security hologram avatar, transitioning to a clean ivory profile body with clear tabular field-value alignments (Trade, Experience, Aadhaar-linked status).
- **Skill Endorsement List Item:** Surface level 1 container, 1px micro-border (`rgba(21, 62, 53, 0.08)`). Features client or contractor signature metadata, verified date, and a localized micro-tag.

### Input Fields & Controls
- **Form Inputs:** 48px height for effortless field interaction on mobile devices. Background `#FFFFFF`, border 1px `#252B28` at 20% opacity. On focus: border shifts to solid `#153E35` with an external 2px focus ring tinted in `#E8C999` (Warm Sand).
- **Checkboxes & Radios:** Sharp 3px rounded squares and perfect circles. Selected state features solid `#153E35` fill with Warm Ivory tick indicator.

### Experience & Verification Timeline
- Vertical alignment linked by a continuous 1.5px solid guide rule in Muted Sage (`#5E8271`). Milestone nodes feature dual-ring geometry (Forest Green perimeter around a Warm Sand core) signaling verified work tenures and skill upgrades.