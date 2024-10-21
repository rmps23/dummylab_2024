import { supabase } from "@/supabase";

export async function fetchTeams(user_id) {
  const { data, error } = await supabase
    .from('teams')
    .select()
    .eq('owner_id', user_id)
    .order('id', { ascending: true });

  if (error) {
    console.error("Error fetching user data:", error.message);
    return null;
  }

  return data;
}
