"use client";

import * as React from "react";
import {
  OnboardingExtractedProfile,
  SupportedLanguageCode,
  ApprovedProfileSubmission,
} from "@/schemas/onboarding.schema";
import { ONBOARDING_I18N } from "@/lib/i18n/onboarding";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  AlertTriangle,
  Plus,
  X,
  ShieldCheck,
  Briefcase,
  MapPin,
  Clock,
  IndianRupee,
  Info,
} from "lucide-react";
import { GeographicAuthorizationService } from "@/lib/geo/geographic-authorization-service";

interface ExtractionEditorProps {
  language: SupportedLanguageCode;
  extractedData: OnboardingExtractedProfile;
  voiceTranscript?: string;
  onApprove: (approved: ApprovedProfileSubmission) => void;
  isSubmitting: boolean;
}

export function ExtractionEditor({
  language,
  extractedData,
  voiceTranscript,
  onApprove,
  isSubmitting,
}: ExtractionEditorProps) {
  const i18n = ONBOARDING_I18N[language] || ONBOARDING_I18N.en;

  // Editable Form State initialized from Voice / Text Extraction
  const [fullName, setFullName] = React.useState(extractedData.fullName);
  const [occupation, setOccupation] = React.useState(extractedData.occupation);
  const [category, setCategory] = React.useState(extractedData.category);
  const [ncoCode, setNcoCode] = React.useState(extractedData.ncoCode || "");
  const [yearsExperience, setYearsExperience] = React.useState<number | null>(extractedData.experienceYears);
  const [city, setCity] = React.useState(extractedData.city || "");
  const [state, setState] = React.useState(extractedData.state || "");
  const [pincode, setPincode] = React.useState("");
  const [headline, setHeadline] = React.useState(extractedData.headline);
  const [bio, setBio] = React.useState(extractedData.bio);
  const [skills, setSkills] = React.useState<string[]>(extractedData.skills);
  const [newSkillInput, setNewSkillInput] = React.useState("");
  const [dailyRateMin, setDailyRateMin] = React.useState<number | null>(
    (extractedData as any).dailyRateMin ?? null
  );
  const [dailyRateMax, setDailyRateMax] = React.useState<number | null>(
    (extractedData as any).dailyRateMax ?? null
  );

  // Compute live geographic status for UI guidance
  const geoStatus = React.useMemo(() => {
    if (!city && !state && !pincode) return null;
    return GeographicAuthorizationService.validateLocation({
      city,
      state,
      pincode: pincode.trim() || null,
    });
  }, [city, state, pincode]);

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSkillInput.trim() && !skills.includes(newSkillInput.trim())) {
      setSkills([...skills, newSkillInput.trim()]);
      setNewSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApprove({
      fullName,
      occupation,
      category,
      ncoCode: ncoCode.trim() || undefined,
      yearsExperience,
      city,
      state,
      pincode: pincode.trim() || undefined,
      skills,
      equipmentHandled: extractedData.equipmentHandled,
      dailyRateMin: dailyRateMin ?? undefined,
      dailyRateMax: dailyRateMax ?? undefined,
      headline,
      bio,
      languages: [language.toUpperCase(), "Hindi"],
      voiceTranscript,
      allowNonDispatchProfile: geoStatus ? !geoStatus.allowed : false,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl mx-auto">
      {/* Missing Fields Notice (Non-invention principle) */}
      {extractedData.missingFields && extractedData.missingFields.length > 0 && (
        <div className="rounded-md bg-sand/20 border border-sand/40 p-4 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-forest font-bold">
            <AlertTriangle className="h-4 w-4 text-sand-800" />
            <span>{i18n.missingFieldsAlert}</span>
          </div>
          <ul className="list-disc list-inside text-charcoal-muted space-y-0.5 pl-2">
            {extractedData.missingFields.map((field, idx) => (
              <li key={idx}>{field}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Main Review Card */}
      <div className="rounded-md border border-forest/15 bg-card p-6 shadow-sovereign-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-forest/10 pb-4">
          <div>
            <h3 className="font-bold text-forest text-lg">
              {i18n.extractedTitle}
            </h3>
            <p className="text-xs text-charcoal-muted">
              Self-declared trade testimony. Review and edit any field before credential minting.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <Badge variant="outline" className="text-xs bg-forest/5 text-forest border-forest/20 font-mono py-1">
              Self-Declared Testimony
            </Badge>
            <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-900 border-amber-300 font-mono py-1">
              Trade suggestion — review and edit
            </Badge>
          </div>
        </div>

        {/* Basic Info Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-bold uppercase tracking-wider text-charcoal-muted block mb-1">
              Full Legal / Trade Name *
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full h-11 px-3 rounded-xs border border-forest/20 text-sm font-semibold text-forest focus:outline-none focus:border-forest"
            />
          </div>

          <div>
            <label className="font-bold uppercase tracking-wider text-charcoal-muted block mb-1">
              Primary Trade / Craft *
            </label>
            <input
              type="text"
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              required
              className="w-full h-11 px-3 rounded-xs border border-forest/20 text-sm font-semibold text-forest focus:outline-none focus:border-forest"
            />
          </div>

          <div>
            <label className="font-bold uppercase tracking-wider text-charcoal-muted block mb-1">
              Years of Hands-on Experience
            </label>
            <input
              type="number"
              min="0"
              max="60"
              placeholder="Unreported (Optional)"
              value={yearsExperience ?? ""}
              onChange={(e) => setYearsExperience(e.target.value === "" ? null : Math.max(0, parseInt(e.target.value, 10)))}
              className="w-full h-11 px-3 rounded-xs border border-forest/20 text-sm font-semibold text-forest focus:outline-none focus:border-forest"
            />
          </div>

          {/* Trade Classification Suggestion (Truthful, non-fabricated, editable) */}
          <div>
            <label className="font-bold uppercase tracking-wider text-charcoal-muted block mb-1">
              Trade Classification Suggestion (NCO 2015)
            </label>
            <input
              type="text"
              value={ncoCode}
              onChange={(e) => setNcoCode(e.target.value)}
              placeholder="e.g. 7411.0100 - Electrical Mechanics & Solar Mounts"
              className="w-full h-11 px-3 rounded-xs border border-forest/20 text-xs font-mono text-forest focus:outline-none focus:border-forest"
            />
            <span className="text-[10px] text-charcoal-muted mt-1 block">
              Suggested code based on testimony. Not a formal government certification or NSQF diploma.
            </span>
          </div>
        </div>

        {/* Operating Location & Live Geographic Validation */}
        <div className="space-y-3 pt-2 border-t border-forest/10">
          <label className="font-bold uppercase tracking-wider text-xs text-forest block">
            Operating City, State & PIN Code *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <input
                type="text"
                placeholder="City (e.g. Guwahati)"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                className="w-full h-11 px-3 rounded-xs border border-forest/20 text-sm text-forest focus:outline-none focus:border-forest"
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="State (e.g. Assam)"
                value={state}
                onChange={(e) => setState(e.target.value)}
                required
                className="w-full h-11 px-3 rounded-xs border border-forest/20 text-sm text-forest focus:outline-none focus:border-forest"
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="6-Digit PIN Code *"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                className="w-full h-11 px-3 rounded-xs border border-forest/20 text-sm font-mono text-forest focus:outline-none focus:border-forest"
              />
            </div>
          </div>

          {/* Real-time Geographic Scope Feedback */}
          {geoStatus && (
            <div
              className={`p-3.5 rounded-md text-xs border flex items-start gap-2.5 ${
                geoStatus.status === "AUTHORIZED"
                  ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                  : geoStatus.status === "NON_DISPATCH_AREA"
                  ? "bg-amber-50 text-amber-900 border-amber-200"
                  : "bg-red-50 text-red-900 border-red-200"
              }`}
            >
              {geoStatus.status === "AUTHORIZED" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <div className="font-bold">
                  {geoStatus.status === "AUTHORIZED"
                    ? "Active Class B Controlled Rollout Zone"
                    : geoStatus.status === "NON_DISPATCH_AREA"
                    ? "Non-Dispatch Operating Scope"
                    : "Geographic Boundary Notice"}
                </div>
                <p className="text-[11px] leading-relaxed">
                  {geoStatus.status === "AUTHORIZED"
                    ? "Your location is within our active commercial dispatch zone (Guwahati Urban or Shillong Urban). Customer bookings and job dispatch are enabled."
                    : geoStatus.reason}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Daily Rate Expectation (Optional) */}
        <div className="p-4 rounded-xs bg-forest/5 border border-forest/10 space-y-2 text-xs">
          <label className="font-bold uppercase tracking-wider text-forest block">
            Estimated Daily Rate Range (₹ / day, Optional)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] text-charcoal-muted block">Minimum Daily Rate</span>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-muted text-xs">₹</span>
                <input
                  type="number"
                  min="0"
                  step="50"
                  placeholder="Unstated (e.g. 900)"
                  value={dailyRateMin ?? ""}
                  onChange={(e) => setDailyRateMin(e.target.value === "" ? null : Math.max(0, parseInt(e.target.value, 10)))}
                  className="w-full h-10 pl-7 pr-3 rounded-xs border border-forest/20 text-xs font-mono font-bold text-forest bg-card"
                />
              </div>
            </div>

            <div>
              <span className="text-[10px] text-charcoal-muted block">Maximum Daily Rate</span>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-muted text-xs">₹</span>
                <input
                  type="number"
                  min={dailyRateMin ?? 0}
                  step="50"
                  placeholder="Unstated (e.g. 1600)"
                  value={dailyRateMax ?? ""}
                  onChange={(e) => setDailyRateMax(e.target.value === "" ? null : Math.max(0, parseInt(e.target.value, 10)))}
                  className="w-full h-10 pl-7 pr-3 rounded-xs border border-forest/20 text-xs font-mono font-bold text-forest bg-card"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Skills Tag Management */}
        <div className="space-y-3">
          <label className="font-bold uppercase tracking-wider text-xs text-forest block">
            {i18n.editSkillsTitle} *
          </label>

          <div className="flex flex-wrap gap-1.5">
            {skills.map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-forest/5 text-forest border border-forest/15 text-xs font-medium"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="text-forest/60 hover:text-terracotta transition-colors"
                  aria-label={`Remove ${skill}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder={i18n.addSkillPlaceholder}
              value={newSkillInput}
              onChange={(e) => setNewSkillInput(e.target.value)}
              className="flex-1 h-10 px-3 rounded-xs border border-forest/20 text-xs text-forest focus:outline-none focus:border-forest"
            />
            <Button
              type="button"
              onClick={handleAddSkill}
              variant="outline"
              size="sm"
              className="border-forest/20 text-forest text-xs"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              {i18n.addSkillBtn}
            </Button>
          </div>
        </div>

        {/* Headline & Bio */}
        <div className="space-y-3">
          <div>
            <label className="font-bold uppercase tracking-wider text-xs text-forest block mb-1">
              Public Trade Headline *
            </label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              required
              className="w-full h-11 px-3 rounded-xs border border-forest/20 text-xs font-semibold text-forest focus:outline-none focus:border-forest"
            />
          </div>

          <div>
            <label className="font-bold uppercase tracking-wider text-xs text-forest block mb-1">
              Artisan Profile Bio & Trade Experience *
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              required
              className="w-full p-3 rounded-xs border border-forest/20 text-xs text-forest focus:outline-none focus:border-forest leading-relaxed font-sans"
            />
          </div>
        </div>

        {/* Submit Actions */}
        <div className="pt-4 border-t border-forest/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-charcoal-muted">
            By proceeding, you attest to the accuracy of your craft declaration under KAAMSETU&apos;s sovereign trust framework.
          </p>

          <Button
            type="submit"
            disabled={isSubmitting || skills.length === 0}
            className="w-full sm:w-auto h-11 px-8 bg-forest hover:bg-forest-500 text-ivory font-bold text-xs shadow-sovereign-sm"
          >
            {isSubmitting ? "Minting Sovereign Identity..." : i18n.approveBtn}
          </Button>
        </div>
      </div>
    </form>
  );
}
