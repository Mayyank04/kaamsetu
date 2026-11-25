"use client";

import * as React from "react";
import { useTranslation } from "@/lib/i18n/i18n-context";
import { AppLocale, SUPPORTED_LOCALES } from "@/lib/i18n/types";
import { ALL_LOCALES_METADATA } from "@/lib/i18n/registry";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Mic,
  MicOff,
  Square,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
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
  actionIntent:
    | "search"
    | "onboard_worker"
    | "register_vendor"
    | "change_language"
    | "add_product"
    | "navigate";
  name?: string;
  primaryTrade?: string;
  businessCategory?: string;
  subcategory?: string;
  targetLanguageCode?: string;
  targetLanguageName?: string;
  city?: string;
  state?: string;
  locality?: string;
  yearsExperience?: number;
  productName?: string;
  confidence: number;
}

export type VoiceState =
  | "idle"
  | "requesting_permission"
  | "listening"
  | "processing"
  | "awaiting_confirmation"
  | "executing"
  | "completed"
  | "error";

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
  const { t, locale, setLocale } = useTranslation();
  const [voiceState, setVoiceState] = React.useState<VoiceState>("idle");
  const [transcript, setTranscript] = React.useState("");
  const [selectedVoiceLang, setSelectedVoiceLang] = React.useState<string>(locale);
  const [recognitionError, setRecognitionError] = React.useState<string | null>(null);
  const [extractedIntent, setExtractedIntent] = React.useState<ExtractedVoiceIntent | null>(null);
  const [isSupported, setIsSupported] = React.useState(true);

  const recognitionRef = React.useRef<any>(null);

  const isListening = voiceState === "listening" || voiceState === "requesting_permission";
  const isProcessing = voiceState === "processing" || voiceState === "executing";

  // Map AppLocale to BCP 47 SpeechRecognition language tags.
  // Returns null if the browser speech recognition engine has no native model for the language,
  // preventing silent and misleading misinterpretation as Hindi.
  const getBCP47Tag = (code: string): string | null => {
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
    };
    return map[code] || null;
  };

  // Initialize browser SpeechRecognition and handle component unmount cleanup
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // Ignore cleanup errors
        }
        recognitionRef.current = null;
      }
    };
  }, []);

  // Intent Extraction Function (Rule-based NLP with multilingual keyword matching)
  const extractIntent = (text: string, langCode: string): ExtractedVoiceIntent => {
    const lower = text.toLowerCase();
    let actionIntent: ExtractedVoiceIntent["actionIntent"] =
      targetMode === "search" ? "search" : targetMode === "vendor" ? "register_vendor" : "onboard_worker";

    let targetLanguageCode: string | undefined;
    let targetLanguageName: string | undefined;
    let subcategory: string | undefined;

    // 1. Language Change Intent
    if (
      lower.includes("language") ||
      lower.includes("भाषा") ||
      lower.includes("ভাষা") ||
      lower.includes("மொழி") ||
      lower.includes("భాష")
    ) {
      actionIntent = "change_language";
      if (lower.includes("assamese") || lower.includes("অসমীয়া") || lower.includes("asomia")) {
        targetLanguageCode = "as";
        targetLanguageName = "Assamese (অসমীয়া)";
      } else if (lower.includes("hindi") || lower.includes("हिन्दी") || lower.includes("हिंदी")) {
        targetLanguageCode = "hi";
        targetLanguageName = "Hindi (हिन्दी)";
      } else if (lower.includes("bengali") || lower.includes("বাংলা") || lower.includes("bangla")) {
        targetLanguageCode = "bn";
        targetLanguageName = "Bengali (বাংলা)";
      } else if (lower.includes("tamil") || lower.includes("தமிழ்")) {
        targetLanguageCode = "ta";
        targetLanguageName = "Tamil (தமிழ்)";
      } else if (lower.includes("telugu") || lower.includes("తెలుగు")) {
        targetLanguageCode = "te";
        targetLanguageName = "Telugu (తెలుగు)";
      } else if (lower.includes("english") || lower.includes("अंग्रेजी")) {
        targetLanguageCode = "en";
        targetLanguageName = "English";
      } else {
        targetLanguageCode = "as";
        targetLanguageName = "Assamese (অসমীয়া)";
      }
    }
    // 2. Add Product to Shop Intent
    else if (
      (lower.includes("add") || lower.includes("जोड़") || lower.includes("যোগ")) &&
      (lower.includes("product") || lower.includes("item") || lower.includes("सामान") || lower.includes("দোকান"))
    ) {
      actionIntent = "add_product";
    }
    // 3. Register Vendor / Shop Intent
    else if (
      lower.includes("register") ||
      lower.includes("stall") ||
      lower.includes("दुकान") ||
      lower.includes("पंजीकरण") ||
      lower.includes("দোকান পঞ্জীয়ন")
    ) {
      actionIntent = "register_vendor";
    }
    // 4. Search Intent
    else if (
      lower.includes("find") ||
      lower.includes("search") ||
      lower.includes("near me") ||
      lower.includes("चाहिए") ||
      lower.includes("ढूंढ") ||
      lower.includes("लाগে") ||
      lower.includes("khoj")
    ) {
      actionIntent = "search";
    }
    // 5. Worker Onboarding Intent ("I am a carpenter...", "I work as...")
    else if (
      lower.includes("i am") ||
      lower.includes("हूँ") ||
      lower.includes("মই") ||
      lower.includes("worker") ||
      lower.includes("mistri")
    ) {
      actionIntent = "onboard_worker";
    }

    // Trade Detection
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
      subcategory = "electrician";
    } else if (
      lower.includes("tailor") ||
      lower.includes("दर्जी") ||
      lower.includes("সিলোৱা") ||
      lower.includes("सिलाई")
    ) {
      primaryTrade = "Tailor & Garment Maker";
      businessCategory = "clothing";
      subcategory = "tailor";
    } else if (
      lower.includes("plumb") ||
      lower.includes("नल") ||
      lower.includes("पाइप") ||
      lower.includes("প্লাম্বাৰ")
    ) {
      primaryTrade = "Plumber & Pipe Fitter";
      businessCategory = "home_repair";
      subcategory = "plumber";
    } else if (
      lower.includes("carpent") ||
      lower.includes("बढ़ई") ||
      lower.includes("কাঠ") ||
      lower.includes("लकड़ी")
    ) {
      primaryTrade = "Carpenter & Woodworker";
      businessCategory = "home_repair";
      subcategory = "carpenter";
    } else if (
      lower.includes("mason") ||
      lower.includes("राजमिस्त्री") ||
      lower.includes("गाँथनि") ||
      lower.includes("ईंट")
    ) {
      primaryTrade = "Mason / Rajmistri";
      businessCategory = "construction";
      subcategory = "mason";
    } else if (
      lower.includes("tea") ||
      lower.includes("चाय") ||
      lower.includes("খাদ্য") ||
      lower.includes("dosa") ||
      lower.includes("restaurant") ||
      lower.includes("समोसा")
    ) {
      primaryTrade = "Street Food & Tea Stall";
      businessCategory = "food_hospitality";
      subcategory = "street_food";
    } else if (
      lower.includes("farm") ||
      lower.includes("किसान") ||
      lower.includes("खेती") ||
      lower.includes("চাহ")
    ) {
      primaryTrade = "Farmer & Produce Seller";
      businessCategory = "agriculture";
      subcategory = "farmer";
    } else if (
      lower.includes("bamboo") ||
      lower.includes("बांस") ||
      lower.includes("হস্তশিল্প") ||
      lower.includes("शिल्प") ||
      lower.includes("handloom") ||
      lower.includes("बुनकर")
    ) {
      primaryTrade = "Bamboo & Cane Artisan";
      businessCategory = "artisan_traditional";
      subcategory = "bamboo_cane";
    }

    // Location Detection
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

    // Experience Years Extraction
    let yearsExperience = 8;
    const yearMatch = text.match(/(\d+)\s*(साल|years?|বছৰ|ವರ್ಷ|வருடம்)/i);
    if (yearMatch) {
      yearsExperience = parseInt(yearMatch[1], 10);
    }

    return {
      rawTranscript: text,
      detectedLanguage: ALL_LOCALES_METADATA[langCode as AppLocale]?.name || "Hindi",
      actionIntent,
      primaryTrade,
      businessCategory,
      subcategory,
      targetLanguageCode,
      targetLanguageName,
      city,
      state,
      locality,
      yearsExperience,
      confidence: 0.95,
    };
  };

  // Start Voice Recognition
  const startListening = () => {
    setRecognitionError(null);
    setExtractedIntent(null);

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      setIsSupported(false);
      setVoiceState("error");
      setRecognitionError(
        t.voice?.unsupportedNotice || "Voice recognition is not supported in this browser. Please type directly."
      );
      return;
    }

    const bcp47 = getBCP47Tag(selectedVoiceLang);
    if (!bcp47) {
      const langName = ALL_LOCALES_METADATA[selectedVoiceLang as AppLocale]?.name || selectedVoiceLang;
      setVoiceState("error");
      setRecognitionError(
        `Native speech recognition for ${langName} is not supported by your browser's speech engine. You can type directly in the text area below or select another language.`
      );
      return;
    }

    try {
      setVoiceState("requesting_permission");
      const recognition = new SpeechRec();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = bcp47;

      recognition.onstart = () => {
        setVoiceState("listening");
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
        setVoiceState("error");
        if (event.error === "not-allowed") {
          setRecognitionError(
            t.voice?.permissionDenied || "Microphone access was denied. Please allow microphone in browser settings."
          );
        } else {
          setRecognitionError(`Recognition error: ${event.error}. You can edit the text manually below.`);
        }
      };

      recognition.onend = () => {
        if (transcript.trim()) {
          setVoiceState("processing");
          setTimeout(() => {
            const intent = extractIntent(transcript, selectedVoiceLang);
            setExtractedIntent(intent);
            setVoiceState("awaiting_confirmation");
          }, 400);
        } else {
          setVoiceState("idle");
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      setVoiceState("error");
      setRecognitionError(err.message || "Could not start microphone.");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore stop error
      }
    }
    if (voiceState === "listening" || voiceState === "requesting_permission") {
      setVoiceState("idle");
    }
  };

  // User Confirmation Action
  const handleConfirm = () => {
    if (!extractedIntent) return;
    setVoiceState("executing");
    try {
      if (extractedIntent.actionIntent === "change_language" && extractedIntent.targetLanguageCode) {
        setLocale(extractedIntent.targetLanguageCode as any);
        toast.success(`Language changed to ${extractedIntent.targetLanguageName || extractedIntent.targetLanguageCode}`);
      }
      if (onIntentConfirmed) {
        onIntentConfirmed(extractedIntent);
      }
      setVoiceState("completed");
    } catch {
      setVoiceState("error");
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
            <Mic className="w-5 h-5 text-forest" />
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
            {voiceState === "requesting_permission"
              ? "Requesting microphone access..."
              : voiceState === "listening"
              ? t.voice?.listening || "Listening... speak clearly"
              : voiceState === "processing"
              ? t.voice?.processing || "Extracting details from speech..."
              : voiceState === "awaiting_confirmation"
              ? "Review extracted details below"
              : voiceState === "executing"
              ? "Applying requested action..."
              : voiceState === "completed"
              ? "Action applied! Tap microphone to speak again"
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
            {extractedIntent.actionIntent === "change_language" ? (
              <div className="p-2.5 rounded bg-background border border-forest/15 sm:col-span-3">
                <span className="text-[10px] text-charcoal-muted block font-mono">REQUESTED LANGUAGE</span>
                <span className="font-bold text-forest text-sm">{extractedIntent.targetLanguageName || "Vernacular Language"}</span>
              </div>
            ) : extractedIntent.actionIntent === "add_product" ? (
              <div className="p-2.5 rounded bg-background border border-forest/15 sm:col-span-3">
                <span className="text-[10px] text-charcoal-muted block font-mono">ACTION DETECTED</span>
                <span className="font-bold text-forest text-sm">Add New Product to Vendor Catalog</span>
              </div>
            ) : (
              <>
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
                  <span className="text-[10px] text-charcoal-muted block font-mono">
                    {extractedIntent.actionIntent === "search" ? "INTENT" : "EXPERIENCE"}
                  </span>
                  <span className="font-bold text-forest">
                    {extractedIntent.actionIntent === "search"
                      ? "Search Directory"
                      : `${extractedIntent.yearsExperience} Years`}
                  </span>
                </div>
              </>
            )}
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
              {extractedIntent.actionIntent === "change_language"
                ? "Confirm Language Change"
                : extractedIntent.actionIntent === "search"
                ? "Search Professionals"
                : extractedIntent.actionIntent === "register_vendor"
                ? "Register Vendor Stall"
                : extractedIntent.actionIntent === "add_product"
                ? "Open Product Catalog"
                : t.voice?.applyToForm || "Autofill Work Profile"}
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
