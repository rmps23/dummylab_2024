import { supabase } from "@/supabase";

const EVENT_SELECT = "*, participants:event_participant(player_id, status, note)";

export async function fetchEvents(team_id, from, to) {
  const { data, error } = await supabase
    .from("event")
    .select(EVENT_SELECT)
    .eq("team_id", team_id)
    .gte("starts_at", from.toISOString())
    .lt("starts_at", to.toISOString())
    .order("starts_at");
  if (error) throw new Error(error.message);
  return data;
}

// Creates the event and, when `repeatWeeks` > 0, the same event on the following weeks.
export async function insertEvent(event, repeatWeeks = 0) {
  const rows = [];
  for (let i = 0; i <= repeatWeeks; i++) {
    const shift = i * 7 * 86400000;
    rows.push({
      ...event,
      starts_at: new Date(new Date(event.starts_at).getTime() + shift).toISOString(),
      ends_at: new Date(new Date(event.ends_at).getTime() + shift).toISOString(),
    });
  }
  const { data, error } = await supabase.from("event").insert(rows).select(EVENT_SELECT);
  if (error) throw new Error(error.message);
  return data;
}

export async function updateEvent(id, changes) {
  const { data, error } = await supabase.from("event").update(changes).eq("id", id).select(EVENT_SELECT).single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteEvent(id) {
  const { error } = await supabase.from("event").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function setAvailability(event_id, player_id, status) {
  const { error } = await supabase
    .from("event_participant")
    .upsert({ event_id, player_id, status }, { onConflict: "event_id,player_id" });
  if (error) throw new Error(error.message);
}
