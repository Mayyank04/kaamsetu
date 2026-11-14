"use client";

import * as React from "react";
import {
  Award,
  ShieldCheck,
  Sparkles,
  Users,
  Clock,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DashboardSkill } from "@/types/dashboard";

interface ProfileSkillsProps {
  skills: DashboardSkill[];
}

export function ProfileSkills({ skills }: ProfileSkillsProps) {
  const verified = skills.filter((s) => s.verificationType !== "self_declared");
  const selfDeclared = skills.filter((s) => s.verificationType === "self_declared");

  return (
    <div className="rounded-2xl bg-card border border-forest/15 shadow-sovereign-sm p-6 sm:p-8 space-y-6">
      <div className="pb-4 border-b border-forest/10">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-forest" />
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-forest">
            Skills & Craft Credentials
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
              <span>Verified Evidence ({verified.length})</span>
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
                    {s.category} • {s.yearsPracticed ? `${s.yearsPracticed} yrs practiced` : "Mastery Demonstrated"}
                  </div>
                </div>

                <Badge className="bg-emerald-500/15 text-emerald-800 border-emerald-500/30 text-[9px] font-mono shrink-0">
                  {s.verificationType === "digilocker_verified"
                    ? "DIGILOCKER VERIFIED"
                    : s.verificationType === "voice_attested"
                    ? "VOICE AI ATTESTED"
                    : "PEER CONFIRMED"}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Self-Declared Skills */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-forest/15">
            <div className="flex items-center gap-1.5 text-xs font-bold text-forest uppercase tracking-wide">
              <Clock className="w-4 h-4 text-forest/70" />
              <span>Self-Declared Skills ({selfDeclared.length})</span>
            </div>
            <span className="text-[10px] text-charcoal-muted font-mono">
              Worker Asserted
            </span>
          </div>

          {selfDeclared.length === 0 ? (
            <p className="text-xs text-charcoal-muted p-4 rounded-xl bg-forest/5 text-center">
              All declared skills have been verified by evidence or peer endorsements.
            </p>
          ) : (
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
                      {s.category} • {s.yearsPracticed ? `${s.yearsPracticed} yrs` : "Practiced"}
                    </div>
                  </div>

                  <Badge
                    variant="outline"
                    className="bg-forest/5 text-charcoal-muted border-forest/20 text-[9px] font-mono shrink-0"
                  >
                    SELF-DECLARED
                  </Badge>
                </div>
              ))}
            </div>
          )}

          <div className="p-3 rounded-xl bg-forest/5 border border-forest/10 text-[11px] text-charcoal-muted leading-relaxed">
            Note: Self-declared skills reflect the craftsman&apos;s stated capabilities. They graduate to Verified status as client bookings and peer evaluations are logged on KAAMSETU.
          </div>
        </div>
      </div>
    </div>
  );
}
