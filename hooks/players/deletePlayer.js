import { supabase } from "@/supabase";

export async function deletePlayer(player_id) {
  const { data, error } = await supabase
    .from("players")
    .delete()
    .eq('id', player_id);

  if (error) {
    console.error("Error deleting player:", error.message);
  }

  return { data, error };
}
