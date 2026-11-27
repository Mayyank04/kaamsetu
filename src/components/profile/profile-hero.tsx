"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  Award,
  CheckCircle2,
  MapPin,
  Calendar,
  Languages,
  Layers,
  Share2,
  QrCode,
  Copy,
  Check,
  Send,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VerifiedPhoneBadge } from "@/components/ui/verified-phone-badge";
import { DashboardWorkerProfile } from "@/types/dashboard";
import { useTranslation } from "@/lib/i18n/i18n-context";
import { TranslatedContent } from "@/components/translation/translated-content";

interface ProfileHeroProps {
  profile: DashboardWorkerProfile;
  onRequestBooking: () => void;
  onOpenQR: () => void;
}

export function ProfileHero({
  profile,
  onRequestBooking,
  onOpenQR,
}: ProfileHeroProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = React.useState(false);

  const profileUrl =
    typeof window !== "undefined"
      ? window.location.href
      : `https://kaamsetu.in/profile/${profile.slug}`;

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `Check out ${profile.fullName}'s verified Sovereign Digital Identity on KAAMSETU: ${profileUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  return (
    <div className="relative overflow-hidden rounded-md bg-card border border-forest/15 shadow-sovereign-md p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Protocol Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-forest/10 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-forest/10 border border-forest/20 flex items-center justify-center text-forest">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="font-mono text-[10px] text-charcoal-muted uppercase tracking-wider block">
              {t.profile?.trustProtocol || "National Digital Skill Trust Protocol"}
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-forest">
                {profile.registryId}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-800 font-mono font-semibold">
                {t.profile?.activeVerified || "ACTIVE VERIFIED"}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenQR}
            className="border-forest/20 text-forest hover:bg-forest/5 h-8 text-xs font-mono"
          >
            <QrCode className="w-3.5 h-3.5 mr-1.5" />
            {t.profile?.scanQr || "Scan QR"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="border-forest/20 text-forest hover:bg-forest/5 h-8 text-xs font-medium"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                {t.profile?.copied || "Copied!"}
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 mr-1" />
                {t.profile?.shareProfile || "Share"}
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleWhatsAppShare}
            className="border-emerald-600/30 text-emerald-800 hover:bg-emerald-500/10 h-8 text-xs font-medium"
          >
            <Send className="w-3.5 h-3.5 mr-1" />
            WhatsApp
          </Button>
        </div>
      </div>

      {/* Main Identity Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Worker Photo & Craft Story */}
        <div className="lg:col-span-2 flex flex-col sm:flex-row items-start gap-5 sm:gap-6">
          {/* Portrait */}
          <div className="relative h-28 w-28 sm:h-36 sm:w-36 shrink-0 rounded-md overflow-hidden border-2 border-sand/70 shadow-sovereign-sm bg-forest-900">
            {profile.avatarUrl ? (
              <Image
                src={profile.avatarUrl}
                alt={profile.fullName}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 112px, 144px"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-forest text-sand font-serif text-3xl font-bold">
                {profile.fullName.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="absolute bottom-1.5 right-1.5 bg-emerald-500 rounded-full p-1 border-2 border-white">
              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
            </div>
          </div>

          {/* Details (Preserves actual user identity data) */}
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-forest tracking-tight">
                {profile.fullName}
              </h1>
              <VerifiedPhoneBadge status={profile.phoneVerificationStatus} size="sm" />
              {profile.aadhaarVerified && (
                <Badge
                  variant="outline"
                  className="bg-forest/5 text-forest border-forest/20 text-[10px] font-mono"
                >
                  AADHAAR VERIFIED
                </Badge>
              )}
              {profile.digiLockerLinked && (
                <Badge
                  variant="outline"
                  className="bg-emerald-500/10 text-emerald-800 border-emerald-500/25 text-[10px] font-mono"
                >
                  DIGILOCKER LINKED
                </Badge>
              )}
            </div>

            <p className="font-semibold text-sm sm:text-base text-forest/90">
              {profile.headline}
            </p>

            <TranslatedContent
              content={profile.bio}
              contentType="public_profile"
              textClassName="text-xs sm:text-sm text-charcoal-muted leading-relaxed"
            />

            {/* Micro Details Row */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-charcoal-muted pt-2 font-mono">
              <span className="inline-flex items-center gap-1.5 bg-forest/5 px-2.5 py-1 rounded border border-forest/10">
                <Calendar className="w-3.5 h-3.5 text-forest" />
                {profile.yearsExperience} {t.profile?.yearsExperience || "Years Experience"}
              </span>

              <span className="inline-flex items-center gap-1.5 bg-forest/5 px-2.5 py-1 rounded border border-forest/10">
                <MapPin className="w-3.5 h-3.5 text-forest" />
                {profile.city}, {profile.state} (within {profile.serviceRadiusKm} km)
              </span>

              <span className="inline-flex items-center gap-1.5 bg-forest/5 px-2.5 py-1 rounded border border-forest/10">
                <Languages className="w-3.5 h-3.5 text-forest" />
                {profile.languages.join(", ")}
              </span>
            </div>
          </div>
        </div>

        {/* Right Col: Trust Gauge & Hire Action */}
        <div className="lg:col-span-1 p-5 rounded-md bg-forest/5 border border-forest/15 space-y-4 shadow-inner">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-charcoal-muted uppercase tracking-wider font-semibold">
              {t.profile?.kaamScoreTrust || "KAAMSCORE™ Trust Index"}
            </span>
            <Badge className="bg-sand/30 text-sand-800 border-sand/40 text-[9px] font-mono">
              LEVEL {profile.kaamScore.level}
            </Badge>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="font-serif text-4xl sm:text-5xl font-black text-forest">
              {profile.kaamScore.totalScore}
            </span>
            <span className="text-xs font-mono text-charcoal-muted">/ 900</span>
          </div>

          <div className="text-xs text-forest font-semibold">
            {profile.kaamScore.tier} • {t.profile?.institutionalAssessment || "Verified Evidence Tier"}
          </div>

          {/* Daily Rate */}
          <div className="pt-2 border-t border-forest/10 flex items-center justify-between text-xs">
            <span className="text-charcoal-muted font-medium">{t.profile?.dailyRate || "Daily Wage Rate"}:</span>
            <span className="font-bold text-forest font-mono">
              {profile.dailyRateMin && profile.dailyRateMax
                ? `₹${profile.dailyRateMin} - ₹${profile.dailyRateMax}`
                : "Custom / On Consultation"}
            </span>
          </div>

          {/* Hire Button */}
          <Button
            size="lg"
            onClick={onRequestBooking}
            className="w-full bg-forest hover:bg-forest-600 text-ivory font-semibold shadow-sovereign-sm h-11 text-sm"
          >
            <Send className="w-4 h-4 mr-2 text-sand" />
            {t.profile?.bookService || "Request Service / Hire"}
          </Button>
        </div>
      </div>
    </div>
  );
}
