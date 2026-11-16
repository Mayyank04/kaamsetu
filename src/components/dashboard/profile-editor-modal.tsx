"use client";

import * as React from "react";
import { X, Edit3, AlertCircle, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DashboardWorkerProfile } from "@/types/dashboard";

interface ProfileEditorModalProps {
  profile: DashboardWorkerProfile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: Partial<DashboardWorkerProfile>) => Promise<void>;
}

export function ProfileEditorModal({
  profile,
  isOpen,
  onClose,
  onSave,
}: ProfileEditorModalProps) {
  const [headline, setHeadline] = React.useState(profile.headline);
  const [bio, setBio] = React.useState(profile.bio);
  const [yearsExperience, setYearsExperience] = React.useState(
    profile.yearsExperience.toString()
  );
  const [dailyRateMin, setDailyRateMin] = React.useState(
    profile.dailyRateMin.toString()
  );
  const [dailyRateMax, setDailyRateMax] = React.useState(
    profile.dailyRateMax.toString()
  );
  const [city, setCity] = React.useState(profile.city);
  const [state, setState] = React.useState(profile.state);
  const [serviceRadiusKm, setServiceRadiusKm] = React.useState(
    profile.serviceRadiusKm.toString()
  );
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      await onSave({
        headline,
        bio,
        yearsExperience: parseInt(yearsExperience, 10) || 5,
        dailyRateMin: parseInt(dailyRateMin, 10) || 1000,
        dailyRateMax: parseInt(dailyRateMax, 10) || 1800,
        city,
        state,
        serviceRadiusKm: parseInt(serviceRadiusKm, 10) || 25,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save profile changes.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-forest-950/75 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-card w-full max-w-xl rounded-md border border-forest/20 shadow-sovereign-md p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-forest/10">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-forest" />
            <h3 className="font-serif text-lg font-bold text-forest">
              Edit Worker Profile & Rates
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-charcoal-muted hover:text-forest p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-terracotta/10 border border-terracotta/20 text-xs text-terracotta flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-forest block">
              Professional Headline *
            </label>
            <Input
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              required
              className="text-xs h-10 border-forest/20"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-forest block">
              Editorial Biography & Specialization *
            </label>
            <Textarea
              value={bio}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBio(e.target.value)}
              required
              className="text-xs min-h-[90px] border-forest/20 resize-none leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-forest block">
                Daily Rate Min (₹) *
              </label>
              <Input
                type="number"
                value={dailyRateMin}
                onChange={(e) => setDailyRateMin(e.target.value)}
                required
                className="text-xs h-10 border-forest/20"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-forest block">
                Daily Rate Max (₹) *
              </label>
              <Input
                type="number"
                value={dailyRateMax}
                onChange={(e) => setDailyRateMax(e.target.value)}
                required
                className="text-xs h-10 border-forest/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-forest block">
                City / District *
              </label>
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                className="text-xs h-10 border-forest/20"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-forest block">
                State *
              </label>
              <Input
                value={state}
                onChange={(e) => setState(e.target.value)}
                required
                className="text-xs h-10 border-forest/20"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-forest block">
                Experience (Yrs)
              </label>
              <Input
                type="number"
                value={yearsExperience}
                onChange={(e) => setYearsExperience(e.target.value)}
                required
                className="text-xs h-10 border-forest/20"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-forest/10">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="text-xs h-9 border-forest/20 text-forest"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-forest hover:bg-forest-600 text-ivory text-xs h-9 px-5 font-semibold"
            >
              <Save className="w-3.5 h-3.5 mr-1.5" />
              {isSaving ? "Saving Changes..." : "Save Profile"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
