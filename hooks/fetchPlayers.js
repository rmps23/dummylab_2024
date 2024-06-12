import { supabase } from "@/supabase";

export async function fetchPlayers(team_id) {
  const { data, error } = await supabase
    .from("player")
    .select("id, name, role(name, image_link), riot_id")
    .eq("team_id", team_id);

  if (error) {
    console.error("Error fetching user data:", error.message);
    return null;
  }

  return data;
}
