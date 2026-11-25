"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  Globe,
  Lock,
  Eye,
  Edit3,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { DashboardWorkerProfile, DashboardCompletionTask } from "@/types/dashboard";

interface DashboardHeaderProps {
  profile: DashboardWorkerProfile;
  completionPercentage: number;
  completionTasks: DashboardCompletionTask[];
  onTogglePublish: (newStatus: boolean) => Promise<void>;
  onOpenEditModal: () => void;
  isPublishing: boolean;
}

export function DashboardHeader({
  profile,
  completionPercentage,
  completionTasks,
  onTogglePublish,
  onOpenEditModal,
  isPublishing,
}: DashboardHeaderProps) {
  const [showTasks, setShowTasks] = React.useState(false);

  return (
    <div className="relative overflow-hidden rounded-md bg-card border border-forest/15 shadow-sovereign-sm p-6 sm:p-8 space-y-6">
      {/* Top Banner: Sovereign Status & Publication Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-forest/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-sm bg-forest/10 border border-forest/20 flex items-center justify-center text-forest">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-forest/70 uppercase tracking-wider">
                Sovereign Registry
              </span>
              <span className="font-mono text-xs font-bold text-forest bg-forest/5 px-2 py-0.5 rounded border border-forest/15">
                {profile.registryId}
              </span>
            </div>
            <p className="text-[11px] text-charcoal-muted">
              National Digital Skill Trust Protocol
            </p>
          </div>
        </div>

        {/* Self-Sovereign Publication Toggle */}
        <div className="flex items-center gap-3 bg-forest/5 px-4 py-2 rounded-sm border border-forest/15">
          <div className="text-right">
            <span className="block text-xs font-semibold text-forest">
              {profile.isPublished ? "Publicly Discoverable" : "Private / Draft Mode"}
            </span>
            <span className="text-[10px] text-charcoal-muted">
              {profile.isPublished
                ? "Visible on National Registry"
                : "Hidden from public searches"}
            </span>
          </div>
          <Switch
            checked={profile.isPublished}
            disabled={isPublishing}
            onCheckedChange={(checked: boolean) => onTogglePublish(checked)}
            aria-label="Toggle profile publishing"
          />
        </div>
      </div>

      {/* Main Identity Row */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-4 sm:gap-6">
          {/* Avatar / Portrait */}
          <div className="relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 rounded-md overflow-hidden border-2 border-sand/60 shadow-sovereign-sm bg-forest-900">
            {profile.avatarUrl ? (
              <Image
                src={profile.avatarUrl}
                alt={profile.fullName}
                fill
                className="object-cover"
                sizes="96px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-forest text-sand font-serif text-2xl font-bold">
                {profile.fullName.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="absolute bottom-1 right-1 bg-emerald-500 rounded-full p-1 border-2 border-white">
              <CheckCircle2 className="w-3 h-3 text-white" />
            </div>
          </div>

          {/* Name & Headline */}
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-forest tracking-tight">
                Namaste, {profile.fullName}
              </h1>
              {profile.aadhaarVerified && (
                <Badge
                  variant="outline"
                  className="bg-forest/5 text-forest border-forest/20 text-[10px] font-mono"
                >
                  AADHAAR VERIFIED
                </Badge>
              )}
            </div>

            <p className="text-sm font-medium text-forest/90">
              {profile.headline}
            </p>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-charcoal-muted pt-0.5">
              <span>{profile.occupation}</span>
              <span>•</span>
              <span>{profile.city}, {profile.state}</span>
              <span>•</span>
              <span className="font-semibold text-forest">
                ₹{profile.dailyRateMin} - ₹{profile.dailyRateMax} / day
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenEditModal}
            className="border-forest/20 text-forest hover:bg-forest/5 h-10 px-4 font-medium"
          >
            <Edit3 className="w-4 h-4 mr-2 text-forest/70" />
            Edit Profile
          </Button>

          <Button
            asChild
            size="sm"
            className="bg-forest hover:bg-forest-600 text-ivory h-10 px-4 font-medium shadow-sovereign-xs"
          >
            <Link href={`/profile/${profile.slug}`}>
              <ExternalLink className="w-4 h-4 mr-2 text-sand" />
              View Public Identity
            </Link>
          </Button>
        </div>
      </div>

      {/* Profile Completion Meter */}
      <div className="pt-2 border-t border-forest/10 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-forest tracking-wide uppercase text-[11px]">
              Profile Strength & Verification
            </span>
            <span className="font-mono font-bold text-forest bg-sand/30 px-2 py-0.5 rounded text-[11px]">
              {completionPercentage}% Complete
            </span>
          </div>

          <button
            onClick={() => setShowTasks(!showTasks)}
            className="inline-flex items-center gap-1 text-forest/70 hover:text-forest font-medium text-xs transition-colors"
          >
            <span>{showTasks ? "Hide Checklist" : "View Missing Milestones"}</span>
            {showTasks ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Progress Bar Track */}
        <div className="w-full h-2.5 rounded-full bg-forest/10 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-forest to-sage transition-all duration-700 rounded-full"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>

        {/* Collapsible Checklist */}
        {showTasks && (
          <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5 animate-in fade-in-50">
            {completionTasks.map((task) => (
              <div
                key={task.id}
                className={`p-3 rounded-md border text-xs flex items-start gap-2.5 transition-all ${
                  task.completed
                    ? "bg-forest/5 border-forest/15 text-forest"
                    : "bg-terracotta/5 border-terracotta/20 text-charcoal"
                }`}
              >
                {task.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-terracotta shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-bold">{task.title}</div>
                  <div className="text-[11px] text-charcoal-muted mt-0.5">
                    {task.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
