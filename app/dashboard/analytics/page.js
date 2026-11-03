"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FaChartSimple } from "react-icons/fa6";
import { teamStore } from "@/store/teamStore";
import { playerStore } from "@/store/playerStore";
import { fetchChampionStats, fetchPlayerStats, sumStats } from "@/hooks/stats";
import { fetchMatches } from "@/hooks/players";
import { fmt, kda, pct } from "@/lib/stats";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import KpiCard from "@/components/ui/KpiCard";
import Donut from "@/components/ui/Donut";
import RoleBadge from "@/components/ui/RoleBadge";
import Avatar from "@/components/ui/Avatar";
import ChampionIcon from "@/components/ui/ChampionIcon";
import TrendChart from "@/components/ui/TrendChart";
import EmptyState, { actionClass } from "@/components/ui/EmptyState";
import Skeleton, { SkeletonKpis } from "@/components/ui/Skeleton";
import { btnSecondary } from "@/components/ui/buttons";
import { featureStore } from "@/store/featureStore";

const select =
  "min-h-11 cursor-pointer rounded-lg border border-white/10 bg-white/[0.05] px-3 text-sm font-semibold outline-none hover:bg-white/10 focus:border-brand/60";

const rowMetrics = (r) => ({
  games: Number(r.games),
  wr: pct(Number(r.wins), Number(r.games)),
  kda: kda(r.kills, r.deaths, r.assists),
  cs: Number(r.cs) / Number(r.minutes || 1),
  dmg: Number(r.damage) / Number(r.minutes || 1),
  vision: Number(r.vision) / Number(r.minutes || 1),
});

const GUIDE = [
  ["Win rate", "Wins divided by games played."],
  ["KDA", "(kills + assists) / deaths. With no deaths, the deaths count as 1."],
  ["CS / min", "Minions and jungle monsters killed per minute of game time."],
  ["Damage / min", "Damage to champions per minute."],
  ["Vision / min", "Vision score per minute (wards placed, cleared and vision control)."],
  ["KP", "Kill participation: share of the team's kills a player took part in."],
];

// Inline win-rate bar with the number next to it.
const WinRate = ({ value }) => (
  <span className="inline-flex items-center gap-2">
    <span className="h-1.5 w-16 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
      <span className={`block h-full rounded-full ${value >= 50 ? "bg-win" : "bg-loss"}`} style={{ width: `${value}%` }} />
    </span>
    <span className={value >= 50 ? "text-win" : "text-loss"}>{value}%</span>
  </span>
);

const Th = ({ children }) => (
  <th scope="col" className="eyebrow py-2 pr-3 text-left font-bold">
    {children}
  </th>
);

function AnalyticsContent() {
  const params = useSearchParams();
  const { activeTeamId, teams, loaded } = teamStore();
  const allPlayers = playerStore((s) => s.players);
  const players = useMemo(() => allPlayers.filter((p) => p.team_id === activeTeamId), [allPlayers, activeTeamId]);

  const plan = featureStore((s) => s.plan);
  const [player, setPlayer] = useState(params.get("player") || "");
  const [days, setDays] = useState(30);
  const [queue, setQueue] = useState("");
  const [stats, setStats] = useState(null);
  const [champions, setChampions] = useState([]);
  const [trend, setTrend] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (player && allPlayers.length && !allPlayers.some((p) => p.id === player)) setPlayer("");
  }, [player, allPlayers]);

  const load = useCallback(() => {
    if (!activeTeamId) return;
    const filters = { team: activeTeamId, player: player || null, days: days || null, queue: queue ? Number(queue) : null };
    setStats(null);
    setError(null);
    Promise.all([fetchPlayerStats(filters), fetchChampionStats(filters), player ? fetchMatches(player, 20) : []])
      .then(([s, c, t]) => {
        setStats(s);
        setChampions(c.slice(0, 8));
        setTrend(t);
      })
      .catch((e) => {
        setError(e.message);
        setStats([]);
      });
  }, [activeTeamId, player, days, queue]);

  useEffect(() => {
    load();
  }, [load]);

  const total = stats ? sumStats(stats) : null;
  const totals = total && {
    wr: pct(total.wins, total.games),
    kda: kda(total.kills, total.deaths, total.assists),
    cs: total.cs / (total.minutes || 1),
    dmg: total.damage / (total.minutes || 1),
    vision: total.vision / (total.minutes || 1),
  };
  const nameOf = (id) => players.find((p) => p.id === id);
  const focus = player ? nameOf(player) : null;

  return (
    <>
      <PageHeader icon={FaChartSimple} title="Analytics" subtitle={focus ? `Focus: ${focus.name}` : "Whole team"}>
        <select aria-label="Player" className={select} value={player} onChange={(e) => setPlayer(e.target.value)}>
          <option value="">Whole team</option>
          {players.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <select aria-label="Period" className={select} value={days} onChange={(e) => setDays(Number(e.target.value))}>
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90} disabled={plan !== "pro"}>Last 90 days{plan !== "pro" ? " (Pro)" : ""}</option>
          <option value={0} disabled={plan !== "pro"}>All time{plan !== "pro" ? " (Pro)" : ""}</option>
        </select>
        <select aria-label="Queue" className={select} value={queue} onChange={(e) => setQueue(e.target.value)}>
          <option value="">All queues</option>
          <option value="420">Ranked Solo</option>
          <option value="440">Ranked Flex</option>
          <option value="700">Clash</option>
          <option value="0">Custom (scrims)</option>
        </select>
      </PageHeader>

      <div className="flex flex-col gap-4 p-4 sm:p-6">
        {loaded && teams.length === 0 ? (
          <EmptyState icon={FaChartSimple} title="Create a team first">
            Stats are calculated from the match history of your players.
          </EmptyState>
        ) : error ? (
          <div role="alert" className="flex items-center justify-between gap-3 rounded-xl border border-rose-700 bg-rose-950/40 p-4 text-sm">
            <span>Could not load stats: {error}</span>
            <button onClick={load} className={btnSecondary}>
              Retry
            </button>
          </div>
        ) : !stats ? (
          <>
            <SkeletonKpis count={6} />
            <Skeleton className="h-56" />
          </>
        ) : total.games === 0 ? (
          <EmptyState
            icon={FaChartSimple}
            title="No games for this selection"
            action={
              <Link href="/dashboard/players" className={actionClass}>
                Go to Players
              </Link>
            }
          >
            Try a longer period or another queue. To get data, open a player and use &quot;Update from Riot&quot; to
            import their match history.
          </EmptyState>
        ) : (
          <>
            <div className="flex flex-wrap items-stretch gap-3">
              <Card className="flex items-center gap-5 p-0" role="group" aria-label="Win rate summary">
                <div className="flex items-center gap-5 p-4">
                  <Donut value={totals.wr} size={104} />
                  <div>
                    <div className="eyebrow">Record</div>
                    <div className="text-2xl font-bold">
                      <span className="text-win">{total.wins}W</span> <span className="text-zinc-500">/</span>{" "}
                      <span className="text-loss">{total.games - total.wins}L</span>
                    </div>
                    <div className="text-xs text-zinc-400">{total.games} games</div>
                  </div>
                </div>
              </Card>
              <KpiCard label="KDA" accent="accent" value={fmt(totals.kda)} hint={`${fmt(total.kills / total.games, 1)} / ${fmt(total.deaths / total.games, 1)} / ${fmt(total.assists / total.games, 1)} per game`} />
              <KpiCard label="CS / min" accent="brand" value={fmt(totals.cs, 1)} />
              <KpiCard label="Damage / min" accent="loss" value={Math.round(totals.dmg)} />
              <KpiCard label="Vision / min" accent="win" value={fmt(totals.vision, 2)} />
            </div>

            <details className="rounded-xl border border-white/[0.07] bg-panel/60 p-3 text-sm">
              <summary className="min-h-9 cursor-pointer font-semibold text-zinc-300">What do these numbers mean?</summary>
              <dl className="mt-2 grid gap-1 sm:grid-cols-[9rem_1fr]">
                {GUIDE.map(([term, text]) => (
                  <div key={term} className="contents">
                    <dt className="text-zinc-200">{term}</dt>
                    <dd className="text-zinc-400">{text}</dd>
                  </div>
                ))}
              </dl>
            </details>

            {player && (
              <Card title={`Last ${trend.length} games`}>
                <TrendChart games={trend} kdaOf={(g) => kda(g.kills, g.deaths, g.assists)} />
                <p className="mt-1 text-xs text-zinc-400">Line: KDA per game (dashed: average) · bar: win (green) or loss (red)</p>
              </Card>
            )}

            <Card title="Players">
              <p className="mb-1 text-xs text-zinc-400 sm:hidden">Swipe the table sideways to see every column.</p>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-sm">
                  <thead>
                    <tr>
                      {["Player", "Games", "Win rate", "KDA", "CS/min", "Dmg/min", "Vision/min", "KP"].map((h) => (
                        <Th key={h}>{h}</Th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {stats.map((r) => {
                      const m = rowMetrics(r);
                      const p = nameOf(r.player_id);
                      return (
                        <tr key={r.player_id} className="border-t border-white/[0.06] hover:bg-white/[0.03]">
                          <td className="py-2 pr-3">
                            <button onClick={() => setPlayer(r.player_id)} className="flex min-h-11 items-center gap-2 text-left hover:text-brand">
                              <Avatar name={p?.name} size={28} />
                              <span className="font-semibold">{p?.name ?? "?"}</span>
                              <RoleBadge role={p?.role?.name} />
                            </button>
                          </td>
                          <td className="pr-3">{m.games}</td>
                          <td className="pr-3"><WinRate value={m.wr} /></td>
                          <td className="pr-3 font-semibold">{fmt(m.kda)}</td>
                          <td className="pr-3">{fmt(m.cs, 1)}</td>
                          <td className="pr-3">{Math.round(m.dmg)}</td>
                          <td className="pr-3">{fmt(m.vision)}</td>
                          <td>{r.avg_kill_part != null ? `${Math.round(Number(r.avg_kill_part) * 100)}%` : "-"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card title="Most played champions">
              <div className="overflow-x-auto">
                <table className="w-full max-w-3xl text-sm">
                  <thead>
                    <tr>
                      {["Champion", "Games", "Win rate", "KDA"].map((h) => (
                        <Th key={h}>{h}</Th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {champions.map((c) => (
                      <tr key={c.champion} className="border-t border-white/[0.06] hover:bg-white/[0.03]">
                        <td className="flex items-center gap-3 py-2 pr-3">
                          <ChampionIcon name={c.champion} size={32} /> <span className="font-semibold">{c.champion}</span>
                        </td>
                        <td className="pr-3">{Number(c.games)}</td>
                        <td className="pr-3"><WinRate value={pct(Number(c.wins), Number(c.games))} /></td>
                        <td className="font-semibold">{fmt(kda(c.kills, c.deaths, c.assists))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}
      </div>
    </>
  );
}

export default function Analytics() {
  return (
    <Suspense fallback={<Skeleton className="m-6 h-48" />}>
      <AnalyticsContent />
    </Suspense>
  );
}
