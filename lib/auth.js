import { createClient } from "@/lib/supabase/server";

export function json(body, status = 200) {
  return Response.json(body, { status });
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
