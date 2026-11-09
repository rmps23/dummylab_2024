import Donut from "@/components/ui/Donut";
import FormPips from "@/components/ui/FormPips";
import RankBadge from "@/components/ui/RankBadge";
import RoleBadge from "@/components/ui/RoleBadge";
import ChampionIcon from "@/components/ui/ChampionIcon";
import ChampionSplash from "@/components/ui/ChampionSplash";

// Static illustrations of the product, built from the real UI components with sample data.
// Names are made up. They are decorative, so the wrappers are hidden from assistive tech and carry a label.

const PLAYERS = [
  { name: "Vex", role: "Top", champs: ["Gnar", "Renekton"], tier: "DIAMOND", rank: "II", wr: 62, kda: "5.4", form: [true, true, false, true, true] },
  { name: "Lumen", role: "Jungler", champs: ["LeeSin", "Viego"], tier: "EMERALD", rank: "I", wr: 58, kda: "4.8", form: [true, false, true, true, false] },
  { name: "Kaito", role: "Mid", champs: ["Ahri", "Syndra"], tier: "DIAMOND", rank: "IV", wr: 66, kda: "6.1", form: [true, true, true, false, true] },
  { name: "Nox", role: "Bottom", champs: ["Jinx", "Kaisa"], tier: "EMERALD", rank: "II", wr: 55, kda: "5.0", form: [false, true, false, true, true] },
  { name: "Sora", role: "Support", champs: ["Thresh", "Nautilus"], tier: "PLATINUM", rank: "I", wr: 60, kda: "3.9", form: [true, true, false, false, true] },
];

function Frame({ label, title, children, className = "" }) {
  return (
    <div role="img" aria-label={label} className={`overflow-hidden rounded-xl border border-line-strong bg-ink shadow-[0_24px_60px_-24px_rgba(0,0,0,0.8)] ${className}`}>
      <div className="flex items-center gap-2 border-b border-line bg-panel px-4 py-2.5 text-xs text-zinc-400">
        <span aria-hidden="true" className="h-2 w-2 rounded-full bg-brand" />
        <span className="font-semibold text-zinc-300">{title}</span>
      </div>
      <div aria-hidden="true">{children}</div>
    </div>
  );
}

export function HeroShot() {
  return (
    <Frame label="DummyLab dashboard: team win rate 62 percent, roster with ranks, champion pool and recent form" title="Apex Academy · Dashboard">
      <div className="flex flex-col gap-3 p-3 sm:p-4">
        <div className="relative flex items-center gap-5 overflow-hidden rounded-xl border border-line bg-panel p-4">
          <ChampionSplash name="Ahri" />
          <Donut value={62} size={88} label="Wins" />
          <div className="relative">
            <div className="eyebrow">Team win rate · 30 days</div>
            <div className="mt-1 font-display text-5xl font-bold leading-none text-brand">62%</div>
            <div className="mt-2 text-sm text-zinc-400">
              <b className="text-win">31W</b> / <b className="text-loss">16L</b> · 47 games
            </div>
          </div>
          <span className="relative ml-auto hidden items-center gap-1.5 rounded-full bg-pop/15 px-3 py-1 text-xs font-bold text-pop sm:inline-flex">4 win streak</span>
        </div>
        <div className="overflow-x-auto rounded-xl border border-line bg-panel">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="text-left">
                {["Player", "Rank", "Win rate", "KDA", "Form", "Pool"].map((h) => (
                  <th key={h} className="eyebrow px-3 py-2.5 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PLAYERS.map((p) => (
                <tr key={p.name} className="border-t border-line">
                  <td className="px-3 py-2">
                    <span className="flex items-center gap-2 font-semibold">{p.name} <RoleBadge role={p.role} /></span>
                  </td>
                  <td className="px-3 py-2"><RankBadge tier={p.tier} rank={p.rank} compact /></td>
                  <td className="px-3 py-2">
                    <span className="flex items-center gap-2">
                      <b className="w-9">{p.wr}%</b>
                      <span className="h-1.5 w-16 overflow-hidden rounded-full bg-well"><span className="block h-full bg-brand" style={{ width: `${p.wr}%` }} /></span>
                    </span>
                  </td>
                  <td className="px-3 py-2 font-semibold">{p.kda}</td>
                  <td className="px-3 py-2"><FormPips results={p.form} size="sm" /></td>
                  <td className="px-3 py-2"><span className="flex gap-1">{p.champs.map((c) => <ChampionIcon key={c} name={c} size={24} />)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Frame>
  );
}

const ANSWER = { yes: "bg-win", maybe: "bg-pop", no: "bg-loss", wait: "bg-zinc-600" };

export function ScheduleShot() {
  const events = [
    ["Thu", "11", "Scrim vs Night Owls", "Scrim · 20:00", "bg-brand", ["yes", "yes", "yes", "maybe", "yes"]],
    ["Sat", "13", "Draft review", "Training · 19:30", "bg-zinc-400", ["yes", "yes", "no", "yes", "wait"]],
    ["Mon", "15", "Playoffs round 1", "Match · 21:00", "bg-pop", ["yes", "wait", "wait", "yes", "yes"]],
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_200px]">
      <Frame label="Schedule with each player's availability for the next events" title="Schedule · next 7 days">
        <ul className="divide-y divide-line">
          {events.map(([d, n, title, sub, dot, answers]) => (
            <li key={title} className="flex items-center gap-3 px-4 py-3">
              <span className="w-11 rounded-lg bg-well py-1 text-center">
                <span className="block text-[10px] font-semibold uppercase text-zinc-400">{d}</span>
                <span className="block text-base font-bold leading-tight">{n}</span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{title}</span>
                <span className="flex items-center gap-1.5 text-xs text-zinc-400"><span className={`h-2 w-2 rounded-full ${dot}`} />{sub}</span>
              </span>
              <span className="flex gap-1">{answers.map((a, i) => <span key={i} className={`h-2.5 w-2.5 rounded-full ${ANSWER[a]}`} />)}</span>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-line px-4 py-2.5 text-[11px] text-zinc-400">
          <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-win" />Available</span>
          <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-pop" />Maybe</span>
          <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-loss" />Unavailable</span>
          <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-zinc-600" />No answer yet</span>
        </div>
      </Frame>
      <div role="img" aria-label="A player's phone view of the availability link" className="mx-auto w-full max-w-[200px] rounded-[26px] border-2 border-line-strong bg-ink p-3 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.8)] sm:mx-0">
        <div aria-hidden="true">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-well" />
          <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">Hi Kaito</div>
          <div className="mt-1 text-sm font-bold">Scrim vs Night Owls</div>
          <div className="text-xs text-zinc-400">Thu 11 · 20:00</div>
          <div className="mt-3 flex flex-col gap-1.5 text-xs font-bold">
            <span className="rounded-lg bg-win px-3 py-2 text-center text-ink">I can play</span>
            <span className="rounded-lg border border-line-strong px-3 py-2 text-center text-zinc-300">Maybe</span>
            <span className="rounded-lg border border-line-strong px-3 py-2 text-center text-zinc-300">Can&apos;t make it</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function StatsShot() {
  const pool = [["Ahri", 14, 71], ["Syndra", 9, 56], ["Azir", 6, 50]];
  const trend = [48, 52, 50, 57, 55, 61, 59, 66];
  const pts = trend.map((v, i) => `${(i / (trend.length - 1)) * 220},${60 - ((v - 40) / 30) * 56}`).join(" ");
  return (
    <Frame label="Player page: rank, KDA, CS per minute, vision and champion pool for one player" title="Kaito · Mid">
      <div className="flex flex-col gap-3 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <ChampionIcon name="Ahri" size={44} />
          <div>
            <div className="flex items-center gap-2 font-bold">Kaito <RoleBadge role="Mid" /></div>
            <RankBadge tier="DIAMOND" rank="IV" lp={37} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[["KDA", "6.1"], ["CS / min", "8.4"], ["Vision / min", "1.2"]].map(([l, v]) => (
            <div key={l} className="rounded-lg border border-line bg-panel p-3">
              <div className="eyebrow !text-[10px]">{l}</div>
              <div className="mt-1 font-display text-2xl font-bold leading-none">{v}</div>
            </div>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-line bg-panel p-3">
            <div className="eyebrow mb-2 !text-[10px]">Champion pool</div>
            <ul className="flex flex-col gap-2">
              {pool.map(([c, g, wr]) => (
                <li key={c} className="flex items-center gap-2 text-xs">
                  <ChampionIcon name={c} size={24} />
                  <span className="w-12 font-semibold">{c}</span>
                  <span className="text-zinc-400">{g} g</span>
                  <b className={`ml-auto ${wr >= 55 ? "text-win" : "text-zinc-300"}`}>{wr}%</b>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-line bg-panel p-3">
            <div className="eyebrow mb-2 !text-[10px]">Win rate by week</div>
            <svg viewBox="0 0 220 64" className="h-16 w-full" preserveAspectRatio="none">
              <polyline points={pts} fill="none" stroke="#4AC0DE" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>
    </Frame>
  );
}

export function ReportShot() {
  return (
    <div role="img" aria-label="Weekly report email with win rate, player table and next events" className="mx-auto w-full max-w-md rounded-xl border border-line-strong bg-ink p-4 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.8)]">
      <div aria-hidden="true">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">Monday 07:00 · Weekly report</div>
        <div className="mt-1 text-sm font-bold">Apex Academy</div>
        <div className="mt-2 font-display text-5xl font-bold leading-none text-brand">62%</div>
        <div className="mt-1 text-xs text-zinc-400"><b className="text-win">6W</b> <b className="text-loss">2L</b> last 7 days</div>
        <table className="mt-3 w-full text-xs">
          <tbody>
            {PLAYERS.slice(0, 4).map((p) => (
              <tr key={p.name} className="border-t border-line">
                <td className="py-1.5 font-semibold">{p.name}</td>
                <td className="text-zinc-400">{p.role}</td>
                <td className={`text-right font-bold ${p.wr >= 50 ? "text-win" : "text-loss"}`}>{p.wr}%</td>
                <td className="text-right text-zinc-300">{p.kda}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-3 text-[11px] text-zinc-400">Next: Scrim vs Night Owls, Thu 20:00 (4/5 available, waiting for Sora)</div>
      </div>
    </div>
  );
}
