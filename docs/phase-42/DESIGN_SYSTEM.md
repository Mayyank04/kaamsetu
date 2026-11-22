# KAAMSETU — PHASE 42 DESIGN SYSTEM SPECIFICATION
## Human-Centred Indian Public Service Design Language & Anti-AI-Slop Governance

**Repository:** `Mayyank04/kaamsetu`  
**Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**Permanent Financial Invariant:** `platform_commission_amount = 0.00` on artisan wages  

---

### 1. Design Philosophy: Human Utility Over AI Decoration

KAAMSETU's design language reflects an authentic Indian public-service and contemporary craft marketplace. It is purposefully crafted for dignity, clarity, trustworthiness, and effortless navigation by individuals with varying degrees of digital literacy.

**Core Principles:**
1. **Restraint Over Novelty:** No ornamental floating blur blobs, radial purple/blue glowing spheres, or arbitrary glassmorphism.
2. **Tactile Clarity:** Crisp 1px hairline borders (`border-forest/15`), solid high-contrast card canvases (`#FFFFFF`), and warm paper-like background (`#F7F5F0`).
3. **Multi-Script Dignity:** Equal typographic rhythm across Devanagari, Bengali, Tamil, Telugu, Kannada, Malayalam, Gujarati, Gurmukhi, Odia, and Nastaliq Urdu.
4. **Honest Invariants:** Prominently communicate the permanent 0.00 platform commission and transparent geographic boundaries.

---

### 2. Core Color Tokens & Contrast Compliance

| Token | Hex Value | Role in Interface | WCAG Contrast on Background |
| :--- | :--- | :--- | :--- |
| **Forest Green (Primary Anchor)** | `#153E35` | Primary buttons, headers, brand logos, active states | **11.4:1 (Passes AAA)** |
| **Warm Ivory (Canvas)** | `#F7F5F0` | Default page background, paper texture foundation | **Base Canvas** |
| **Warm Sand (Highlight Accent)** | `#E8C999` | Badges, credential card seals, subtle accent highlights | **3.8:1 (Accent token)** |
| **Deep Charcoal (Body Text)** | `#171D1A` | High-contrast readable typography for all text labels | **13.8:1 (Passes AAA)** |
| **Muted Charcoal (Sub-labels)** | `#414846` | Secondary hints, timestamps, descriptive metadata | **6.5:1 (Passes AA)** |
| **Tactile Hairline Borders** | `rgba(21, 62, 53, 0.15)` | Calibrated 1px boundary lines preventing visual clutter | **Structural** |

---

### 3. Typography System & Indian Script Stacks

```css
/* Multi-Script Font Stack configured in globals.css */
--font-plus-jakarta: 'Plus Jakarta Sans', system-ui, -apple-system, 
  BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans', 
  'Noto Sans Devanagari', 'Noto Sans Bengali', 'Noto Sans Tamil', 
  'Noto Sans Telugu', 'Noto Sans Kannada', 'Noto Sans Malayalam', 
  'Noto Sans Gujarati', 'Noto Sans Gurmukhi', 'Noto Sans Oriya', 
  'Noto Nastaliq Urdu', sans-serif;
```

**Type Scale:**
- **Display 1 (Serif):** `font-serif text-3xl sm:text-5xl font-bold` — Hero titles, milestone certificates.
- **Section Heading (Sans):** `text-2xl sm:text-3xl font-bold text-forest` — Section titles, modal headers.
- **Card Heading:** `text-base sm:text-lg font-bold text-forest` — Worker names, stall titles.
- **Body Text:** `text-sm sm:text-base leading-relaxed text-charcoal` — Descriptive paragraphs.
- **Form Labels:** `text-xs sm:text-sm font-bold text-forest` — Input labels, selector headings.
- **Technical/ID Labels:** `text-[10px] sm:text-xs font-mono uppercase tracking-wider text-charcoal-muted` — Registry IDs, timestamps.

---

### 4. Accessibility Text Scaling & RTL Architecture

- **Text Size Scaling (`.text-size-large`):**
  When enabled via the header text-size toggle, `html.text-size-large` increases the root font size to `112.5%` (18px base), instantly scaling all `rem`-based typography across every route.
- **Bidirectional Support (`dir="rtl"`):**
  When Urdu (`ur`) or Kashmiri (`ks`) is selected, `document.documentElement.dir = "rtl"`. All text, inputs, and form elements automatically align to the right, and navigational arrows flip horizontally using the `.rtl-flip` transform.
