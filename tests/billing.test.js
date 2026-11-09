import { describe, expect, it } from "vitest";
import Stripe from "stripe";
import { applyStripeEvent, subscriptionToAccount } from "@/lib/billing";
import { PlanLimitError, toPlanError } from "@/lib/planErrors";
import { PLANS } from "@/lib/plans";
import { billingEnabled, priceFor } from "@/lib/stripe";

const PERIOD_END = 1_800_000_000; // seconds

const subscription = (extra = {}) => ({
  id: "sub_1",
  customer: "cus_1",
  status: "active",
  current_period_end: PERIOD_END,
  cancel_at_period_end: false,
  metadata: { user_id: "user-1" },
  ...extra,
});

describe("subscriptionToAccount", () => {
  it("maps an active subscription to the Pro plan", () => {
    expect(subscriptionToAccount(subscription())).toMatchObject({
      plan: "pro",
      status: "active",
      stripe_customer_id: "cus_1",
      stripe_subscription_id: "sub_1",
      current_period_end: new Date(PERIOD_END * 1000).toISOString(),
      cancel_at_period_end: false,
    });
  });

  it("maps a subscription bought with an Academy price to the Academy plan", () => {
    const env = { STRIPE_PRICE_ACADEMY_MONTHLY: "price_am", STRIPE_PRICE_ACADEMY_YEARLY: "price_ay" };
    const academy = subscription({ items: { data: [{ price: { id: "price_ay" } }] } });
    expect(subscriptionToAccount(academy, env).plan).toBe("academy");
    expect(subscriptionToAccount(subscription({ items: { data: [{ price: { id: "price_m" } }] } }), env).plan).toBe("pro");
    expect(subscriptionToAccount({ ...academy, status: "canceled" }, env).plan).toBe("free");
  });

  it("keeps Pro while trialing or past due, and drops it for ended states", () => {
    expect(subscriptionToAccount(subscription({ status: "trialing" })).plan).toBe("pro");
    expect(subscriptionToAccount(subscription({ status: "past_due" })).plan).toBe("pro");
    for (const status of ["canceled", "unpaid", "incomplete", "incomplete_expired", "paused"]) {
      expect(subscriptionToAccount(subscription({ status })).plan).toBe("free");
    }
  });

  it("reads the period end from the item on newer API versions and accepts an expanded customer", () => {
    const sub = subscription({ current_period_end: undefined, customer: { id: "cus_9" }, items: { data: [{ current_period_end: PERIOD_END }] } });
    const row = subscriptionToAccount(sub);
    expect(row.current_period_end).toBe(new Date(PERIOD_END * 1000).toISOString());
    expect(row.stripe_customer_id).toBe("cus_9");
  });

  it("records a pending cancellation", () => {
    expect(subscriptionToAccount(subscription({ cancel_at_period_end: true })).cancel_at_period_end).toBe(true);
  });
});

function fakeAdmin({ byCustomer } = {}) {
  const calls = { upserts: [] };
  return {
    calls,
    from() {
      return {
        select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: byCustomer ? { user_id: byCustomer } : null }) }) }),
        upsert: async (row, options) => {
          calls.upserts.push({ row, options });
          return { error: null };
        },
      };
    },
  };
}

describe("applyStripeEvent", () => {
  it("writes the account of the user in the subscription metadata", async () => {
    const admin = fakeAdmin();
    const result = await applyStripeEvent(admin, { type: "customer.subscription.created", data: { object: subscription() } });
    expect(result).toEqual({ handled: true, userId: "user-1" });
    expect(admin.calls.upserts[0].row).toMatchObject({ user_id: "user-1", plan: "pro" });
    expect(admin.calls.upserts[0].options).toEqual({ onConflict: "user_id" });
  });

  it("falls back to the customer id when the metadata is missing", async () => {
    const admin = fakeAdmin({ byCustomer: "user-2" });
    const result = await applyStripeEvent(admin, {
      type: "customer.subscription.updated",
      data: { object: subscription({ metadata: {} }) },
    });
    expect(result.userId).toBe("user-2");
  });

  it("downgrades on deletion", async () => {
    const admin = fakeAdmin();
    await applyStripeEvent(admin, { type: "customer.subscription.deleted", data: { object: subscription() } });
    expect(admin.calls.upserts[0].row).toMatchObject({ plan: "free", status: "canceled" });
  });

  it("ignores other events and subscriptions it cannot attribute to a user", async () => {
    const admin = fakeAdmin();
    expect(await applyStripeEvent(admin, { type: "invoice.paid", data: { object: {} } })).toEqual({ handled: false });
    const orphan = await applyStripeEvent(admin, { type: "customer.subscription.updated", data: { object: subscription({ metadata: {} }) } });
    expect(orphan).toEqual({ handled: false });
    expect(admin.calls.upserts).toHaveLength(0);
  });
});

describe("webhook signature", () => {
  const secret = "whsec_test_secret";
  const payload = JSON.stringify({ id: "evt_1", object: "event", type: "customer.subscription.updated", data: { object: subscription() } });
  const stripe = new Stripe("sk_test_dummy");

  it("accepts a correctly signed payload", () => {
    const header = stripe.webhooks.generateTestHeaderString({ payload, secret });
    expect(stripe.webhooks.constructEvent(payload, header, secret).id).toBe("evt_1");
  });

  it("rejects a tampered payload and a wrong secret", () => {
    const header = stripe.webhooks.generateTestHeaderString({ payload, secret });
    expect(() => stripe.webhooks.constructEvent(payload + " ", header, secret)).toThrow();
    expect(() => stripe.webhooks.constructEvent(payload, header, "whsec_other")).toThrow();
  });
});

describe("plan errors", () => {
  it("turns database messages into friendly plan errors", () => {
    const error = toPlanError('plan_limit:teams');
    expect(error).toBeInstanceOf(PlanLimitError);
    expect(error.message).toMatch(/Pro allows 3 teams/);
    expect(toPlanError("something plan_limit:invites else").what).toBe("invites");
  });

  it("ignores unrelated errors", () => {
    expect(toPlanError("duplicate key value")).toBeNull();
    expect(toPlanError(undefined)).toBeNull();
  });
});

describe("billing switches and plan data", () => {
  const env = { BILLING_ENABLED: "true", STRIPE_SECRET_KEY: "sk_test_x", STRIPE_WEBHOOK_SECRET: "whsec_x", STRIPE_PRICE_PRO_MONTHLY: "price_m", STRIPE_PRICE_PRO_YEARLY: "price_y" };

  it("stays off unless everything is configured", () => {
    expect(billingEnabled({})).toBe(false);
    expect(billingEnabled({ ...env, BILLING_ENABLED: "false" })).toBe(false);
    expect(billingEnabled({ ...env, STRIPE_WEBHOOK_SECRET: "" })).toBe(false);
    expect(billingEnabled(env)).toBe(true);
  });

  it("picks the price for the interval", () => {
    expect(priceFor("month", env)).toBe("price_m");
    expect(priceFor("year", env)).toBe("price_y");
    expect(priceFor("week", env)).toBeNull();
  });

  it("keeps every plan at least as big as the one below it", () => {
    for (const key of ["teams", "players", "staff"]) {
      expect(PLANS.pro.limits[key]).toBeGreaterThan(PLANS.free.limits[key]);
      expect(PLANS.academy.limits[key]).toBeGreaterThan(PLANS.pro.limits[key]);
    }
    expect(PLANS.academy.limits.notes).toBeGreaterThanOrEqual(PLANS.pro.limits.notes);
    expect(PLANS.free.limits.statsDays).toBe(30);
    expect(PLANS.pro.limits.statsDays).toBeNull();
    expect(PLANS.academy.limits.statsDays).toBeNull();
  });

  it("prices the paid plans with a yearly discount and in ascending order", () => {
    expect(PLANS.free.price.month).toBe(0);
    expect(PLANS.pro.price.month).toBeLessThan(PLANS.academy.price.month);
    for (const id of ["pro", "academy"]) expect(PLANS[id].price.year).toBeLessThan(PLANS[id].price.month * 12);
  });

  it("picks Academy prices separately from Pro", () => {
    const both = { ...env, STRIPE_PRICE_ACADEMY_MONTHLY: "price_am", STRIPE_PRICE_ACADEMY_YEARLY: "price_ay" };
    expect(priceFor("month", both, "academy")).toBe("price_am");
    expect(priceFor("year", both, "academy")).toBe("price_ay");
    expect(priceFor("month", both, "pro")).toBe("price_m");
    expect(priceFor("month", env, "academy")).toBeNull();
    expect(priceFor("month", both, "enterprise")).toBeNull();
  });
});
