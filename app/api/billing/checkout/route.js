import { isDemoUser, json, requireUser } from "@/lib/auth";
import { billingEnabled, getStripe, priceFor } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

// Starts a Stripe Checkout session for the Pro or Academy plan. Disabled until BILLING_ENABLED=true.
export async function POST(request) {
  const { user, error } = await requireUser();
  if (error) return error;
  if (isDemoUser(user)) return json({ error: "Plans cannot be changed in the demo account" }, 403);
  if (!billingEnabled()) return json({ error: "Payments are not enabled yet", code: "billing_disabled" }, 503);

  const body = await request.json().catch(() => ({}));
  const plan = body.plan === "academy" ? "academy" : "pro";
  const price = priceFor(body.interval === "year" ? "year" : "month", process.env, plan);
  if (!price) return json({ error: "This billing interval is not available" }, 400);

  const stripe = getStripe();
  const admin = createAdminClient();

  const { data: account } = await admin.from("account").select("stripe_customer_id").eq("user_id", user.id).maybeSingle();
  let customer = account?.stripe_customer_id;
  if (!customer) {
    const created = await stripe.customers.create({ email: user.email, metadata: { user_id: user.id } });
    customer = created.id;
    await admin.from("account").upsert({ user_id: user.id, stripe_customer_id: customer }, { onConflict: "user_id" });
  }

  const origin = new URL(request.url).origin;
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer,
    client_reference_id: user.id,
    line_items: [{ price, quantity: 1 }],
    subscription_data: { metadata: { user_id: user.id, plan } },
    allow_promotion_codes: true,
    success_url: `${origin}/dashboard/billing?checkout=success`,
    cancel_url: `${origin}/dashboard/billing?checkout=cancelled`,
  });

  return json({ url: session.url });
}
