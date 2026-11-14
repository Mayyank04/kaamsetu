"use client";

import * as React from "react";
import {
  Eye,
  QrCode,
  Briefcase,
  TrendingUp,
  Award,
  ArrowUpRight,
  ShieldAlert,
} from "lucide-react";
import { DashboardAnalytics, DashboardWorkerProfile } from "@/types/dashboard";

interface AnalyticsOverviewProps {
  analytics: DashboardAnalytics;
  profile: DashboardWorkerProfile;
}

export function AnalyticsOverview({ analytics, profile }: AnalyticsOverviewProps) {
  const cards = [
    {
      label: "Profile Views (This Week)",
      value: analytics.profileViewsThisWeek,
      subvalue: `${analytics.totalProfileViews} Total Impressions`,
      icon: Eye,
      trend: "+28% vs last week",
      accent: "text-forest",
      bg: "bg-forest/5",
    },
    {
      label: "Credential Card Scans",
      value: analytics.cardScans,
      subvalue: "Physical QR & Link Scans",
      icon: QrCode,
      trend: "Verified by 4 Contractors",
      accent: "text-sand-700",
      bg: "bg-sand/20",
    },
    {
      label: "Direct Job Inquiries",
      value: analytics.inquiriesCount,
      subvalue: "High-Intent Client Leads",
      icon: Briefcase,
      trend: "3 Pending Response",
      accent: "text-emerald-700",
      bg: "bg-emerald-500/10",
    },
    {
      label: "KAAMSCORE™ Trust Index",
      value: profile.kaamScore.totalScore,
      subvalue: `${profile.kaamScore.tier} • Evidence-Backed Tier`,
      icon: Award,
      trend: "+18 pts this quarter",
      accent: "text-forest-900",
      bg: "bg-forest/10",
    },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-mono font-bold uppercase text-forest/70 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-sand animate-pulse" />
          WORKER IDENTITY METRICS (DEMO SIMULATION BASELINE)
        </span>
        <span className="text-[10px] text-charcoal-muted font-mono">
          Updated: Today
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-card border border-forest/15 shadow-sovereign-xs flex flex-col justify-between space-y-3 hover:border-forest/30 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-charcoal-muted uppercase tracking-wider">
                {card.label}
              </span>
              <div className={`w-8 h-8 rounded-xl ${card.bg} flex items-center justify-center ${card.accent}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="font-serif text-3xl font-black text-forest tracking-tight">
                {card.value}
              </div>
              <div className="text-xs text-charcoal-muted font-medium">
                {card.subvalue}
              </div>
            </div>

            <div className="pt-2 border-t border-forest/10 flex items-center gap-1.5 text-[11px] font-mono text-emerald-700">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{card.trend}</span>
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
}
