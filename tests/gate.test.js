import { beforeEach, describe, expect, it } from "vitest";
import { riotEnabledFor } from "@/lib/features";
import { rateLimit, resetRateLimits } from "@/lib/ratelimit";
import { isMatchIdFor } from "@/lib/riot";

describe("riotEnabledFor", () => {
  const user = { email: "Coach@Example.com", app_metadata: {} };

  it("is off by default", () => {
    expect(riotEnabledFor(user, {})).toBe(false);
  });

  it("is on for everyone when the production key switch is set", () => {
    expect(riotEnabledFor(user, { RIOT_ENABLED: "true" })).toBe(true);
    expect(riotEnabledFor(user, { RIOT_ENABLED: "false" })).toBe(false);
  });

  it("is on for allow-listed emails, ignoring case and spaces", () => {
    const env = { RIOT_ALLOWED_EMAILS: " other@x.com , coach@example.com " };
    expect(riotEnabledFor(user, env)).toBe(true);
    expect(riotEnabledFor({ email: "nobody@x.com" }, env)).toBe(false);
  });

  it("never enables the demo account or anonymous requests", () => {
    const demo = { email: "coach@example.com", app_metadata: { is_demo: true } };
    expect(riotEnabledFor(demo, { RIOT_ENABLED: "true" })).toBe(false);
    expect(riotEnabledFor(null, { RIOT_ENABLED: "true" })).toBe(false);
  });
});

describe("rateLimit", () => {
  beforeEach(resetRateLimits);
  const rule = { limit: 3, windowMs: 1000 };

  it("allows up to the limit then blocks with a retry hint", () => {
    expect([1, 2, 3].map(() => rateLimit("u", rule, 0).ok)).toEqual([true, true, true]);
    const blocked = rateLimit("u", rule, 100);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfter).toBeGreaterThan(0);
  });

  it("frees the slot once the window has passed", () => {
    for (let i = 0; i < 3; i++) rateLimit("u", rule, 0);
    expect(rateLimit("u", rule, 1001).ok).toBe(true);
  });

  it("keeps separate counters per key", () => {
    for (let i = 0; i < 3; i++) rateLimit("a", rule, 0);
    expect(rateLimit("b", rule, 0).ok).toBe(true);
  });
});

describe("isMatchIdFor", () => {
  it("accepts ids of the player's own platform", () => {
    expect(isMatchIdFor("EUW1", "EUW1_7123456789")).toBe(true);
    expect(isMatchIdFor("euw1", "EUW1_7123456789")).toBe(true);
  });

  it("rejects other platforms and malformed values", () => {
    expect(isMatchIdFor("EUW1", "NA1_7123456789")).toBe(false);
    expect(isMatchIdFor("EUW1", "EUW1_12")).toBe(false);
    expect(isMatchIdFor("EUW1", "EUW1_71234/../x")).toBe(false);
    expect(isMatchIdFor("EUW1", 12345)).toBe(false);
    expect(isMatchIdFor("EUW1", undefined)).toBe(false);
  });
});
