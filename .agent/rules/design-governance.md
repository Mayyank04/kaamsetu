---
description: Mandatory Human-Quality Frontend Design, Anti-Slop Discipline & Visual Governance for KAAMSETU
trigger: always_on
---

# KAAMSETU FRONTEND DESIGN & VISUAL GOVERNANCE DIRECTIVE

This rule is active permanently across all sessions, agents, and subagents working on KAAMSETU.
Every agent creating, modifying, styling, or reviewing UI code must strictly adhere to these standards.

## Core Principle: Human-Centered Product Integrity Over AI Decoration

Never substitute decorative novelty for thoughtful design. Restraint, typographic rhythm, compositional clarity, and authentic worker utility outrank decorative ornamentation.

## Non-Negotiable Frontend Rules

1. **Understand Product & Worker Context First:** Every UI change must reflect KAAMSETU's core mission: "Every skill deserves to be seen, even without a degree." The users are skilled informal workers, master artisans, small contractors, customers, and training institutions.
2. **Consult Installed Design Skills Before Modifying UI:**
   - `human-quality-frontend` (.agent/skills/human-quality-frontend/SKILL.md): Orchestrates the 10-step design workflow.
   - `taste-skill` (.agent/skills/taste-skill/SKILL.md): Art direction, composition, anti-slop rules, equal edges, one-section-per-screen discipline.
   - `awesome-design-md` (.agent/skills/awesome-design-md/SKILL.md): Real-world design system benchmarks.
   - `ponytail` (.agent/skills/ponytail/SKILL.md): Extreme engineering restraint, simplest changes without bloat.
   - `impeccable` (.agent/skills/impeccable/SKILL.md): Typography, color, spacing, tactile polish, critique rubric.
   - `humanizer` (.agent/skills/humanizer/SKILL.md): Natural, authentic human product writing without chatbot clichés.
3. **Read DESIGN.md:** Always read `DESIGN.md` in the project root before altering visual styles or components.
4. **Inspect Existing Tokens & Components:** Never scatter arbitrary hex colors, inline margins, or ad-hoc border radii. Reuse existing tokens from `DESIGN.md` and components in `src/components/ui/`.
5. **No AI Design Tropes (Anti-Slop Invariants):**
   - ❌ No arbitrary floating gradient blur blobs (`backdrop-blur-md bg-white/5` on radial blur circles).
   - ❌ No generic AI hero sections with glowing pill tags and corporate startup slogans.
   - ❌ No repetitive 3-card partitions for unrelated content.
   - ❌ No decorative Lucide icons prepended to every headline.
   - ❌ No fabricated statistics ("99.9% Faster", "150,000 Verified Artisans") without verified database backing.
   - ❌ No unearned "Verified" badges on self-declared data.
6. **Humanize All Product Copy:**
   - Avoid robotic startup marketing jargon. Use direct, specific, and respectful phrasing.
   - "Sign in to manage your skill profile" instead of "Access your sovereign workforce identity".
   - "Find skilled professionals" instead of "Explore the universal talent ecosystem".
7. **Tactile Boundaries & Color Restraint:**
   - Canvas: Warm Ivory (`#F7F5F0`).
   - Structural Anchor: Deep Forest Green (`#153E35`).
   - Warm Highlight: Warm Sand (`#E8C999`).
   - Boundaries: Crisp 1px calibrated hairline borders (`border-forest/10` or `border-forest/15`) on solid card backgrounds.
8. **Responsive & Real Browser Inspection:**
   - Never claim visual polish without inspecting actual browser output across 1440px desktop, 768px tablet, and 390px mobile viewports.
   - Check keyboard accessibility (`focus-visible`), touch targets (minimum 44px × 44px), and text overflow.
9. **Preserve Functional & Constitutional Invariants:**
   - `platform_commission_amount = 0.00` permanently on artisan wages.
   - `CLASS_B_CONTROLLED_ROLLOUT` boundaries (Guwahati Urban & Shillong Urban) strictly maintained.
   - Zero regression on authentication, OTP lifecycle, draft persistence, and security controls.
