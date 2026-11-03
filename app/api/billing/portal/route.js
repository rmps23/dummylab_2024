import { isDemoUser, json, requireUser } from "@/lib/auth";
import { billingEnabled, getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

// Opens the Stripe customer portal (change card, cancel, invoices).
export async function POST(request) {
  const { user, error } = await requireUser();
  if (error) return error;
  if (isDemoUser(user)) return json({ error: "Plans cannot be changed in the demo account" }, 403);
  if (!billingEnabled()) return json({ error: "Payments are not enabled yet", code: "billing_disabled" }, 503);

  const { data: account } = await createAdminClient()
    .from("account")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!account?.stripe_customer_id) return json({ error: "No subscription to manage yet" }, 404);

  const session = await getStripe().billingPortal.sessions.create({
    customer: account.stripe_customer_id,
    return_url: `${new URL(request.url).origin}/dashboard/billing`,
  });
  return json({ url: session.url });
}
