import { supabase } from "@/supabase";
import { toPlanError } from "@/lib/planErrors";

// Teams the person owns or has been invited to, each with `my_role`: owner, staff or viewer.
export async function fetchTeams() {
  const { data, error } = await supabase.from("team").select().order("id", { ascending: true });
  if (error) throw new Error(error.message);
  const { data: session } = await supabase.auth.getSession();
  const me = session?.session?.user?.id;
  const { data: seats } = await supabase.from("team_member").select("team_id, role").eq("user_id", me ?? "");
  const roles = new Map((seats || []).map((s) => [s.team_id, s.role]));
  return data.map((t) => ({ ...t, my_role: t.owner_id === me ? "owner" : roles.get(t.id) ?? "viewer" }));
}

export async function insertTeam(name) {
  const { data, error } = await supabase.from("team").insert({ name }).select().single();
  if (error) throw new Error(error.message);
  return { ...data, my_role: "owner" };
}

export async function editTeam(name, team_id) {
  const { data, error } = await supabase.from("team").update({ name }).eq("id", team_id).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteTeam(team_id) {
  const { error } = await supabase.from("team").delete().eq("id", team_id);
  if (error) throw new Error(error.message);
}

// Notification settings (Pro). Clearing a value is always allowed; setting one needs the Pro plan.
export async function saveNotifications(team_id, { discord_webhook_url, report_email, weekly_report }) {
  const { data, error } = await supabase
    .from("team")
    .update({ discord_webhook_url: discord_webhook_url || null, report_email: report_email || null, weekly_report: !!weekly_report })
    .eq("id", team_id)
    .select()
    .single();
  if (error) throw toPlanError(error.message) ?? new Error(error.message.includes("check constraint") ? "Check the webhook URL and email format" : error.message);
  return data;
}
