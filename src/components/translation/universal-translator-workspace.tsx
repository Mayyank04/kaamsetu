"use client";

import * as React from "react";
import {
  Languages,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Copy,
  Check,
  RotateCcw,
  ArrowRightLeft,
  X,
  History,
  Trash2,
  Sparkles,
  AlertCircle,
  HelpCircle,
  Globe,
  Search,
  ExternalLink,
  ChevronDown,
  ArrowRight,
  Clipboard,
} from "lucide-react";
import { ALL_TRANSLATION_CAPABILITIES } from "@/lib/translation/registry";
import { LanguageCapability } from "@/lib/translation/types";
import {
  createSpeechRecognitionSession,
  speakText,
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
  hasNativeVoice,
  VoiceInputState,
  SpeechErrorCode,
} from "@/lib/translation/speech";

export interface TranslationHistoryItem {
  id: string;
  sourceText: string;
  translatedText: string;
  transliteration?: string;
  englishMeaning?: string;
  sourceLanguage: string;
  targetLanguage: string;
  timestamp: number;
}

interface UniversalTranslatorWorkspaceProps {
  initialText?: string;
  initialSourceLang?: string;
  initialTargetLang?: string;
  isModal?: boolean;
  onClose?: () => void;
  className?: string;
}

// Popular quick selection languages for Indian context
const POPULAR_LANGUAGES = [
  { code: "hi", name: "Hindi", native: "हिन्दी" },
  { code: "as", name: "Assamese", native: "অসমীয়া" },
  { code: "bn", name: "Bengali", native: "বাংলা" },
  { code: "ta", name: "Tamil", native: "தமிழ்" },
  { code: "te", name: "Telugu", native: "తెలుగు" },
  { code: "en", name: "English", native: "English" },
];

export function UniversalTranslatorWorkspace({
  initialText = "",
  initialSourceLang = "auto",
  initialTargetLang = "as",
  isModal = false,
  onClose,
  className = "",
}: UniversalTranslatorWorkspaceProps) {
  // Main Translation States
  const [sourceText, setSourceText] = React.useState(initialText);
  const [sourceLang, setSourceLang] = React.useState(initialSourceLang);
  const [targetLang, setTargetLang] = React.useState(initialTargetLang);
  const [detectedSource, setDetectedSource] = React.useState<string | null>(null);
  const [translatedText, setTranslatedText] = React.useState<string | null>(null);
  const [transliteration, setTransliteration] = React.useState<string | null>(null);
  const [englishMeaning, setEnglishMeaning] = React.useState<string | null>(null);
  const [transliterationAvailable, setTransliterationAvailable] = React.useState(false);
  const [englishMeaningAvailable, setEnglishMeaningAvailable] = React.useState(false);
  const [providerName, setProviderName] = React.useState<string | null>(null);
  const [confidenceScore, setConfidenceScore] = React.useState<number | null>(null);
  const [isFallback, setIsFallback] = React.useState(false);

  // UI & Loading States
  const [isTranslating, setIsTranslating] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);
  const [showHistory, setShowHistory] = React.useState(false);
  const [historyItems, setHistoryItems] = React.useState<TranslationHistoryItem[]>([]);

  // Language Dropdown States
  const [isSourceDropdownOpen, setIsSourceDropdownOpen] = React.useState(false);
  const [isTargetDropdownOpen, setIsTargetDropdownOpen] = React.useState(false);
  const [sourceSearchQuery, setSourceSearchQuery] = React.useState("");
  const [targetSearchQuery, setTargetSearchQuery] = React.useState("");

  // Speech Recognition States
  const [voiceState, setVoiceState] = React.useState<VoiceInputState>("idle");
  const [speechError, setSpeechError] = React.useState<{ message: string; actionable: string } | null>(null);
  const [interimSpeech, setInterimSpeech] = React.useState("");
  const speechSessionRef = React.useRef<any>(null);

  // Speech Synthesis (Audio Output) States
  const [isPlayingAudio, setIsPlayingAudio] = React.useState(false);
  const [audioTarget, setAudioTarget] = React.useState<"source" | "native" | "translit" | null>(null);
  const [ttsNote, setTtsNote] = React.useState<string | null>(null);
  const ttsPlayerRef = React.useRef<{ stop: () => void } | null>(null);

  // Load history from localStorage on client mount
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("kaamsetu_translation_history");
        if (stored) {
          setHistoryItems(JSON.parse(stored));
        }
      } catch {
        // ignore
      }
    }
  }, []);

  // Save history to localStorage
  const saveToHistory = (item: TranslationHistoryItem) => {
    setHistoryItems((prev) => {
      const updated = [item, ...prev.filter((i) => i.sourceText !== item.sourceText).slice(0, 24)];
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("kaamsetu_translation_history", JSON.stringify(updated));
        } catch {
          // ignore
        }
      }
      return updated;
    });
  };

  const clearHistory = () => {
    setHistoryItems([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("kaamsetu_translation_history");
    }
  };

  // Cleanup speech recognition and synthesis on unmount
  React.useEffect(() => {
    return () => {
      if (speechSessionRef.current) {
        speechSessionRef.current.destroy();
      }
      if (ttsPlayerRef.current) {
        ttsPlayerRef.current.stop();
      }
    };
  }, []);

  // All capabilities array
  const allCapabilities = React.useMemo(() => Object.values(ALL_TRANSLATION_CAPABILITIES), []);

  // Filtered source languages
  const filteredSourceLanguages = React.useMemo(() => {
    const q = sourceSearchQuery.toLowerCase().trim();
    return allCapabilities.filter((cap) => {
      if (!cap.sourceSupported) return false;
      if (!q) return true;
      return (
        cap.name.toLowerCase().includes(q) ||
        cap.nativeName.toLowerCase().includes(q) ||
        cap.code.toLowerCase().includes(q)
      );
    });
  }, [allCapabilities, sourceSearchQuery]);

  // Filtered target languages
  const filteredTargetLanguages = React.useMemo(() => {
    const q = targetSearchQuery.toLowerCase().trim();
    return allCapabilities.filter((cap) => {
      if (!cap.targetSupported) return false;
      if (!q) return true;
      return (
        cap.name.toLowerCase().includes(q) ||
        cap.nativeName.toLowerCase().includes(q) ||
        cap.code.toLowerCase().includes(q)
      );
    });
  }, [allCapabilities, targetSearchQuery]);

  // Target Capability Info
  const targetCap = ALL_TRANSLATION_CAPABILITIES[targetLang] || ALL_TRANSLATION_CAPABILITIES.as;
  const sourceCap = sourceLang === "auto"
    ? { name: "Auto Detect", nativeName: "স্বয়ংক্রিয় / पहचानें", code: "auto" }
    : ALL_TRANSLATION_CAPABILITIES[sourceLang] || { name: sourceLang, nativeName: "", code: sourceLang };

  // ==========================================================================
  // CORE TRANSLATION DISPATCH
  // ==========================================================================
  const handleTranslate = async (overrideText?: string, overrideTarget?: string, overrideSource?: string) => {
    const textToTranslate = (overrideText !== undefined ? overrideText : sourceText).trim();
    const effectiveTarget = overrideTarget || targetLang;
    const effectiveSource = overrideSource || sourceLang;

    if (!textToTranslate) return;

    setIsTranslating(true);
    setErrorMessage(null);

    // Stop ongoing audio
    if (ttsPlayerRef.current) {
      ttsPlayerRef.current.stop();
      setIsPlayingAudio(false);
      setAudioTarget(null);
    }

    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: textToTranslate,
          sourceLanguage: effectiveSource === "auto" ? undefined : effectiveSource,
          targetLanguage: effectiveTarget,
          includeTransliteration: true,
          includeEnglishMeaning: true,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Translation request failed.");
      }

      const data = json.data;
      setTranslatedText(data.translatedText);
      setDetectedSource(data.detectedSourceLanguage);
      setTransliteration(data.transliteration || null);
      setEnglishMeaning(data.englishMeaning || null);
      setTransliterationAvailable(Boolean(data.transliterationAvailable));
      setEnglishMeaningAvailable(Boolean(data.englishMeaningAvailable));
      setProviderName(data.provider || "gemini");
      setConfidenceScore(data.confidence || 0.95);
      setIsFallback(Boolean(data.isFallback));

      // Save to history
      saveToHistory({
        id: `th-${Date.now()}`,
        sourceText: textToTranslate,
        translatedText: data.translatedText,
        transliteration: data.transliteration,
        englishMeaning: data.englishMeaning,
        sourceLanguage: data.detectedSourceLanguage || effectiveSource,
        targetLanguage: effectiveTarget,
        timestamp: Date.now(),
      });
    } catch (err: any) {
      setErrorMessage(err.message || "Translation could not be completed. Please retry.");
    } finally {
      setIsTranslating(false);
    }
  };

  // ==========================================================================
  // SWAP LANGUAGES AND TEXT
  // ==========================================================================
  const handleSwap = () => {
    // If source was auto, resolve to detected source or Hindi
    const currentActualSource = sourceLang === "auto" ? (detectedSource || "en") : sourceLang;
    const newSource = targetLang;
    const newTarget = currentActualSource;

    setSourceLang(newSource);
    setTargetLang(newTarget);

    // Swap text if translation exists
    if (translatedText) {
      const oldTranslated = translatedText;
      const oldSource = sourceText;
      setSourceText(oldTranslated);
      setTranslatedText(oldSource);
      // Re-translate with swapped values
      handleTranslate(oldTranslated, newTarget, newSource);
    }
  };

  // ==========================================================================
  // COPY HELPERS
  // ==========================================================================
  const copyToClipboard = async (text: string, key: string) => {
    if (!text || typeof navigator === "undefined" || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      // fallback
    }
  };

  const copyAll = () => {
    if (!translatedText) return;
    const parts = [
      `[${targetCap.name} Native]: ${translatedText}`,
      transliteration ? `[Pronunciation]: ${transliteration}` : null,
      englishMeaning ? `[English Meaning]: ${englishMeaning}` : null,
    ].filter(Boolean);

    copyToClipboard(parts.join("\n"), "all");
  };

  // ==========================================================================
  // PASTE HELPER
  // ==========================================================================
  const handlePaste = async () => {
    if (typeof navigator !== "undefined" && navigator.clipboard?.readText) {
      try {
        const text = await navigator.clipboard.readText();
        if (text) {
          setSourceText(text);
        }
      } catch {
        // clipboard permission denied
      }
    }
  };

  // ==========================================================================
  // SPEECH RECOGNITION (VOICE INPUT)
  // ==========================================================================
  const handleToggleMic = () => {
    setSpeechError(null);

    // If currently listening, stop
    if (voiceState === "listening" || voiceState === "requesting_permission") {
      if (speechSessionRef.current) {
        speechSessionRef.current.stop();
      }
      setVoiceState("idle");
      return;
    }

    // Determine recognition language: if source is auto, use en or hi
    const recognitionLang = sourceLang === "auto" ? (detectedSource || "hi") : sourceLang;

    if (!isSpeechRecognitionSupported()) {
      setSpeechError({
        message: "Web Speech Recognition is not supported in this browser.",
        actionable: "Please use Google Chrome, Apple Safari, Microsoft Edge, or enter text using the keyboard.",
      });
      return;
    }

    if (speechSessionRef.current) {
      speechSessionRef.current.destroy();
    }

    const session = createSpeechRecognitionSession({
      langCode: recognitionLang,
      onStateChange: (newState) => {
        setVoiceState(newState);
        if (newState === "idle" || newState === "completed") {
          setInterimSpeech("");
        }
      },
      onInterimTranscript: (interim) => {
        setInterimSpeech(interim);
      },
      onFinalTranscript: (final) => {
        // Place recognized text into source input for user review/editing (DO NOT AUTO-SUBMIT UNCONFIRMED)
        setSourceText((prev) => (prev ? `${prev} ${final}` : final));
        setInterimSpeech("");
        setVoiceState("idle");
      },
      onError: (err) => {
        setSpeechError(err);
        setVoiceState("failed");
        setInterimSpeech("");
      },
    });

    speechSessionRef.current = session;
    session.start();
  };

  const handleCancelMic = () => {
    if (speechSessionRef.current) {
      speechSessionRef.current.abort();
    }
    setVoiceState("idle");
    setInterimSpeech("");
    setSpeechError(null);
  };

  // ==========================================================================
  // SPEECH SYNTHESIS (AUDIO PLAYBACK)
  // ==========================================================================
  const handlePlayAudio = (type: "source" | "native" | "translit") => {
    setTtsNote(null);

    // If currently playing this target, stop it
    if (isPlayingAudio && audioTarget === type) {
      if (ttsPlayerRef.current) {
        ttsPlayerRef.current.stop();
      }
      setIsPlayingAudio(false);
      setAudioTarget(null);
      return;
    }

    if (ttsPlayerRef.current) {
      ttsPlayerRef.current.stop();
    }

    let textToSpeak = "";
    let langForVoice = "en";

    if (type === "native") {
      textToSpeak = translatedText || "";
      langForVoice = targetLang;
    } else if (type === "source") {
      textToSpeak = sourceText;
      langForVoice = sourceLang === "auto" ? (detectedSource || "en") : sourceLang;
    } else if (type === "translit") {
      textToSpeak = transliteration || "";
      langForVoice = "en"; // transliteration is read phonetically in Latin script
    }

    if (!textToSpeak.trim()) return;

    // Check voice support
    const voiceCheck = hasNativeVoice(langForVoice);
    if (!voiceCheck.hasVoice) {
      setTtsNote(voiceCheck.note || "Native regional voice not found in browser. Using system fallback voice.");
    }

    setIsPlayingAudio(true);
    setAudioTarget(type);

    const player = speakText(textToSpeak, langForVoice, {
      onStart: () => setIsPlayingAudio(true),
      onEnd: () => {
        setIsPlayingAudio(false);
        setAudioTarget(null);
      },
      onError: (err) => {
        setIsPlayingAudio(false);
        setAudioTarget(null);
        console.warn("[TTS Playback] Error:", err);
      },
    });

    ttsPlayerRef.current = player;
  };

  return (
    <div className={`w-full max-w-5xl mx-auto flex flex-col rounded-lg bg-card border border-forest/20 shadow-sovereign-lg overflow-hidden ${className}`}>
      {/* 1. WORKSPACE HEADER */}
      <div className="flex flex-wrap items-center justify-between p-4 sm:p-5 border-b border-forest/15 bg-warm-ivory/70">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-forest text-warm-ivory flex items-center justify-center shadow-2xs">
            <Languages className="w-5 h-5 text-sand" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif font-bold text-base sm:text-lg text-forest leading-tight">
                Universal Multilingual Translator
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-forest/10 text-forest border border-forest/20 font-semibold">
                39 Indian Languages
              </span>
            </div>
            <p className="text-xs text-charcoal-muted mt-0.5">
              Native Script • Roman Transliteration (Pronunciation) • English Meaning • Voice Input & Audio
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-2 sm:mt-0">
          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className={`px-3 py-1.5 text-xs font-medium rounded border transition-colors inline-flex items-center gap-1.5 ${
              showHistory
                ? "bg-forest text-warm-ivory border-forest"
                : "bg-card border-forest/20 text-forest hover:bg-forest/5"
            }`}
            title="View translation history"
          >
            <History className="w-3.5 h-3.5" />
            <span>History ({historyItems.length})</span>
          </button>

          {isModal && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded text-charcoal-muted hover:text-forest hover:bg-forest/10 transition-colors"
              aria-label="Close translator"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. DUAL LANGUAGE SELECTOR BAR */}
      <div className="p-3 sm:p-4 border-b border-forest/10 bg-card flex flex-wrap items-center justify-between gap-3">
        {/* Source Language Selector */}
        <div className="relative flex-1 min-w-[200px]">
          <label className="block text-[10px] uppercase tracking-wider font-semibold text-charcoal-muted mb-1">
            Source Language
          </label>
          <button
            type="button"
            onClick={() => {
              setIsSourceDropdownOpen(!isSourceDropdownOpen);
              setIsTargetDropdownOpen(false);
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded border border-forest/25 bg-card hover:border-forest text-left text-xs font-medium text-charcoal transition-colors shadow-2xs"
          >
            <div className="flex items-center gap-2 truncate">
              <Globe className="w-3.5 h-3.5 text-forest shrink-0" />
              <span className="font-semibold text-forest truncate">{sourceCap.name}</span>
              {sourceCap.nativeName && (
                <span className="text-charcoal-muted text-[11px] truncate">({sourceCap.nativeName})</span>
              )}
              {detectedSource && sourceLang === "auto" && (
                <span className="px-1.5 py-0.2 rounded bg-forest/10 text-forest text-[10px] font-mono">
                  Detected: {ALL_TRANSLATION_CAPABILITIES[detectedSource]?.name || detectedSource}
                </span>
              )}
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-charcoal-muted shrink-0 ml-1" />
          </button>

          {/* Source Search Dropdown */}
          {isSourceDropdownOpen && (
            <div className="absolute left-0 top-full mt-1.5 z-50 w-72 max-h-80 overflow-hidden rounded-md bg-card border border-forest/20 shadow-sovereign-lg flex flex-col">
              <div className="p-2 border-b border-forest/10 bg-warm-ivory/50">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-charcoal-muted" />
                  <input
                    type="text"
                    placeholder="Search source language..."
                    value={sourceSearchQuery}
                    onChange={(e) => setSourceSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded border border-forest/15 bg-card focus:outline-hidden focus:ring-1 focus:ring-forest text-charcoal"
                    autoFocus
                  />
                </div>
              </div>
              <div className="overflow-y-auto p-1 divide-y divide-forest/5 flex-1">
                <button
                  type="button"
                  onClick={() => {
                    setSourceLang("auto");
                    setIsSourceDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-forest/5 rounded ${
                    sourceLang === "auto" ? "bg-forest/10 font-bold text-forest" : "text-charcoal"
                  }`}
                >
                  <div>
                    <div className="font-semibold">Auto Detect</div>
                    <div className="text-[10px] text-charcoal-muted">Automatically recognize input script</div>
                  </div>
                  {sourceLang === "auto" && <Check className="w-3.5 h-3.5 text-forest" />}
                </button>

                {filteredSourceLanguages.map((cap) => (
                  <button
                    key={cap.code}
                    type="button"
                    onClick={() => {
                      setSourceLang(cap.code);
                      setIsSourceDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-forest/5 rounded ${
                      sourceLang === cap.code ? "bg-forest/10 font-bold text-forest" : "text-charcoal"
                    }`}
                  >
                    <div>
                      <span className="font-medium">{cap.name}</span>
                      <span className="text-charcoal-muted ml-1.5 text-[11px]">({cap.nativeName})</span>
                    </div>
                    {sourceLang === cap.code && <Check className="w-3.5 h-3.5 text-forest" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SWAP LANGUAGES BUTTON */}
        <div className="flex flex-col items-center justify-end">
          <button
            type="button"
            onClick={handleSwap}
            className="p-2.5 rounded-full border border-forest/25 bg-card hover:bg-forest/10 text-forest hover:border-forest transition-transform active:scale-95 shadow-2xs"
            title="Swap Source and Target Languages & Content"
            aria-label="Swap source and target languages"
          >
            <ArrowRightLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Target Language Selector */}
        <div className="relative flex-1 min-w-[200px]">
          <label className="block text-[10px] uppercase tracking-wider font-semibold text-charcoal-muted mb-1">
            Target Language
          </label>
          <button
            type="button"
            onClick={() => {
              setIsTargetDropdownOpen(!isTargetDropdownOpen);
              setIsSourceDropdownOpen(false);
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded border border-forest/25 bg-card hover:border-forest text-left text-xs font-medium text-charcoal transition-colors shadow-2xs"
          >
            <div className="flex items-center gap-2 truncate">
              <span className="w-2 h-2 rounded-full bg-forest shrink-0" />
              <span className="font-semibold text-forest truncate">{targetCap.name}</span>
              <span className="text-forest/80 text-[11px] truncate">({targetCap.nativeName})</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-charcoal-muted shrink-0 ml-1" />
          </button>

          {/* Target Search Dropdown */}
          {isTargetDropdownOpen && (
            <div className="absolute right-0 top-full mt-1.5 z-50 w-72 max-h-80 overflow-hidden rounded-md bg-card border border-forest/20 shadow-sovereign-lg flex flex-col">
              <div className="p-2 border-b border-forest/10 bg-warm-ivory/50">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-charcoal-muted" />
                  <input
                    type="text"
                    placeholder="Search target language..."
                    value={targetSearchQuery}
                    onChange={(e) => setTargetSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded border border-forest/15 bg-card focus:outline-hidden focus:ring-1 focus:ring-forest text-charcoal"
                    autoFocus
                  />
                </div>
              </div>
              <div className="overflow-y-auto p-1 divide-y divide-forest/5 flex-1">
                {filteredTargetLanguages.map((cap) => (
                  <button
                    key={cap.code}
                    type="button"
                    onClick={() => {
                      setTargetLang(cap.code);
                      setIsTargetDropdownOpen(false);
                      if (sourceText.trim()) {
                        handleTranslate(sourceText, cap.code);
                      }
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-forest/5 rounded ${
                      targetLang === cap.code ? "bg-forest/10 font-bold text-forest" : "text-charcoal"
                    }`}
                  >
                    <div>
                      <span className="font-medium">{cap.name}</span>
                      <span className="text-charcoal-muted ml-1.5 text-[11px]">({cap.nativeName})</span>
                    </div>
                    {targetLang === cap.code && <Check className="w-3.5 h-3.5 text-forest" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* QUICK CHIPS ROW */}
      <div className="px-4 py-2 border-b border-forest/5 bg-warm-ivory/30 flex items-center gap-1.5 overflow-x-auto text-xs">
        <span className="text-[11px] text-charcoal-muted font-medium shrink-0 mr-1">Quick Select:</span>
        {POPULAR_LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            type="button"
            onClick={() => {
              setTargetLang(lang.code);
              if (sourceText.trim()) {
                handleTranslate(sourceText, lang.code);
              }
            }}
            className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors shrink-0 ${
              targetLang === lang.code
                ? "bg-forest text-warm-ivory border-forest shadow-2xs"
                : "bg-card border-forest/15 text-charcoal hover:border-forest/40"
            }`}
          >
            {lang.native} ({lang.name})
          </button>
        ))}
      </div>

      {/* 3. DUAL-PANE WORKSPACE (INPUT & OUTPUT) */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-forest/15 flex-1 min-h-[360px]">
        {/* LEFT PANE: INPUT AREA */}
        <div className="p-4 sm:p-5 flex flex-col justify-between bg-card space-y-3">
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between text-xs text-charcoal-muted mb-1.5">
              <span className="font-medium text-forest">
                {sourceCap.name} {sourceLang !== "auto" && `(${sourceCap.nativeName})`}
              </span>
              <span className="text-[11px] font-mono">{sourceText.length} / 5,000 characters</span>
            </div>

            <textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                  e.preventDefault();
                  handleTranslate();
                }
              }}
              placeholder="Enter text to translate, or click microphone to speak in your dialect..."
              className="w-full flex-1 min-h-[160px] sm:min-h-[200px] p-3 text-sm text-charcoal bg-warm-ivory/20 rounded border border-forest/15 focus:border-forest focus:outline-hidden focus:ring-1 focus:ring-forest resize-y"
              maxLength={5000}
            />

            {/* LIVE SPEECH TRANSCRIPTION INDICATOR */}
            {(voiceState === "listening" || voiceState === "requesting_permission" || interimSpeech) && (
              <div className="mt-2 p-2.5 rounded bg-forest/5 border border-forest/20 flex items-center justify-between text-xs text-forest animate-pulse">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping shrink-0" />
                  <span className="font-medium">
                    {voiceState === "requesting_permission" ? "Requesting microphone permission..." : "Listening... Speak clearly in your language"}
                  </span>
                  {interimSpeech && <span className="italic text-charcoal font-normal">&ldquo;{interimSpeech}&rdquo;</span>}
                </div>
                <button
                  type="button"
                  onClick={handleCancelMic}
                  className="text-xs px-2 py-0.5 rounded bg-card border border-forest/20 text-charcoal hover:bg-forest/10"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* SPEECH ERROR DISPLAY */}
            {speechError && (
              <div className="mt-2 p-2.5 rounded bg-amber-50 border border-amber-300 text-xs text-amber-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">{speechError.message}</div>
                  <div className="text-[11px] text-amber-800 mt-0.5">{speechError.actionable}</div>
                </div>
              </div>
            )}
          </div>

          {/* INPUT ACTIONS BAR */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-forest/10">
            <div className="flex items-center gap-1.5">
              {/* Microphone Toggle Button */}
              <button
                type="button"
                onClick={handleToggleMic}
                className={`px-3 py-1.5 text-xs font-semibold rounded border transition-colors inline-flex items-center gap-1.5 shadow-2xs ${
                  voiceState === "listening"
                    ? "bg-red-600 text-white border-red-700 animate-pulse"
                    : "bg-card border-forest/25 text-forest hover:bg-forest/5"
                }`}
                title="Voice input in your selected language"
              >
                {voiceState === "listening" ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-sand-dark" />}
                <span>{voiceState === "listening" ? "Stop Listening" : "Voice Input"}</span>
              </button>

              {/* Paste Button */}
              <button
                type="button"
                onClick={handlePaste}
                className="p-1.5 rounded text-charcoal-muted hover:text-forest hover:bg-forest/5 border border-forest/15"
                title="Paste from clipboard"
              >
                <Clipboard className="w-3.5 h-3.5" />
              </button>

              {/* Speak Source Text */}
              {sourceText.trim() && (
                <button
                  type="button"
                  onClick={() => handlePlayAudio("source")}
                  className={`p-1.5 rounded border border-forest/15 transition-colors ${
                    isPlayingAudio && audioTarget === "source" ? "bg-forest text-warm-ivory" : "text-charcoal-muted hover:text-forest hover:bg-forest/5"
                  }`}
                  title="Listen to original source text"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Clear Input */}
              {sourceText.trim() && (
                <button
                  type="button"
                  onClick={() => {
                    setSourceText("");
                    setTranslatedText(null);
                    setTransliteration(null);
                    setEnglishMeaning(null);
                  }}
                  className="p-1.5 rounded text-charcoal-muted hover:text-red-700 hover:bg-red-50 border border-forest/15"
                  title="Clear input"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* PRIMARY TRANSLATE BUTTON */}
            <button
              type="button"
              onClick={() => handleTranslate()}
              disabled={isTranslating || !sourceText.trim()}
              className="px-4 py-2 text-xs font-bold rounded bg-forest text-warm-ivory hover:bg-forest/90 disabled:opacity-50 transition-colors inline-flex items-center gap-2 shadow-sovereign-sm"
            >
              {isTranslating ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-sand border-t-transparent rounded-full animate-spin" />
                  <span>Translating...</span>
                </>
              ) : (
                <>
                  <span>Translate to {targetCap.name}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-sand" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* RIGHT PANE: TRANSLATION RESULT AREA */}
        <div className="p-4 sm:p-5 flex flex-col justify-between bg-warm-ivory/20 space-y-4">
          <div className="flex-1 space-y-4">
            {/* Header info */}
            <div className="flex items-center justify-between text-xs text-charcoal-muted">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-forest">{targetCap.name} Translation</span>
                <span className="text-[11px] text-charcoal-muted font-normal">({targetCap.nativeName})</span>
              </div>
              {providerName && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-forest/5 text-forest border border-forest/15">
                  Engine: {providerName} {isFallback && "(Offline Corpus)"}
                </span>
              )}
            </div>

            {/* ERROR DISPLAY */}
            {errorMessage && (
              <div className="p-3 rounded bg-red-50 border border-red-200 text-xs text-red-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">Translation Error</div>
                  <div>{errorMessage}</div>
                </div>
              </div>
            )}

            {/* TTS ADVISORY NOTE */}
            {ttsNote && (
              <div className="p-2.5 rounded bg-warm-sand/30 border border-warm-sand text-[11px] text-charcoal flex items-start gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-forest shrink-0 mt-0.5" />
                <span>{ttsNote}</span>
              </div>
            )}

            {/* EMPTY STATE */}
            {!translatedText && !isTranslating && !errorMessage && (
              <div className="h-48 flex flex-col items-center justify-center text-center p-6 border border-dashed border-forest/20 rounded bg-card/60">
                <Languages className="w-8 h-8 text-forest/30 mb-2" />
                <p className="text-xs font-semibold text-forest">Ready for Universal Translation</p>
                <p className="text-[11px] text-charcoal-muted max-w-xs mt-1">
                  Type or speak in any of 39 Indian languages. Output provides Native Script, Roman Pronunciation, and English Meaning.
                </p>
              </div>
            )}

            {/* TRANSLATION LOADING SKELETON */}
            {isTranslating && (
              <div className="space-y-3 py-6 animate-pulse">
                <div className="h-6 bg-forest/10 rounded w-3/4" />
                <div className="h-4 bg-forest/10 rounded w-1/2" />
                <div className="h-4 bg-forest/10 rounded w-5/6" />
              </div>
            )}

            {/* STRUCTURED TRANSLATION OUTPUT SECTIONS */}
            {translatedText && !isTranslating && (
              <div className="space-y-4">
                {/* SECTION A: NATIVE SCRIPT TRANSLATION */}
                <div className="p-3.5 rounded-md bg-card border border-forest/20 shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-charcoal-muted">
                    <span className="text-forest uppercase tracking-wider">A. Native Script ({targetCap.name})</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handlePlayAudio("native")}
                        className={`p-1 rounded transition-colors ${
                          isPlayingAudio && audioTarget === "native" ? "bg-forest text-warm-ivory" : "hover:text-forest hover:bg-forest/5"
                        }`}
                        title="Listen to native translation"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(translatedText, "native")}
                        className="p-1 rounded hover:text-forest hover:bg-forest/5"
                        title="Copy native script"
                      >
                        {copiedKey === "native" ? <Check className="w-3.5 h-3.5 text-forest" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div
                    className="text-base sm:text-lg font-medium text-charcoal leading-relaxed selection:bg-sand/30"
                    dir={targetCap.direction}
                  >
                    {translatedText}
                  </div>
                </div>

                {/* SECTION B: ROMAN TRANSLITERATION (PRONUNCIATION IN ENGLISH LETTERS) */}
                <div className="p-3 rounded-md bg-forest/5 border border-forest/15 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-charcoal-muted">
                    <span className="text-forest uppercase tracking-wider flex items-center gap-1">
                      <span>B. Roman Transliteration</span>
                      <span className="text-[10px] font-normal text-charcoal-muted">(English Letters Pronunciation)</span>
                    </span>
                    <div className="flex items-center gap-1">
                      {transliteration && (
                        <>
                          <button
                            type="button"
                            onClick={() => handlePlayAudio("translit")}
                            className={`p-1 rounded transition-colors ${
                              isPlayingAudio && audioTarget === "translit" ? "bg-forest text-warm-ivory" : "hover:text-forest hover:bg-forest/5"
                            }`}
                            title="Listen to transliteration"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(transliteration, "translit")}
                            className="p-1 rounded hover:text-forest hover:bg-forest/5"
                            title="Copy transliteration"
                          >
                            {copiedKey === "translit" ? <Check className="w-3.5 h-3.5 text-forest" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-sm font-sans font-medium text-forest-700 tracking-wide italic">
                    {transliteration || (transliterationAvailable ? "Transliteration unavailable" : "Not applicable for English script")}
                  </div>
                </div>

                {/* SECTION C: ENGLISH MEANING (SEMANTIC EXPLANATION) */}
                <div className="p-3 rounded-md bg-warm-sand/20 border border-warm-sand/50 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-charcoal-muted">
                    <span className="text-forest uppercase tracking-wider flex items-center gap-1">
                      <span>C. English Meaning</span>
                      <span className="text-[10px] font-normal text-charcoal-muted">(What this sentence means)</span>
                    </span>
                    {englishMeaning && englishMeaning !== "English meaning unavailable" && (
                      <button
                        type="button"
                        onClick={() => copyToClipboard(englishMeaning, "meaning")}
                        className="p-1 rounded hover:text-forest hover:bg-forest/5"
                        title="Copy English meaning"
                      >
                        {copiedKey === "meaning" ? <Check className="w-3.5 h-3.5 text-forest" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                  <div className="text-xs sm:text-sm font-sans text-charcoal font-normal">
                    {englishMeaning || "English meaning unavailable"}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ACTION BUTTONS & COPY ALL */}
          {translatedText && (
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-forest/15">
              <div className="flex items-center gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={copyAll}
                  className="px-2.5 py-1 text-xs font-medium rounded border border-forest/25 bg-card hover:bg-forest/5 text-forest inline-flex items-center gap-1.5 shadow-2xs"
                >
                  {copiedKey === "all" ? <Check className="w-3.5 h-3.5 text-forest" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === "all" ? "Copied All" : "Copy All Results"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePlayAudio("native")}
                  className={`px-2.5 py-1 text-xs font-medium rounded border transition-colors inline-flex items-center gap-1.5 ${
                    isPlayingAudio ? "bg-forest text-warm-ivory border-forest" : "bg-card border-forest/25 text-forest hover:bg-forest/5"
                  }`}
                >
                  {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5 text-sand" /> : <Volume2 className="w-3.5 h-3.5" />}
                  <span>{isPlayingAudio ? "Stop Audio" : `Listen (${targetCap.name})`}</span>
                </button>
              </div>

              {confidenceScore !== null && (
                <div className="text-[10px] text-charcoal-muted font-mono flex items-center gap-1">
                  <span>Confidence:</span>
                  <span className="font-bold text-forest">{Math.round(confidenceScore * 100)}%</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 4. TRANSLATION HISTORY DRAWER */}
      {showHistory && (
        <div className="border-t border-forest/15 bg-warm-ivory/50 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-forest" />
              <h3 className="font-serif font-bold text-sm text-forest">Recent Translations</h3>
            </div>
            {historyItems.length > 0 && (
              <button
                type="button"
                onClick={clearHistory}
                className="text-xs text-red-700 hover:text-red-900 inline-flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear History</span>
              </button>
            )}
          </div>

          {historyItems.length === 0 ? (
            <p className="text-xs text-charcoal-muted">No recent translations stored on this device.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
              {historyItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setSourceText(item.sourceText);
                    setSourceLang(item.sourceLanguage);
                    setTargetLang(item.targetLanguage);
                    setTranslatedText(item.translatedText);
                    setTransliteration(item.transliteration || null);
                    setEnglishMeaning(item.englishMeaning || null);
                    setShowHistory(false);
                  }}
                  className="p-2.5 rounded bg-card border border-forest/15 hover:border-forest text-xs cursor-pointer transition-colors shadow-2xs space-y-1"
                >
                  <div className="flex items-center justify-between text-[10px] text-charcoal-muted font-mono">
                    <span>
                      {ALL_TRANSLATION_CAPABILITIES[item.sourceLanguage]?.name || item.sourceLanguage} →{" "}
                      {ALL_TRANSLATION_CAPABILITIES[item.targetLanguage]?.name || item.targetLanguage}
                    </span>
                    <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <div className="font-medium text-charcoal truncate">&ldquo;{item.sourceText}&rdquo;</div>
                  <div className="text-forest font-semibold truncate">→ {item.translatedText}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
