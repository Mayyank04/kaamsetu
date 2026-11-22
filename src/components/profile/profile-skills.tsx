"use client";

import * as React from "react";
import {
  Award,
  ShieldCheck,
  Users,
  Clock,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DashboardSkill, SkillVerificationType } from "@/types/dashboard";
import { useTranslation } from "@/lib/i18n/i18n-context";

interface ProfileSkillsProps {
  skills: DashboardSkill[];
}

function getSkillBadge(type: SkillVerificationType, t: any) {
  switch (type) {
    case "official_government_verified":
    case "digilocker_verified":
      return (
        <Badge className="bg-emerald-600/15 text-emerald-800 border-emerald-600/30 text-[9px] font-mono shrink-0">
          GOV VERIFIED (DIGILOCKER)
        </Badge>
      );
    case "customer_confirmed":
      return (
        <Badge className="bg-blue-500/15 text-blue-800 border-blue-500/30 text-[9px] font-mono shrink-0">
          CUSTOMER CONFIRMED (LEDGER)
        </Badge>
      );
    case "peer_endorsed":
    case "peer_confirmed":
      return (
        <Badge className="bg-teal-500/15 text-teal-800 border-teal-500/30 text-[9px] font-mono shrink-0">
          PEER ENDORSED
        </Badge>
      );
    case "third_party_verified":
      return (
        <Badge className="bg-indigo-500/15 text-indigo-800 border-indigo-500/30 text-[9px] font-mono shrink-0">
          THIRD-PARTY AUDITED
        </Badge>
      );
    case "voice_attested":
      return (
        <Badge className="bg-forest/15 text-forest border-forest/30 text-[9px] font-mono shrink-0">
          VOICE AI ATTESTED
        </Badge>
      );
    case "worker_confirmed":
      return (
        <Badge className="bg-sand/30 text-sand-800 border-sand/50 text-[9px] font-mono shrink-0">
          WORKER CONFIRMED
        </Badge>
      );
    case "ai_extracted":
      return (
        <Badge className="bg-amber-500/15 text-amber-800 border-amber-500/30 text-[9px] font-mono shrink-0">
          AI EXTRACTED (PENDING)
        </Badge>
      );
    case "self_declared":
    default:
      return (
        <Badge variant="outline" className="bg-forest/5 text-charcoal-muted border-forest/20 text-[9px] font-mono shrink-0">
          {t?.profile?.selfDeclared || "SELF-DECLARED"}
        </Badge>
      );
  }
}

export function ProfileSkills({ skills }: ProfileSkillsProps) {
  const { t } = useTranslation();
  const verified = skills.filter((s) => s.verificationType !== "self_declared");
  const selfDeclared = skills.filter((s) => s.verificationType === "self_declared");

  return (
    <div className="rounded-md bg-card border border-forest/15 shadow-sovereign-sm p-6 sm:p-8 space-y-6">
      <div className="pb-4 border-b border-forest/10">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-forest" />
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-forest">
            {t.profile?.verifiedSkills || "Skills & Craft Credentials"}
          </h2>
        </div>
        <p className="text-xs text-charcoal-muted mt-0.5">
          KAAMSETU distinguishes verified evidence anchored to national databases and peer testimonies from self-declared craft techniques.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Verified Skills */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wide">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>
                {t.profile?.verifiedSkills || "Verified Evidence"} ({verified.length})
              </span>
            </div>
            <span className="text-[10px] text-charcoal-muted font-mono">
              Anchored Proof
            </span>
          </div>

          <div className="space-y-2">
            {verified.map((s) => (
              <div
                key={s.id}
                className="p-3 rounded-xl border border-forest/15 bg-card hover:border-forest/30 shadow-sovereign-xs flex items-center justify-between transition-all"
              >
                <div>
                  <div className="font-semibold text-xs sm:text-sm text-forest">
                    {s.name}
                  </div>
                  <div className="text-[11px] text-charcoal-muted font-mono mt-0.5">
                    {s.category} • {s.yearsPracticed ? `${s.yearsPracticed} yrs` : "Mastery Demonstrated"}
                  </div>
                </div>

                {getSkillBadge(s.verificationType, t)}
              </div>
            ))}
          </div>
        </div>

        {/* Self-Declared Skills */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-forest/15">
            <div className="flex items-center gap-1.5 text-xs font-bold text-forest uppercase tracking-wide">
              <HelpCircle className="w-4 h-4 text-forest/70" />
              <span>
                {t.profile?.selfDeclared || "Self-Declared Skills"} ({selfDeclared.length})
              </span>
            </div>
            <span className="text-[10px] text-charcoal-muted font-mono">
              Worker Attested
            </span>
          </div>

          <div className="space-y-2">
            {selfDeclared.map((s) => (
              <div
                key={s.id}
                className="p-3 rounded-xl border border-forest/15 bg-card hover:border-forest/30 shadow-sovereign-xs flex items-center justify-between transition-all"
              >
                <div>
                  <div className="font-semibold text-xs sm:text-sm text-forest">
                    {s.name}
                  </div>
                  <div className="text-[11px] text-charcoal-muted font-mono mt-0.5">
                    {s.category} • {s.yearsPracticed ? `${s.yearsPracticed} yrs` : "Worker Self-Attested"}
                  </div>
                </div>

                {getSkillBadge(s.verificationType, t)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
