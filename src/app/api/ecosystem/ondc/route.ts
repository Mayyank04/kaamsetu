import { NextRequest, NextResponse } from "next/server";
import { OndcAdapter, BecknRequest } from "@/lib/ecosystem/ondc/ondc-adapter";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    let body: BecknRequest;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        OndcAdapter.createNackResponse("10000", "Malformed JSON body."),
        { status: 400 }
      );
    }

    const authHeader = req.headers.get("authorization") || undefined;
    const timestamp = body.context?.timestamp || new Date().toISOString();

    // 1. Cryptographic signature and replay window validation
    const validation = OndcAdapter.verifyIncomingSignature(authHeader, rawBody, timestamp);
    if (!validation.isValid) {
      return NextResponse.json(
        OndcAdapter.createNackResponse(validation.errorCode || "10001", validation.errorMessage || "Signature validation failed."),
        { status: 401 }
      );
    }

    // 2. Audit transaction into PostgreSQL
    try {
      const admin = createAdminClient();
      await admin.from("external_ecosystem_transactions").insert({
        protocol_type: "ondc",
        action: body.context.action,
        transaction_id: body.context.transaction_id,
        message_id: body.context.message_id,
        bap_id: body.context.bap_id,
        bpp_id: body.context.bpp_id,
        signature_verified: true,
        idempotency_key: `${body.context.transaction_id}:${body.context.message_id}`,
        request_timestamp: timestamp,
        response_status: "acknowledged",
        payload_hash: validation.payloadHash || "",
        worker_contact_masked: true,
      });
    } catch {
      // Non-fatal if database unavailable in isolated mock tests
    }

    // 3. Return Beckn ACK
    return NextResponse.json(OndcAdapter.createAckResponse());
  } catch (err: any) {
    return NextResponse.json(
      OndcAdapter.createNackResponse("50000", err?.message || "Internal gateway processing error."),
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "active",
    protocol: "ONDC/Beckn",
    version: "1.2.0",
    bpp_id: "kaamsetu.org",
    endpoints: ["/search", "/select", "/init", "/confirm", "/status", "/track", "/cancel"],
    commission_rate: "0.00%",
  });
}
