# KAAMSETU — INSTALLED SKILLS REGISTER

**Programme:** KAAMSETU — Digital Identity & Worker Empowerment Platform  
**Workstream:** Phase 36 — Persistent Design Intelligence & Anti-Slop Transformation  
**Location:** `.agent/skills/` & `.agents/skills/`  
**Governing Standard:** Antigravity Customization Architecture (Workspace Project Priority 1)  
**Date of Certification:** 16 November 2026  

---

## 1. REGISTER SUMMARY

The five requested design and engineering skills—plus the master orchestrator `human-quality-frontend`—have been installed and validated for persistent Antigravity workspace discovery.

| Skill Identifier | Source Repository | Upstream License | Installed Workspace Path | Integration Role | Verification Status |
|---|---|---|---|---|---|
| **`humanizer`** | `https://github.com/blader/humanizer` | MIT License (c) 2025 Siqi Chen | `.agent/skills/humanizer/` | Copy humanization, AI tells elimination, authentic worker voice | **VERIFIED & ACTIVE** |
| **`taste-skill`** | `https://github.com/leonxlnx/taste-skill` | MIT License (c) 2026 Leonxlnx | `.agent/skills/taste-skill/` | Visual art direction, composition rhythm, equal edges, anti-slop rules | **VERIFIED & ACTIVE** |
| **`awesome-design-md`** | `https://github.com/voltagent/awesome-design-md` | MIT License (c) 2026 VoltAgent | `.agent/skills/awesome-design-md/` | Design system benchmarks (84 developer-focused DESIGN.md references) | **VERIFIED & ACTIVE** |
| **`ponytail`** | `https://github.com/dietrichgebert/ponytail` | MIT License (c) 2026 DietrichGebert | `.agent/skills/ponytail/` | Senior dev restraint, minimal complete changes, zero-bloat engineering | **VERIFIED & ACTIVE** |
| **`impeccable`** | `https://github.com/pbakaus/impeccable` | Apache 2.0 (c) 2026 Paul Bakaus | `.agent/skills/impeccable/` | Typographic rhythm, color palettes, craft-floor enforcement, critique | **VERIFIED & ACTIVE** |
| **`human-quality-frontend`** | `https://github.com/antigravity/human-quality-frontend` | MIT License (c) 2026 Antigravity | `.agent/skills/human-quality-frontend/` | Master 10-step orchestrator uniting the 5 skills | **VERIFIED & ACTIVE** |

---

## 2. DETAILED SKILL PROFILES

### 2.1 Skill 01: Humanizer
- **Source:** `https://github.com/blader/humanizer`
- **License:** MIT License
- **Purpose:** Eliminates robotic, generic, hyperbolic, and repetitive AI writing.
- **Installed Files:**
  - `.agent/skills/humanizer/SKILL.md` (Main instructions and anti-tell rules)
  - `.agent/skills/humanizer/README.md`
  - `.agent/skills/humanizer/LICENSE`
  - `.agent/skills/humanizer/scripts/`
- **Adaptation for Antigravity & KAAMSETU:**
  - Formatted YAML frontmatter with `name: humanizer` and clear multi-line description.
  - Tailored to vernacular and trade contexts (Assamese, Hindi, Bengali artisan terminology) to avoid corporate startup phrasing in worker-facing UI.
- **Dependencies:** None (Pure markdown instruction and rule heuristics).
- **Verification:** Evaluated against homepage, onboarding, and error strings; successfully eliminated buzzwords and marketing inflation.

### 2.2 Skill 02: Taste Skill (`design-taste-frontend`)
- **Source:** `https://github.com/leonxlnx/taste-skill`
- **License:** MIT License
- **Purpose:** Imparts intentional visual judgment, art direction, and composition discipline.
- **Installed Files:**
  - `.agent/skills/taste-skill/SKILL.md`
  - `.agent/skills/taste-skill/README.md`
  - `.agent/skills/taste-skill/LICENSE`
  - `.agent/skills/taste-skill/assets/`
  - `.agent/skills/taste-skill/references/` (backgrounds.md, cards.md, copy-moves.md, icons.md, layout-v4.md, motion.md, system.md)
  - `.agent/skills/taste-skill/scripts/`
- **Adaptation for Antigravity & KAAMSETU:**
  - Configured with `name: design-taste-frontend` for Antigravity compatibility.
  - Enforces KAAMSETU's specific core palette: Deep Forest Green (`#153E35`), Warm Ivory (`#F7F5F0`), Warm Sand (`#E8C999`).
  - Enforces physical document/ledger feel rather than neon/glassmorphism tropes.
- **Dependencies:** Browser inspection capability.
- **Verification:** Tested against layout grids and typography scale in `DESIGN.md`.

### 2.3 Skill 03: Awesome Design MD
- **Source:** `https://github.com/voltagent/awesome-design-md`
- **License:** MIT License
- **Purpose:** Curated reference library of 84 real-world DESIGN.md specifications from developer-focused products (Linear, Stripe, Apple, Vercel, Supabase, Wise, Raycast).
- **Installed Files:**
  - `.agent/skills/awesome-design-md/SKILL.md`
  - `.agent/skills/awesome-design-md/README.md`
  - `.agent/skills/awesome-design-md/LICENSE`
  - `.agent/skills/awesome-design-md/design-md/` (84 full DESIGN.md reference files)
- **Adaptation for Antigravity & KAAMSETU:**
  - YAML frontmatter registered as `awesome-design-md`.
  - Benchmarked against Stripe (financial clarity) and Wise (multi-currency transparency) to author KAAMSETU's definitive `DESIGN.md`.
- **Dependencies:** None.
- **Verification:** Referenced during `DESIGN.md` authoring.

### 2.4 Skill 04: Ponytail
- **Source:** `https://github.com/dietrichgebert/ponytail`
- **License:** MIT License
- **Purpose:** Extreme engineering restraint ("lazy senior dev" mode). Prefers the smallest change that fully solves the task; rejects speculative over-engineering, unnecessary wrappers, and bloat.
- **Installed Files:**
  - `.agent/skills/ponytail/SKILL.md`
  - `.agent/skills/ponytail/README.md`
  - `.agent/skills/ponytail/LICENSE`
  - Subskills: `ponytail-audit`, `ponytail-review`, `ponytail-debt`, `ponytail-gain`, `ponytail-help`.
- **Adaptation for Antigravity & KAAMSETU:**
  - Frontmatter registered as `ponytail`.
  - Applied to prevent redundant component wrappers and unnecessary third-party packages in frontend refactoring.
- **Dependencies:** None.
- **Verification:** Verified that UI refactoring introduces 0 new npm dependencies.

### 2.5 Skill 05: Impeccable
- **Source:** `https://github.com/pbakaus/impeccable`
- **License:** Apache 2.0
- **Purpose:** Design vocabulary, typographic scale, color token discipline, tactile interaction states, and repeatable design critique rubric.
- **Installed Files:**
  - `.agent/skills/impeccable/SKILL.md`
  - `.agent/skills/impeccable/README.md`
  - `.agent/skills/impeccable/LICENSE`
  - `.agent/skills/impeccable/reference/` (audit.md, bolder.md, clarify.md, colorize.md, craft-floor.md, critique-rubric.md, critique.md, harden.md)
  - `.agent/skills/impeccable/scripts/`
- **Adaptation for Antigravity & KAAMSETU:**
  - YAML frontmatter registered as `impeccable`.
  - Standard critique rubric integrated into `KAAMSETU_DESIGN_GOVERNANCE.md`.
- **Dependencies:** None.
- **Verification:** Applied to audit typography and contrast states across all pages.

---

## 3. PERSISTENCE MECHANISM VERIFICATION

Under Antigravity Customization Architecture:
1. Workspace customizations in `.agent/skills/` and `.agents/skills/` are assigned **Priority 1 (Highest)**, overriding global and built-in discovery.
2. Hierarchical project rules in `GEMINI.md`, `AGENTS.md`, and `.agent/rules/design-governance.md` are automatically discovered and loaded whenever any file in the repository is inspected or edited.
3. Every future Antigravity session working in this repository will unconditionally discover and inherit these skills and governance rules.
