# KAAMSETU — PHASE 50.1: UNIVERSAL TRANSLATOR AUDIT REPORT

**Project:** KAAMSETU — India's Skill Identity and Workforce Platform  
**Target Branch:** `phase-50.1-universal-translator-rebuild`  
**Base Commit:** `1d90fbe` (Phase 50 Master Hardening)  
**Date:** November 24, 2026  
**Auditor:** Principal Full-Stack Engineer, Translation Systems Architect & QA Reliability Lead  

---

## 1. Executive Summary & Diagnostic Scope

A comprehensive source-code and runtime diagnostic audit was conducted across KAAMSETU's translation architecture, speech recognition implementation, audio playback facilities, and user-facing translator components.

Prior to Phase 50.1, while basic text translation existed via `/api/translate`, the user experience suffered from major functional and design deficiencies:
1. **Absence of Pronunciation / Transliteration:** Output was strictly provided in native script alone, leaving users who cannot read the regional script unable to pronounce or read the translation aloud.
2. **Missing English Meaning Layer:** Users translating between regional languages had no independent semantic explanation in English to verify what the translated sentence actually meant.
3. **Flawed Voice Input Flow:** The existing voice widget automatically submitted unconfirmed speech transcripts directly to translation without giving users the opportunity to review, edit, or correct speech-to-text misrecognitions.
4. **Silent Language Fallback in Speech:** Unsupported languages defaulted silently to `"hi-IN"`, producing garbled transcripts when users spoke in Assamese, Bengali, or Dravidian languages on unsupported browser engines.
5. **Speech Synthesis Silent Failures:** TTS assumed native browser voices existed for all regional languages without validating `speechSynthesis.getVoices()`, resulting in silent playback or garbled accents.
6. **No Dedicated Full-Page Workspace:** Translation was confined to a modal dialog or a compact vendor dashboard widget without swap animations, searchable dual dropdowns, or translation history.

---

## 2. Detailed Root-Cause Findings

### Finding 1: Lack of Roman Transliteration Engine
- **Component:** `src/lib/translation/`
- **Severity:** High (Core Usability & Accessibility)
- **Root Cause:** The application had no transliteration module. Indian scripts (Devanagari, Bengali-Assamese, Tamil, Telugu, Kannada, Malayalam, Gujarati, Gurmukhi, Odia) require nuanced syllabic (akshara) mapping to Latin characters.
- **Linguistic Nuance:** In Assamese (`as`), the inherent vowel is `o` ([ɔ]/[o]), and distinctive letters like `ৰ` (U+09F0) and `ৱ` (U+09F1) must map to `r` and `w` (e.g. `নমস্কাৰ` -> `Nomoskar`, `ধন্যবাদ` -> `Dhonyobad`). Treating Assamese as Hindi would incorrectly produce `Namaskara`.

### Finding 2: Lack of Independent English Meaning Layer
- **Component:** `src/lib/translation/` & `src/app/api/translate/route.ts`
- **Severity:** High (Comprehension & Cross-Language Trust)
- **Root Cause:** When an Assamese worker communicates with a Tamil customer, translating Assamese to Tamil gives the customer Tamil script, but leaves both parties without a common bridge language (English) explanation of what was said.
- **Risk:** Previous implementations risked confusing transliteration (pronunciation) with English meaning (semantics).

### Finding 3: Premature Automatic Submission of Voice Transcripts
- **Component:** `src/components/translation/voice-translation-widget.tsx`
- **Severity:** High (Voice UX & Data Accuracy)
- **Root Cause:** In `recognition.onresult`, the code executed: `if (final) { translateSpokenText(final); }`. Any background noise, dialect mispronunciation, or speech recognition error was immediately dispatched to the translation API without user confirmation.

### Finding 4: Silent Fallback to `hi-IN` for Regional Speech Recognition
- **Component:** `src/components/translation/voice-translation-widget.tsx`
- **Severity:** Medium (Linguistic Accuracy)
- **Root Cause:** `getBCP47Tag` returned `map[code] || "hi-IN"`. When an Assamese or Odia speaker triggered speech recognition on a browser lacking the respective speech model, the browser listened using Hindi acoustic models, misinterpreting every syllable.

### Finding 5: Missing TTS Voice Enumeration & Fallback Advisory
- **Component:** `src/components/translation/voice-translation-widget.tsx` & `src/components/translation/translation-dialog.tsx`
- **Severity:** Medium (Audio Feedback)
- **Root Cause:** `new SpeechSynthesisUtterance(text)` was called without checking `window.speechSynthesis.getVoices()`. If the operating system lacked an Assamese or Telugu voice, playback either failed silently or produced jarring American English pronunciation of Indic Unicode strings.

### Finding 6: Primitive Language Selectors & Missing Bidirectional Swap
- **Component:** `src/components/translation/language-pair-selector.tsx`
- **Severity:** Medium (Ergonomics)
- **Root Cause:** Source language was rendered as a static chip without a dropdown. There was no swap button to reverse translation direction and swap input/output text.

---

## 3. Remediation Target State

The Phase 50.1 rebuild transforms KAAMSETU's translation engine into a four-output, learning-friendly workspace:
```
Original User Input
       │
       ▼
[1. Native Script Translation]  (e.g., Assamese: নমস্কাৰ)
       │
       ▼
[2. Roman Transliteration]     (e.g., Pronunciation: Nomoskar)
       │
       ▼
[3. English Meaning]           (e.g., Meaning: Hello / Greetings)
       │
       ▼
[4. Verified Audio Playback]   (Browser TTS with voice validation & fallback advisory)
```
