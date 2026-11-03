import { supabase } from "@/supabase";
import { toPlanError } from "@/lib/planErrors";

export async function fetchTeams() {
  const { data, error } = await supabase.from("team").select().order("id", { ascending: true });
  if (error) throw new Error(error.message);
  return data;
}

export async function insertTeam(name) {
  const { data, error } = await supabase.from("team").insert({ name }).select().single();
  if (error) throw new Error(error.message);
  return data;
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
