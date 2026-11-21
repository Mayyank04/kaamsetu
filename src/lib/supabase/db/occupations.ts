import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isConfigured } from "@/lib/env";
import { Occupation, Skill } from "@/types/database.types";
import { PROFESSIONS_DATA } from "@/lib/data/professions";

/**
 * Fetch all active occupations.
 */
export async function getOccupations(): Promise<Occupation[]> {
  if (!isConfigured.supabase) {
    return PROFESSIONS_DATA.map((p, idx) => ({
      id: `11111111-1111-1111-1111-1111111111${String(idx + 1).padStart(2, "0")}`,
      name: p.title,
      hindi_name: p.hindiTitle,
      slug: p.slug,
      description: p.description,
      nsqf_level: 4,
      icon_name: p.icon,
      is_active: true,
      created_at: new Date().toISOString(),
    }));
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("occupations")
    .select("*")
    .eq("is_active", true)
    .order("name");

  if (error) {
    console.error("Error fetching occupations:", error);
    throw error;
  }

  return data || [];
}

/**
 * Fetch a single occupation by its slug.
 */
export async function getOccupationBySlug(slug: string): Promise<Occupation | null> {
  if (!isConfigured.supabase) {
    const found = PROFESSIONS_DATA.find((p) => p.slug === slug);
    if (!found) return null;
    return {
      id: "11111111-1111-1111-1111-111111111101",
      name: found.title,
      hindi_name: found.hindiTitle,
      slug: found.slug,
      description: found.description,
      nsqf_level: 4,
      icon_name: found.icon,
      is_active: true,
      created_at: new Date().toISOString(),
    };
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("occupations")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error) return null;
  return data;
}

/**
 * Fetch all skills belonging to an occupation.
 */
export async function getOccupationWithSkills(occupationId: string): Promise<{
  occupation: Occupation | null;
  skills: Skill[];
}> {
  if (!isConfigured.supabase) {
    return {
      occupation: {
        id: occupationId,
        name: "Electrical & Solar",
        hindi_name: "विद्युत एवं सौर ऊर्जा",
        slug: "electrical-solar",
        description: "Industrial wiring, solar grid integration, phase balancing, and substations.",
        nsqf_level: 4,
        icon_name: "Zap",
        is_active: true,
        created_at: new Date().toISOString(),
      },
      skills: [
        {
          id: "22222222-2222-2222-2222-222222220101",
          occupation_id: occupationId,
          name: "3-Phase Inverter Synchronization",
          hindi_name: "3-फेज इन्वर्टर तुल्यकालन",
          slug: "3-phase-inverters",
          category: "Specialization",
          created_at: new Date().toISOString(),
        },
        {
          id: "22222222-2222-2222-2222-222222220102",
          occupation_id: occupationId,
          name: "Rooftop Solar Array Mounts",
          hindi_name: "रूफटॉप सोलर पैनल माउंटिंग",
          slug: "rooftop-solar",
          category: "Core Craft",
          created_at: new Date().toISOString(),
        },
      ],
    };
  }

  const supabase = await createServerSupabaseClient();
  const { data: occupation, error: occError } = await supabase
    .from("occupations")
    .select("*")
    .eq("id", occupationId)
    .single();

  if (occError || !occupation) {
    return { occupation: null, skills: [] };
  }

  const { data: skills } = await supabase
    .from("skills")
    .select("*")
    .eq("occupation_id", occupationId)
    .order("category");

  return {
    occupation,
    skills: skills || [],
  };
}
