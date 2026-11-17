"use client";

import * as React from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrustBadge } from "@/components/identity/trust-badge";
import { KaamScoreGauge } from "@/components/identity/kaamscore-gauge";
import { WorkerProfile } from "@/types/identity";
import {
  ShieldCheck,
  CheckCircle2,
  MapPin,
  QrCode,
  Calendar,
  Briefcase,
  Award,
  Lock,
  ExternalLink,
} from "lucide-react";
import { formatINR } from "@/lib/utils";
import { generateQrDataUrl } from "@/lib/qr/generate";

interface CredentialDialogProps {
  worker: WorkerProfile & { photoUrl?: string; bio?: string; isDemoRecord?: boolean };
  trigger?: React.ReactNode;
}

export function CredentialDialog({ worker, trigger }: CredentialDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [qrDataUrl, setQrDataUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open && worker.registryId) {
      const origin = typeof window !== "undefined" ? window.location.origin : "https://kaamsetu.in";
      const verifyUrl = `${origin}/verify/${encodeURIComponent(worker.registryId)}`;
      generateQrDataUrl(verifyUrl).then((url) => {
        if (url) setQrDataUrl(url);
      });
    }
  }, [open, worker.registryId]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="default" size="sm" className="w-full">
            Verify Sovereign Record
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0 border-forest/20 bg-card rounded-md">
        {/* Institutional Top Anchor Bar */}
        <div className="bg-forest px-6 py-5 text-ivory relative overflow-hidden">
          <div className="absolute inset-0 bg-paper-grid opacity-15 pointer-events-none" />

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xs bg-sand text-forest font-black text-xs border border-sand-400">
                KS
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-sand-300">
                  NATIONAL SOVEREIGN SKILL CREDENTIAL
                </div>
                <div className="font-mono text-xs font-semibold text-ivory">
                  {worker.registryId}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-xs bg-sand/20 px-2 py-0.5 text-[10px] font-bold text-sand border border-sand/30">
                [DEMO RECORD]
              </span>
              <span className="rounded-xs bg-forest-700 px-2 py-0.5 text-[10px] font-bold text-sand-300">
                TIER {worker.kaamScore.level}
              </span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Header Row: Portrait & Identity Details */}
          <div className="flex flex-col sm:flex-row items-start gap-5">
            {worker.photoUrl ? (
              <div className="relative w-[96px] h-[96px] min-w-[96px] min-h-[96px] max-w-[96px] max-h-[96px] rounded-sm overflow-hidden border-2 border-forest/20 shrink-0 bg-forest/5 shadow-sovereign-sm">
                <Image
                  src={worker.photoUrl}
                  alt={worker.fullName}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-sm bg-forest text-ivory font-bold text-2xl shrink-0">
                {worker.fullName.slice(0, 2).toUpperCase()}
              </div>
            )}

            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-forest">
                  {worker.fullName}
                </h3>
                <CheckCircle2 className="h-4 w-4 text-sage fill-sage/20" />
              </div>
              <p className="text-sm font-semibold text-charcoal">
                {worker.primaryTrade}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-charcoal-muted pt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-forest" />
                  {worker.location.city}, {worker.location.state}
                </span>
                <span>•</span>
                <span>{worker.yearsExperience !== null && worker.yearsExperience !== undefined ? `${worker.yearsExperience} Years Hands-on` : "Experience Unreported"}</span>
                {worker.dailyRateEstimate && (
                  <>
                    <span>•</span>
                    <span className="font-semibold text-forest">
                      {formatINR(worker.dailyRateEstimate.min)} – {formatINR(worker.dailyRateEstimate.max)} / day
                    </span>
                  </>
                )}
              </div>

              {/* Status Chips */}
              <div className="flex flex-wrap gap-1.5 pt-2">
                {worker.aadhaarVerified && <TrustBadge type="aadhaar" />}
                {worker.digiLockerLinked && <TrustBadge type="digilocker" />}
                <TrustBadge type="peer_verified" />
                <TrustBadge type="voice_verified" />
              </div>
            </div>
          </div>

          {/* Bio */}
          {worker.bio && (
            <p className="text-xs text-charcoal-muted leading-relaxed bg-forest/5 p-3 rounded-xs border border-forest/10">
              {worker.bio}
            </p>
          )}

          {/* KAAMSCORE Detailed Breakdown Card */}
          <div className="rounded-sm border border-forest/15 bg-card p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-forest/10 pb-2">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-forest">
                  KAAMSCORE™ Reliability Breakdown
                </span>
                <p className="text-[10px] text-charcoal-muted">
                  Cryptographically scored across 5 civic verification dimensions
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-forest">
                  {worker.kaamScore.totalScore}
                </span>
                <span className="text-xs text-charcoal-muted block">/ 900</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
              <div className="p-2 rounded-xs bg-forest/5 border border-forest/10">
                <span className="text-[10px] text-charcoal-muted block">Spoken Claim Proof</span>
                <strong className="text-forest">{worker.kaamScore.breakdown.spokenAudioProof} / 150</strong>
              </div>
              <div className="p-2 rounded-xs bg-forest/5 border border-forest/10">
                <span className="text-[10px] text-charcoal-muted block">Gemini Domain AI</span>
                <strong className="text-forest">{worker.kaamScore.breakdown.domainAIExtraction} / 150</strong>
              </div>
              <div className="p-2 rounded-xs bg-forest/5 border border-forest/10">
                <span className="text-[10px] text-charcoal-muted block">Peer Endorsements</span>
                <strong className="text-forest">{worker.kaamScore.breakdown.peerEndorsements} / 200</strong>
              </div>
              <div className="p-2 rounded-xs bg-forest/5 border border-forest/10">
                <span className="text-[10px] text-charcoal-muted block">Completed Jobs</span>
                <strong className="text-forest">{worker.kaamScore.breakdown.completedJobs} / 250</strong>
              </div>
              <div className="p-2 rounded-xs bg-forest/5 border border-forest/10">
                <span className="text-[10px] text-charcoal-muted block">DigiLocker Linked</span>
                <strong className="text-forest">{worker.kaamScore.breakdown.sovereignDigiLocker} / 150</strong>
              </div>
              <div className="p-2 rounded-xs bg-sand/20 border border-sand/40">
                <span className="text-[10px] text-sand-800 block">Verification Tier</span>
                <strong className="text-forest font-bold">Tier {worker.kaamScore.level} Verified</strong>
              </div>
            </div>
          </div>

          {/* Endorsed Skills & Equipment */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-muted">
              Certified Skills & Equipment
            </span>
            <div className="flex flex-wrap gap-1.5">
              {worker.subTrades.map((skill, index) => (
                <span
                  key={index}
                  className="px-2.5 py-1 rounded-xs bg-card border border-forest/15 text-forest text-xs font-medium shadow-xs"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Peer & Client Attestations */}
          {worker.endorsements.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-forest/10">
              <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-muted">
                Peer & Contractor Verification Log
              </span>
              {worker.endorsements.map((end) => (
                <div
                  key={end.id}
                  className="p-3 rounded-xs bg-forest/5 border border-forest/10 text-xs space-y-1"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-forest">
                      {end.endorserName} ({end.endorserTrade})
                    </span>
                    <span className="text-[10px] font-mono text-charcoal-muted">
                      Registry ID: {end.endorserRegistryId}
                    </span>
                  </div>
                  <p className="text-charcoal-muted italic">&quot;{end.comment}&quot;</p>
                </div>
              ))}
            </div>
          )}

          {/* Modal Footer with Camera-Scannable QR verification */}
          <div className="pt-4 border-t border-forest/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              {qrDataUrl ? (
                <div className="relative h-12 w-12 rounded-xs overflow-hidden border border-forest/20 shrink-0 bg-white p-0.5 shadow-xs">
                  <Image
                    src={qrDataUrl}
                    alt="Scannable QR Verification"
                    width={48}
                    height={48}
                    unoptimized
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-xs bg-forest/5 border border-forest/15 shrink-0">
                  <QrCode className="h-6 w-6 text-forest" />
                </div>
              )}
              <div>
                <span className="text-[10px] font-bold text-forest block">
                  KAAMSETU WORKFORCE CREDENTIAL (DIGITALLY SIGNED)
                </span>
                <span className="text-[10px] font-mono text-charcoal-muted">
                  Registry: {worker.registryId} • Live Scannable
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <Button asChild variant="outline" size="sm" className="text-xs border-forest/20 text-forest">
                <a
                  href={`/verify/${encodeURIComponent(worker.registryId)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                  Public Verify
                </a>
              </Button>
              <Button asChild variant="outline" size="sm" className="text-xs border-forest/20 text-forest">
                <a
                  href={`/profile/${worker.fullName.toLowerCase().replace(/\s+/g, "-")}-${worker.location.city.toLowerCase()}`}
                  onClick={() => setOpen(false)}
                >
                  Full Profile
                </a>
              </Button>
              <Button variant="default" size="sm" onClick={() => setOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
