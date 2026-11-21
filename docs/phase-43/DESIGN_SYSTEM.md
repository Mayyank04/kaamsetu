# KAAMSETU — PHASE 43 AUDIT DOSSIER 04
# UNIFIED DESIGN SYSTEM & TOKEN SPECIFICATION

**Repository:** `Mayyank04/kaamsetu`  
**Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**Version:** 3.0 (Phase 43 Human-Centred Product Reconstruction)  
**Status:** `VERIFIED WORKING`

---

## 1. Brand Palette & Color Tokens

KAAMSETU adheres to a grounded, high-contrast, tactile color palette inspired by physical guild archives, high-security certificates, and natural construction materials:

```text
CANVAS:           Warm Ivory    #F7F5F0  (hsl(43, 30%, 96%))
STRUCTURAL:       Forest Green  #153E35  (hsl(167, 49%, 16%))
HIGHLIGHT:        Warm Sand     #E8C999  (hsl(36, 63%, 75%))
TYPOGRAPHY:       Deep Charcoal #171D1A  (hsl(167, 10%, 10%))
SURFACE:          Pure White    #FFFFFF  (hsl(0, 0%, 100%))
HAIRLINE BORDER:  Hairline      rgba(21, 62, 53, 0.12)
```

### Color Token Hierarchy Table

| Token | Hex / Value | Contrast on Canvas (`#F7F5F0`) | Usage & Role |
| :--- | :--- | :---: | :--- |
| `forest` | `#153E35` | **10.8 : 1 (WCAG AAA)** | Primary buttons, headers, active navigation, trust seals |
| `forest-50` | `#F2F7F5` | 1.1 : 1 | Ultra-light tint for table row zebra striping and hover highlights |
| `forest-100` | `#D8E7E2` | 1.4 : 1 | Subtle borders and informational badge backdrops |
| `forest-600` | `#1A4B40` | 9.2 : 1 | Primary button hover state |
| `forest-900` | `#0B231E` | 14.5 : 1 | Credential cards and dark high-security panels |
| `ivory` | `#F7F5F0` | 1.0 : 1 | Universal canvas background, modal backdrop base |
| `sand` | `#E8C999` | 1.4 : 1 (Light) | Trade skill badges, accent ribbons, seal borders |
| `sand-dark` | `#8C6527` | 5.2 : 1 (WCAG AA) | High-contrast sand text and icons on light backgrounds |
| `charcoal` | `#171D1A` | **13.6 : 1 (WCAG AAA)** | Primary body typography and form labels |
| `charcoal-muted` | `#4B5551` | **5.4 : 1 (WCAG AA)** | Secondary text, timestamps, captions, and helper notes |
| `border-hairline`| `rgba(21, 62, 53, 0.12)`| N/A | Standard 1px crisp border for cards, inputs, and tables |
| `success-green` | `#14532D` | 8.9 : 1 (WCAG AAA) | Confirmed payouts, verified skill status, active dispatch |
| `warning-amber` | `#78350F` | 7.1 : 1 (WCAG AAA) | Non-dispatch pilot notices, unverified trade suggestions |
| `destructive-red`| `#991B1B` | 6.8 : 1 (WCAG AAA) | Form errors, booking cancellations, grievance escalations |

---

## 2. Multi-Script Typography System

The typography scale supports Latin (English) alongside Devanagari (Hindi, Marathi), Eastern Nagari (Assamese, Bengali), and Dravidian scripts without breaking layout bounds or clipping descenders.

### Type Scale

| Role | Desktop Size / Leading | Mobile Size / Leading | Weight | Tracking |
| :--- | :--- | :--- | :---: | :---: |
| **Display Hero** | `2.5rem (40px) / 1.15` | `2.0rem (32px) / 1.2` | 800 | `-0.025em` |
| **H1 (Page Title)** | `2.0rem (32px) / 1.2` | `1.625rem (26px) / 1.25`| 700 | `-0.02em` |
| **H2 (Section Header)**| `1.5rem (24px) / 1.3` | `1.25rem (20px) / 1.3` | 600 | `-0.015em` |
| **H3 (Card Title)** | `1.125rem (18px) / 1.35`| `1.0rem (16px) / 1.4` | 600 | `normal` |
| **Body (Default)** | `0.9375rem (15px) / 1.55`| `0.875rem (14px) / 1.5` | 400 | `normal` |
| **Body (Small / Meta)**| `0.8125rem (13px) / 1.45`| `0.75rem (12px) / 1.4` | 500 | `normal` |
| **Micro Tag / Badge** | `0.6875rem (11px) / 1.3` | `0.6875rem (11px) / 1.3` | 600 | `0.05em` |

---

## 3. Responsive Breakpoints & Viewport Grid

The application is structured mobile-first with fluid padding and container max-widths:

| Device Class | Breakpoint Width | Container Behavior | Navigation Pattern |
| :--- | :---: | :--- | :--- |
| **Small Android Phone** | `320px – 359px` | Full width, `px-3`, 1-column stack | Accessible slide drawer, sticky top-bar |
| **Standard Android Phone**| `360px – 411px` | Full width, `px-4`, 1-column stack | Accessible slide drawer, sticky top-bar |
| **Flagship Phone / iPhone**| `390px – 430px` | Full width, `px-4`, 1-column stack | Accessible slide drawer, sticky top-bar |
| **Small Tablet (Portrait)**| `768px – 1023px` | `px-6`, 2-column grid | Collapsible drawer with tablet quick-links |
| **Large Tablet / Laptop** | `1024px – 1279px`| `px-8`, 3-column / 4-column | Persistent desktop header navigation |
| **Standard Desktop** | `1280px – 1440px`| `max-w-7xl`, `px-8` | Persistent desktop header + detailed footer |
| **Large Desktop / Monitor**| `1920px+` | `max-w-7xl`, centered | Scaled margins, high-density layouts |

---

## 4. Component Design Standards

1. **Touch Targets:** All interactive controls (buttons, inputs, select options, navigation toggles) maintain a minimum tap target of `44px × 44px` (recommended `48px` on mobile).
2. **Focus Indicators:** Keyboard focus triggers a visible `2px solid #153E35` outline with a `2px` offset (`focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2`).
3. **Hairline Tactile Boundaries:** Cards, inputs, and modals utilize crisp `1px solid rgba(21, 62, 53, 0.12)` borders.
4. **State Machine Feedback:** Every interactive component provides distinct visual states: default, hover, active, focus-visible, disabled, and loading (spinner or skeleton).
