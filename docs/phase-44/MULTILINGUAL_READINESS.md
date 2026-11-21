# KAAMSETU — PHASE 44: MULTILINGUAL READINESS REPORT
**Operating Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**Permanent Financial Invariant:** `platform_commission_amount = 0.00` on artisan wages

---

## 1. Multilingual Architecture Overview

KAAMSETU implements a centralized vernacular localization system in `src/lib/i18n/`:
- `src/lib/i18n/translations.ts`: Typed translation dictionaries for English (`en`), Hindi (`hi`), Assamese (`as`), and Bengali (`bn`).
- `src/lib/i18n/i18n-context.tsx`: Lightweight React context with `localStorage` persistence and fallback.
- `src/components/layout/institutional-header.tsx`: Accessible vernacular dropdown menu (Desktop and Mobile Drawer) with ARIA tags and tactile styling.

---

## 2. Supported Languages & Coverage

| Language | Script | Code | Status | Key Usage |
|---|---|---|---|---|
| **English** | Latin | `en` | 100% Complete | Universal default, institutional reporting |
| **Hindi** | Devanagari | `hi` | 100% Complete | National vernacular, North/Central India |
| **Assamese** | Eastern Nagari | `as` | 100% Complete | Guwahati Pilot Zone, Assam workforce |
| **Bengali** | Eastern Nagari | `bn` | 100% Complete | Shillong / Siliguri / West Bengal workforce |

---

## 3. Anti-AI-Slop Linguistic Governance

All vernacular translations adhere to authentic Indian working vocabulary:
- **No Chatbot Tropes:** Natural artisan phrases used instead of literal machine-translated English idioms.
- **Respectful & Direct:** Avoids inflated startup jargon ("sovereign digital ecosystem") in favor of dignity-first vernacular ("डिजिटल कारीगर पहचान", "প্ৰত্যক্ষ শ্ৰমিক স্বীকৃতি").
