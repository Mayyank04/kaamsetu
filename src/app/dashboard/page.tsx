import type { Metadata } from "next";
import { getWorkerDashboardData } from "@/lib/supabase/db/dashboard";
import { WorkerDashboardContainer } from "@/components/dashboard/worker-dashboard-container";

export const metadata: Metadata = {
  title: "Worker Self-Sovereign Dashboard | KAAMSETU Digital Identity",
  description:
    "Manage your verified digital identity, upload portfolio evidence to Supabase Storage, review job requests, manage skills, and control public visibility.",
};

export default async function DashboardPage() {
  const dashboardData = await getWorkerDashboardData();

  return (
    <div className="min-h-screen bg-background">
      <WorkerDashboardContainer initialData={dashboardData} />
    </div>
  );
}
