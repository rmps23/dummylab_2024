import { json } from "@/lib/auth";
import { getInviteContext, isToken } from "@/lib/invites";
import { rateLimitShared } from "@/lib/ratelimit";
import { createAdminClient } from "@/lib/supabase/admin";

const LIMIT = { limit: 20, windowMs: 60_000 };

// The player decides, through their personal link, whether custom (scrim) games may be stored and shown to their
// coach. Turning it off also deletes the custom games already stored. Only the server can change this value.
export async function POST(request, { params }) {
  if (!isToken(params.token)) return json({ error: "Not found" }, 404);
  const admin = createAdminClient();
  const check = await rateLimitShared(admin, `invite-consent:${params.token}`, LIMIT);
  if (!check.ok) return json({ error: "Too many requests" }, 429, { "Retry-After": String(check.retryAfter) });

  const body = await request.json().catch(() => ({}));
  if (typeof body.consent !== "boolean") return json({ error: "Invalid answer" }, 400);

  const context = await getInviteContext(admin, params.token);
  if (!context) return json({ error: "This link is no longer valid" }, 404);

  const { error } = await admin
    .from("player")
    .update({ custom_games_consent: body.consent, custom_games_consent_at: body.consent ? new Date().toISOString() : null })
    .eq("id", context.player.id);
  if (error) return json({ error: "Could not save your choice" }, 500);

  let removed = 0;
  if (!body.consent) {
    const { data } = await admin.rpc("purge_custom_games", { p_player: context.player.id });
    removed = Number(data) || 0;
  }
  await admin.from("player_invite").update({ last_used_at: new Date().toISOString() }).eq("id", context.inviteId);
  return json({ ok: true, consent: body.consent, removed });
}
