import { supabase } from "@/supabase";

async function getPlayers() {
  const { data, error } = await supabase
    .from("player")
    .select("id, name, riot_id, role (id, name, image_link)");

  if (error) {
    console.error("Error fetching players:", error);
    return [];
  }

  const playersWithRank = [];

  for (const player of data) {
    const [gameName, tagLine] = player.riot_id.split("#");
    const puuid_url = `/api/riot/${gameName}/${tagLine}`;

    try {
      const puuid = await getPlayerPuuid(puuid_url);
      const sumIdData = await getPlayerSummonerID(puuid);
      const rankData = await getPlayerRank(sumIdData.id);

      player.icon = sumIdData.profileIconId;
      player.level = sumIdData.summonerLevel;

      const playerWithRank = {
        ...player,
        rank: rankData || null, // assuming rankData contains the rank info or is null if not found
      };

      playersWithRank.push(playerWithRank);
    } catch (error) {
      console.error("Failed to fetch player data:", error);
    }
  }

  return playersWithRank;
}

async function getPlayerPuuid(puuid_url) {
  try {
    const response = await fetch(puuid_url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.puuid;
  } catch (error) {
    console.error("Failed to fetch player PUUID:", error);
    throw error; // Re-throw the error after logging it
  }
}

async function getPlayerSummonerID(puuid) {
  const sumid_url = `/api/lol/summoner/v4/summoners/by-puuid/${puuid}`;

  try {
    const response = await fetch(sumid_url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch player summoner ID:", error);
    throw error; // Re-throw the error after logging it
  }
}

async function getPlayerRank(sum_id) {
  const rank_url = `/api/lol/league/v4/entries/by-summoner/${sum_id}`;

  try {
    const response = await fetch(rank_url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();

    const soloRank = data.find(
      (entry) => entry.queueType === "RANKED_SOLO_5x5"
    );

    return soloRank || null; // Return null if no solo rank found
  } catch (error) {
    console.error("Failed to fetch player rank:", error);
    throw error; // Re-throw the error after logging it
  }
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

export { getPlayers, getPlayerByID, deletePlayerByID };
