import { json } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

// Signs the visitor in as the demo user. The credentials live only in server env vars.
export async function POST() {
  const email = process.env.DEMO_EMAIL;
  const password = process.env.DEMO_PASSWORD;
  if (!email || !password) return json({ error: "Demo account is not configured" }, 503);

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return json({ error: "Demo account is unavailable" }, 503);

  return json({ ok: true });
}
