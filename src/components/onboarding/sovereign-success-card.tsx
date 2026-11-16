"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import QRCode from "qrcode";
import {
  ShieldCheck,
  Award,
  CheckCircle2,
  Copy,
  Check,
  Download,
  Share2,
  ExternalLink,
  Sparkles,
  QrCode,
  MapPin,
  Calendar,
  Briefcase,
  Layers,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SupportedLanguageCode } from "@/schemas/onboarding.schema";
import { ONBOARDING_I18N } from "@/lib/i18n/onboarding";

export interface SovereignCardData {
  id: string;
  registryId: string;
  slug: string;
  fullName: string;
  headline: string;
  bio: string;
  occupation: string;
  category: string;
  yearsExperience: number;
  city: string;
  state: string;
  dailyRateEstimate: {
    min: number;
    max: number;
  };
  skills: string[];
  equipmentHandled: string[];
  languages: string[];
  kaamScore: {
    totalScore: number;
    level: number;
    tier?: string;
    percentile?: string;
    verifiedFactors?: string[];
  };
  status: string;
  verificationMethod: string;
  isDispatchEligible?: boolean;
  dispatchStatus?: string;
  dispatchNotice?: string;
  createdAt: string;
}

interface SovereignSuccessCardProps {
  cardData: SovereignCardData;
  language: SupportedLanguageCode;
  onReset: () => void;
}

export function SovereignSuccessCard({
  cardData,
  language,
  onReset,
}: SovereignSuccessCardProps) {
  const i18n = ONBOARDING_I18N[language] || ONBOARDING_I18N.en;
  const [copied, setCopied] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");

  const profileUrl = typeof window !== "undefined"
    ? `${window.location.origin}/profile/${cardData.slug}`
    : `/profile/${cardData.slug}`;

  const verifyUrl = typeof window !== "undefined"
    ? `${window.location.origin}/verify/${cardData.registryId}`
    : `/verify/${cardData.registryId}`;

  useEffect(() => {
    if (typeof window !== "undefined") {
      QRCode.toDataURL(verifyUrl, {
        width: 140,
        margin: 1,
        color: {
          dark: "#153E35",
          light: "#F7F5F0",
        },
      })
        .then((url) => setQrCodeDataUrl(url))
        .catch((err) => console.error("QR generation error:", err));
    }
  }, [verifyUrl]);

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-700">
      {/* Celebration Header */}
      <div className="text-center max-w-xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-forest-900/10 dark:bg-sand/10 border border-forest/20 dark:border-sand/30 text-forest dark:text-sand text-xs font-mono font-medium tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-sand" />
          <span>SOVEREIGN DIGITAL IDENTITY GENERATED</span>
        </div>

        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-forest dark:text-ivory tracking-tight">
          {i18n.step4Title}
        </h2>
        <p className="text-forest/75 dark:text-ivory/70 text-sm sm:text-base leading-relaxed">
          {i18n.step4Subtitle}
        </p>
      </div>

      {/* Sovereign Credential Physical-Style Card */}
      <div className="max-w-2xl mx-auto">
        <div
          id="sovereign-card-print-target"
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-forest-950 via-forest to-forest-900 text-ivory p-6 sm:p-8 shadow-sovereign-xl border-2 border-sand/40 print:border-black print:text-black"
        >
          {/* Decorative Security Guilloche Watermark Pattern */}
          <div
            className="absolute inset-0 opacity-5 pointer-events-none mix-blend-overlay bg-[radial-gradient(#E8C999_1px,transparent_1px)] [background-size:16px_16px]"
            aria-hidden="true"
          />

          {/* Top Bar: Emblem & Registry Meta */}
          <div className="relative flex items-start justify-between border-b border-sand/20 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-sand/15 border border-sand/30 flex items-center justify-center text-sand shadow-inner">
                <ShieldCheck className="w-7 h-7 text-sand" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-ivory">
                    KAAMSETU
                  </span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-sand/20 text-sand border border-sand/30">
                    Sovereign ID
                  </span>
                </div>
                <p className="text-xs text-sand/80 font-mono tracking-wider">
                  NATIONAL WORKFORCE DIGITAL REGISTRY
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="block text-[10px] font-mono text-sand/70 uppercase tracking-widest">
                Registry ID
              </span>
              <span className="font-mono text-xs sm:text-sm font-semibold tracking-wider text-sand">
                {cardData.registryId}
              </span>
            </div>
          </div>

          {/* Middle Body: Worker Info & KAAMSCORE */}
          <div className="relative py-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Left 2 Cols: Identity Info */}
            <div className="md:col-span-2 space-y-3">
              <div>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-ivory tracking-tight">
                  {cardData.fullName}
                </h3>
                <p className="text-sand font-medium text-sm sm:text-base flex items-center gap-2 mt-0.5">
                  <Briefcase className="w-4 h-4 text-sand/70" />
                  <span>{cardData.occupation}</span>
                  <span className="text-sand/40">•</span>
                  <span className="text-xs uppercase tracking-wide text-ivory/80 font-mono">
                    {cardData.category}
                  </span>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-ivory/80 font-mono pt-1">
                <span className="inline-flex items-center gap-1.5 bg-forest-900/80 px-2.5 py-1 rounded border border-sand/20">
                  <Calendar className="w-3.5 h-3.5 text-sand" />
                  {cardData.yearsExperience} {language === "hi" ? "वर्ष अनुभव" : "Years Exp."}
                </span>
                <span className="inline-flex items-center gap-1.5 bg-forest-900/80 px-2.5 py-1 rounded border border-sand/20">
                  <MapPin className="w-3.5 h-3.5 text-sand" />
                  {cardData.city}, {cardData.state}
                </span>
                {cardData.isDispatchEligible === false ? (
                  <span className="inline-flex items-center gap-1.5 bg-amber-950/80 text-amber-200 px-2.5 py-1 rounded border border-amber-400/40">
                    Non-Dispatch Profile
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 bg-emerald-950/80 text-emerald-200 px-2.5 py-1 rounded border border-emerald-400/40">
                    Class B Active Dispatch
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 bg-forest-900/80 px-2.5 py-1 rounded border border-sand/20">
                  <Layers className="w-3.5 h-3.5 text-sand" />
                  ₹{cardData.dailyRateEstimate.min} - ₹{cardData.dailyRateEstimate.max} / day
                </span>
              </div>

              {/* Skills Chips */}
              <div className="pt-2">
                <div className="flex flex-wrap gap-1.5">
                  {cardData.skills.slice(0, 6).map((skill, index) => (
                    <span
                      key={index}
                      className="text-[11px] px-2 py-0.5 rounded-full bg-sand/15 text-sand border border-sand/25 font-sans"
                    >
                      {skill}
                    </span>
                  ))}
                  {cardData.skills.length > 6 && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-forest-900/60 text-ivory/60 font-mono">
                      +{cardData.skills.length - 6} more
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right Col: KAAMSCORE Gauge */}
            <div className="md:col-span-1 bg-forest-900/80 border border-sand/30 rounded-xl p-4 text-center flex flex-col items-center justify-center space-y-1 shadow-inner">
              <div className="flex items-center gap-1.5 text-sand text-[11px] font-mono tracking-wider uppercase">
                <Award className="w-3.5 h-3.5" />
                <span>KAAMSCORE</span>
              </div>
              <div className="font-serif text-4xl sm:text-5xl font-black text-sand tracking-tight">
                {cardData.kaamScore.totalScore}
              </div>
              <div className="text-[11px] text-ivory/80 font-mono">
                {cardData.kaamScore.tier || cardData.kaamScore.percentile || `Level ${cardData.kaamScore.level} Evidence Tier`}
              </div>
              <Badge
                variant="outline"
                className="mt-2 bg-emerald-500/20 text-emerald-300 border-emerald-400/40 text-[10px] font-mono tracking-wide"
              >
                <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-400" />
                {cardData.verificationMethod === "voice" ? "VOICE ATTESTED" : "REGISTERED PROFILE"}
              </Badge>
            </div>
          </div>

          {/* Bottom Security Footer */}
          <div className="relative pt-4 border-t border-sand/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-sand/70 font-mono">
            <div className="flex items-center gap-3">
              {qrCodeDataUrl ? (
                <div className="w-10 h-10 rounded bg-ivory p-0.5 border border-sand shrink-0 shadow-xs">
                  <Image src={qrCodeDataUrl} alt="Scannable QR" width={40} height={40} unoptimized className="w-full h-full" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded bg-sand/10 border border-sand/30 flex items-center justify-center text-sand">
                  <QrCode className="w-5 h-5" />
                </div>
              )}
              <div>
                <span className="block text-[10px] uppercase text-sand/60">
                  Scannable QR Verification
                </span>
                <span className="text-[11px] text-ivory font-medium">
                  Scan via camera to verify credential
                </span>
              </div>
            </div>

            <div className="text-right text-[10px] text-sand/60">
              <span>ISSUED: {new Date(cardData.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
              <span className="mx-2">•</span>
              <span>TAMPER-EVIDENT LEDGER</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <Button
          onClick={handleCopyLink}
          variant="outline"
          className="w-full sm:w-auto border-forest/30 dark:border-sand/30 text-forest dark:text-sand hover:bg-forest/10 dark:hover:bg-sand/10 h-11 px-5"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-2 text-emerald-600" />
              Link Copied!
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4 mr-2 text-forest/70 dark:text-sand/70" />
              {language === "hi" ? "पहचान लिंक साझा करें" : "Share Profile"}
            </>
          )}
        </Button>

        <Button
          onClick={handlePrint}
          variant="outline"
          className="w-full sm:w-auto border-forest/30 dark:border-sand/30 text-forest dark:text-sand hover:bg-forest/10 dark:hover:bg-sand/10 h-11 px-5"
        >
          <Download className="w-4 h-4 mr-2 text-forest/70 dark:text-sand/70" />
          {language === "hi" ? "कार्ड प्रिंट / सेव करें" : "Download ID Card"}
        </Button>

        <Button
          asChild
          className="w-full sm:w-auto bg-forest hover:bg-forest-500 text-ivory dark:bg-sand dark:text-forest dark:hover:bg-sand-400 h-11 px-6 shadow-sovereign-sm font-semibold"
        >
          <Link href={cardData.slug ? `/profile/${cardData.slug}` : "/dashboard"}>
            <ExternalLink className="w-4 h-4 mr-2" />
            {i18n.viewLiveProfile}
          </Link>
        </Button>

        <Button
          asChild
          variant="secondary"
          className="w-full sm:w-auto bg-sand text-forest hover:bg-sand-400 h-11 px-5 font-semibold text-xs border border-sand-500/30"
        >
          <Link href="/dashboard">
            Worker Dashboard
          </Link>
        </Button>
      </div>

      {/* Option to test onboarding another worker */}
      <div className="text-center pt-4">
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1.5 text-xs text-forest/60 dark:text-ivory/60 hover:text-forest dark:hover:text-sand underline transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Onboard another professional or test different language</span>
        </button>
      </div>
    </div>
  );
}
