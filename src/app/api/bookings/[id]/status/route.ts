import { NextRequest, NextResponse } from "next/server";
import { updateBookingStatus } from "@/lib/supabase/db/bookings";
import { BookingStatus } from "@/types/database.types";
import { handleApiError, createSuccessResponse } from "@/lib/error/handler";
import { requireAuthenticatedUser, AuthError } from "@/lib/auth/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isConfigured } from "@/lib/env";
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
    const user = await requireAuthenticatedUser();
    const { id } = await context.params;
    const json = await request.json();
    const { status, cancellation_reason } = statusTransitionSchema.parse(json);

    const targetStatus = normalizeStatus(status);

    // In production with live Supabase, enforce strict participant ownership and lifecycle
    if (isConfigured.supabase) {
      const supabase = await createServerSupabaseClient();
      const { data: booking, error: fetchErr } = await supabase
        .from("bookings")
        .select(`
          *,
          worker_profile:worker_profiles(user_id)
        `)
        .eq("id", id)
        .single();

      if (fetchErr || !booking) {
        return NextResponse.json(
          { success: false, message: "Booking record not found." },
          { status: 404 }
        );
      }

      const isCustomer = booking.customer_id === user.id;
      const isAssignedWorker = booking.worker_profile?.user_id === user.id;

      if (!isCustomer && !isAssignedWorker && user.role !== "admin") {
        throw new AuthError("Forbidden: You are not an authorized participant for this booking.", 403);
      }

      const currentStatus = booking.status as BookingStatus;

      // Prevent modifications to terminal states
      if (currentStatus === "completed") {
        return NextResponse.json(
          { success: false, message: "Completed bookings cannot be modified or reopened." },
          { status: 400 }
        );
      }

      if (currentStatus === "cancelled") {
        return NextResponse.json(
          { success: false, message: "Cancelled bookings cannot be reopened. Please submit a new booking request." },
          { status: 400 }
        );
      }

      // Enforce role-based lifecycle transitions
      if (targetStatus === "confirmed" && !isAssignedWorker && user.role !== "admin") {
        return NextResponse.json(
          { success: false, message: "Only the assigned worker can accept this booking." },
          { status: 403 }
        );
      }

      if (targetStatus === "in_progress" && !isAssignedWorker && user.role !== "admin") {
        return NextResponse.json(
          { success: false, message: "Only the assigned worker can mark work in progress." },
          { status: 403 }
        );
      }

      // Customer can confirm completion or cancel
      if (targetStatus === "completed" && !isAssignedWorker && !isCustomer && user.role !== "admin") {
        return NextResponse.json(
          { success: false, message: "Only booking participants can finalize completion." },
          { status: 403 }
        );
      }
    }

    const updated = await updateBookingStatus(
      id,
      targetStatus,
      cancellation_reason
    );

    return createSuccessResponse(updated, {
      message: `Booking ${id} transitioned to state: ${targetStatus}.`,
      transition: targetStatus,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
