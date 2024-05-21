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
  const { data, error } = await supabase
    .from("player")
    .select("id, name, riot_id, role (id, name, image_link)")
    .eq("id", playerID);

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

async function getPlayerRiotInfo(RiotID, playerID) {
  // GET THE PLAYER PUUID
  const [gameName, tagLine] = RiotID.split("#");
  const puuid_url = `/api/riot/${gameName}/${tagLine}`;

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
    const puuid = data.puuid;

    const game_list_url = `/api/lol/match/v5/matches/by-puuid/${puuid}/ids`;

    try {
      const response = await fetch(game_list_url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const matchIds = await response.json();

      for (const matchId of matchIds) {
        await fetchMatchQeueu(matchId, puuid, playerID);
      }
    } catch (error) {
      console.error("Failed to fetch match IDs:", error);
      throw error; // Re-throw the error after logging it
    }
  } catch (error) {
    console.error("Failed to fetch player PUUID:", error);
    throw error; // Re-throw the error after logging it
  }
}

async function fetchMatchQeueu(matchId, puuid, playerID) {
  const check_game_type = `/api/lol/match/v5/matches/${matchId}`;

  try {
    const response = await fetch(check_game_type, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    const matchData = await response.json();

    //DECLARATION JSON VALUES
    const game_time = matchData.info.gameDuration;

    let lanes = [];
    matchData.info.participants.forEach((part, index) => {
      console.log(part);

      if (matchData.info.queueId == 420 && part) {
        lanes[index] = part;
      }
    });

    await insertGameStats(playerID, matchId, game_time, lanes);

    //END OF DECLARATION VALUES

    if (matchData.info.queueId == 420) {
      await fetchMatchTimeline(matchId, puuid, playerID, matchData);
    }
  } catch (error) {
    console.error(`Failed to fetch match info for ${matchId}:`, error);
    throw error; // Re-throw the error after logging it
  }
}

async function fetchMatchTimeline(matchId, puuid, playerID, matchData) {
  const check_game_type = `/api/lol/match/v5/matches/${matchId}/timeline`;

  try {
    const response = await fetch(check_game_type, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
  } catch (error) {
    console.error(`Failed to fetch match info for ${matchId}:`, error);
    throw error; // Re-throw the error after logging it
  }
}

async function insertGameStats(playerID, matchId, game_time, lanes) {
  const { data, error } = await supabase.from("game_list").upsert(
    {
      game_id: matchId,
      player_id: playerID,
      game_time: game_time,
      blue_top: lanes[0],
      blue_jungler: lanes[1],
      blue_mid: lanes[2],
      blue_bot: lanes[3],
      blue_sup: lanes[4],
      red_top: lanes[5],
      red_jungler: lanes[6],
      red_mid: lanes[7],
      red_bot: lanes[8],
      red_sup: lanes[9],
    },
    { onConflict: "game_id" }
  );
  if (error) {
    console.error("Error inserting game stats:", error);
    return null;
  }
}

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
  getPlayers,
  getPlayerByID,
  deletePlayerByID,
  getPlayerRiotInfo,
  getSupaPlayerData,
};
