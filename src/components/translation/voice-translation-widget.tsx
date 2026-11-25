"use client";

import * as React from "react";
import {
  Mic,
  MicOff,
  Languages,
  Copy,
  Check,
  RotateCcw,
  AlertCircle,
  Loader2,
  ArrowRight,
  VolumeX,
} from "lucide-react";
import { ALL_TRANSLATION_CAPABILITIES } from "@/lib/translation/registry";
import {
  createSpeechRecognitionSession,
  isSpeechRecognitionSupported,
  VoiceInputState,
} from "@/lib/translation/speech";
import { playbackController } from "@/lib/voice/playback-controller";
import { AudioChannel, ChannelPlaybackStatus, PlaybackSpeed, VoiceInfo } from "@/lib/voice/types";
import { detectScriptLanguage } from "@/lib/voice/voice-selection";
import { AudioChannelBar } from "./audio-channel-bar";

interface VoiceTranslationWidgetProps {
  initialSourceLang?: string;
  initialTargetLang?: string;
  onTranslationComplete?: (original: string, translated: string) => void;
  className?: string;
}

export function VoiceTranslationWidget({
  initialSourceLang = "hi",
  initialTargetLang = "as",
  onTranslationComplete,
  className = "",
}: VoiceTranslationWidgetProps) {
  const [sourceLang, setSourceLang] = React.useState(initialSourceLang);
  const [targetLang, setTargetLang] = React.useState(initialTargetLang);
  const [voiceState, setVoiceState] = React.useState<VoiceInputState>("idle");
  const [originalTranscript, setOriginalTranscript] = React.useState("");
  const [interimTranscript, setInterimTranscript] = React.useState("");
  const [translatedText, setTranslatedText] = React.useState<string | null>(null);
  const [transliteration, setTransliteration] = React.useState<string | null>(null);
  const [englishMeaning, setEnglishMeaning] = React.useState<string | null>(null);
  const [isTranslating, setIsTranslating] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  const speechSessionRef = React.useRef<any>(null);

  // Playback statuses
  const [channelStatuses, setChannelStatuses] = React.useState<Record<AudioChannel, ChannelPlaybackStatus>>({
    original: playbackController.getStatus("original"),
    translated: playbackController.getStatus("translated"),
    transliteration: playbackController.getStatus("transliteration"),
  });

  React.useEffect(() => {
    const unsubscribe = playbackController.subscribe((status) => {
      setChannelStatuses((prev) => ({
        ...prev,
        [status.channel]: status,
      }));
    });

    return () => {
      unsubscribe();
      playbackController.stopAll();
      if (speechSessionRef.current) {
        speechSessionRef.current.destroy();
      }
    };
  }, []);

  const translateSpokenText = async (textToTranslate: string) => {
    const text = textToTranslate.trim();
    if (!text) return;

    setIsTranslating(true);
    setErrorMessage(null);
    playbackController.stopAll();

    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          sourceLanguage: sourceLang === "auto" ? undefined : sourceLang,
          targetLanguage: targetLang,
          contentType: "voice_transcript",
          includeTransliteration: true,
          includeEnglishMeaning: true,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to translate spoken transcript.");
      }

      const data = json.data;
      setTranslatedText(data.translatedText);
      setTransliteration(data.transliteration || null);
      setEnglishMeaning(data.englishMeaning || null);

      if (onTranslationComplete) {
        onTranslationComplete(text, data.translatedText);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Translation failed.");
    } finally {
      setIsTranslating(false);
    }
  };

  const startListening = () => {
    setErrorMessage(null);
    setInterimTranscript("");
    playbackController.stopAll();

    if (!isSpeechRecognitionSupported()) {
      setErrorMessage("Speech recognition is not supported in this browser. Please type text below.");
      return;
    }

    if (speechSessionRef.current) {
      speechSessionRef.current.destroy();
    }

    const session = createSpeechRecognitionSession({
      langCode: sourceLang,
      onStateChange: (state) => {
        setVoiceState(state);
        if (state === "idle" || state === "completed") {
          setInterimTranscript("");
        }
      },
      onInterimTranscript: (interim) => {
        setInterimTranscript(interim);
      },
      onFinalTranscript: (final) => {
        setOriginalTranscript((prev) => (prev ? `${prev} ${final}` : final));
        setInterimTranscript("");
        setVoiceState("idle");
      },
      onError: (err) => {
        setErrorMessage(`${err.message} ${err.actionable}`);
        setVoiceState("failed");
        setInterimTranscript("");
      },
    });

    speechSessionRef.current = session;
    session.start();
  };

  const stopListening = () => {
    if (speechSessionRef.current) {
      speechSessionRef.current.stop();
    }
    setVoiceState("idle");
  };

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

  const handlePlayChannel = (channel: AudioChannel) => {
    let text = "";
    let lang = "";

    if (channel === "original") {
      text = originalTranscript.trim();
      lang = sourceLang === "auto" ? detectScriptLanguage(text) : sourceLang;
    } else if (channel === "translated") {
      text = (translatedText || "").trim();
      lang = targetLang;
    } else if (channel === "transliteration") {
      text = (transliteration || "").trim();
      lang = "en";
    }

    if (!text) return;

    const currentStatus = channelStatuses[channel];
    if (currentStatus.state === "speaking") {
      playbackController.pause(channel);
    } else if (currentStatus.state === "paused") {
      playbackController.resume(channel);
    } else {
      playbackController.play({
        channel,
        text,
        language: lang,
        speed: currentStatus.speed,
        preferredVoiceId: currentStatus.selectedVoice?.id,
      });
    }
  };

  const targetCap = ALL_TRANSLATION_CAPABILITIES[targetLang] || ALL_TRANSLATION_CAPABILITIES.as;
  const sourceCap = ALL_TRANSLATION_CAPABILITIES[sourceLang] || ALL_TRANSLATION_CAPABILITIES.hi;
  const isListening = voiceState === "listening" || voiceState === "requesting_permission";

  return (
    <div className={`p-4 rounded-md bg-card border border-forest/20 shadow-sovereign-sm space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-forest/10">
        <div>
          <h4 className="font-serif font-bold text-sm text-forest flex items-center gap-1.5">
            <Languages className="w-4 h-4 text-forest" />
            <span>Spoken Voice Translation</span>
          </h4>
          <p className="text-[11px] text-charcoal-muted">
            Speak in your mother tongue; translate in real-time with Native Script, Pronunciation, and English Meaning.
          </p>
        </div>

        {/* Source & Target Indicator */}
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="px-2 py-0.5 rounded bg-forest/10 text-forest border border-forest/20">
            {sourceCap.name} ({sourceCap.nativeName})
          </span>
          <span className="text-forest/60">→</span>
          <span className="px-2 py-0.5 rounded bg-forest text-ivory">
            {targetCap.name} ({targetCap.nativeName})
          </span>
        </div>
      </div>

      {/* Mic Trigger & Listening Indicator */}
      <div className="flex flex-col items-center justify-center p-4 bg-ivory/50 rounded border border-forest/15 space-y-2">
        <button
          type="button"
          onClick={isListening ? stopListening : startListening}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-sovereign-md transition-all ${
            isListening
              ? "bg-red-600 text-white animate-pulse scale-105"
              : "bg-forest text-ivory hover:bg-forest/90"
          }`}
          aria-label={isListening ? "Stop listening" : "Start speaking"}
        >
          {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6 text-sand" />}
        </button>

        <span className="text-xs font-medium text-forest">
          {voiceState === "requesting_permission"
            ? "Requesting microphone permission..."
            : isListening
            ? "Listening... Speak clearly in your language"
            : "Tap microphone to speak"}
        </span>

        {interimTranscript && (
          <p className="text-xs italic text-charcoal bg-card/80 px-3 py-1 rounded border border-forest/10">
            &ldquo;{interimTranscript}&rdquo;
          </p>
        )}

        <span className="text-[10px] text-charcoal-muted">
          Ephemeral audio: Recordings are transcribed live in-browser and never saved to platform storage.
        </span>
      </div>

      {/* Spoken Transcript Input & Review */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-charcoal-muted font-medium">
          <span>Spoken Transcript (Review &amp; Edit before Translate)</span>
          {originalTranscript && (
            <button
              type="button"
              onClick={() => translateSpokenText(originalTranscript)}
              disabled={isTranslating}
              className="text-forest font-semibold hover:underline inline-flex items-center gap-1"
            >
              <span>Translate Spoken Text</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
        <textarea
          value={originalTranscript}
          onChange={(e) => setOriginalTranscript(e.target.value)}
          placeholder="Spoken words will appear here in real-time, or you can type manually..."
          rows={3}
          className="w-full p-2.5 text-xs rounded border border-forest/15 bg-card focus:outline-hidden focus:ring-1 focus:ring-forest text-charcoal resize-none"
        />

        {/* Original Transcript Audio Playback */}
        {originalTranscript.trim() && (
          <AudioChannelBar
            channel="original"
            title="Original Voice"
            subtitle={`${sourceCap.name} Audio`}
            status={channelStatuses.original}
            compact
            onPlay={() => handlePlayChannel("original")}
            onPause={() => playbackController.pause("original")}
            onResume={() => playbackController.resume("original")}
            onStop={() => playbackController.stop("original")}
            onReplay={() => playbackController.replay("original")}
            onSpeedChange={(s) => playbackController.setSpeed("original", s)}
            onVoiceChange={(v) => playbackController.setVoice("original", v)}
          />
        )}
      </div>

      {/* Translate Action Trigger */}
      {originalTranscript.trim() && !translatedText && (
        <button
          type="button"
          onClick={() => translateSpokenText(originalTranscript)}
          disabled={isTranslating}
          className="w-full py-2 text-xs font-bold rounded bg-forest text-ivory hover:bg-forest/90 transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
        >
          {isTranslating ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Translating...</span>
            </>
          ) : (
            <>
              <span>Confirm &amp; Translate Spoken Text to {targetCap.name}</span>
              <ArrowRight className="w-3.5 h-3.5 text-sand" />
            </>
          )}
        </button>
      )}

      {/* Translated Result Output */}
      {translatedText && !isTranslating && (
        <div className="p-3.5 bg-ivory/80 rounded border border-forest/20 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between text-xs font-semibold text-forest pb-1 border-b border-forest/10">
            <span>Translated to {targetCap.name} ({targetCap.nativeName}):</span>
            <button
              type="button"
              onClick={() => copyToClipboard(translatedText, "native")}
              className="p-1 rounded text-charcoal-muted hover:text-forest"
              title="Copy native script"
            >
              {copiedKey === "native" ? <Check className="w-3.5 h-3.5 text-forest" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Section A: Native Script */}
          <div>
            <div className="text-[10px] uppercase font-bold text-charcoal-muted tracking-wider">Native Script</div>
            <p className="text-sm text-charcoal font-semibold leading-relaxed mt-0.5">{translatedText}</p>
          </div>

          {/* Translated Audio Bar with Slow Playback */}
          <AudioChannelBar
            channel="translated"
            title={`Listen in ${targetCap.name}`}
            subtitle={`${targetCap.name} Native Voice`}
            status={channelStatuses.translated}
            compact
            onPlay={() => handlePlayChannel("translated")}
            onPause={() => playbackController.pause("translated")}
            onResume={() => playbackController.resume("translated")}
            onStop={() => playbackController.stop("translated")}
            onReplay={() => playbackController.replay("translated")}
            onSpeedChange={(s) => playbackController.setSpeed("translated", s)}
            onVoiceChange={(v) => playbackController.setVoice("translated", v)}
          />

          {/* Section B: Roman Transliteration */}
          {transliteration && (
            <div className="p-2 rounded bg-forest/5 border border-forest/10 space-y-0.5">
              <div className="flex items-center justify-between text-[10px] uppercase font-bold text-forest tracking-wider">
                <span>Pronunciation (English Letters)</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(transliteration, "translit")}
                  className="hover:text-forest"
                  title="Copy pronunciation"
                >
                  {copiedKey === "translit" ? <Check className="w-3 h-3 text-forest" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
              <p className="text-xs font-medium text-forest-700 italic">{transliteration}</p>
            </div>
          )}

          {/* Section C: English Meaning */}
          {englishMeaning && (
            <div className="p-2 rounded bg-warm-sand/20 border border-warm-sand/40 space-y-0.5">
              <div className="flex items-center justify-between text-[10px] uppercase font-bold text-charcoal-muted tracking-wider">
                <span>English Meaning</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(englishMeaning, "meaning")}
                  className="hover:text-forest"
                  title="Copy meaning"
                >
                  {copiedKey === "meaning" ? <Check className="w-3 h-3 text-forest" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
              <p className="text-xs text-charcoal font-normal">{englishMeaning}</p>
            </div>
          )}
        </div>
      )}

      {/* Error alert */}
      {errorMessage && (
        <div className="flex items-start gap-1.5 p-2.5 rounded bg-amber-50 border border-amber-200 text-xs text-amber-900">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
