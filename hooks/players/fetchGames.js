import { supabase } from "@/supabase";

export async function fetchGames(puuid, acc_id, player_id) {
  /* GET THE GAME LIST */
  let game_list = [];
  try {
    const response = await fetch(`/api/lol/match/v5/matches/by-puuid/${puuid}/ids`);
    if (!response.ok) {
      throw new Error(`Error fetching games: ${response.statusText}`);
    }
    const data = await response.json();
    game_list = data;
  } catch (error) {
    console.error("Failed to fetch games:", error);
    throw error;
  }

  /* FETCH EACH GAME DETAILS ASYNCHRONOUSLY */
  try {
    // Initialize an array to store the details of each game
    const gameDetails = [];
    let test = 0;
    let player_stats = [];

    for (const game of game_list) {
      if (test < 5) {
        const details = await fetchGameDetails(game); // Fetch the details for each game
        if (details.info.queueId === 420) {
          const gameDetail = {
            id: game,
            player_id: player_id,
            game_time: details.info.gameDuration,
            blue_top: details.info.participants[0].championName,
            blue_jungler: details.info.participants[1].championName,
            blue_mid: details.info.participants[2].championName,
            blue_bottom: details.info.participants[3].championName,
            blue_support: details.info.participants[4].championName,
            red_top: details.info.participants[5].championName,
            red_jungler: details.info.participants[6].championName,
            red_mid: details.info.participants[7].championName,
            red_bottom: details.info.participants[8].championName,
            red_support: details.info.participants[9].championName,
            end_timestamp: details.info.gameEndTimestamp,
            patch: details.info.gameVersion,
            win: details.info.participants.find(participant => participant.puuid === puuid)?.win || false,
          };

          player_stats = {
            kills: details.info.participants.find(participant => participant.puuid === puuid)?.kills,
            deaths: details.info.participants.find(participant => participant.puuid === puuid)?.deaths,
            assists: details.info.participants.find(participant => participant.puuid === puuid)?.assists,
            champion_name: details.info.participants.find(participant => participant.puuid === puuid)?.championName,
            sum_spell_1: details.info.participants.find(participant => participant.puuid === puuid)?.summoner1Id,
            sum_spell_2: details.info.participants.find(participant => participant.puuid === puuid)?.summoner2Id,
            kill_part: details.info.participants.find(participant => participant.puuid === puuid)?.challenges.killParticipation,
            total_minions_killed: details.info.participants.find(participant => participant.puuid === puuid)?.totalMinionsKilled,
            dmg_dealt_turrets: details.info.participants.find(participant => participant.puuid === puuid)?.damageDealtToTurrets,
            dmg_dealt_objectives: details.info.participants.find(participant => participant.puuid === puuid)?.damageDealtToObjectives,
            gold_earned: details.info.participants.find(participant => participant.puuid === puuid)?.goldEarned,
            role_pos: details.info.participants.find(participant => participant.puuid === puuid)?.teamPosition,
            item_0: details.info.participants.find(participant => participant.puuid === puuid)?.item0,
            item_1: details.info.participants.find(participant => participant.puuid === puuid)?.item1,
            item_2: details.info.participants.find(participant => participant.puuid === puuid)?.item2,
            item_3: details.info.participants.find(participant => participant.puuid === puuid)?.item3,
            item_4: details.info.participants.find(participant => participant.puuid === puuid)?.item4,
            item_5: details.info.participants.find(participant => participant.puuid === puuid)?.item5,
            trinket: details.info.participants.find(participant => participant.puuid === puuid)?.item6,
            total_dmg_dealt_champ: details.info.participants.find(participant => participant.puuid === puuid)?.totalDamageDealtToChampions,
            total_dmg_taken: details.info.participants.find(participant => participant.puuid === puuid)?.totalDamageTaken,
            turret_kills: details.info.participants.find(participant => participant.puuid === puuid)?.turretKills,
            vision_score: details.info.participants.find(participant => participant.puuid === puuid)?.visionScore,
            total_vision_wards: details.info.participants.find(participant => participant.puuid === puuid)?.visionWardsBoughtInGame,
            wards_killed: details.info.participants.find(participant => participant.puuid === puuid)?.wardsKilled,
            wards_placed: details.info.participants.find(participant => participant.puuid === puuid)?.wardsPlaced,
            dmg_min: details.info.participants.find(participant => participant.puuid === puuid)?.challenges.damagePerMinute,
            gold_min: details.info.participants.find(participant => participant.puuid === puuid)?.challenges.goldPerMinute,
            team_dmg_percentage: details.info.participants.find(participant => participant.puuid === puuid)?.challenges.teamDamagePercentage,
            vision_score_min: details.info.participants.find(participant => participant.puuid === puuid)?.challenges.visionScorePerMinute,
          }

          // Check if the game ID already exists in the database
          const { data: existingGame, error: fetchError } = await supabase
            .from("soloq")
            .select("id")
            .eq("id", gameDetail.id)
            .single();

          if (fetchError) {
            console.error("Error checking for existing game:", fetchError.message);
            throw fetchError;
          }

          if (!existingGame) {
            // If the game ID does not exist, insert the new game data
            const response = await insertGameSupa(gameDetail);
            console.log(response);
          } else {
            console.log(`Game with ID ${gameDetail.id} already exists.`);
          }

          gameDetails.push(gameDetail);

          const timeline2 = await fetchGameTimeline(game);
        }
      }
      test++;
    }

    return player_stats;

  } catch (error) {
    console.error("Failed to fetch game details:", error);
    throw error;
  }
}

// Helper function to fetch game details
async function fetchGameDetails(gameId) {
  try {
    const response = await fetch(`/api/lol/match/v5/matches/${gameId}`);
    if (!response.ok) {
      throw new Error(`Error fetching game ${gameId}: ${response.statusText}`);
    }
    const data = await response.json();
    return data; // Return the fetched game details
  } catch (error) {
    console.error(`Failed to fetch game ${gameId}:`, error);
    throw error; // Re-throw the error for the caller to handle
  }
}

async function insertGameSupa(game) {
  const { data, error } = await supabase.from("soloq")
    .insert({
      id: game.id,
      player_id: game.player_id,
      game_time: game.game_time,
      blue_top: game.blue_top,
      blue_jungler: game.blue_jungler,
      blue_mid: game.blue_mid,
      blue_bottom: game.blue_bottom,
      blue_support: game.blue_support,
      red_top: game.red_top,
      red_jungler: game.red_jungler,
      red_mid: game.red_mid,
      red_bottom: game.red_bottom,
      red_support: game.red_support,
      end_timestamp: game.end_timestamp,
      patch: game.patch,
      win: game.win
    })
    .select();

  if (error) {
    console.error("Error inserting game data:", error.message);
    return null;
  }
  return data;  // Optionally return the inserted data if you need it
}


async function fetchGameTimeline(gameId) {
  try {
    const response = await fetch(`/api/lol/match/v5/matches/${gameId}/timeline`);
    if (!response.ok) {
      throw new Error(`Error fetching game ${gameId}: ${response.statusText}`);
    }
    const data = await response.json();
    return data; // Return the fetched game details
  } catch (error) {
    console.error(`Failed to fetch game ${gameId}:`, error);
    throw error; // Re-throw the error for the caller to handle
  }
}