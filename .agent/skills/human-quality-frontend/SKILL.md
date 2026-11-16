---
name: human-quality-frontend
description: Creates, redesigns and audits websites with distinctive art direction, strong visual hierarchy, natural copy, thoughtful interaction design, responsive behavior and maintainable frontend engineering. Orchestrates taste-skill, awesome-design-md, humanizer, ponytail, and impeccable without replacing them. Use for all substantial website and frontend design tasks.
license: MIT
metadata:
  version: "1.1.0"
---

# Human-Quality Frontend Design System

An orchestration skill for Antigravity that unifies visual taste, design-system standards, human copy, engineering restraint, and visual quality assurance into a disciplined, 10-step web design workflow.

## The Core Philosophy

AI-generated web design has recognizable tells:
- Atmospheric blur circles (`backdrop-blur-md bg-purple-500/10`) placed as decorative background halos.
- Generic centered hero layouts with oversized gradient headlines and floating pill tags.
- Repetitive 3-column card grids with identical borders and arbitrary Lucide icons.
- Inflated, generic copy filled with buzzwords ("revolutionary", "unlock your potential", "seamless").
- Zero relationship between the visual form and the actual domain being served.

This skill enforces the standard of an accomplished product team: deliberate art direction, restrained color tokens, editorial typographic rhythm, authentic copy, tactile interaction states, and multi-viewport visual verification.

---

## Upstream Integrated Skills

This orchestration skill coordinates five specialized capabilities without replacing their upstream instructions:

1. **`design-taste-frontend` (`taste-skill`)**: Layout discipline, equal edges, one-section-per-screen rhythm, anti-slop rules, quiet micro-interactions, and finish gate (`scripts/copy-lint.mjs`, `scripts/gate.mjs`).
2. **`awesome-design-md`**: Reference library of 84 production design systems (Linear, Stripe, Apple, Vercel, Supabase, Wise) for token scales and layout reference.
3. **`humanizer`**: Natural, domain-grounded copy without chatbot clichés, forced triads, not-X-but-Y phrasing, or marketing inflation.
4. **`ponytail`**: YAGNI, simplest complete changes, minimal dependencies, and avoiding speculative abstractions.
5. **`impeccable`**: Design context setup, UI defect detection (`scripts/impeccable detect`), visual critique rubric, typography and color refinement, and craft-floor enforcement.

---

## The Execution Protocol

### 1. Before Frontend Work

Before writing or editing frontend code, Antigravity agents MUST:
1. **Inspect the Project:** Read the project structure, routing conventions, UI component libraries, build tooling, and dependencies.
2. **Read Existing Design Documentation:** Read `DESIGN.md` in the workspace root (and `PRODUCT.md` if present). Never invent new colors, tokens, or arbitrary font families if a system exists.
3. **Establish Context & Identity:** Identify the target audience, primary user personas, core use cases, and intended brand personality.
4. **Select the Domain Archetype:** Choose an intentional visual direction suited specifically to the product (e.g. Swiss Transit Cartography, Municipal Limnological GIS, Editorial Monograph, High-Density Financial Terminal). Never use a one-size-fits-all aesthetic.
5. **Load `design-taste-frontend` (`taste-skill`):** Consult art direction guidance, visual hierarchy, equal edge rules, and anti-slop criteria.
6. **Consult `awesome-design-md`:** Search `design-md/<domain>/DESIGN.md` for production references in the same or adjacent domains to inform token choices.
7. **Consult `impeccable`:** Review the Impeccable critique rubric (`reference/critique-rubric.md`) and craft floor (`reference/craft-floor.md`) to establish quality gates.
8. **Consult `ponytail`:** Review Ponytail principles: commit to the smallest complete change that solves the user's problem.
9. **Consult `humanizer`:** Review copy tells to ensure all initial UI text is clear, direct, and unbloated.

### 2. During Implementation

While writing components, layouts, and styles, agents MUST adhere to:
- **Preserve Application Architecture:** Work within the existing frameworks (Next.js, React, Tailwind, plain CSS) without introducing foreign patterns.
- **Reuse Existing Components:** Check existing UI atoms before creating new ones; avoid duplicate styles and scattered hex codes.
- **Avoid Generic AI Layouts:** Reject centered hero text stacked on arbitrary 3-card grids simply because they are easy to scaffold.
- **Avoid Decorative Novelty:** Banish atmospheric blur blobs, floating radial gradients, artificial glassmorphism, and non-functional animations.
- **Vary Layout Composition:** Use lists, split panels, data tables, editorial columns, or asymmetrical grids instead of identical card grids.
- **Zero Fabricated Content:** Never invent fake testimonials, fake partner logos, fake user counts, or fake security badges. Use authentic, domain-grounded content.
- **Enforce Consistent Tokens:** Route all colors, font sizes, line heights, paddings, and borders through the declared `DESIGN.md` token set.
- **Ensure Functional Interactivity:** Every interactive element (buttons, tabs, inputs, sliders) must have deliberate tactile states: `hover`, `focus-visible`, `active`, `disabled`, and `loading`.
- **Implement Boundary States:** Build robust loading skeletons/spinners, realistic empty states with recovery actions, and accessible error notifications.
- **Maintain Accessibility & Responsiveness:** Enforce semantic HTML (`<main>`, `<nav>`, `<section>`, `<table>`), visible focus outlines (`outline: 2px solid <token>; outline-offset: 2px;`), WCAG 2.1 AA contrast ($\ge 4.5:1$), and fluid responsive scaling.

### 3. Before Completion

Before presenting completed frontend work, agents MUST:
1. **Run `impeccable detect`:** Execute `$HOME/.gemini/config/skills/impeccable/scripts/impeccable detect <target>` against the live URL or built HTML to catch anti-patterns (`undersized-ui-text`, `low-contrast`, `cramped-padding`, `hero-eyebrow-chip`).
2. **Run `taste-skill copy-lint.mjs`:** Run `node $HOME/.gemini/config/skills/taste-skill/scripts/copy-lint.mjs <target>` to identify copy residue and slop words.
3. **Inspect Real Browser Renderings:** Open the page in a real browser across all 5 standard viewports (`1440x900`, `1280x800`, `768x1024`, `390x844`, `360x800`). Never claim a layout is responsive without inspecting actual visual output.
4. **Apply `ponytail` Simplification:** Review the diff; eliminate unnecessary helper abstractions, redundant wrapper elements, and unused CSS classes.
5. **Apply `humanizer` Polish:** Read all visible UI copy aloud. Strip conversational filler, forced triads, not-X-but-Y contrasts, and robotic phrasing.
6. **Execute Automated Verification:** Run project type-checking (`tsc --noEmit`), test suites (`npm test`), and production build (`npm run build`).
7. **Report With Epistemic Honesty:** Explicitly document which upstream skills were invoked, which commands were executed, what defects were remediated, and what limitations remain. Never claim a skill was invoked if it was not relevant to the task.

---

## Selective Invocation Ledger

An agent orchestrating this skill must record which specific skills were called and why:

| Task Component | Relevant Upstream Skill | Purpose of Invocation |
|---|---|---|
| Domain & Token Research | `awesome-design-md` | Extract token scales and design conventions from 84 production systems |
| Art Direction & Composition | `design-taste-frontend` (`taste-skill`) | Enforce layout balance, section rhythm, and anti-slop rules |
| UX Copy & Editorial Tone | `humanizer` + `taste-skill/scripts/copy-lint.mjs` | Audit copy for AI tells, repetitive structures, and marketing jargon |
| Engineering Discipline | `ponytail` | Enforce YAGNI, avoid overengineering, prune speculative code |
| Design QA & Static Audit | `impeccable` (`scripts/impeccable detect`) | Detect undersized text, contrast failures, cramped spacing, and hierarchy flaws |
