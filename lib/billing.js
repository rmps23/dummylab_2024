// Turns Stripe subscription events into rows of the `account` table. Pure functions plus one writer,
// so they can be tested without Stripe or a database.
const ACTIVE = new Set(["active", "trialing", "past_due"]);

const toIso = (seconds) => (seconds ? new Date(seconds * 1000).toISOString() : null);

// Newer Stripe API versions move the period end onto the subscription item.
const periodEnd = (sub) => sub.current_period_end ?? sub.items?.data?.[0]?.current_period_end ?? null;

export function subscriptionToAccount(sub) {
  const customer = typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
  return {
    plan: ACTIVE.has(sub.status) ? "pro" : "free",
    status: sub.status,
    stripe_customer_id: customer ?? null,
    stripe_subscription_id: sub.id,
    current_period_end: toIso(periodEnd(sub)),
    cancel_at_period_end: !!sub.cancel_at_period_end,
    updated_at: new Date().toISOString(),
  };
}

export const HANDLED_EVENTS = [
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
];

// Applies one verified Stripe event. Returns { handled, userId }.
export async function applyStripeEvent(admin, event) {
  if (!HANDLED_EVENTS.includes(event.type)) return { handled: false };

  const sub = event.data.object;
  const row = subscriptionToAccount(sub);
  if (event.type === "customer.subscription.deleted") {
    row.plan = "free";
    row.status = "canceled";
  }

  // The checkout stores our user id on the subscription; fall back to the customer id.
  let userId = sub.metadata?.user_id ?? null;
  if (!userId && row.stripe_customer_id) {
    const { data } = await admin.from("account").select("user_id").eq("stripe_customer_id", row.stripe_customer_id).maybeSingle();
    userId = data?.user_id ?? null;
  }
  if (!userId) return { handled: false };

  const { error } = await admin.from("account").upsert({ user_id: userId, ...row }, { onConflict: "user_id" });
  if (error) throw new Error(error.message);
  return { handled: true, userId };
}
