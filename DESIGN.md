# KAAMSETU DESIGN SYSTEM (DESIGN.md)

**Product Mission:** "Every skill deserves to be seen, even without a degree."  
**Domain:** Worker Identity, Sovereign Cryptographic Credentials, Fair Labor Economics, Institutional Trust.  
**Operating Classification:** `CLASS_B_CONTROLLED_ROLLOUT` (Guwahati Urban & Shillong Urban).  
**Core Invariant:** `platform_commission_amount = 0.00` permanently on all worker wages.

---

## 1. Design Philosophy & Aesthetic Identity

KAAMSETU rejects generic SaaS tropes, neon glow gradients, atmospheric blur blobs, and playful startup casualness. 

Instead, KAAMSETU's aesthetic reflects **Sovereign Dignity & Institutional Craftsmanship**:
- **Physical Credential Weight:** The interface evokes tactile security documents, parchment certifications, and high-trust government ledgers.
- **Worker Respect:** Every interaction treats informal workers, master carpenters, plumbers, and electricians as skilled professionals deserving clear, unencumbered recognition.
- **Clarity over Cleverness:** High-contrast text, clear tactile borders, predictable navigation, and zero ornamental slop.
- **Multi-lingual First:** Layouts accommodate varying script lengths (Hindi, Assamese, Bengali, Tamil, Telugu, Marathi, English) without layout clipping.

---

## 2. Color System & Design Tokens

### Core Palette
| Token | Hex | HSL / CSS Var | Purpose |
| :--- | :--- | :--- | :--- |
| **Forest Green (Primary)** | `#153E35` | `167 49% 16%` | Institutional anchor, primary actions, cryptographic badges, headers |
| **Warm Ivory (Background)** | `#F7F5F0` | `43 30% 96%` | Parchment canvas background, soft readability, reduces eye fatigue |
| **Warm Sand (Secondary)** | `#E8C999` | `36 63% 75%` | Subtle highlights, active badges, skill endorsements, verification seals |
| **Deep Charcoal (Text)** | `#171D1A` | `150 12% 10%` | High-contrast body typography, compliant with WCAG AAA for text |
| **Muted Slate (Subtext)** | `#414846` | `150 6% 35%` | Secondary labels, timestamps, metadata, helper text |
| **Border Micro** | `rgba(21, 62, 53, 0.08)` | — | 1px calibrated boundary lines separating ledger records |
| **Destructive Red** | `#C02626` | `0 74% 42%` | Errors, dispute warnings, revoked keys, irreversible actions |

---

## 3. Typography & Rhythm

### Font Family
- **Primary Body & UI:** `Plus Jakarta Sans`, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif.
- **Headings & Badges:** Semi-bold to Extra-bold (600/700/800) with deliberate letter-spacing (`tracking-tight`).
- **Cryptographic & Numeric Values:** Monospace tabular figures (`font-mono`, `tabular-nums`) for transaction hashes, public keys, UTRs, and wage amounts.

### Type Scale
- **H1 / Hero:** 2rem–2.5rem (32px–40px), Line-height 1.2, Weight 700.
- **H2 / Section Title:** 1.5rem–1.75rem (24px–28px), Line-height 1.25, Weight 600.
- **H3 / Card Header:** 1.125rem–1.25rem (18px–20px), Line-height 1.3, Weight 600.
- **Body / Standard:** 0.875rem–1.0rem (14px–16px), Line-height 1.5, Weight 400/500.
- **Caption / Meta:** 0.75rem (12px), Line-height 1.4, Weight 500, Uppercase tracking for tags.

---

## 4. Layout Grids & Composition Rules

1. **Equal Edges & Alignment:** Cards and containers maintain consistent gutter spacing (`p-4` to `p-6` mobile, `p-6` to `p-8` desktop).
2. **Tactile Boundaries:** Containers use explicit 1px borders (`border border-[#153E35]/10`) on white or ivory canvases instead of heavy drop shadows.
3. **No Decorative Card Grids:** Group data by domain intent:
   - Worker credentials use physical badge / certificate layouts.
   - Payouts and ledgers use audit tables or timeline stream layouts.
   - Onboarding uses a focused single-column progressive disclosure flow.
4. **Touch Targets:** All interactive controls (buttons, toggles, select inputs) have a minimum tap area of `44px × 44px` on mobile screens.

---

## 5. Interaction States & Tactile Feedback

- **Default Button:** Solid `#153E35` with `#F7F5F0` text, rounded `0.375rem` (6px).
- **Hover State:** Slightly elevated tint `#1A4B40` with smooth transition (`transition-colors duration-150`).
- **Focus Visible:** `ring-2 ring-[#153E35] ring-offset-2 outline-none` on keyboard tab.
- **Disabled State:** Opacity 50%, `cursor-not-allowed`, clear tooltip or helper text explaining prerequisite.
- **Loading State:** In-place spinner or skeleton pulse with accessible `aria-busy="true"` and live text announcement (`aria-live="polite"`).

---

## 6. Prohibited Anti-Patterns (Anti-Slop Rules)

- ❌ **No Floating Blur Blobs:** Never inject arbitrary `backdrop-blur-md bg-white/5` or radial gradient blur circles.
- ❌ **No Fabricated Social Proof:** Never invent fake testimonials ("Over 10,000 workers love us"), unverified star ratings, or fictitious corporate partner logos.
- ❌ **No Decorative Lucide Overdose:** Do not prepend random decorative icons to every heading. Use icons strictly for navigation, status signals, or orientation.
- ❌ **No Artificial Defaults:** Never display fabricated default metrics (e.g., auto-filling unrated workers with 5.0 stars or unassessed skills with arbitrary trades). If data is unverified or absent, honestly display `"Not yet rated"`, `"Unscored"`, or empty state.
- ❌ **No Fake PDF Downloads:** Never return raw HTML under the pretense of a PDF file. Use honest printable HTML layouts (`html_printable`) or authenticated binary rendering pipelines.
