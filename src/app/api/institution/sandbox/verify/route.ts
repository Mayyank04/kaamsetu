import { NextRequest } from "next/server";
import { handleApiError, createSuccessResponse } from "@/lib/error/handler";
import {
  verifyInstitutionalCredentialByIdentifier,
  validatePartnerApiKey,
} from "@/lib/institution/credential-service";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    let partnerInfo = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "").trim();
      const authResult = await validatePartnerApiKey(token);
      if (!authResult.isValid) {
        return handleApiError(new Error(`Unauthorized: ${authResult.reason}`));
      }
      partnerInfo = {
        keyName: authResult.keyRecord?.key_name,
        isSandbox: authResult.keyRecord?.is_sandbox,
        institutionName: authResult.institution?.name,
      };
    }

    const body = await req.json();
    const identifier = body.credentialIdentifier || body.identifier;

    if (!identifier) {
      return handleApiError(new Error("credentialIdentifier is required"));
    }

    const verification = await verifyInstitutionalCredentialByIdentifier(identifier);

    return createSuccessResponse({
      verification,
      partnerContext: partnerInfo,
      protocolVersion: "2.0",
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return handleApiError(err);
  }
}

export async function GET(req: NextRequest) {
  try {
    const identifier = req.nextUrl.searchParams.get("identifier");
    if (!identifier) {
      return handleApiError(new Error("Query parameter 'identifier' is required"));
    }

    const verification = await verifyInstitutionalCredentialByIdentifier(identifier);

    return createSuccessResponse({
      verification,
      protocolVersion: "2.0",
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return handleApiError(err);
  }
}
