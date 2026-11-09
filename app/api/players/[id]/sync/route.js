import { json, requireRiotUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMatch, getMatchIds, getTimeline, isMatchIdFor, RiotError, toRows } from "@/lib/riot";
import { canStoreMatch } from "@/lib/consent";

export const maxDuration = 60;

const BATCH = 6;
const FIRST_SYNC_DAYS = 90;

// Syncs one batch of new matches. The first call lists the match ids; it returns the ids still
// pending, and the client sends them back so the list is requested from Riot only once.
export async function POST(request, { params }) {
  const { supabase, error } = await requireRiotUser("sync", { limit: 20, windowMs: 60_000 });
  if (error) return error;

  // RLS guarantees the player belongs to the caller.
  const { data: player } = await supabase
    .from("player")
    .select("id, region, riot_puuid, last_synced_at, custom_games_consent")
    .eq("id", params.id)
    .maybeSingle();
  if (!player) return json({ error: "Player not found" }, 404);
  if (!player.riot_puuid) return json({ error: "This player has no Riot ID linked" }, 400);

  const body = await request.json().catch(() => ({}));

  try {
    let ids;
    if (Array.isArray(body.ids)) {
      ids = [...new Set(body.ids)].filter((id) => isMatchIdFor(player.region, id)).slice(0, 100);
    } else {
      const since = player.last_synced_at
        ? new Date(player.last_synced_at)
        : new Date(Date.now() - FIRST_SYNC_DAYS * 86400000);
      ids = (await getMatchIds(player.riot_puuid, player.region, { startTime: Math.floor(since.getTime() / 1000) })) || [];
    }

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
    let skipped = 0;

    for (const matchId of batch) {
      const matchData = await getMatch(matchId, player.region);
      if (!matchData) continue;
      // Custom games (scrims) are only stored for players who opted in through their availability link.
      if (!canStoreMatch(matchData.info?.queueId, player.custom_games_consent === true)) {
        skipped++;
        continue;
      }
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

    const rest = pending.slice(BATCH);
    if (rest.length === 0) {
      await admin.from("player").update({ last_synced_at: new Date().toISOString() }).eq("id", player.id);
    }

    return json({ saved, skipped, remaining: rest.length, total: ids.length, pending: rest });
  } catch (e) {
    const status = e instanceof RiotError ? e.status : 500;
    const headers = e instanceof RiotError && e.retryAfter ? { "Retry-After": String(e.retryAfter) } : undefined;
    // Riot problems are reported as they are; anything else stays generic so internals do not leak.
    return json({ error: e instanceof RiotError ? e.message : "Something went wrong while importing matches." }, status, headers);
  }
}
