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

  // console.log(game_list);
  // return "teste";

  /* FETCH EACH GAME DETAILS ASYNCHRONOUSLY */
  try {
    let player_stats = [];
    let timeline_fetch = [];

    for (const game of game_list) {
      const details = await fetchGameDetails(game); // Fetch the details for each game

      if (details) {
        let gameDetail = [];

        if (details.info.queueId === 420) {
          gameDetail = {
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
            timeline_stats: []
          }

          timeline_fetch = await fetchGameTimeline(game, puuid);
          player_stats.timeline_stats = timeline_fetch;

          await insertGameSupa(gameDetail, player_stats);
        }
      }
    }
  } catch (error) {
    console.error("Failed to fetch game details:", error);
    throw error;
  }

  return true;
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

// Helper function to check if a game already exists
async function gameExists(gameId) {
  const { data, error } = await supabase
    .from("soloq")
    .select("id")
    .eq("id", gameId)
    .single();

  if (error) {
    if (error.code === "PGRST116") { // Handle the case where the record is not found
      return false;
    } else {
      console.error("Error checking if game exists:", error.message);
      throw error;
    }
  }

  return data !== null;
}

async function insertGameSupa(game, stats) {
  const exists = await gameExists(game.id);
  if (exists) {
    console.log(`Game with ID ${game.id} already exists. Skipping insertion.`);
    return;
  }

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
    });

  if (error) {
    console.error("Error inserting game data:", error.message);
    return null;
  }

  const { data_stats, error_stats } = await supabase.from("soloq_stats")
    .insert({
      soloq_id: game.id,
      kills: stats.kills,
      deaths: stats.deaths,
      assists: stats.assists,
      champion_name: stats.champion_name,
      sum_spell_1: stats.sum_spell_1,
      sum_spell_2: stats.sum_spell_2,
      kill_part: stats.kill_part,
      total_minions_killed: stats.total_minions_killed,
      dmg_dealt_turrets: stats.dmg_dealt_turrets,
      dmg_dealt_objectives: stats.dmg_dealt_objectives,
      gold_earned: stats.gold_earned,
      role_pos: stats.role_pos,
      item_0: stats.item_0,
      item_1: stats.item_1,
      item_2: stats.item_2,
      item_3: stats.item_3,
      item_4: stats.item_4,
      item_5: stats.item_5,
      trinket: stats.trinket,
      total_dmg_dealt_champ: stats.total_dmg_dealt_champ,
      total_dmg_taken: stats.total_dmg_taken,
      turret_kills: stats.turret_kills,
      vision_score: stats.vision_score,
      total_vision_wards: stats.total_vision_wards,
      wards_killed: stats.wards_killed,
      wards_placed: stats.wards_placed,
      dmg_min: stats.dmg_min,
      gold_min: stats.gold_min,
      team_dmg_percentage: stats.team_dmg_percentage,
      vision_score_min: stats.vision_score_min,
      assists_at_10: stats.timeline_stats.assists_at_10,
      assists_at_20: stats.timeline_stats.assists_at_20,
      deaths_at_10: stats.timeline_stats.deaths_at_10,
      deaths_at_20: stats.timeline_stats.deaths_at_20,
      dmg_at_10: stats.timeline_stats.dmg_at_10,
      dmg_at_20: stats.timeline_stats.dmg_at_20,
      gold_at_10: stats.timeline_stats.gold_at_10,
      gold_at_20: stats.timeline_stats.gold_at_20,
      kills_at_10: stats.timeline_stats.kills_at_10,
      kills_at_20: stats.timeline_stats.kills_at_20,
      wards_at_10: stats.timeline_stats.wards_at_10,
      wards_at_20: stats.timeline_stats.wards_at_20,
    });

  if (error_stats) {
    console.error("Error inserting game stats data:", error_stats.message);
    return null;
  }

  return data_stats;
}

async function fetchGameTimeline(gameId, puuid) {
  try {
    const response = await fetch(`/api/lol/match/v5/matches/${gameId}/timeline`);
    if (!response.ok) {
      throw new Error(`Error fetching game ${gameId}: ${response.statusText}`);
    }
    const timeline_fetch = await response.json();

    const participantIndex = timeline_fetch.metadata.participants.findIndex(participant => participant === puuid);

    const timeline_stats = {
      wards_at_10: 0,
      wards_at_20: 0,
      kills_at_10: 0,
      kills_at_20: 0,
      assists_at_10: 0,
      assists_at_20: 0,
      deaths_at_10: 0,
      deaths_at_20: 0,
      dmg_at_10: 0,
      dmg_at_20: 0,
      gold_at_10: 0,
      gold_at_20: 0,
    };

    if (timeline_fetch.info.frames.length > 10) {
      const frame10 = timeline_fetch.info.frames[10];
      if (frame10 && frame10.participantFrames && frame10.participantFrames[participantIndex]) {
        timeline_stats.dmg_at_10 = frame10.participantFrames[participantIndex].damageStats.totalDamageDoneToChampions || 0;
        timeline_stats.gold_at_10 = frame10.participantFrames[participantIndex].totalGold || 0;
      }
    }

    if (timeline_fetch.info.frames.length > 20) {
      const frame20 = timeline_fetch.info.frames[20];
      if (frame20 && frame20.participantFrames && frame20.participantFrames[participantIndex]) {
        timeline_stats.dmg_at_20 = frame20.participantFrames[participantIndex].damageStats.totalDamageDoneToChampions || 0;
        timeline_stats.gold_at_20 = frame20.participantFrames[participantIndex].totalGold || 0;
      }
    }

    timeline_fetch.info.frames.forEach((frame, index) => {
      if (frame.events) {
        frame.events.forEach(event => {
          // Count Wards
          if (event.type === "WARD_PLACED" && event.creatorId === participantIndex) {
            if (index < 11) timeline_stats.wards_at_10++;
            if (index < 21) timeline_stats.wards_at_20++;
          }

          // Count Kills
          if (event.type === "CHAMPION_KILL" && event.killerId === participantIndex) {
            if (index < 11) timeline_stats.kills_at_10++;
            if (index < 21) timeline_stats.kills_at_20++;
          }

          // Count Assists
          if (event.type === "CHAMPION_KILL" && event.assistingParticipantIds && event.assistingParticipantIds.includes(participantIndex)) {
            if (index < 11) timeline_stats.assists_at_10++;
            if (index < 21) timeline_stats.assists_at_20++;
          }

          // Count Deaths
          if (event.type === "CHAMPION_KILL" && event.victimId === participantIndex) {
            if (index < 11) timeline_stats.deaths_at_10++;
            if (index < 21) timeline_stats.deaths_at_20++;
          }
        });
      }
    });

    return timeline_stats; // Return the fetched game details
  } catch (error) {
    console.error(`Failed to fetch game ${gameId}:`, error);
    throw error; // Re-throw the error for the caller to handle
  }
}
