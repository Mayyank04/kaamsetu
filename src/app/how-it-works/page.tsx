"use client";

import * as React from "react";
import Link from "next/link";
import {
  Mic,
  Cpu,
  Users,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Sliders,
  FileCheck2,
  Lock,
  Layers,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KaamScoreGauge } from "@/components/identity/kaamscore-gauge";
import { toast } from "sonner";

export default function HowItWorksPage() {
  // Interactive Simulator state
  const [spokenAudio, setSpokenAudio] = React.useState(140);
  const [aiDomain, setAiDomain] = React.useState(142);
  const [peerEndorse, setPeerEndorse] = React.useState(185);
  const [completedTenures, setCompletedTenures] = React.useState(230);
  const [digiLocker, setDigiLocker] = React.useState(135);

  const calculatedTotal = spokenAudio + aiDomain + peerEndorse + completedTenures + digiLocker;

  // Voice Test Simulator state
  const [sampleAudioText, setSampleAudioText] = React.useState(
    "Namaste, main Mohammed Rafiq. 16 saal se Pune MIDC mein heavy diesel truck overhaul aur electric vehicle battery retrofitting ka kaam kar raha hoon. 6 logon ki team lead karta hoon Bosch diagnostics tools ke saath."
  );
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [extractedResult, setExtractedResult] = React.useState<Record<string, unknown> | null>(null);

  const handleRunVoiceExtraction = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch("/api/ai/extract-skill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: sampleAudioText,
          language: "hi-IN",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setExtractedResult(data.data);
        toast.success("AI Extracted Structured Craft Profile", {
          description: `Identified ${data.data.primaryTrade} (${data.data.yearsOfExperience} yrs experience).`,
        });
      } else {
        toast.error("Extraction error: " + (data.error?.message || "Failed"));
      }
    } catch {
      toast.error("Could not connect to skill extraction API.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-24 pb-24">
      {/* 1. Page Header */}
      <section className="relative overflow-hidden border-b border-forest/15 bg-gradient-to-b from-[#FFFFFF] via-[#F7F5F0] to-[#E9EFEA]/40 pt-16 pb-20">
        <div className="absolute inset-0 bg-paper-grid opacity-35 pointer-events-none" />

        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center space-y-6">
          <Badge variant="verified">Verification Protocol</Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-forest leading-[1.15]">
            How the Sovereign Trust Protocol Works.
          </h1>
          <p className="text-lg sm:text-xl text-charcoal-muted leading-relaxed font-normal max-w-2xl mx-auto">
            Combining multilingual voice intelligence, decentralized peer vouching,
            and DigiLocker integration to convert informal craftsmanship into unforgeable credit.
          </p>
        </div>
      </section>

      {/* 2. The 4 Structural Phases */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl space-y-16">
        {/* Phase 1 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-5 space-y-3">
            <span className="font-mono text-sm font-bold text-sand-800 uppercase tracking-widest">
              Phase 01 • Voice Attestation
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-forest">
              Voice-First Self-Declaration
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed">
              Instead of navigating complicated government portal drop-downs in English,
              the worker holds down a mic button on any basic smartphone and speaks in their
              mother tongue or regional dialect.
            </p>
            <div className="pt-1 flex flex-wrap gap-2 text-xs font-semibold text-forest">
              <span className="px-2.5 py-1 rounded-xs bg-forest/5 border border-forest/10">12+ Dialects</span>
              <span className="px-2.5 py-1 rounded-xs bg-forest/5 border border-forest/10">Acoustic Anti-Spoof</span>
            </div>
          </div>

          <div className="md:col-span-7 rounded-md border border-forest/15 bg-card p-6 shadow-sovereign-sm space-y-4">
            <div className="flex items-center justify-between border-b border-forest/10 pb-3">
              <span className="text-xs font-bold uppercase text-forest">Live Voice Simulator</span>
              <Badge variant="sand">Gemini 2.5 Flash</Badge>
            </div>

            <textarea
              value={sampleAudioText}
              onChange={(e) => setSampleAudioText(e.target.value)}
              rows={3}
              className="w-full text-xs p-3 rounded-xs border border-forest/20 focus:outline-none focus:border-forest bg-paper-grid font-sans"
            />

            <div className="flex justify-between items-center pt-1">
              <span className="text-[11px] text-charcoal-muted">
                Edit text above to simulate custom spoken claim
              </span>
              <Button
                variant="default"
                size="sm"
                onClick={handleRunVoiceExtraction}
                disabled={isProcessing}
                className="bg-forest hover:bg-forest-500 text-ivory text-xs"
              >
                <Sparkles className="mr-1.5 h-3.5 w-3.5 text-sand" />
                {isProcessing ? "Analyzing..." : "Test AI Extraction"}
              </Button>
            </div>

            {extractedResult && (
              <div className="p-3 rounded-xs bg-forest/5 border border-forest/15 text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-forest">
                    {String(extractedResult.primaryTrade)}
                  </span>
                  <span className="text-[10px] font-semibold text-sage">
                    {Number(extractedResult.yearsOfExperience)} Years Exp
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {Array.isArray(extractedResult.equipmentHandled) &&
                    extractedResult.equipmentHandled.map((tool, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-xs bg-card border border-forest/10 text-[10px] text-forest">
                        {String(tool)}
                      </span>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Phase 2 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7 order-2 md:order-1 rounded-md border border-forest/15 bg-card p-6 shadow-sovereign-sm space-y-4">
            <div className="text-xs font-mono text-forest space-y-2 bg-forest/5 p-4 rounded-xs border border-forest/10">
              <div className="flex justify-between text-charcoal-muted border-b border-forest/10 pb-2">
                <span>ONTOLOGY NORMALIZATION</span>
                <span className="text-forest font-bold">NSQF LEVEL 4</span>
              </div>
              <div>Input: &quot;Pichhle 14 saalon se teakwood furniture aur modular kitchen assembly...&quot;</div>
              <div className="text-forest font-bold">↳ Mapped Trade: Master Teak Wood Carpenter & Joiner (QP-CON/Q0104)</div>
              <div>↳ Core Competencies: Precision Mitering, Pocket Hole Joinery, Concealed Hinges</div>
              <div>↳ Equipment Confirmed: Bosch GKS 190, Makita Router, DeWalt Laser</div>
            </div>
          </div>

          <div className="md:col-span-5 order-1 md:order-2 space-y-3">
            <span className="font-mono text-sm font-bold text-sand-800 uppercase tracking-widest">
              Phase 02 • Skill Normalization
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-forest">
              NSDC & NSQF Ontology Mapping
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed">
              Spoken words are cross-referenced with National Skill Qualification Framework (NSQF)
              qualification packs. Informal jargon is mapped into industry-standard technical competencies.
            </p>
          </div>
        </div>

        {/* Phase 3 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-5 space-y-3">
            <span className="font-mono text-sm font-bold text-sand-800 uppercase tracking-widest">
              Phase 03 • Dual Attestation
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-forest">
              Peer Endorsement & Client Proof
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed">
              Resumes can lie; peer craftspeople cannot. Other certified workers in the same geographic
              circle stake their own KAAMSCORE reputation when vouching for a colleague&apos;s technical skill.
            </p>
            <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed">
              When projects finish, licensed site supervisors or homeowners digitally sign off on punctuality and craftsmanship.
            </p>
          </div>

          <div className="md:col-span-7 rounded-md border border-forest/15 bg-card p-6 shadow-sovereign-sm space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-forest/10 pb-2 font-bold text-forest">
              <span>CRYPTOGRAPHIC REPUTATION GRAPH</span>
              <span className="text-sage">ACTIVE MESH</span>
            </div>

            <div className="p-3 rounded-xs bg-sand/15 border border-sand/30 space-y-1">
              <div className="flex justify-between font-bold text-forest">
                <span>Vouch by Satish Verma (Level 4 Site Supervisor)</span>
                <span className="font-mono text-[10px]">IN-HR-2025-1029-KS</span>
              </div>
              <p className="text-charcoal-muted">
                &quot;Verified 18 months continuous tenure on DLF Phase 5 luxury towers. Zero electrical callbacks.&quot;
              </p>
            </div>

            <div className="p-3 rounded-xs bg-forest/5 border border-forest/10 space-y-1">
              <div className="flex justify-between font-bold text-forest">
                <span>Client Sign-off: DLF Luxury Estates</span>
                <span className="font-mono text-[10px]">GSTIN Verified Attestation</span>
              </div>
              <p className="text-charcoal-muted">
                Project completion certificate hash anchored to DigiLocker registry.
              </p>
            </div>
          </div>
        </div>

        {/* Phase 4 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7 order-2 md:order-1 rounded-md border border-forest/15 bg-card p-6 shadow-sovereign-sm space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xs bg-forest/5 border border-forest/10 space-y-2 text-center">
                <ShieldCheck className="h-8 w-8 text-forest mx-auto" />
                <span className="text-xs font-bold text-forest block">DigiLocker Document</span>
                <span className="text-[10px] text-charcoal-muted block">
                  Officially issued digital identity document with Ministry logo
                </span>
              </div>

              <div className="p-4 rounded-xs bg-forest/5 border border-forest/10 space-y-2 text-center">
                <Lock className="h-8 w-8 text-forest mx-auto" />
                <span className="text-xs font-bold text-forest block">Offline QR Verification</span>
                <span className="text-[10px] text-charcoal-muted block">
                  Scannable on remote job sites without active internet connection
                </span>
              </div>
            </div>
          </div>

          <div className="md:col-span-5 order-1 md:order-2 space-y-3">
            <span className="font-mono text-sm font-bold text-sand-800 uppercase tracking-widest">
              Phase 04 • Sovereign Issuance
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-forest">
              KAAMSCORE™ & DigiLocker Minting
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed">
              All 5 signals feed into the deterministic KAAMSCORE algorithm (300 to 900 scale).
              The worker receives a digital identity card ready to share on WhatsApp, print physically,
              or present for bank credit.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Interactive KAAMSCORE Calculator */}
      <section className="border-y border-forest/15 bg-gradient-to-b from-[#F7F5F0] via-[#EFF5F0] to-[#F7F5F0] py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <Badge variant="sovereign">Interactive Simulator</Badge>
            <h2 className="text-3xl font-bold tracking-tight text-forest">
              Calculate the KAAMSCORE™ Index
            </h2>
            <p className="text-sm text-charcoal-muted">
              Adjust the 5 verification sliders below to observe how the sovereign trust score recalculates in real-time.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-card p-8 rounded-md border border-forest/15 shadow-sovereign-sm">
            {/* Sliders */}
            <div className="lg:col-span-7 space-y-5">
              <div>
                <div className="flex justify-between text-xs font-semibold text-forest mb-1.5">
                  <span>1. Spoken Audio Claim Depth</span>
                  <span>{spokenAudio} / 150</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={spokenAudio}
                  onChange={(e) => setSpokenAudio(Number(e.target.value))}
                  className="w-full accent-forest"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-forest mb-1.5">
                  <span>2. Gemini Domain Skill Extraction</span>
                  <span>{aiDomain} / 150</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={aiDomain}
                  onChange={(e) => setAiDomain(Number(e.target.value))}
                  className="w-full accent-forest"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-forest mb-1.5">
                  <span>3. Peer Guild Endorsements</span>
                  <span>{peerEndorse} / 200</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="200"
                  value={peerEndorse}
                  onChange={(e) => setPeerEndorse(Number(e.target.value))}
                  className="w-full accent-forest"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-forest mb-1.5">
                  <span>4. Verified Project Tenures</span>
                  <span>{completedTenures} / 250</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="250"
                  value={completedTenures}
                  onChange={(e) => setCompletedTenures(Number(e.target.value))}
                  className="w-full accent-forest"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-forest mb-1.5">
                  <span>5. Sovereign DigiLocker Verification</span>
                  <span>{digiLocker} / 150</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={digiLocker}
                  onChange={(e) => setDigiLocker(Number(e.target.value))}
                  className="w-full accent-forest"
                />
              </div>
            </div>

            {/* Gauge Output */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-forest/5 rounded-sm border border-forest/10">
              <KaamScoreGauge score={calculatedTotal} size="lg" showBreakdown />
              <p className="text-[11px] text-charcoal-muted text-center mt-3 max-w-xs">
                Scores above 820 unlock Sovereign Master status with pre-approved working capital loan eligibility.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Comparison Table: Traditional vs KAAMSETU */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl space-y-8">
        <div className="text-center space-y-2">
          <Badge variant="verified">The Structural Shift</Badge>
          <h2 className="text-3xl font-bold text-forest">
            Traditional Informal Hiring vs. KAAMSETU
          </h2>
        </div>

        <div className="overflow-x-auto rounded-md border border-forest/15 bg-card shadow-xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-forest/15 bg-forest text-ivory">
                <th className="p-4 font-bold text-xs uppercase tracking-wider">Dimension</th>
                <th className="p-4 font-bold text-xs uppercase tracking-wider text-sand-300">Traditional Informal Work</th>
                <th className="p-4 font-bold text-xs uppercase tracking-wider text-sand">KAAMSETU Sovereign Trust</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-forest/10 text-charcoal">
              <tr>
                <td className="p-4 font-bold text-forest">Skill Proof</td>
                <td className="p-4 text-charcoal-muted">Unverified verbal claims and physical presence only</td>
                <td className="p-4 font-semibold text-forest">DigiLocker-verified audio claim & NSDC qualification pack</td>
              </tr>
              <tr>
                <td className="p-4 font-bold text-forest">Middleman Deduction</td>
                <td className="p-4 text-charcoal-muted">30% to 45% daily wage deducted by middlemen</td>
                <td className="p-4 font-semibold text-forest">0% middleman fees; direct contractor-to-worker payment</td>
              </tr>
              <tr>
                <td className="p-4 font-bold text-forest">Reputation Portability</td>
                <td className="p-4 text-charcoal-muted">Resets to zero when moving to a new city</td>
                <td className="p-4 font-semibold text-forest">Nationwide portable QR identity valid in all 28 states</td>
              </tr>
              <tr>
                <td className="p-4 font-bold text-forest">Credit Access</td>
                <td className="p-4 text-charcoal-muted">Informal loan sharks charging 36% to 60% per year</td>
                <td className="p-4 font-semibold text-forest">KAAMSCORE-backed micro-loans at prime banking rates</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row justify-center gap-4">
          <Button variant="default" size="lg" asChild className="bg-forest hover:bg-forest-500 text-ivory">
            <Link href="/onboarding">
              <Mic className="mr-2 h-4 w-4 text-sand" />
              Create Your Identity
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild className="border-forest/20 text-forest">
            <Link href="/explore">
              Browse Verified Craftspeople
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
