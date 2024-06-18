import { supabase } from "@/supabase";

export async function removeTeam(team_id) {
  const { data, error } = await supabase
    .from("teams")
    .delete()
    .eq('id', team_id)

  if (error) {
    console.error("Error fetching user data:", error.message);
    return null;
  } else {
    return data;
  }
}
