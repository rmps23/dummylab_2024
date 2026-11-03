"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FaChartSimple } from "react-icons/fa6";
import { toast } from "react-toastify";
import { teamStore } from "@/store/teamStore";
import { playerStore } from "@/store/playerStore";
import { fetchChampionStats, fetchPlayerStats, sumStats } from "@/hooks/stats";
import { fetchMatches } from "@/hooks/players";
import { fmt, kda, pct } from "@/lib/stats";
import PageHeader from "@/components/ui/PageHeader";
import KpiCard from "@/components/ui/KpiCard";
import ChampionIcon from "@/components/ui/ChampionIcon";
import TrendChart from "@/components/ui/TrendChart";

const select = "bg-zinc-900 text-sm p-2 rounded-md outline-none cursor-pointer";

const rowMetrics = (r) => ({
  games: Number(r.games),
  wr: pct(Number(r.wins), Number(r.games)),
  kda: kda(r.kills, r.deaths, r.assists),
  cs: Number(r.cs) / Number(r.minutes || 1),
  dmg: Number(r.damage) / Number(r.minutes || 1),
  vision: Number(r.vision) / Number(r.minutes || 1),
});

function AnalyticsContent() {
  const params = useSearchParams();
  const { activeTeamId } = teamStore();
  const allPlayers = playerStore((s) => s.players);
  const players = useMemo(() => allPlayers.filter((p) => p.team_id === activeTeamId), [allPlayers, activeTeamId]);

  const [player, setPlayer] = useState(params.get("player") || "");
  const [days, setDays] = useState(30);
  const [queue, setQueue] = useState("");
  const [stats, setStats] = useState(null);
  const [champions, setChampions] = useState([]);
  const [trend, setTrend] = useState([]);

  useEffect(() => {
    if (player && allPlayers.length && !allPlayers.some((p) => p.id === player)) setPlayer("");
  }, [player, allPlayers]);

  useEffect(() => {
    if (!activeTeamId) return;
    const filters = { team: activeTeamId, player: player || null, days: days || null, queue: queue ? Number(queue) : null };
    setStats(null);
    Promise.all([fetchPlayerStats(filters), fetchChampionStats(filters), player ? fetchMatches(player, 20) : []])
      .then(([s, c, t]) => {
        setStats(s);
        setChampions(c.slice(0, 8));
        setTrend(t);
      })
      .catch((e) => {
        toast.error(`Could not load stats: ${e.message}`);
        setStats([]);
      });
  }, [activeTeamId, player, days, queue]);

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

      <div className="p-4 sm:p-6 flex flex-col gap-6">
        {!stats ? (
          <p className="text-zinc-400">Loading...</p>
        ) : total.games === 0 ? (
          <p className="text-zinc-400">No games for this selection. Import match history from the Players page.</p>
        ) : (
          <>
            <div className="flex flex-wrap gap-3">
              <KpiCard label="Games" value={total.games} />
              <KpiCard label="Win rate" value={`${totals.wr}%`} hint={`${total.wins}W ${total.games - total.wins}L`} />
              <KpiCard label="KDA" value={fmt(totals.kda)} hint={`${fmt(total.kills / total.games, 1)} / ${fmt(total.deaths / total.games, 1)} / ${fmt(total.assists / total.games, 1)}`} />
              <KpiCard label="CS / min" value={fmt(totals.cs, 1)} />
              <KpiCard label="Damage / min" value={Math.round(totals.dmg)} />
              <KpiCard label="Vision / min" value={fmt(totals.vision, 2)} />
            </div>

            {player && (
              <section>
                <h2 className="font-bold mb-2">Last {trend.length} games</h2>
                <div className="bg-zinc-800 rounded-md p-3 max-w-3xl">
                  <TrendChart games={trend} kdaOf={(g) => kda(g.kills, g.deaths, g.assists)} />
                  <p className="text-xs text-zinc-400">Line: KDA per game · bar: win (green) or loss (red)</p>
                </div>
              </section>
            )}

            <section>
              <h2 className="font-bold mb-2">Players</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[600px]">
                  <thead className="text-zinc-400 text-left">
                    <tr>
                      {["Player", "Games", "Win rate", "KDA", "CS/min", "Dmg/min", "Vision/min", "KP"].map((h) => (
                        <th key={h} className="py-1 pr-3 font-normal">{h}</th>
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
                            <button onClick={() => setPlayer(r.player_id)} className="text-cyan-400 hover:underline">{p?.name ?? "?"}</button>
                            <span className="text-zinc-400 text-xs"> {p?.role?.name}</span>
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
              <h2 className="font-bold mb-2">Most played champions</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm max-w-2xl">
                  <thead className="text-zinc-400 text-left">
                    <tr>
                      {["Champion", "Games", "Win rate", "KDA"].map((h) => (
                        <th key={h} className="py-1 pr-3 font-normal">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {champions.map((c) => (
                      <tr key={c.champion} className="border-t border-zinc-800">
                        <td className="py-2 pr-3 flex items-center gap-2">
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
    <Suspense fallback={<p className="p-6 text-zinc-400">Loading...</p>}>
      <AnalyticsContent />
    </Suspense>
  );
}
