import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getWorkerDashboardData } from "@/lib/supabase/db/dashboard";
import { PublicProfileContainer } from "@/components/profile/public-profile-container";
import { ShieldCheck, Lock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ProfilePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProfilePageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getWorkerDashboardData(slug);

  if (!data?.profile) {
    return {
      title: "Worker Profile | KAAMSETU",
    };
  }

  return {
    title: `${data.profile.fullName} | ${data.profile.occupation} | KAAMSETU Sovereign Trust`,
    description: `${data.profile.fullName} is a verified ${data.profile.occupation} in ${data.profile.city}, ${data.profile.state} with ${data.profile.yearsExperience} years of experience and a KAAMSCORE™ of ${data.profile.kaamScore.totalScore}.`,
  };
}

export default async function PublicProfilePage({ params }: ProfilePageProps) {
  const { slug } = await params;
  const data = await getWorkerDashboardData(slug);

  if (!data?.profile) {
    notFound();
  }

  // Self-Sovereignty Check: If worker unpublished their profile, hide it from public view
  if (!data.profile.isPublished) {
    return (
      <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-md bg-card border border-forest/15 shadow-sovereign-md text-center space-y-4">
          <div className="w-12 h-12 rounded-sm bg-forest/10 border border-forest/20 flex items-center justify-center text-forest mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-forest">
            Profile Under Sovereign Privacy Mode
          </h2>
          <p className="text-xs text-charcoal-muted leading-relaxed">
            This craft professional has chosen to keep their digital credential in private draft mode. On KAAMSETU, workers retain absolute ownership and control over their visibility.
          </p>
          <div className="pt-2">
            <Button asChild variant="outline" className="text-xs border-forest/20 text-forest">
              <Link href="/explore">
                Explore Available Craftsmen
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-ivory-50 via-background to-ivory-100/30">
      <PublicProfileContainer data={data} />
    </div>
  );
}
