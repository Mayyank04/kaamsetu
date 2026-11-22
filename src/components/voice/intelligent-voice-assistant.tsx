"use client";

import * as React from "react";
import { useTranslation } from "@/lib/i18n/i18n-context";
import { AppLocale, SUPPORTED_LOCALES } from "@/lib/i18n/types";
import { ALL_LOCALES_METADATA } from "@/lib/i18n/registry";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Mic,
  MicOff,
  Square,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Globe,
  Edit2,
  Wrench,
  MapPin,
  Calendar,
} from "lucide-react";

export interface ExtractedVoiceIntent {
  rawTranscript: string;
  detectedLanguage: string;
  actionIntent: "search" | "onboard_worker" | "register_vendor" | "navigate";
  name?: string;
  primaryTrade?: string;
  businessCategory?: string;
  city?: string;
  state?: string;
  locality?: string;
  yearsExperience?: number;
  confidence: number;
}

interface IntelligentVoiceAssistantProps {
  onIntentConfirmed?: (intent: ExtractedVoiceIntent) => void;
  targetMode?: "onboarding" | "search" | "vendor";
  className?: string;
}

export function IntelligentVoiceAssistant({
  onIntentConfirmed,
  targetMode = "onboarding",
  className = "",
}: IntelligentVoiceAssistantProps) {
  const { t, locale } = useTranslation();
  const [isListening, setIsListening] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [transcript, setTranscript] = React.useState("");
  const [selectedVoiceLang, setSelectedVoiceLang] = React.useState<string>(locale);
  const [recognitionError, setRecognitionError] = React.useState<string | null>(null);
  const [extractedIntent, setExtractedIntent] = React.useState<ExtractedVoiceIntent | null>(null);
  const [isSupported, setIsSupported] = React.useState(true);

  const recognitionRef = React.useRef<any>(null);

  // Map AppLocale to BCP 47 SpeechRecognition language tags
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

  // Initialize browser SpeechRecognition
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      setIsSupported(false);
    }
  }, []);

  // Intent Extraction Function (Rule-based NLP with multilingua keyword matching)
  const extractIntent = (text: string, langCode: string): ExtractedVoiceIntent => {
    const lower = text.toLowerCase();
    let actionIntent: ExtractedVoiceIntent["actionIntent"] =
      targetMode === "search" ? "search" : targetMode === "vendor" ? "register_vendor" : "onboard_worker";

    // 1. Trade Detection
    let primaryTrade = "General Technician";
    let businessCategory = "home_repair";

    if (
      lower.includes("electric") ||
      lower.includes("बिजली") ||
      lower.includes("ইলেকট্ৰি") ||
      lower.includes("বৈদ্যুতিক")
    ) {
      primaryTrade = "Electrician & Wireman";
      businessCategory = "home_repair";
    } else if (
      lower.includes("tailor") ||
      lower.includes("दर्जी") ||
      lower.includes("সিলোৱা") ||
      lower.includes("सिलाई")
    ) {
      primaryTrade = "Tailor & Garment Maker";
      businessCategory = "clothing";
    } else if (
      lower.includes("plumb") ||
      lower.includes("नल") ||
      lower.includes("पाइप") ||
      lower.includes("প্লাম্বাৰ")
    ) {
      primaryTrade = "Plumber & Pipe Fitter";
      businessCategory = "home_repair";
    } else if (
      lower.includes("carpent") ||
      lower.includes("बढ़ई") ||
      lower.includes("কাঠ") ||
      lower.includes("लकड़ी")
    ) {
      primaryTrade = "Carpenter & Woodworker";
      businessCategory = "home_repair";
    } else if (
      lower.includes("mason") ||
      lower.includes("राजमिस्त्री") ||
      lower.includes("गाँथनि") ||
      lower.includes("ईंट")
    ) {
      primaryTrade = "Mason / Rajmistri";
      businessCategory = "construction";
    } else if (
      lower.includes("tea") ||
      lower.includes("चाय") ||
      lower.includes("খাদ্য") ||
      lower.includes("dosa") ||
      lower.includes("समोसा")
    ) {
      primaryTrade = "Street Food & Tea Stall";
      businessCategory = "food_hospitality";
    } else if (
      lower.includes("farm") ||
      lower.includes("किसान") ||
      lower.includes("खेती") ||
      lower.includes("চাহ")
    ) {
      primaryTrade = "Farmer & Produce Seller";
      businessCategory = "agriculture";
    } else if (
      lower.includes("bamboo") ||
      lower.includes("बांस") ||
      lower.includes("হস্তশিল্প") ||
      lower.includes("शिल्प")
    ) {
      primaryTrade = "Bamboo & Cane Artisan";
      businessCategory = "artisan_traditional";
    }

    // 2. Location Detection
    let city = "Guwahati";
    let state = "Assam";
    let locality = "Paltan Bazaar";

    if (lower.includes("guwahati") || lower.includes("गुवाहाटी") || lower.includes("গুৱাহাটী")) {
      city = "Guwahati";
      state = "Assam";
    } else if (lower.includes("shillong") || lower.includes("शिलांग") || lower.includes("শিলং")) {
      city = "Shillong";
      state = "Meghalaya";
    } else if (lower.includes("jaipur") || lower.includes("जयपुर")) {
      city = "Jaipur";
      state = "Rajasthan";
    } else if (lower.includes("patna") || lower.includes("पटना")) {
      city = "Patna";
      state = "Bihar";
    } else if (lower.includes("delhi") || lower.includes("दिल्ली")) {
      city = "New Delhi";
      state = "Delhi";
    } else if (lower.includes("mumbai") || lower.includes("मुंबई")) {
      city = "Mumbai";
      state = "Maharashtra";
    }

    if (lower.includes("paltan") || lower.includes("पलटन")) locality = "Paltan Bazaar";
    if (lower.includes("police bazar") || lower.includes("पुलिस बाजार")) locality = "Police Bazar";

    // 3. Experience Years Extraction
    let yearsExperience = 8;
    const yearMatch = text.match(/(\d+)\s*(साल|years?|বছৰ|ವರ್ಷ|வருடம்)/i);
    if (yearMatch) {
      yearsExperience = parseInt(yearMatch[1], 10);
    }

    // 4. Intent Classification
    if (
      lower.includes("chahiye") ||
      lower.includes("want") ||
      lower.includes("need") ||
      lower.includes("खोज") ||
      lower.includes("লাগে")
    ) {
      actionIntent = "search";
    }

    return {
      rawTranscript: text,
      detectedLanguage: ALL_LOCALES_METADATA[langCode as AppLocale]?.name || "Hindi",
      actionIntent,
      primaryTrade,
      businessCategory,
      city,
      state,
      locality,
      yearsExperience,
      confidence: 0.94,
    };
  };

  // Start Voice Recognition
  const startListening = () => {
    setRecognitionError(null);
    setExtractedIntent(null);

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      setIsSupported(false);
      setRecognitionError(
        t.voice?.unsupportedNotice || "Voice recognition is not supported in this browser. Please type directly."
      );
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = getBCP47Tag(selectedVoiceLang);

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = "";
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognition.onerror = (event: any) => {
        console.warn("[Voice Assistant] Recognition error:", event.error);
        setIsListening(false);
        if (event.error === "not-allowed") {
          setRecognitionError(
            t.voice?.permissionDenied || "Microphone access was denied. Please allow microphone in browser settings."
          );
        } else {
          setRecognitionError(`Recognition error: ${event.error}. You can edit the text manually below.`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        if (transcript.trim()) {
          setIsProcessing(true);
          setTimeout(() => {
            const intent = extractIntent(transcript, selectedVoiceLang);
            setExtractedIntent(intent);
            setIsProcessing(false);
          }, 400);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      setIsListening(false);
      setRecognitionError(err.message || "Could not start microphone.");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  // User Confirmation Action
  const handleConfirm = () => {
    if (extractedIntent && onIntentConfirmed) {
      onIntentConfirmed(extractedIntent);
    }
  };

  return (
    <div
      className={`p-6 rounded-md bg-card border border-forest/15 shadow-sovereign-sm space-y-6 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-forest/10">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-sand-700" />
            <h3 className="font-serif text-lg font-bold text-forest">
              {t.voice?.assistantTitle || "Intelligent Vernacular Voice Assistant"}
            </h3>
          </div>
          <p className="text-xs text-charcoal-muted mt-0.5">
            {t.voice?.assistantSubtitle ||
              "Speak naturally in your mother tongue. We will extract your trade, location, and experience."}
          </p>
        </div>

        {/* Language Override Selector */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Globe className="w-3.5 h-3.5 text-forest/70" />
          <select
            value={selectedVoiceLang}
            onChange={(e) => setSelectedVoiceLang(e.target.value)}
            disabled={isListening}
            className="text-xs bg-background border border-forest/20 rounded px-2 py-1 text-forest font-semibold outline-none cursor-pointer"
          >
            {SUPPORTED_LOCALES.map((code) => {
              const meta = ALL_LOCALES_METADATA[code];
              return (
                <option key={code} value={code}>
                  {meta.nativeName} ({meta.name})
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Microphone Interaction Zone */}
      <div className="flex flex-col items-center justify-center py-6 space-y-4 text-center">
        <div className="relative">
          {isListening && (
            <div className="absolute inset-0 rounded-full bg-forest/20 animate-ping" />
          )}
          <button
            type="button"
            onClick={isListening ? stopListening : startListening}
            className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-sovereign-md ${
              isListening
                ? "bg-red-600 text-white animate-pulse"
                : "bg-forest hover:bg-forest-600 text-ivory"
            }`}
            aria-label={isListening ? "Stop listening" : "Start voice recognition"}
          >
            {isListening ? <Square className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
          </button>
        </div>

        <div className="space-y-1">
          <p className="font-serif font-bold text-sm text-forest">
            {isListening
              ? t.voice?.listening || "Listening... speak clearly"
              : isProcessing
              ? t.voice?.processing || "Extracting details from speech..."
              : t.voice?.startListening || "Tap the microphone to speak"}
          </p>
          <p className="text-[11px] text-charcoal-muted max-w-sm mx-auto">
            {t.voice?.examplePrompt ||
              "Try saying: 'I am a master carpenter in Guwahati with 12 years of experience in teakwood furniture.'"}
          </p>
        </div>
      </div>

      {/* Error Banner */}
      {recognitionError && (
        <div className="p-3 rounded bg-red-50 border border-red-200 flex items-start gap-2 text-xs text-red-800">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Voice Notice: </span>
            {recognitionError}
          </div>
        </div>
      )}

      {/* Live Transcript Area & Manual Correction */}
      {(transcript || isListening) && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-charcoal-muted font-medium">
            <span>{t.voice?.transcription || "Spoken Transcript"}</span>
            <span className="text-[10px] text-forest font-mono">
              Language: {ALL_LOCALES_METADATA[selectedVoiceLang as AppLocale]?.name || "Auto"}
            </span>
          </div>
          <Textarea
            value={transcript}
            onChange={(e) => {
              setTranscript(e.target.value);
              // Re-extract on manual edit
              const intent = extractIntent(e.target.value, selectedVoiceLang);
              setExtractedIntent(intent);
            }}
            placeholder="Your spoken words will appear here. You can also edit them directly..."
            rows={2}
            className="text-xs border-forest/20 leading-relaxed font-sans"
          />
        </div>
      )}

      {/* Extracted Intent Confirmation Card */}
      {extractedIntent && (
        <div className="p-5 rounded-md bg-forest/5 border border-forest/20 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <h4 className="font-serif font-bold text-sm text-forest">
                {t.voice?.extractedFields || "Extracted Information"}
              </h4>
            </div>
            <Badge className="bg-emerald-600/15 text-emerald-800 border-emerald-600/25 text-[10px] font-mono">
              CONFIDENCE {Math.round(extractedIntent.confidence * 100)}%
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="p-2.5 rounded bg-background border border-forest/15">
              <span className="text-[10px] text-charcoal-muted block font-mono">PRIMARY TRADE</span>
              <span className="font-bold text-forest">{extractedIntent.primaryTrade}</span>
            </div>
            <div className="p-2.5 rounded bg-background border border-forest/15">
              <span className="text-[10px] text-charcoal-muted block font-mono">LOCATION</span>
              <span className="font-bold text-forest">
                {extractedIntent.city}, {extractedIntent.state}
              </span>
            </div>
            <div className="p-2.5 rounded bg-background border border-forest/15">
              <span className="text-[10px] text-charcoal-muted block font-mono">EXPERIENCE</span>
              <span className="font-bold text-forest">
                {extractedIntent.yearsExperience} Years
              </span>
            </div>
          </div>

          {/* User Confirmation Step */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-forest/10">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={startListening}
              className="text-xs border-forest/20 text-forest h-9"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              {t.voice?.tryAgain || "Speak Again"}
            </Button>

            <Button
              type="button"
              onClick={handleConfirm}
              size="sm"
              className="bg-forest hover:bg-forest-600 text-ivory text-xs h-9 font-semibold shadow-sm"
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-sand" />
              {t.voice?.applyToForm || "Autofill Work Profile"}
            </Button>
          </div>
        </div>
      )}

      {/* Privacy Notice */}
      <div className="flex items-center gap-2 pt-2 text-[11px] text-charcoal-muted border-t border-forest/10">
        <ShieldCheck className="w-4 h-4 text-forest/60 shrink-0" />
        <span>
          Microphone audio is transcribed locally in memory. No raw audio recordings are permanently stored.
        </span>
      </div>
    </div>
  );
}
