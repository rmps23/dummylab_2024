import { isDemoUser, json, requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRankEntries, RiotError } from "@/lib/riot";

export async function POST(request, { params }) {
  const { supabase, user, error } = await requireUser();
  if (error) return error;
  if (isDemoUser(user)) return json({ error: "Disabled in the demo account" }, 403);

  const { data: player } = await supabase
    .from("player")
    .select("id, region, riot_puuid")
    .eq("id", params.id)
    .maybeSingle();
  if (!player) return json({ error: "Player not found" }, 404);

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
    return json({ entries: rows });
  } catch (e) {
    const status = e instanceof RiotError ? e.status : 500;
    return json({ error: e.message }, status);
  }
}
