import { supabase } from "@/supabase";

export async function fetchPlayers(user_id) {
  const { data, error } = await supabase
    .from("player")
    .select("id, name, region, team_id(id, owner_id, name), role_id(name, image_link), riot_id, riot_puuid, riot_acc_id")
    .eq("owner", user_id);

  if (error) {
    console.error("Error fetching user data:", error.message);
    return null;
  }

  return data;
}
