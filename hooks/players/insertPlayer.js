import { supabase } from "@/supabase";

export async function insertPlayer(
  team_id,
  name,
  region,
  role_id,
  riot_id,
  riot_puuid,
  riot_acc_id
) {
  const { data, error } = await supabase.from("players").insert([
    {
      team_id: team_id,
      name: name,
      region: region.code,
      role_id: role_id,
      riot_id: riot_id,
      riot_puuid: riot_puuid,
      riot_acc_id: riot_acc_id,
    },
  ]);

  if (error) {
    console.error("Error inserting player data:", error.message);
    return { error: error.message };
  } else {
    // Assuming data is an array, and we want to return the first inserted record
    const playerData = data.length > 0 ? data[0] : {};
    return {
      error: false,
      puuid: playerData.riot_puuid,
      acc_id: playerData.riot_acc_id,
    };
  }
}
