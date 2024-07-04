import { supabase } from "@/supabase";

export async function fetchGames(puuid, acc_id, player_id, region) {
  try {
    let lastGameDate = await fetchLastGame(player_id);
    let LG_timestamp;

    if (lastGameDate) {
      let lastGame_ts = lastGameDate.created_at;
      let trimmedDateString = lastGame_ts.substring(0, 23) + "Z";
      let date = new Date(trimmedDateString);
      LG_timestamp = date.getTime();
    } else {
      LG_timestamp = 0;
    }

    let game_list = await fetchGameList(puuid, region);
    let existingGameIds = await fetchExistingGameIds(game_list);
    let newGameIds = game_list.filter(gameId => !existingGameIds.includes(gameId));

    for (const gameId of newGameIds) {
      const game_details = await fetchGameDetails(gameId, region, player_id, puuid);

      if (game_details && game_details.end_timestamp > LG_timestamp) {
        await insertGameSupa(game_details);
      }
    }

    return game_list;
  } catch (error) {
    console.error("Error fetching games:", error);
    throw error;
  }
}

async function fetchExistingGameIds(gameIds) {
  try {
    const { data, error } = await supabase
      .from("soloq")
      .select("id")
      .in("id", gameIds);

    if (error) {
      console.error("Error fetching existing game IDs:", error);
      return [];
    }

    return data.map(game => game.id);
  } catch (error) {
    console.error("Unexpected error fetching existing game IDs:", error);
    return [];
  }
}

async function fetchGameDetails(gameId, region, player_id, puuid) {
  try {
    const response = await fetch(`/api/lol/match/v5/matches/${gameId}/${region}`);
    if (!response.ok) {
      throw new Error(`Error fetching game ${gameId}: ${response.statusText}`);
    }

    const details = await response.json();

    let gameDetail = {};

    if (details.info.queueId === 420) {
      const participant = details.info.participants.find((participant) => participant.puuid === puuid);

      gameDetail = {
        id: gameId,
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
        early_surrender: details.info.participants[0].gameEndedInEarlySurrender,
        win: participant?.win || false,
        player_stats: {
          kills: participant?.kills,
          deaths: participant?.deaths,
          assists: participant?.assists,
          champion_name: participant?.championName,
          sum_spell_1: participant?.summoner1Id,
          sum_spell_2: participant?.summoner2Id,
          kill_part: participant?.challenges.killParticipation,
          total_minions_killed: participant?.totalMinionsKilled,
          dmg_dealt_turrets: participant?.damageDealtToTurrets,
          dmg_dealt_objectives: participant?.damageDealtToObjectives,
          gold_earned: participant?.goldEarned,
          role_pos: participant?.teamPosition,
          item_0: participant?.item0,
          item_1: participant?.item1,
          item_2: participant?.item2,
          item_3: participant?.item3,
          item_4: participant?.item4,
          item_5: participant?.item5,
          trinket: participant?.item6,
          total_dmg_dealt_champ: participant?.totalDamageDealtToChampions,
          total_dmg_taken: participant?.totalDamageTaken,
          turret_kills: participant?.turretKills,
          vision_score: participant?.visionScore,
          total_vision_wards: participant?.visionWardsBoughtInGame,
          wards_killed: participant?.wardsKilled,
          wards_placed: participant?.wardsPlaced,
          dmg_min: participant?.challenges.damagePerMinute,
          gold_min: participant?.challenges.goldPerMinute,
          team_dmg_percentage: participant?.challenges.teamDamagePercentage,
          vision_score_min: participant?.challenges.visionScorePerMinute,
        },
        timeline_stats: await fetchGameTimeline(gameId, puuid, region),
      };

      return gameDetail;
    }
  } catch (error) {
    console.error(`Failed to fetch game ${gameId}:`, error);
    throw error;
  }
}

async function fetchGameTimeline(gameId, puuid, region) {
  try {
    const response = await fetch(`/api/lol/match/v5/matches/${gameId}/timeline/${region}`);
    if (!response.ok) {
      throw new Error(`Error fetching game ${gameId}: ${response.statusText}`);
    }
    const timeline_fetch = await response.json();

    const participantIndex = timeline_fetch.metadata.participants.findIndex((participant) => participant === puuid);

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
        frame.events.forEach((event) => {
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

    return timeline_stats;
  } catch (error) {
    console.error(`Failed to fetch game ${gameId}:`, error);
    throw error;
  }
}

async function fetchGameList(puuid, region) {
  try {
    const response = await fetch(`/api/lol/match/v5/matches/by-puuid/${puuid}/ids/${region}`);
    if (!response.ok) {
      throw new Error(`Error fetching games: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch games:", error);
    throw error;
  }
}

async function fetchLastGame(player_id) {
  try {
    const { data, error } = await supabase
      .from("soloq")
      .select("created_at")
      .eq("player_id", player_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error("Error fetching the last game:", error);
      return null;
    }
    return data;
  } catch (err) {
    console.error("Unexpected error fetching the last game:", err);
    return null;
  }
}

async function insertGameSupa(game) {
  const { data, error } = await supabase.from("soloq").insert({
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
    win: game.win,
    early_surrender: game.early_surrender
  });

  if (error) {
    console.error("Error inserting game data:", error.message);
    return null;
  }

  const statsData = {
    soloq_id: game.id,
    kills: game.player_stats.kills,
    deaths: game.player_stats.deaths,
    assists: game.player_stats.assists,
    champion_name: game.player_stats.champion_name,
    sum_spell_1: game.player_stats.sum_spell_1,
    sum_spell_2: game.player_stats.sum_spell_2,
    kill_part: game.player_stats.kill_part || 0.0,
    total_minions_killed: game.player_stats.total_minions_killed,
    dmg_dealt_turrets: game.player_stats.dmg_dealt_turrets,
    dmg_dealt_objectives: game.player_stats.dmg_dealt_objectives,
    gold_earned: game.player_stats.gold_earned,
    role_pos: game.player_stats.role_pos,
    item_0: game.player_stats.item_0,
    item_1: game.player_stats.item_1,
    item_2: game.player_stats.item_2,
    item_3: game.player_stats.item_3,
    item_4: game.player_stats.item_4,
    item_5: game.player_stats.item_5,
    trinket: game.player_stats.trinket,
    total_dmg_dealt_champ: game.player_stats.total_dmg_dealt_champ,
    total_dmg_taken: game.player_stats.total_dmg_taken,
    turret_kills: game.player_stats.turret_kills,
    vision_score: game.player_stats.vision_score,
    total_vision_wards: game.player_stats.total_vision_wards,
    wards_killed: game.player_stats.wards_killed,
    wards_placed: game.player_stats.wards_placed,
    dmg_min: game.player_stats.dmg_min,
    gold_min: game.player_stats.gold_min,
    team_dmg_percentage: game.player_stats.team_dmg_percentage || 0.0,
    vision_score_min: game.player_stats.vision_score_min,
    assists_at_10: game.timeline_stats.assists_at_10,
    assists_at_20: game.timeline_stats.assists_at_20,
    deaths_at_10: game.timeline_stats.deaths_at_10,
    deaths_at_20: game.timeline_stats.deaths_at_20,
    dmg_at_10: game.timeline_stats.dmg_at_10,
    dmg_at_20: game.timeline_stats.dmg_at_20,
    gold_at_10: game.timeline_stats.gold_at_10,
    gold_at_20: game.timeline_stats.gold_at_20,
    kills_at_10: game.timeline_stats.kills_at_10,
    kills_at_20: game.timeline_stats.kills_at_20,
    wards_at_10: game.timeline_stats.wards_at_10,
    wards_at_20: game.timeline_stats.wards_at_20,
  };

  const { data_stats, error_stats } = await supabase
    .from("soloq_stats")
    .insert(statsData);

  if (error_stats) {
    console.error("Error inserting game stats data:", error_stats.message);
    return null;
  }

  return data_stats;
}
