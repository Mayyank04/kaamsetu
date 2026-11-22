"use client";

import * as React from "react";
import { Globe, ArrowRight, Search, Check } from "lucide-react";
import { ALL_TRANSLATION_CAPABILITIES, getSupportedTargetLanguages } from "@/lib/translation/registry";
import { LanguageCapability } from "@/lib/translation/types";

interface LanguagePairSelectorProps {
  sourceLanguage: string;
  targetLanguage: string;
  onSourceChange?: (lang: string) => void;
  onTargetChange: (lang: string) => void;
  allowAutoSource?: boolean;
  className?: string;
}

export function LanguagePairSelector({
  sourceLanguage,
  targetLanguage,
  onSourceChange,
  onTargetChange,
  allowAutoSource = true,
  className = "",
}: LanguagePairSelectorProps) {
  const [isTargetOpen, setIsTargetOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const allCapabilities = Object.values(ALL_TRANSLATION_CAPABILITIES);

  const filteredTargets = allCapabilities.filter((cap) => {
    if (!cap.targetSupported) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      cap.name.toLowerCase().includes(q) ||
      cap.nativeName.toLowerCase().includes(q) ||
      cap.code.toLowerCase().includes(q)
    );
  });

  const selectedTargetCap = ALL_TRANSLATION_CAPABILITIES[targetLanguage] || ALL_TRANSLATION_CAPABILITIES.hi;
  const selectedSourceCap = sourceLanguage === "auto"
    ? { name: "Auto Detect", nativeName: "पहचानें" }
    : ALL_TRANSLATION_CAPABILITIES[sourceLanguage] || { name: sourceLanguage, nativeName: "" };

  return (
    <div className={`flex flex-wrap items-center gap-2 text-xs ${className}`}>
      {/* Source Indicator */}
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-forest/5 border border-forest/15 text-charcoal font-medium">
        <Globe className="w-3.5 h-3.5 text-forest/70" />
        <span>{selectedSourceCap.name}</span>
        {selectedSourceCap.nativeName && selectedSourceCap.name !== selectedSourceCap.nativeName && (
          <span className="text-charcoal-muted">({selectedSourceCap.nativeName})</span>
        )}
      </div>

      <ArrowRight className="w-3.5 h-3.5 text-forest/40" />

      {/* Target Selector Dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsTargetOpen(!isTargetOpen)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-card border border-forest/20 hover:border-forest text-forest font-semibold shadow-2xs transition-colors"
          aria-expanded={isTargetOpen}
          aria-label="Select target translation language"
        >
          <span>{selectedTargetCap.name}</span>
          <span className="text-forest/70">({selectedTargetCap.nativeName})</span>
        </button>

        {isTargetOpen && (
          <div className="absolute right-0 top-full mt-1.5 z-50 w-72 max-h-80 overflow-hidden rounded-md bg-card border border-forest/20 shadow-sovereign-lg flex flex-col">
            {/* Search Input */}
            <div className="p-2 border-b border-forest/10 bg-warm-ivory/50">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-charcoal-muted" />
                <input
                  type="text"
                  placeholder="Search 39 Indian languages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded border border-forest/15 bg-card focus:outline-hidden focus:ring-1 focus:ring-forest text-charcoal"
                  autoFocus
                />
              </div>
            </div>

            {/* Language List */}
            <div className="overflow-y-auto p-1 divide-y divide-forest/5 flex-1">
              {filteredTargets.length === 0 ? (
                <div className="p-3 text-center text-charcoal-muted text-xs">
                  No matching languages found.
                </div>
              ) : (
                filteredTargets.map((cap) => {
                  const isSelected = cap.code === targetLanguage;
                  return (
                    <button
                      key={cap.code}
                      type="button"
                      onClick={() => {
                        onTargetChange(cap.code);
                        setIsTargetOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-left rounded hover:bg-forest/5 transition-colors ${
                        isSelected ? "bg-forest/10 text-forest font-bold" : "text-charcoal"
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-medium">{cap.name}</span>
                        <span className="text-[11px] text-charcoal-muted">{cap.nativeName}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-forest" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
