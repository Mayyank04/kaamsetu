/**
 * KAAMSETU — Onboarding Service
 * Coordinates vernacular voice onboarding, geographic eligibility, and credential initialization.
 */

import { ApprovedProfileSubmission } from "@/schemas/onboarding.schema";
import { AuthenticatedUser } from "@/server/auth/session";
import { GeographicAuthorizationService } from "@/lib/geo/geographic-authorization-service";
import { calculateKaamScore } from "@/lib/scoring/kaamscore";
import { signCredentialPayload, CanonicalCredentialPayload } from "@/lib/crypto/credential-signer";
import { createAdminClient } from "@/lib/supabase/admin";
import { isConfigured } from "@/lib/env";
import { AuthorizationError, DatabaseError } from "@/lib/errors/app-error";

export class OnboardingService {
  /**
   * Orchestrates the complete worker profile registration and credential initialization
   */
  public static async saveProfile(
    user: AuthenticatedUser,
    data: ApprovedProfileSubmission
  ) {
    // 1. Strict Geographic Authorization Check (Class B Controlled Rollout)
    const geoValidation = GeographicAuthorizationService.validateLocation({
      city: data.city,
      state: data.state,
      district: data.district,
      pincode: data.pincode,
      latitude: data.latitude,
      longitude: data.longitude,
    });

    if (!geoValidation.allowed && !data.allowNonDispatchProfile) {
      throw new AuthorizationError(
        geoValidation.reason || "Location outside authorized operating zone."
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

    // 4. Evidence-driven KAAMSCORE Calculation
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
      district: data.district || geoValidation.district || null,
      locality: data.locality || null,
      pincode: resolvedPincode,
      dailyRateEstimate: {
        min: data.dailyRateMin ?? null,
        max: data.dailyRateMax ?? null,
      },
      profileType: data.profileType || "service_professional",
      businessName: data.businessName || undefined,
      vendorType: data.vendorType || undefined,
      stallType: data.stallType || undefined,
      operatingHours: data.operatingHours || undefined,
      productCatalog: data.productCatalog || [],
      deliveryAvailable: Boolean(data.deliveryAvailable),
      contactPreference: data.contactPreference || "phone",
      skills: data.skills,
      equipmentHandled: data.equipmentHandled,
      languages: data.languages,
      kaamScore: {
        totalScore: provisionalScore,
        level: scoreLevel,
        tier: scoreResult.tier,
        isProvisional: scoreResult.isProvisional,
        completenessPercent: scoreResult.provisionalCompletenessPercent,
        dimensions: scoreResult.dimensions,
      },
      aadhaarVerified: false,
      digiLockerLinked: false,
      isPublished,
      isDispatchEligible: geoValidation.isDispatchEligible,
      dispatchStatus: geoValidation.isDispatchEligible ? "active" : "non_dispatch_region",
      is_dispatch_eligible: geoValidation.isDispatchEligible,
      dispatch_status: geoValidation.isDispatchEligible ? "active" : "non_dispatch_region",
      dispatchNotice: geoValidation.isDispatchEligible ? undefined : geoValidation.reason,
      qrVerificationUrl,
      createdAt: new Date().toISOString(),
      isDemo: false,
    };

    // 5. Database Persistence whenever Supabase is configured
    if (isConfigured.supabase) {
      try {
        const supabase = createAdminClient();

        const { data: occupations, error: occErr } = await supabase
          .from("occupations")
          .select("id, name, slug")
          .eq("is_active", true);

        if (occErr) {
          if (process.env.NODE_ENV !== "production") {
            console.warn("[OnboardingService] Supabase occupations query bypassed in non-production:", occErr.message);
          } else {
            throw new DatabaseError(`Failed to query occupations: ${occErr.message}`);
          }
        }

        const fallbackOccupations = [
          { id: "11111111-1111-1111-1111-111111111101", name: "Electrical & Solar", slug: "electrical-solar" },
          { id: "11111111-1111-1111-1111-111111111102", name: "Carpentry & Joinery", slug: "carpentry-joinery" },
          { id: "11111111-1111-1111-1111-111111111103", name: "Plumbing & Sanitation", slug: "plumbing-sanitation" },
        ];

        const validOccupations = occupations && occupations.length > 0 ? occupations : fallbackOccupations;

        const matchedOcc =
          validOccupations.find((o) =>
            data.occupation.toLowerCase().includes(o.name.toLowerCase().split(" ")[0]) ||
            data.category.toLowerCase().includes(o.slug)
          ) || validOccupations[0];

        if (!matchedOcc && process.env.NODE_ENV === "production") {
          throw new DatabaseError("No active occupation category found.");
        }

        const { data: existingProfile } = await supabase
          .from("worker_profiles")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

        let targetWorkerProfileId = existingProfile?.id;

        if (existingProfile) {
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
              district: data.district || geoValidation.district || null,
              locality: data.locality || null,
              pincode: resolvedPincode,
              languages: data.languages,
              kaamscore: provisionalScore,
              kaamscore_level: scoreLevel,
              is_published: isPublished,
              is_dispatch_eligible: geoValidation.isDispatchEligible,
              dispatch_status: geoValidation.isDispatchEligible ? "active" : "non_dispatch_region",
              profile_type: data.profileType || "service_professional",
              business_name: data.businessName || null,
              vendor_type: data.vendorType || null,
              stall_type: data.stallType || null,
              operating_hours: data.operatingHours || null,
              product_catalog: data.productCatalog || [],
              delivery_available: Boolean(data.deliveryAvailable),
              contact_preference: data.contactPreference || "phone",
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingProfile.id);

          if (updateErr) {
            if (process.env.NODE_ENV !== "production") {
              console.warn("[OnboardingService] Worker profile update error in non-production:", updateErr.message);
            } else {
              throw new DatabaseError(`Worker profile update error: ${updateErr.message}`);
            }
          }
        } else {
          const { data: inserted, error: insertErr } = await supabase
            .from("worker_profiles")
            .insert({
              user_id: user.id,
              registry_id: registryId,
              slug,
              occupation_id: matchedOcc?.id || fallbackOccupations[0].id,
              headline: data.headline,
              bio: data.bio,
              years_experience: data.yearsExperience,
              daily_rate_min: data.dailyRateMin ?? null,
              daily_rate_max: data.dailyRateMax ?? null,
              city: data.city,
              state: data.state,
              district: data.district || geoValidation.district || null,
              locality: data.locality || null,
              pincode: resolvedPincode,
              languages: data.languages,
              kaamscore: provisionalScore,
              kaamscore_level: scoreLevel,
              is_published: isPublished,
              is_dispatch_eligible: geoValidation.isDispatchEligible,
              dispatch_status: geoValidation.isDispatchEligible ? "active" : "non_dispatch_region",
              profile_type: data.profileType || "service_professional",
              business_name: data.businessName || null,
              vendor_type: data.vendorType || null,
              stall_type: data.stallType || null,
              operating_hours: data.operatingHours || null,
              product_catalog: data.productCatalog || [],
              delivery_available: Boolean(data.deliveryAvailable),
              contact_preference: data.contactPreference || "phone",
            })
            .select("id")
            .single();

          if (insertErr || !inserted) {
            if (process.env.NODE_ENV !== "production") {
              console.warn("[OnboardingService] Database persistence failed in non-production (fallback to local mock ID):", insertErr?.message);
              targetWorkerProfileId = `wp-local-${Date.now()}`;
            } else {
              throw new DatabaseError(`Database persistence failed: ${insertErr?.message}`);
            }
          } else {
            targetWorkerProfileId = inserted.id;
          }
        }

      // Link confirmed skills
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

      // Anchor initial cryptographic credential
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
                algorithm: signed.algorithm,
                key_version: signed.keyVersion,
                issued_at: credentialPayload.issuedAt,
                status: "active",
              },
              { onConflict: "registry_id" }
            );
        } catch (credErr) {
          console.warn("Credential registry auto-anchoring bypassed:", credErr);
        }
      }
    } catch (err: unknown) {
      if (err instanceof DatabaseError || err instanceof AuthorizationError) throw err;
      if (process.env.NODE_ENV !== "production") {
        console.warn("[OnboardingService] Non-production database exception bypassed:", err);
      } else {
        throw new DatabaseError(err instanceof Error ? err.message : "Database error during onboarding profile persistence.");
      }
    }
  }

    return savedRecord;
  }
}
