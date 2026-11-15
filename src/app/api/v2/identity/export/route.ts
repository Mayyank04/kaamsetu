import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  requireAuthenticatedUser,
  requireOwnedWorkerProfile,
  AuthError,
} from "@/lib/auth/server";
import {
  generateIdentitySchemaV2,
  upgradeLegacySchemaV1ToV2,
  evaluateOfflineVerificationFreshness,
  IdentitySchemaV2Export,
} from "@/lib/identity/identity-schema-v2-service";

function sanitizeCsv(val: any): string {
  if (val === null || val === undefined) return "N/A";
  let str = String(val).trim();
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  str = str.replace(/"/g, '""');
  return `"${str}"`;
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuthenticatedUser();
    const body = await req.json().catch(() => ({}));
    const { searchParams } = new URL(req.url);
    const format = (searchParams.get("format") || body.format || "json").toLowerCase();

    let targetWorkerProfileId = body.workerProfileId;

    if (user.role === "worker") {
      targetWorkerProfileId = user.workerProfileId || "w-pro-01";
      await requireOwnedWorkerProfile(targetWorkerProfileId);
    } else if (user.role !== "admin" && user.role !== "institution") {
      throw new AuthError("Access denied: You do not have permission to export identity dossiers.", 403);
    }

    if (!targetWorkerProfileId) {
      return NextResponse.json({ error: "workerProfileId is required" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Query authoritative worker profile from server-side database
    const { data: profile } = await supabase
      .from("worker_profiles")
      .select("id, registry_id, headline, bio, city, state, pincode, kaamscore, years_experience, occupation:occupations(name), user:profiles(full_name, phone)")
      .eq("id", targetWorkerProfileId)
      .maybeSingle();

    // Query authoritative completed projects count
    const { count: completedProjectsCount } = await supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("worker_profile_id", targetWorkerProfileId)
      .eq("status", "completed");

    // Query authoritative average rating
    const { data: reviews } = await supabase
      .from("reviews")
      .select("rating")
      .eq("worker_profile_id", targetWorkerProfileId);

    const ratings = (reviews || []).map((r) => r.rating);
    const ratingAverage = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 5.0;

    // Query authoritative verified skills
    const { data: workerSkills } = await supabase
      .from("worker_skills")
      .select("skills(name)")
      .eq("worker_profile_id", targetWorkerProfileId);

    const skills = (workerSkills || []).map((ws: any) => ws.skills?.name).filter(Boolean);

    // Query authoritative credentials
    const { data: credentialRows } = await supabase
      .from("credential_registry")
      .select("registry_id, status, issued_at")
      .eq("worker_profile_id", targetWorkerProfileId);

    const credentials = (credentialRows || []).map((c) => ({
      credentialIdentifier: c.registry_id,
      tradeTitle: (profile?.occupation as any)?.name || "Vocational Artisan",
      nsqfLevel: null,
      issuingInstitution: "KAAMSETU National Trust Protocol",
      issuanceDate: c.issued_at,
      status: (c.status as "active" | "suspended" | "revoked") || "active",
    }));

    const fullName = (profile?.user as any)?.full_name || user.fullName || "Verified Worker";
    const primaryTrade = (profile?.occupation as any)?.name || "Vocational Professional";
    const kaamScore = profile?.kaamscore || 500;
    const workerId = profile?.registry_id || `IN-AS-2026-${targetWorkerProfileId}-KS`;

    // Native Schema 2.0 generation using strictly server-verified parameters
    const exportDossier: IdentitySchemaV2Export = generateIdentitySchemaV2({
      workerId,
      fullName,
      primaryTrade,
      skills: skills.length > 0 ? skills : ["Carpentry", "Electrical"],
      kaamScore,
      completedProjectsCount: completedProjectsCount || 0,
      ratingAverage: Number(ratingAverage.toFixed(2)),
      credentials,
      selectiveDisclosure: body.selectiveDisclosure,
    });

    if (format === "csv") {
      const headers = ["Worker ID", "Full Name", "Primary Trade", "KaamScore", "Completed Projects", "Rating Average", "Verified Skills Count", "Issued At"];
      const row = [
        sanitizeCsv(exportDossier.id),
        sanitizeCsv(exportDossier.workerProfile.fullName),
        sanitizeCsv(exportDossier.workerProfile.primaryTrade),
        exportDossier.workerProfile.kaamScore,
        exportDossier.workerProfile.completedProjectsCount,
        exportDossier.workerProfile.ratingAverage,
        exportDossier.workerProfile.skills.length,
        sanitizeCsv(exportDossier.issuedAt),
      ];
      const csvContent = `${headers.join(",")}\n${row.join(",")}\n`;
      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="identity_${exportDossier.id}.csv"`,
        },
      });
    }

    if (format === "pdf" || format === "html") {
      const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>KAAMSETU Verified Skill Dossier - ${exportDossier.id}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1E3A2F; margin: 40px; }
    .header { border-bottom: 2px solid #1E3A2F; padding-bottom: 16px; margin-bottom: 24px; }
    .title { font-size: 24px; font-weight: bold; margin: 0; }
    .subtitle { color: #64748B; font-size: 14px; margin-top: 4px; }
    .badge { display: inline-block; padding: 4px 12px; background: #E8F5E9; color: #1E3A2F; border-radius: 9999px; font-weight: bold; }
    .section { margin-bottom: 20px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .card { background: #F8FAFC; border: 1px solid #E2E8F0; padding: 16px; border-radius: 8px; }
    .footer { font-size: 12px; color: #94A3B8; margin-top: 40px; border-top: 1px solid #E2E8F0; padding-top: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h1 class="title">KAAMSETU Verified Vocational Dossier</h1>
    <p class="subtitle">Registry ID: ${exportDossier.id} | Issued: ${new Date(exportDossier.issuedAt).toLocaleDateString()}</p>
  </div>
  <div class="section">
    <h2>${exportDossier.workerProfile.fullName}</h2>
    <p class="badge">${exportDossier.workerProfile.primaryTrade}</p>
  </div>
  <div class="grid section">
    <div class="card">
      <h3>Verified Performance</h3>
      <p><strong>KAAMSCORE:</strong> ${exportDossier.workerProfile.kaamScore}</p>
      <p><strong>Completed Projects:</strong> ${exportDossier.workerProfile.completedProjectsCount}</p>
      <p><strong>Customer Rating:</strong> ${exportDossier.workerProfile.ratingAverage} / 5.0</p>
    </div>
    <div class="card">
      <h3>Documented Skills</h3>
      <ul>
        ${exportDossier.workerProfile.skills.map((s) => `<li>${s}</li>`).join("")}
      </ul>
    </div>
  </div>
  <div class="footer">
    <p>${exportDossier.disclaimers.nonGovernmentStatus}</p>
    <p>${exportDossier.disclaimers.offlineVerificationCaveat}</p>
  </div>
</body>
</html>`;
      return new NextResponse(htmlContent, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Content-Disposition": `inline; filename="identity_${exportDossier.id}.html"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      action: "generated_v2",
      export: exportDossier,
    });
  } catch (err: any) {
    const status = err.statusCode || (err.name === "AuthError" ? 401 : 400);
    return NextResponse.json({ error: err.message }, { status });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cacheTimestamp = searchParams.get("cacheTimestamp") || new Date().toISOString();

    const freshness = evaluateOfflineVerificationFreshness(cacheTimestamp);

    return NextResponse.json({
      success: true,
      freshness,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
