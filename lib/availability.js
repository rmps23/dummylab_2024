// Pure helpers for event availability. A player with no answer is "pending".
export const statusFor = (event, player_id) =>
  event.participants?.find((p) => p.player_id === player_id)?.status ?? "pending";

export function availableCount(event, players) {
  return players.filter((p) => statusFor(event, p.id) === "available").length;
}

export const pendingCount = (event, players) => players.filter((p) => statusFor(event, p.id) === "pending").length;

// True when the team has enough players to field a full roster (5) and not enough said yes.
export const rosterShort = (event, players) => players.length >= 5 && availableCount(event, players) < 5;
