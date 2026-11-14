"use client";

import * as React from "react";
import { Mic, FileText, Check, Globe } from "lucide-react";
import { SUPPORTED_LANGUAGES, SupportedLanguageCode } from "@/schemas/onboarding.schema";
import { ONBOARDING_I18N } from "@/lib/i18n/onboarding";
import { Button } from "@/components/ui/button";

interface LanguageSelectorProps {
  selectedLanguage: SupportedLanguageCode;
  onSelectLanguage: (lang: SupportedLanguageCode) => void;
  inputMode: "voice" | "text";
  onSelectInputMode: (mode: "voice" | "text") => void;
  onContinue: () => void;
}

export function LanguageSelector({
  selectedLanguage,
  onSelectLanguage,
  inputMode,
  onSelectInputMode,
  onContinue,
}: LanguageSelectorProps) {
  const i18n = ONBOARDING_I18N[selectedLanguage];

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      {/* 1. Language Selection Grid */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-forest">
          <Globe className="h-4 w-4" />
          <h3 className="font-bold text-sm tracking-wide uppercase">
            {i18n.selectLanguage}
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = selectedLanguage === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => onSelectLanguage(lang.code)}
                className={`flex flex-col items-start p-3 rounded-sm border text-left transition-all duration-200 ${
                  isSelected
                    ? "border-forest bg-forest text-ivory shadow-sovereign-sm"
                    : "border-forest/15 bg-card hover:border-forest/40 text-charcoal"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-base font-bold">{lang.nativeName}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 text-sand" />}
                </div>
                <span
                  className={`text-[11px] mt-0.5 ${
                    isSelected ? "text-sand-300" : "text-charcoal-muted"
                  }`}
                >
                  {lang.name} • {lang.greeting}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Input Mode Choice (Voice vs Text) */}
      <div className="space-y-3">
        <h3 className="font-bold text-sm tracking-wide uppercase text-forest">
          {i18n.chooseInputMode}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Voice Mode */}
          <div
            onClick={() => onSelectInputMode("voice")}
            className={`p-5 rounded-md border cursor-pointer transition-all duration-200 space-y-3 relative ${
              inputMode === "voice"
                ? "border-forest bg-card ring-2 ring-forest shadow-sovereign-sm"
                : "border-forest/15 bg-card/60 hover:border-forest/30"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xs bg-forest text-sand">
                <Mic className="h-5 w-5" />
              </div>
              {inputMode === "voice" && (
                <span className="text-[10px] font-bold text-forest bg-forest/10 px-2 py-0.5 rounded-xs border border-forest/20">
                  SELECTED
                </span>
              )}
            </div>

            <div>
              <h4 className="font-bold text-forest text-base">
                {i18n.voiceModeTitle}
              </h4>
              <p className="text-xs text-charcoal-muted leading-relaxed mt-1">
                {i18n.voiceModeDesc}
              </p>
            </div>
          </div>

          {/* Text Mode */}
          <div
            onClick={() => onSelectInputMode("text")}
            className={`p-5 rounded-md border cursor-pointer transition-all duration-200 space-y-3 relative ${
              inputMode === "text"
                ? "border-forest bg-card ring-2 ring-forest shadow-sovereign-sm"
                : "border-forest/15 bg-card/60 hover:border-forest/30"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xs bg-sand/30 text-forest border border-sand/40">
                <FileText className="h-5 w-5" />
              </div>
              {inputMode === "text" && (
                <span className="text-[10px] font-bold text-forest bg-forest/10 px-2 py-0.5 rounded-xs border border-forest/20">
                  SELECTED
                </span>
              )}
            </div>

            <div>
              <h4 className="font-bold text-forest text-base">
                {i18n.textModeTitle}
              </h4>
              <p className="text-xs text-charcoal-muted leading-relaxed mt-1">
                {i18n.textModeDesc}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Continue Action */}
      <div className="pt-2 flex justify-end">
        <Button
          variant="default"
          size="lg"
          onClick={onContinue}
          className="bg-forest hover:bg-forest-500 text-ivory font-bold h-12 px-8 shadow-sm"
        >
          {i18n.continueBtn}
        </Button>
      </div>
    </div>
  );
}
