"use client";

import * as React from "react";
import {
  Languages,
  RotateCcw,
  Copy,
  Check,
  Volume2,
  AlertCircle,
  MessageSquareWarning,
  Loader2,
  Info,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n/i18n-context";
import { ALL_TRANSLATION_CAPABILITIES } from "@/lib/translation/registry";
import { TranslationContentType } from "@/lib/translation/types";
import { LanguagePairSelector } from "./language-pair-selector";

interface TranslatedContentProps {
  content: string;
  contentType?: TranslationContentType;
  defaultTargetLanguage?: string;
  isPrivate?: boolean;
  className?: string;
  textClassName?: string;
}

export function TranslatedContent({
  content,
  contentType = "general",
  defaultTargetLanguage = "hi",
  isPrivate = false,
  className = "",
  textClassName = "",
}: TranslatedContentProps) {
  const { locale } = useTranslation();
  const [targetLang, setTargetLang] = React.useState(
    locale !== "en" ? locale : defaultTargetLanguage
  );
  const [sourceLang, setSourceLang] = React.useState<string>("auto");
  const [translatedText, setTranslatedText] = React.useState<string | null>(null);
  const [detectedSource, setDetectedSource] = React.useState<string | null>(null);
  const [disclaimer, setDisclaimer] = React.useState<string | null>(null);
  const [isTranslating, setIsTranslating] = React.useState(false);
  const [showOriginal, setShowOriginal] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = React.useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = React.useState(false);

  const performTranslation = async (target: string) => {
    setIsTranslating(true);
    setError(null);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: content,
          sourceLanguage: sourceLang,
          targetLanguage: target,
          contentType,
          isPrivate,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Translation request failed.");
      }

      setTranslatedText(json.data.translatedText);
      setDetectedSource(json.data.detectedSourceLanguage);
      setDisclaimer(json.data.disclaimer);
      setShowOriginal(false);
    } catch (err: any) {
      console.error("[TranslatedContent] Error translating text:", err);
      setError(err.message || "Failed to translate content. Please retry.");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleCopy = () => {
    const textToCopy = showOriginal ? content : translatedText || content;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSpeech = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const textToSpeak = showOriginal ? content : translatedText || content;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = showOriginal
      ? detectedSource || "hi-IN"
      : targetLang === "en"
      ? "en-IN"
      : `${targetLang}-IN`;
    window.speechSynthesis.speak(utterance);
  };

  const sourceCap = (detectedSource ? ALL_TRANSLATION_CAPABILITIES[detectedSource] : null) || {
    name: detectedSource || "Original",
    nativeName: "",
  };
  const targetCap = (targetLang ? ALL_TRANSLATION_CAPABILITIES[targetLang] : null) || ALL_TRANSLATION_CAPABILITIES.hi;
  const isTargetRTL = targetCap.direction === "rtl";

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Content Render Area */}
      <div
        className={`relative ${
          !showOriginal && translatedText ? "bg-warm-ivory/60 p-3 rounded border border-forest/15" : ""
        }`}
      >
        {/* Active Translation Indicator Bar */}
        {!showOriginal && translatedText && (
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2 border-b border-forest/10 text-xs">
            <div className="flex items-center gap-1.5 text-forest font-semibold">
              <span className="text-[11px] uppercase tracking-wider text-charcoal-muted">Translated:</span>
              <span>{sourceCap.name}</span>
              <span className="text-forest/40">→</span>
              <span className="text-forest underline underline-offset-2">
                {targetCap.name} ({targetCap.nativeName})
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowOriginal(true)}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-forest hover:bg-forest/10 rounded transition-colors"
                title="View original un-translated text"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Show Original</span>
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className="p-1 text-charcoal-muted hover:text-forest rounded transition-colors"
                title="Copy text"
                aria-label="Copy text"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={handleSpeech}
                className="p-1 text-charcoal-muted hover:text-forest rounded transition-colors"
                title="Listen to translation"
                aria-label="Listen to translation"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Text Body */}
        <div
          dir={!showOriginal && isTargetRTL ? "rtl" : "ltr"}
          className={`${textClassName} leading-relaxed transition-all`}
        >
          {showOriginal ? content : translatedText || content}
        </div>

        {/* Disclaimer for safety/trade contexts */}
        {!showOriginal && disclaimer && (
          <div className="mt-2.5 flex items-start gap-1.5 text-[11px] text-charcoal-muted/90 bg-card/60 p-2 rounded border border-forest/10">
            <Info className="w-3.5 h-3.5 shrink-0 text-forest/70 mt-0.5" />
            <span>{disclaimer}</span>
          </div>
        )}
      </div>

      {/* Action / Trigger Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
        {showOriginal ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => performTranslation(targetLang)}
              disabled={isTranslating}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded bg-forest/5 border border-forest/20 hover:border-forest text-forest hover:bg-forest/10 transition-colors shadow-2xs"
            >
              {isTranslating ? (
                <Loader2 className="w-3 h-3 animate-spin text-forest" />
              ) : (
                <Languages className="w-3 h-3 text-forest/80" />
              )}
              <span>Translate to {targetCap.name}</span>
            </button>

            <LanguagePairSelector
              sourceLanguage={sourceLang}
              targetLanguage={targetLang}
              onTargetChange={(newTarget) => {
                setTargetLang(newTarget);
                performTranslation(newTarget);
              }}
            />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-charcoal-muted">Switch language:</span>
            <LanguagePairSelector
              sourceLanguage={detectedSource || "auto"}
              targetLanguage={targetLang}
              onTargetChange={(newTarget) => {
                setTargetLang(newTarget);
                performTranslation(newTarget);
              }}
            />
          </div>
        )}

        {/* Report issue button */}
        {!showOriginal && translatedText && (
          <button
            type="button"
            onClick={() => setShowFeedbackModal(true)}
            className="text-[11px] text-charcoal-muted hover:text-forest underline underline-offset-2 flex items-center gap-1"
          >
            <MessageSquareWarning className="w-3 h-3" />
            <span>Report Translation</span>
          </button>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="flex items-center gap-1.5 p-2 rounded bg-amber-50 border border-amber-200 text-xs text-amber-800">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
          <button
            type="button"
            onClick={() => performTranslation(targetLang)}
            className="ml-auto underline font-medium text-amber-900"
          >
            Retry
          </button>
        </div>
      )}

      {/* Report Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md bg-card rounded-md border border-forest/20 shadow-sovereign-lg p-5 space-y-4">
            <h4 className="font-serif font-bold text-base text-forest">Report Translation Quality</h4>
            <p className="text-xs text-charcoal-muted">
              Help us improve workforce vernacular communication for {sourceCap.name} → {targetCap.name}.
            </p>

            {feedbackSubmitted ? (
              <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded border border-emerald-200">
                Thank you. Your feedback has been recorded for language refinement.
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-xs space-y-1">
                  <span className="font-medium text-charcoal">Select Issue Type:</span>
                  <div className="grid grid-cols-2 gap-2">
                    {["inaccurate", "minor_errors", "offensive"].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={async () => {
                          await fetch("/api/translate/feedback", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              originalText: content,
                              translatedText,
                              sourceLanguage: detectedSource || "unknown",
                              targetLanguage: targetLang,
                              rating: type,
                            }),
                          });
                          setFeedbackSubmitted(true);
                          setTimeout(() => {
                            setShowFeedbackModal(false);
                            setFeedbackSubmitted(false);
                          }, 1500);
                        }}
                        className="px-2.5 py-1.5 text-xs text-left rounded border border-forest/20 hover:bg-forest/5 capitalize text-charcoal"
                      >
                        {type.replace("_", " ")}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowFeedbackModal(false)}
                    className="px-3 py-1 text-xs text-charcoal-muted hover:text-charcoal"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
