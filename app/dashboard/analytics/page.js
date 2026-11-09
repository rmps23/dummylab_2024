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
import Select from "@/components/ui/Select";
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
import { FaFileLines } from "react-icons/fa6";
import { isPaid } from "@/lib/plans";

const QUEUES = [
  { value: "", label: "All queues" },
  { value: "420", label: "Ranked Solo" },
  { value: "440", label: "Ranked Flex" },
  { value: "700", label: "Clash" },
  { value: "0", label: "Custom (scrims)" },
];

const rowMetrics = (r) => ({
  games: Number(r.games),
  wr: pct(Number(r.wins), Number(r.games)),
  kda: kda(r.kills, r.deaths, r.assists),
  cs: Number(r.cs) / Number(r.minutes || 1),
  dmg: Number(r.damage) / Number(r.minutes || 1),
  vision: Number(r.vision) / Number(r.minutes || 1),
});


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
        <Link href="/dashboard/report" className={btnSecondary}>
          <FaFileLines aria-hidden="true" /> Weekly report
        </Link>
        <Select
          variant="chip"
          label="Player"
          value={player}
          onChange={setPlayer}
          options={[{ value: "", label: "Whole team" }, ...players.map((p) => ({ value: p.id, label: p.name }))]}
        />
        <Select
          variant="chip"
          label="Period"
          value={days}
          onChange={setDays}
          options={[
            { value: 7, label: "Last 7 days" },
            { value: 30, label: "Last 30 days" },
            { value: 90, label: "Last 90 days", disabled: !isPaid(plan), hint: !isPaid(plan) ? "Pro" : undefined },
            { value: 0, label: "All time", disabled: !isPaid(plan), hint: !isPaid(plan) ? "Pro" : undefined },
          ]}
        />
        <Select variant="chip" label="Queue" value={queue} onChange={setQueue} options={QUEUES} align="right" />
      </PageHeader>

      <div className="flex flex-col gap-4 p-4 sm:p-6">
        {loaded && teams.length === 0 ? (
          <EmptyState icon={FaChartSimple} title="Create a team first">
            Stats are calculated from the match history of your players.
          </EmptyState>
        ) : error ? (
          <div role="alert" className="flex items-center justify-between gap-3 rounded-lg border border-rose-700 bg-rose-950/40 p-4 text-sm">
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
                        <tr key={r.player_id} className="border-t border-line hover:bg-white/[0.03]">
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
                      <tr key={c.champion} className="border-t border-line hover:bg-white/[0.03]">
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
