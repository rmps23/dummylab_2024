import { supabase } from "@/supabase"; // Assuming this is correctly imported

export async function editTeam(name, team_id) {
  try {
    const { data, error } = await supabase
      .from("teams")
      .update({ name })
      .eq('id', team_id)
      .single()
      .select();

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
