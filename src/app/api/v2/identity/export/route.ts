import { NextRequest, NextResponse } from "next/server";
import {
  generateIdentitySchemaV2,
  upgradeLegacySchemaV1ToV2,
  evaluateOfflineVerificationFreshness,
} from "@/lib/identity/identity-schema-v2-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.schemaVersion === "1.0" || (!body.schemaVersion && body.name)) {
      // Legacy Schema 1.0 upgrade path
      const upgraded = upgradeLegacySchemaV1ToV2(body);
      return NextResponse.json({
        success: true,
        action: "upgraded_from_v1",
        export: upgraded,
      });
    }

    // Native Schema 2.0 generation
    const exportDossier = generateIdentitySchemaV2({
      workerId: body.workerId,
      fullName: body.fullName,
      primaryTrade: body.primaryTrade,
      skills: body.skills || [],
      kaamScore: body.kaamScore || 500,
      completedProjectsCount: body.completedProjectsCount || 0,
      ratingAverage: body.ratingAverage || 5.0,
      credentials: body.credentials || [],
      selectiveDisclosure: body.selectiveDisclosure,
    });

    return NextResponse.json({
      success: true,
      action: "generated_v2",
      export: exportDossier,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
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
