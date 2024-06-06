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

async function InsertTeam(name, region_id) {
    const { data, error } = await supabase
        .from("teams")
        .insert({ name: name, region: region_id })
        .select()
        .limit(1)
        .single()

    if (error) {
        console.error("Error inserting team:", error.message);
        return null;
    }

    return data;
}

export { UserTeams, InsertTeam };
