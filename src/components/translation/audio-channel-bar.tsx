"use client";

import * as React from "react";
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  Volume2,
  VolumeX,
  ChevronDown,
  Sparkles,
  SlidersHorizontal,
} from "lucide-react";
import {
  AudioChannel,
  PlaybackSpeed,
  ChannelPlaybackStatus,
  VoiceInfo,
  SUPPORTED_PLAYBACK_SPEEDS,
} from "@/lib/voice/types";

interface AudioChannelBarProps {
  channel: AudioChannel;
  title: string;
  subtitle?: string;
  status: ChannelPlaybackStatus;
  disabled?: boolean;
  compact?: boolean;
  onPlay: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onReplay: () => void;
  onSpeedChange: (speed: PlaybackSpeed) => void;
  onVoiceChange: (voice: VoiceInfo) => void;
}

export function AudioChannelBar({
  channel,
  title,
  subtitle,
  status,
  disabled = false,
  compact = false,
  onPlay,
  onPause,
  onResume,
  onStop,
  onReplay,
  onSpeedChange,
  onVoiceChange,
}: AudioChannelBarProps) {
  const [isVoicePickerOpen, setIsVoicePickerOpen] = React.useState(false);

  const isSpeaking = status.state === "speaking";
  const isPaused = status.state === "paused";
  const isLoading = status.state === "loading";
  const isFailed = status.state === "failed";

  return (
    <div
      className={`rounded-md border border-forest/15 bg-warm-ivory/50 transition-colors ${
        isSpeaking ? "border-forest/40 bg-forest/5 shadow-2xs" : ""
      } ${compact ? "p-2" : "p-2.5 sm:p-3"}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* LEFT: Channel Title & State Indicator */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center gap-1.5">
            {/* Primary Action Button: Play / Pause / Resume */}
            {isSpeaking ? (
              <button
                type="button"
                onClick={onPause}
                disabled={disabled}
                className="w-8 h-8 rounded-full bg-forest text-warm-ivory hover:bg-forest/90 flex items-center justify-center transition-colors shadow-2xs active:scale-95 shrink-0"
                title="Pause playback"
                aria-label={`Pause ${title}`}
              >
                <Pause className="w-3.5 h-3.5 fill-current" />
              </button>
            ) : isPaused ? (
              <button
                type="button"
                onClick={onResume}
                disabled={disabled}
                className="w-8 h-8 rounded-full bg-forest text-warm-ivory hover:bg-forest/90 flex items-center justify-center transition-colors shadow-2xs active:scale-95 shrink-0"
                title="Resume playback"
                aria-label={`Resume ${title}`}
              >
                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onPlay}
                disabled={disabled || isLoading}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-2xs active:scale-95 shrink-0 ${
                  disabled
                    ? "bg-forest/20 text-charcoal-muted cursor-not-allowed"
                    : "bg-forest text-warm-ivory hover:bg-forest/90"
                }`}
                title={`Listen to ${title}`}
                aria-label={`Listen to ${title}`}
              >
                {isLoading ? (
                  <span className="w-3.5 h-3.5 border-2 border-sand border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                )}
              </button>
            )}

            {/* Stop Button (visible when playing or paused) */}
            {(isSpeaking || isPaused) && (
              <button
                type="button"
                onClick={onStop}
                className="w-7 h-7 rounded border border-forest/20 bg-card hover:bg-forest/10 text-forest flex items-center justify-center transition-colors shadow-2xs active:scale-95 shrink-0"
                title="Stop audio playback"
                aria-label={`Stop ${title}`}
              >
                <Square className="w-3 h-3 fill-current" />
              </button>
            )}

            {/* Replay Button */}
            {!isSpeaking && !isPaused && status.text && (
              <button
                type="button"
                onClick={onReplay}
                disabled={disabled}
                className="w-7 h-7 rounded border border-forest/15 bg-card hover:bg-forest/5 text-charcoal-muted hover:text-forest flex items-center justify-center transition-colors active:scale-95 shrink-0"
                title="Replay from start"
                aria-label={`Replay ${title}`}
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Channel Label */}
          <div className="truncate">
            <div className="flex items-center gap-1.5 truncate">
              <span className="text-xs font-bold text-forest uppercase tracking-wider truncate">
                {title}
              </span>
              {/* Waveform Acoustic Activity Indicator */}
              {isSpeaking && (
                <div
                  className="flex items-center gap-0.5 h-3 px-1.5 py-0.5 rounded-full bg-forest/10 border border-forest/20 shrink-0"
                  title="Speaking..."
                >
                  <span className="w-1 bg-forest rounded-full animate-pulse h-2.5" />
                  <span className="w-1 bg-forest rounded-full animate-bounce h-3" style={{ animationDelay: "150ms" }} />
                  <span className="w-1 bg-forest rounded-full animate-pulse h-2" style={{ animationDelay: "300ms" }} />
                </div>
              )}
            </div>
            {subtitle && (
              <div className="text-[11px] text-charcoal-muted truncate font-sans">
                {subtitle}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Speed Controls & Voice Selection */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* SPEED SELECTOR PILLS */}
          <div
            className="flex items-center rounded border border-forest/20 bg-card p-0.5 shadow-2xs"
            role="group"
            aria-label={`${title} playback speed`}
          >
            {SUPPORTED_PLAYBACK_SPEEDS.map((s) => {
              const isSelected = status.speed === s.value;
              return (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => onSpeedChange(s.value)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors font-semibold ${
                    isSelected
                      ? "bg-forest text-warm-ivory shadow-2xs"
                      : "text-charcoal hover:bg-forest/10 text-charcoal-muted"
                  }`}
                  title={s.desc}
                  aria-pressed={isSelected}
                >
                  {s.label}
                </button>
              );
            })}
          </div>

          {/* VOICE SELECTOR DROPDOWN (if multiple candidate voices exist) */}
          {status.availableVoices.length > 1 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsVoicePickerOpen(!isVoicePickerOpen)}
                className="flex items-center gap-1 px-2 py-1 rounded border border-forest/20 bg-card hover:border-forest text-[11px] font-medium text-forest transition-colors shadow-2xs"
                title="Select preferred voice"
                aria-expanded={isVoicePickerOpen}
              >
                <SlidersHorizontal className="w-3 h-3 text-sand-dark" />
                <span className="hidden sm:inline max-w-[90px] truncate font-sans">
                  {status.selectedVoice?.name.replace(/Google|Microsoft|Apple/i, "").trim() || "Voice"}
                </span>
                <ChevronDown className="w-3 h-3 text-charcoal-muted" />
              </button>

              {isVoicePickerOpen && (
                <div className="absolute right-0 top-full mt-1 z-50 w-64 max-h-56 overflow-y-auto rounded-md bg-card border border-forest/20 shadow-sovereign-md p-1">
                  <div className="px-2 py-1 text-[10px] uppercase font-bold text-charcoal-muted border-b border-forest/10 mb-1">
                    Available Voices ({status.availableVoices.length})
                  </div>
                  {status.availableVoices.map((v) => {
                    const isSelected = status.selectedVoice?.id === v.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => {
                          onVoiceChange(v);
                          setIsVoicePickerOpen(false);
                        }}
                        className={`w-full text-left px-2 py-1.5 rounded text-xs flex items-center justify-between transition-colors ${
                          isSelected ? "bg-forest/10 font-bold text-forest" : "text-charcoal hover:bg-forest/5"
                        }`}
                      >
                        <div className="truncate pr-1">
                          <div className="truncate font-medium">{v.name}</div>
                          <div className="text-[10px] text-charcoal-muted font-mono">{v.bcp47}</div>
                        </div>
                        {v.isNatural && (
                          <span className="px-1.5 py-0.5 rounded bg-sand/30 text-forest text-[9px] font-semibold shrink-0">
                            Natural
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ERROR OR FALLBACK NOTICE */}
      {status.error && (
        <div className="mt-2 text-[11px] text-amber-800 bg-amber-50/80 border border-amber-200 rounded px-2 py-1">
          {status.error}
        </div>
      )}
    </div>
  );
}
