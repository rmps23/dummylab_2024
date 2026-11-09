// The database raises `plan_limit:<what>`; turn it into a message for the person who hit the limit.
const MESSAGES = {
  teams: "You reached the team limit of your plan. Pro allows 3 teams and Academy 10.",
  players: "You reached the player limit of your plan. Pro allows 50 players and Academy 200.",
  notes: "You reached the 20 notes and goals of the Free plan. Upgrade to Pro for unlimited notes.",
  invites: "Availability links are a Pro feature. Upgrade to share links with your players.",
  staff: "You reached the staff limit of your plan (Pro: 1 person, Academy: 5). Remove an invitation to free a seat, or upgrade.",
  notifications: "Discord reminders and the weekly report are Pro features. Upgrade to turn them on.",
};

export class PlanLimitError extends Error {
  constructor(what) {
    super(MESSAGES[what] ?? "This is not included in your plan. Upgrade to Pro.");
    this.name = "PlanLimitError";
    this.code = "plan_limit";
    this.what = what;
  }
}

// Returns a PlanLimitError for a database/API error message, or null if it is something else.
export function toPlanError(message) {
  const match = /plan_limit:(\w+)/.exec(String(message || ""));
  return match ? new PlanLimitError(match[1]) : null;
}
