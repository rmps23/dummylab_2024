import { json, requireProUser } from "@/lib/auth";
import { sendDiscord, testMessage } from "@/lib/discord";
import { rateLimit } from "@/lib/ratelimit";

export async function POST(request, { params }) {
  const { supabase, user, error } = await requireProUser("Discord reminders", { allowDemo: false });
  if (error) return error;

  const limit = rateLimit(`discord-test:${user.id}`, { limit: 5, windowMs: 60_000 });
  if (!limit.ok) return json({ error: "Too many tests, try again shortly" }, 429, { "Retry-After": String(limit.retryAfter) });

  const { data: team } = await supabase.from("team").select("name, discord_webhook_url").eq("id", params.id).maybeSingle();
  if (!team) return json({ error: "Team not found" }, 404);
  if (!team.discord_webhook_url) return json({ error: "Save a webhook URL first" }, 400);

  try {
    await sendDiscord(team.discord_webhook_url, testMessage(team));
    return json({ ok: true });
  } catch (e) {
    return json({ error: e.message }, 502);
  }
}
