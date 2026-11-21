import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireContractor } from "@/lib/auth/server";
import { getContractorDashboardData } from "@/lib/supabase/db/contractors";
import { ContractorDashboardView } from "@/components/dashboard/contractor-dashboard-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contractor Pro SaaS Dashboard | KAAMSETU Digital Identity",
  description:
    "Manage verified workforce rosters, project deployments, site compliance dossiers, and subscription plans on KAAMSETU.",
};

export default async function ContractorDashboardPage() {
  let user;
  try {
    user = await requireContractor();
  } catch (err) {
    redirect("/auth/login?redirect=/contractor/dashboard");
  }

  const dashboardData = await getContractorDashboardData(user.id);
  if (!dashboardData) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-ivory-50 via-background to-ivory-100/40">
      <ContractorDashboardView initialData={dashboardData} />
    </div>
  );
}
