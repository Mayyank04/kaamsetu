"use client";

import * as React from "react";
import { Languages, Loader2 } from "lucide-react";
import { ALL_TRANSLATION_CAPABILITIES } from "@/lib/translation/registry";

interface TranslateButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  targetLanguage?: string;
  isTranslated?: boolean;
  className?: string;
  size?: "sm" | "md";
}

export function TranslateButton({
  onClick,
  isLoading = false,
  targetLanguage = "hi",
  isTranslated = false,
  className = "",
  size = "sm",
}: TranslateButtonProps) {
  const targetCap = ALL_TRANSLATION_CAPABILITIES[targetLanguage] || ALL_TRANSLATION_CAPABILITIES.hi;

  const sizeClasses =
    size === "sm" ? "px-2.5 py-1 text-xs gap-1.5" : "px-3.5 py-1.5 text-sm gap-2";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      className={`inline-flex items-center font-medium rounded border transition-all ${
        isTranslated
          ? "bg-forest/10 border-forest/30 text-forest hover:bg-forest/15"
          : "bg-warm-ivory border-forest/15 text-forest hover:bg-forest/5 hover:border-forest/30"
      } ${sizeClasses} ${className}`}
      title={isTranslated ? "Switch translation or show original" : `Translate to ${targetCap.name}`}
      aria-label={isTranslated ? "Manage translation" : `Translate to ${targetCap.name}`}
    >
      {isLoading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin text-forest" />
      ) : (
        <Languages className="w-3.5 h-3.5 text-forest/80" />
      )}
      <span>{isTranslated ? "Translation Active" : `Translate (${targetCap.nativeName || targetCap.name})`}</span>
    </button>
  );
}
