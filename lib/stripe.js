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

export function priceFor(interval, env = process.env) {
  if (interval === "year") return env.STRIPE_PRICE_PRO_YEARLY || null;
  if (interval === "month") return env.STRIPE_PRICE_PRO_MONTHLY || null;
  return null;
}
