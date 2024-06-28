import { supabase } from "@/supabase"; // Assuming this is correctly imported

export async function editPlayer(name, team_id, player_id) {
  try {
    const { data, error } = await supabase
      .from("players")
      .update({ name: name, team_id: team_id })
      .eq('id', player_id)
      .select("id, name, region, team_id(id, owner, name), role_id(name, image_link), riot_id, riot_puuid, riot_acc_id");

    if (error) {
      console.error("Error updating team:", error.message);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error updating team:", error.message);
    return null;
  }
}
