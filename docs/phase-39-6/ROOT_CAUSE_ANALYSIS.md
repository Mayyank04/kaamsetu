# ROOT-CAUSE ANALYSIS & INCIDENT RECONSTRUCTION REPORT

**Document ID:** `KAAMSETU-DOC-39-6-01`  
**Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**Target Branch:** `phase-39-6-root-cause-complete-recovery`  
**Status:** `VERIFIED LOCALLY`

---

## 1. Executive Forensic Summary

In Phase 39.6, a comprehensive forensic audit was conducted on the two persistent, critical regressions observed in the KAAMSETU platform:

1. **Failure A (OTP Consent Blocker):** On `/onboarding`, the inline verification modal persistently rejected attempts with *"Please accept the Terms of Service and Privacy Policy to continue"*, while users were unable to view or interact with a consent control.
2. **Failure B (Homepage Blurred Image Failure):** On `http://localhost:3001`, the homepage was completely masked by an enlarged, vertically stretched and blurred portrait image filling the entire browser viewport.

This investigation determined the structural root causes across build processes, layout containers, component styling, and runtime execution.

---

## 2. Root-Cause Archaeology: Failure A (OTP Consent Blocker)

### Forensic Timeline & Dual Defect Chain
1. **API & Hook Disconnect:** In Phase 39.4, `/api/auth/otp/send` and `useOtpFlow` were hardened to enforce mandatory legal consent (`termsAccepted === true`) for all registration attempts.
2. **Component Omission in Original Modal:** The inline modal in `src/components/onboarding/onboarding-wizard.tsx` had historically only included the phone number input and the submission button without a checkbox component.
3. **Stale Process Execution on Port 3001:** While code modifications were introduced into the repository in subsequent iterations, the background Node server running on port 3001 (PID 74067) was initialized at 10:38 PM prior to chunk compilation. It continued to serve old static client chunks (`app/onboarding/page.js`) that lacked the consent markup, while hitting the backend API that strictly demanded consent.
4. **CSS & Event Propagation Flaws:** Within the initial checkbox implementation:
   - Clicking legal `Link` elements inside the `<label>` triggered event bubbling, toggling the checkbox back to unchecked immediately after clicking.
   - Arbitrary spacing classes (`pl-6.5`) failed to compile in Tailwind, and absence of explicit container boundaries allowed elements to clip on short screens.

### Permanent Resolution
- Implemented accessible checkbox (`id="onboarding-modal-consent"`, `aria-describedby="onboarding-consent-error"`, `role="alert"`).
- Added `onClick={(e) => e.stopPropagation()}` on all nested legal links (`/terms`, `/privacy`).
- Enforced `max-h-[calc(100vh-2rem)] overflow-y-auto` on the modal card to guarantee full visibility and scrollability on mobile screens (320px–430px).
- Rebuilt and restarted the production server with verified chunk hash `284-9179415f73a6dc47.js`.

---

## 3. Root-Cause Archaeology: Failure B (Blurred Homepage Image)

### Forensic Timeline & Rendering Mechanics
1. **Next.js `<Image fill>` Behavior:** Next.js `<Image fill />` generates an absolute position element with `position: absolute; height: 100%; width: 100%; top: 0; left: 0; right: 0; bottom: 0;`.
2. **Missing Tailwind Scale Classes:** The portrait wrapper in `src/components/identity/professional-card.tsx` used classes `h-18 w-18`. Because `18` (`4.5rem`) was missing from Tailwind CSS's default spacing palette and Tailwind was not configured with custom spacing `18`, the wrapper collapsed to zero height and width in compiled CSS.
3. **Ancestor Stretch Collapse:** In flex and grid containers without explicit min/max container dimensions, the child `<img data-nimg="fill">` resolved its `100%` height and width against the nearest positioned ancestor (the page or grid item), causing a 72px portrait to stretch across the entire viewport and appear heavily pixelated/blurred.

### Permanent Resolution
- Eliminated unconstrained `fill` on portraits in `ProfessionalCard` and `CredentialDialog`.
- Replaced with explicit Next.js dimensions: `width={72} height={72}` on `ProfessionalCard` and `width={96} height={96}` on `CredentialDialog`.
- Enforced strict CSS boundaries: `w-[72px] h-[72px] min-w-[72px] min-h-[72px] max-w-[72px] max-h-[72px]`.
- Verified rendered HTML via `curl -s http://localhost:3001`: `<img width="72" height="72" decoding="async" class="w-full h-full object-cover ...">`.

---

## 4. Root-Cause Summary Matrix

| Failure Mode | Component | Root Cause | Permanent Mechanism |
| :--- | :--- | :--- | :--- |
| **Failure A** | `OnboardingWizard` | Modal lacked checkbox in served bundle; link bubbling toggled checkbox | Accessible checkbox, `stopPropagation` on links, container scroll limits |
| **Failure B** | `ProfessionalCard` | Missing Tailwind `18`, `<Image fill>` expanded to parent viewport | Explicit `width={72} height={72}`, strict pixel bounds, eliminated `fill` |
| **Gemini 404** | `onboarding-extractor` | Deprecated model string `gemini-1.5-flash` in API v1 | Configurable `GEMINI_MODEL`, 5-model candidate chain (`gemini-3.8-flash` to `2.0-flash`) |
| **Gemini 503** | `onboarding-extractor` | Unhandled upstream demand spikes | 8s circuit breaker, bounded 1-retry backoff, faithful deterministic fallback |
