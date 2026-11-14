import * as React from "react";
import { WorkerProfile } from "@/types/identity";
import { ShieldCheck, Award, QrCode, CheckCircle2, MapPin, Sparkles } from "lucide-react";
import { TrustBadge } from "./trust-badge";
import { KaamScoreGauge } from "./kaamscore-gauge";

interface SovereignCardProps {
  worker: WorkerProfile;
  className?: string;
}

export function SovereignCard({ worker, className = "" }: SovereignCardProps) {
  return (
    <div
      className={`relative w-full max-w-md overflow-hidden rounded-md border border-forest/20 bg-card shadow-credential-card ${className}`}
    >
      {/* 1. Institutional Top Anchor Header in Deep Forest Green */}
      <div className="relative bg-forest px-6 py-4 text-ivory">
        {/* Holographic Security Overlay Pattern */}
        <div className="absolute inset-0 opacity-10 bg-paper-grid pointer-events-none" />

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-xs bg-sand text-forest font-black text-xs border border-sand-400">
              KS
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-sand-300">
                KAAMSETU SOVEREIGN IDENTITY
              </div>
              <div className="font-mono text-xs font-semibold tracking-wider text-ivory/90">
                {worker.registryId}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 rounded-xs bg-forest-700/80 px-2.5 py-1 border border-forest-500/40 text-[10px] font-bold text-sand uppercase tracking-wider">
            <Sparkles className="h-3 w-3 text-sand" />
            <span>LEVEL {worker.kaamScore.level}</span>
          </div>
        </div>
      </div>

      {/* 2. Card Body: Crisp Ivory & Paper Surface */}
      <div className="p-6 bg-gradient-to-b from-card to-ivory-light space-y-5">
        {/* Profile Main Row */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold tracking-tight text-forest-700">
                {worker.fullName}
              </h3>
              {worker.aadhaarVerified && (
                <CheckCircle2
                  className="h-4 w-4 text-sage fill-sage/20 shrink-0"
                  aria-label="Aadhaar & DigiLocker Verified"
                />
              )}
            </div>
            <p className="text-sm font-semibold text-charcoal">
              {worker.primaryTrade}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-charcoal-muted pt-0.5">
              <MapPin className="h-3.5 w-3.5 text-forest" />
              <span>
                {worker.location.city}, {worker.location.state} • {worker.yearsExperience} yrs exp
              </span>
            </div>
          </div>

          {/* Compact KAAMSCORE Display */}
          <div className="shrink-0 flex flex-col items-center justify-center rounded-sm bg-sand/15 p-2.5 border border-sand/30">
            <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-muted">
              TRUST SCORE
            </span>
            <span className="text-2xl font-black text-forest leading-none mt-0.5">
              {worker.kaamScore.totalScore}
            </span>
            <span className="text-[9px] font-bold uppercase text-forest-600 mt-0.5">
              {worker.kaamScore.tier.split(" ")[0]}
            </span>
          </div>
        </div>

        {/* Verified Badges Ribbon */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {worker.aadhaarVerified && <TrustBadge type="aadhaar" />}
          {worker.digiLockerLinked && <TrustBadge type="digilocker" />}
          {worker.endorsements.length > 0 && <TrustBadge type="peer_verified" />}
          {worker.voiceDeclarationTranscript && <TrustBadge type="voice_verified" />}
        </div>

        {/* Core Endorsed Skills */}
        <div className="space-y-1.5 pt-1 border-t border-forest/10">
          <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-muted">
            Endorsed Specializations
          </span>
          <div className="flex flex-wrap gap-1.5">
            {worker.subTrades.slice(0, 4).map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center rounded-xs bg-forest/5 px-2.5 py-1 text-xs font-medium text-forest border border-forest/10"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Card Footer: Verification QR & National Registry Note */}
        <div className="flex items-center justify-between pt-3 border-t border-forest/10 text-xs">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xs bg-forest/5 border border-forest/15">
              <QrCode className="h-6 w-6 text-forest" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-forest">
                VERIFY ON-CHAIN
              </div>
              <div className="text-[10px] text-charcoal-muted">
                Scan to validate credentials
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="inline-block text-[10px] font-bold uppercase text-sage">
              Active & Valid
            </span>
            <div className="text-[9px] text-charcoal-muted">
              National Skill Registry Linked
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
