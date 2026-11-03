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
  let ids; // the first call lists the match ids; the next ones reuse the pending list

  for (let i = 0; i < 100; i++) {
    const response = await fetch(`/api/players/${player_id}/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ids ? { ids } : {}),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(body.error || "Sync failed");
      error.code = body.code;
      throw error;
    }

    done += body.saved;
    total = Math.max(total, done + body.remaining);
    onProgress?.(done, total);

    ids = body.pending;
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

// Personal availability links ------------------------------------------------
export async function fetchInvite(player_id) {
  const { data, error } = await supabase
    .from("player_invite")
    .select("id, token, created_at, last_used_at")
    .eq("player_id", player_id)
    .is("revoked_at", null)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function createInvite(player_id) {
  const response = await fetch(`/api/players/${player_id}/invite`, { method: "POST" });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || "Could not create the link");
  return body.invite;
}

export async function revokeInvite(player_id) {
  const response = await fetch(`/api/players/${player_id}/invite`, { method: "DELETE" });
  if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error || "Could not revoke the link");
}

// Private notes and goals -----------------------------------------------------
export async function fetchNotes(player_id) {
  const { data, error } = await supabase
    .from("player_note")
    .select("id, kind, body, status, due_date, created_at")
    .eq("player_id", player_id)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function addNote({ player_id, kind, body, due_date }) {
  const { data, error } = await supabase
    .from("player_note")
    .insert({ player_id, kind, body, due_date: due_date || null })
    .select("id, kind, body, status, due_date, created_at")
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateNote(id, changes) {
  const { data, error } = await supabase
    .from("player_note")
    .update(changes)
    .eq("id", id)
    .select("id, kind, body, status, due_date, created_at")
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteNote(id) {
  const { error } = await supabase.from("player_note").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
