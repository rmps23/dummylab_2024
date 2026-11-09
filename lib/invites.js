import { randomBytes } from "node:crypto";

export const ANSWERS = ["available", "maybe", "unavailable"];
const WINDOW_DAYS = 30;

// 24 random bytes -> 32 URL-safe characters.
export const newToken = () => randomBytes(24).toString("base64url");
export const isToken = (value) => typeof value === "string" && /^[A-Za-z0-9_-]{32}$/.test(value);

// What a player may see about an event: no notes, no links, nobody else's answers.
export function publicEvent(event, playerId) {
  const mine = event.participants?.find((p) => p.player_id === playerId);
  return {
    id: event.id,
    type: event.type,
    title: event.title,
    starts_at: event.starts_at,
    ends_at: event.ends_at,
    opponent: event.opponent ?? null,
    status: mine?.status ?? "pending",
  };
}

// Resolves a token to the player, team and upcoming events. Returns null for unknown or revoked links.
// `admin` is the service-role client: this is the only place that reads data on behalf of an anonymous player.
export async function getInviteContext(admin, token, now = new Date()) {
  if (!isToken(token)) return null;

  const { data: invite } = await admin
    .from("player_invite")
    .select("id, player_id, revoked_at")
    .eq("token", token)
    .maybeSingle();
  if (!invite || invite.revoked_at) return null;

  const { data: player } = await admin
    .from("player")
    .select("id, name, team_id, custom_games_consent, team:team_id(name)")
    .eq("id", invite.player_id)
    .maybeSingle();
  if (!player) return null;

  const until = new Date(now.getTime() + WINDOW_DAYS * 86400000);
  const { data: events } = await admin
    .from("event")
    .select("id, type, title, starts_at, ends_at, opponent, participants:event_participant(player_id, status)")
    .eq("team_id", player.team_id)
    .gte("ends_at", now.toISOString())
    .lt("starts_at", until.toISOString())
    .order("starts_at");

  return {
    inviteId: invite.id,
    player: { id: player.id, name: player.name, team_id: player.team_id, consent: player.custom_games_consent === true },
    teamName: player.team?.name ?? "",
    events: (events || []).map((e) => publicEvent(e, player.id)),
  };
}
