import { isDemoUser, json, requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMatch, getMatchIds, getTimeline, RiotError, toRows } from "@/lib/riot";

export const maxDuration = 60;

const BATCH = 6;
const FIRST_SYNC_DAYS = 90;

// Syncs one batch of new matches. The client calls it until `remaining` is 0.
export async function POST(request, { params }) {
  const { supabase, user, error } = await requireUser();
  if (error) return error;
  if (isDemoUser(user)) return json({ error: "Sync is disabled in the demo account" }, 403);

  // RLS guarantees the player belongs to the caller.
  const { data: player } = await supabase
    .from("player")
    .select("id, region, riot_puuid, last_synced_at")
    .eq("id", params.id)
    .maybeSingle();
  if (!player) return json({ error: "Player not found" }, 404);

  const since = player.last_synced_at
    ? new Date(player.last_synced_at)
    : new Date(Date.now() - FIRST_SYNC_DAYS * 86400000);
  const startTime = Math.floor(since.getTime() / 1000);

  try {
    const ids = (await getMatchIds(player.riot_puuid, player.region, { startTime })) || [];

    const { data: existing } = await supabase
      .from("player_match")
      .select("match_id")
      .eq("player_id", player.id)
      .in("match_id", ids.length ? ids : [""]);
    const known = new Set((existing || []).map((row) => row.match_id));
    const pending = ids.filter((id) => !known.has(id));
    const batch = pending.slice(0, BATCH);

    const admin = createAdminClient();
    let saved = 0;

    for (const matchId of batch) {
      const matchData = await getMatch(matchId, player.region);
      if (!matchData) continue;
      const timeline = await getTimeline(matchId, player.region);
      const rows = toRows(matchData, timeline, player.riot_puuid);
      if (!rows) continue;

      const { error: matchError } = await admin.from("match").upsert(rows.match);
      if (matchError) throw new Error(matchError.message);
      const { error: pmError } = await admin
        .from("player_match")
        .upsert({ ...rows.playerMatch, player_id: player.id, match_id: rows.match.id }, { onConflict: "player_id,match_id" });
      if (pmError) throw new Error(pmError.message);
      saved++;
    }

    const remaining = Math.max(pending.length - batch.length, 0);
    if (remaining === 0) {
      await admin.from("player").update({ last_synced_at: new Date().toISOString() }).eq("id", player.id);
    }

    return json({ saved, remaining, total: ids.length });
  } catch (e) {
    const status = e instanceof RiotError ? e.status : 500;
    return json({ error: e.message }, status);
  }
}
