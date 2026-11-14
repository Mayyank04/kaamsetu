import { NextRequest, NextResponse } from "next/server";
import { updateBookingStatus } from "@/lib/supabase/db/bookings";
import { BookingStatus } from "@/types/database.types";
import { handleApiError, createSuccessResponse, NotFoundError } from "@/lib/error/handler";
import { requireWorker, AuthError } from "@/lib/auth/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isConfigured } from "@/lib/env";
import { z } from "zod";

const bookingStatusSchema = z.object({
  status: z.enum(["confirmed", "in_progress", "completed", "cancelled"]),
  cancellation_reason: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireWorker();
    const { id } = await context.params;
    const json = await request.json();
    const { status, cancellation_reason } = bookingStatusSchema.parse(json);

    if (isConfigured.supabase) {
      const supabase = await createServerSupabaseClient();
      const { data: booking, error: fetchErr } = await supabase
        .from("bookings")
        .select(`
          id,
          status,
          worker_profile:worker_profiles(user_id)
        `)
        .eq("id", id)
        .maybeSingle();

      if (fetchErr) {
        throw fetchErr;
      }

      if (!booking) {
        throw new NotFoundError("Booking record not found.");
      }

      const assignedUserId = (booking as any)?.worker_profile?.user_id;
      if (assignedUserId !== user.id && user.role !== "admin") {
        throw new AuthError("Forbidden: You are not the assigned worker for this booking.", 403);
      }

      const currentStatus = booking.status as BookingStatus;
      if (currentStatus === "completed" || currentStatus === "cancelled") {
        return NextResponse.json(
          { success: false, message: `Cannot change status of a ${currentStatus} booking.` },
          { status: 400 }
        );
      }
    }

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
