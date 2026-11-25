"use client";

import * as React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Award,
  Download,
  Share2,
  ExternalLink,
  QrCode,
  Copy,
  Check,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardWorkerProfile } from "@/types/dashboard";

interface IdentityWidgetProps {
  profile: DashboardWorkerProfile;
}

export function IdentityWidget({ profile }: IdentityWidgetProps) {
  const [copied, setCopied] = React.useState(false);

  const profileUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/profile/${profile.slug}`
      : `https://kaamsetu.in/profile/${profile.slug}`;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="rounded-md bg-card border border-forest/15 shadow-sovereign-sm p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-forest/10">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-forest" />
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-forest">
              Sovereign Digital Credential
            </h2>
          </div>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Your tamper-evident workforce credential card and cryptographically anchorable verification token.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            className="border-forest/20 text-forest hover:bg-forest/5 h-9 text-xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                Copied
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 mr-1.5" />
                Share Link
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="border-forest/20 text-forest hover:bg-forest/5 h-9 text-xs"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Print Card
          </Button>
        </div>
      </div>

      {/* Sovereign Card Component */}
      <div className="max-w-xl mx-auto">
        <div className="relative overflow-hidden rounded-md bg-forest text-ivory p-6 sm:p-7 shadow-sovereign-md border-2 border-sand/40">
          {/* Top Bar */}
          <div className="relative flex items-start justify-between border-b border-sand/20 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-md bg-sand/15 border border-sand/30 flex items-center justify-center text-sand shadow-inner">
                <ShieldCheck className="w-6 h-6 text-sand" />
              </div>
              <div>
                <span className="font-serif text-lg font-bold tracking-tight text-ivory block">
                  KAAMSETU
                </span>
                <span className="text-[10px] text-sand/80 font-mono tracking-wider">
                  NATIONAL WORKFORCE REGISTRY
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="block text-[9px] font-mono text-sand/70 uppercase">
                Registry ID
              </span>
              <span className="font-mono text-xs sm:text-sm font-semibold tracking-wider text-sand">
                {profile.registryId}
              </span>
            </div>
          </div>

          {/* Main Content */}
          <div className="relative py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <h3 className="font-serif text-2xl font-bold text-ivory">
                {profile.fullName}
              </h3>
              <p className="text-xs sm:text-sm text-sand font-medium">
                {profile.occupation}
              </p>
              <div className="flex flex-wrap items-center gap-2 text-xs text-ivory/80 font-mono pt-1">
                <span>{profile.yearsExperience} Yrs Experience</span>
                <span>•</span>
                <span>{profile.city}, {profile.state}</span>
              </div>
            </div>

            {/* KAAMSCORE Display */}
            <div className="bg-forest-900/80 border border-sand/30 rounded-md px-4 py-3 text-center self-stretch sm:self-auto flex sm:flex-col items-center justify-between sm:justify-center">
              <div>
                <span className="text-[10px] font-mono text-sand/80 uppercase block">
                  KAAMSCORE
                </span>
                <span className="font-serif text-3xl font-black text-sand">
                  {profile.kaamScore.totalScore}
                </span>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/40 text-[9px] font-mono mt-1">
                <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-400" />
                VERIFIED TIER
              </Badge>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="relative pt-4 border-t border-sand/20 flex items-center justify-between text-[11px] text-sand/70 font-mono">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-sand/10 border border-sand/30 flex items-center justify-center text-sand">
                <QrCode className="w-4 h-4" />
              </div>
              <span>Digital Trust Ledger Verified</span>
            </div>

            <Button
              asChild
              size="sm"
              variant="ghost"
              className="text-xs text-sand hover:text-white hover:bg-sand/10 h-8 px-2 font-mono"
            >
              <Link href={`/profile/${profile.slug}`}>
                <span>View Full Page</span>
                <ExternalLink className="w-3 h-3 ml-1.5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
