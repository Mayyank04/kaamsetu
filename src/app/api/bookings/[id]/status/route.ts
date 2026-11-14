import { NextRequest, NextResponse } from "next/server";
import { updateBookingStatus } from "@/lib/supabase/db/bookings";
import { BookingStatus } from "@/types/database.types";
import { handleApiError, createSuccessResponse } from "@/lib/error/handler";
import { z } from "zod";

const statusTransitionSchema = z.object({
  status: z.enum([
    "pending",
    "requested",
    "accepted",
    "confirmed",
    "in_progress",
    "completed",
    "cancelled",
  ]),
  cancellation_reason: z.string().optional(),
});

// Normalized database status mapping
function normalizeStatus(inputStatus: string): BookingStatus {
  if (inputStatus === "pending") return "requested";
  if (inputStatus === "accepted") return "confirmed";
  return inputStatus as BookingStatus;
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const json = await request.json();
    const { status, cancellation_reason } = statusTransitionSchema.parse(json);

    const dbStatus = normalizeStatus(status);

    const updated = await updateBookingStatus(
      id,
      dbStatus,
      cancellation_reason
    );

    return createSuccessResponse(updated, {
      message: `Booking ${id} transitioned to state: ${status}.`,
      transition: status,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
