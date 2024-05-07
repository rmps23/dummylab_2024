import { supabase } from "@/supabase";

async function getUserData() {
  try {
    const { data: user, error } = await supabase.auth.getUser();

    if (error) {
      console.error("Error fetching user data:", error.message);
      return null;
    }

    return user;
  } catch (error) {
    console.error("Unexpected error:", error.message);
    return null;
  }
}

export default getUserData;
