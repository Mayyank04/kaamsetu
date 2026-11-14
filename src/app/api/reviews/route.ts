import { NextRequest, NextResponse } from "next/server";
import { addReview, checkReviewEligibility } from "@/lib/supabase/db/reviews";
import { handleApiError, createSuccessResponse } from "@/lib/error/handler";
import { requireAuthenticatedUser, AuthError } from "@/lib/auth/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isConfigured } from "@/lib/env";
import { z } from "zod";

const createReviewSchema = z.object({
  booking_id: z.string().min(1, "Booking ID is required"),
  worker_profile_id: z.string().min(1, "Worker profile ID is required"),
  rating: z.number().int().min(1).max(5),
  quality_rating: z.number().int().min(1).max(5).optional(),
  punctuality_rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().min(5, "Comment must be at least 5 characters"),
  contractor_signed: z.boolean().optional().default(false),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthenticatedUser();
    const json = await request.json();
    const data = createReviewSchema.parse(json);

    // Production Mode: Verify booking ownership, completion, and review uniqueness
    if (isConfigured.supabase) {
      const supabase = await createServerSupabaseClient();
      const { data: booking, error: bookingErr } = await supabase
        .from("bookings")
        .select("id, customer_id, worker_profile_id, status")
        .eq("id", data.booking_id)
        .single();

      if (bookingErr || !booking) {
        return NextResponse.json(
          { success: false, message: "Associated service booking was not found." },
          { status: 404 }
        );
      }

      if (booking.customer_id !== user.id && user.role !== "admin") {
        throw new AuthError("Forbidden: You can only review bookings you commissioned.", 403);
      }

      if (booking.worker_profile_id !== data.worker_profile_id) {
        return NextResponse.json(
          { success: false, message: "Mismatch between booking record and reviewed worker profile." },
          { status: 400 }
        );
      }

      if (booking.status !== "completed") {
        return NextResponse.json(
          { success: false, message: "Reviews can only be submitted for completed service contracts." },
          { status: 400 }
        );
      }

      // Check duplicate review
      const { data: existingReview } = await supabase
        .from("reviews")
        .select("id")
        .eq("booking_id", data.booking_id)
        .maybeSingle();

      if (existingReview) {
        return NextResponse.json(
          { success: false, message: "A verified review has already been submitted for this service booking." },
          { status: 409 }
        );
      }
    }

    const review = await addReview({
      booking_id: data.booking_id,
      worker_profile_id: data.worker_profile_id,
      customer_id: user.id,
      rating: data.rating,
      quality_rating: data.quality_rating ?? null,
      punctuality_rating: data.punctuality_rating ?? null,
      comment: data.comment,
      contractor_signed: data.contractor_signed ?? false,
    });

    return createSuccessResponse(review, {
      message: "Customer verified review successfully anchored to worker profile.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
