"use client";

import * as React from "react";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Languages,
  Copy,
  Check,
  RotateCcw,
  AlertCircle,
  Loader2,
  Sparkles,
} from "lucide-react";
import { ALL_TRANSLATION_CAPABILITIES } from "@/lib/translation/registry";
import { LanguagePairSelector } from "./language-pair-selector";

interface VoiceTranslationWidgetProps {
  initialSourceLang?: string;
  initialTargetLang?: string;
  onTranslationComplete?: (original: string, translated: string) => void;
  className?: string;
}

export function VoiceTranslationWidget({
  initialSourceLang = "hi",
  initialTargetLang = "en",
  onTranslationComplete,
  className = "",
}: VoiceTranslationWidgetProps) {
  const [sourceLang, setSourceLang] = React.useState(initialSourceLang);
  const [targetLang, setTargetLang] = React.useState(initialTargetLang);
  const [isListening, setIsListening] = React.useState(false);
  const [originalTranscript, setOriginalTranscript] = React.useState("");
  const [translatedText, setTranslatedText] = React.useState<string | null>(null);
  const [detectedSource, setDetectedSource] = React.useState<string | null>(null);
  const [isTranslating, setIsTranslating] = React.useState(false);
  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isSupported, setIsSupported] = React.useState(true);
  const [copied, setCopied] = React.useState(false);

  const recognitionRef = React.useRef<any>(null);

  // Map AppLocale to BCP-47 for speech recognition
  const getBCP47Tag = (code: string): string => {
    const map: Record<string, string> = {
      en: "en-IN",
      hi: "hi-IN",
      bn: "bn-IN",
      ta: "ta-IN",
      te: "te-IN",
      mr: "mr-IN",
      gu: "gu-IN",
      kn: "kn-IN",
      ml: "ml-IN",
      ur: "ur-IN",
      pa: "pa-IN",
      as: "as-IN",
      or: "or-IN",
      bho: "bho-IN",
      mai: "mai-IN",
      raj: "raj-IN",
      ks: "ks-IN",
      sa: "sa-IN",
    };
    return map[code] || "hi-IN";
  };

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const SpeechRec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      setIsSupported(false);
    }
  }, []);

  const translateSpokenText = async (text: string) => {
    if (!text.trim()) return;
    setIsTranslating(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          sourceLanguage: sourceLang === "auto" ? undefined : sourceLang,
          targetLanguage: targetLang,
          contentType: "voice_transcript",
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to translate spoken transcript.");
      }

      setTranslatedText(json.data.translatedText);
      setDetectedSource(json.data.detectedSourceLanguage);

      if (onTranslationComplete) {
        onTranslationComplete(text, json.data.translatedText);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Translation failed.");
    } finally {
      setIsTranslating(false);
    }
  };

  const startListening = () => {
    setErrorMessage(null);
    setTranslatedText(null);
    setOriginalTranscript("");

    if (typeof window === "undefined") return;
    const SpeechRec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRec) {
      setIsSupported(false);
      setErrorMessage("Web Speech API is not supported in this browser. Please type text below.");
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.lang = getBCP47Tag(sourceLang);
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let interim = "";
        let final = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i];
          if (item.isFinal) {
            final += item[0].transcript;
          } else {
            interim += item[0].transcript;
          }
        }

        const currentText = final || interim;
        setOriginalTranscript(currentText);

        if (final) {
          translateSpokenText(final);
        }
      };

      recognition.onerror = (e: any) => {
        console.warn("[VoiceTranslationWidget] Speech error:", e.error);
        setIsListening(false);
        if (e.error === "not-allowed") {
          setErrorMessage("Microphone permission was denied. Please allow microphone access or use text input.");
        } else {
          setErrorMessage(`Speech recognition error: ${e.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      setErrorMessage("Could not initialize microphone. Please check browser permissions.");
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
    setIsListening(false);
    if (originalTranscript) {
      translateSpokenText(originalTranscript);
    }
  };

  const speakTranslation = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window) || !translatedText) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(translatedText);
    utterance.lang = targetLang === "en" ? "en-IN" : `${targetLang}-IN`;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const targetCap = (targetLang ? ALL_TRANSLATION_CAPABILITIES[targetLang] : null) || ALL_TRANSLATION_CAPABILITIES.en;

  return (
    <div className={`p-4 rounded-md bg-card border border-forest/20 shadow-sovereign-sm space-y-4 ${className}`}>
      {/* Header & Language Selectors */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-forest/10">
        <div>
          <h4 className="font-serif font-bold text-sm text-forest flex items-center gap-1.5">
            <Languages className="w-4 h-4 text-forest" />
            <span>Spoken Voice Translation</span>
          </h4>
          <p className="text-[11px] text-charcoal-muted">
            Speak in your mother tongue; translate in real-time for customer or vendor.
          </p>
        </div>

        <LanguagePairSelector
          sourceLanguage={sourceLang}
          targetLanguage={targetLang}
          onTargetChange={(newTarget) => {
            setTargetLang(newTarget);
            if (originalTranscript) {
              translateSpokenText(originalTranscript);
            }
          }}
        />
      </div>

      {/* Mic Trigger & Listening Indicator */}
      <div className="flex flex-col items-center justify-center p-4 bg-warm-ivory/50 rounded border border-forest/15 space-y-3">
        <button
          type="button"
          onClick={isListening ? stopListening : startListening}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-sovereign-md transition-all ${
            isListening
              ? "bg-red-600 text-white animate-pulse scale-105"
              : "bg-forest text-warm-ivory hover:bg-forest/90"
          }`}
          aria-label={isListening ? "Stop listening" : "Start speaking"}
        >
          {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>

        <span className="text-xs font-medium text-forest">
          {isListening
            ? "Listening... Speak clearly in your language"
            : "Tap microphone to speak"}
        </span>

        {/* Ephemeral Notice */}
        <span className="text-[10px] text-charcoal-muted">
          Ephemeral audio: Raw recordings are never stored on platform servers.
        </span>
      </div>

      {/* Text fallback / manual edit */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-charcoal-muted font-medium">
          <span>Spoken Transcript (Original)</span>
          {originalTranscript && (
            <button
              type="button"
              onClick={() => translateSpokenText(originalTranscript)}
              className="text-forest hover:underline"
            >
              Re-translate
            </button>
          )}
        </div>
        <textarea
          value={originalTranscript}
          onChange={(e) => setOriginalTranscript(e.target.value)}
          placeholder="Spoken words will appear here in real-time, or type text manually..."
          rows={3}
          className="w-full p-2.5 text-xs rounded border border-forest/15 bg-card focus:outline-hidden focus:ring-1 focus:ring-forest text-charcoal resize-none"
        />
      </div>

      {/* Translated Result Output */}
      {isTranslating && (
        <div className="flex items-center gap-2 p-3 bg-forest/5 rounded text-xs text-forest">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Translating into {targetCap.name} ({targetCap.nativeName})...</span>
        </div>
      )}

      {translatedText && !isTranslating && (
        <div className="p-3 bg-warm-ivory/80 rounded border border-forest/20 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-forest pb-1 border-b border-forest/10">
            <span>Translated to {targetCap.name} ({targetCap.nativeName}):</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={speakTranslation}
                className="p-1 rounded text-charcoal-muted hover:text-forest"
                title="Read aloud"
              >
                {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-forest animate-pulse" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(translatedText);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="p-1 rounded text-charcoal-muted hover:text-forest"
                title="Copy text"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
          <p className="text-xs text-charcoal leading-relaxed font-medium">{translatedText}</p>
        </div>
      )}

      {/* Error alert */}
      {errorMessage && (
        <div className="flex items-center gap-1.5 p-2 rounded bg-amber-50 border border-amber-200 text-xs text-amber-800">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
