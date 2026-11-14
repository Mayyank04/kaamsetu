import { NextRequest } from "next/server";
import { getCustomerBookings } from "@/lib/supabase/db/bookings";
import { handleApiError, createSuccessResponse } from "@/lib/error/handler";
import { requireCustomerOrContractor } from "@/lib/auth/server";

export async function GET(request: NextRequest) {
  try {
    const user = await requireCustomerOrContractor();

    const bookings = await getCustomerBookings(user.id);

    return createSuccessResponse(bookings, {
      customerId: user.id,
      total: bookings.length,
      isDemo: user.isDemo,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
