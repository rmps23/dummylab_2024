import Stripe from "stripe";

let client;

export function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY is not configured");
  client ??= new Stripe(process.env.STRIPE_SECRET_KEY);
  return client;
}

// Payments stay off until BILLING_ENABLED=true and the Stripe keys and prices are set.
export function billingEnabled(env = process.env) {
  return (
    env.BILLING_ENABLED === "true" &&
    !!env.STRIPE_SECRET_KEY &&
    !!env.STRIPE_WEBHOOK_SECRET &&
    !!env.STRIPE_PRICE_PRO_MONTHLY
  );
}

// Stripe price id for a plan ("pro" or "academy") and interval ("month" or "year"), or null if it is not configured.
export function priceFor(interval, env = process.env, plan = "pro") {
  const key = `STRIPE_PRICE_${plan === "academy" ? "ACADEMY" : "PRO"}_${interval === "year" ? "YEARLY" : interval === "month" ? "MONTHLY" : ""}`;
  if (interval !== "year" && interval !== "month") return null;
  if (plan !== "pro" && plan !== "academy") return null;
  return env[key] || null;
}
