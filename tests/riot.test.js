import { describe, expect, it } from "vitest";
import { getRegion, RiotError, riotFetch, timelineStats, toRows } from "@/lib/riot";

describe("getRegion", () => {
  it("maps platforms to their routing clusters", () => {
    expect(getRegion("EUW1")).toMatchObject({ account: "europe", match: "europe" });
    expect(getRegion("oc1")).toMatchObject({ account: "asia", match: "sea" });
    expect(getRegion("NA1").match).toBe("americas");
  });

  it("rejects anything that is not a known platform", () => {
    expect(() => getRegion("evil.com")).toThrow(RiotError);
    expect(() => getRegion("")).toThrow(RiotError);
    expect(() => getRegion(undefined)).toThrow(RiotError);
  });
});

// Frames are minute snapshots; participantIds are 1-based in Riot's payloads.
const timeline = {
  info: {
    frames: Array.from({ length: 25 }, (_, minute) => ({
      participantFrames: {
        2: { totalGold: minute * 100, damageStats: { totalDamageDoneToChampions: minute * 50 } },
      },
      events:
        minute === 3
          ? [
              { type: "CHAMPION_KILL", killerId: 2, victimId: 7, assistingParticipantIds: [1] },
              { type: "CHAMPION_KILL", killerId: 7, victimId: 2, assistingParticipantIds: [3] },
              { type: "WARD_PLACED", creatorId: 2 },
            ]
          : minute === 15
            ? [{ type: "CHAMPION_KILL", killerId: 1, victimId: 5, assistingParticipantIds: [2] }]
            : [],
    })),
  },
};

describe("timelineStats", () => {
  it("reads gold and damage at 10 and 20 minutes using the 1-based participant id", () => {
    const s = timelineStats(timeline, 2);
    expect(s.at10).toMatchObject({ gold: 1000, damage: 500 });
    expect(s.at20).toMatchObject({ gold: 2000, damage: 1000 });
  });

  it("counts events up to each mark", () => {
    const s = timelineStats(timeline, 2);
    expect(s.at10).toMatchObject({ kills: 1, deaths: 1, assists: 0, wards: 1 });
    expect(s.at20).toMatchObject({ kills: 1, deaths: 1, assists: 1, wards: 1 });
  });

  it("returns zeros for short games and missing data", () => {
    expect(timelineStats({ info: { frames: [] } }, 2).at20.gold).toBe(0);
    expect(timelineStats(null, 2).at10.kills).toBe(0);
  });
});

describe("toRows", () => {
  const participant = (n, puuid, extra = {}) => ({
    puuid,
    participantId: n,
    championName: `Champ${n}`,
    teamId: n <= 5 ? 100 : 200,
    teamPosition: "MIDDLE",
    win: true,
    kills: 7,
    deaths: 2,
    assists: 9,
    totalMinionsKilled: 180,
    neutralMinionsKilled: 20,
    goldEarned: 12000,
    totalDamageDealtToChampions: 25000,
    totalDamageTaken: 15000,
    visionScore: 30,
    wardsPlaced: 12,
    wardsKilled: 3,
    turretKills: 1,
    item0: 1, item1: 2, item2: 3, item3: 4, item4: 5, item5: 6, item6: 7,
    summoner1Id: 4,
    summoner2Id: 14,
    challenges: { killParticipation: 0.6, teamDamagePercentage: 0.3 },
    ...extra,
  });
  const match = {
    metadata: { matchId: "EUW1_123" },
    info: {
      queueId: 420,
      gameVersion: "15.1.1",
      gameDuration: 1800,
      gameEndTimestamp: Date.UTC(2025, 0, 2),
      participants: Array.from({ length: 10 }, (_, i) => participant(i + 1, `puuid-${i + 1}`)),
    },
  };

  it("builds match and player rows for the requested player", () => {
    const rows = toRows(match, null, "puuid-3");
    expect(rows.match).toMatchObject({ id: "EUW1_123", queue_id: 420, duration: 1800 });
    expect(rows.match.draft).toHaveLength(10);
    expect(rows.playerMatch).toMatchObject({ champion: "Champ3", kills: 7, cs: 200, kill_part: 0.6 });
    expect(rows.playerMatch.items).toHaveLength(7);
    expect(rows.playerMatch.timeline).toEqual({});
  });

  it("returns null when the player is not in the match", () => {
    expect(toRows(match, null, "someone-else")).toBeNull();
  });

  it("survives matches without the challenges block", () => {
    const m = structuredClone(match);
    delete m.info.participants[0].challenges;
    const rows = toRows(m, null, "puuid-1");
    expect(rows.playerMatch.kill_part).toBeNull();
    expect(rows.playerMatch.team_damage_pct).toBeNull();
  });
});

describe("riotFetch failure handling", () => {
  const env = { RIOT_API_KEY: "test-key" };
  const res = (status, headers = {}, body = {}) => ({ status, ok: status >= 200 && status < 300, headers: { get: (k) => headers[k] ?? null }, json: async () => body });
  const run = (fetchImpl, retries = 2) => riotFetch("europe", "/x", retries, { fetchImpl, env, wait: async () => {} });

  it("returns the body on success and null on 404", async () => {
    expect(await run(async () => res(200, {}, { a: 1 }))).toEqual({ a: 1 });
    expect(await run(async () => res(404))).toBeNull();
  });

  it("retries a short 429 and then succeeds", async () => {
    let calls = 0;
    const out = await run(async () => (++calls === 1 ? res(429, { "Retry-After": "2" }) : res(200, {}, { ok: true })));
    expect(out).toEqual({ ok: true });
    expect(calls).toBe(2);
  });

  it("reports a long 429 with the wait time instead of blocking", async () => {
    await expect(run(async () => res(429, { "Retry-After": "90" }))).rejects.toMatchObject({ status: 429, retryAfter: 90 });
  });

  it("maps Riot outages, timeouts and rejected keys to clear errors", async () => {
    await expect(run(async () => res(503))).rejects.toMatchObject({ status: 503 });
    await expect(run(async () => { throw new Error("network"); })).rejects.toMatchObject({ status: 503 });
    await expect(run(async () => res(403))).rejects.toMatchObject({ status: 502, message: expect.stringContaining("API key rejected") });
  });

  it("refuses to run without a key", async () => {
    await expect(riotFetch("europe", "/x", 0, { env: {} })).rejects.toMatchObject({ status: 500 });
  });
});
