/**
 * KAAMSETU — Channel-Aware Audio Playback Controller
 * Phase 50.4 Specification
 * 
 * Orchestrates independent audio playback channels (Original, Translated, Transliteration)
 * with mandatory speed control (0.5×, 0.75×, 1×, 1.25×, 1.5×), mutual exclusion,
 * transparent voice availability reporting, pause/resume, replay, and zero overlapping speech.
 */

import { AudioChannel, PlaybackState, PlaybackSpeed, ChannelPlaybackStatus, VoiceInfo } from "./types";
import { resolveBestVoice, getVoicesForLanguage } from "./voice-selection";

export type PlaybackListener = (status: ChannelPlaybackStatus) => void;

class PlaybackController {
  private static instance: PlaybackController;

  private currentChannel: AudioChannel | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private listeners: Set<PlaybackListener> = new Set();

  private channelStatuses: Record<AudioChannel, ChannelPlaybackStatus> = {
    original: {
      channel: "original",
      state: "idle",
      speed: 1.0,
      selectedVoice: null,
      availableVoices: [],
      hasNativeVoice: false,
      text: "",
      language: "en",
      bcp47: "en-IN",
    },
    translated: {
      channel: "translated",
      state: "idle",
      speed: 1.0,
      selectedVoice: null,
      availableVoices: [],
      hasNativeVoice: false,
      text: "",
      language: "as",
      bcp47: "as-IN",
    },
    transliteration: {
      channel: "transliteration",
      state: "idle",
      speed: 0.75, // default slightly slower for pronunciation clarity
      selectedVoice: null,
      availableVoices: [],
      hasNativeVoice: false,
      text: "",
      language: "en",
      bcp47: "en-IN",
    },
  };

  private constructor() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        this.refreshVoiceCatalogs();
      };
      this.refreshVoiceCatalogs();
    }
  }

  public static getInstance(): PlaybackController {
    if (!PlaybackController.instance) {
      PlaybackController.instance = new PlaybackController();
    }
    return PlaybackController.instance;
  }

  /**
   * Refreshes available voices for all channels without fabricating fake objects
   */
  public refreshVoiceCatalogs() {
    (["original", "translated", "transliteration"] as AudioChannel[]).forEach((ch) => {
      const status = this.channelStatuses[ch];
      const voices = getVoicesForLanguage(status.language, status.text, ch);
      status.availableVoices = voices;
      status.hasNativeVoice = voices.length > 0;
      if (!status.selectedVoice && voices.length > 0) {
        status.selectedVoice = voices[0];
      }
      this.notify(status);
    });
  }

  /**
   * Subscribes a React component to playback status changes
   */
  public subscribe(listener: PlaybackListener): () => void {
    this.listeners.add(listener);
    // Emit initial states
    listener(this.channelStatuses.original);
    listener(this.channelStatuses.translated);
    listener(this.channelStatuses.transliteration);

    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(status: ChannelPlaybackStatus) {
    this.listeners.forEach((l) => {
      try {
        l({ ...status });
      } catch (err) {
        console.warn("[PlaybackController] Listener error:", err);
      }
    });
  }

  /**
   * Updates playback speed for a specific channel
   */
  public setSpeed(channel: AudioChannel, speed: PlaybackSpeed) {
    const status = this.channelStatuses[channel];
    status.speed = speed;
    this.notify(status);

    // If currently speaking on this channel, restart seamlessly at new speed
    if (this.currentChannel === channel && status.state === "speaking") {
      this.replay(channel);
    }
  }

  /**
   * Updates selected voice for a channel
   */
  public setVoice(channel: AudioChannel, voice: VoiceInfo) {
    const status = this.channelStatuses[channel];
    status.selectedVoice = voice;
    this.notify(status);

    if (this.currentChannel === channel && status.state === "speaking") {
      this.replay(channel);
    }
  }

  /**
   * Retrieves current status of a channel
   */
  public getStatus(channel: AudioChannel): ChannelPlaybackStatus {
    return { ...this.channelStatuses[channel] };
  }

  /**
   * Plays text on a specific channel, ensuring mutual exclusion (stops all other channels).
   */
  public play(options: {
    channel: AudioChannel;
    text: string;
    language: string;
    speed?: PlaybackSpeed;
    preferredVoiceId?: string;
    userSelectedLang?: string;
  }) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      this.updateState(options.channel, "failed", "Speech synthesis is not supported in this browser.");
      return;
    }

    const { channel, text, language, speed, preferredVoiceId, userSelectedLang } = options;
    const trimmed = text.trim();

    if (!trimmed) {
      this.updateState(channel, "failed", "No text provided to speak.");
      return;
    }

    // 1. MUTUAL EXCLUSION: Stop any currently speaking channel
    this.stopAll();

    // 2. Resolve Voice and Locale with User Priority & Dialect Transparency
    const {
      voice,
      hasNativeVoice,
      isCrossDialectFallback,
      fallbackNote,
      bcp47,
      resolvedLanguage,
      identification,
    } = resolveBestVoice(
      language,
      trimmed,
      channel,
      preferredVoiceId || this.channelStatuses[channel].selectedVoice?.id,
      userSelectedLang
    );

    const status = this.channelStatuses[channel];
    status.text = trimmed;
    status.language = resolvedLanguage;
    status.bcp47 = bcp47;
    status.speed = speed || status.speed || 1.0;
    status.availableVoices = getVoicesForLanguage(resolvedLanguage, trimmed, channel, userSelectedLang);
    status.selectedVoice = voice;
    status.hasNativeVoice = hasNativeVoice;
    status.isCrossDialectFallback = isCrossDialectFallback;
    status.fallbackNote = fallbackNote;
    status.scriptName = identification.script;
    status.isLanguageAmbiguous = identification.isAmbiguous;
    status.disambiguationCandidates = identification.candidates;
    status.error = undefined;

    this.currentChannel = channel;
    this.updateState(channel, "loading");

    try {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(trimmed);
      utterance.lang = bcp47;
      utterance.rate = status.speed; // 0.5x, 0.75x, 1x, 1.25x, 1.5x
      utterance.pitch = 1.0; // preserve pitch consistency across speeds

      // Attach genuine matching voice object if available in browser
      if (voice) {
        const rawVoices = window.speechSynthesis.getVoices();
        const raw = rawVoices.find((v) => v.name === voice.name && v.lang === voice.lang);
        if (raw) {
          utterance.voice = raw;
        }
      }

      utterance.onstart = () => {
        if (this.currentChannel === channel) {
          this.updateState(channel, "speaking");
        }
      };

      utterance.onpause = () => {
        if (this.currentChannel === channel) {
          this.updateState(channel, "paused");
        }
      };

      utterance.onresume = () => {
        if (this.currentChannel === channel) {
          this.updateState(channel, "speaking");
        }
      };

      utterance.onend = () => {
        if (this.currentChannel === channel) {
          this.updateState(channel, "completed");
          this.currentChannel = null;
          this.currentUtterance = null;
        }
      };

      utterance.onerror = (e) => {
        if (e.error === "canceled" || e.error === "interrupted") {
          this.updateState(channel, "idle");
        } else {
          console.warn(`[PlaybackController] Channel '${channel}' speech error:`, e.error);
          this.updateState(channel, "failed", `Speech playback error: ${e.error}`);
        }
        if (this.currentChannel === channel) {
          this.currentChannel = null;
          this.currentUtterance = null;
        }
      };

      this.currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (err: any) {
      console.error("[PlaybackController] Failed to initialize speech:", err);
      this.updateState(channel, "failed", err.message || "Failed to start speech synthesis.");
      this.currentChannel = null;
      this.currentUtterance = null;
    }
  }

  /**
   * Pauses currently playing audio
   */
  public pause(channel?: AudioChannel) {
    const targetChannel = channel || this.currentChannel;
    if (!targetChannel) return;

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.pause();
        this.updateState(targetChannel, "paused");
      } catch {
        // ignore
      }
    }
  }

  /**
   * Resumes paused audio
   */
  public resume(channel?: AudioChannel) {
    const targetChannel = channel || this.currentChannel;
    if (!targetChannel) return;

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.resume();
        this.updateState(targetChannel, "speaking");
      } catch {
        // ignore
      }
    }
  }

  /**
   * Stops playback on a specific channel or currently active channel
   */
  public stop(channel?: AudioChannel) {
    const targetChannel = channel || this.currentChannel;
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
    if (targetChannel) {
      this.updateState(targetChannel, "idle");
    }
    if (this.currentChannel === targetChannel) {
      this.currentChannel = null;
      this.currentUtterance = null;
    }
  }

  /**
   * Stops all channels immediately
   */
  public stopAll() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
    (["original", "translated", "transliteration"] as AudioChannel[]).forEach((ch) => {
      if (this.channelStatuses[ch].state !== "idle") {
        this.updateState(ch, "idle");
      }
    });
    this.currentChannel = null;
    this.currentUtterance = null;
  }

  /**
   * Replays audio on a given channel from the beginning
   */
  public replay(channel: AudioChannel) {
    const status = this.channelStatuses[channel];
    if (status.text) {
      this.play({
        channel,
        text: status.text,
        language: status.language,
        speed: status.speed,
        preferredVoiceId: status.selectedVoice?.id,
      });
    }
  }

  private updateState(channel: AudioChannel, state: PlaybackState, error?: string) {
    const status = this.channelStatuses[channel];
    status.state = state;
    if (error !== undefined) {
      status.error = error;
    }
    this.notify(status);
  }
}

export const playbackController = PlaybackController.getInstance();
