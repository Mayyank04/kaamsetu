/**
 * KAAMSETU — Universal Speech Recognition & Synthesis Engine
 * 
 * Production-hardened abstraction for Web Speech Recognition and Speech Synthesis.
 * Enforces strict lifecycle cleanup, explicit state transitions, permission auditing,
 * and voice capability validation across Indian regional languages.
 */

export type VoiceInputState =
  | "idle"
  | "requesting_permission"
  | "listening"
  | "processing"
  | "completed"
  | "failed";

export type SpeechErrorCode =
  | "not-allowed"
  | "service-not-allowed"
  | "no-speech"
  | "audio-capture"
  | "network"
  | "aborted"
  | "language-not-supported"
  | "unsupported-browser"
  | "unknown";

export interface SpeechLanguageSupport {
  code: string;
  bcp47: string;
  name: string;
  nativeName: string;
  recognitionSupported: boolean;
  synthesisSupported: boolean;
  voiceAvailable?: boolean;
  note?: string;
}

// ============================================================================
// 1. LANGUAGE TO BCP-47 RECOGNITION MAPPING
// ============================================================================
export const SPEECH_BCP47_MAP: Record<string, string> = {
  en: "en-IN",
  hi: "hi-IN",
  bn: "bn-IN",
  ta: "ta-IN",
  te: "te-IN",
  mr: "mr-IN",
  gu: "gu-IN",
  kn: "kn-IN",
  ml: "ml-IN",
  pa: "pa-IN",
  as: "as-IN",
  or: "or-IN",
  ur: "ur-IN",
  sa: "sa-IN",
  bho: "bho-IN",
  mai: "mai-IN",
  kok: "kok-IN",
  ks: "ks-IN",
  ne: "ne-IN",
  sd: "sd-IN",
};

/**
 * Returns BCP-47 tag for speech recognition / synthesis.
 * Does NOT silently default unsupported languages to 'hi-IN'.
 */
export function getSpeechBCP47Tag(langCode: string): string | null {
  if (!langCode || langCode === "auto") return "hi-IN";
  return SPEECH_BCP47_MAP[langCode] || null;
}

/**
 * Checks if the browser environment supports Web Speech Recognition
 */
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition
  );
}

/**
 * Checks if the browser environment supports Speech Synthesis
 */
export function isSpeechSynthesisSupported(): boolean {
  if (typeof window === "undefined") return false;
  return "speechSynthesis" in window && typeof window.SpeechSynthesisUtterance !== "undefined";
}

/**
 * Maps Web Speech API error strings to human-friendly, localized messages
 */
export function getSpeechErrorMessage(error: string): { code: SpeechErrorCode; message: string; actionable: string } {
  switch (error) {
    case "not-allowed":
    case "permission-denied":
      return {
        code: "not-allowed",
        message: "Microphone permission was denied.",
        actionable: "Please allow microphone access in your browser site settings or use manual typing.",
      };
    case "service-not-allowed":
      return {
        code: "service-not-allowed",
        message: "Speech recognition service is disallowed by browser security policy.",
        actionable: "Check browser permissions or enterprise security settings.",
      };
    case "no-speech":
      return {
        code: "no-speech",
        message: "No speech was detected before timeout.",
        actionable: "Please click the microphone and speak clearly into your mic.",
      };
    case "audio-capture":
      return {
        code: "audio-capture",
        message: "No audio capture hardware detected.",
        actionable: "Ensure your microphone is plugged in and recognized by your system.",
      };
    case "network":
      return {
        code: "network",
        message: "Speech recognition network connection failed.",
        actionable: "Check your internet connection or use offline typing.",
      };
    case "aborted":
      return {
        code: "aborted",
        message: "Speech listening was cancelled.",
        actionable: "Click the microphone whenever you are ready to speak.",
      };
    case "language-not-supported":
      return {
        code: "language-not-supported",
        message: "Speech model for this language is not installed in your browser.",
        actionable: "You can type in this language, or select English / Hindi for voice input.",
      };
    default:
      return {
        code: "unknown",
        message: `Microphone error (${error || "unspecified"}).`,
        actionable: "Please retry or use manual text typing.",
      };
  }
}

// ============================================================================
// 2. SPEECH SYNTHESIS (TTS) VOICE RESOLUTION & PLAYBACK
// ============================================================================

/**
 * Finds the best matching browser SpeechSynthesisVoice for a given BCP-47 code.
 */
export function findMatchingVoice(bcp47: string): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;

  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  const target = bcp47.toLowerCase();
  const prefix = target.split("-")[0]; // e.g., 'hi' from 'hi-IN'

  // 1. Exact match e.g. 'hi-IN'
  const exact = voices.find((v) => v.lang.toLowerCase() === target);
  if (exact) return exact;

  // 2. Prefix match e.g. 'hi_IN' or 'hi'
  const prefixMatch = voices.find((v) => v.lang.toLowerCase().startsWith(prefix));
  if (prefixMatch) return prefixMatch;

  return null;
}

/**
 * Checks whether an appropriate voice exists in the browser for this language
 */
export function hasNativeVoice(langCode: string): { hasVoice: boolean; voiceName?: string; note?: string } {
  const bcp47 = getSpeechBCP47Tag(langCode);
  if (!bcp47) {
    return { hasVoice: false, note: "No BCP-47 tag mapped for this language." };
  }

  const voice = findMatchingVoice(bcp47);
  if (voice) {
    return { hasVoice: true, voiceName: voice.name };
  }

  return {
    hasVoice: false,
    note: `No native speech voice found in browser for ${bcp47}. Speech playback will be silent or use default language.`,
  };
}

/**
 * Speaks text using the browser's speech synthesis engine.
 * Protects against playback crashes, handles pause/cancel, and cleans up handles.
 */
export function speakText(
  text: string,
  langCode: string,
  callbacks?: {
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: any) => void;
  }
): { stop: () => void } {
  if (typeof window === "undefined" || !("speechSynthesis" in window) || !text.trim()) {
    callbacks?.onError?.("Speech synthesis not supported in this browser.");
    return { stop: () => {} };
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const bcp47 = getSpeechBCP47Tag(langCode) || "en-IN";
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = bcp47;
  utterance.rate = 0.95; // slightly deliberate for clarity across regional dialects
  utterance.pitch = 1.0;

  const matchingVoice = findMatchingVoice(bcp47);
  if (matchingVoice) {
    utterance.voice = matchingVoice;
  }

  utterance.onstart = () => {
    callbacks?.onStart?.();
  };

  utterance.onend = () => {
    callbacks?.onEnd?.();
  };

  utterance.onerror = (e) => {
    // 'canceled' or 'interrupted' are expected when user stops or navigates away
    if (e.error === "canceled" || e.error === "interrupted") {
      callbacks?.onEnd?.();
    } else {
      console.warn("[SpeechSynthesis] Error:", e);
      callbacks?.onError?.(e);
    }
  };

  window.speechSynthesis.speak(utterance);

  return {
    stop: () => {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    },
  };
}

// ============================================================================
// 3. VOICE RECOGNITION INSTANCE FACTORY (Zero Leakage Lifecycle)
// ============================================================================

export interface SpeechRecognitionController {
  start: () => void;
  stop: () => void;
  abort: () => void;
  destroy: () => void;
}

export function createSpeechRecognitionSession(options: {
  langCode: string;
  onStateChange: (state: VoiceInputState) => void;
  onInterimTranscript: (text: string) => void;
  onFinalTranscript: (text: string) => void;
  onError: (errorInfo: { code: SpeechErrorCode; message: string; actionable: string }) => void;
}): SpeechRecognitionController {
  if (typeof window === "undefined") {
    return { start: () => {}, stop: () => {}, abort: () => {}, destroy: () => {} };
  }

  const SpeechRec =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRec) {
    options.onStateChange("failed");
    options.onError({
      code: "unsupported-browser",
      message: "Web Speech Recognition is not supported in this browser.",
      actionable: "Please use Chrome, Edge, Safari, or enter text using the keyboard.",
    });
    return { start: () => {}, stop: () => {}, abort: () => {}, destroy: () => {} };
  }

  let recognition: any = null;
  let isDestroyed = false;
  let finalTranscriptAccumulator = "";

  const bcp47 = getSpeechBCP47Tag(options.langCode);
  if (!bcp47) {
    options.onStateChange("failed");
    options.onError({
      code: "language-not-supported",
      message: `Speech recognition is not configured for language code '${options.langCode}'.`,
      actionable: "Please select English, Hindi, Bengali, Tamil, etc., or type manually.",
    });
    return { start: () => {}, stop: () => {}, abort: () => {}, destroy: () => {} };
  }

  try {
    recognition = new SpeechRec();
    recognition.lang = bcp47;
    recognition.continuous = false; // single focused utterance session
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      if (isDestroyed) return;
      options.onStateChange("listening");
    };

    recognition.onaudiostart = () => {
      if (isDestroyed) return;
      options.onStateChange("listening");
    };

    recognition.onresult = (event: any) => {
      if (isDestroyed) return;
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

      if (interim) {
        options.onInterimTranscript(interim);
      }

      if (final) {
        finalTranscriptAccumulator = (finalTranscriptAccumulator + " " + final).trim();
        options.onFinalTranscript(finalTranscriptAccumulator);
      }
    };

    recognition.onerror = (event: any) => {
      if (isDestroyed) return;
      const errorInfo = getSpeechErrorMessage(event.error);
      options.onStateChange("failed");
      options.onError(errorInfo);
    };

    recognition.onend = () => {
      if (isDestroyed) return;
      options.onStateChange("completed");
    };
  } catch (err: any) {
    options.onStateChange("failed");
    options.onError(getSpeechErrorMessage("audio-capture"));
  }

  return {
    start: () => {
      if (isDestroyed || !recognition) return;
      try {
        finalTranscriptAccumulator = "";
        options.onStateChange("requesting_permission");
        recognition.start();
      } catch (err: any) {
        // Recognition already started or error
        if (err.name !== "InvalidStateError") {
          options.onStateChange("failed");
          options.onError(getSpeechErrorMessage(err.message || "unknown"));
        }
      }
    },
    stop: () => {
      if (isDestroyed || !recognition) return;
      try {
        options.onStateChange("processing");
        recognition.stop();
      } catch {
        // ignore
      }
    },
    abort: () => {
      if (isDestroyed || !recognition) return;
      try {
        recognition.abort();
        options.onStateChange("idle");
      } catch {
        // ignore
      }
    },
    destroy: () => {
      isDestroyed = true;
      if (recognition) {
        try {
          recognition.abort();
          recognition.onstart = null;
          recognition.onaudiostart = null;
          recognition.onresult = null;
          recognition.onerror = null;
          recognition.onend = null;
        } catch {
          // ignore
        }
        recognition = null;
      }
    },
  };
}
