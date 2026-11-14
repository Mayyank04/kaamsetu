import { NextRequest } from "next/server";
import crypto from "crypto";
import { requireWorker } from "@/lib/auth/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isConfigured } from "@/lib/env";
import { handleApiError, createSuccessResponse } from "@/lib/error/handler";
import { logger } from "@/lib/security/privacy-logger";

export async function GET(req: NextRequest) {
  try {
    const user = await requireWorker();
    const searchParams = req.nextUrl.searchParams;
    const format = (searchParams.get("format") || "json").toLowerCase();

    if (format !== "json" && format !== "pdf" && format !== "csv") {
      return handleApiError(new Error("Invalid format. Supported: 'json', 'pdf', 'csv'"));
    }

    if (!isConfigured.supabase) {
      const mockDossier = {
        workerProfile: {
          fullName: user.fullName,
          phoneMasked: "+91 ••••• ••201",
          trade: "Master Teak Wood Carpenter",
          nsqfLevel: 4,
          kaamscore: 740,
          kaamscoreLevel: 3,
          city: "Guwahati",
          state: "Assam",
          isPublished: true,
        },
        skills: [
          { name: "Precision Mitre Cut", level: "advanced" },
          { name: "Modular Cabinet Fitting", level: "master" },
        ],
        workRecordsCount: 14,
        confirmedReviewsCount: 8,
        averageRating: 4.9,
        exportMetadata: {
          exportedAt: new Date().toISOString(),
          format,
          issuer: "KAAMSETU Sovereign Skill Trust Infrastructure",
          standard: "RFC 8785 Canonical JSON & Indian DPDP Act 2023 Sec 12",
        },
      };

      const cryptoHash = crypto
        .createHash("sha256")
        .update(JSON.stringify(mockDossier))
        .digest("hex");

      return createSuccessResponse({
        exportFormat: format,
        cryptographicHash: cryptoHash,
        dossier: mockDossier,
      });
    }

    const supabase = await createServerSupabaseClient();

    // 1. Fetch complete worker profile with relations
    const { data: wp, error: wpError } = await supabase
      .from("worker_profiles")
      .select(`
        id,
        registry_id,
        slug,
        headline,
        bio,
        years_experience,
        city,
        state,
        pincode,
        kaamscore,
        kaamscore_level,
        is_published,
        created_at,
        occupations (title, nsqf_level, code)
      `)
      .eq("user_id", user.id)
      .single();

    if (wpError || !wp) {
      return handleApiError(new Error("Worker profile not found."));
    }

    // 2. Fetch skills
    const { data: skills } = await supabase
      .from("worker_skills")
      .select("skill_id, proficiency_level, verified, skills(name, category)")
      .eq("worker_profile_id", wp.id);

    // 3. Fetch verified work records
    const { data: workRecords } = await supabase
      .from("work_records")
      .select("project_title, customer_name, verification_source, verification_hash, completed_at")
      .eq("worker_profile_id", wp.id);

    // 4. Fetch customer reviews
    const { data: reviews } = await supabase
      .from("reviews")
      .select("rating, feedback, contractor_signed, created_at")
      .eq("worker_profile_id", wp.id);

    const dossier = {
      workerProfile: {
        registryId: wp.registry_id,
        fullName: user.fullName,
        phoneMasked: user.phone ? `${user.phone.slice(0, 3)} ••••• ••${user.phone.slice(-3)}` : "Masked",
        headline: wp.headline,
        bio: wp.bio,
        yearsExperience: wp.years_experience,
        occupation: wp.occupations,
        kaamscore: wp.kaamscore,
        kaamscoreLevel: wp.kaamscore_level,
        city: wp.city,
        state: wp.state,
        pincode: wp.pincode,
        memberSince: wp.created_at,
      },
      skills: skills || [],
      workRecords: workRecords || [],
      reviews: reviews || [],
      exportMetadata: {
        exportedAt: new Date().toISOString(),
        format,
        protocol: "KAAMSETU Sovereign Trust Protocol v1.0",
        dpdpCompliance: "Section 12 Portable Credential Right",
      },
    };

    const cryptoHash = crypto
      .createHash("sha256")
      .update(JSON.stringify(dossier))
      .digest("hex");

    // 5. Insert audit log
    await supabase.from("worker_identity_exports").insert({
      worker_profile_id: wp.id,
      export_format: format as any,
      cryptographic_hash: cryptoHash,
      exported_by: user.id,
    });

    logger.info("Worker exported portable identity dossier", {
      workerProfileId: wp.id,
      format,
    });

    return createSuccessResponse({
      exportFormat: format,
      cryptographicHash: cryptoHash,
      dossier,
    });
  } catch (err: any) {
    return handleApiError(err);
  }
}
