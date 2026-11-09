import { json, requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimit } from "@/lib/ratelimit";
import { INVITE_MESSAGES, inviteProblem } from "@/lib/teamInvites";
import { isToken } from "@/lib/invites";

// Accepts a staff invitation for the signed-in user. The service role is needed because members cannot
// add themselves to a team; the token plus the matching email are what authorise it.
export async function POST(request) {
  const { user, error } = await requireUser();
  if (error) return error;

  const limit = rateLimit(`accept-invite:${user.id}`, { limit: 10, windowMs: 600_000 });
  if (!limit.ok) return json({ error: "Too many attempts. Try again in a few minutes." }, 429, { "Retry-After": String(limit.retryAfter) });

  const { token } = await request.json().catch(() => ({}));
  if (!isToken(token)) return json({ error: INVITE_MESSAGES.invalid, code: "invalid" }, 400);

  const admin = createAdminClient();
  const { data: invite } = await admin
    .from("team_invite")
    .select("id, team_id, email, role, expires_at, accepted_at, revoked_at")
    .eq("token", token)
    .maybeSingle();

  const problem = inviteProblem(invite, user);
  if (problem) return json({ error: INVITE_MESSAGES[problem], code: problem }, problem === "invalid" ? 404 : 403);

  const { error: memberError } = await admin
    .from("team_member")
    .upsert({ team_id: invite.team_id, user_id: user.id, role: invite.role }, { onConflict: "team_id,user_id" });
  if (memberError) return json({ error: "Could not join the team. Try again." }, 500);

  await admin.from("team_invite").update({ accepted_at: new Date().toISOString(), accepted_by: user.id }).eq("id", invite.id);
  return json({ ok: true, team_id: invite.team_id, role: invite.role });
}
