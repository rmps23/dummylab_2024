import { supabase } from "@/supabase";

async function TeamRegions() {
  const { data, error } = await supabase.from("regions").select();

  if (error) {
    console.error("Error retrieving player data:", error.message);
    return [];
  }

  return data;
}

async function InsertTeam(name, region_id) {
  const { error } = await supabase
    .from("teams")
    .insert({ name: name, region: region_id });
}

export { TeamRegions, InsertTeam };
