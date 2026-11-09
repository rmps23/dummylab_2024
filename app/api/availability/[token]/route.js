import { json } from "@/lib/auth";
import { ANSWERS, getInviteContext, isToken } from "@/lib/invites";
import { rateLimitShared } from "@/lib/ratelimit";
import { createAdminClient } from "@/lib/supabase/admin";

const LIMIT = { limit: 60, windowMs: 60_000 };

// Anonymous endpoint: the link itself is the credential. It can only answer for the player it belongs to,
// and only for that player's team events.
export async function GET(request, { params }) {
  if (!isToken(params.token)) return json({ error: "Not found" }, 404);
  const admin = createAdminClient();
  const check = await rateLimitShared(admin, `invite-read:${params.token}`, LIMIT);
  if (!check.ok) return json({ error: "Too many requests" }, 429, { "Retry-After": String(check.retryAfter) });

  const context = await getInviteContext(admin, params.token);
  if (!context) return json({ error: "This link is no longer valid" }, 404);
  return json({ player: context.player.name, team: context.teamName, events: context.events, consent: context.player.consent });
}

export async function POST(request, { params }) {
  if (!isToken(params.token)) return json({ error: "Not found" }, 404);
  const admin = createAdminClient();
  const check = await rateLimitShared(admin, `invite-write:${params.token}`, LIMIT);
  if (!check.ok) return json({ error: "Too many requests" }, 429, { "Retry-After": String(check.retryAfter) });

  const body = await request.json().catch(() => ({}));
  const eventId = Number(body.event_id);
  if (!Number.isInteger(eventId) || !ANSWERS.includes(body.status)) {
    return json({ error: "Invalid answer" }, 400);
  }

  const context = await getInviteContext(admin, params.token);
  if (!context) return json({ error: "This link is no longer valid" }, 404);

  // Only events listed for this player's team can be answered.
  if (!context.events.some((e) => e.id === eventId)) return json({ error: "Event not found" }, 404);

  const { error } = await admin
    .from("event_participant")
    .upsert({ event_id: eventId, player_id: context.player.id, status: body.status }, { onConflict: "event_id,player_id" });
  if (error) return json({ error: "Could not save the answer" }, 500);

  await admin.from("player_invite").update({ last_used_at: new Date().toISOString() }).eq("id", context.inviteId);
  return json({ ok: true, event_id: eventId, status: body.status });
}
