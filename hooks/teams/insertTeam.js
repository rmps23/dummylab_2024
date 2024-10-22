import { supabase } from "@/supabase";

export async function insertTeam(name, owner_id) {

  const { data, error } = await supabase
    .from("team")
    .insert([
      {
        name: name,
        owner_id: owner_id,
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
