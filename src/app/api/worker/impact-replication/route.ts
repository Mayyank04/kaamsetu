import { requireAdmin } from "@/lib/auth/server";
import { handleApiError } from "@/lib/error/handler";
import { NextResponse } from "next/server";
import {
  CANONICAL_GUWAHATI_CARPENTRY_REPLICATION,
  verifyWorkerImpactReplication,
} from "@/lib/worker/worker-impact-replication-service";

export async function GET() {
  try { await requireAdmin(); } catch (authError) { return handleApiError(authError); }
  try {
    const verification = verifyWorkerImpactReplication(CANONICAL_GUWAHATI_CARPENTRY_REPLICATION);

    return NextResponse.json({
      success: true,
      replicationStudy: CANONICAL_GUWAHATI_CARPENTRY_REPLICATION,
      verification,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
