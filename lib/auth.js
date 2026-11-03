import { createClient } from "@/lib/supabase/server";
import { riotEnabledFor } from "@/lib/features";
import { rateLimit } from "@/lib/ratelimit";

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
