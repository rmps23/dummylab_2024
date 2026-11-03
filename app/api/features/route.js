import { isDemoUser, json, requireUser } from "@/lib/auth";
import { riotEnabledFor } from "@/lib/features";
import { billingEnabled } from "@/lib/stripe";

// What the signed-in user may do; the UI uses it to explain what is switched off and why.
export async function GET() {
  const { supabase, user, error } = await requireUser();
  if (error) return error;

  const { data: plan } = await supabase.rpc("my_plan");
  return json({
    riot: riotEnabledFor(user),
    demo: isDemoUser(user),
    plan: plan === "pro" ? "pro" : "free",
    billing: billingEnabled(),
  });
}
