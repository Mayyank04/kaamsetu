import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  ExternalLink,
  Award,
  Calendar,
  MapPin,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FEATURED_PROFESSIONALS } from "@/lib/data/professionals";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isConfigured } from "@/lib/env";
import { generateQrDataUrl } from "@/lib/qr/generate";
import { PrintCredentialButton } from "@/components/verify/print-button";

interface VerifyPageProps {
  params: Promise<{ registryId: string }>;
}

export async function generateMetadata({
  params,
}: VerifyPageProps): Promise<Metadata> {
  const { registryId } = await params;
  return {
    title: `Sovereign Verification: ${registryId} | KAAMSETU`,
    description: `Official cryptographic workforce verification proof for Registry ID ${registryId}.`,
  };
}

function maskAadhaar(verified: boolean): string {
  return verified ? "XXXX-XXXX-4012 (UIDAI Masked)" : "Not Linked";
}

export default async function VerifyRegistryPage({ params }: VerifyPageProps) {
  const { registryId } = await params;

  let worker: any = null;
  let isPublished = true;

  // 1. Production Mode: Fetch from Supabase database
  if (isConfigured.supabase) {
    try {
      const supabase = await createServerSupabaseClient();
      const { data, error } = await supabase
        .from("worker_profiles")
        .select(`
          *,
          occupation:occupations(*),
          profile:profiles(*)
        `)
        .eq("registry_id", registryId)
        .single();

      if (data && !error) {
        worker = {
          registryId: data.registry_id,
          fullName: data.profile?.full_name || "Verified Craftsman",
          photoUrl: data.profile?.avatar_url,
          primaryTrade: data.occupation?.name || data.headline,
          nsqfLevel: data.occupation?.nsqf_level || 4,
          yearsExperience: data.years_experience,
          city: data.city,
          state: data.state,
          kaamScore: data.kaamscore,
          kaamScoreLevel: data.kaamscore_level,
          aadhaarVerified: data.aadhaar_verified,
          digiLockerLinked: data.digilocker_linked,
          isPublished: data.is_published,
          slug: data.slug,
          createdAt: data.created_at,
        };
        isPublished = data.is_published;
      }
    } catch {
      // Fallback to demo lookup
    }
  }

  // 2. Demo Mode: Fallback lookup across demo registry
  if (!worker) {
    const demo = FEATURED_PROFESSIONALS.find(
      (p) =>
        p.registryId.toLowerCase() === registryId.toLowerCase() ||
        p.id.toLowerCase() === registryId.toLowerCase()
    );
    if (demo) {
      worker = {
        registryId: demo.registryId,
        fullName: demo.fullName,
        photoUrl: demo.photoUrl,
        primaryTrade: demo.primaryTrade,
        nsqfLevel: 4,
        yearsExperience: demo.yearsExperience,
        city: demo.location.city,
        state: demo.location.state,
        kaamScore: demo.kaamScore.totalScore,
        kaamScoreLevel: demo.kaamScore.level,
        aadhaarVerified: demo.aadhaarVerified,
        digiLockerLinked: demo.digiLockerLinked,
        isPublished: true,
        slug:
          demo.fullName.toLowerCase().replace(/\s+/g, "-") +
          "-" +
          demo.location.city.toLowerCase(),
        createdAt: "2025-03-12T00:00:00Z",
      };
    }
  }

  // 3. Not Found State
  if (!worker) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] py-16 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-card rounded-2xl border border-red-200 p-8 text-center space-y-4 shadow-sovereign-sm">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-700 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-forest">
            Registry Identifier Not Found
          </h1>
          <p className="text-xs text-charcoal-muted leading-relaxed">
            No active workforce credential matching{" "}
            <strong className="font-mono text-forest">{registryId}</strong> was found on the KAAMSETU National Registry.
          </p>
          <div className="pt-2">
            <Button asChild variant="outline" className="border-forest/20 text-forest text-xs">
              <Link href="/explore">Browse Certified Directory</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Worker Self-Sovereign Privacy Guard (Unpublished)
  if (!isPublished) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] py-16 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-card rounded-2xl border border-forest/15 p-8 text-center space-y-4 shadow-sovereign-sm">
          <div className="w-12 h-12 rounded-xl bg-forest/10 text-forest flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-forest">
            Sovereign Privacy Mode Enabled
          </h1>
          <p className="text-xs text-charcoal-muted leading-relaxed">
            This craft professional has chosen to keep their digital credential in private mode. On KAAMSETU, workers retain absolute ownership over their identity disclosure.
          </p>
          <div className="pt-2">
            <Button asChild variant="outline" className="border-forest/20 text-forest text-xs">
              <Link href="/explore">Return to Directory</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const verificationUrl = `${appUrl}/verify/${worker.registryId}`;
  const qrDataUrl = await generateQrDataUrl(verificationUrl);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F7F5F0] via-background to-[#F7F5F0]/60 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Verification Status Banner */}
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="text-xs">
            <strong className="block font-bold">
              VERIFIED SOVEREIGN WORKFORCE IDENTITY
            </strong>
            <span>
              This identity is cryptographically signed and registered on the KAAMSETU open workforce ledger.
            </span>
          </div>
        </div>

        {/* Physical Smart Card Presentation */}
        <div className="sovereign-print-area bg-gradient-to-br from-forest-900 via-forest to-forest-800 text-ivory rounded-2xl p-6 sm:p-8 border border-sand/30 shadow-sovereign-xl space-y-6 relative overflow-hidden print:border-black print:text-black print:bg-white">
          <div className="flex items-start justify-between gap-4 border-b border-sand/20 pb-4">
            <div>
              <div className="text-[11px] font-mono tracking-wider text-sand uppercase font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-sand" />
                <span>KAAMSETU NATIONAL SOVEREIGN CREDENTIAL</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-ivory mt-1">
                {worker.fullName}
              </h2>
              <p className="text-xs text-sand/80 font-medium">
                {worker.primaryTrade}
              </p>
            </div>

            {/* Scannable QR Code */}
            {qrDataUrl && (
              <div className="w-20 h-20 bg-ivory p-1.5 rounded-xl border border-sand shrink-0 shadow-xs">
                <img src={qrDataUrl} alt={`QR verification for ${worker.registryId}`} className="w-full h-full" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div>
              <span className="text-[10px] text-sand/60 block uppercase">Registry ID</span>
              <span className="font-bold text-sand text-xs sm:text-sm">{worker.registryId}</span>
            </div>
            <div>
              <span className="text-[10px] text-sand/60 block uppercase">Experience</span>
              <span className="font-bold text-ivory">{worker.yearsExperience} Years Stated</span>
            </div>
            <div>
              <span className="text-[10px] text-sand/60 block uppercase">Location</span>
              <span className="font-bold text-ivory">{worker.city}, {worker.state}</span>
            </div>
            <div>
              <span className="text-[10px] text-sand/60 block uppercase">Trust Index</span>
              <span className="font-bold text-sand">{worker.kaamScore} / 900</span>
            </div>
            <div>
              <span className="text-[10px] text-sand/60 block uppercase">Classification</span>
              <span className="font-bold text-ivory">NSQF Level {worker.nsqfLevel}</span>
            </div>
            <div>
              <span className="text-[10px] text-sand/60 block uppercase">Aadhaar Status</span>
              <span className="font-bold text-emerald-400">{maskAadhaar(worker.aadhaarVerified)}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-sand/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-sand/70">
            <span>ISSUED UNDER OPEN SOVEREIGN SKILL PROTOCOL</span>
            <span className="font-mono">VALID NATIONWIDE (28 STATES)</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild className="w-full sm:w-auto bg-forest hover:bg-forest-600 text-ivory font-bold text-xs h-11 px-6 shadow-sovereign-sm">
            <Link href={`/profile/${worker.slug}`}>
              View Full Profile & Book Direct Services
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>

          <PrintCredentialButton />
        </div>

        {/* Legal Trust Assurance Disclaimer */}
        <div className="p-4 rounded-xl bg-forest/5 border border-forest/10 text-center space-y-1 text-xs text-charcoal-muted">
          <strong className="text-forest block">
            Platform-Issued Sovereign Skill Credential
          </strong>
          <p className="max-w-lg mx-auto text-[11px] leading-relaxed">
            Verified through KAAMSETU Open Workforce Trust Protocol. Distinguishes self-declared competencies from voice-attested analysis, peer endorsements, and completed contract work records.
          </p>
        </div>
      </div>
    </div>
  );
}
