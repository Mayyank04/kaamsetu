import { NextRequest } from "next/server";
import { updateBookingStatus } from "@/lib/supabase/db/bookings";
import { BookingStatus } from "@/types/database.types";
import { handleApiError, createSuccessResponse } from "@/lib/error/handler";
import { z } from "zod";

const bookingStatusSchema = z.object({
  status: z.enum(["requested", "confirmed", "in_progress", "completed", "cancelled"]),
  cancellation_reason: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const json = await request.json();
    const { status, cancellation_reason } = bookingStatusSchema.parse(json);

    const updated = await updateBookingStatus(
      id,
      status as BookingStatus,
      cancellation_reason
    );

    return createSuccessResponse(updated, {
      message: `Booking status updated to ${status}.`,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
