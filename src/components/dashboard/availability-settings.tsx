"use client";

import * as React from "react";
import {
  Clock,
  MapPin,
  Compass,
  CheckCircle2,
  AlertCircle,
  Shield,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { AvailabilityState } from "@/types/database.types";

interface AvailabilitySettingsProps {
  currentStatus: AvailabilityState;
  serviceRadiusKm: number;
  city: string;
  state: string;
  onUpdateAvailability: (status: AvailabilityState, radiusKm: number) => Promise<void>;
}

export function AvailabilitySettings({
  currentStatus,
  serviceRadiusKm,
  city,
  state,
  onUpdateAvailability,
}: AvailabilitySettingsProps) {
  const [status, setStatus] = React.useState<AvailabilityState>(currentStatus);
  const [radius, setRadius] = React.useState<number>(serviceRadiusKm || 25);
  const [isSaving, setIsSaving] = React.useState(false);
  const [savedSuccess, setSavedSuccess] = React.useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdateAvailability(status, radius);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } finally {
      setIsSaving(false);
    }
  };

  const statusOptions: {
    value: AvailabilityState;
    label: string;
    description: string;
    badgeBg: string;
    dotColor: string;
  }[] = [
    {
      value: "available",
      label: "Available for Direct Bookings",
      description: "You are actively accepting new project inquiries and site visits.",
      badgeBg: "border-emerald-500/30 bg-emerald-500/10",
      dotColor: "bg-emerald-500",
    },
    {
      value: "on_site",
      label: "Currently On-Site",
      description: "Working on an active contract. Accepting advance bookings only.",
      badgeBg: "border-sand/40 bg-sand/20",
      dotColor: "bg-amber-500",
    },
    {
      value: "unavailable",
      label: "Temporarily Unavailable / On Leave",
      description: "Your profile remains visible, but immediate hiring requests are paused.",
      badgeBg: "border-charcoal/20 bg-charcoal/5",
      dotColor: "bg-charcoal/50",
    },
  ];

  return (
    <div className="rounded-md bg-card border border-forest/15 shadow-sovereign-sm p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-forest/10">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-forest" />
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-forest">
              Availability & Work Radius
            </h2>
          </div>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Configure your real-time dispatch readiness and geographical service boundaries.
          </p>
        </div>

        <Button
          size="sm"
          onClick={handleSave}
          disabled={isSaving}
          className="bg-forest hover:bg-forest-600 text-ivory text-xs h-9 px-5 self-start sm:self-auto font-semibold shadow-sovereign-xs"
        >
          {savedSuccess ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-sand" />
              Preferences Saved
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5 mr-1.5" />
              {isSaving ? "Saving..." : "Save Availability"}
            </>
          )}
        </Button>
      </div>

      {/* Status Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {statusOptions.map((opt) => {
          const isSelected = status === opt.value;
          return (
            <div
              key={opt.value}
              onClick={() => setStatus(opt.value)}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                isSelected
                  ? "border-forest bg-forest/5 shadow-sovereign-xs"
                  : "border-forest/10 hover:border-forest/30 bg-card"
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${opt.dotColor}`} />
                  <span className="font-bold text-xs sm:text-sm text-forest">
                    {opt.label}
                  </span>
                </div>
                <p className="text-xs text-charcoal-muted leading-relaxed">
                  {opt.description}
                </p>
              </div>

              <div className="pt-2">
                <span
                  className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
                    isSelected
                      ? "bg-forest text-ivory border-forest"
                      : "bg-forest/5 text-forest/70 border-forest/15"
                  }`}
                >
                  {isSelected ? "ACTIVE STATE" : "SELECT"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Service Radius Slider */}
      <div className="p-5 rounded-xl bg-forest/5 border border-forest/15 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-forest" />
            <span className="text-xs font-bold text-forest uppercase tracking-wider">
              Operating Service Radius
            </span>
          </div>
          <span className="font-mono text-sm font-bold text-forest bg-card px-3 py-1 rounded-lg border border-forest/15 self-start sm:self-auto">
            {radius} km from {city}, {state}
          </span>
        </div>

        <Slider
          value={[radius]}
          min={5}
          max={100}
          step={5}
          onValueChange={(vals: number[]) => setRadius(vals[0])}
          className="py-2"
        />

        <div className="flex items-center justify-between text-[11px] text-charcoal-muted font-mono">
          <span>5 km (Local District)</span>
          <span>50 km (Metro & Suburbs)</span>
          <span>100 km (Inter-District / Industrial Corridor)</span>
        </div>
      </div>
    </div>
  );
}
