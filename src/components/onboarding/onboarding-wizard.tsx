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
  Eye,
  EyeOff,
  Loader2,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/use-auth";

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

  // Direct Account Creation Modal for unauthenticated artisans (NO OTP)
  const [showDirectAuthModal, setShowDirectAuthModal] = React.useState(false);
  const [authModalMode, setAuthModalMode] = React.useState<"register" | "login">("register");
  const [pendingSubmission, setPendingSubmission] = React.useState<ApprovedProfileSubmission | null>(null);

  // Direct Auth Form State
  const [authFullName, setAuthFullName] = React.useState("");
  const [authEmail, setAuthEmail] = React.useState("");
  const [authPhone, setAuthPhone] = React.useState("");
  const [authPassword, setAuthPassword] = React.useState("");
  const [authConfirmPassword, setAuthConfirmPassword] = React.useState("");
  const [authShowPassword, setAuthShowPassword] = React.useState(false);
  const [authTermsAccepted, setAuthTermsAccepted] = React.useState(false);
  const [authLoading, setAuthLoading] = React.useState(false);
  const [authError, setAuthError] = React.useState<string | null>(null);

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
      // Ignore corrupted localStorage
    }
  }, []);

  // 2. Persist draft state continuously
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (currentStep < 4) {
      try {
        localStorage.setItem(
          STORAGE_DRAFT_KEY,
          JSON.stringify({
            currentStep,
            language,
            inputMode,
            transcript,
            extractedProfile,
            savedAt: new Date().toISOString(),
          })
        );
      } catch {
        // Ignore quota limits
      }
    }
  }, [currentStep, language, inputMode, transcript, extractedProfile]);

  // Step 1: Language & Mode Selection
  const handleSelectLanguage = (lang: SupportedLanguageCode) => {
    setLanguage(lang);
  };

  const handleSelectMode = (mode: "voice" | "text") => {
    setInputMode(mode);
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Step 2: Analysis of Audio or Text Input
  const handleAnalyze = async (audioBlob?: Blob, textInput?: string) => {
    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      let response: Response;

      if (audioBlob) {
        const formData = new FormData();
        formData.append("audio", audioBlob, "recording.webm");
        formData.append("language", language);

        response = await fetch("/api/ai/extract-skill", {
          method: "POST",
          body: formData,
        });
      } else if (textInput) {
        response = await fetch("/api/ai/extract-skill", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: textInput, language }),
        });
      } else {
        throw new Error("No input provided for analysis.");
      }

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
          setAuthFullName(approved.fullName || "");
          setShowDirectAuthModal(true);
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

  // Step 3: Check auth before save, opening direct registration modal if unauthenticated
  const handleApprove = async (approved: ApprovedProfileSubmission) => {
    if (!isAuthenticated) {
      setPendingSubmission(approved);
      setAuthFullName(approved.fullName || "");
      setShowDirectAuthModal(true);
      return;
    }

    await executeSave(approved);
  };

  // Direct Auth Modal Submit (Register or Login without OTP)
  const handleDirectAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (authModalMode === "register") {
      if (!authFullName.trim() || authFullName.trim().length < 2) {
        setAuthError("Full name must be at least 2 characters.");
        return;
      }
      if (!authEmail.trim() || !authEmail.includes("@")) {
        setAuthError("Please enter a valid email address.");
        return;
      }
      if (!authPassword || authPassword.length < 8) {
        setAuthError("Password must be at least 8 characters long.");
        return;
      }
      if (authPassword !== authConfirmPassword) {
        setAuthError("Passwords do not match.");
        return;
      }
      if (!authTermsAccepted) {
        setAuthError("Please accept the Terms of Service and Privacy Policy to continue.");
        return;
      }

      setAuthLoading(true);
      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: authFullName.trim(),
            email: authEmail.trim().toLowerCase(),
            password: authPassword,
            confirmPassword: authConfirmPassword,
            phone: authPhone.trim() ? authPhone.trim() : undefined,
            role: "worker",
            termsAccepted: true,
            privacyAccepted: true,
          }),
        });

        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to create account.");
        }

        await refreshSession();
        setShowDirectAuthModal(false);

        // Immediately execute profile save now that user is authenticated
        if (pendingSubmission) {
          await executeSave(pendingSubmission);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Registration failed.";
        setAuthError(msg);
      } finally {
        setAuthLoading(false);
      }
    } else {
      // Login mode
      if (!authEmail.trim()) {
        setAuthError("Please enter your email or mobile number.");
        return;
      }
      if (!authPassword) {
        setAuthError("Please enter your password.");
        return;
      }

      setAuthLoading(true);
      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            identifier: authEmail.trim(),
            password: authPassword,
          }),
        });

        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.message || "Invalid credentials.");
        }

        await refreshSession();
        setShowDirectAuthModal(false);

        // Immediately execute profile save
        if (pendingSubmission) {
          await executeSave(pendingSubmission);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Sign in failed.";
        setAuthError(msg);
      } finally {
        setAuthLoading(false);
      }
    }
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
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                  }}
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    isCompleted
                      ? "bg-forest text-ivory ring-2 ring-forest"
                      : isCurrent
                      ? "bg-sand text-forest ring-2 ring-forest shadow-sm"
                      : "bg-surface-elevated text-charcoal-muted border border-forest/20"
                  }`}
                  aria-label={`Step ${stepNumber}: ${stepTitles[stepNumber].en}`}
                >
                  {isCompleted ? <Check className="w-4 h-4 text-ivory" /> : stepNumber}
                </button>
                <span
                  className={`mt-1.5 text-[11px] font-medium hidden sm:block ${
                    isCurrent ? "text-forest font-bold" : "text-charcoal-muted"
                  }`}
                >
                  {stepTitles[stepNumber][language === "hi" ? "hi" : "en"]}
                </span>
              </div>
            );
          })}
        </div>

        {/* Progress Bar Line */}
        <div className="max-w-xl mx-auto h-0.5 bg-forest/15 relative -top-7 sm:-top-9 -z-10">
          <div
            className="h-full bg-forest transition-all duration-300"
            style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* Analysis or Submission Error Alert */}
      {(analysisError || submitError) && (
        <div className="p-4 rounded-md bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold">Unable to proceed:</span>
            <p className="text-red-700">{analysisError || submitError}</p>
          </div>
        </div>
      )}

      {/* STEP 1: Language & Input Mode Selection */}
      {currentStep === 1 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xs bg-forest/5 border border-forest/15 text-forest text-xs font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-forest" />
              <span>STEP 1 OF 4: VERNACULAR ONBOARDING</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-forest tracking-tight">
              {i18n.step1Title}
            </h1>
            <p className="text-forest/75 text-xs sm:text-sm leading-relaxed">
              {i18n.step1Subtitle}
            </p>
          </div>

          <LanguageSelector
            selectedLanguage={language}
            onSelectLanguage={handleSelectLanguage}
            inputMode={inputMode}
            onSelectInputMode={setInputMode}
            onContinue={() => {
              setCurrentStep(2);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </div>
      )}

      {/* STEP 2: Audio Voice Recording or Vernacular Text Input */}
      {currentStep === 2 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setCurrentStep(1);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest hover:text-forest-600 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Change Language / Mode</span>
            </button>

            <span className="text-[11px] font-mono text-charcoal-muted uppercase">
              {language.toUpperCase()} • {inputMode.toUpperCase()}
            </span>
          </div>

          <div className="text-center space-y-2 max-w-xl mx-auto">
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

      {/* DIRECT AUTHENTICATION MODAL (Triggered when unauthenticated artisan approves Step 3 — ZERO OTP) */}
      {showDirectAuthModal && (
        <div className="fixed inset-0 z-50 bg-forest-950/75 flex items-center justify-center p-4 animate-in fade-in overflow-y-auto">
          <div className="bg-card w-full max-w-md rounded-md border border-forest/20 p-4 sm:p-6 shadow-sovereign-md space-y-4 relative my-auto max-h-[calc(100dvh-2rem)] overflow-y-auto">
            <button
              type="button"
              onClick={() => {
                setShowDirectAuthModal(false);
                setAuthError(null);
              }}
              className="absolute right-4 top-4 text-charcoal-muted hover:text-forest transition-colors p-1"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1.5 text-center">
              <div className="w-11 h-11 rounded-xs bg-forest/10 border border-forest/20 text-forest mx-auto flex items-center justify-center">
                <UserCheck className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-forest">
                {authModalMode === "register" ? "Save Your Skill Profile" : "Sign In to Save Profile"}
              </h3>
              <p className="text-xs text-charcoal-muted leading-relaxed">
                {authModalMode === "register"
                  ? "Create an account to securely save your digital work profile. No OTP or SMS required."
                  : "Sign in with your email or mobile number and password to complete your profile registration."}
              </p>
            </div>

            {/* Mode Switcher */}
            <div className="flex border-b border-forest/15">
              <button
                type="button"
                onClick={() => {
                  setAuthModalMode("register");
                  setAuthError(null);
                }}
                className={`flex-1 py-2 text-xs font-semibold text-center border-b-2 transition-colors ${
                  authModalMode === "register"
                    ? "border-forest text-forest"
                    : "border-transparent text-charcoal-muted hover:text-forest"
                }`}
              >
                Create Account
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthModalMode("login");
                  setAuthError(null);
                }}
                className={`flex-1 py-2 text-xs font-semibold text-center border-b-2 transition-colors ${
                  authModalMode === "login"
                    ? "border-forest text-forest"
                    : "border-transparent text-charcoal-muted hover:text-forest"
                }`}
              >
                Sign In
              </button>
            </div>

            {/* Error Banner */}
            {authError && (
              <div className="p-3 rounded-xs bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                <span className="flex-1 text-[12px]">{authError}</span>
              </div>
            )}

            <form onSubmit={handleDirectAuthSubmit} className="space-y-3.5">
              {authModalMode === "register" ? (
                <>
                  {/* Full Name */}
                  <div className="space-y-1 text-left">
                    <label className="text-xs font-medium text-charcoal block">
                      Full Legal Name
                    </label>
                    <input
                      type="text"
                      required
                      value={authFullName}
                      onChange={(e) => setAuthFullName(e.target.value)}
                      placeholder="e.g. Ramesh Sharma"
                      className="w-full h-10 px-3 text-xs bg-surface border border-forest/20 rounded-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-forest"
                    />
                  </div>

                  {/* Email Address */}
                  <div className="space-y-1 text-left">
                    <label className="text-xs font-medium text-charcoal block">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="ramesh@example.com"
                      className="w-full h-10 px-3 text-xs bg-surface border border-forest/20 rounded-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-forest"
                    />
                  </div>

                  {/* Optional Mobile Number */}
                  <div className="space-y-1 text-left">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-charcoal">
                        Mobile Number (Optional contact detail)
                      </label>
                      <span className="text-[10px] text-charcoal-muted">No OTP required</span>
                    </div>
                    <input
                      type="tel"
                      value={authPhone}
                      onChange={(e) => setAuthPhone(e.target.value)}
                      placeholder="9876543210"
                      maxLength={10}
                      className="w-full h-10 px-3 text-xs font-mono bg-surface border border-forest/20 rounded-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-forest"
                    />
                  </div>

                  {/* Password */}
                  <div className="space-y-1 text-left">
                    <label className="text-xs font-medium text-charcoal block">
                      Password (min 8 characters)
                    </label>
                    <div className="relative">
                      <input
                        type={authShowPassword ? "text" : "password"}
                        required
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        placeholder="Choose a secure password"
                        className="w-full h-10 px-3 pr-9 text-xs bg-surface border border-forest/20 rounded-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-forest"
                      />
                      <button
                        type="button"
                        onClick={() => setAuthShowPassword(!authShowPassword)}
                        className="absolute right-2.5 top-2.5 text-charcoal-muted hover:text-forest"
                        tabIndex={-1}
                      >
                        {authShowPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1 text-left">
                    <label className="text-xs font-medium text-charcoal block">
                      Confirm Password
                    </label>
                    <input
                      type={authShowPassword ? "text" : "password"}
                      required
                      value={authConfirmPassword}
                      onChange={(e) => setAuthConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full h-10 px-3 text-xs bg-surface border border-forest/20 rounded-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-forest"
                    />
                  </div>

                  {/* Consent */}
                  <div className="pt-1 text-left space-y-1">
                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        id="onboarding-modal-consent"
                        name="termsAccepted"
                        required
                        checked={authTermsAccepted}
                        onChange={(e) => setAuthTermsAccepted(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded-xs border-forest/30 text-forest focus:ring-forest cursor-pointer"
                      />
                      <label htmlFor="onboarding-modal-consent" className="text-[11px] text-charcoal-muted leading-relaxed cursor-pointer select-none">
                        I agree to the{" "}
                        <Link href="/terms" target="_blank" onClick={(e) => e.stopPropagation()} className="font-semibold text-forest underline">
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" target="_blank" onClick={(e) => e.stopPropagation()} className="font-semibold text-forest underline">
                          Privacy Policy
                        </Link>
                        .
                      </label>
                    </div>
                    {authError && authError.includes("Terms of Service") && (
                      <p id="onboarding-consent-error" role="alert" className="text-[11px] text-red-600 font-medium pl-6 animate-in fade-in">
                        Please accept the Terms of Service and Privacy Policy to continue.
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Login Form */}
                  <div className="space-y-1 text-left">
                    <label className="text-xs font-medium text-charcoal block">
                      Email or Mobile Number
                    </label>
                    <input
                      type="text"
                      required
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="ramesh@example.com or 9876543210"
                      className="w-full h-10 px-3 text-xs bg-surface border border-forest/20 rounded-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-forest"
                    />
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="text-xs font-medium text-charcoal block">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={authShowPassword ? "text" : "password"}
                        required
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        placeholder="Enter password"
                        className="w-full h-10 px-3 pr-9 text-xs bg-surface border border-forest/20 rounded-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-forest"
                      />
                      <button
                        type="button"
                        onClick={() => setAuthShowPassword(!authShowPassword)}
                        className="absolute right-2.5 top-2.5 text-charcoal-muted hover:text-forest"
                        tabIndex={-1}
                      >
                        {authShowPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              <Button
                type="submit"
                disabled={authLoading}
                className="w-full h-11 bg-forest hover:bg-forest-600 text-ivory text-xs font-semibold rounded-xs shadow-xs transition-colors flex items-center justify-center gap-2 mt-2"
              >
                {authLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{authModalMode === "register" ? "Creating & Saving..." : "Signing In..."}</span>
                  </>
                ) : (
                  <>
                    <span>{authModalMode === "register" ? "Create Account & Save Profile" : "Sign In & Save Profile"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
