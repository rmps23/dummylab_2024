import { supabase } from "@/supabase";

export async function insertTeam(name, owner_id) {
  const { data, error } = await supabase
    .from("teams")
    .insert([
      {
        name: name,
        owner: owner_id,
      },
    ])
    .single().select();

  if (error) {
    console.error("Error fetching user data:", error.message);
    return null;
  } else {
    return data;
  }
}
