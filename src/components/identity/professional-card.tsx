"use client";

import * as React from "react";
import Image from "next/image";
import { WorkerProfile } from "@/types/identity";
import { TrustBadge } from "@/components/identity/trust-badge";
import { CredentialDialog } from "@/components/identity/credential-dialog";
import { formatINR } from "@/lib/utils";
import { MapPin, CheckCircle2, Shield, Eye, Award } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProfessionalCardProps {
  professional: WorkerProfile & {
    photoUrl?: string;
    isDemoRecord?: boolean;
    bio?: string;
  };
}

export function ProfessionalCard({ professional }: ProfessionalCardProps) {
  const workerSlug = `${professional.fullName.toLowerCase().replace(/\s+/g, "-")}-${professional.location.city.toLowerCase()}`;

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-md border border-forest/15 bg-card shadow-sovereign-sm hover:shadow-sovereign-md hover:border-forest/35 transition-all duration-300">
      {/* Top Banner Ribbon */}
      <div className="bg-forest/5 px-4 py-2 border-b border-forest/10 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-1.5 font-mono text-forest-700">
          <Shield className="h-3 w-3 text-forest" />
          <span>{professional.registryId}</span>
        </div>
        <span className="rounded-xs bg-sand/30 text-sand-800 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider border border-sand/40">
          [DEMO RECORD]
        </span>
      </div>

      {/* Main Content Area */}
      <div className="p-5 space-y-4 flex-1 flex flex-col">
        {/* Worker Header: Portrait & Essential Info */}
        <div className="flex items-start gap-4">
          <div className="relative w-[72px] h-[72px] min-w-[72px] min-h-[72px] max-w-[72px] max-h-[72px] shrink-0 overflow-hidden rounded-sm border-2 border-forest/15 bg-forest/5 shadow-xs">
            {professional.photoUrl ? (
              <Image
                src={professional.photoUrl}
                alt={`Dignified portrait of ${professional.fullName}, ${professional.primaryTrade}`}
                width={72}
                height={72}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-forest text-ivory font-bold text-lg">
                {professional.fullName.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>

          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <a
                href={`/profile/${workerSlug}`}
                className="font-bold text-forest text-base leading-snug truncate hover:underline hover:text-forest-600 transition-colors"
              >
                {professional.fullName}
              </a>
              {professional.aadhaarVerified && (
                <CheckCircle2
                  className="h-3.5 w-3.5 text-sage fill-sage/20 shrink-0"
                  aria-label="Verified Identity"
                />
              )}
            </div>

            <p className="text-xs font-semibold text-charcoal line-clamp-1">
              {professional.primaryTrade}
            </p>

            <div className="flex items-center gap-1 text-[11px] text-charcoal-muted">
              <MapPin className="h-3 w-3 text-forest shrink-0" />
              <span className="truncate">
                {professional.location.city}, {professional.location.state} • {professional.yearsExperience} yrs
              </span>
            </div>
          </div>
        </div>

        {/* KAAMSCORE Index Pill */}
        <div className="rounded-xs bg-forest/5 p-2.5 border border-forest/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-muted block">
              KAAMSCORE™ Trust Index
            </span>
            <span className="text-xs font-semibold text-forest">
              {professional.kaamScore.tier}
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-forest">
              {professional.kaamScore.totalScore}
            </span>
            <span className="text-[10px] text-charcoal-muted font-mono">/900</span>
          </div>
        </div>

        {/* Badges Row */}
        <div className="flex flex-wrap gap-1.5">
          {professional.aadhaarVerified && <TrustBadge type="aadhaar" />}
          {professional.digiLockerLinked && <TrustBadge type="digilocker" />}
          <TrustBadge type="peer_verified" />
        </div>

        {/* Sub-Trades Chips */}
        <div className="space-y-1 pt-1 flex-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-muted">
            Specialized Skills
          </span>
          <div className="flex flex-wrap gap-1">
            {professional.subTrades.slice(0, 3).map((trade, i) => (
              <span
                key={i}
                className="text-[10px] px-2 py-0.5 rounded-xs bg-card border border-forest/15 text-forest font-medium"
              >
                {trade}
              </span>
            ))}
            {professional.subTrades.length > 3 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-xs bg-forest/5 text-charcoal-muted">
                +{professional.subTrades.length - 3}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card Footer: Rate & Action Button */}
      <div className="p-4 pt-0 border-t border-forest/10 mt-auto bg-card flex items-center justify-between">
        <div>
          <span className="text-[10px] text-charcoal-muted block">Estimated Daily Rate</span>
          <span className="text-xs font-bold text-forest">
            {professional.dailyRateEstimate
              ? `${formatINR(professional.dailyRateEstimate.min)} – ${formatINR(professional.dailyRateEstimate.max)}`
              : "Standard Rate"}
          </span>
        </div>

        <CredentialDialog
          worker={professional}
          trigger={
            <Button
              variant="default"
              size="sm"
              className="bg-forest hover:bg-forest-500 text-ivory text-xs px-3 shadow-xs"
            >
              <Eye className="mr-1.5 h-3.5 w-3.5 text-sand" />
              View Credential
            </Button>
          }
        />
      </div>
    </div>
  );
}
