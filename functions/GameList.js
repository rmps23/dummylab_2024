import { supabase } from "@/supabase";

async function getSupaPlayerData(playerID) {
  const { data, error } = await supabase
    .from("game_list")
    .select("*")
    .eq("player_id", playerID)
    .order("game_end_timestamp", { ascending: false }); // Order by game_end_timestamp, descending

  if (error) {
    console.error("Error retrieving player data:", error.message);
    return null;
  }

  return data;
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

      await Promise.all(
        matchIds.map(async (element) => {
          await fetchMatchQeueu(element, puuid, playerID);
        })
      );
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

    let game_details = {};
    game_details["game_time"] = Math.round(matchData.info.gameDuration / 60);
    game_details["game_end_timestamp"] = matchData.info.gameEndTimestamp;

    game_details["team_blue"] = [];
    game_details["team_red"] = [];
    game_details["player"] = [];

    if (matchData.info.queueId == 420) {
      matchData.info.participants.forEach((part, index) => {
        if (puuid == part.puuid) {
          game_details["player"] = {
            participantId: part.participantId,
            kills: part.kills,
            deaths: part.deaths,
            assists: part.assists,
            championId: part.championId,
            championName: part.championName,
            summoner1Id: part.summoner1Id,
            summoner2Id: part.summoner2Id,
            killParticipation: part.challenges.killParticipation,
            totalMinionsKilled: part.totalMinionsKilled,
            damageDealtToTurrets: part.damageDealtToTurrets,
            damageDealtToObjectives: part.damageDealtToObjectives,
            goldEarned: part.goldEarned,
            individualPosition: part.individualPosition,
            item0: part.item0,
            item1: part.item1,
            item2: part.item2,
            item3: part.item3,
            item4: part.item4,
            item5: part.item5,
            item6: part.item6,
            lane: part.lane,
            role: part.role,
            teamPosition: part.teamPosition,
            totalDamageDealtToChampions: part.totalDamageDealtToChampions,
            totalDamageTaken: part.totalDamageTaken,
            teamDamagePercentage: part.challenges.teamDamagePercentage,
            damagePerMinute: part.challenges.damagePerMinute,
            goldPerMinute: part.challenges.goldPerMinute,
            totalHealsOnTeammates: part.totalHealsOnTeammates,
            turretTakedowns: part.turretTakedowns,
            visionScore: part.visionScore,
            visionWardsBoughtInGame: part.visionWardsBoughtInGame,
            wardsKilled: part.wardsKilled,
            wardsPlaced: part.wardsPlaced,
            visionScorePerMinute: part.challenges.visionScorePerMinute,
            gameVersion: matchData.info.gameVersion,
            win: part.win,
          };
        }

        // ====================================

        if (index < 5) {
          game_details["team_blue"][index] = {
            champ_id: part.championId,
            champ_name: part.championName,
            kills: part.kills,
            assists: part.assists,
            deaths: part.deaths,
            kda: part.challenges.kda,
            totalMinionsKilled: part.totalMinionsKilled,
            minionsKilledPerMinute:
              part.totalMinionsKilled / game_details["game_time"],
            killParticipation: part.killParticipation,
            summoner1Id: part.summoner1Id,
            summoner2Id: part.summoner1Id,
            item0: part.item0,
            item1: part.item1,
            item2: part.item2,
            item3: part.item3,
            item4: part.item4,
            item5: part.item5,
            item6: part.item6,
            rune_prime: part.perks.styles[0].selections[0].perk,
            rune_sec: part.perks.styles[1].selections[0].perk,
            totalDamageDealtToChampions: part.totalDamageDealtToChampions,
            totalDamageTaken: part.totalDamageTaken,
            teamDamagePercentage: part.teamDamagePercentage,
            goldEarned: part.goldEarned,
            wardsKilled: part.wardsKilled,
            wardsPlaced: part.wardsPlaced,
            teamBaronKills: part.challenges.teamBaronKills,
            lane: part.lane,
            teamId: part.teamId,
            win: part.win,
          };
        } else {
          game_details["team_red"][index - 5] = {
            champ_id: part.championId,
            champ_name: part.championName,
            kills: part.kills,
            assists: part.assists,
            deaths: part.deaths,
            kda: part.challenges.kda,
            totalMinionsKilled: part.totalMinionsKilled,
            minionsKilledPerMinute:
              part.totalMinionsKilled / game_details["game_time"],
            killParticipation: part.killParticipation,
            summoner1Id: part.summoner1Id,
            summoner2Id: part.summoner1Id,
            item0: part.item0,
            item1: part.item1,
            item2: part.item2,
            item3: part.item3,
            item4: part.item4,
            item5: part.item5,
            item6: part.item6,
            rune_prime: part.perks.styles[0].selections[0].perk,
            rune_sec: part.perks.styles[1].selections[0].perk,
            totalDamageDealtToChampions: part.totalDamageDealtToChampions,
            totalDamageTaken: part.totalDamageTaken,
            teamDamagePercentage: part.teamDamagePercentage,
            goldEarned: part.goldEarned,
            wardsKilled: part.wardsKilled,
            wardsPlaced: part.wardsPlaced,
            teamBaronKills: part.challenges.teamBaronKills,
            lane: part.lane,
            teamId: part.teamId,
            win: part.win,
          };
        }
      });

      await getGameTimeline(playerID, matchId, game_details);
    }
  } catch (error) {
    console.error(`Failed to fetch match info for ${matchId}:`, error);
    throw error; // Re-throw the error after logging it
  }
}

async function insertGameStats(playerID, matchId, game_details) {
  const { data: existingData, error: existingError } = await supabase
    .from("game_list")
    .select("game_id")
    .eq("game_id", matchId);

  if (existingError) {
    console.error("Error checking existing match:", existingError);
    return null;
  }

  if (existingData && existingData.length > 0) {
    console.log(
      `MatchId ${matchId} already exists in the database. Skipping insertion.`
    );
    return;
  }

  const { data, error } = await supabase.from("game_list").upsert(
    {
      game_id: matchId,
      player_id: playerID,
      game_time: game_details["game_time"],
      game_end_timestamp: game_details["game_end_timestamp"],
      blue_top: game_details["team_blue"][0],
      blue_jungler: game_details["team_blue"][1],
      blue_mid: game_details["team_blue"][2],
      blue_bot: game_details["team_blue"][3],
      blue_sup: game_details["team_blue"][4],
      red_top: game_details["team_red"][0],
      red_jungler: game_details["team_red"][1],
      red_mid: game_details["team_red"][2],
      red_bot: game_details["team_red"][3],
      red_sup: game_details["team_red"][4],
      kills: game_details["player"]["kills"],
      deaths: game_details["player"]["deaths"],
      assists: game_details["player"]["assists"],
      championId: game_details["player"]["championId"],
      championName: game_details["player"]["championName"],
      summoner1Id: game_details["player"]["summoner1Id"],
      summoner2Id: game_details["player"]["summoner2Id"],
      killParticipation: game_details["player"]["killParticipation"],
      totalMinionsKilled: game_details["player"]["totalMinionsKilled"],
      damageDealtToTurrets: game_details["player"]["damageDealtToTurrets"],
      damageDealtToObjectives:
        game_details["player"]["damageDealtToObjectives"],
      goldEarned: game_details["player"]["goldEarned"],
      individualPosition: game_details["player"]["individualPosition"],
      item0: game_details["player"]["item0"],
      item1: game_details["player"]["item1"],
      item2: game_details["player"]["item2"],
      item3: game_details["player"]["item3"],
      item4: game_details["player"]["item4"],
      item5: game_details["player"]["item5"],
      item6: game_details["player"]["item6"],
      lane: game_details["player"]["lane"],
      role: game_details["player"]["role"],
      teamPosition: game_details["player"]["teamPosition"],
      totalDamageDealtToChampions:
        game_details["player"]["totalDamageDealtToChampions"],
      totalDamageTaken: game_details["player"]["totalDamageTaken"],
      totalHealsOnTeammates: game_details["player"]["totalHealsOnTeammates"],
      turretKills: game_details["player"]["turretKills"],
      visionScore: game_details["player"]["visionScore"],
      visionWardsBoughtInGame:
        game_details["player"]["visionWardsBoughtInGame"],
      wardsKilled: game_details["player"]["wardsKilled"],
      wardsPlaced: game_details["player"]["wardsPlaced"],
      gameVersion: game_details["player"]["gameVersion"],
      damagePerMinute: game_details["player"]["damagePerMinute"],
      goldPerMinute: game_details["player"]["goldPerMinute"],
      teamDamagePercentage: game_details["player"]["teamDamagePercentage"],
      visionScorePerMinute: game_details["player"]["visionScorePerMinute"],
      win: game_details["player"]["win"],
      assists_at_10: game_details["player"]["game_stats"]["assists_at_10"],
      assists_at_20: game_details["player"]["game_stats"]["assists_at_20"],
      assists_at_f: game_details["player"]["game_stats"]["assists_at_f"],
      deaths_at_10: game_details["player"]["game_stats"]["deaths_at_10"],
      deaths_at_20: game_details["player"]["game_stats"]["deaths_at_20"],
      deaths_at_f: game_details["player"]["game_stats"]["deaths_at_f"],
      dmg_at_10: game_details["player"]["game_stats"]["dmg_at_10"],
      dmg_at_20: game_details["player"]["game_stats"]["dmg_at_20"],
      dmg_at_f: game_details["player"]["game_stats"]["dmg_at_f"],
      gold_at_10: game_details["player"]["game_stats"]["gold_at_10"],
      gold_at_20: game_details["player"]["game_stats"]["gold_at_20"],
      gold_at_f: game_details["player"]["game_stats"]["gold_at_f"],
      kills_at_10: game_details["player"]["game_stats"]["kills_at_10"],
      kills_at_20: game_details["player"]["game_stats"]["kills_at_20"],
      kills_at_f: game_details["player"]["game_stats"]["kills_at_f"],
      wards_at_10: game_details["player"]["game_stats"]["wards_at_10"],
      wards_at_20: game_details["player"]["game_stats"]["wards_at_20"],
      wards_at_f: game_details["player"]["game_stats"]["wards_at_f"],
    },
    { onConflict: "game_id" }
  );
  if (error) {
    console.error("Error inserting game stats:", error);
    return null;
  }
}

async function getGameTimeline(playerID, matchId, game_details) {
  const game_timeline = `/api/lol/match/v5/matches/${matchId}/timeline`;

  try {
    const response = await fetch(game_timeline, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    const timeline = await response.json();
    const frames = timeline.info.frames;
    const participantId = game_details["player"]["participantId"];

    game_details["player"]["game_stats"] = {
      kills_at_10: 0,
      kills_at_20: 0,
      kills_at_f: 0,
      deaths_at_10: 0,
      deaths_at_20: 0,
      deaths_at_f: 0,
      assists_at_10: 0,
      assists_at_20: 0,
      assists_at_f: 0,
      gold_at_10: 0,
      gold_at_20: 0,
      gold_at_f: 0,
      wards_at_10: 0,
      wards_at_20: 0,
      wards_at_f: 0,
      dmg_at_10: 0,
      dmg_at_20: 0,
      dmg_at_f: 0,
    };

    const processFrame = (frame, statSuffix) => {
      if (frame && frame.events) {
        frame.events.forEach((fe) => {
          if (fe.type === "CHAMPION_KILL" && fe.killerId === participantId) {
            game_details.player.game_stats[`kills_${statSuffix}`] += 1;
          }
          if (fe.type === "CHAMPION_KILL" && fe.victimId === participantId) {
            game_details.player.game_stats[`deaths_${statSuffix}`] += 1;
          }
          if (
            fe.type === "CHAMPION_KILL" &&
            fe.hasOwnProperty("assistingParticipantIds")
          ) {
            if (fe.assistingParticipantIds.includes(participantId)) {
              game_details.player.game_stats[`assists_${statSuffix}`] += 1;
            }
          }
          if (fe.type === "WARD_PLACED" && fe.creatorId === participantId) {
            game_details.player.game_stats[`wards_${statSuffix}`] += 1;
          }
        });
      }
    };

    for (let i = 0; i < 11; i++) {
      processFrame(frames[i], "at_10");
    }
    for (let i = 0; i < 21; i++) {
      processFrame(frames[i], "at_20");
    }
    for (let i = 0; i < frames.length; i++) {
      processFrame(frames[i], "at_f");
    }

    if (frames[10] && frames[10].participantFrames[participantId]) {
      game_details.player.game_stats.gold_at_10 =
        frames[10].participantFrames[participantId].totalGold;
      game_details.player.game_stats.dmg_at_10 =
        frames[10].participantFrames[participantId].damageStats.totalDamageDone;
    }

    if (frames[20] && frames[20].participantFrames[participantId]) {
      game_details.player.game_stats.gold_at_20 =
        frames[20].participantFrames[participantId].totalGold;
      game_details.player.game_stats.dmg_at_20 =
        frames[20].participantFrames[participantId].damageStats.totalDamageDone;
    }

    const lastFrame = frames[frames.length - 1];
    if (lastFrame && lastFrame.participantFrames[participantId]) {
      game_details.player.game_stats.gold_at_f =
        lastFrame.participantFrames[participantId].totalGold;
      game_details.player.game_stats.dmg_at_f =
        lastFrame.participantFrames[participantId].damageStats.totalDamageDone;
    }

    await insertGameStats(playerID, matchId, game_details);
  } catch (error) {
    console.error("Failed to fetch match IDs:", error);
    throw error; // Re-throw the error after logging it
  }
}

export { getSupaPlayerData, getPlayerRiotInfo };
