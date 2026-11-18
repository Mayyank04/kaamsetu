# KAAMSETU — PHASE 41 RESPONSIVE DESIGN SYSTEM
**Document ID:** `DOC-P41-DESIGN-002`  
**Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**Permanent Financial Invariant:** `platform_commission_amount = 0.00` on artisan wages  
**Status:** `VERIFIED WORKING`

---

## 1. Architectural Foundations

The KAAMSETU design system reflects institutional trust, sovereign craft dignity, and precision engineering. All responsive components are governed by strict mathematical scales rather than arbitrary ad-hoc values.

### Core Color Palette
- **Deep Forest Green (Structural Anchor):** `#153E35` (`var(--primary)`)
- **Warm Ivory (Background Canvas):** `#F7F5F0` (`var(--background)`)
- **Warm Sand (Highlight Accent):** `#E8C999` (`var(--secondary)`)
- **Deep Charcoal (High-Contrast Text):** `#171D1A` (`var(--foreground)`)
- **Institutional Hairline Border:** `rgba(21, 62, 53, 0.12)` (`var(--border)`)

---

## 2. Breakpoint Architecture & Layout Tokens

```
xs:  < 640px    (Mobile Portrait: 320px, 360px, 390px, 430px)
sm:  >= 640px   (Mobile Landscape / Phablet)
md:  >= 768px   (Tablet Portrait: 768px)
lg:  >= 1024px  (Tablet Landscape / Small Desktop: 1024px)
xl:  >= 1280px  (Standard Desktop: 1280px, 1440px)
2xl: >= 1536px  (Large Monitor: 1920px)
```

### Container Padding Rules
- Mobile (`< 640px`): `px-4` (16px outer margin)
- Tablet (`640px – 1023px`): `px-6` (24px outer margin)
- Desktop (`>= 1024px`): `px-8` (32px outer margin)

### Component Card Padding Rules
- Mobile (`< 640px`): `p-4` (prevents column compression on 320px–360px screens)
- Tablet (`640px – 1023px`): `p-6`
- Desktop (`>= 1024px`): `p-6` to `p-8`

---

## 3. Fluid Typography Rhythm

All heading and metric text elements use fluid scaling to ensure balanced hierarchy without wrapping awkwardly:
- **Hero Primary Heading:** `text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-forest leading-[1.1]`
- **Section Heading:** `text-2xl sm:text-3xl lg:text-4xl font-bold text-forest`
- **Hero Trust Metrics:** `text-xl sm:text-2xl lg:text-3xl font-extrabold text-forest`
- **Body Text:** `text-sm sm:text-base text-charcoal-muted leading-relaxed`
- **Caption / Meta:** `text-[10px] sm:text-xs font-mono text-charcoal-muted`

---

## 4. Touch Target & Accessibility Guidelines

In accordance with WCAG 2.1 Success Criterion 2.5.5 (Target Size) and mobile ergonomics:
- **Buttons & Interactive Controls:** Minimum height of 44px (`h-11`) on all mobile forms, primary buttons, and input fields.
- **Micro-Actions:** Where compact buttons (`h-8`, `px-3`) are used in secondary toolbars, they are enclosed with minimum 8px touch clearance padding.
- **Focus Rings:** Distinct `focus:ring-2 focus:ring-forest focus:ring-offset-2` outline visible on keyboard tab navigation.

---

## 5. Modal & Dialog Standards

Every modal and dialog in KAAMSETU must implement the three mandatory viewport constraints:
1. **Dynamic Viewport Height:** `max-h-[calc(100dvh-2rem)]` (never hardcoded `vh` which breaks on mobile browser address bar collapse).
2. **Independent Internal Scroll:** `overflow-y-auto` on the inner container so dialog headers and actions remain accessible.
3. **Responsive Width with Margin Clearance:** `w-[calc(100%-2rem)] max-w-lg` (or `max-w-xl`/`max-w-4xl`), guaranteeing at least 1rem margin on each screen edge.
4. **Outer Backdrop:** `fixed inset-0 z-50 bg-forest-950/75 flex items-center justify-center p-4 overflow-y-auto`.
