import { isDemoUser, json, requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST() {
  const { supabase, user, error } = await requireUser();
  if (error) return error;
  if (isDemoUser(user)) return json({ error: "The demo account cannot be deleted" }, 403);

  const { error: deleteError } = await createAdminClient().auth.admin.deleteUser(user.id);
  if (deleteError) return json({ error: deleteError.message }, 500);

  await supabase.auth.signOut();
  return json({ ok: true });
}
