// Server-side feature gate for anything that calls the Riot API.
//
// Riot development keys may not power a public product, so Riot features are off by default and are
// switched on per account (RIOT_ALLOWED_EMAILS) or for everyone once a production key is approved
// (RIOT_ENABLED=true).
export function riotEnabledFor(user, env = process.env) {
  if (!user || user.app_metadata?.is_demo === true) return false;
  if (env.RIOT_ENABLED === "true") return true;

  const allowed = (env.RIOT_ALLOWED_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  return !!user.email && allowed.includes(user.email.toLowerCase());
}
