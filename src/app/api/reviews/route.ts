import { NextRequest } from "next/server";
import { addReview } from "@/lib/supabase/db/reviews";
import { handleApiError, createSuccessResponse } from "@/lib/error/handler";
import { z } from "zod";

const createReviewSchema = z.object({
  booking_id: z.string(),
  worker_profile_id: z.string(),
  rating: z.number().min(1).max(5),
  quality_rating: z.number().min(1).max(5).optional(),
  punctuality_rating: z.number().min(1).max(5).optional(),
  comment: z.string().min(5, "Comment must be at least 5 characters"),
});

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const data = createReviewSchema.parse(json);

    const review = await addReview({
      booking_id: data.booking_id,
      worker_profile_id: data.worker_profile_id,
      customer_id: "22222222-2222-2222-2222-222222220001", // Demo customer
      rating: data.rating,
      quality_rating: data.quality_rating,
      punctuality_rating: data.punctuality_rating,
      comment: data.comment,
      contractor_signed: true,
    });

    return createSuccessResponse(review, {
      message: "Customer verified review successfully anchored to worker profile.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
