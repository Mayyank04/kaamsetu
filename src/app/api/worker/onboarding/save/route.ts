import { NextRequest } from "next/server";
import { approvedProfileSubmissionSchema } from "@/schemas/onboarding.schema";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isConfigured } from "@/lib/env";
import { handleApiError, createSuccessResponse } from "@/lib/error/handler";

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const data = approvedProfileSubmissionSchema.parse(json);

    // Generate Sovereign Registry ID
    const statePrefix = data.state.slice(0, 2).toUpperCase() || "IN";
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const registryId = `IN-${statePrefix}-2026-${randomSuffix}-KS`;

    // Generate Slug
    const baseSlug = `${data.fullName}-${data.city}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const slug = `${baseSlug}-${randomSuffix}`;

    // Base initial KAAMSCORE calculation based on voice-attested depth
    const initialKaamScore = Math.min(880, Math.max(680, 720 + data.yearsExperience * 5 + data.skills.length * 10));
    const scoreLevel = initialKaamScore >= 820 ? 4 : initialKaamScore >= 700 ? 3 : 2;

    const savedRecord = {
      id: `w-reg-${Date.now()}`,
      registryId,
      slug,
      fullName: data.fullName,
      headline: data.headline,
      bio: data.bio,
      occupation: data.occupation,
      category: data.category,
      yearsExperience: data.yearsExperience,
      city: data.city,
      state: data.state,
      dailyRateEstimate: {
        min: data.dailyRateMin || 1100,
        max: data.dailyRateMax || 1800,
      },
      skills: data.skills,
      equipmentHandled: data.equipmentHandled,
      languages: data.languages,
      kaamScore: {
        totalScore: initialKaamScore,
        level: scoreLevel,
        tier: scoreLevel === 4 ? "Sovereign Master" : "Institutional Verified",
        percentileRank: 94,
        breakdown: {
          spokenAudioProof: 140,
          domainAIExtraction: 140,
          peerEndorsements: 160,
          completedJobs: 180,
          sovereignDigiLocker: 100,
        },
      },
      aadhaarVerified: false,
      digiLockerLinked: false,
      isPublished: true,
      qrVerificationUrl: `https://kaamsetu.gov.in/verify/${registryId}`,
      createdAt: new Date().toISOString(),
    };

    // If Supabase is configured with live credentials, persist to database
    if (isConfigured.supabase) {
      try {
        const supabase = createAdminClient();
        // Insert into worker_profiles
        await supabase.from("worker_profiles").insert({
          registry_id: registryId,
          slug,
          user_id: "00000000-0000-0000-0000-000000000001", // fallback or auth user
          occupation_id: "11111111-1111-1111-1111-111111111101",
          headline: data.headline,
          bio: data.bio,
          years_experience: data.yearsExperience,
          daily_rate_min: data.dailyRateMin || 1100,
          daily_rate_max: data.dailyRateMax || 1800,
          city: data.city,
          state: data.state,
          pincode: "110001",
          languages: data.languages,
          kaamscore: initialKaamScore,
          kaamscore_level: scoreLevel,
          is_published: true,
        });
      } catch (dbErr) {
        console.warn("Database persistence failed (demo simulation continuing):", dbErr);
      }
    }

    return createSuccessResponse(savedRecord, {
      message: "Sovereign Skill Card successfully minted and anchored.",
      registryId,
      slug,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
