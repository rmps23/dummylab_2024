import { supabase } from "@/supabase";

async function getSupaPlayerData(playerID) {
    const { data, error } = await supabase
        .from("game_list")
        .select("*")
        .eq("player_id", playerID);

    if (error) {
        console.error("Error deleting player:", error.message);
    }

    return data;
}

export {
    getSupaPlayerData
};