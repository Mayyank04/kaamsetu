"use client";

import * as React from "react";
import { Globe, ArrowRight, Search, Check, ArrowRightLeft, ChevronDown } from "lucide-react";
import { ALL_TRANSLATION_CAPABILITIES } from "@/lib/translation/registry";

interface LanguagePairSelectorProps {
  sourceLanguage: string;
  targetLanguage: string;
  onSourceChange?: (lang: string) => void;
  onTargetChange: (lang: string) => void;
  onSwap?: () => void;
  allowAutoSource?: boolean;
  className?: string;
}

export function LanguagePairSelector({
  sourceLanguage,
  targetLanguage,
  onSourceChange,
  onTargetChange,
  onSwap,
  allowAutoSource = true,
  className = "",
}: LanguagePairSelectorProps) {
  const [isSourceOpen, setIsSourceOpen] = React.useState(false);
  const [isTargetOpen, setIsTargetOpen] = React.useState(false);
  const [sourceSearchQuery, setSourceSearchQuery] = React.useState("");
  const [targetSearchQuery, setTargetSearchQuery] = React.useState("");

  const allCapabilities = React.useMemo(() => Object.values(ALL_TRANSLATION_CAPABILITIES), []);

  const filteredSources = React.useMemo(() => {
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

  const filteredTargets = React.useMemo(() => {
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

  const selectedTargetCap = ALL_TRANSLATION_CAPABILITIES[targetLanguage] || ALL_TRANSLATION_CAPABILITIES.as;
  const selectedSourceCap = sourceLanguage === "auto"
    ? { name: "Auto Detect", nativeName: "স্বয়ংক্রিয় / पहचानें", code: "auto" }
    : ALL_TRANSLATION_CAPABILITIES[sourceLanguage] || { name: sourceLanguage, nativeName: "", code: sourceLanguage };

  const handleSwapClick = () => {
    if (onSwap) {
      onSwap();
    } else if (onSourceChange) {
      const oldSource = sourceLanguage === "auto" ? "en" : sourceLanguage;
      onSourceChange(targetLanguage);
      onTargetChange(oldSource);
    }
  };

  return (
    <div className={`flex flex-wrap items-center gap-2 text-xs ${className}`}>
      {/* Source Selector */}
      <div className="relative">
        {onSourceChange ? (
          <button
            type="button"
            onClick={() => {
              setIsSourceOpen(!isSourceOpen);
              setIsTargetOpen(false);
            }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-forest/5 border border-forest/20 hover:border-forest text-charcoal font-medium transition-colors shadow-2xs"
            aria-label="Select source language"
          >
            <Globe className="w-3.5 h-3.5 text-forest/70" />
            <span className="font-semibold text-forest">{selectedSourceCap.name}</span>
            {selectedSourceCap.nativeName && (
              <span className="text-charcoal-muted text-[11px]">({selectedSourceCap.nativeName})</span>
            )}
            <ChevronDown className="w-3 h-3 text-charcoal-muted ml-0.5" />
          </button>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-forest/5 border border-forest/15 text-charcoal font-medium">
            <Globe className="w-3.5 h-3.5 text-forest/70" />
            <span>{selectedSourceCap.name}</span>
            {selectedSourceCap.nativeName && (
              <span className="text-charcoal-muted">({selectedSourceCap.nativeName})</span>
            )}
          </div>
        )}

        {isSourceOpen && onSourceChange && (
          <div className="absolute left-0 top-full mt-1.5 z-50 w-64 max-h-72 overflow-hidden rounded-md bg-card border border-forest/20 shadow-sovereign-lg flex flex-col">
            <div className="p-2 border-b border-forest/10 bg-warm-ivory/50">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-charcoal-muted" />
                <input
                  type="text"
                  placeholder="Search source language..."
                  value={sourceSearchQuery}
                  onChange={(e) => setSourceSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1 text-xs rounded border border-forest/15 bg-card focus:outline-hidden focus:ring-1 focus:ring-forest text-charcoal"
                  autoFocus
                />
              </div>
            </div>
            <div className="overflow-y-auto p-1 divide-y divide-forest/5 flex-1">
              {allowAutoSource && (
                <button
                  type="button"
                  onClick={() => {
                    onSourceChange("auto");
                    setIsSourceOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 text-xs flex items-center justify-between hover:bg-forest/5 rounded ${
                    sourceLanguage === "auto" ? "bg-forest/10 font-bold text-forest" : "text-charcoal"
                  }`}
                >
                  <span>Auto Detect</span>
                  {sourceLanguage === "auto" && <Check className="w-3.5 h-3.5 text-forest" />}
                </button>
              )}
              {filteredSources.map((cap) => (
                <button
                  key={cap.code}
                  type="button"
                  onClick={() => {
                    onSourceChange(cap.code);
                    setIsSourceOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 text-xs flex items-center justify-between hover:bg-forest/5 rounded ${
                    sourceLanguage === cap.code ? "bg-forest/10 font-bold text-forest" : "text-charcoal"
                  }`}
                >
                  <div>
                    <span className="font-medium">{cap.name}</span>
                    <span className="text-charcoal-muted ml-1 text-[11px]">({cap.nativeName})</span>
                  </div>
                  {sourceLanguage === cap.code && <Check className="w-3.5 h-3.5 text-forest" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SWAP / ARROW BUTTON */}
      {(onSwap || onSourceChange) ? (
        <button
          type="button"
          onClick={handleSwapClick}
          className="p-1.5 rounded-full border border-forest/20 hover:border-forest text-forest hover:bg-forest/5 transition-colors"
          title="Swap languages"
          aria-label="Swap source and target languages"
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
        </button>
      ) : (
        <ArrowRight className="w-3.5 h-3.5 text-forest/40" />
      )}

      {/* Target Selector Dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setIsTargetOpen(!isTargetOpen);
            setIsSourceOpen(false);
          }}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-card border border-forest/20 hover:border-forest text-forest font-semibold shadow-2xs transition-colors"
          aria-expanded={isTargetOpen}
          aria-label="Select target translation language"
        >
          <span>{selectedTargetCap.name}</span>
          <span className="text-forest/70">({selectedTargetCap.nativeName})</span>
          <ChevronDown className="w-3 h-3 text-forest/70 ml-0.5" />
        </button>

        {isTargetOpen && (
          <div className="absolute right-0 top-full mt-1.5 z-50 w-64 max-h-72 overflow-hidden rounded-md bg-card border border-forest/20 shadow-sovereign-lg flex flex-col">
            <div className="p-2 border-b border-forest/10 bg-warm-ivory/50">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-charcoal-muted" />
                <input
                  type="text"
                  placeholder="Search target language..."
                  value={targetSearchQuery}
                  onChange={(e) => setTargetSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1 text-xs rounded border border-forest/15 bg-card focus:outline-hidden focus:ring-1 focus:ring-forest text-charcoal"
                  autoFocus
                />
              </div>
            </div>

            <div className="overflow-y-auto p-1 divide-y divide-forest/5 flex-1">
              {filteredTargets.map((cap) => {
                const isSelected = cap.code === targetLanguage;
                return (
                  <button
                    key={cap.code}
                    type="button"
                    onClick={() => {
                      onTargetChange(cap.code);
                      setIsTargetOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 text-xs flex items-center justify-between hover:bg-forest/5 rounded ${
                      isSelected ? "bg-forest/10 font-bold text-forest" : "text-charcoal"
                    }`}
                  >
                    <div>
                      <span className="font-medium">{cap.name}</span>
                      <span className="text-charcoal-muted ml-1 text-[11px]">({cap.nativeName})</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-forest" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
