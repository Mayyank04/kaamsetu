import { NextRequest } from "next/server";
import { requireContractor } from "@/lib/auth/server";
import { verifyAndCapturePayment } from "@/lib/billing/payment-service";
import { handleApiError, createSuccessResponse } from "@/lib/error/handler";

export async function POST(request: NextRequest) {
  try {
    await requireContractor();
    const body = await request.json();

    const { orderReference, gatewayOrderId, gatewayPaymentId, gatewaySignature } = body;

    if (!orderReference || !gatewayOrderId || !gatewayPaymentId || !gatewaySignature) {
      return handleApiError(
        new Error("Missing required payment verification parameters (orderReference, gatewayOrderId, gatewayPaymentId, gatewaySignature).")
      );
    }

    const result = await verifyAndCapturePayment({
      orderReference,
      gatewayOrderId,
      gatewayPaymentId,
      gatewaySignature,
    });

    if (!result.isVerified) {
      return handleApiError(new Error(result.errorMessage || "Payment verification failed."));
    }

    return createSuccessResponse(
      {
        order: result.order,
        organization: result.organization,
      },
      {
        message: "Payment successfully verified and captured on server. Subscription upgraded.",
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
