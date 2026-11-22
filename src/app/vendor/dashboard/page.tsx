import type { Metadata } from "next";
import { VendorDashboardView } from "@/components/vendor/vendor-dashboard-view";
import { getAuthenticatedSession } from "@/lib/auth/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Vendor Hub & Business Dashboard | KAAMSETU",
  description:
    "Manage your local shop, stall, service listings, produce catalog, operating hours, and customer inquiries with 0% platform commission.",
};

export default async function VendorDashboardPage() {
  const { user } = await getAuthenticatedSession();
  if (!user) {
    redirect("/auth/login?redirect=/vendor/dashboard");
  }

  return (
    <div className="min-h-screen bg-background">
      <VendorDashboardView initialVendor={null} />
    </div>
  );
}
