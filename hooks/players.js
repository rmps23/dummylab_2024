import { supabase } from "@/supabase";

const PLAYER_SELECT =
  "id, name, region, team_id, role_id, riot_id, riot_puuid, last_synced_at, role:role_id(id, name)";

export async function fetchPlayers() {
  const { data, error } = await supabase.from("player").select(PLAYER_SELECT).order("created_at");
  if (error) throw new Error(error.message);
  return data;
}

export async function fetchPlayer(player_id) {
  const { data, error } = await supabase.from("player").select(PLAYER_SELECT).eq("id", player_id).single();
  if (error) throw new Error(error.message);
  return data;
}

export async function insertPlayer({ team_id, name, region, role_id, riot_id, riot_puuid }) {
  const { data, error } = await supabase
    .from("player")
    .insert({ team_id, name, region, role_id, riot_id, riot_puuid })
    .select(PLAYER_SELECT)
    .single();
  if (error) {
    throw new Error(error.code === "23505" ? "This player is already in the team" : error.message);
  }
  return data;
}

export async function editPlayer(player_id, { name, team_id, role_id }) {
  const { data, error } = await supabase
    .from("player")
    .update({ name, team_id, role_id })
    .eq("id", player_id)
    .select(PLAYER_SELECT)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deletePlayer(player_id) {
  const { error } = await supabase.from("player").delete().eq("id", player_id);
  if (error) throw new Error(error.message);
}

export async function verifyPlayer(gameName, tagLine, regionCode) {
  const params = new URLSearchParams({ gameName, tagLine, region: regionCode });
  const response = await fetch(`/api/riot/verify?${params}`);
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || "Could not verify the player");
  return body; // { puuid, riotId }
}

// Calls the sync route until every new match is stored. onProgress(done, total).
export async function syncPlayer(player_id, onProgress) {
  let done = 0;
  let total = 0;

  for (let i = 0; i < 100; i++) {
    const response = await fetch(`/api/players/${player_id}/sync`, { method: "POST" });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.error || "Sync failed");

    done += body.saved;
    total = Math.max(total, done + body.remaining);
    onProgress?.(done, total);

    if (body.remaining === 0 || body.saved === 0) break;
  }
  return { done, total };
}

export async function refreshRank(player_id) {
  const response = await fetch(`/api/players/${player_id}/rank`, { method: "POST" });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || "Could not refresh rank");
  return body.entries;
}

export async function fetchMatches(player_id, limit = 50) {
  const { data, error } = await supabase
    .from("player_match")
    .select("*, match:match_id(id, queue_id, patch, duration, ended_at, draft)")
    .eq("player_id", player_id);
  if (error) throw new Error(error.message);
  return data
    .filter((row) => row.match.duration >= 300)
    .sort((a, b) => new Date(b.match.ended_at) - new Date(a.match.ended_at))
    .slice(0, limit);
}

export async function fetchRank(player_id) {
  const { data, error } = await supabase.from("rank_snapshot").select("*").eq("player_id", player_id);
  if (error) throw new Error(error.message);
  return data;
}
