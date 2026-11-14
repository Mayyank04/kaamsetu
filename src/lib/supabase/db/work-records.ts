import { createServerSupabaseClient } from "@/lib/supabase/server";
import { WorkRecord, Database } from "@/types/database.types";
import { isConfigured } from "@/lib/env";

export type InsertWorkRecord = Database["public"]["Tables"]["work_records"]["Insert"];

/**
 * Fetch work records for a worker profile.
 */
export async function getWorkerRecords(workerProfileId: string): Promise<WorkRecord[]> {
  if (!isConfigured.supabase) {
    return [
      {
        id: "wr-demo-1",
        worker_profile_id: workerProfileId,
        booking_id: "66666666-6666-6666-6666-666666660001",
        project_title: "Commercial Solar Grid Inverter Sync",
        contractor_or_client: "Rajasthan State Warehousing Corp",
        location: "Sitapura Industrial Area, Jaipur",
        start_date: "2025-10-01",
        end_date: "2025-10-10",
        is_current: false,
        hours_logged: 48,
        trade_category: "Electrical & Solar",
        verified_by_contractor: true,
        verification_hash: "sha256_e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        created_at: new Date().toISOString(),
      },
    ];
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("work_records")
    .select("*")
    .eq("worker_profile_id", workerProfileId)
    .order("start_date", { ascending: false });

  if (error) {
    console.error("Error fetching work records:", error);
    throw error;
  }

  return data || [];
}

/**
 * Create a new work record / experience attestation.
 */
export async function createWorkRecord(input: InsertWorkRecord): Promise<WorkRecord> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("work_records")
    .insert(input)
    .select("*")
    .single();

  if (error) {
    console.error("Error creating work record:", error);
    throw error;
  }

  return data;
}

/**
 * Contractor verifies a work record by signing with a cryptographic hash.
 */
export async function verifyWorkRecord(
  recordId: string,
  verificationHash: string
): Promise<WorkRecord> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("work_records")
    .update({
      verified_by_contractor: true,
      verification_hash: verificationHash,
    })
    .eq("id", recordId)
    .select("*")
    .single();

  if (error) {
    console.error("Error verifying work record:", error);
    throw error;
  }

  return data;
}
