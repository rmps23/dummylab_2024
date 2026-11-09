import { readdirSync, readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

// Runs every migration in a real (WASM) Postgres and checks who can see and change what.
// Supabase provides the auth schema and roles; here they are stubbed just enough for the migrations.
const OWNER = "00000000-0000-0000-0000-000000000001";
const STAFF = "00000000-0000-0000-0000-000000000002";
const VIEWER = "00000000-0000-0000-0000-000000000003";
const STRANGER = "00000000-0000-0000-0000-000000000004";
const FREE_OWNER = "00000000-0000-0000-0000-000000000005";
const PRO_OWNER = "00000000-0000-0000-0000-000000000006";
const DAY = 86400000;

let db;

async function as(uid, fn) {
  return db.transaction(async (tx) => {
    await tx.exec("set local role authenticated");
    await tx.query("select set_config('request.jwt.sub', $1, true)", [uid]);
    return fn(tx);
  });
}
const rows = async (uid, sql, params) => (await as(uid, (tx) => tx.query(sql, params))).rows;

beforeAll(async () => {
  db = new PGlite();
  await db.exec(`
    create schema auth;
    create table auth.users (id uuid primary key, email text, raw_app_meta_data jsonb default '{}'::jsonb);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.sub', true), '')::uuid $$;
    create role authenticated; create role anon; create role service_role;
  `);
  const files = readdirSync("supabase/migrations").filter((f) => f.endsWith(".sql")).sort();
  for (const f of files) await db.exec(readFileSync(`supabase/migrations/${f}`, "utf8"));
  await db.exec(`
    grant usage on schema public, auth to authenticated;
    grant select, insert, update, delete on all tables in schema public to authenticated;
    grant usage on all sequences in schema public to authenticated;
    grant select on auth.users to authenticated;
  `);

  for (const [id, mail] of [[OWNER, "owner@x.gg"], [STAFF, "staff@x.gg"], [VIEWER, "viewer@x.gg"], [STRANGER, "nobody@x.gg"], [FREE_OWNER, "free@x.gg"], [PRO_OWNER, "pro@x.gg"]]) {
    await db.query("insert into auth.users (id, email) values ($1, $2)", [id, mail]);
  }
  await db.query("insert into account (user_id, plan, status) values ($1, 'academy', 'active'), ($2, 'pro', 'active')", [OWNER, PRO_OWNER]);
  await db.exec(`
    insert into team (id, owner_id, name) overriding system value values (1, '${OWNER}', 'Apex'), (2, '${FREE_OWNER}', 'Solo'), (3, '${PRO_OWNER}', 'Coach');
    insert into player (id, owner_id, team_id, role_id, name, region, riot_id, riot_puuid)
      values ('10000000-0000-0000-0000-000000000001', '${OWNER}', 1, 3, 'Kaito', 'EUW1', 'Kaito#EUW', 'puuid-a'),
             ('10000000-0000-0000-0000-000000000002', '${FREE_OWNER}', 2, 3, 'Solo', 'EUW1', 'Solo#EUW', 'puuid-b');
    insert into event (id, owner_id, team_id, type, title, starts_at, ends_at)
      overriding system value values (1, '${OWNER}', 1, 'scrim', 'Scrim', now() + interval '1 day', now() + interval '1 day 2 hours');
    insert into team_member (team_id, user_id, role) values (1, '${STAFF}', 'staff'), (1, '${VIEWER}', 'viewer'), (2, '${STAFF}', 'viewer');
    select setval(pg_get_serial_sequence('team', 'id'), 100), setval(pg_get_serial_sequence('event', 'id'), 100);
  `);
  // One old and one recent game for each player (old = 60 days ago).
  // A scrim (custom game, queue 0) of the first player: hidden until the player consents.
  await db.query("insert into match (id, queue_id, duration, ended_at) values ('EUW1_C1', 0, 1800, now() - interval '1 day')");
  await db.query("insert into player_match (player_id, match_id, champion, win) values ('10000000-0000-0000-0000-000000000001', 'EUW1_C1', 'Ahri', true)");
  for (const [mid, days, pid] of [["EUW1_1", 60, "10000000-0000-0000-0000-000000000001"], ["EUW1_2", 2, "10000000-0000-0000-0000-000000000001"], ["EUW1_3", 60, "10000000-0000-0000-0000-000000000002"], ["EUW1_4", 2, "10000000-0000-0000-0000-000000000002"]]) {
    await db.query("insert into match (id, queue_id, duration, ended_at) values ($1, 420, 1800, $2)", [mid, new Date(Date.now() - days * DAY).toISOString()]);
    await db.query("insert into player_match (player_id, match_id, champion, win) values ($1, $2, 'Ahri', true)", [pid, mid]);
  }
});

afterAll(() => db?.close());

describe("reading a team", () => {
  it("is limited to the owner and the people invited", async () => {
    for (const uid of [OWNER, STAFF, VIEWER]) {
      expect((await rows(uid, "select id from team where id = 1")).length).toBe(1);
      expect((await rows(uid, "select id from player where team_id = 1")).length).toBe(1);
      expect((await rows(uid, "select id from event where team_id = 1")).length).toBe(1);
      expect((await rows(uid, "select id from player_match where match_id = 'EUW1_2'")).length).toBe(1);
      expect((await rows(uid, "select id from match where id = 'EUW1_2'")).length).toBe(1);
    }
    for (const q of ["team", "player", "event", "player_match", "match", "event_participant"]) {
      expect((await rows(STRANGER, `select 1 from ${q}`)).length).toBe(0);
    }
  });

  it("shows each person only the teams they belong to", async () => {
    // STAFF is staff on team 1 and a viewer on team 2.
    expect((await rows(STAFF, "select id from team order by id")).map((r) => Number(r.id))).toEqual([1, 2]);
    expect((await rows(VIEWER, "select id from team")).map((r) => Number(r.id))).toEqual([1]);
  });
});

describe("writing", () => {
  it("lets staff create events but not viewers", async () => {
    const insert = (uid) =>
      as(uid, (tx) =>
        tx.query(
          "insert into event (team_id, type, title, starts_at, ends_at) values (1, 'training', 'Review', now() + interval '2 days', now() + interval '2 days 1 hour') returning id"
        )
      );
    await expect(insert(STAFF)).resolves.toBeTruthy();
    await expect(insert(VIEWER)).rejects.toThrow(/row-level security/);
    await expect(insert(STRANGER)).rejects.toThrow(/row-level security/);
  });

  it("lets staff update availability, viewers and strangers cannot", async () => {
    const answer = async (uid) =>
      (await as(uid, (tx) => tx.query("update event_participant set status = 'available' where event_id = 1 returning player_id"))).rows.length;
    expect(await answer(STAFF)).toBe(1);
    expect(await answer(VIEWER)).toBe(0);
    expect(await answer(STRANGER)).toBe(0);
  });

  it("keeps teams and players owner-only", async () => {
    const addPlayer = (uid) =>
      as(uid, (tx) =>
        tx.query(
          "insert into player (team_id, role_id, name, region, riot_id, riot_puuid) values (1, 1, 'Extra', 'EUW1', 'E#1', 'puuid-extra')"
        )
      );
    await expect(addPlayer(STAFF)).rejects.toThrow(/row-level security/);
    await expect(addPlayer(OWNER)).resolves.toBeTruthy();
    const renamed = async (uid) => (await as(uid, (tx) => tx.query("update team set name = name where id = 1 returning id"))).rows.length;
    expect(await renamed(STAFF)).toBe(0);
    expect(await renamed(OWNER)).toBe(1);
    const removed = async (uid) => (await as(uid, (tx) => tx.query("delete from team where id = 999 returning id"))).rows.length;
    expect(await removed(STAFF)).toBe(0);
  });

  it("keeps notes private to their author", async () => {
    const note = (uid, body) =>
      as(uid, (tx) =>
        tx.query("insert into player_note (player_id, kind, body) values ('10000000-0000-0000-0000-000000000001', 'note', $1)", [body])
      );
    await expect(note(STAFF, "staff note")).resolves.toBeTruthy();
    await expect(note(OWNER, "owner note")).resolves.toBeTruthy();
    await expect(note(VIEWER, "viewer note")).rejects.toThrow(/row-level security/);
    expect((await rows(OWNER, "select body from player_note")).map((r) => r.body)).toEqual(["owner note"]);
    expect((await rows(STAFF, "select body from player_note")).map((r) => r.body)).toEqual(["staff note"]);
  });
});

describe("plan limits", () => {
  const add = (uid, team, n) =>
    as(uid, (tx) =>
      tx.query("insert into player (team_id, role_id, name, region, riot_id, riot_puuid) values ($1, 1, $2, 'EUW1', 'x#1', $3)", [team, `P${n}`, `puuid-limit-${uid.slice(-1)}-${n}`])
    );
  it("caps a Pro owner at 50 players and a Free owner at 10", async () => {
    for (let n = 0; n < 9; n++) await add(FREE_OWNER, 2, n); // 1 existing + 9 = 10
    await expect(add(FREE_OWNER, 2, 99)).rejects.toThrow(/plan_limit:players/);
    for (let n = 0; n < 50; n++) await add(PRO_OWNER, 3, n);
    await expect(add(PRO_OWNER, 3, 99)).rejects.toThrow(/plan_limit:players/);
  });
  it("caps teams: Free 1, Pro 3", async () => {
    const team = (uid, n) => as(uid, (tx) => tx.query("insert into team (name) values ($1)", [`T${n}`]));
    await expect(team(FREE_OWNER, 1)).rejects.toThrow(/plan_limit:teams/);
    await team(PRO_OWNER, 1);
    await team(PRO_OWNER, 2);
    await expect(team(PRO_OWNER, 3)).rejects.toThrow(/plan_limit:teams/);
  });
});

describe("invites and seats", () => {
  const invite = (uid, team, n) =>
    as(uid, (tx) =>
      tx.query("insert into team_invite (team_id, email, role, token) values ($1, $2, 'staff', $3)", [team, `new${n}@x.gg`, String(n).padStart(32, "t")])
    );

  it("only the owner sees and creates invites", async () => {
    await expect(invite(STAFF, 1, 1)).rejects.toThrow(/row-level security/);
    await expect(invite(OWNER, 1, 1)).resolves.toBeTruthy();
    expect((await rows(OWNER, "select email from team_invite")).length).toBe(1);
    expect((await rows(STAFF, "select email from team_invite")).length).toBe(0);
  });

  it("limits staff seats by plan: Academy 5, Pro 1, Free none", async () => {
    // Academy owner: 2 members + 1 open invite = 3 of 5 seats used, so two more fit and the next is refused.
    await expect(invite(OWNER, 1, 2)).resolves.toBeTruthy();
    await expect(invite(OWNER, 1, 4)).resolves.toBeTruthy();
    await expect(invite(OWNER, 1, 5)).rejects.toThrow(/plan_limit:staff/);
    await expect(invite(PRO_OWNER, 3, 6)).resolves.toBeTruthy();
    await expect(invite(PRO_OWNER, 3, 7)).rejects.toThrow(/plan_limit:staff/);
    await expect(invite(FREE_OWNER, 2, 8)).rejects.toThrow(/plan_limit:staff/);
  });

  it("shows seats to the owner and to the member only", async () => {
    expect((await rows(OWNER, "select user_id from team_member where team_id = 1")).length).toBe(2);
    expect((await rows(STAFF, "select user_id from team_member where team_id = 1")).length).toBe(1);
    expect((await rows(STRANGER, "select user_id from team_member")).length).toBe(0);
  });

  it("lets a member leave", async () => {
    const left = (await as(VIEWER, (tx) => tx.query("delete from team_member where team_id = 1 returning user_id"))).rows.length;
    expect(left).toBe(1);
    expect((await rows(VIEWER, "select id from team")).length).toBe(0);
  });
});

describe("stats window follows the team owner's plan", () => {
  it("shows the full history on a paid team even to a free account", async () => {
    const [row] = await rows(STAFF, "select games from player_stats(1, null, null, null)");
    expect(Number(row.games)).toBe(2);
  });
  it("clamps to 30 days on a Free team", async () => {
    const [row] = await rows(STAFF, "select games from player_stats(2, null, null, null)");
    expect(Number(row.games)).toBe(1);
  });
});

describe("custom games and player consent", () => {
  const P1 = "10000000-0000-0000-0000-000000000001";

  it("hides custom games from everyone until the player consents", async () => {
    for (const uid of [OWNER, STAFF, VIEWER, STRANGER]) {
      expect((await rows(uid, "select id from match where id = 'EUW1_C1'")).length).toBe(0);
      expect((await rows(uid, "select id from player_match where match_id = 'EUW1_C1'")).length).toBe(0);
    }
    const [row] = await rows(OWNER, "select games from player_stats(1, null, null, null)");
    expect(Number(row.games)).toBe(2); // the scrim does not count
  });

  it("does not let a coach flip or set the consent", async () => {
    await as(OWNER, (tx) => tx.query("update player set custom_games_consent = true where id = $1", [P1]));
    expect((await rows(OWNER, "select custom_games_consent from player where id = $1", [P1]))[0].custom_games_consent).toBe(false);
    await as(OWNER, (tx) =>
      tx.query("insert into player (team_id, role_id, name, region, riot_id, riot_puuid, custom_games_consent) values (1, 1, 'Sneaky', 'EUW1', 'S#1', 'puuid-sneaky', true)")
    );
    expect((await rows(OWNER, "select custom_games_consent from player where name = 'Sneaky'"))[0].custom_games_consent).toBe(false);
  });

  it("shows them to the team once the server records the consent", async () => {
    await db.query("update player set custom_games_consent = true, custom_games_consent_at = now() where id = $1", [P1]);
    // (the viewer left the team in an earlier test, so only the owner and the staff member are checked)
    for (const uid of [OWNER, STAFF]) {
      expect((await rows(uid, "select id from match where id = 'EUW1_C1'")).length).toBe(1);
      expect((await rows(uid, "select id from player_match where match_id = 'EUW1_C1'")).length).toBe(1);
    }
    expect((await rows(STRANGER, "select id from match where id = 'EUW1_C1'")).length).toBe(0);
    const [row] = await rows(OWNER, "select games from player_stats(1, null, null, null)");
    expect(Number(row.games)).toBe(3);
  });

  it("deletes the stored custom games when consent is withdrawn", async () => {
    await db.query("update player set custom_games_consent = false, custom_games_consent_at = null where id = $1", [P1]);
    const removed = (await db.query("select purge_custom_games($1) as n", [P1])).rows[0].n;
    expect(Number(removed)).toBe(1);
    expect((await db.query("select count(*)::int as n from match where id = 'EUW1_C1'")).rows[0].n).toBe(0);
    expect((await db.query("select count(*)::int as n from match where id = 'EUW1_2'")).rows[0].n).toBe(1); // other games stay
  });

  it("keeps the purge function and the rate limiter out of reach of coaches", async () => {
    await expect(rows(OWNER, "select purge_custom_games($1)", [P1])).rejects.toThrow(/permission denied/);
    await expect(rows(OWNER, "select * from rate_limit_check('x', 1, 60)")).rejects.toThrow(/permission denied/);
    expect(await rows(OWNER, "select * from rate_limit_hit")).toEqual([]); // row level security, no policy
  });
});

describe("shared rate limiter", () => {
  const hit = async (key, limit = 2) => (await db.query("select * from rate_limit_check($1, $2, 60)", [key, limit])).rows[0];

  it("allows up to the limit per window, then says when to come back", async () => {
    expect((await hit("a")).ok).toBe(true);
    expect((await hit("a")).ok).toBe(true);
    const blocked = await hit("a");
    expect(blocked.ok).toBe(false);
    expect(blocked.retry_after).toBeGreaterThan(0);
    expect(blocked.retry_after).toBeLessThanOrEqual(60);
  });

  it("counts each key on its own and starts a fresh window later", async () => {
    expect((await hit("b")).ok).toBe(true);
    await db.query("update rate_limit_hit set window_start = now() - interval '2 minutes' where key = 'a'");
    expect((await hit("a")).ok).toBe(true);
  });
});
