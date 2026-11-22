"use client";

import * as React from "react";
import {
  X,
  Languages,
  Copy,
  Check,
  Volume2,
  RotateCcw,
  AlertCircle,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { ALL_TRANSLATION_CAPABILITIES } from "@/lib/translation/registry";
import { LanguagePairSelector } from "./language-pair-selector";

interface TranslationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialText?: string;
  initialTargetLanguage?: string;
  title?: string;
}

export function TranslationDialog({
  isOpen,
  onClose,
  initialText = "",
  initialTargetLanguage = "hi",
  title = "Universal Language Translator",
}: TranslationDialogProps) {
  const [sourceText, setSourceText] = React.useState(initialText);
  const [sourceLang, setSourceLang] = React.useState("auto");
  const [targetLang, setTargetLang] = React.useState(initialTargetLanguage);
  const [translatedText, setTranslatedText] = React.useState<string | null>(null);
  const [detectedSource, setDetectedSource] = React.useState<string | null>(null);
  const [isTranslating, setIsTranslating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (initialText) {
      setSourceText(initialText);
    }
  }, [initialText]);

  if (!isOpen) return null;

  const handleTranslate = async () => {
    if (!sourceText.trim()) return;
    setIsTranslating(true);
    setError(null);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: sourceText,
          sourceLanguage: sourceLang,
          targetLanguage: targetLang,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Translation failed.");
      }

      setTranslatedText(json.data.translatedText);
      setDetectedSource(json.data.detectedSourceLanguage);
    } catch (err: any) {
      setError(err.message || "Failed to translate. Please retry.");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleCopy = () => {
    if (translatedText && navigator.clipboard) {
      navigator.clipboard.writeText(translatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSpeak = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window) || !translatedText) return;
    const utterance = new SpeechSynthesisUtterance(translatedText);
    utterance.lang = targetLang === "en" ? "en-IN" : `${targetLang}-IN`;
    window.speechSynthesis.speak(utterance);
  };

  const targetCap = ALL_TRANSLATION_CAPABILITIES[targetLang] || ALL_TRANSLATION_CAPABILITIES.hi;
  const isTargetRTL = targetCap.direction === "rtl";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-2xs">
      <div className="w-full max-w-2xl bg-card rounded-lg border border-forest/20 shadow-sovereign-xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-forest/15 bg-warm-ivory/60">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-forest/10 border border-forest/20 flex items-center justify-center text-forest">
              <Languages className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm text-forest">{title}</h3>
              <p className="text-[11px] text-charcoal-muted">39 Indian Languages • Bidirectional Verification</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-charcoal-muted hover:text-forest hover:bg-forest/5"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Language Controls */}
        <div className="p-3 border-b border-forest/10 bg-card flex flex-wrap items-center justify-between gap-3">
          <LanguagePairSelector
            sourceLanguage={detectedSource || sourceLang}
            targetLanguage={targetLang}
            onTargetChange={(newTarget) => {
              setTargetLang(newTarget);
              if (translatedText) {
                // re-translate automatically on target change
                handleTranslate();
              }
            }}
          />

          <button
            type="button"
            onClick={handleTranslate}
            disabled={isTranslating || !sourceText.trim()}
            className="px-3 py-1.5 text-xs font-bold rounded bg-forest text-warm-ivory hover:bg-forest/90 disabled:opacity-50 transition-colors inline-flex items-center gap-1.5 shadow-2xs"
          >
            {isTranslating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <ArrowRight className="w-3.5 h-3.5" />
            )}
            <span>Translate</span>
          </button>
        </div>

        {/* Content Side-by-Side or Stack */}
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto flex-1">
          {/* Source Box */}
          <div className="flex flex-col space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-charcoal-muted font-medium">
              <span>Original Text</span>
              {detectedSource && (
                <span className="text-forest font-semibold">
                  Detected: {ALL_TRANSLATION_CAPABILITIES[detectedSource as any]?.name || detectedSource}
                </span>
              )}
            </div>
            <textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder="Type, paste, or dictate content in any Indian language..."
              rows={6}
              className="w-full p-3 text-xs rounded border border-forest/15 bg-warm-ivory/30 focus:outline-hidden focus:ring-1 focus:ring-forest text-charcoal resize-none leading-relaxed flex-1"
            />
          </div>

          {/* Target Box */}
          <div className="flex flex-col space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-charcoal-muted font-medium">
              <span>{targetCap.name} Translation ({targetCap.nativeName})</span>
              {translatedText && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="p-1 text-charcoal-muted hover:text-forest rounded"
                    title="Copy translation"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                  <button
                    type="button"
                    onClick={handleSpeak}
                    className="p-1 text-charcoal-muted hover:text-forest rounded"
                    title="Listen aloud"
                  >
                    <Volume2 className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            <div
              dir={isTargetRTL ? "rtl" : "ltr"}
              className="w-full p-3 text-xs rounded border border-forest/15 bg-card text-charcoal min-h-[140px] leading-relaxed overflow-y-auto flex-1"
            >
              {translatedText ? (
                translatedText
              ) : (
                <span className="text-charcoal-muted/60 italic">
                  Translation will appear here once you tap Translate...
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="px-4 py-2 bg-amber-50 border-t border-amber-200 text-xs text-amber-800 flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Footer */}
        <div className="p-3 border-t border-forest/10 bg-warm-ivory/40 flex items-center justify-between text-xs text-charcoal-muted">
          <span>Sovereign Identity Protocol • Zero Commission Invariant</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 text-xs rounded border border-forest/20 hover:bg-forest/5 text-forest"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
