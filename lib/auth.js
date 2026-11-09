import { createClient } from "@/lib/supabase/server";
import { riotEnabledFor } from "@/lib/features";
import { rateLimit } from "@/lib/ratelimit";
import { isPaid } from "@/lib/plans";

export function json(body, status = 200, headers) {
  return Response.json(body, { status, headers });
}

export function isDemoUser(user) {
  return user?.app_metadata?.is_demo === true;
}

// Returns { supabase, user } or { error: Response }.
export async function requireUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: json({ error: "Unauthorized" }, 401) };
  return { supabase, user };
}

// Like requireUser, for routes that call the Riot API: the account must have Riot features
// enabled and stay under a per-user rate limit (`bucket` names the limit, e.g. "verify").
export async function requireRiotUser(bucket, limit) {
  const result = await requireUser();
  if (result.error) return result;

  if (!riotEnabledFor(result.user)) {
    return {
      error: json(
        { error: "Riot features are not enabled for this account", code: "riot_disabled" },
        403
      ),
    };
  }

  const check = rateLimit(`${bucket}:${result.user.id}`, limit);
  if (!check.ok) {
    return {
      error: json({ error: "Too many requests, try again shortly" }, 429, { "Retry-After": String(check.retryAfter) }),
    };
  }
  return result;
}

// Pro-only routes. The plan is read through the `my_plan()` database function, so it is the same value the
// database uses for its own limits. `allowDemo: false` also blocks the shared demo account (for anything that
// sends messages to somewhere the visitor chooses).
export async function requireProUser(feature, { allowDemo = true } = {}) {
  const result = await requireUser();
  if (result.error) return result;

  if (!allowDemo && isDemoUser(result.user)) {
    return { error: json({ error: "This is disabled in the demo account" }, 403) };
  }
  const { data: plan } = await result.supabase.rpc("my_plan");
  if (!isPaid(plan)) {
    return { error: json({ error: `${feature} is a Pro feature. Upgrade to use it.`, code: "plan_limit" }, 402) };
  }
  return result;
}
