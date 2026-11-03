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

export function reportToHtml(report) {
  const rows = report.perPlayer
    .map((p) => `<tr><td>${esc(p.name)}</td><td>${esc(p.role)}</td><td>${p.games}</td><td>${p.winRate}%</td><td>${p.kda ?? "-"}</td></tr>`)
    .join("");
  const events = report.upcoming.length
    ? report.upcoming
        .map((e) => `<li>${esc(fmtDate(e.starts_at))}: <b>${esc(e.title)}</b> (${e.available}/${report.players} available${e.pendingCount ? `, waiting for ${esc(e.pending.join(", "))}` : ""})</li>`)
        .join("")
    : "<li>Nothing scheduled</li>";
  return `<div style="font-family:Arial,sans-serif;max-width:560px">
<h2>${esc(report.team)}: weekly report</h2>
<p><b>${report.games}</b> games, <b>${report.wins}W ${report.losses}L</b> (${report.winRate}% win rate)${report.kda != null ? `, KDA <b>${report.kda}</b>` : ""}</p>
${report.topChampions.length ? `<p>Most played: ${esc(report.topChampions.map((c) => `${c.champion} (${c.games})`).join(", "))}</p>` : ""}
<table cellpadding="6" style="border-collapse:collapse;width:100%" border="1"><tr><th align="left">Player</th><th align="left">Role</th><th>Games</th><th>Win rate</th><th>KDA</th></tr>${rows}</table>
<h3>Next 7 days</h3><ul>${events}</ul>
<p style="color:#666;font-size:12px">DummyLab isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties.</p>
</div>`;
}
