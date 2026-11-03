import { isDemoUser, json, requireUser } from "@/lib/auth";
import { riotEnabledFor } from "@/lib/features";

// What the signed-in user may do; the UI uses it to explain what is switched off and why.
export async function GET() {
  const { user, error } = await requireUser();
  if (error) return error;
  return json({ riot: riotEnabledFor(user), demo: isDemoUser(user) });
}
