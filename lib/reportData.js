const DAY = 86400000;

// Loads what buildWeeklyReport needs. `client` is either the user's client (RLS) or the admin client.
export async function loadReportData(client, teamId, now = new Date()) {
  const { data: team } = await client
    .from("team")
    .select("id, name, owner_id, discord_webhook_url, report_email, weekly_report")
    .eq("id", teamId)
    .maybeSingle();
  if (!team) return null;

  const { data: players } = await client.from("player").select("id, name, role:role_id(name)").eq("team_id", teamId);
  const ids = (players || []).map((p) => p.id);

  const from = new Date(now.getTime() - 7 * DAY).toISOString();
  const until = new Date(now.getTime() + 7 * DAY).toISOString();

  const matches = ids.length
    ? (
        await client
          .from("player_match")
          .select("player_id, champion, win, kills, deaths, assists, cs, match:match_id!inner(ended_at, duration)")
          .in("player_id", ids)
          .gte("match.ended_at", from)
      ).data || []
    : [];

  const { data: events } = await client
    .from("event")
    .select("id, title, type, starts_at, ends_at, opponent, participants:event_participant(player_id, status)")
    .eq("team_id", teamId)
    .gte("starts_at", now.toISOString())
    .lte("starts_at", until)
    .order("starts_at");

  return { team, players: players || [], matches, events: events || [] };
}
