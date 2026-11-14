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
import {
  ShieldCheck,
  ChevronLeft,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Step = 1 | 2 | 3 | 4;

export function OnboardingWizard() {
  const [currentStep, setCurrentStep] = React.useState<Step>(1);
  const [language, setLanguage] = React.useState<SupportedLanguageCode>("hi");
  const [inputMode, setInputMode] = React.useState<"voice" | "text">("voice");
  const [transcript, setTranscript] = React.useState<string>("");

  // Extracted AI data state
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

  const i18n = ONBOARDING_I18N[language] || ONBOARDING_I18N.en;

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

  // Handle Step 3 -> Profile Save via POST /api/worker/onboarding/save
  const handleApprove = async (approved: ApprovedProfileSubmission) => {
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
        throw new Error(
          result.error?.message ||
            result.message ||
            "Unable to save verified profile. Please retry."
        );
      }

      setSovereignCard(result.data);
      setCurrentStep(4);
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

  const handleReset = () => {
    setCurrentStep(1);
    setTranscript("");
    setExtractedProfile(null);
    setSovereignCard(null);
    setAnalysisError(null);
    setSubmitError(null);
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

      {/* Back Button for Steps 2 & 3 */}
      {currentStep > 1 && currentStep < 4 && (
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentStep((prev) => (prev - 1) as Step)}
            disabled={isAnalyzing || isSubmitting}
            className="text-forest hover:text-forest-600 hover:bg-forest/5 gap-1.5 pl-2 font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>
              {language === "hi" ? "पिछला कदम" : "Back"}
            </span>
          </Button>

          <div className="text-xs font-mono text-forest/60">
            {language === "hi"
              ? `कदम ${currentStep} / 4`
              : `Step ${currentStep} of 4`}
          </div>
        </div>
      )}

      {/* Global Error Banner */}
      {(analysisError || submitError) && (
        <div className="p-4 rounded-xl bg-terracotta/10 border border-terracotta/30 flex items-start gap-3 text-terracotta animate-in fade-in-50">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1 text-sm">
            <p className="font-semibold">
              {language === "as"
                ? "ত্ৰুটি ঘটিছে"
                : language === "bn"
                ? "ত্রুটি ঘটেছে"
                : language === "hi"
                ? "त्रुटि आई है"
                : "Action encountered an error"}
            </p>
            <p className="mt-0.5 text-xs text-forest/80">
              {analysisError || submitError}
            </p>
          </div>
          {analysisError ? (
            <Button
              size="sm"
              variant="outline"
              onClick={handleAnalyze}
              className="border-terracotta text-terracotta hover:bg-terracotta/10 h-8 text-xs shrink-0"
            >
              <RefreshCw className="w-3 h-3 mr-1.5" />
              {language === "as"
                ? "পুনৰ চেষ্টা"
                : language === "hi"
                ? "पुनः प्रयास करें"
                : "Retry"}
            </Button>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSubmitError(null)}
              className="text-terracotta hover:bg-terracotta/10 h-8 text-xs shrink-0"
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
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest/5 border border-forest/15 text-forest text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5 text-sand" />
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

      {/* STEP 3: AI Skill Extraction & Interactive Editor */}
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
    </div>
  );
}
