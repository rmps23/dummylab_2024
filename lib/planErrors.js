// The database raises `plan_limit:<what>`; turn it into a message for the person who hit the limit.
const MESSAGES = {
  teams: "Your Free plan includes 1 team. Upgrade to Pro for up to 5 teams.",
  players: "You reached the player limit of your plan. Upgrade to Pro for up to 100 players.",
  notes: "You reached the 20 notes and goals of the Free plan. Upgrade to Pro for unlimited notes.",
  invites: "Availability links are a Pro feature. Upgrade to share links with your players.",
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
