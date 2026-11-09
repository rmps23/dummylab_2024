// Plan definitions. The limits are enforced in the database (supabase/migrations/0006_plans.sql);
// keep both in sync. Prices are in euros.
export const PLANS = {
  free: {
    id: "free",
    name: "Free",
    tagline: "Everything a single team needs to get organised.",
    price: { month: 0, year: 0 },
    limits: { teams: 1, players: 10, notes: 20, staff: 0, statsDays: 30 },
    features: [
      "1 team, up to 10 players",
      "Schedule with availability set by the coach",
      "Stats and champion pool for the last 30 days",
      "Match import and rank from the Riot API",
      "Up to 20 private notes and goals",
    ],
  },
  pro: {
    id: "pro",
    name: "Pro",
    tagline: "For coaches and academies running more than one roster.",
    price: { month: 9, year: 90 },
    limits: { teams: 5, players: 100, notes: 2000, staff: 3, statsDays: null },
    features: [
      "Up to 5 teams and 100 players",
      "Availability links: players answer from their phone",
      "Invite up to 3 staff members (analysts, assistants)",
      "Full stats history, no 30 day limit",
      "Discord reminders and weekly email report",
      "Unlimited notes and goals",
      "CSV export",
    ],
  },
};

export const PRO_ONLY = {
  invites: "Availability links are a Pro feature.",
  discord: "Discord reminders are a Pro feature.",
  report: "The weekly report is a Pro feature.",
  export: "CSV export is a Pro feature.",
  staff: "Inviting staff is a Pro feature.",
};

export const isPro = (plan) => plan === "pro";
