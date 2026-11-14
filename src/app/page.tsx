"use client";

import * as React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Award,
  Mic,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Layers,
  Database,
  Lock,
  FileCheck,
  Hammer,
  Zap,
  Wrench,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SovereignCard } from "@/components/identity/sovereign-card";
import { KaamScoreGauge } from "@/components/identity/kaamscore-gauge";
import { WorkerProfile } from "@/types/identity";
import { toast } from "sonner";

// Sample verified worker profile matching institutional standards
const sampleWorker: WorkerProfile = {
  id: "worker-demo-01",
  registryId: "IN-DL-2026-8942-KS",
  fullName: "Rameshwar Sharma",
  primaryTrade: "Master Teak Wood Carpenter & Joiner",
  subTrades: [
    "Modular Kitchen Assembly",
    "Antique Wood Restoration",
    "CAD Blueprint Reading",
    "HVAC Duct Framing",
  ],
  yearsExperience: 14,
  location: {
    city: "New Delhi",
    state: "Delhi NCR",
    pincode: "110025",
  },
  languages: ["Hindi", "English", "Marwari"],
  aadhaarVerified: true,
  digiLockerLinked: true,
  kaamScore: {
    totalScore: 842,
    tier: "Sovereign Master",
    level: 4,
    percentileRank: 98,
    trajectory: "rising",
    lastVerifiedDate: "2026-11-14",
    breakdown: {
      spokenAudioProof: 145,
      domainAIExtraction: 142,
      peerEndorsements: 195,
      completedJobs: 235,
      sovereignDigiLocker: 125,
    },
  },
  badges: [
    {
      id: "b1",
      title: "Master Carpenter L4",
      issuer: "NSDC India",
      issueDate: "2024-03-15",
      level: "Master Craftsman",
      category: "Joinery",
      verifiedByDigiLocker: true,
    },
  ],
  experience: [
    {
      id: "exp-1",
      projectTitle: "Heritage Haveli Restoration",
      clientOrContractor: "DLF Luxury Estates",
      location: "Gurugram",
      startDate: "2023-01-10",
      endDate: "2024-08-20",
      isCurrent: false,
      verifiedByClient: true,
      rating: 5,
    },
  ],
  endorsements: [
    {
      id: "end-1",
      endorserName: "Satish Verma",
      endorserTrade: "Site Supervisor",
      endorserRegistryId: "IN-HR-2025-1029-KS",
      endorserScore: 810,
      rating: 5,
      comment: "Exceptional precision in joint interlocking and team leadership.",
      createdAt: "2026-09-12",
    },
  ],
  voiceDeclarationTranscript:
    "Namaste, main Rameshwar Sharma. Pichhle 14 saalon se teakwood furniture aur modular kitchen framing ka kaam kar raha hoon. 8 logon ki team lead karta hoon.",
  qrVerificationUrl: "https://kaamsetu.gov.in/verify/IN-DL-2026-8942-KS",
  availabilityStatus: "available",
  createdAt: "2026-01-15T09:00:00Z",
  updatedAt: "2026-11-14T12:00:00Z",
};

export default function HomePage() {
  const [transcriptInput, setTranscriptInput] = React.useState(
    "Namaste, mera naam Rameshwar Sharma hai. Main pichhle 14 saal se luxury wood framing aur modular kitchen assembly karta hoon Bosch aur Makita tools ke saath."
  );
  const [isExtracting, setIsExtracting] = React.useState(false);
  const [extractedData, setExtractedData] = React.useState<Record<string, unknown> | null>(null);

  const handleTestExtraction = async () => {
    setIsExtracting(true);
    try {
      const response = await fetch("/api/ai/extract-skill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: transcriptInput,
          language: "hi-IN",
        }),
      });

      const result = await response.json();
      if (result.success) {
        setExtractedData(result.data);
        toast.success("Voice Claim Structured Successfully", {
          description: `Extracted ${result.data.primaryTrade} with ${(result.data.confidenceScore * 100).toFixed(0)}% AI confidence.`,
        });
      } else {
        toast.error("Extraction Failed", {
          description: result.error?.message || "Could not parse transcript.",
        });
      }
    } catch {
      toast.error("Network error while connecting to skill extraction API.");
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="space-y-16 pb-24">
      {/* 1. Sovereign Institutional Hero */}
      <section className="relative overflow-hidden border-b border-forest/15 bg-gradient-to-b from-card via-ivory to-background pt-12 pb-16 lg:pt-20 lg:pb-24">
        {/* Subtle background paper grid texture */}
        <div className="absolute inset-0 bg-paper-grid opacity-30 pointer-events-none" />

        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Mission & Civic Authority */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-xs bg-forest/10 px-3 py-1.5 border border-forest/20 text-xs font-bold text-forest uppercase tracking-wider">
                <ShieldCheck className="h-4 w-4 text-forest" />
                <span>National Digital Identity Infrastructure</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-forest leading-[1.1]">
                Unforgeable Digital Trust for India’s Skilled Workforce.
              </h1>

              <p className="text-base sm:text-lg text-charcoal-muted leading-relaxed max-w-2xl">
                Bridging 450M+ informal craftspeople with institutional credibility.
                Transforming spoken vernacular claims into sovereign credentials,
                quantified by the <strong className="text-forest font-semibold">KAAMSCORE™</strong> protocol.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Button variant="default" size="lg" asChild>
                  <Link href="#voice-simulator">
                    <Mic className="mr-2 h-4 w-4 text-sand" />
                    Test Voice Registration
                  </Link>
                </Button>
                <Button variant="secondary" size="lg" asChild>
                  <Link href="#kaamscore">
                    Explore KAAMSCORE™ Meter
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="#architecture">
                    Architecture Specs
                  </Link>
                </Button>
              </div>

              {/* Trust Metrics Bar */}
              <div className="pt-6 border-t border-forest/10 grid grid-cols-3 gap-4 max-w-lg">
                <div>
                  <div className="text-2xl font-bold text-forest">300–900</div>
                  <div className="text-xs text-charcoal-muted">KAAMSCORE Scale</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-forest">100%</div>
                  <div className="text-xs text-charcoal-muted">DigiLocker Proof</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-forest">12+</div>
                  <div className="text-xs text-charcoal-muted">Indian Languages</div>
                </div>
              </div>
            </div>

            {/* Right Column: Sovereign Credential Card Preview */}
            <div className="lg:col-span-5 flex justify-center">
              <SovereignCard worker={sampleWorker} />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Platform Architecture & Foundation Status */}
      <section id="architecture" className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <Badge variant="verified">Foundation Architecture v1.0</Badge>
          <h2 className="text-3xl font-bold tracking-tight text-forest">
            Engineered for Sovereign Scale & Hackathon Agility
          </h2>
          <p className="text-sm text-charcoal-muted">
            Strictly typed, decoupled, accessible, and ready for high-velocity feature delivery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Design System */}
          <div className="p-6 rounded-md border border-forest/15 bg-card shadow-sovereign-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xs bg-forest text-ivory">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-forest text-base">Sovereign Design System</h3>
                <span className="text-xs text-sage font-semibold">Active & Configured</span>
              </div>
            </div>
            <p className="text-xs text-charcoal-muted leading-relaxed">
              Calibrated palette with Deep Forest Green (<code className="text-forest font-mono">#153E35</code>),
              Warm Sand (<code className="text-sand-800 font-mono">#E8C999</code>), and Warm Ivory (<code className="text-forest font-mono">#F7F5F0</code>).
              1px micro-borders, editorial typography, and WCAG AAA contrast.
            </p>
          </div>

          {/* Card 2: Supabase SSR */}
          <div className="p-6 rounded-md border border-forest/15 bg-card shadow-sovereign-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xs bg-forest text-ivory">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-forest text-base">Supabase SSR Utilities</h3>
                <span className="text-xs text-sage font-semibold">Client, Server & Admin</span>
              </div>
            </div>
            <p className="text-xs text-charcoal-muted leading-relaxed">
              Standardized cookie handlers with Next.js 15 async cookies, automated token refresh
              middleware, and privileged admin client with row-level security enforcement.
            </p>
          </div>

          {/* Card 3: Gemini Extractor */}
          <div className="p-6 rounded-md border border-forest/15 bg-card shadow-sovereign-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xs bg-forest text-ivory">
                <Cpu className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-forest text-base">Gemini Intelligence</h3>
                <span className="text-xs text-sage font-semibold">Multilingual Voice AI</span>
              </div>
            </div>
            <p className="text-xs text-charcoal-muted leading-relaxed">
              Google Gen AI SDK integration (<code className="font-mono text-xs">gemini-2.5-flash</code>)
              parsing unstructured vernacular audio/text into NSDC-aligned skills and tools.
            </p>
          </div>

          {/* Card 4: Type Safety & Schemas */}
          <div className="p-6 rounded-md border border-forest/15 bg-card shadow-sovereign-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xs bg-forest text-ivory">
                <FileCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-forest text-base">TypeScript & Zod Schemas</h3>
                <span className="text-xs text-sage font-semibold">End-to-End Validation</span>
              </div>
            </div>
            <p className="text-xs text-charcoal-muted leading-relaxed">
              Shared models for Worker Identity, KAAMSCORE breakdown, Peer Endorsements,
              Indian mobile regex, and automated request body validation with typed errors.
            </p>
          </div>

          {/* Card 5: Auth Middleware */}
          <div className="p-6 rounded-md border border-forest/15 bg-card shadow-sovereign-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xs bg-forest text-ivory">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-forest text-base">Route Protection Middleware</h3>
                <span className="text-xs text-sage font-semibold">Edge-Compatible</span>
              </div>
            </div>
            <p className="text-xs text-charcoal-muted leading-relaxed">
              Protects sensitive worker dashboards, voice-onboarding flows, and employer portals
              with automatic session cookie propagation and login redirections.
            </p>
          </div>

          {/* Card 6: Global Error Protocol */}
          <div className="p-6 rounded-md border border-forest/15 bg-card shadow-sovereign-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xs bg-forest text-ivory">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-forest text-base">Global Error Protocol</h3>
                <span className="text-xs text-sage font-semibold">Operational Boundaries</span>
              </div>
            </div>
            <p className="text-xs text-charcoal-muted leading-relaxed">
              Centralized <code className="font-mono text-xs">handleApiError</code> formatter,
              custom AppError taxonomy, and accessible Client Error Boundary with reset capability.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Interactive Demonstrators: KAAMSCORE & Gemini Voice Extraction */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Demonstrator A: KAAMSCORE Meter */}
          <div
            id="kaamscore"
            className="lg:col-span-5 rounded-md border border-forest/15 bg-card p-6 shadow-sovereign-sm space-y-6"
          >
            <div className="space-y-1">
              <Badge variant="sovereign">Sovereign Trust Rating</Badge>
              <h3 className="text-xl font-bold text-forest">
                The KAAMSCORE™ Meter
              </h3>
              <p className="text-xs text-charcoal-muted">
                Multi-factor creditworthiness and skill reliability scoring system for informal workers.
              </p>
            </div>

            <div className="py-4 flex justify-center">
              <KaamScoreGauge score={842} size="lg" showBreakdown />
            </div>

            <div className="space-y-2 pt-2 border-t border-forest/10 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-forest/5">
                <span className="text-charcoal-muted">Spoken Audio Claim Proof</span>
                <span className="font-bold text-forest">145 / 150</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-forest/5">
                <span className="text-charcoal-muted">Gemini Domain AI Extraction</span>
                <span className="font-bold text-forest">142 / 150</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-forest/5">
                <span className="text-charcoal-muted">Peer Craft Endorsements</span>
                <span className="font-bold text-forest">195 / 200</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-forest/5">
                <span className="text-charcoal-muted">Completed Verified Tenures</span>
                <span className="font-bold text-forest">235 / 250</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-charcoal-muted">DigiLocker & Sovereign Attestation</span>
                <span className="font-bold text-forest">125 / 150</span>
              </div>
            </div>
          </div>

          {/* Demonstrator B: Gemini Voice Extraction Simulator */}
          <div
            id="voice-simulator"
            className="lg:col-span-7 rounded-md border border-forest/15 bg-card p-6 shadow-sovereign-sm space-y-6"
          >
            <div className="space-y-1">
              <Badge variant="verified">Live AI Skill Extraction</Badge>
              <h3 className="text-xl font-bold text-forest">
                Voice-First Self Declaration Engine
              </h3>
              <p className="text-xs text-charcoal-muted">
                Workers speak in Hinglish or regional vernacular; Gemini extracts structured craft metadata.
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-forest block">
                Spoken Worker Testimony Transcript:
              </label>
              <textarea
                value={transcriptInput}
                onChange={(e) => setTranscriptInput(e.target.value)}
                rows={3}
                className="w-full rounded-sm border border-forest/20 p-3 text-xs text-foreground focus:border-forest focus:outline-none focus:ring-2 focus:ring-sand/60 bg-paper-grid"
                placeholder="Speak or type your trade experience..."
              />

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-charcoal-muted">
                  Powered by <code className="font-mono text-forest">/api/ai/extract-skill</code>
                </span>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleTestExtraction}
                  disabled={isExtracting || transcriptInput.trim().length < 10}
                >
                  <Sparkles className="mr-1.5 h-3.5 w-3.5 text-sand" />
                  {isExtracting ? "Extracting with Gemini..." : "Run AI Extraction"}
                </Button>
              </div>
            </div>

            {/* Extracted Output Result */}
            {extractedData ? (
              <div className="rounded-xs bg-forest/5 p-4 border border-forest/15 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase tracking-wider text-forest">
                    Extracted Worker Skill Profile
                  </span>
                  <Badge variant="sand">
                    {(Number(extractedData.confidenceScore) * 100).toFixed(0)}% Confidence
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-charcoal-muted block text-[11px]">Primary Trade:</span>
                    <strong className="text-forest">{String(extractedData.primaryTrade)}</strong>
                  </div>
                  <div>
                    <span className="text-charcoal-muted block text-[11px]">Experience:</span>
                    <strong className="text-forest">{String(extractedData.yearsOfExperience)} Years</strong>
                  </div>
                </div>

                {Array.isArray(extractedData.secondarySkills) && (
                  <div>
                    <span className="text-charcoal-muted block text-[11px] mb-1">
                      Identified Specializations:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {extractedData.secondarySkills.map((s, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-xs bg-card border border-forest/10 text-forest text-[11px] font-medium"
                        >
                          {String(s)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-xs border border-dashed border-forest/20 p-6 text-center text-xs text-charcoal-muted">
                Click <strong>Run AI Extraction</strong> above to test the Gemini skill parsing pipeline.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. National Trade Classifications Ribbon */}
      <section id="categories" className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <Badge variant="outline">Institutional Taxonomies</Badge>
            <h2 className="text-2xl font-bold tracking-tight text-forest mt-1">
              Recognized Sovereign Trade Categories
            </h2>
          </div>
          <span className="text-xs text-charcoal-muted">
            Aligned with NSDC & National Skill Qualification Framework (NSQF)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[
            { title: "Carpentry & Joinery", count: "18,400+ Verified", icon: Hammer },
            { title: "Electrical & Solar", count: "24,800+ Verified", icon: Zap },
            { title: "Plumbing & Sanitation", count: "16,200+ Verified", icon: Wrench },
            { title: "Construction & Civil", count: "42,100+ Verified", icon: Layers },
          ].map((cat, i) => {
            const Icon = cat.icon;
            return (
              <div
                key={i}
                className="p-4 rounded-sm border border-forest/15 bg-card hover:border-forest/40 transition-colors shadow-xs space-y-2"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xs bg-sand/20 text-forest border border-sand/30">
                  <Icon className="h-4 w-4" />
                </div>
                <h4 className="font-bold text-forest text-sm">{cat.title}</h4>
                <p className="text-[11px] text-charcoal-muted">{cat.count}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
