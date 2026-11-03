import { json, requireProUser } from "@/lib/auth";
import { buildReminder, sendDiscord } from "@/lib/discord";
import { rateLimit } from "@/lib/ratelimit";

// Posts the availability status of an event to the team's Discord channel.
export async function POST(request, { params }) {
  const { supabase, user, error } = await requireProUser("Discord reminders", { allowDemo: false });
  if (error) return error;

  const limit = rateLimit(`remind:${user.id}`, { limit: 10, windowMs: 60_000 });
  if (!limit.ok) return json({ error: "Too many reminders, try again shortly" }, 429, { "Retry-After": String(limit.retryAfter) });

  // RLS: only events of your own teams are visible.
  const { data: event } = await supabase
    .from("event")
    .select("id, title, type, starts_at, ends_at, opponent, team_id, participants:event_participant(player_id, status)")
    .eq("id", params.id)
    .maybeSingle();
  if (!event) return json({ error: "Event not found" }, 404);

  const { data: team } = await supabase.from("team").select("name, discord_webhook_url").eq("id", event.team_id).maybeSingle();
  if (!team?.discord_webhook_url) return json({ error: "Connect a Discord webhook in Settings first", code: "no_webhook" }, 400);

  const { data: players } = await supabase.from("player").select("id, name").eq("team_id", event.team_id);

  try {
    const origin = new URL(request.url).origin;
    await sendDiscord(team.discord_webhook_url, buildReminder({ team, event, players: players || [], link: `${origin}/dashboard/schedule` }));
    return json({ ok: true });
  } catch (e) {
    return json({ error: e.message }, 502);
  }
}
