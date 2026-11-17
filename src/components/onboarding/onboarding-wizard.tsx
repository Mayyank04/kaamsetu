"use client";

import * as React from "react";
import {
  SupportedLanguageCode,
  OnboardingExtractedProfile,
  ApprovedProfileSubmission,
} from "@/schemas/onboarding.schema";
import { ONBOARDING_I18N } from "@/lib/i18n/onboarding";
import { LanguageSelector } from "@/components/onboarding/language-selector";
import { AudioRecorder } from "@/components/onboarding/audio-recorder";
import { ExtractionEditor } from "@/components/onboarding/extraction-editor";
import {
  SovereignSuccessCard,
  SovereignCardData,
} from "@/components/onboarding/sovereign-success-card";
import Link from "next/link";
import {
  ShieldCheck,
  ChevronLeft,
  RotateCcw,
  Mic,
  AlertCircle,
  RefreshCw,
  Check,
  Smartphone,
  Lock,
  ArrowRight,
  X,
  Clock,
  Copy,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/use-auth";
import { useOtpFlow } from "@/lib/auth/use-otp-flow";

type Step = 1 | 2 | 3 | 4;

const STORAGE_DRAFT_KEY = "kaamsetu_onboarding_draft";

export function OnboardingWizard() {
  const { user, isAuthenticated, refreshSession } = useAuth();

  const [currentStep, setCurrentStep] = React.useState<Step>(1);
  const [language, setLanguage] = React.useState<SupportedLanguageCode>("hi");
  const [inputMode, setInputMode] = React.useState<"voice" | "text">("voice");
  const [transcript, setTranscript] = React.useState<string>("");

  // Extracted data state
  const [extractedProfile, setExtractedProfile] =
    React.useState<OnboardingExtractedProfile | null>(null);

  // Minted Sovereign Card data state
  const [sovereignCard, setSovereignCard] =
    React.useState<SovereignCardData | null>(null);

  // Loading & Error states
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [analysisError, setAnalysisError] = React.useState<string | null>(null);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [draftRestored, setDraftRestored] = React.useState(false);

  // Inline Auth Verification Modal for unauthenticated artisans
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const [pendingSubmission, setPendingSubmission] = React.useState<ApprovedProfileSubmission | null>(null);

  const otpFlow = useOtpFlow({
    role: "worker",
    intent: "registration",
    storageKey: "kaamsetu_onboarding_otp",
    onSuccess: async () => {
      await refreshSession();
      setShowAuthModal(false);
      if (pendingSubmission) {
        await executeSave(pendingSubmission);
      }
    },
  });

  const i18n = ONBOARDING_I18N[language] || ONBOARDING_I18N.en;

  // 1. Restore draft from localStorage on mount
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem(STORAGE_DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.currentStep && parsed.currentStep <= 3) {
          setCurrentStep(parsed.currentStep);
          if (parsed.language) setLanguage(parsed.language);
          if (parsed.inputMode) setInputMode(parsed.inputMode);
          if (parsed.transcript) setTranscript(parsed.transcript);
          if (parsed.extractedProfile) setExtractedProfile(parsed.extractedProfile);
          setDraftRestored(true);
        }
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // 2. Persist draft state to localStorage
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (currentStep < 4 && (currentStep > 1 || transcript || extractedProfile)) {
        localStorage.setItem(
          STORAGE_DRAFT_KEY,
          JSON.stringify({
            currentStep,
            language,
            inputMode,
            transcript,
            extractedProfile,
          })
        );
      } else if (currentStep === 4) {
        localStorage.removeItem(STORAGE_DRAFT_KEY);
      }
    } catch {
      // Ignore storage errors
    }
  }, [currentStep, language, inputMode, transcript, extractedProfile]);

  // Handle Step 2 -> AI Extraction via POST /api/worker/onboarding/extract
  const handleAnalyze = async () => {
    if (!transcript.trim() || transcript.trim().length < 10) {
      setAnalysisError(
        language === "hi"
          ? "कृपया अपने काम के बारे में कम से कम 10 अक्षर बोलें या लिखें।"
          : "Please describe your work with at least 10 characters."
      );
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const response = await fetch("/api/worker/onboarding/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: transcript.trim(),
          language,
          inputMode,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error?.message ||
            result.message ||
            "Unable to analyze testimony. Please try again."
        );
      }

      setExtractedProfile(result.data);
      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      console.error("AI extraction error:", err);
      const message =
        err instanceof Error ? err.message : "Error analyzing testimony.";
      setAnalysisError(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Execute authenticated profile save to POST /api/worker/onboarding/save
  const executeSave = async (approved: ApprovedProfileSubmission) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/worker/onboarding/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(approved),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        if (response.status === 401 || result.error?.code === "UNAUTHENTICATED") {
          setPendingSubmission(approved);
          setShowAuthModal(true);
          return;
        }
        throw new Error(
          result.error?.message ||
            result.message ||
            result.error ||
            "Unable to save verified profile. Please retry."
        );
      }

      setSovereignCard(result.data);
      setCurrentStep(4);
      localStorage.removeItem(STORAGE_DRAFT_KEY);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      console.error("Profile submission error:", err);
      const message =
        err instanceof Error ? err.message : "Error saving profile.";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 3: Check auth before save, opening inline phone verification if unauthenticated
  const handleApprove = async (approved: ApprovedProfileSubmission) => {
    if (!isAuthenticated) {
      setPendingSubmission(approved);
      otpFlow.setFullName(approved.fullName || "");
      setShowAuthModal(true);
      return;
    }

    await executeSave(approved);
  };

  // Inline Modal: Send OTP
  const handleSendInlineOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpFlow.isCooldown && otpFlow.hasActiveChallenge) {
      otpFlow.setStep(2);
      return;
    }
    await otpFlow.requestOtp(undefined, pendingSubmission?.fullName);
  };

  // Inline Modal: Verify OTP & Auto-Save Profile
  const handleVerifyInlineOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    await otpFlow.verifyCode();
  };

  const handleReset = () => {
    setCurrentStep(1);
    setTranscript("");
    setExtractedProfile(null);
    setSovereignCard(null);
    setAnalysisError(null);
    setSubmitError(null);
    setDraftRestored(false);
    localStorage.removeItem(STORAGE_DRAFT_KEY);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Step metadata
  const stepTitles: Record<Step, { en: string; hi: string }> = {
    1: { en: "Language & Mode", hi: "भाषा और माध्यम" },
    2: { en: "Describe Craft", hi: "काम का विवरण" },
    3: { en: "Review & Skills", hi: "हुनर और समीक्षा" },
    4: { en: "Sovereign Credential", hi: "सॉवरेन पहचान पत्र" },
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* Draft Restored Banner */}
      {draftRestored && currentStep > 1 && (
        <div className="p-3 rounded-md bg-forest/5 border border-forest/15 text-xs text-forest flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-forest shrink-0" />
            <span>Resumed your saved onboarding session. Previous steps are preserved.</span>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="text-[11px] font-semibold text-terracotta underline shrink-0 hover:opacity-80"
          >
            Start Fresh
          </button>
        </div>
      )}

      {/* Step Indicator Bar */}
      <div className="relative">
        <div className="flex items-center justify-between max-w-2xl mx-auto mb-2">
          {([1, 2, 3, 4] as Step[]).map((stepNumber) => {
            const isCompleted = currentStep > stepNumber;
            const isCurrent = currentStep === stepNumber;
            return (
              <div key={stepNumber} className="flex flex-col items-center">
                <button
                  type="button"
                  disabled={stepNumber > currentStep || isAnalyzing || isSubmitting}
                  onClick={() => {
                    if (stepNumber < currentStep) {
                      setCurrentStep(stepNumber);
                    }
                  }}
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all ${
                    isCompleted
                      ? "bg-forest text-sand border-2 border-forest hover:bg-forest-600"
                      : isCurrent
                      ? "bg-sand text-forest border-2 border-forest shadow-sovereign-sm"
                      : "bg-ivory border-2 border-forest/20 text-forest/40"
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : stepNumber}
                </button>
                <span
                  className={`mt-2 text-[11px] sm:text-xs font-medium tracking-tight text-center hidden sm:block ${
                    isCurrent
                      ? "text-forest font-bold"
                      : isCompleted
                      ? "text-forest/80"
                      : "text-forest/40"
                  }`}
                >
                  {language === "hi"
                    ? stepTitles[stepNumber].hi
                    : stepTitles[stepNumber].en}
                </span>
              </div>
            );
          })}
        </div>

        {/* Progress track behind steps */}
        <div className="absolute top-4 sm:top-5 left-8 right-8 h-0.5 bg-forest/15 -z-10" />
      </div>

      {/* Error Banners */}
      {(analysisError || submitError) && (
        <div className="p-4 rounded-md bg-red-50 border border-red-200 text-red-900 text-xs flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span className="leading-relaxed font-medium">
              {analysisError || submitError}
            </span>
          </div>
          {analysisError ? (
            <Button
              size="sm"
              variant="outline"
              onClick={handleAnalyze}
              className="border-red-300 text-red-800 hover:bg-red-100 h-8 text-xs shrink-0"
            >
              <RefreshCw className="w-3 h-3 mr-1.5" />
              Retry
            </Button>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSubmitError(null)}
              className="text-red-700 hover:bg-red-100 h-8 text-xs shrink-0"
            >
              Dismiss
            </Button>
          )}
        </div>
      )}

      {/* STEP 1: Language & Input Mode Selection */}
      {currentStep === 1 && (
        <div className="animate-in fade-in duration-300">
          <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest/5 border border-forest/15 text-forest text-xs font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-sand-500" />
              <span>STEP 1 OF 4</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-forest tracking-tight">
              {i18n.step1Title}
            </h1>
            <p className="text-forest/75 text-sm sm:text-base leading-relaxed">
              {i18n.step1Subtitle}
            </p>
          </div>

          <LanguageSelector
            selectedLanguage={language}
            onSelectLanguage={setLanguage}
            inputMode={inputMode}
            onSelectInputMode={setInputMode}
            onContinue={() => setCurrentStep(2)}
          />
        </div>
      )}

      {/* STEP 2: Spoken or Typed Craft Attestation */}
      {currentStep === 2 && (
        <div className="animate-in fade-in duration-300">
          <div className="text-center max-w-xl mx-auto mb-6 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xs bg-forest/5 border border-forest/15 text-forest text-xs font-mono">
              <Mic className="w-3.5 h-3.5 text-forest" />
              <span>STEP 2 OF 4: {inputMode === "voice" ? "VOICE ATTESTATION" : "TEXT ATTESTATION"}</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-forest tracking-tight">
              {i18n.step2Title}
            </h2>
            <p className="text-forest/75 text-xs sm:text-sm leading-relaxed">
              {i18n.step2Subtitle}
            </p>
          </div>

          <AudioRecorder
            language={language}
            transcript={transcript}
            onChangeTranscript={setTranscript}
            onAnalyze={handleAnalyze}
            isAnalyzing={isAnalyzing}
            inputMode={inputMode}
          />
        </div>
      )}

      {/* STEP 3: Interactive Review & Skills Editor */}
      {currentStep === 3 && extractedProfile && (
        <div className="animate-in fade-in duration-300">
          <ExtractionEditor
            language={language}
            extractedData={extractedProfile}
            voiceTranscript={transcript}
            onApprove={handleApprove}
            isSubmitting={isSubmitting}
          />
        </div>
      )}

      {/* STEP 4: Minted Sovereign Credential Card */}
      {currentStep === 4 && sovereignCard && (
        <div className="animate-in fade-in duration-300">
          <SovereignSuccessCard
            cardData={sovereignCard}
            language={language}
            onReset={handleReset}
          />
        </div>
      )}

      {/* INLINE AUTHENTICATION MODAL (Triggered when unauthenticated artisan approves Step 3) */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-forest-950/75 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-card w-full max-w-md rounded-md border border-forest/20 p-6 sm:p-8 shadow-sovereign-md space-y-5 relative">
            <button
              type="button"
              onClick={() => setShowAuthModal(false)}
              className="absolute right-4 top-4 text-charcoal-muted hover:text-forest transition-colors p-1"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1.5 text-center">
              <div className="w-12 h-12 rounded-xs bg-forest/10 border border-forest/20 text-forest mx-auto flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-forest">
                Verify Mobile Number
              </h3>
              <p className="text-xs text-charcoal-muted leading-relaxed">
                To issue your official cryptographic sovereign credential: Verify your mobile number to securely save your skill profile. Your information will remain available when you return.
              </p>
            </div>

            {/* Error Banner */}
            {otpFlow.errorMessage && (
              <div className="p-3 rounded-xs bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                <div className="flex-1 space-y-1">
                  <span>{otpFlow.errorMessage}</span>
                  {otpFlow.isCooldown && otpFlow.step === 1 && (
                    <div className="text-[11px] font-medium text-red-700 flex items-center gap-1 pt-0.5">
                      <Clock className="w-3.5 h-3.5 text-red-600" />
                      <span>Retry in {otpFlow.cooldownSeconds}s</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Sandbox Disclosure & Helper */}
            {otpFlow.isSandbox && otpFlow.sandboxCode && (
              <div className="p-3.5 rounded-xs bg-sand/20 border border-sand-600/30 text-xs text-forest space-y-2.5 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] text-forest">
                    <ShieldCheck className="w-4 h-4 text-forest" />
                    <span>Sandbox Test Mode</span>
                  </div>
                  <span className="text-[10px] bg-sand/40 text-forest font-semibold px-2 py-0.5 rounded-xs border border-sand/60">
                    No SMS Sent
                  </span>
                </div>
                <p className="text-[11px] text-charcoal-muted leading-relaxed">
                  SMS dispatch is disabled in this environment. Use the active verification test code below:
                </p>
                <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xs border border-forest/15 shadow-2xs">
                  <span className="font-mono text-base font-bold tracking-widest text-forest">
                    {otpFlow.sandboxCode}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={otpFlow.autoFillSandboxCode}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-forest/10 hover:bg-forest/20 text-forest rounded-xs transition-colors"
                    >
                      Auto-fill
                    </button>
                    <button
                      type="button"
                      onClick={otpFlow.copySandboxCode}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-forest hover:bg-forest-600 text-ivory rounded-xs transition-colors flex items-center gap-1"
                    >
                      {otpFlow.copiedCode ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Non-sandbox Info Notice */}
            {!otpFlow.isSandbox && otpFlow.infoMessage && !otpFlow.errorMessage && (
              <div className="p-3 rounded-xs bg-forest/5 border border-forest/20 text-xs text-forest flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 text-forest" />
                <span>{otpFlow.infoMessage}</span>
              </div>
            )}

            {otpFlow.step === 1 ? (
              <form onSubmit={handleSendInlineOtp} className="space-y-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-bold text-forest uppercase tracking-wider block">
                    Indian Mobile Number
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3.5 rounded-l-xs border border-r-0 border-forest/20 bg-forest/5 text-xs font-mono font-bold text-forest">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      placeholder="98765 43210"
                      value={otpFlow.phone}
                      onChange={(e) => otpFlow.setPhone(e.target.value)}
                      disabled={otpFlow.isLoading}
                      className="w-full h-11 px-3.5 rounded-r-xs border border-forest/20 text-xs bg-background focus:outline-none focus:ring-2 focus:ring-forest/20 font-mono"
                    />
                  </div>
                  {/* Inline validation feedback for invalid Indian mobile */}
                  {otpFlow.phone.trim().length > 0 && !otpFlow.isPhoneValid && (
                    <p className="text-[11px] text-red-600 font-medium pt-1">
                      Enter a valid 10-digit Indian mobile number beginning with 6, 7, 8 or 9.
                    </p>
                  )}
                </div>

                {/* Sandbox Disclosure on Step 1 */}
                {otpFlow.isSandbox && (
                  <div className="p-2.5 rounded-xs bg-sand/20 border border-sand-600/30 text-[11px] text-forest flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold">
                      <ShieldCheck className="w-3.5 h-3.5 text-forest shrink-0" />
                      <span>Sandbox Verification Mode</span>
                    </div>
                    <span className="text-[10px] bg-sand/40 text-forest font-semibold px-2 py-0.5 rounded-xs border border-sand/60">
                      Simulated SMS
                    </span>
                  </div>
                )}

                <Button
                  type={otpFlow.isCooldown && otpFlow.hasActiveChallenge ? "button" : "submit"}
                  onClick={
                    otpFlow.isCooldown && otpFlow.hasActiveChallenge
                      ? () => otpFlow.setStep(2)
                      : undefined
                  }
                  disabled={
                    otpFlow.isLoading ||
                    (!otpFlow.isPhoneValid && (!otpFlow.isCooldown || !otpFlow.hasActiveChallenge)) ||
                    (otpFlow.isCooldown && !otpFlow.hasActiveChallenge)
                  }
                  className="w-full h-11 bg-forest hover:bg-forest-500 text-ivory font-bold text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>{otpFlow.getPrimaryButtonText()}</span>
                  {!otpFlow.isLoading && !otpFlow.isCooldown && (
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  )}
                </Button>

                {otpFlow.hasActiveChallenge && (
                  <button
                    type="button"
                    onClick={() => otpFlow.setStep(2)}
                    className="w-full text-center text-xs text-forest underline hover:text-forest-600 font-semibold"
                  >
                    Already have a verification code? Enter code →
                  </button>
                )}
              </form>
            ) : (
              <form onSubmit={handleVerifyInlineOtp} className="space-y-4">
                <div className="space-y-1.5 text-left">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-forest uppercase tracking-wider block">
                      Enter 6-Digit Code
                    </label>
                    <span className="text-[11px] text-charcoal-muted font-mono">
                      +91 {otpFlow.phone.replace(/\D/g, "").slice(-10)}
                    </span>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={otpFlow.otp}
                    onChange={(e) => otpFlow.setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    autoFocus
                    className="w-full h-12 text-center tracking-widest text-lg font-mono font-bold rounded-xs border border-forest/20 bg-background focus:outline-none focus:ring-2 focus:ring-forest/20"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={otpFlow.editPhone}
                    disabled={otpFlow.isLoading}
                    className="flex-1 h-11 border-forest/20 text-forest text-xs"
                  >
                    Change Number
                  </Button>
                  <Button
                    type="submit"
                    disabled={otpFlow.isLoading || otpFlow.otp.length !== 6}
                    className="flex-1 h-11 bg-forest hover:bg-forest-500 text-ivory font-bold text-xs"
                  >
                    {otpFlow.isLoading ? "Verifying..." : "Verify & Mint Credential"}
                  </Button>
                </div>

                {/* Resend Action with Active Ticking Timer */}
                <div className="text-center pt-1">
                  {otpFlow.isCooldown ? (
                    <div className="text-xs text-charcoal-muted flex items-center justify-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-forest" />
                      <span>Resend code in</span>
                      <span className="font-mono font-bold text-forest">{otpFlow.cooldownSeconds}s</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => otpFlow.requestOtp()}
                      disabled={otpFlow.isLoading}
                      className="text-xs text-forest underline hover:text-forest-600 font-semibold"
                    >
                      Resend Verification Code
                    </button>
                  )}
                </div>

                {/* Terms and Privacy policy links */}
                <div className="text-center text-[10px] text-charcoal-muted space-x-1 pt-1">
                  <span>By verifying, you accept the</span>
                  <Link href="/terms" target="_blank" className="underline hover:text-forest">Terms</Link>
                  <span>and</span>
                  <Link href="/privacy" target="_blank" className="underline hover:text-forest">Privacy Policy</Link>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
