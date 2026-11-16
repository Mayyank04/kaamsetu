"use client";

import * as React from "react";
import { Mic, MicOff, Square, Play, RefreshCw, AlertCircle, FileText } from "lucide-react";
import { SupportedLanguageCode } from "@/schemas/onboarding.schema";
import { ONBOARDING_I18N } from "@/lib/i18n/onboarding";
import { Button } from "@/components/ui/button";

interface AudioRecorderProps {
  language: SupportedLanguageCode;
  transcript: string;
  onChangeTranscript: (text: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  inputMode: "voice" | "text";
}

// Browser SpeechRecognition interface
interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
      isFinal: boolean;
    };
    length: number;
  };
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: unknown) => void;
  onend: () => void;
}

// Map language codes to BCP-47 for Web Speech API
const BCP47_MAP: Record<SupportedLanguageCode, string> = {
  hi: "hi-IN",
  en: "en-IN",
  bn: "bn-IN",
  mr: "mr-IN",
  ta: "ta-IN",
  te: "te-IN",
  as: "as-IN",
};

export function AudioRecorder({
  language,
  transcript,
  onChangeTranscript,
  onAnalyze,
  isAnalyzing,
  inputMode,
}: AudioRecorderProps) {
  const i18n = ONBOARDING_I18N[language];
  const [isRecording, setIsRecording] = React.useState(false);
  const [recordingSeconds, setRecordingSeconds] = React.useState(0);
  const [speechSupported, setSpeechSupported] = React.useState<boolean>(true);
  const [activeMode, setActiveMode] = React.useState<"voice" | "text">(inputMode);
  const [micError, setMicError] = React.useState<string | null>(null);

  const recognitionRef = React.useRef<SpeechRecognitionInstance | null>(null);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const onChangeTranscriptRef = React.useRef(onChangeTranscript);
  onChangeTranscriptRef.current = onChangeTranscript;

  React.useEffect(() => {
    // Check Web Speech API availability
    const SpeechRecognitionClass =
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionInstance }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionInstance }).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setSpeechSupported(false);
      setActiveMode("text");
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = BCP47_MAP[language] || "hi-IN";

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let currentTranscript = "";
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript + " ";
        }
        if (currentTranscript.trim()) {
          onChangeTranscriptRef.current(currentTranscript.trim());
        }
      };

      recognition.onerror = (event: unknown) => {
        setIsRecording(false);
        const errType = (event as { error?: string })?.error || "unknown";
        if (errType === "not-allowed" || errType === "permission-denied") {
          setMicError(
            language === "as"
              ? "মাইক্ৰ'ফ'ন অনুমতি পোৱা নগ'ল। ব্ৰাউজাৰ ছেটিংছত মাইকৰ অনুমতি দিয়ক বা তলত লিখক।"
              : language === "hi"
              ? "माइक्रोफोन की अनुमति नहीं मिली। कृपया ब्राउज़र सेटिंग्स में अनुमति दें या नीचे लिखें।"
              : "Microphone permission was denied. Please allow microphone access or type below."
          );
        } else if (errType === "no-speech") {
          setMicError(
            language === "as"
              ? "কোনো মাত ধৰা নপৰিল। অনুগ্ৰহ কৰি মাইকৰ ওচৰত স্পষ্টকৈ কওক।"
              : language === "hi"
              ? "कोई आवाज नहीं सुनाई दी। कृपया माइक के पास स्पष्ट रूप से बोलें।"
              : "No speech detected. Please speak closer to the microphone."
          );
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    } catch {
      setSpeechSupported(false);
      setActiveMode("text");
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [language]);

  const toggleRecording = () => {
    setMicError(null);
    if (!speechSupported) {
      setActiveMode("text");
      return;
    }

    if (isRecording) {
      // Stop
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    } else {
      // Start
      try {
        if (recognitionRef.current) {
          recognitionRef.current.lang = BCP47_MAP[language] || "hi-IN";
          recognitionRef.current.start();
        }
        setIsRecording(true);
        setRecordingSeconds(0);
        timerRef.current = setInterval(() => {
          setRecordingSeconds((prev) => prev + 1);
        }, 1000);
      } catch {
        // Fall back to text if microphone permission denied
        setSpeechSupported(false);
        setActiveMode("text");
      }
    }
  };

  const handleLoadSample = (sampleText: string) => {
    onChangeTranscript(sampleText);
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Speech Support Warning if voice recognition unavailable */}
      {!speechSupported && (
        <div className="rounded-sm bg-sand/20 border border-sand/40 p-4 flex items-start gap-3 text-xs text-charcoal">
          <AlertCircle className="h-5 w-5 text-sand-800 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="text-forest block">
              Browser Voice Recognition Not Detected
            </strong>
            <p className="text-charcoal-muted leading-relaxed">
              Your browser does not natively expose the Web Speech API. You can type or paste your craft details below, or load realistic sample testimonies to test the AI extractor.
            </p>
          </div>
        </div>
      )}

      {/* Voice Attestation Controls Box */}
      {activeMode === "voice" && speechSupported && (
        <div className="rounded-md border border-forest/15 bg-card p-6 shadow-sovereign-sm text-center space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-forest">
              {isRecording ? i18n.recordingActive : i18n.recordPrompt}
            </span>
            <div className="font-mono text-2xl font-bold text-forest">
              {formatTimer(recordingSeconds)}
            </div>
          </div>

          {/* Central Recording Pulse Button */}
          <div className="flex justify-center items-center py-4">
            <button
              onClick={toggleRecording}
              className={`relative flex h-24 w-24 items-center justify-center rounded-full transition-all duration-300 focus:outline-none select-none ${
                isRecording
                  ? "bg-terracotta text-white ring-8 ring-terracotta/20 animate-pulse"
                  : "bg-forest hover:bg-forest-500 text-sand shadow-sovereign-md hover:scale-105"
              }`}
              aria-label={isRecording ? i18n.stopRecording : i18n.holdToSpeak}
            >
              {isRecording ? (
                <Square className="h-8 w-8 fill-current" />
              ) : (
                <Mic className="h-10 w-10 text-sand" />
              )}
            </button>
          </div>

          {micError && (
            <div className="rounded-xs bg-terracotta/10 border border-terracotta/30 p-3 text-xs text-terracotta flex items-center justify-between gap-2 text-left">
              <span>{micError}</span>
              <button
                type="button"
                onClick={() => setMicError(null)}
                className="font-bold underline text-[11px] shrink-0"
              >
                Dismiss
              </button>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
            <span className="text-charcoal-muted">
              {isRecording ? "Click square to finish speaking" : "Click mic to speak in your language"}
            </span>
            <span>•</span>
            <button
              onClick={() => setActiveMode("text")}
              className="text-forest hover:underline font-semibold"
            >
              Switch to text typing
            </button>
          </div>
        </div>
      )}

      {/* Real-Time Transcript & Review Editor */}
      <div className="rounded-md border border-forest/15 bg-card p-6 shadow-sovereign-sm space-y-4">
        <div className="flex items-center justify-between border-b border-forest/10 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-forest" />
            <h3 className="font-bold text-sm text-forest uppercase tracking-wide">
              {i18n.reviewTranscript}
            </h3>
          </div>
          <span className="text-[11px] text-charcoal-muted">
            {transcript.trim().length} characters
          </span>
        </div>

        <textarea
          value={transcript}
          onChange={(e) => onChangeTranscript(e.target.value)}
          rows={5}
          placeholder={i18n.placeholderTranscript}
          className="w-full rounded-sm border border-forest/20 p-4 text-sm text-foreground bg-paper-grid focus:outline-none focus:border-forest focus:ring-1 focus:ring-forest leading-relaxed font-sans"
        />

        {/* Quick Sample Testimonies Loader for Testing */}
        {i18n.sampleTestimonies && i18n.sampleTestimonies.length > 0 && (
          <div className="space-y-2 pt-1 border-t border-forest/10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-muted block">
              Quick Test Samples ({language.toUpperCase()}):
            </span>
            <div className="flex flex-wrap gap-2">
              {i18n.sampleTestimonies.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleLoadSample(s.text)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xs bg-forest/5 hover:bg-forest/10 text-forest text-xs font-medium border border-forest/10 transition-colors"
                >
                  <Play className="h-3 w-3 text-forest" />
                  <span>{s.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action CTA to trigger Gemini Extraction */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <p className="text-xs text-charcoal-muted max-w-sm">
          Gemini strictly structures only what you stated without inventing unstated details.
        </p>

        <Button
          variant="default"
          size="lg"
          onClick={onAnalyze}
          disabled={isAnalyzing || transcript.trim().length < 10}
          className="bg-forest hover:bg-forest-500 text-ivory font-bold h-12 px-8 w-full sm:w-auto shadow-sm"
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin text-sand" />
              Analyzing with Gemini AI...
            </>
          ) : (
            <>
              <FileText className="mr-2 h-4 w-4 text-sand" />
              {i18n.analyzeBtn}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
