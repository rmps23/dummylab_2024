// Creates (or resets) the demo account with a sample team, players, matches and events.
// Server only. Used by `scripts/seed-demo.mjs` and by the daily reset cron.
import { createAdminClient } from "./supabase/admin.js";

const DEMO_TEAM = "Demo Esports";

const ROSTER = [
  { name: "Rift", role_id: 1, riot_id: "RiftKing#DEMO", champs: ["Ornn", "Jax", "Aatrox", "Gnar", "Camille"] },
  { name: "Shade", role_id: 2, riot_id: "ShadeJG#DEMO", champs: ["Viego", "LeeSin", "Vi", "Sejuani", "Nidalee"] },
  { name: "Nova", role_id: 3, riot_id: "NovaMid#DEMO", champs: ["Ahri", "Azir", "Orianna", "Syndra", "Viktor"] },
  { name: "Bolt", role_id: 4, riot_id: "BoltADC#DEMO", champs: ["Jinx", "Kaisa", "Ezreal", "Zeri", "Caitlyn"] },
  { name: "Echo", role_id: 5, riot_id: "EchoSup#DEMO", champs: ["Thresh", "Nautilus", "Lulu", "Rakan", "Leona"] },
];
const POSITIONS = ["TOP", "JUNGLE", "MIDDLE", "BOTTOM", "UTILITY"];
const ENEMY = {
  TOP: ["Fiora", "Malphite", "Sett", "Renekton"],
  JUNGLE: ["Elise", "Kayn", "Hecarim", "Amumu"],
  MIDDLE: ["Zed", "Yasuo", "Lux", "Akali"],
  BOTTOM: ["Ashe", "Draven", "Miss Fortune", "Lucian"].map((n) => n.replace(" ", "")),
  UTILITY: ["Blitzcrank", "Soraka", "Karma", "Braum"],
};

// Small deterministic PRNG so the demo data is the same on every reset.
function rng(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function statLine(rand, roleIndex, win, minutes) {
  const k = [3, 4, 5, 7, 6][roleIndex];
  const d = [4, 4, 3, 3, 3][roleIndex];
  const a = [5, 8, 7, 6, 12][roleIndex];
  const swing = win ? 1.3 : 0.7;
  const kills = Math.max(0, Math.round(k * swing * (0.5 + rand())));
  const deaths = Math.max(0, Math.round(d * (win ? 0.7 : 1.4) * (0.5 + rand())));
  const assists = Math.max(0, Math.round(a * swing * (0.6 + rand() * 0.8)));
  const csPerMin = [7.2, 5.6, 7.6, 8.2, 1.2][roleIndex] * (0.85 + rand() * 0.3);
  const cs = Math.round(csPerMin * minutes);
  const gold = Math.round(minutes * (roleIndex === 4 ? 230 : 380) * (win ? 1.1 : 0.92));
  return {
    kills, deaths, assists, cs, gold,
    damage: Math.round(minutes * [560, 420, 640, 680, 230][roleIndex] * (win ? 1.15 : 0.85) * (0.8 + rand() * 0.4)),
    damage_taken: Math.round(minutes * 700 * (0.7 + rand() * 0.6)),
    vision_score: Math.round(minutes * (roleIndex === 4 ? 2.6 : roleIndex === 1 ? 1.4 : 0.9) * (0.8 + rand() * 0.4)),
    wards_placed: Math.round(minutes * (roleIndex === 4 ? 0.9 : 0.35)),
    wards_killed: Math.round(rand() * 6),
    turret_kills: Math.round(rand() * 2),
    kill_part: Math.min(0.85, 0.3 + ((kills + assists) / (kills + assists + 10)) * 0.5),
    team_damage_pct: 0.15 + rand() * 0.2,
  };
}

function early(rand, s, minutes, mark) {
  const f = Math.min(1, mark / minutes);
  return {
    gold: Math.round(s.gold * f * 0.9),
    damage: Math.round(s.damage * f * 0.6),
    kills: Math.round(s.kills * f * 0.5),
    deaths: Math.round(s.deaths * f * 0.5),
    assists: Math.round(s.assists * f * 0.5),
    wards: Math.round(s.wards_placed * (mark === 10 ? 0.5 : 0.8)),
  };
}

function buildMatches(players) {
  const rand = rng(2024);
  const matches = [];
  const playerMatches = [];
  const now = Date.now();
  let n = 0;

  const make = (id, queue, daysAgo, members) => {
    const win = rand() < 0.58;
    const minutes = 24 + Math.round(rand() * 14);
    const endedAt = new Date(now - daysAgo * 86400000 - rand() * 6 * 3600000);
    const picked = members.map((m) => ({ ...m, champion: m.champs[Math.floor(rand() * m.champs.length)] }));

    const draft = POSITIONS.map((pos, i) => {
      const mine = picked.find((m) => m.roleIndex === i);
      return { champion: mine ? mine.champion : ENEMY[pos][Math.floor(rand() * 4)], team: 100, position: pos };
    }).concat(POSITIONS.map((pos) => ({ champion: ENEMY[pos][Math.floor(rand() * 4)], team: 200, position: pos })));

    matches.push({
      id, queue_id: queue, patch: "15.21.1", duration: minutes * 60, ended_at: endedAt.toISOString(), draft,
    });
    picked.forEach((m) => {
      const s = statLine(rand, m.roleIndex, win, minutes);
      playerMatches.push({
        player_id: m.id, match_id: id, champion: m.champion, position: POSITIONS[m.roleIndex], win,
        ...s, items: [3157, 3089, 3020, 3135, 3165, 3003, 3340], summoner_spells: [4, 14],
        timeline: { at10: early(rand, s, minutes, 10), at20: early(rand, s, minutes, 20) },
      });
    });
  };

  const members = players.map((p, i) => ({ ...p, roleIndex: i }));
  // Shared games get an id that belongs to this demo account, so two demo accounts never collide.
  const tag = String(players[0].owner_id).slice(0, 8);
  members.forEach((m) => {
    for (let i = 0; i < 26; i++) make(`DEMO_${m.id.slice(0, 8)}_${n++}`, 420, 0.4 + i * 1.1, [m]);
  });
  for (let i = 0; i < 10; i++) make(`DEMO_SCRIM_${tag}_${n++}`, 0, 1 + i * 2.7, members);
  for (let i = 0; i < 4; i++) make(`DEMO_CLASH_${tag}_${n++}`, 700, 3 + i * 7, members);
  return { matches, playerMatches };
}

function buildEvents(teamId, ownerId) {
  const at = (days, hour, minutes = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    d.setHours(hour, minutes, 0, 0);
    return d;
  };
  const rows = [];
  const add = (type, title, start, hours, extra = {}) =>
    rows.push({
      team_id: teamId, owner_id: ownerId, type, title,
      starts_at: start.toISOString(), ends_at: new Date(start.getTime() + hours * 3600000).toISOString(), ...extra,
    });

  for (let w = -1; w < 4; w++) {
    add("training", "Team practice", at(w * 7 + 1, 19), 2, { notes: "Macro review + draft practice" });
    add("training", "VOD review", at(w * 7 + 3, 18), 1.5);
    if (w >= 0) add("scrim", "Scrim block", at(w * 7 + 4, 20), 2.5, { opponent: ["Night Owls", "Apex Five", "Iron Wolves", "Drake Hunters"][w % 4], link: "https://discord.gg/demo" });
  }
  add("match", "League playoffs: Round 1", at(9, 19), 3, { opponent: "Crimson Guard", notes: "Best of 3" });
  return rows;
}

export async function seedDemo() {
  const email = process.env.DEMO_EMAIL;
  const password = process.env.DEMO_PASSWORD;
  if (!email || !password) throw new Error("DEMO_EMAIL and DEMO_PASSWORD are required");

  const admin = createAdminClient();

  // Find or create the demo user, and always restore its credentials.
  const { data: list, error: listError } = await admin.auth.admin.listUsers({ perPage: 1000 });
  if (listError) throw listError;
  let user = list.users.find((u) => u.email === email);
  const attrs = { email, password, email_confirm: true, app_metadata: { is_demo: true } };
  if (user) {
    const { data, error } = await admin.auth.admin.updateUserById(user.id, attrs);
    if (error) throw error;
    user = data.user;
  } else {
    const { data, error } = await admin.auth.admin.createUser(attrs);
    if (error) throw error;
    user = data.user;
  }

  // Wipe previous data (events, players, matches cascade from the team).
  const { data: oldPlayers } = await admin.from("player").select("id").eq("owner_id", user.id);
  const oldIds = (oldPlayers || []).map((p) => p.id);
  if (oldIds.length) {
    const { data: pm } = await admin.from("player_match").select("match_id").in("player_id", oldIds);
    const matchIds = [...new Set((pm || []).map((r) => r.match_id))];
    if (matchIds.length) await admin.from("match").delete().in("id", matchIds);
  }
  await admin.from("team").delete().eq("owner_id", user.id);

  const { data: team, error: teamError } = await admin
    .from("team").insert({ owner_id: user.id, name: DEMO_TEAM }).select().single();
  if (teamError) throw teamError;

  const { data: players, error: playerError } = await admin
    .from("player")
    .insert(ROSTER.map((r, i) => ({
      owner_id: user.id, team_id: team.id, role_id: r.role_id, name: r.name, region: "EUW1",
      riot_id: r.riot_id, riot_puuid: `demo-puuid-${i + 1}`, last_synced_at: new Date().toISOString(),
    })))
    .select();
  if (playerError) throw playerError;
  const ordered = ROSTER.map((r, i) => ({ ...players.find((p) => p.riot_puuid === `demo-puuid-${i + 1}`), champs: r.champs }));

  const { matches, playerMatches } = buildMatches(ordered);
  for (let i = 0; i < matches.length; i += 100) {
    const { error } = await admin.from("match").insert(matches.slice(i, i + 100));
    if (error) throw error;
  }
  for (let i = 0; i < playerMatches.length; i += 100) {
    const { error } = await admin.from("player_match").insert(playerMatches.slice(i, i + 100));
    if (error) throw error;
  }

  const tiers = [["EMERALD", "II", 54], ["DIAMOND", "IV", 12], ["EMERALD", "I", 88], ["DIAMOND", "III", 40], ["EMERALD", "III", 7]];
  await admin.from("rank_snapshot").insert(
    ordered.map((p, i) => ({
      player_id: p.id, queue: "RANKED_SOLO_5x5", tier: tiers[i][0], rank: tiers[i][1], lp: tiers[i][2],
      wins: 120 + i * 9, losses: 105 + i * 4,
    }))
  );

  const { data: events, error: eventError } = await admin.from("event").insert(buildEvents(team.id, user.id)).select("id, starts_at");
  if (eventError) throw eventError;

  // The trigger created "pending" rows; answer for most players on future events.
  const rand = rng(7);
  const answers = [];
  events.forEach((e) => {
    const future = new Date(e.starts_at) > new Date();
    ordered.forEach((p) => {
      const r = rand();
      if (future && r < 0.08) return; // still pending
      answers.push({ event_id: e.id, player_id: p.id, status: r < 0.7 ? "available" : r < 0.85 ? "maybe" : "unavailable" });
    });
  });
  if (answers.length) await admin.from("event_participant").upsert(answers, { onConflict: "event_id,player_id" });

  // Sample coach notes and goals. Ignored if the notes migration has not been applied yet.
  const day = (offset) => new Date(Date.now() + offset * 86400000).toISOString().slice(0, 10);
  await admin.from("player_note").insert([
    { owner_id: user.id, player_id: ordered[0].id, kind: "goal", body: "Reach 7.5 CS/min by the end of the month", due_date: day(14) },
    { owner_id: user.id, player_id: ordered[0].id, kind: "note", body: "Overextends in lane when ahead. Review wave control in the next VOD session." },
    { owner_id: user.id, player_id: ordered[1].id, kind: "goal", body: "Track enemy jungler before minute 5 on every game", due_date: day(7) },
    { owner_id: user.id, player_id: ordered[3].id, kind: "goal", body: "Fewer than 3 deaths per game in scrims", status: "done", due_date: day(-3) },
  ]);

  return { user: user.id, team: team.id, players: ordered.length, matches: matches.length, events: events.length };
}
