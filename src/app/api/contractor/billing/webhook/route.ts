import { NextRequest, NextResponse } from "next/server";
import {
  verifyWebhookSignature,
  verifyWebhookReplayDefense,
  processPaymentWebhookEvent,
} from "@/lib/billing/payment-service";
import { logger } from "@/lib/security/privacy-logger";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature") || req.headers.get("x-webhook-signature");
    const timestamp = req.headers.get("x-razorpay-event-time") || req.headers.get("x-webhook-timestamp");

    // 1. Verify Cryptographic Signature
    const sigCheck = verifyWebhookSignature(rawBody, signature);
    if (!sigCheck.isValid) {
      logger.warn("Webhook rejected: Invalid cryptographic signature", {
        hasSignature: Boolean(signature),
      });
      return NextResponse.json(
        { error: sigCheck.error || "Invalid webhook signature" },
        { status: 400 }
      );
    }

    // 2. Replay Defense Verification (Max 300s window)
    const replayCheck = verifyWebhookReplayDefense(timestamp, 300);
    if (!replayCheck.isValid) {
      logger.warn("Webhook rejected: Replay attack detected", { error: replayCheck.error });
      return NextResponse.json(
        { error: replayCheck.error || "Webhook timestamp expired" },
        { status: 400 }
      );
    }

    // 3. Parse Event Body
    let parsed: any;
    try {
      parsed = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Malformed JSON payload" }, { status: 400 });
    }

    const eventId = parsed.id || parsed.event_id || req.headers.get("x-razorpay-event-id") || `evt_${Date.now()}`;
    const eventType = parsed.event || parsed.event_type || "payment.captured";
    const payload = parsed.payload?.payment?.entity || parsed.payload || parsed;

    // 4. Process Event with Idempotency
    const result = await processPaymentWebhookEvent({
      eventId,
      eventType,
      payload,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Event processing failed" }, { status: 500 });
    }

    return NextResponse.json({
      status: "ok",
      duplicate: result.duplicate,
      processed: !result.duplicate,
      orderReference: result.order?.order_reference,
    });
  } catch (err: any) {
    logger.error("Unhandled exception in payment webhook endpoint", { error: String(err) });
    return NextResponse.json(
      { error: "Internal server error processing payment webhook" },
      { status: 500 }
    );
  }
}
