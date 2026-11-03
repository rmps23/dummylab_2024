import { json } from "@/lib/auth";
import { applyStripeEvent } from "@/lib/billing";
import { billingEnabled, getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

// Stripe calls this endpoint. The signature is verified against the raw body before anything is trusted.
export async function POST(request) {
  if (!billingEnabled()) return json({ error: "Payments are not enabled" }, 503);

  const signature = request.headers.get("stripe-signature");
  if (!signature) return json({ error: "Missing signature" }, 400);

  const payload = await request.text();
  let event;
  try {
    event = getStripe().webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return json({ error: "Invalid signature" }, 400);
  }

  try {
    const result = await applyStripeEvent(createAdminClient(), event);
    return json({ received: true, handled: result.handled });
  } catch (error) {
    // A 500 makes Stripe retry the event later.
    return json({ error: error.message }, 500);
  }
}
