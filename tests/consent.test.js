import { describe, expect, it } from "vitest";
import { canStoreMatch, isCustomGame } from "@/lib/consent";
import { rateLimit, rateLimitShared, resetRateLimits } from "@/lib/ratelimit";

describe("canStoreMatch", () => {
  it("stores ranked, normal and clash games for everyone", () => {
    for (const queue of [420, 440, 400, 700]) {
      expect(canStoreMatch(queue, false)).toBe(true);
      expect(canStoreMatch(queue, true)).toBe(true);
    }
  });
  it("stores custom games (queue 0) only with explicit consent", () => {
    expect(isCustomGame(0)).toBe(true);
    expect(isCustomGame("0")).toBe(true);
    expect(canStoreMatch(0, false)).toBe(false);
    expect(canStoreMatch(0, undefined)).toBe(false);
    expect(canStoreMatch(0, "true")).toBe(false); // only a real boolean counts
    expect(canStoreMatch(0, true)).toBe(true);
  });
});

describe("rateLimitShared", () => {
  const opts = { limit: 2, windowMs: 60_000 };
  const admin = (result) => ({ rpc: async () => result });

  it("uses the answer of the database function", async () => {
    expect(await rateLimitShared(admin({ data: [{ ok: true, retry_after: 0 }], error: null }), "k", opts)).toEqual({ ok: true, retryAfter: 0 });
    expect(await rateLimitShared(admin({ data: [{ ok: false, retry_after: 42 }], error: null }), "k", opts)).toEqual({ ok: false, retryAfter: 42 });
  });

  it("falls back to the in-memory limiter when the function is missing or fails", async () => {
    resetRateLimits();
    const broken = admin({ data: null, error: { message: "function rate_limit_check does not exist" } });
    expect((await rateLimitShared(broken, "fallback", opts)).ok).toBe(true);
    expect((await rateLimitShared(broken, "fallback", opts)).ok).toBe(true);
    expect((await rateLimitShared(broken, "fallback", opts)).ok).toBe(false);
    const throwing = { rpc: async () => { throw new Error("network"); } };
    expect((await rateLimitShared(throwing, "other", opts, rateLimit)).ok).toBe(true);
  });
});
