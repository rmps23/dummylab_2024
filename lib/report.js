import { SITE } from "@/lib/site";
import { availableCount, pendingCount, statusFor } from "@/lib/availability";
import { kda, pct } from "@/lib/stats";

const DAY = 86400000;
const round = (n, digits = 1) => Math.round(n * 10 ** digits) / 10 ** digits;

// Weekly summary of a team: the last 7 days of games and the next 7 days of events.
// `matches` are player_match rows with a `match` object; `events` carry their participants.
export function buildWeeklyReport({ team, players, matches, events, now = new Date() }) {
  const from = new Date(now.getTime() - 7 * DAY);
  const until = new Date(now.getTime() + 7 * DAY);

  const games = matches.filter((g) => g.match.duration >= 300 && new Date(g.match.ended_at) >= from && new Date(g.match.ended_at) <= now);
  const wins = games.filter((g) => g.win).length;

  const perPlayer = players.map((p) => {
    const own = games.filter((g) => g.player_id === p.id);
    const sum = (key) => own.reduce((n, g) => n + (g[key] || 0), 0);
    const minutes = own.reduce((n, g) => n + g.match.duration / 60, 0);
    return {
      id: p.id,
      name: p.name,
      role: p.role?.name ?? "",
      games: own.length,
      wins: own.filter((g) => g.win).length,
      winRate: pct(own.filter((g) => g.win).length, own.length),
      kda: own.length ? round(kda(sum("kills"), sum("deaths"), sum("assists")), 2) : null,
      csPerMin: minutes ? round(sum("cs") / minutes) : null,
    };
  });

  const champs = new Map();
  games.forEach((g) => {
    const c = champs.get(g.champion) || { champion: g.champion, games: 0, wins: 0 };
    c.games++;
    if (g.win) c.wins++;
    champs.set(g.champion, c);
  });

  const upcoming = events
    .filter((e) => new Date(e.starts_at) >= now && new Date(e.starts_at) <= until)
    .sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at))
    .map((e) => ({
      id: e.id,
      title: e.title,
      type: e.type,
      starts_at: e.starts_at,
      available: availableCount(e, players),
      pending: players.filter((p) => statusFor(e, p.id) === "pending").map((p) => p.name),
      pendingCount: pendingCount(e, players),
    }));

  return {
    team: team.name,
    period: { from: from.toISOString(), to: now.toISOString() },
    games: games.length,
    wins,
    losses: games.length - wins,
    winRate: pct(wins, games.length),
    kda: games.length
      ? round(kda(games.reduce((n, g) => n + g.kills, 0), games.reduce((n, g) => n + g.deaths, 0), games.reduce((n, g) => n + g.assists, 0)), 2)
      : null,
    topChampions: [...champs.values()].sort((a, b) => b.games - a.games || b.wins - a.wins).slice(0, 3),
    perPlayer,
    upcoming,
    players: players.length,
  };
}

const escapeCsv = (value) => {
  const text = String(value ?? "");
  // Leading = + - @ would be run as formulas by spreadsheet apps.
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};

export function reportToCsv(report) {
  const header = ["Player", "Role", "Games", "Wins", "Win rate %", "KDA", "CS/min"];
  const rows = report.perPlayer.map((p) => [p.name, p.role, p.games, p.wins, p.winRate, p.kda ?? "", p.csPerMin ?? ""]);
  return [header, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\n") + "\n";
}

const fmtDate = (iso) =>
  new Date(iso).toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "UTC" }) + " UTC";

export function reportToText(report) {
  const lines = [
    `${report.team}: weekly report`,
    ``,
    `Last 7 days: ${report.games} games, ${report.wins}W ${report.losses}L (${report.winRate}% win rate)${report.kda != null ? `, KDA ${report.kda}` : ""}`,
  ];
  if (report.topChampions.length) lines.push(`Most played: ${report.topChampions.map((c) => `${c.champion} (${c.games})`).join(", ")}`);
  lines.push("", "Players");
  report.perPlayer.forEach((p) => lines.push(`- ${p.name} (${p.role}): ${p.games} games, ${p.winRate}% win rate${p.kda != null ? `, KDA ${p.kda}` : ""}`));
  lines.push("", "Next 7 days");
  if (report.upcoming.length === 0) lines.push("- Nothing scheduled");
  report.upcoming.forEach((e) =>
    lines.push(`- ${fmtDate(e.starts_at)}: ${e.title} (${e.available}/${report.players} available${e.pendingCount ? `, waiting for ${e.pending.join(", ")}` : ""})`)
  );
  return lines.join("\n");
}

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// Email clients ignore stylesheets, so everything is inline and table based. Colours match the app tokens.
const C = { ink: "#0A1118", panel: "#0F1A24", line: "#243847", text: "#E8E8E8", muted: "#A3B5C2", brand: "#4AC0DE", win: "#3DD6A0", loss: "#FF6B7A" };

export function reportToHtml(report) {
  const cell = (v, extra = "") => `<td style="padding:10px 12px;border-top:1px solid ${C.line};color:${C.text};font-size:14px;${extra}">${v}</td>`;
  const head = (v, align = "left") => `<th align="${align}" style="padding:8px 12px;color:${C.muted};font-size:11px;letter-spacing:.08em;text-transform:uppercase;font-weight:600">${v}</th>`;
  const rows = report.perPlayer
    .map((p) => `<tr>${cell(`<b>${esc(p.name)}</b>`)}${cell(esc(p.role), `color:${C.muted}`)}${cell(p.games, "text-align:center")}${cell(`${p.winRate}%`, `text-align:center;color:${p.winRate >= 50 ? C.win : C.loss}`)}${cell(p.kda ?? "-", "text-align:center")}</tr>`)
    .join("");
  const events = report.upcoming.length
    ? report.upcoming
        .map((e) => `<li style="margin:0 0 8px">${esc(fmtDate(e.starts_at))}: <b>${esc(e.title)}</b> <span style="color:${C.muted}">(${e.available}/${report.players} available${e.pendingCount ? `, waiting for ${esc(e.pending.join(", "))}` : ""})</span></li>`)
        .join("")
    : `<li style="color:${C.muted}">Nothing scheduled</li>`;
  return `<div style="background:${C.ink};padding:24px 12px;font-family:Arial,Helvetica,sans-serif;color:${C.text}">
<div style="max-width:560px;margin:0 auto">
<img src="${SITE.url}/assets/logos/dummylab_logo.png" width="150" alt="DummyLab" style="display:block;margin:0 0 16px">
<div style="background:${C.panel};border:1px solid ${C.line};border-radius:10px;padding:20px">
<h2 style="margin:0 0 4px;font-size:20px;color:${C.text}">${esc(report.team)}: weekly report</h2>
<p style="margin:0 0 16px;color:${C.muted};font-size:14px">Last 7 days</p>
<p style="margin:0 0 4px;font-size:40px;line-height:1;font-weight:700;color:${report.winRate >= 50 ? C.brand : C.loss}">${report.winRate}%</p>
<p style="margin:0 0 16px;font-size:14px"><b>${report.games}</b> games, <b style="color:${C.win}">${report.wins}W</b> <b style="color:${C.loss}">${report.losses}L</b>${report.kda != null ? `, KDA <b>${report.kda}</b>` : ""}</p>
${report.topChampions.length ? `<p style="margin:0 0 16px;font-size:14px;color:${C.muted}">Most played: ${esc(report.topChampions.map((c) => `${c.champion} (${c.games})`).join(", "))}</p>` : ""}
<table cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%"><tr>${head("Player")}${head("Role")}${head("Games", "center")}${head("Win rate", "center")}${head("KDA", "center")}</tr>${rows}</table>
<h3 style="margin:20px 0 8px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:${C.muted}">Next 7 days</h3>
<ul style="margin:0;padding-left:18px;font-size:14px">${events}</ul>
</div>
<p style="color:${C.muted};font-size:12px;line-height:1.5;margin:16px 4px 0">DummyLab isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties.</p>
</div></div>`;
}
