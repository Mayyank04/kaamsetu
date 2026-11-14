import { createServerSupabaseClient } from "@/lib/supabase/server";
import { PortfolioItem, Database } from "@/types/database.types";
import { isConfigured } from "@/lib/env";

export type InsertPortfolio = Database["public"]["Tables"]["portfolio"]["Insert"];

/**
 * Fetch portfolio items for a worker.
 */
export async function getWorkerPortfolio(workerProfileId: string): Promise<PortfolioItem[]> {
  if (!isConfigured.supabase) {
    return [
      {
        id: "port-demo-1",
        worker_profile_id: workerProfileId,
        title: "85kW Commercial Solar Installation",
        description: "Zero electrical faults recorded during grid synchronization by DISCOM engineers.",
        image_url:
          "https://images.unsplash.com/photo-1508873696983-2df570464756?auto=format&fit=crop&w=800&q=80",
        project_date: "2025-09-15",
        category: "Commercial Solar",
        client_testimony: "Flawless execution by Rameshwar and team.",
        created_at: new Date().toISOString(),
      },
    ];
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("portfolio")
    .select("*")
    .eq("worker_profile_id", workerProfileId)
    .order("project_date", { ascending: false });

  if (error) {
    console.error("Error fetching portfolio:", error);
    throw error;
  }

  return data || [];
}

/**
 * Add a new item to the worker's portfolio.
 * Protected by RLS: caller must own the worker profile.
 */
export async function addPortfolioItem(
  item: InsertPortfolio
): Promise<PortfolioItem> {
  if (!isConfigured.supabase) {
    return {
      id: `port-demo-${Date.now()}`,
      worker_profile_id: item.worker_profile_id,
      title: item.title,
      description: item.description || null,
      image_url: item.image_url,
      project_date: item.project_date || new Date().toISOString().split("T")[0],
      category: item.category || "General Craft",
      client_testimony: item.client_testimony || null,
      created_at: new Date().toISOString(),
    };
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("portfolio")
    .insert(item)
    .select("*")
    .single();

  if (error) {
    console.error("Error adding portfolio item:", error);
    throw error;
  }

  return data;
}

/**
 * Delete a portfolio item.
 * Protected by RLS: caller must own the worker profile.
 */
export async function deletePortfolioItem(portfolioId: string): Promise<boolean> {
  if (!isConfigured.supabase) {
    return true;
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("portfolio")
    .delete()
    .eq("id", portfolioId);

  if (error) {
    console.error("Error deleting portfolio item:", error);
    throw error;
  }

  return true;
}
