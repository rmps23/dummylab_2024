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
    tagline: "For a coach running a few rosters. The price covers the servers, nothing more.",
    price: { month: 3, year: 30 },
    limits: { teams: 3, players: 50, notes: 2000, staff: 1, statsDays: null },
    features: [
      "Up to 3 teams and 50 players",
      "Full stats history, no 30 day limit",
      "Availability links: players answer from their phone",
      "Discord reminders and the weekly email report",
      "Unlimited notes and goals, CSV export",
      "Invite 1 staff member",
    ],
  },
  academy: {
    id: "academy",
    name: "Academy",
    tagline: "For academies and organisations with several rosters and a staff.",
    price: { month: 9, year: 90 },
    limits: { teams: 10, players: 200, notes: 2000, staff: 5, statsDays: null },
    features: [
      "Up to 10 teams and 200 players",
      "Invite 5 staff members (analysts, assistants)",
    ],
  },
};

export const PLAN_ORDER = ["free", "pro", "academy"];

export const PRO_ONLY = {
  invites: "Availability links are a Pro feature.",
  discord: "Discord reminders are a Pro feature.",
  report: "The weekly report is a Pro feature.",
  export: "CSV export is a Pro feature.",
  staff: "Inviting staff is a Pro feature.",
};

// Anything but Free pays for the servers and gets the paid features.
export const isPaid = (plan) => plan === "pro" || plan === "academy";
