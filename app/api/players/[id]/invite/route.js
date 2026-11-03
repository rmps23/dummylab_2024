import { isDemoUser, json, requireUser } from "@/lib/auth";
import { newToken } from "@/lib/invites";

// Creates (or replaces) the personal availability link of a player. RLS ensures the player is yours.
export async function POST(request, { params }) {
  const { supabase, user, error } = await requireUser();
  if (error) return error;
  if (isDemoUser(user)) return json({ error: "Invite links are disabled in the demo account" }, 403);

  const { data: player } = await supabase.from("player").select("id").eq("id", params.id).maybeSingle();
  if (!player) return json({ error: "Player not found" }, 404);

  // Only one active link per player: revoke the previous one, then create a new one.
  await supabase
    .from("player_invite")
    .update({ revoked_at: new Date().toISOString() })
    .eq("player_id", player.id)
    .is("revoked_at", null);

  const { data: invite, error: insertError } = await supabase
    .from("player_invite")
    .insert({ player_id: player.id, token: newToken() })
    .select("id, token, created_at")
    .single();
  if (insertError) return json({ error: insertError.message }, 500);

  return json({ invite });
}

export async function DELETE(request, { params }) {
  const { supabase, error } = await requireUser();
  if (error) return error;

  const { error: updateError } = await supabase
    .from("player_invite")
    .update({ revoked_at: new Date().toISOString() })
    .eq("player_id", params.id)
    .is("revoked_at", null);
  if (updateError) return json({ error: updateError.message }, 500);
  return json({ ok: true });
}
