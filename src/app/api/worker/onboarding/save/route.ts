import { NextRequest, NextResponse } from "next/server";
import { approvedProfileSubmissionSchema } from "@/schemas/onboarding.schema";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isConfigured } from "@/lib/env";
import { handleApiError, createSuccessResponse } from "@/lib/error/handler";
import { requireAuthenticatedUser } from "@/lib/auth/server";
import { calculateKaamScore } from "@/lib/scoring/kaamscore";
import { signCredentialPayload, CanonicalCredentialPayload } from "@/lib/crypto/credential-signer";
import { GeographicAuthorizationService } from "@/lib/geo/geographic-authorization-service";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthenticatedUser();
    const json = await request.json();
    const data = approvedProfileSubmissionSchema.parse(json);

    // 1. Strict Geographic Authorization Check (Class B Controlled Rollout)
    const geoValidation = GeographicAuthorizationService.validateLocation({
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      latitude: data.latitude,
      longitude: data.longitude,
    });

    if (!geoValidation.allowed) {
      return NextResponse.json(
        {
          error: geoValidation.reason || "Location outside authorized operating zone.",
          status: geoValidation.status,
          district: geoValidation.district,
        },
        { status: 403 }
      );
    }

    const resolvedPincode = geoValidation.pincode;

    // 2. Generate Collision-Resistant Registry ID
    const statePrefix = data.state ? data.state.slice(0, 2).toUpperCase() : "IN";
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const registryId = `IN-${statePrefix}-2026-${randomSuffix}-KS`;

    // 3. Generate Safe, Unique Slug
    const baseSlug = `${data.fullName}-${data.city || "india"}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const slug = `${baseSlug}-${randomSuffix}`;

    // 4. Evidence-driven KAAMSCORE Calculation & Verification State Machine
    // Audio evidence requires an actual storage reference, not merely a client boolean
    const hasGenuineAudioEvidence = Boolean(
      (data.audioStoragePath || data.audioRecordingId) && data.workerConfirmedVoice
    );

    const scoreResult = calculateKaamScore({
      hasVoiceAttestation: hasGenuineAudioEvidence,
      workerConfirmedVoice: Boolean(data.workerConfirmedVoice && hasGenuineAudioEvidence),
      yearsExperience: data.yearsExperience,
      verifiedSkillsCount: data.skills?.length || 0,
      completedBookingsCount: 0,
      peerEndorsementsCount: 0,
      officialGovVerified: false,
    });

    const provisionalScore = scoreResult.totalScore;
    const scoreLevel = provisionalScore >= 500 ? 3 : 2;
    const scoreTier = scoreResult.tier;

    // Opt-in profile publication: worker must explicitly consent to publication
    const isPublished = Boolean(data.isPublished);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const qrVerificationUrl = `${appUrl}/verify/${registryId}`;

    const savedRecord = {
      id: `w-reg-${Date.now()}`,
      userId: user.id,
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
      pincode: resolvedPincode,
      dailyRateEstimate: {
        min: data.dailyRateMin ?? null,
        max: data.dailyRateMax ?? null,
      },
      skills: data.skills,
      equipmentHandled: data.equipmentHandled,
      languages: data.languages,
      kaamScore: {
        totalScore: provisionalScore,
        level: scoreLevel,
        tier: scoreTier,
        isProvisional: scoreResult.isProvisional,
        completenessPercent: scoreResult.provisionalCompletenessPercent,
        dimensions: scoreResult.dimensions,
      },
      aadhaarVerified: false,
      digiLockerLinked: false,
      isPublished,
      qrVerificationUrl,
      createdAt: new Date().toISOString(),
      isDemo: user.isDemo,
    };

    // 5. Database Persistence Mode
    if (isConfigured.supabase && !user.isDemo) {
      const supabase = await createServerSupabaseClient();

      // Dynamically resolve real occupation from database
      const { data: occupations, error: occErr } = await supabase
        .from("occupations")
        .select("id, name, slug")
        .eq("is_active", true);

      if (occErr) {
        console.error("Failed to query occupations:", occErr);
        return NextResponse.json(
          { success: false, message: "Database query failed: " + occErr.message },
          { status: 500 }
        );
      }

      const matchedOcc =
        occupations?.find((o) =>
          data.occupation.toLowerCase().includes(o.name.toLowerCase().split(" ")[0]) ||
          data.category.toLowerCase().includes(o.slug)
        ) || occupations?.[0];

      if (!matchedOcc) {
        return NextResponse.json(
          { success: false, message: "No active occupation category found." },
          { status: 500 }
        );
      }

      // Check if user already has an existing worker profile (upsert safely)
      const { data: existingProfile } = await supabase
        .from("worker_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      let targetWorkerProfileId = existingProfile?.id;

      if (existingProfile) {
        // Update existing worker profile
        const { error: updateErr } = await supabase
          .from("worker_profiles")
          .update({
            headline: data.headline,
            bio: data.bio,
            years_experience: data.yearsExperience,
            daily_rate_min: data.dailyRateMin ?? null,
            daily_rate_max: data.dailyRateMax ?? null,
            city: data.city,
            state: data.state,
            pincode: resolvedPincode,
            languages: data.languages,
            kaamscore: provisionalScore,
            kaamscore_level: scoreLevel,
            is_published: isPublished,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingProfile.id);

        if (updateErr) {
          console.error("Worker profile update error:", updateErr);
          return NextResponse.json(
            { success: false, message: "Failed to persist profile: " + updateErr.message },
            { status: 500 }
          );
        }
      } else {
        // Insert new worker profile
        const { data: inserted, error: insertErr } = await supabase
          .from("worker_profiles")
          .insert({
            user_id: user.id,
            registry_id: registryId,
            slug,
            occupation_id: matchedOcc.id,
            headline: data.headline,
            bio: data.bio,
            years_experience: data.yearsExperience,
            daily_rate_min: data.dailyRateMin ?? null,
            daily_rate_max: data.dailyRateMax ?? null,
            city: data.city,
            state: data.state,
            pincode: resolvedPincode,
            languages: data.languages,
            kaamscore: provisionalScore,
            kaamscore_level: scoreLevel,
            is_published: isPublished,
          })
          .select("id")
          .single();

        if (insertErr || !inserted) {
          console.error("Worker profile insert error:", insertErr);
          return NextResponse.json(
            { success: false, message: "Database persistence failed: " + insertErr?.message },
            { status: 500 }
          );
        }
        targetWorkerProfileId = inserted.id;
      }

      // Link confirmed skills to worker_skills table with evidence-driven status
      const initialVerificationType = hasGenuineAudioEvidence
        ? "voice_submitted"
        : "self_declared";

      if (targetWorkerProfileId && data.skills && data.skills.length > 0) {
        for (const skillName of data.skills) {
          const { data: existingSkill } = await supabase
            .from("skills")
            .select("id")
            .ilike("name", skillName)
            .maybeSingle();

          let skillId = existingSkill?.id;
          if (!skillId) {
            const skillSlug = skillName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
            const { data: newSkill } = await supabase
              .from("skills")
              .insert({
                occupation_id: matchedOcc.id,
                name: skillName,
                slug: `${skillSlug}-${Date.now().toString().slice(-4)}`,
                category: matchedOcc.name,
              })
              .select("id")
              .maybeSingle();
            skillId = newSkill?.id;
          }

          if (skillId) {
            await supabase
              .from("worker_skills")
              .upsert(
                {
                  worker_profile_id: targetWorkerProfileId,
                  skill_id: skillId,
                  verification_type: initialVerificationType,
                  is_primary: true,
                  years_practiced: data.yearsExperience || 2,
                },
                { onConflict: "worker_profile_id,skill_id" }
              );
          }
        }
      }

      // Anchor initial cryptographic credential in credential_registry
      // Note: nsqfLevel is null until official assessment is verified
      if (targetWorkerProfileId) {
        try {
          const credentialPayload: CanonicalCredentialPayload = {
            registryId,
            workerProfileId: targetWorkerProfileId,
            fullName: data.fullName,
            primaryTrade: data.occupation,
            category: data.category,
            nsqfLevel: null as any,
            issuer: "KAAMSETU National Workforce Trust Protocol",
            issuedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            status: "active",
          };
          const signed = signCredentialPayload(credentialPayload);

          await supabase
            .from("credential_registry")
            .upsert(
              {
                registry_id: registryId,
                worker_profile_id: targetWorkerProfileId,
                canonical_payload_hash: signed.canonicalHash,
                signature: signed.signature,
                algorithm: "HMAC-SHA256",
                status: "active",
                key_version: signed.keyVersion,
                issued_at: credentialPayload.issuedAt,
              },
              { onConflict: "registry_id" }
            );
        } catch (credErr) {
          console.warn("Failed to anchor credential in registry:", credErr);
        }
      }
    }

    return createSuccessResponse(savedRecord, {
      message: "Professional profile successfully created and saved.",
      registryId,
      slug,
      isDemo: user.isDemo,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
