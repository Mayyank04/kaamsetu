"use client";

import * as React from "react";
import {
  ShieldCheck,
  Award,
  Sparkles,
  Users,
  Plus,
  Trash2,
  CheckCircle2,
  Info,
  Clock,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DashboardSkill, SkillVerificationType } from "@/types/dashboard";

interface SkillsManagerProps {
  skills: DashboardSkill[];
  onAddSkill: (name: string, category: string, years: number) => Promise<void>;
  onRemoveSkill: (skillId: string) => Promise<void>;
}

export function SkillsManager({
  skills,
  onAddSkill,
  onRemoveSkill,
}: SkillsManagerProps) {
  const [newSkillName, setNewSkillName] = React.useState("");
  const [newSkillCategory, setNewSkillCategory] = React.useState("Electrical & Solar");
  const [newSkillYears, setNewSkillYears] = React.useState("3");
  const [isAdding, setIsAdding] = React.useState(false);
  const [showAddForm, setShowAddForm] = React.useState(false);

  // Split into Verified Evidence vs Self-Declared
  const verifiedSkills = skills.filter(
    (s) => s.verificationType !== "self_declared"
  );
  const selfDeclaredSkills = skills.filter(
    (s) => s.verificationType === "self_declared"
  );

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    setIsAdding(true);
    try {
      await onAddSkill(
        newSkillName.trim(),
        newSkillCategory,
        parseInt(newSkillYears, 10) || 1
      );
      setNewSkillName("");
      setShowAddForm(false);
    } finally {
      setIsAdding(false);
    }
  };

  const renderBadge = (type: SkillVerificationType, count?: number) => {
    switch (type) {
      case "digilocker_verified":
        return (
          <Badge className="bg-emerald-500/15 text-emerald-800 border-emerald-500/30 text-[10px] font-mono gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-700" />
            DIGILOCKER VERIFIED
          </Badge>
        );
      case "voice_attested":
        return (
          <Badge className="bg-forest/15 text-forest border-forest/30 text-[10px] font-mono gap-1">
            <Sparkles className="w-3 h-3 text-sand-600" />
            VOICE-ATTESTED AI
          </Badge>
        );
      case "peer_confirmed":
        return (
          <Badge className="bg-sand/30 text-sand-800 border-sand/40 text-[10px] font-mono gap-1">
            <Users className="w-3 h-3 text-forest" />
            PEER CONFIRMED ({count || 3})
          </Badge>
        );
      case "self_declared":
      default:
        return (
          <Badge
            variant="outline"
            className="bg-forest/5 text-charcoal border-forest/20 text-[10px] font-mono gap-1"
          >
            <Clock className="w-3 h-3 text-charcoal-muted" />
            SELF-DECLARED
          </Badge>
        );
    }
  };

  return (
    <div className="rounded-2xl bg-card border border-forest/15 shadow-sovereign-sm p-6 sm:p-8 space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-forest/10">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-forest" />
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-forest">
              Craft & Technical Skills
            </h2>
          </div>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Clear separation between cryptographically verified evidence and self-declared worker assertions.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-forest hover:bg-forest-600 text-ivory text-xs h-9 px-4 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Add Self-Declared Skill
        </Button>
      </div>

      {/* Add Skill Form Drawer */}
      {showAddForm && (
        <form
          onSubmit={handleAddSubmit}
          className="p-4 rounded-xl bg-forest/5 border border-forest/20 space-y-3 animate-in fade-in-50"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-forest uppercase tracking-wider">
              Declare New Trade Skill
            </span>
            <span className="text-[11px] text-charcoal-muted font-mono">
              Tagged as [Self-Declared]
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <Input
                placeholder="e.g. Variable Frequency Drive (VFD) Calibration"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                className="bg-card text-xs h-10 border-forest/20"
                required
              />
            </div>
            <div>
              <Input
                type="number"
                min="1"
                max="50"
                placeholder="Years practiced"
                value={newSkillYears}
                onChange={(e) => setNewSkillYears(e.target.value)}
                className="bg-card text-xs h-10 border-forest/20"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowAddForm(false)}
              className="text-xs h-8 text-forest"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isAdding || !newSkillName.trim()}
              className="bg-forest text-ivory text-xs h-8 px-4"
            >
              {isAdding ? "Saving..." : "Declare Skill"}
            </Button>
          </div>
        </form>
      )}

      {/* 2-Column Grid: Verified vs Self-Declared */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Column 1: Verified Evidence */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wide">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Verified Evidence ({verifiedSkills.length})</span>
            </div>
            <span className="text-[10px] text-charcoal-muted font-mono">
              Anchored Proof
            </span>
          </div>

          <div className="space-y-2.5">
            {verifiedSkills.map((skill) => (
              <div
                key={skill.id}
                className="p-3 rounded-xl bg-card border border-forest/15 hover:border-forest/30 shadow-sovereign-xs flex items-center justify-between transition-all"
              >
                <div className="space-y-1">
                  <div className="font-semibold text-xs sm:text-sm text-forest">
                    {skill.name}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {renderBadge(skill.verificationType, skill.verifiedCount)}
                    {skill.yearsPracticed && (
                      <span className="text-[11px] text-charcoal-muted font-mono">
                        {skill.yearsPracticed} yrs practiced
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Self-Declared Skills */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-forest/15">
            <div className="flex items-center gap-1.5 text-xs font-bold text-forest uppercase tracking-wide">
              <Clock className="w-4 h-4 text-forest/70" />
              <span>Self-Declared ({selfDeclaredSkills.length})</span>
            </div>
            <span className="text-[10px] text-charcoal-muted font-mono">
              Worker Asserted
            </span>
          </div>

          {selfDeclaredSkills.length === 0 ? (
            <div className="p-6 text-center rounded-xl bg-forest/5 border border-forest/10 text-xs text-charcoal-muted">
              No self-declared skills yet. Click &quot;Add Self-Declared Skill&quot; above to declare new trade techniques.
            </div>
          ) : (
            <div className="space-y-2.5">
              {selfDeclaredSkills.map((skill) => (
                <div
                  key={skill.id}
                  className="p-3 rounded-xl bg-card border border-forest/15 hover:border-forest/30 shadow-sovereign-xs flex items-center justify-between transition-all"
                >
                  <div className="space-y-1">
                    <div className="font-semibold text-xs sm:text-sm text-forest">
                      {skill.name}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {renderBadge(skill.verificationType)}
                      {skill.yearsPracticed && (
                        <span className="text-[11px] text-charcoal-muted font-mono">
                          {skill.yearsPracticed} yrs
                        </span>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveSkill(skill.id)}
                    className="text-terracotta hover:bg-terracotta/10 h-8 w-8 p-0"
                    title="Remove self-declared skill"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="p-3 rounded-xl bg-sand/15 border border-sand/30 flex items-start gap-2 text-[11px] text-charcoal leading-relaxed">
            <Info className="w-4 h-4 text-sand-800 shrink-0 mt-0.5" />
            <span>
              Self-declared skills are highlighted to clients as worker assertions. Once you complete a verified booking or receive a peer confirmation, they automatically graduate to <strong>Verified Evidence</strong>.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
