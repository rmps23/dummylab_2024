import { supabase } from "@/supabase";

async function UserTeams(user_id) {
    const { data, error } = await supabase
        .from("teams")
        .select("*")
        .eq("owner", user_id)

    if (error) {
        console.error("Error retrieving player data:", error.message);
        return [];
    }

    return data;
}

export { UserTeams };
