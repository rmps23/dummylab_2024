import { json, requireRiotUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRankEntries, RiotError } from "@/lib/riot";

const CACHE_MS = 10 * 60 * 1000;

export async function POST(request, { params }) {
  const { supabase, error } = await requireRiotUser("rank", { limit: 6, windowMs: 60_000 });
  if (error) return error;

  const { data: player } = await supabase
    .from("player")
    .select("id, region, riot_puuid")
    .eq("id", params.id)
    .maybeSingle();
  if (!player) return json({ error: "Player not found" }, 404);
  if (!player.riot_puuid) return json({ error: "This player has no Riot ID linked" }, 400);

  // Serve the stored snapshot if it is fresh, so repeated clicks do not spend Riot requests.
  const { data: cached } = await supabase.from("rank_snapshot").select("*").eq("player_id", player.id);
  if (cached?.length && cached.every((r) => Date.now() - new Date(r.fetched_at).getTime() < CACHE_MS)) {
    return json({ entries: cached, cached: true });
  }

  try {
    const entries = (await getRankEntries(player.riot_puuid, player.region)) || [];
    const rows = entries.map((e) => ({
      player_id: player.id,
      queue: e.queueType,
      tier: e.tier,
      rank: e.rank,
      lp: e.leaguePoints,
      wins: e.wins,
      losses: e.losses,
      fetched_at: new Date().toISOString(),
    }));

    if (rows.length) {
      const { error: upsertError } = await createAdminClient()
        .from("rank_snapshot")
        .upsert(rows, { onConflict: "player_id,queue" });
      if (upsertError) throw new Error(upsertError.message);
    }
    return json({ entries: rows, cached: false });
  } catch (e) {
    const status = e instanceof RiotError ? e.status : 500;
    return json({ error: e.message }, status);
  }
}
