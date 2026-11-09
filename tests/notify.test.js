import { describe, expect, it } from "vitest";
import { buildReminder, isDiscordWebhook, sendDiscord } from "@/lib/discord";
import { sendEmail } from "@/lib/email";
import { buildWeeklyReport, reportToCsv, reportToHtml, reportToText } from "@/lib/report";

const WEBHOOK = "https://discord.com/api/webhooks/123456789012345678/abcdefghijklmnopqrstuvwxyz_ABCDEF-1234567";

describe("isDiscordWebhook", () => {
  it("accepts Discord webhook URLs", () => {
    expect(isDiscordWebhook(WEBHOOK)).toBe(true);
    expect(isDiscordWebhook(WEBHOOK.replace("discord.com", "discordapp.com"))).toBe(true);
  });

  it("rejects every other host, scheme or shape", () => {
    expect(isDiscordWebhook("https://evil.example/api/webhooks/123456789012345678/abcdefghijklmnopqrstuvwxyz")).toBe(false);
    expect(isDiscordWebhook("http://discord.com/api/webhooks/123456789012345678/abcdefghijklmnopqrstuvwxyz")).toBe(false);
    expect(isDiscordWebhook("https://discord.com.evil.example/api/webhooks/123456789012345678/abcdefghijklmnopqrstuvwxyz")).toBe(false);
    expect(isDiscordWebhook(`${WEBHOOK}?x=https://evil.example`)).toBe(false);
    expect(isDiscordWebhook("https://discord.com/api/webhooks/1/short")).toBe(false);
    expect(isDiscordWebhook(undefined)).toBe(false);
  });
});

const players = [
  { id: "a", name: "Rift", role: { name: "Top" } },
  { id: "b", name: "Shade", role: { name: "Jungler" } },
  { id: "c", name: "Nova", role: { name: "Mid" } },
];
const event = {
  id: 1,
  title: "Scrim block",
  type: "scrim",
  opponent: "Night Owls",
  starts_at: "2026-11-07T20:00:00Z",
  ends_at: "2026-11-07T22:00:00Z",
  participants: [
    { player_id: "a", status: "available" },
    { player_id: "b", status: "unavailable" },
  ],
};

describe("buildReminder", () => {
  const payload = buildReminder({ team: { name: "Demo" }, event, players, link: "https://x.test/dashboard/schedule" });
  const embed = payload.embeds[0];

  it("summarises the event and uses Discord time stamps", () => {
    expect(embed.title).toBe("Scrim: Scrim block");
    expect(embed.description).toContain("<t:1794081600:F>");
    expect(embed.description).toContain("Night Owls");
    expect(embed.description).toContain("**1/3** confirmed, 1 still to answer");
  });

  it("lists who answered what and never pings anyone", () => {
    const fields = Object.fromEntries(embed.fields.map((f) => [f.name, f.value]));
    expect(fields.Available).toBe("Rift");
    expect(fields["Can't make it"]).toBe("Shade");
    expect(fields["Waiting for an answer"]).toBe("Nova");
    expect(payload.allowed_mentions).toEqual({ parse: [] });
  });
});

describe("sendDiscord", () => {
  it("posts JSON to a valid webhook and reports failures", async () => {
    const seen = [];
    await sendDiscord(WEBHOOK, { hello: 1 }, async (url, init) => (seen.push({ url, body: init.body }), { ok: true }));
    expect(seen).toEqual([{ url: WEBHOOK, body: '{"hello":1}' }]);
    await expect(sendDiscord(WEBHOOK, {}, async () => ({ ok: false, status: 404 }))).rejects.toThrow("404");
  });

  it("never calls the network for a URL that is not a Discord webhook", async () => {
    let called = false;
    await expect(sendDiscord("https://evil.example/x", {}, async () => ((called = true), { ok: true }))).rejects.toThrow();
    expect(called).toBe(false);
  });
});

const now = new Date("2026-11-10T12:00:00Z");
const game = (player_id, win, extra = {}) => ({
  player_id,
  champion: "Ahri",
  win,
  kills: 5,
  deaths: 2,
  assists: 7,
  cs: 200,
  match: { ended_at: "2026-11-08T12:00:00Z", duration: 1800 },
  ...extra,
});

describe("buildWeeklyReport", () => {
  const report = buildWeeklyReport({
    team: { name: "Demo" },
    players,
    now,
    matches: [
      game("a", true),
      game("a", false, { champion: "Gnar" }),
      game("b", true),
      game("b", true, { match: { ended_at: "2026-10-01T12:00:00Z", duration: 1800 } }), // too old
      game("c", true, { match: { ended_at: "2026-11-08T12:00:00Z", duration: 200 } }), // remake
    ],
    events: [
      { ...event, starts_at: "2026-11-12T20:00:00Z" },
      { ...event, id: 2, starts_at: "2026-12-30T20:00:00Z" }, // outside the next 7 days
      { ...event, id: 3, starts_at: "2026-11-01T20:00:00Z" }, // already happened
    ],
  });

  it("counts only the last 7 days and ignores remakes", () => {
    expect(report.games).toBe(3);
    expect(report.wins).toBe(2);
    expect(report.losses).toBe(1);
    expect(report.winRate).toBe(67);
    expect(report.perPlayer.find((p) => p.id === "c").games).toBe(0);
  });

  it("lists champions and only the upcoming events with who is pending", () => {
    expect(report.topChampions[0]).toMatchObject({ champion: "Ahri", games: 2 });
    expect(report.upcoming).toHaveLength(1);
    expect(report.upcoming[0]).toMatchObject({ available: 1, pendingCount: 1, pending: ["Nova"] });
  });

  it("renders CSV, text and HTML", () => {
    expect(reportToCsv(report).split("\n")[0]).toBe("Player,Role,Games,Wins,Win rate %,KDA,CS/min");
    expect(reportToText(report)).toContain("3 games, 2W 1L (67% win rate)");
    expect(reportToHtml(report)).toContain("weekly report");
  });

  it("neutralises spreadsheet formulas and escapes HTML in names", () => {
    const evil = buildWeeklyReport({
      team: { name: "<b>Team</b>" },
      players: [{ id: "x", name: "=HYPERLINK(\"http://evil\")", role: { name: "Top" } }],
      matches: [],
      events: [],
      now,
    });
    expect(reportToCsv(evil)).toContain("\"'=HYPERLINK(");
    expect(reportToHtml(evil)).not.toContain("<b>Team</b>");
  });
});

describe("sendEmail", () => {
  it("requires configuration and posts to the provider", async () => {
    await expect(sendEmail({ to: "a@b.c", subject: "s", html: "h", text: "t" }, {})).rejects.toThrow("not configured");

    let request;
    await sendEmail({ to: "a@b.c", subject: "s", html: "h", text: "t" }, { RESEND_API_KEY: "re_x" }, async (url, init) => {
      request = { url, init };
      return { ok: true };
    });
    expect(request.url).toBe("https://api.resend.com/emails");
    expect(request.init.headers.Authorization).toBe("Bearer re_x");
    expect(JSON.parse(request.init.body)).toMatchObject({ to: ["a@b.c"], subject: "s" });
  });
});
