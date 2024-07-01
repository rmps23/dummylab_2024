import { supabase } from "@/supabase";

export async function fetchPlayer(player_id) {
  const { data, error } = await supabase
    .from("players")
    .select(
      "id, name, region, team_id(id, owner, name), role_id(name, image_link), riot_id, riot_puuid, riot_acc_id"
    )
    .eq("id", player_id)
    .single();

  if (error) {
    console.error("Error fetching user data:", error.message);
    return null;
  }

  return data;
}
