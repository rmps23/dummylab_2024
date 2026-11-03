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
import KpiCard from "@/components/ui/KpiCard";
import ChampionIcon from "@/components/ui/ChampionIcon";
import TrendChart from "@/components/ui/TrendChart";
import EmptyState, { actionClass } from "@/components/ui/EmptyState";
import Skeleton, { SkeletonKpis } from "@/components/ui/Skeleton";

const select = "min-h-11 cursor-pointer rounded-md bg-zinc-900 p-2 text-sm outline-none";

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

function AnalyticsContent() {
  const params = useSearchParams();
  const { activeTeamId, teams, loaded } = teamStore();
  const allPlayers = playerStore((s) => s.players);
  const players = useMemo(() => allPlayers.filter((p) => p.team_id === activeTeamId), [allPlayers, activeTeamId]);

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

  return (
    <>
      <PageHeader icon={FaChartSimple} title="Analytics">
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
          <option value={90}>Last 90 days</option>
          <option value={0}>All time</option>
        </select>
        <select aria-label="Queue" className={select} value={queue} onChange={(e) => setQueue(e.target.value)}>
          <option value="">All queues</option>
          <option value="420">Ranked Solo</option>
          <option value="440">Ranked Flex</option>
          <option value="700">Clash</option>
          <option value="0">Custom (scrims)</option>
        </select>
      </PageHeader>

      <div className="flex flex-col gap-6 p-4 sm:p-6">
        {loaded && teams.length === 0 ? (
          <EmptyState icon={FaChartSimple} title="Create a team first">
            Stats are calculated from the match history of your players.
          </EmptyState>
        ) : error ? (
          <div role="alert" className="flex items-center justify-between gap-3 rounded-md border border-red-700 bg-red-950/40 p-4 text-sm">
            <span>Could not load stats: {error}</span>
            <button onClick={load} className="min-h-11 rounded-md bg-zinc-100 px-3 text-zinc-950">
              Retry
            </button>
          </div>
        ) : !stats ? (
          <>
            <SkeletonKpis count={6} />
            <Skeleton className="h-48" />
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
            <div className="flex flex-wrap gap-3">
              <KpiCard label="Games" value={total.games} />
              <KpiCard label="Win rate" value={`${totals.wr}%`} hint={`${total.wins}W ${total.games - total.wins}L`} />
              <KpiCard label="KDA" value={fmt(totals.kda)} hint={`${fmt(total.kills / total.games, 1)} / ${fmt(total.deaths / total.games, 1)} / ${fmt(total.assists / total.games, 1)} per game`} />
              <KpiCard label="CS / min" value={fmt(totals.cs, 1)} />
              <KpiCard label="Damage / min" value={Math.round(totals.dmg)} />
              <KpiCard label="Vision / min" value={fmt(totals.vision, 2)} />
            </div>

            <details className="max-w-3xl rounded-md border border-zinc-800 bg-zinc-950 p-3 text-sm">
              <summary className="min-h-9 cursor-pointer text-zinc-300">What do these numbers mean?</summary>
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
              <section>
                <h2 className="mb-2 font-bold">Last {trend.length} games</h2>
                <div className="max-w-3xl rounded-md bg-zinc-800 p-3">
                  <TrendChart games={trend} kdaOf={(g) => kda(g.kills, g.deaths, g.assists)} />
                  <p className="text-xs text-zinc-400">Line: KDA per game · bar: win (green) or loss (red)</p>
                </div>
              </section>
            )}

            <section>
              <h2 className="mb-2 font-bold">Players</h2>
              <p className="mb-1 text-xs text-zinc-400 sm:hidden">Swipe the table sideways to see every column.</p>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-sm">
                  <thead className="text-left text-zinc-400">
                    <tr>
                      {["Player", "Games", "Win rate", "KDA", "CS/min", "Dmg/min", "Vision/min", "KP"].map((h) => (
                        <th key={h} scope="col" className="py-1 pr-3 font-normal">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {stats.map((r) => {
                      const m = rowMetrics(r);
                      const p = nameOf(r.player_id);
                      return (
                        <tr key={r.player_id} className="border-t border-zinc-800">
                          <td className="py-2 pr-3">
                            <button onClick={() => setPlayer(r.player_id)} className="min-h-9 text-cyan-400 hover:underline">{p?.name ?? "?"}</button>
                            <span className="text-xs text-zinc-400"> {p?.role?.name}</span>
                          </td>
                          <td className="pr-3">{m.games}</td>
                          <td className="pr-3">{m.wr}%</td>
                          <td className="pr-3">{fmt(m.kda)}</td>
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
            </section>

            <section>
              <h2 className="mb-2 font-bold">Most played champions</h2>
              <div className="overflow-x-auto">
                <table className="w-full max-w-2xl text-sm">
                  <thead className="text-left text-zinc-400">
                    <tr>
                      {["Champion", "Games", "Win rate", "KDA"].map((h) => (
                        <th key={h} scope="col" className="py-1 pr-3 font-normal">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {champions.map((c) => (
                      <tr key={c.champion} className="border-t border-zinc-800">
                        <td className="flex items-center gap-2 py-2 pr-3">
                          <ChampionIcon name={c.champion} size={28} /> {c.champion}
                        </td>
                        <td className="pr-3">{Number(c.games)}</td>
                        <td className="pr-3">{pct(Number(c.wins), Number(c.games))}%</td>
                        <td>{fmt(kda(c.kills, c.deaths, c.assists))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
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
