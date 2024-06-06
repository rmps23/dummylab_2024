import { supabase } from "@/supabase";

export async function fetchUser() {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    console.error("Error fetching user data:", error.message);
    return null;
  }

  return data;
}
