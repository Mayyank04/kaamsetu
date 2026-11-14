import { NextRequest, NextResponse } from "next/server";
import { createBooking } from "@/lib/supabase/db/bookings";
import { handleApiError, createSuccessResponse } from "@/lib/error/handler";
import { requireAuthenticatedUser } from "@/lib/auth/server";
import { z } from "zod";

const createBookingSchema = z.object({
  worker_profile_id: z.string().min(1, "Worker profile ID is required"),
  service_title: z.string().min(3, "Service title must be at least 3 characters"),
  description: z.string().optional().default(""),
  location_address: z.string().min(5, "Address must be at least 5 characters"),
  location_city: z.string().min(2, "City must be specified"),
  scheduled_start: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid scheduled start timestamp",
  }),
  scheduled_end: z.string().optional(),
  estimated_cost: z.number().positive("Estimated cost must be positive").default(2000),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthenticatedUser();

    const json = await request.json();
    const data = createBookingSchema.parse(json);

    // Derive customer identity strictly from verified session
    const booking = await createBooking({
      customer_id: user.id,
      worker_profile_id: data.worker_profile_id,
      service_title: data.service_title,
      description: data.description,
      location_address: data.location_address,
      location_city: data.location_city,
      scheduled_start: data.scheduled_start,
      scheduled_end: data.scheduled_end,
      estimated_cost: data.estimated_cost,
      status: "requested",
    });

    return createSuccessResponse(booking, {
      message: "Booking request transmitted to worker. You will receive SMS verification shortly.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
