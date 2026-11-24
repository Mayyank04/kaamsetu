/**
 * KAAMSETU — Voice Engine & Speech Synthesis Contracts
 * Phase 50.4 Specification
 * 
 * Defines independent playback channel types, playback state machines,
 * playback speed options, voice quality metadata, and TTS provider contracts.
 */

export type AudioChannel = "original" | "translated" | "transliteration";

export type PlaybackState =
  | "idle"
  | "loading"
  | "speaking"
  | "paused"
  | "completed"
  | "failed"
  | "unsupported_voice";

export type PlaybackSpeed = 0.5 | 0.75 | 1.0 | 1.25 | 1.5;

export const SUPPORTED_PLAYBACK_SPEEDS: { value: PlaybackSpeed; label: string; desc: string }[] = [
  { value: 0.5, label: "0.5×", desc: "Very slow (learner mode)" },
  { value: 0.75, label: "0.75×", desc: "Slow (clear pronunciation)" },
  { value: 1.0, label: "1×", desc: "Normal speed" },
  { value: 1.25, label: "1.25×", desc: "Faster" },
  { value: 1.5, label: "1.5×", desc: "Fast" },
];

export interface VoiceInfo {
  id: string;
  name: string;
  lang: string;
  bcp47: string;
  isNatural: boolean;
  isDefault: boolean;
  isRemote: boolean;
  provider: "browser" | "google_cloud" | "azure" | "bhashini";
  qualityScore: number; // 0 - 100 ranking for naturalness
  isInstalledInBrowser: boolean;
  isFallback?: boolean;
  fallbackNote?: string;
}

export interface ChannelPlaybackStatus {
  channel: AudioChannel;
  state: PlaybackState;
  speed: PlaybackSpeed;
  selectedVoice: VoiceInfo | null;
  availableVoices: VoiceInfo[];
  hasNativeVoice: boolean;
  isCrossDialectFallback?: boolean;
  fallbackNote?: string;
  error?: string;
  text: string;
  language: string;
  bcp47: string;
  scriptName?: string;
  isLanguageAmbiguous?: boolean;
  disambiguationCandidates?: { code: string; name: string; nativeName: string; confidence: number }[];
}

export interface TTSRequest {
  text: string;
  language: string;
  speed?: PlaybackSpeed;
  channel?: AudioChannel;
  preferredVoiceId?: string;
}

export interface TTSProviderStatus {
  name: "google_cloud" | "azure" | "bhashini" | "browser";
  status: "OPERATIONAL" | "NOT_CONFIGURED" | "CONFIGURED_UNHEALTHY";
  supportedLanguages: string[];
  latencyMs?: number;
  message?: string;
  isServerGenerated: boolean;
  decodableAudioFormats: string[];
}
