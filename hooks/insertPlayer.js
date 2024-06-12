import { supabase } from "@/supabase";

export async function insertPlayer(name, role, riot_id, creator_id, team_id) {
  const { data, error } = await supabase
    .from("player")
    .insert([
      {
        name: name,
        role: role,
        riot_id: riot_id,
        creator_id: creator_id,
        team_id: team_id,
      },
    ]);

  if (error) {
    console.error("Error fetching user data:", error.message);
    return null;
  } else {
    return data;
  }
}
