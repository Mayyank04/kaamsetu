import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Languages, ShieldCheck, Sparkles, Mic, Volume2 } from "lucide-react";
import { UniversalTranslatorWorkspace } from "@/components/translation/universal-translator-workspace";

export const metadata: Metadata = {
  title: "Universal Translator | KAAMSETU — India's Skill Identity Platform",
  description:
    "Cross-language translation across 39 Indian languages with Native Script, Roman Transliteration (English letter pronunciation), English Meaning, and Spoken Voice Assistance.",
};

export default function TranslatePage() {
  return (
    <div className="min-h-screen bg-warm-ivory text-charcoal flex flex-col selection:bg-sand/30">
      <main className="flex-1 container mx-auto px-4 py-6 sm:py-10 max-w-6xl space-y-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between text-xs text-charcoal-muted">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-forest hover:underline font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>
            <span>/</span>
            <span className="text-charcoal font-semibold">Universal Translator</span>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-[11px] text-charcoal-muted">
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-forest" />
              <span>Constitutional Zero Commission</span>
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <Volume2 className="w-3.5 h-3.5 text-forest" />
              <span>Audio Playback & Voice Input</span>
            </span>
          </div>
        </div>

        {/* Translation Flagship Workspace */}
        <UniversalTranslatorWorkspace
          initialText="মই গুৱাহাটীত এটা সৰু দৰ্জীৰ দোকান চলাওঁ।"
          initialSourceLang="as"
          initialTargetLang="hi"
        />

        {/* Features & Language Assurance Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <div className="p-4 rounded-md bg-card border border-forest/15 shadow-2xs space-y-1.5">
            <div className="flex items-center gap-2 text-forest font-semibold text-xs">
              <Languages className="w-4 h-4" />
              <span>Native Script Display</span>
            </div>
            <p className="text-xs text-charcoal-muted leading-relaxed">
              Output rendered in authentic regional scripts (Assamese, Bengali, Devanagari, Tamil, Telugu, Gurmukhi, Odia, Gujarati, Malayalam, Kannada).
            </p>
          </div>

          <div className="p-4 rounded-md bg-card border border-forest/15 shadow-2xs space-y-1.5">
            <div className="flex items-center gap-2 text-forest font-semibold text-xs">
              <Sparkles className="w-4 h-4 text-sand-dark" />
              <span>Roman Transliteration</span>
            </div>
            <p className="text-xs text-charcoal-muted leading-relaxed">
              Learner-friendly phonetic guide using English letters (e.g. Assamese &quot;Nomoskar&quot;, Hindi &quot;Namaste&quot;), allowing anyone to read and speak the language aloud.
            </p>
          </div>

          <div className="p-4 rounded-md bg-card border border-forest/15 shadow-2xs space-y-1.5">
            <div className="flex items-center gap-2 text-forest font-semibold text-xs">
              <Mic className="w-4 h-4 text-forest" />
              <span>Voice Input & Meaning</span>
            </div>
            <p className="text-xs text-charcoal-muted leading-relaxed">
              Speak in your vernacular tongue with live editing and confirmation. Independent semantic English meaning ensures full contextual understanding.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
