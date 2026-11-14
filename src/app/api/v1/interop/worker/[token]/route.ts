import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { resolveIdentityDossierByToken } from "@/lib/interop/identity-access-service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token || token.length < 32) {
      return NextResponse.json(
        { error: "Invalid identity access token" },
        { status: 400 }
      );
    }

    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const ipHash = crypto.createHash("sha256").update(ip).digest("hex").substring(0, 16);
    const userAgent = req.headers.get("user-agent") || undefined;

    const dossier = await resolveIdentityDossierByToken(token, ipHash, userAgent);

    if (!dossier) {
      return NextResponse.json(
        {
          error: "Identity access grant not found, expired, or revoked by worker",
          status: "access_denied",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      dossier,
    });
  } catch (error: any) {
    console.error("Interop token resolution error:", error);
    return NextResponse.json(
      { error: "Failed to resolve identity dossier" },
      { status: 500 }
    );
  }
}
