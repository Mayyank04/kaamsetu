# KAAMSETU — PHASE 41 ONBOARDING UX REPAIR
**Document ID:** `DOC-P41-ONBOARD-005`  
**Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**Permanent Financial Invariant:** `platform_commission_amount = 0.00` on artisan wages  
**Status:** `VERIFIED WORKING`

---

## 1. Onboarding Pipeline Overview

The KAAMSETU onboarding flow guides informal workers through four intuitive steps:
1. **Step 1:** Vernacular Language & Input Mode Selection (Voice vs Text).
2. **Step 2:** Multilingual Voice Attestation or Text Testimony with Gemini 2.5 Flash extraction.
3. **Step 3:** Interactive Extraction Review & Skills Editor with live Class B geographic PIN code validation.
4. **Step 4:** Minted Sovereign Digital Identity Card with scannable QR verification and printable export.

---

## 2. Reconstructed Step-by-Step UX

### 2.1 Step Indicator Bar
- **Step Buttons:** Circular indicators sized at `w-9 h-9 sm:w-10 sm:h-10` with high-contrast numerals/checkmarks.
- **Progress Track Line:** Centered horizontally behind step circles via `-top-7 sm:-top-9` negative margin.
- **Labels:** Step title text cleanly hides below `sm` (`hidden sm:block`) to avoid cramped wrapping on mobile portrait screens while remaining accessible via `aria-label`.

### 2.2 Step 1: Language Selector (`LanguageSelector`)
- Responsive grid: `grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5`.
- Language buttons display native script prominently (e.g. हिन्दी, অসমীয়া, বাংলা) alongside English subtext.
- Input mode card choices (Voice vs Text) stack into single column on mobile (`grid-cols-1 sm:grid-cols-2`).

### 2.3 Step 2: Audio Recorder (`AudioRecorder`)
- Sizing updated from rigid `p-6` to responsive `p-4 sm:p-6`.
- Large recording pulse button (`h-24 w-24`) designed for comfortable thumb taps.
- Live timer and audio waveform indicator.
- Web Speech API fallback: graceful degradation to text input mode if speech recognition is unsupported by the client browser.
- Quick test sample testimonies for rapid testing in all supported languages.

### 2.4 Step 3: Extraction Review Editor (`ExtractionEditor`)
- Card padding optimized to `p-4 sm:p-6`.
- Basic info row: `grid grid-cols-1 sm:grid-cols-2 gap-4`.
- Location inputs (City, State, PIN code): `grid grid-cols-1 sm:grid-cols-3 gap-2`. Stacks as single column on mobile portrait, three columns on tablet and desktop.
- Live Geographic Scope Banner:
  - Validates PIN code against Class B Controlled Rollout boundaries (Guwahati Urban `781001–781039`, Shillong Urban `793001–793022`).
  - Renders informational notices only upon entering a complete 6-digit PIN to prevent premature validation errors while typing.
- Daily Rate input: `grid grid-cols-1 sm:grid-cols-2 gap-4` with INR prefix formatting.
- Skills Management: Flex-wrap badge container with touch-accessible remove buttons (`p-1`) and inline skill adder.

### 2.5 Step 4: Minted Sovereign Card (`SovereignSuccessCard`)
- Card container padded with `p-4 sm:p-8`.
- Physical credit-card aesthetic with deep forest background and warm sand accents.
- Grid layout: `grid grid-cols-1 md:grid-cols-3 gap-6 items-center`.
- Camera-scannable QR code generated via client-side SVG/canvas.
- Direct links to public profile and on-chain verification endpoint.

---

## 3. Verification & Proof

- Automated test `Extraction editor uses responsive card padding and stacked location inputs` **PASSED**.
- Automated test `Onboarding wizard direct auth modal enforces dynamic viewport constraint` **PASSED**.
- Live server test `GET /onboarding returns HTTP 200 with valid HTML` **PASSED**.
