import { supabase } from "@/supabase";

export async function updateUserEmail(newEmail) {
  const { data, error } = await supabase.auth.updateUser({
    email: newEmail
  })


  if (error) {
    console.error("Error fetching user data:", error.message);
    return null;
  }

  return data;
}
