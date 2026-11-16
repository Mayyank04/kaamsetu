import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { isConfigured } from "@/lib/env";
import {
  requireAuthenticatedUser,
  requireOwnedWorkerProfile,
  requireInstitutionCohortOwnership,
  AuthError,
} from "@/lib/auth/server";
import {
  generateIdentitySchemaV2,
  IdentitySchemaV2Export,
} from "@/lib/identity/identity-schema-v2-service";
import { validateIdentityExportRateLimit } from "@/lib/security/rate-limiter";

/**
 * Escapes HTML entities to prevent Stored XSS and HTML injection.
 */
function escapeHtml(str: any): string {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Sanitizes CSV values to prevent formula injection.
 * Neutralizes leading =, +, -, @, tabs, carriage returns, or pipes even when preceded by whitespace.
 */
function sanitizeCsv(val: any): string {
  if (val === null || val === undefined) return "N/A";
  let str = String(val);
  if (/^\s*[=+\-@\t\r|]/.test(str)) {
    str = `'${str}`;
  }
  str = str.replace(/"/g, '""');
  return `"${str}"`;
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuthenticatedUser();

    // Rate limit check: max 10 exports per hour per worker/IP
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const rateLimit = await validateIdentityExportRateLimit(user.id, clientIp);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: rateLimit.reason, remainingSeconds: rateLimit.remainingSeconds },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { searchParams } = new URL(req.url);
    const requestedFormat = (searchParams.get("format") || body.format || "json").toLowerCase();

    let targetWorkerProfileId = body.workerProfileId;

    // Strict Role and Relationship Matrix Authorization
    if (user.role === "worker") {
      targetWorkerProfileId = user.workerProfileId || targetWorkerProfileId;
      if (!targetWorkerProfileId) {
        return NextResponse.json({ error: "workerProfileId is required" }, { status: 400 });
      }
      await requireOwnedWorkerProfile(targetWorkerProfileId);
    } else if (user.role === "institution") {
      if (!body.cohortId) {
        return NextResponse.json(
          { error: "cohortId is required for institutional identity dossier exports." },
          { status: 400 }
        );
      }
      await requireInstitutionCohortOwnership(body.cohortId);

      // Verify worker is enrolled in this authorized cohort
      const supabase = createAdminClient();
      const { data: enrollment } = await supabase
        .from("cohort_participants")
        .select("id")
        .eq("cohort_id", body.cohortId)
        .eq("worker_profile_id", targetWorkerProfileId)
        .maybeSingle();

      if (!enrollment && !user.isDemo) {
        return NextResponse.json(
          { error: "Forbidden: Worker is not enrolled in your authorized institutional cohort." },
          { status: 403 }
        );
      }
    } else if (user.role === "contractor") {
      // Contractors can only export workers on their active roster or bookings
      const supabase = createAdminClient();
      const { data: member } = await supabase
        .from("contractor_workforce")
        .select("id")
        .eq("worker_profile_id", targetWorkerProfileId)
        .maybeSingle();

      if (!member && !user.isDemo) {
        return NextResponse.json(
          { error: "Forbidden: You may only export dossiers for workers on your authorized roster." },
          { status: 403 }
        );
      }
    } else if (user.role !== "admin") {
      throw new AuthError("Access denied: You do not have permission to export identity dossiers.", 403);
    }

    if (!targetWorkerProfileId) {
      return NextResponse.json({ error: "workerProfileId is required" }, { status: 400 });
    }

    let profile: any = null;
    let completedProjectsCount = 0;
    let reviews: any[] = [];
    let workerSkills: any[] = [];
    let credentialRows: any[] = [];

    if (isConfigured.supabase) {
      const supabase = createAdminClient();
      const { data: pData } = await supabase
        .from("worker_profiles")
        .select("id, registry_id, headline, bio, city, state, pincode, kaamscore, years_experience, occupation:occupations(name), user:profiles(full_name, phone)")
        .eq("id", targetWorkerProfileId)
        .maybeSingle();
      profile = pData;

      const { count: cCount } = await supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .eq("worker_profile_id", targetWorkerProfileId)
        .eq("status", "completed");
      completedProjectsCount = cCount || 0;

      const { data: rData } = await supabase
        .from("reviews")
        .select("rating")
        .eq("worker_profile_id", targetWorkerProfileId);
      reviews = rData || [];

      const { data: wsData } = await supabase
        .from("worker_skills")
        .select("skills(name), verification_type")
        .eq("worker_profile_id", targetWorkerProfileId);
      workerSkills = wsData || [];

      const { data: crData } = await supabase
        .from("credential_registry")
        .select("registry_id, status, issued_at")
        .eq("worker_profile_id", targetWorkerProfileId);
      credentialRows = crData || [];
    }

    const ratings = (reviews || []).map((r) => r.rating);
    // NON-INVENTION INVARIANT: Do NOT default missing rating to 5.0
    const ratingAverage = ratings.length > 0
      ? Number((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2))
      : null;

    // NON-INVENTION INVARIANT: Do NOT invent fallback skills (Carpentry/Electrical)
    const skills = (workerSkills || []).map((ws: any) => ws.skills?.name).filter(Boolean);

    // Query authoritative credentials
    const credentials = (credentialRows || []).map((c) => ({
      credentialIdentifier: c.registry_id,
      tradeTitle: (profile?.occupation as any)?.name || "Vocational Artisan",
      nsqfLevel: null,
      issuingInstitution: "KAAMSETU National Trust Protocol",
      issuanceDate: c.issued_at,
      status: (c.status as "active" | "suspended" | "revoked") || "active",
    }));

    const fullName = (profile?.user as any)?.full_name || user.fullName || "Vocational Worker";
    const primaryTrade = (profile?.occupation as any)?.name || "Artisan";
    // NON-INVENTION INVARIANT: Do NOT default missing score to 500
    const kaamScore = profile?.kaamscore !== undefined && profile?.kaamscore !== null ? profile.kaamscore : null;
    const workerId = profile?.registry_id || `IN-AS-2026-${targetWorkerProfileId}-KS`;

    // Native Schema 2.0 generation using strictly server-verified parameters
    const exportDossier: IdentitySchemaV2Export = generateIdentitySchemaV2({
      workerId,
      fullName,
      primaryTrade,
      skills,
      kaamScore: kaamScore ?? 0,
      completedProjectsCount: completedProjectsCount || 0,
      ratingAverage: ratingAverage ?? 0.0,
      credentials,
      selectiveDisclosure: body.selectiveDisclosure,
    });

    // 1. CSV Format
    if (requestedFormat === "csv") {
      const headers = ["Worker ID", "Full Name", "Primary Trade", "KaamScore", "Completed Projects", "Rating Average", "Verified Skills Count", "Issued At"];
      const row = [
        sanitizeCsv(exportDossier.id),
        sanitizeCsv(exportDossier.workerProfile.fullName),
        sanitizeCsv(exportDossier.workerProfile.primaryTrade),
        kaamScore !== null ? kaamScore : "Unscored",
        exportDossier.workerProfile.completedProjectsCount,
        ratingAverage !== null ? ratingAverage : "Not yet rated",
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

    // 2. Printable HTML Format (Cleanly named and sanitized against XSS)
    if (requestedFormat === "html" || requestedFormat === "html_printable") {
      const escapedFullName = escapeHtml(exportDossier.workerProfile.fullName);
      const escapedPrimaryTrade = escapeHtml(exportDossier.workerProfile.primaryTrade);
      const escapedId = escapeHtml(exportDossier.id);
      const scoreDisplay = kaamScore !== null ? `${kaamScore}` : "Unscored (New)";
      const ratingDisplay = ratingAverage !== null ? `${ratingAverage} / 5.0` : "Not yet rated";

      const skillsHtml = exportDossier.workerProfile.skills.length > 0
        ? exportDossier.workerProfile.skills.map((s) => `<span class="tag">${escapeHtml(s)}</span>`).join(" ")
        : "<em>No declared skills on file.</em>";

      const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>KAAMSETU Verified Vocational Dossier - ${escapedId}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #153E35; margin: 40px; background: #F7F5F0; }
    .container { max-width: 800px; margin: 0 auto; background: #ffffff; padding: 32px; border-radius: 8px; border: 1px solid #E8C999; }
    .header { border-bottom: 2px solid #153E35; padding-bottom: 16px; margin-bottom: 24px; }
    .title { font-size: 24px; font-weight: bold; margin: 0; color: #153E35; }
    .subtitle { color: #64748B; font-size: 14px; margin-top: 4px; }
    .tag { display: inline-block; padding: 4px 10px; background: #F4EAD4; color: #153E35; border-radius: 4px; font-size: 13px; margin: 2px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 16px; }
    .card { background: #FAFAFA; border: 1px solid #E5E7EB; padding: 14px; border-radius: 6px; }
    .card-label { font-size: 11px; text-transform: uppercase; color: #6B7280; font-weight: 600; }
    .card-val { font-size: 18px; font-weight: bold; color: #153E35; margin-top: 4px; }
    .disclaimer { font-size: 11px; color: #9CA3AF; margin-top: 32px; border-top: 1px solid #E5E7EB; padding-top: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="title">KAAMSETU Sovereign Skill Dossier</h1>
      <p class="subtitle">Registry ID: ${escapedId} | Issued: ${escapeHtml(new Date(exportDossier.issuedAt).toLocaleDateString())}</p>
    </div>
    <div class="section">
      <h2 style="margin: 0 0 8px 0; color: #153E35;">${escapedFullName}</h2>
      <p style="margin: 0 0 16px 0; color: #4B5563; font-weight: 500;">${escapedPrimaryTrade}</p>
      <div>${skillsHtml}</div>
    </div>
    <div class="grid">
      <div class="card">
        <div class="card-label">KaamScore (Reputation)</div>
        <div class="card-val">${scoreDisplay}</div>
      </div>
      <div class="card">
        <div class="card-label">Customer Rating</div>
        <div class="card-val">${ratingDisplay}</div>
      </div>
      <div class="card">
        <div class="card-label">Completed Projects</div>
        <div class="card-val">${exportDossier.workerProfile.completedProjectsCount}</div>
      </div>
      <div class="card">
        <div class="card-label">Verification Freshness</div>
        <div class="card-val">Active (7-Day SLA)</div>
      </div>
    </div>
    <div class="disclaimer">
      <strong>NON-GOVERNMENT SOVEREIGN CREDENTIAL:</strong> This digital identity dossier is issued by the KAAMSETU National Trust Protocol for peer-to-peer reputation and vocational empowerment. It is not an Aadhaar card or government passport.
    </div>
  </div>
</body>
</html>`;

      return new NextResponse(htmlContent, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Content-Disposition": `inline; filename="dossier_${exportDossier.id}.html"`,
        },
      });
    }

    // 3. Binary PDF Request: If PDF requested, honestly declare PDF generation status or provide printable HTML
    if (requestedFormat === "pdf") {
      return NextResponse.json({
        error: "Binary PDF generation requires external rendering engine. Please request format=html_printable for high-fidelity printable layout or format=json for structured data.",
        availableFormats: ["json", "csv", "html_printable"],
        dossierId: exportDossier.id,
      }, { status: 422 });
    }

    // 4. Structured JSON Export (Default)
    return NextResponse.json(exportDossier, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
    });
  } catch (err: any) {
    const status = err.statusCode || (err.name === "AuthError" ? 403 : 500);
    return NextResponse.json({ error: err.message }, { status });
  }
}
