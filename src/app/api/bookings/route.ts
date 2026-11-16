import { NextRequest, NextResponse } from "next/server";
import { BookingService } from "@/server/services/booking.service";
import { handleApiError, createSuccessResponse } from "@/lib/errors";
import { requireAuthenticatedUser } from "@/lib/auth/server";
import { GeographicAuthorizationService } from "@/lib/geo/geographic-authorization-service";
import { z } from "zod";

const createBookingSchema = z.object({
  worker_profile_id: z.string().min(1, "Worker profile ID is required"),
  service_title: z.string().min(3, "Service title must be at least 3 characters"),
  description: z.string().optional().default(""),
  location_address: z.string().min(5, "Address must be at least 5 characters"),
  location_city: z.string().min(2, "City must be specified"),
  location_state: z.string().optional().default("Assam"),
  location_pincode: z.string().regex(/^[1-9][0-9]{5}$/, "Pincode must be 6 digits").optional(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
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

    // Geographic boundary validation (Guwahati Urban & Shillong Urban permitted)
    const geoValidation = GeographicAuthorizationService.validateLocation({
      city: data.location_city,
      state: data.location_state || "Assam",
      pincode: data.location_pincode || (data.location_city.toLowerCase().includes("shillong") ? "793001" : "781001"),
      latitude: data.latitude,
      longitude: data.longitude,
    });

    if (!geoValidation.allowed) {
      return NextResponse.json(
        {
          error: geoValidation.reason || "Booking location is outside the authorized Class B operating boundary.",
          status: geoValidation.status,
          district: geoValidation.district,
        },
        { status: 403 }
      );
    }

    // Constitutional Invariant: 100% of estimated_cost belongs to worker, platform commission = 0.00
    const booking = await BookingService.requestBooking(user.id, {
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
      message: "Booking request transmitted to worker. 100% of payment goes directly to the professional with zero commission.",
      platformCommissionAmount: 0.00,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
