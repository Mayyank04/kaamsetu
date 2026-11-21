import type { Metadata } from "next";
import { getCustomerBookings } from "@/lib/supabase/db/bookings";
import { CustomerBookingsContainer } from "@/components/customer/customer-bookings-container";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Customer Service Bookings | KAAMSETU Sovereign Trust",
  description:
    "Track active technical projects, review milestone transitions, and leave verified ratings for hired Indian skilled craftspeople.",
};

export default async function CustomerBookingsPage() {
  const customerId = "22222222-2222-2222-2222-222222220001";
  const initialBookings = await getCustomerBookings(customerId);

  return (
    <div className="min-h-screen bg-background">
      <CustomerBookingsContainer initialBookings={initialBookings} />
    </div>
  );
}
