import { supabase } from "@/supabase";

async function getSupaStats(playerID) {
  try {
    const { data, error } = await supabase
      .from("player_stats")
      .select("*")
      .eq("player_id", playerID);

    if (error) {
      console.error("Error fetching players:", error.message);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error fetching players:", error.message);
    return null;
  }
}

async function updateStats(playerID) {
  try {
    const { data, error } = await supabase
      .from("game_list")
      .select("*")
      .eq("player_id", playerID);

    if (error) {
      console.error("Error fetching players:", error.message);
      return null;
    }

    let stats = {
      total_games: data.length,
      kills: 0,
      deaths: 0,
      assists: 0,
      championids: {},
      kill_part: 0,
      total_minions: 0,
      dmg_dealt_turrets: 0,
      dmg_dealt_objs: 0,
      total_gold: 0,
      teampositions: [],
      total_dmg_to_champs: 0,
      total_dmg_taken: 0,
      total_heal_mate: 0,
      turret_kills: 0,
      vision_score: 0,
      total_vision_wards: 0,
      wards_killed: 0,
      wards_placed: 0,
      win: 0,
      lose: 0,
      dmg_per_min: 0,
      gold_per_min: 0,
      teamdamagepercentage: 0,
      visionscoreperminute: 0,
      assists_at_10: 0,
      assists_at_20: 0,
      assists_at_f: 0,
      deaths_at_10: 0,
      deaths_at_20: 0,
      deaths_at_f: 0,
      dmg_at_10: 0,
      dmg_at_20: 0,
      dmg_at_f: 0,
      gold_at_10: 0,
      gold_at_20: 0,
      gold_at_f: 0,
      kills_at_10: 0,
      kills_at_20: 0,
      kills_at_f: 0,
      wards_at_10: 0,
      wards_at_20: 0,
      wards_at_f: 0,
    };

    data.forEach((game) => {
      stats.kills += game.kills;
      stats.deaths += game.deaths;
      stats.assists += game.assists;

      if (stats.championids.hasOwnProperty(game.championId)) {
        stats.championids[game.championId].count++;
      } else {
        stats.championids[game.championId] = {
          championId: game.championId,
          championName: game.championName,
          count: 1
        };
      }

      stats.kill_part += game.killParticipation;
      stats.total_minions += game.totalMinionsKilled;
      stats.dmg_dealt_turrets += game.damageDealtToTurrets;
      stats.dmg_dealt_objs += game.damageDealtToObjectives;
      stats.total_gold += game.goldEarned;
      stats.total_dmg_to_champs += game.totalDamageDealtToChampions;
      stats.total_dmg_taken += game.totalDamageTaken;
      stats.total_heal_mate += game.totalHealsOnTeammates;
      stats.turret_kills += game.turretKills;
      stats.vision_score += game.visionScore;
      stats.total_vision_wards += game.visionWardsBoughtInGame;
      stats.wards_killed += game.wardsKilled;
      stats.wards_placed += game.wardsPlaced;
      stats.dmg_per_min += game.damagePerMinute;
      stats.gold_per_min += game.goldPerMinute;
      stats.teamdamagepercentage += game.teamDamagePercentage;
      stats.visionscoreperminute += game.visionScorePerMinute;
      stats.assists_at_10 += game.assists_at_10;
      stats.assists_at_20 += game.assists_at_20;
      stats.assists_at_f += game.assists_at_f;
      stats.deaths_at_10 += game.deaths_at_10;
      stats.deaths_at_20 += game.deaths_at_20;
      stats.deaths_at_f += game.deaths_at_f;
      stats.dmg_at_10 += game.dmg_at_10;
      stats.dmg_at_20 += game.dmg_at_20;
      stats.dmg_at_f += game.dmg_at_f;
      stats.gold_at_10 += game.gold_at_10;
      stats.gold_at_20 += game.gold_at_20;
      stats.gold_at_f += game.gold_at_f;
      stats.kills_at_10 += game.kills_at_10;
      stats.kills_at_20 += game.kills_at_20;
      stats.kills_at_f += game.kills_at_f;
      stats.wards_at_10 += game.wards_at_10;
      stats.wards_at_20 += game.wards_at_20;
      stats.wards_at_f += game.wards_at_f;

      if (game.win === true) {
        stats.win += 1;
      } else {
        stats.lose += 1;
      }

      const positionIndex = stats.teampositions.findIndex(
        (pos) => pos.position === game.teamPosition
      );
      if (positionIndex !== -1) {
        stats.teampositions[positionIndex].count++;
      } else {
        stats.teampositions.push({ position: game.teamPosition, count: 1 });
      }
    });

    let championArray = [];
    for (let key in stats.championids) {
      championArray.push(stats.championids[key]);
    }
    championArray.sort((a, b) => b.count - a.count);
    const top5Champions = championArray.slice(0, 5);
    stats.championids = top5Champions;

    const { data: updateData, error: updateError } = await supabase
      .from("player_stats")
      .upsert({
        player_id: playerID,
        total_games: stats.total_games,
        kills: stats.kills,
        deaths: stats.deaths,
        assists: stats.assists,
        championids: stats.championids,
        kill_part: stats.kill_part,
        total_minions: stats.total_minions,
        dmg_dealt_turrets: stats.dmg_dealt_turrets,
        dmg_dealt_objs: stats.dmg_dealt_objs,
        total_gold: stats.total_gold,
        teampositions: stats.teampositions,
        total_dmg_to_champs: stats.total_dmg_to_champs,
        total_dmg_taken: stats.total_dmg_taken,
        total_heal_mate: stats.total_heal_mate,
        turret_kills: stats.turret_kills,
        vision_score: stats.vision_score,
        total_vision_wards: stats.total_vision_wards,
        wards_killed: stats.wards_killed,
        wards_placed: stats.wards_placed,
        win: stats.win,
        lose: stats.lose,
        dmg_per_min: stats.dmg_per_min,
        gold_per_min: stats.gold_per_min,
        teamdamagepercentage: stats.teamdamagepercentage,
        visionscoreperminute: stats.visionscoreperminute,
        assists_at_10: stats.assists_at_10,
        assists_at_20: stats.assists_at_20,
        assists_at_f: stats.assists_at_f,
        deaths_at_10: stats.deaths_at_10,
        deaths_at_20: stats.deaths_at_20,
        deaths_at_f: stats.deaths_at_f,
        dmg_at_10: stats.dmg_at_10,
        dmg_at_20: stats.dmg_at_20,
        dmg_at_f: stats.dmg_at_f,
        gold_at_10: stats.gold_at_10,
        gold_at_20: stats.gold_at_20,
        gold_at_f: stats.gold_at_f,
        kills_at_10: stats.kills_at_10,
        kills_at_20: stats.kills_at_20,
        kills_at_f: stats.kills_at_f,
        wards_at_10: stats.wards_at_10,
        wards_at_20: stats.wards_at_20,
        wards_at_f: stats.wards_at_f,
        updated_at: new Date().toISOString(),
      });

    if (updateError) {
      console.error("Error updating player stats:", updateError.message);
      return null;
    }

    return updateData;
  } catch (error) {
    console.error("Error fetching players:", error.message);
    return null;
  }
}


export { updateStats, getSupaStats };
