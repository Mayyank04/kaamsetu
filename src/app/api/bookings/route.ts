import { NextRequest } from "next/server";
import { createBooking } from "@/lib/supabase/db/bookings";
import { handleApiError, createSuccessResponse } from "@/lib/error/handler";
import { z } from "zod";

const createBookingSchema = z.object({
  worker_profile_id: z.string(),
  service_title: z.string().min(3),
  description: z.string().optional().default(""),
  location_address: z.string().min(5),
  location_city: z.string().min(2),
  scheduled_start: z.string(),
  scheduled_end: z.string().optional(),
  estimated_cost: z.number().optional().default(2000),
  customer_name: z.string().optional().default("Valued Customer"),
  customer_phone: z.string().optional().default("+91 98765 43210"),
});

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const data = createBookingSchema.parse(json);

    const booking = await createBooking({
      customer_id: "22222222-2222-2222-2222-222222220001", // Demo customer
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
