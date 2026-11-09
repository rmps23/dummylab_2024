import { isDemoUser, json, requireUser } from "@/lib/auth";
import { rateLimit } from "@/lib/ratelimit";
import { emailConfigured, sendEmail } from "@/lib/email";
import { toPlanError } from "@/lib/planErrors";
import { inviteEmail, inviteUrl, newToken, STAFF_ROLES } from "@/lib/teamInvites";

// Creates a staff invitation for one of your teams. RLS only lets the team owner insert it, and the
// database refuses it when the plan has no free seat. The link is returned so it can be copied; an email is
// sent as well when email is configured.
export async function POST(request, { params }) {
  const { supabase, user, error } = await requireUser();
  if (error) return error;
  if (isDemoUser(user)) return json({ error: "Invitations are disabled in the demo account" }, 403);

  const limit = rateLimit(`team-invite:${user.id}`, { limit: 20, windowMs: 3600_000 });
  if (!limit.ok) return json({ error: "Too many invitations. Try again later." }, 429, { "Retry-After": String(limit.retryAfter) });

  const body = await request.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();
  const role = body.role;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: "Enter a valid email address" }, 400);
  if (!STAFF_ROLES.includes(role)) return json({ error: "Choose a role" }, 400);
  if (email === user.email?.toLowerCase()) return json({ error: "You already own this team" }, 400);

  const { data: team } = await supabase.from("team").select("id, name, owner_id").eq("id", params.id).maybeSingle();
  if (!team || team.owner_id !== user.id) return json({ error: "Only the team owner can invite people" }, 403);

  const token = newToken();
  const { data: invite, error: insertError } = await supabase
    .from("team_invite")
    .insert({ team_id: team.id, email, role, token })
    .select("id, email, role, created_at, expires_at")
    .single();
  if (insertError) {
    const plan = toPlanError(insertError.message);
    return plan ? json({ error: plan.message, code: "plan_limit" }, 402) : json({ error: "Could not create the invitation" }, 500);
  }

  const url = inviteUrl(token);
  let emailed = false;
  if (emailConfigured()) {
    try {
      await sendEmail({ to: email, ...inviteEmail({ teamName: team.name, role, url, inviter: user.email }) });
      emailed = true;
    } catch {
      // The link is still shown to the owner, who can send it by hand.
    }
  }
  return json({ invite, url, emailed });
}
