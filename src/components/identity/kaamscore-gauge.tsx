"use client";

import * as React from "react";
import { getKaamScoreTier } from "@/lib/utils";
import { ShieldCheck, Award } from "lucide-react";

interface KaamScoreGaugeProps {
  score: number; // 300 to 900
  size?: "sm" | "md" | "lg";
  showBreakdown?: boolean;
}

export function KaamScoreGauge({
  score,
  size = "md",
  showBreakdown = false,
}: KaamScoreGaugeProps) {
  const tierInfo = getKaamScoreTier(score);

  // Normalize score between 0 and 100 for SVG circumference calculation
  const minScore = 300;
  const maxScore = 900;
  const percentage = Math.min(
    100,
    Math.max(0, ((score - minScore) / (maxScore - minScore)) * 100)
  );

  const radius = size === "lg" ? 64 : size === "md" ? 48 : 36;
  const strokeWidth = size === "lg" ? 8 : size === "md" ? 6 : 5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const dimension = (radius + strokeWidth) * 2;

  return (
    <div className="flex flex-col items-center">
      <div className="relative inline-flex items-center justify-center">
        <svg
          width={dimension}
          height={dimension}
          className="-rotate-90 transform"
        >
          {/* Background Track */}
          <circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            stroke="#E8C999"
            strokeOpacity="0.25"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress Arc */}
          <circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            stroke="#153E35"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Display */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span
            className={`font-black tracking-tight text-forest ${
              size === "lg"
                ? "text-3xl"
                : size === "md"
                ? "text-2xl"
                : "text-lg"
            }`}
          >
            {score}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-muted">
            KAAMSCORE
          </span>
        </div>
      </div>

      {/* Tier Label */}
      <div className="mt-3 flex items-center gap-1.5 rounded-xs bg-sand/20 px-2.5 py-1 border border-sand/40">
        <ShieldCheck className="h-3.5 w-3.5 text-forest" />
        <span className="text-xs font-bold text-forest">
          {tierInfo.tier} (L{tierInfo.level})
        </span>
      </div>

      {showBreakdown && (
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs w-full max-w-xs">
          <div className="flex items-center justify-between p-2 rounded-xs bg-forest/5 border border-forest/10">
            <span className="text-charcoal-muted">Peer Trust</span>
            <span className="font-bold text-forest">Verified</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-xs bg-forest/5 border border-forest/10">
            <span className="text-charcoal-muted">Sovereign Proof</span>
            <span className="font-bold text-forest">DigiLocker</span>
          </div>
        </div>
      )}
    </div>
  );
}
