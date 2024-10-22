import { supabase } from "@/supabase";

export async function insertPlayer(
  team_id,
  name,
  region,
  role_id,
  riot_id,
  riot_puuid,
  riot_acc_id,
  user_id
) {
  const { data, error } = await supabase.from("player")
    .insert([
      {
        team_id: team_id,
        name: name,
        region: region.code,
        role_id: role_id,
        riot_id: riot_id,
        riot_puuid: riot_puuid,
        riot_acc_id: riot_acc_id,
        owner: user_id
      },
    ])
    .single().select("id, name, region, team_id(id, owner_id, name), role_id(name, image_link), riot_id, riot_puuid, riot_acc_id")
    ;

  if (error) {
    console.error("Error fetching user data:", error.message);
    return null;
  } else {
    return data;
  }
}
