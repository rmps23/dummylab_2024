import { describe, expect, it } from "vitest";
import { ANSWERS, getInviteContext, isToken, newToken, publicEvent } from "@/lib/invites";

describe("invite tokens", () => {
  it("generates 32 URL-safe characters", () => {
    const token = newToken();
    expect(token).toHaveLength(32);
    expect(isToken(token)).toBe(true);
  });

  it("generates a different token each time", () => {
    expect(new Set(Array.from({ length: 50 }, newToken)).size).toBe(50);
  });

  it("rejects values that are not tokens", () => {
    expect(isToken("short")).toBe(false);
    expect(isToken("a".repeat(31) + "!")).toBe(false);
    expect(isToken(`${"a".repeat(31)}/`)).toBe(false);
    expect(isToken(undefined)).toBe(false);
    expect(isToken(123)).toBe(false);
  });
});

describe("publicEvent", () => {
  const event = {
    id: 7,
    type: "scrim",
    title: "Scrim block",
    starts_at: "2026-11-07T20:00:00Z",
    ends_at: "2026-11-07T22:30:00Z",
    opponent: "Night Owls",
    notes: "Bring draft notes",
    link: "https://discord.gg/private",
    participants: [
      { player_id: "me", status: "maybe" },
      { player_id: "other", status: "available" },
    ],
  };

  it("shows only what a player needs and only their own answer", () => {
    const result = publicEvent(event, "me");
    expect(result).toEqual({
      id: 7,
      type: "scrim",
      title: "Scrim block",
      starts_at: "2026-11-07T20:00:00Z",
      ends_at: "2026-11-07T22:30:00Z",
      opponent: "Night Owls",
      status: "maybe",
    });
    expect(result).not.toHaveProperty("notes");
    expect(result).not.toHaveProperty("link");
    expect(result).not.toHaveProperty("participants");
  });

  it("defaults to pending when the player has not answered", () => {
    expect(publicEvent(event, "someone").status).toBe("pending");
    expect(publicEvent({ ...event, participants: undefined }, "me").status).toBe("pending");
  });
});

describe("answers and lookup", () => {
  it("accepts only the three answers a player can give", () => {
    expect(ANSWERS).toEqual(["available", "maybe", "unavailable"]);
  });

  it("does not touch the database for a malformed token", async () => {
    const admin = {
      from() {
        throw new Error("database must not be queried");
      },
    };
    await expect(getInviteContext(admin, "not-a-token")).resolves.toBeNull();
  });
});
