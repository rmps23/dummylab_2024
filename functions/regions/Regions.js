import { supabase } from "@/supabase";

async function TeamRegions() {
    const { data, error } = await supabase
        .from("regions")
        .select()

    if (error) {
        console.error("Error retrieving player data:", error.message);
        return [];
    }

    return data;
}

export { TeamRegions };
