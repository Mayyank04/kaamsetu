# CONSENT & OTP MODAL REPAIR CERTIFICATION

**Document ID:** `KAAMSETU-DOC-39-6-02`  
**Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**Status:** `VERIFIED LOCALLY`

---

## 1. Architectural Overview

Mobile verification within KAAMSETU represents the cryptographic bridge between unauthenticated craft testimonies and sovereign credential issuance. To comply with the Digital Personal Data Protection Act (DPDP) and sovereign trust standards, verifiable consent is mandatory prior to dispatching authentication challenges.

---

## 2. Consent UI Contract & Implementation

The inline authentication modal in `src/components/onboarding/onboarding-wizard.tsx` has been hardened with the following non-negotiable specifications:

```tsx
{/* Consent Section (Unchecked by default with Terms & Privacy Policy links) */}
<div className="space-y-1.5 text-left pt-1">
  <div className="flex items-start gap-2.5">
    <input
      type="checkbox"
      id="onboarding-modal-consent"
      name="termsAccepted"
      checked={otpFlow.termsAccepted}
      onChange={(e) => otpFlow.setTermsAccepted(e.target.checked)}
      disabled={otpFlow.isLoading}
      aria-invalid={!!(otpFlow.consentError || (!otpFlow.termsAccepted && otpFlow.errorMessage?.includes("Terms of Service")))}
      aria-describedby="onboarding-consent-error"
      className="mt-0.5 h-4 w-4 min-w-[16px] min-h-[16px] shrink-0 rounded-xs border-forest/30 text-forest focus:ring-2 focus:ring-forest/20 accent-[#153E35] cursor-pointer"
    />
    <label
      htmlFor="onboarding-modal-consent"
      className="text-xs text-charcoal-muted leading-relaxed cursor-pointer select-none"
    >
      I agree to the{" "}
      <Link
        href="/terms"
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="text-forest underline font-bold hover:text-forest-600 focus:outline-none focus:ring-1 focus:ring-forest/30 rounded-2xs"
      >
        Terms of Service
      </Link>{" "}
      and{" "}
      <Link
        href="/privacy"
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="text-forest underline font-bold hover:text-forest-600 focus:outline-none focus:ring-1 focus:ring-forest/30 rounded-2xs"
      >
        Privacy Policy
      </Link>
      .
    </label>
  </div>
  {/* Visible inline validation message when checkbox is not selected upon submission attempt */}
  {(otpFlow.consentError || (!otpFlow.termsAccepted && otpFlow.errorMessage?.includes("Terms of Service"))) && (
    <p id="onboarding-consent-error" role="alert" className="text-[11px] text-red-600 font-medium pl-6 animate-in fade-in">
      Please accept the Terms of Service and Privacy Policy to continue.
    </p>
  )}
</div>
```

---

## 3. Key Design Invariants

1. **Unchecked by Default:** In accordance with DPDP regulations, consent is never pre-checked (`checked={false}` upon initialization).
2. **Prevent Bubbling on Legal Navigation:** Links to `/terms` and `/privacy` feature `onClick={(e) => e.stopPropagation()}` to prevent label click triggering that would inadvertently toggle the checkbox.
3. **Dynamic Feedback & Error Clearance:** Toggling the checkbox calls `otpFlow.setTermsAccepted(true)`, which immediately clears both `consentError` and any generic "Terms of Service" error banner.
4. **Mobile Viewport Scroll Guarantee:** The modal container incorporates `max-h-[calc(100vh-2rem)] overflow-y-auto`, ensuring the consent section and primary CTA are fully accessible even on 320px-wide devices or when mobile keyboards are active.
5. **Fail-Closed API Validation:** If a network request bypasses the client UI, `/api/auth/otp/send` validates `termsAccepted === true` and terminates unauthorized requests with HTTP 400 (`CONSENT_REQUIRED`).
