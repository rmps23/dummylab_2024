import { describe, expect, it } from "vitest";
import { fmt, kda, pct } from "@/lib/stats";
import { availableCount, pendingCount, rosterShort, statusFor } from "@/lib/availability";

describe("stats helpers", () => {
  it("computes KDA and never divides by zero deaths", () => {
    expect(kda(5, 2, 7)).toBe(6);
    expect(kda(3, 0, 9)).toBe(12);
    expect(kda("4", "1", "6")).toBe(10);
  });

  it("computes rounded percentages", () => {
    expect(pct(1, 3)).toBe(33);
    expect(pct(2, 3)).toBe(67);
    expect(pct(0, 0)).toBe(0);
  });

  it("formats numbers and falls back for non-finite values", () => {
    expect(fmt(3.14159)).toBe("3.14");
    expect(fmt(7, 0)).toBe("7");
    expect(fmt(NaN)).toBe("-");
    expect(fmt(Infinity)).toBe("-");
  });
});

describe("availability helpers", () => {
  const players = ["a", "b", "c", "d", "e", "f"].map((id) => ({ id }));
  const event = {
    participants: [
      { player_id: "a", status: "available" },
      { player_id: "b", status: "available" },
      { player_id: "c", status: "maybe" },
      { player_id: "d", status: "unavailable" },
    ],
  };

  it("treats a missing answer as pending", () => {
    expect(statusFor(event, "a")).toBe("available");
    expect(statusFor(event, "e")).toBe("pending");
    expect(statusFor({}, "a")).toBe("pending");
  });

  it("counts available and pending players", () => {
    expect(availableCount(event, players)).toBe(2);
    expect(pendingCount(event, players)).toBe(2);
  });

  it("flags a short roster only when the team has at least five players", () => {
    expect(rosterShort(event, players)).toBe(true);
    expect(rosterShort(event, players.slice(0, 3))).toBe(false);
  });
});
