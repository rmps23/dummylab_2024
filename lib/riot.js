// Server-side Riot Games API client. Never import from client components.

// platform = LoL platform host (League-V4), account = Account-V1 cluster, match = Match-V5 cluster.
export const REGIONS = {
  EUW1: { name: "Europe West", account: "europe", match: "europe" },
  EUN1: { name: "Europe Nordic & East", account: "europe", match: "europe" },
  TR1: { name: "Turkey", account: "europe", match: "europe" },
  RU: { name: "Russia", account: "europe", match: "europe" },
  NA1: { name: "North America", account: "americas", match: "americas" },
  BR1: { name: "Brazil", account: "americas", match: "americas" },
  LA1: { name: "Latin America North", account: "americas", match: "americas" },
  LA2: { name: "Latin America South", account: "americas", match: "americas" },
  KR: { name: "Korea", account: "asia", match: "asia" },
  JP1: { name: "Japan", account: "asia", match: "asia" },
  OC1: { name: "Oceania", account: "asia", match: "sea" },
  PH2: { name: "Philippines", account: "asia", match: "sea" },
  SG2: { name: "Singapore", account: "asia", match: "sea" },
  TH2: { name: "Thailand", account: "asia", match: "sea" },
  TW2: { name: "Taiwan", account: "asia", match: "sea" },
  VN2: { name: "Vietnam", account: "asia", match: "sea" },
};

// Match ids look like "EUW1_1234567890": the platform of the player followed by a number.
export function isMatchIdFor(regionCode, id) {
  return typeof id === "string" && id.startsWith(`${String(regionCode).toUpperCase()}_`) && /^[A-Z0-9]{2,5}_\d{6,}$/.test(id);
}

export class RiotError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function getRegion(code) {
  const region = REGIONS[String(code || "").toUpperCase()];
  if (!region) throw new RiotError(400, "Invalid region");
  return region;
}

async function riotFetch(host, path, retries = 2) {
  const key = process.env.RIOT_API_KEY;
  if (!key) throw new RiotError(500, "RIOT_API_KEY is not configured");

  const response = await fetch(`https://${host}.api.riotgames.com${path}`, {
    headers: { "X-Riot-Token": key },
    cache: "no-store",
  });

  if (response.status === 429 && retries > 0) {
    const wait = Number(response.headers.get("Retry-After") || 1);
    await new Promise((resolve) => setTimeout(resolve, Math.min(wait, 10) * 1000));
    return riotFetch(host, path, retries - 1);
  }
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new RiotError(response.status === 429 ? 429 : 502, `Riot API error (${response.status})`);
  }
  return response.json();
}

export function getAccountByRiotId(gameName, tagLine, regionCode) {
  const { account } = getRegion(regionCode);
  return riotFetch(
    account,
    `/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`
  );
}

export function getMatchIds(puuid, regionCode, { start = 0, count = 100, startTime } = {}) {
  const { match } = getRegion(regionCode);
  const params = new URLSearchParams({ start, count });
  if (startTime) params.set("startTime", startTime);
  return riotFetch(match, `/lol/match/v5/matches/by-puuid/${encodeURIComponent(puuid)}/ids?${params}`);
}

export function getMatch(matchId, regionCode) {
  const { match } = getRegion(regionCode);
  return riotFetch(match, `/lol/match/v5/matches/${encodeURIComponent(matchId)}`);
}

export function getTimeline(matchId, regionCode) {
  const { match } = getRegion(regionCode);
  return riotFetch(match, `/lol/match/v5/matches/${encodeURIComponent(matchId)}/timeline`);
}

export function getRankEntries(puuid, regionCode) {
  getRegion(regionCode);
  return riotFetch(regionCode.toLowerCase(), `/lol/league/v4/entries/by-puuid/${encodeURIComponent(puuid)}`);
}

// Stats at the 10 and 20 minute marks. Riot participantIds are 1-based.
export function timelineStats(timeline, participantId) {
  const empty = () => ({ gold: 0, damage: 0, kills: 0, deaths: 0, assists: 0, wards: 0 });
  const out = { at10: empty(), at20: empty() };
  const frames = timeline?.info?.frames || [];

  [[10, out.at10], [20, out.at20]].forEach(([minute, bucket]) => {
    const pf = frames[minute]?.participantFrames?.[String(participantId)];
    if (pf) {
      bucket.gold = pf.totalGold || 0;
      bucket.damage = pf.damageStats?.totalDamageDoneToChampions || 0;
    }
  });

  frames.forEach((frame, index) => {
    (frame.events || []).forEach((event) => {
      const buckets = [];
      if (index <= 10) buckets.push(out.at10);
      if (index <= 20) buckets.push(out.at20);

      if (event.type === "WARD_PLACED" && event.creatorId === participantId) {
        buckets.forEach((b) => b.wards++);
      }
      if (event.type === "CHAMPION_KILL") {
        if (event.killerId === participantId) buckets.forEach((b) => b.kills++);
        if (event.victimId === participantId) buckets.forEach((b) => b.deaths++);
        if (event.assistingParticipantIds?.includes(participantId)) buckets.forEach((b) => b.assists++);
      }
    });
  });

  return out;
}

// Convert a Match-V5 payload (+ optional timeline) into rows for `match` and `player_match`.
export function toRows(matchData, timeline, puuid) {
  const info = matchData.info;
  const me = info.participants.find((p) => p.puuid === puuid);
  if (!me) return null;

  return {
    match: {
      id: matchData.metadata.matchId,
      queue_id: info.queueId,
      patch: info.gameVersion,
      duration: info.gameDuration,
      ended_at: new Date(info.gameEndTimestamp || info.gameStartTimestamp + info.gameDuration * 1000).toISOString(),
      draft: info.participants.map((p) => ({
        champion: p.championName,
        team: p.teamId,
        position: p.teamPosition,
      })),
    },
    playerMatch: {
      champion: me.championName,
      position: me.teamPosition || null,
      win: !!me.win,
      kills: me.kills,
      deaths: me.deaths,
      assists: me.assists,
      cs: (me.totalMinionsKilled || 0) + (me.neutralMinionsKilled || 0),
      gold: me.goldEarned,
      damage: me.totalDamageDealtToChampions,
      damage_taken: me.totalDamageTaken,
      vision_score: me.visionScore,
      wards_placed: me.wardsPlaced,
      wards_killed: me.wardsKilled,
      turret_kills: me.turretKills,
      kill_part: me.challenges?.killParticipation ?? null,
      team_damage_pct: me.challenges?.teamDamagePercentage ?? null,
      items: [me.item0, me.item1, me.item2, me.item3, me.item4, me.item5, me.item6],
      summoner_spells: [me.summoner1Id, me.summoner2Id],
      timeline: timeline ? timelineStats(timeline, me.participantId) : {},
    },
  };
}
