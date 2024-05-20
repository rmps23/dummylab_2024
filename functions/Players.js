import { supabase } from "@/supabase";

async function getPlayers() {
  const { data, error } = await supabase
    .from("player")
    .select("id, name, riot_id, role (id, name, image_link)");

  if (error) {
    console.error("Error fetching players:", error);
    return [];
  }
  return data;
}

async function getPlayerByID(playerID) {
  // Assuming you want to fetch by playerID
  const { data, error } = await supabase
    .from("player")
    .select("id, name, riot_id, role (id, name, image_link)")
    .eq("id", playerID); // Using the playerID to filter the query

  if (error) {
    console.error("Error fetching player by ID:", error);
    return null; // Changed to return null instead of an empty array for single record
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

async function getPlayerRiotInfo(RiotID, PlayerID) {
  const [gameName, tagLine] = RiotID.split("#");
  const url = `/api/riot/${gameName}/${tagLine}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Error fetching matches: ${response.statusText} - ${errorText}`
      );
    }

    const data = await response.json();
    // Ensure the data is an array
    return Array.isArray(data) ? data : [data];
  } catch (error) {
    console.error("Error fetching player matches:", error);
    return [];
  }
}

export { getPlayers, getPlayerByID, deletePlayerByID, getPlayerRiotInfo };
