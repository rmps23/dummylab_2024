import { supabase } from "@/supabase";

async function getPlayers() {
  const { data, error } = await supabase
    .from("player")
    .select("id, name, riot_id, role (id, name, image_link)");

  if (error) {
    console.error("Error fetching players:", error);
    return [];
  }

  console.log(data);

  return data;
}

async function getPlayerByID(playerID) {
  const { data, error } = await supabase
    .from("player")
    .select("id, name, riot_id, role (id, name, image_link)")
    .eq("id", playerID)
    .single();

  if (error) {
    console.error("Error fetching player by ID:", error);
    return null;
  }
  return data;
}

async function deletePlayerByID(deletePlayerId) {
  const { error } = await supabase
    .from("player")
    .delete()
    .eq("id", deletePlayerId);

  if (error) {
    console.error("Error deleting player:", error.message);
  }
}


export {
  getPlayers,
  getPlayerByID,
  deletePlayerByID,
};
