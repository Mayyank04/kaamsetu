# KAAMSETU DESIGN GOVERNANCE SYSTEM

**Programme:** KAAMSETU — Digital Identity & Worker Empowerment Platform  
**Authority:** Permanent Frontend Architecture & Quality Mandate  
**Scope:** All agent sessions, subagents, developers, and pull requests touching UI, styles, or copy  
**Core Mission:** Every skill deserves to be seen, even without a degree.  
**Constitutional Invariant:** `platform_commission_amount = 0.00` permanently on artisan earnings.

---

## 1. PURPOSE & APPLICABILITY

This document establishes the mandatory design intelligence and visual quality protocol for KAAMSETU.

No frontend work—whether creating new pages, editing existing layouts, adjusting component styles, adding new features, or refining copy—may bypass this protocol.

KAAMSETU is an institutional and community platform for skilled artisans (carpenters, electricians, masons, plumbers, solar mechanics), contractors, customers, and skill development missions. Its visual design must convey **dignity, physical craftsmanship, institutional trust, and human clarity**—never casual startup novelty or generic AI-generated decoration.

---

## 2. THE 11-STEP PRE-IMPLEMENTATION WORKFLOW

Every agent working on frontend code must execute these steps sequentially:

1. **Read This Governance File:** Understand the constraints and quality floor.
2. **Activate the Five Installed Skills in `.agent/skills/`:**
   - **`humanizer`:** Enforce natural, grounded, human product writing. Eliminate chatbot clichés, corporate buzzwords, and marketing fluff.
   - **`taste-skill`:** Establish intentional art direction, visual rhythm, equal edge spacing, and strict one-section-per-screen discipline.
   - **`awesome-design-md`:** Reference 84 real-world design systems (Linear, Stripe, Apple, Vercel, Supabase, Wise) for component conventions.
   - **`ponytail`:** Apply senior developer restraint. Choose the simplest change that completely solves the requirement. Avoid speculative abstractions.
   - **`impeccable`:** Enforce typographic scale, contrast, tactile states, and execute the design critique rubric.
   - **`human-quality-frontend`:** Orchestrate the overall review and verification pipeline.
3. **Read `DESIGN.md`:** Review the single source of truth for color tokens, typography scales, spacing, and component definitions.
4. **Inspect Existing Components:** Before authoring new UI elements, inspect `src/components/ui/` and existing page components. Reuse established buttons, inputs, dialogs, badges, and cards to maintain visual continuity.
5. **Understand the Page's Real-World Purpose:** Determine who uses the page (artisan on a mobile phone, contractor on a laptop, government official on a desktop) and the primary task they must accomplish without confusion.
6. **Establish Intentional Visual Direction:** Determine the layout hierarchy, focal anchor, and typographic balance appropriate to the domain. Never use interchangeable templates.
7. **Implement with Precision:** Write clean, semantic, accessible HTML and Tailwind CSS matching established tokens.
8. **Inspect in a Real Browser:** Never assume code looks right from CSS alone. Open the page in a browser session across Desktop, Tablet, and Mobile viewports.
9. **Examine the Rendered Output:** Check line wraps, contrast, touch target sizes, alignment, padding balance, and empty states.
10. **Conduct a Formal Design Critique:** Evaluate the page against the Anti-Slop Audit checklist (Section 4).
11. **Refine and Correct Flaws:** Fix identified visual, typographic, or responsive issues before marking the task complete.

---

## 3. POST-IMPLEMENTATION VERIFICATION CHECKLIST

After every UI change, the following six quality dimensions must be verified:

| Dimension | Mandatory Standards | Verification Method |
|---|---|---|
| **Responsive Layouts** | Tested at 1440px (desktop), 1024px (tablet landscape), 768px (tablet portrait), 390px (mobile), and 320px (narrow mobile). Zero horizontal overflow. | Browser rendering / DevTools viewport tests |
| **Accessibility (a11y)** | WCAG 2.1 AAA contrast for text. All interactive elements have visible `focus-visible` rings. Minimum 44px × 44px touch targets. Form inputs have explicit labels and error bindings. | Keyboard tab navigation & contrast audit |
| **Interaction States** | Every interactive element has tactile `hover`, `active`, `focus-visible`, `disabled`, and `loading` feedback. | Interactive state testing |
| **Typography Rhythm** | Strict adherence to the `DESIGN.md` type scale. Display headlines are restrained and editorial. Monospace numbers for currency and codes. Appropriate line lengths (45–75 characters for prose). | Visual typography inspection |
| **Visual Consistency** | Colors strictly from the palette: Deep Forest Green (`#153E35`), Warm Ivory (`#F7F5F0`), Warm Sand (`#E8C999`), Deep Charcoal (`#171D1A`). 1px hairline borders (`border-forest/10`). No ad-hoc hex values. | Token adherence check |
| **Copy Quality** | Humanized language. No robotic startup claims ("Revolutionize your workflow with AI"). Direct, empathetic, and respectful. | Humanizer audit |

---

## 4. ANTI-AI-SLOP GATES (PROHIBITED PATTERNS)

The following patterns indicate uncurated AI code and are strictly prohibited in KAAMSETU:

1. ❌ **Atmospheric Gradient Blur Blobs:** No `backdrop-blur-md bg-white/5` stacked over arbitrary radial gradient circles.
2. ❌ **AI Hero Templates:** No centered hero headlines with glowing gradient pill tags and generic slogans like *"India's Premier All-in-One Digital Skill Identity Platform"*. Use clear, human language: *"Your skills deserve recognition."*
3. ❌ **Repetitive 3-Card Partitions:** Do not slice unrelated content into identical 3-card rounded boxes simply because it is easy to scaffold. Use editorial lists, split panels, or structured data tables.
4. ❌ **Decorative Lucide Overdose:** Do not prepend random Lucide icons to every single headline or bullet point. Icons must serve visual navigation, orientation, or status clarity only.
5. ❌ **Fabricated Trust Signals & Fake Social Proof:** Never invent user counts ("Over 100,000 workers"), fake review stars (auto-populating 5.0 stars), fictitious partner logos, or ungrounded statistics ("99.9% Faster"). If data is pending or absent, display truthful empty states.
6. ❌ **Premature "Verified" Badges:** Never mark self-declared data or unassessed skills with a green "Verified" badge. Use truthful badges: `"Self-Declared Testimony"` and `"Trade suggestion — review and edit"`.
7. ❌ **Unearned Glassmorphism & High-Gloss Shadows:** Avoid shiny plastic card styling. Use crisp physical paper surfaces with 1px tactile borders.

---

## 5. REPOSITORY SKILL DIRECTORY REFERENCE

All persistent design skills reside in `.agent/skills/` (and `.agents/skills/`):

- `.agent/skills/human-quality-frontend/SKILL.md`
- `.agent/skills/taste-skill/SKILL.md`
- `.agent/skills/awesome-design-md/SKILL.md`
- `.agent/skills/ponytail/SKILL.md`
- `.agent/skills/impeccable/SKILL.md`
- `.agent/skills/humanizer/SKILL.md`

Any future agent session must discover, reference, and load these skills whenever touching user interfaces.
