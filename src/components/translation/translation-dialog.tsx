"use client";

import * as React from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { UniversalTranslatorWorkspace } from "./universal-translator-workspace";

interface TranslationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialText?: string;
  initialTargetLanguage?: string;
  initialSourceLanguage?: string;
  title?: string;
}

export function TranslationDialog({
  isOpen,
  onClose,
  initialText = "",
  initialTargetLanguage = "as",
  initialSourceLanguage = "auto",
}: TranslationDialogProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Universal Language Translator"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 backdrop-blur-2xs overflow-y-auto"
    >
      <div className="relative w-full max-w-4xl max-h-[95vh] overflow-y-auto rounded-lg shadow-sovereign-2xl animate-in fade-in zoom-in-95 duration-150">
        <UniversalTranslatorWorkspace
          initialText={initialText}
          initialTargetLang={initialTargetLanguage}
          initialSourceLang={initialSourceLanguage}
          isModal={true}
          onClose={onClose}
        />
        <div className="mt-2 text-center">
          <Link
            href="/translate"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 text-xs text-warm-ivory/80 hover:text-warm-ivory underline underline-offset-2"
          >
            <span>Open in Fullscreen Workspace</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
