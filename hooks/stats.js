import { supabase } from "@/supabase";

function args({ team, player, days, queue }) {
  return {
    p_team: team ?? null,
    p_player: player ?? null,
    p_since: days ? new Date(Date.now() - days * 86400000).toISOString() : null,
    p_queue: queue ?? null,
  };
}

export async function fetchPlayerStats(filters) {
  const { data, error } = await supabase.rpc("player_stats", args(filters));
  if (error) throw new Error(error.message);
  return data;
}

export async function fetchChampionStats(filters) {
  const { data, error } = await supabase.rpc("champion_stats", args(filters));
  if (error) throw new Error(error.message);
  return data;
}

export async function fetchRecentTeamMatches(playerIds, limit = 8) {
  if (playerIds.length === 0) return [];
  const { data, error } = await supabase
    .from("player_match")
    .select("id, player_id, champion, win, kills, deaths, assists, match:match_id(queue_id, duration, ended_at)")
    .in("player_id", playerIds);
  if (error) throw new Error(error.message);
  return data
    .filter((r) => r.match.duration >= 300)
    .sort((a, b) => new Date(b.match.ended_at) - new Date(a.match.ended_at))
    .slice(0, limit);
}

export async function fetchTeamRanks(playerIds) {
  if (playerIds.length === 0) return [];
  const { data, error } = await supabase
    .from("rank_snapshot")
    .select("*")
    .in("player_id", playerIds)
    .eq("queue", "RANKED_SOLO_5x5");
  if (error) throw new Error(error.message);
  return data;
}

// Totals for a list of player_stats rows.
export function sumStats(rows) {
  const t = { games: 0, wins: 0, kills: 0, deaths: 0, assists: 0, cs: 0, minutes: 0, damage: 0, vision: 0 };
  rows.forEach((r) => {
    Object.keys(t).forEach((k) => (t[k] += Number(r[k]) || 0));
  });
  return t;
}
