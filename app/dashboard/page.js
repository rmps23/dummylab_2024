"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { FaHouse } from "react-icons/fa6";
import { teamStore } from "@/store/teamStore";
import { playerStore } from "@/store/playerStore";
import { fetchEvents } from "@/hooks/schedule";
import { fetchPlayerStats, fetchRecentTeamMatches, fetchTeamRanks, sumStats } from "@/hooks/stats";
import { EVENT_TYPES } from "@/lib/constants";
import { fmt, kda, pct } from "@/lib/stats";
import PageHeader from "@/components/ui/PageHeader";
import KpiCard from "@/components/ui/KpiCard";
import ChampionIcon from "@/components/ui/ChampionIcon";
import { availableCount, statusFor } from "@/components/schedule/EventDetail";

const Card = ({ title, href, children }) => (
  <section className="bg-zinc-950 border border-zinc-800 rounded-md p-4 flex flex-col gap-3">
    <div className="flex justify-between items-center">
      <h2 className="font-bold">{title}</h2>
      {href && (
        <Link href={href} className="text-xs text-cyan-400 hover:underline">
          View all
        </Link>
      )}
    </div>
    {children}
  </section>
);

const Dashboard = () => {
  const { teams, activeTeamId, loaded } = teamStore();
  const allPlayers = playerStore((s) => s.players);
  const team = teams.find((t) => t.id === activeTeamId);
  const players = useMemo(() => allPlayers.filter((p) => p.team_id === activeTeamId), [allPlayers, activeTeamId]);

  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [ranks, setRanks] = useState([]);

  useEffect(() => {
    if (!activeTeamId) return;
    const ids = players.map((p) => p.id);
    const from = new Date();
    const to = new Date(Date.now() + 14 * 86400000);
    fetchEvents(activeTeamId, from, to).then(setEvents).catch(() => setEvents([]));
    fetchPlayerStats({ team: activeTeamId, days: 30 }).then(setStats).catch(() => setStats([]));
    fetchRecentTeamMatches(ids).then(setRecent).catch(() => setRecent([]));
    fetchTeamRanks(ids).then(setRanks).catch(() => setRanks([]));
  }, [activeTeamId, players]);

  if (loaded && teams.length === 0) {
    return (
      <>
        <PageHeader icon={FaHouse} title="Home" />
        <div className="p-6 flex flex-col gap-3 items-start">
          <p className="text-zinc-300">Welcome to DummyLab. Start by creating your first team.</p>
          <Link href="/dashboard/teams" className="bg-cyan-500 text-zinc-950 px-3 py-1 rounded-md">
            Create a team
          </Link>
        </div>
      </>
    );
  }

  const total = stats ? sumStats(stats) : null;
  const nameOf = (id) => players.find((p) => p.id === id)?.name ?? "?";
  const pendingReplies = events.reduce(
    (n, e) => n + players.filter((p) => statusFor(e, p.id) === "pending").length,
    0
  );
  const upcoming = events.slice(0, 5);

  return (
    <>
      <PageHeader icon={FaHouse} title={team ? team.name : "Home"} />

      <div className="p-4 sm:p-6 flex flex-col gap-4">
        <div className="flex flex-wrap gap-3">
          <KpiCard label="Players" value={players.length} />
          <KpiCard label="Games (30d)" value={total ? total.games : "-"} />
          <KpiCard label="Win rate (30d)" value={total && total.games ? `${pct(total.wins, total.games)}%` : "-"} />
          <KpiCard label="Team KDA (30d)" value={total && total.games ? fmt(kda(total.kills, total.deaths, total.assists)) : "-"} />
          <KpiCard label="Awaiting replies" value={pendingReplies} hint="next 14 days" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card title="Upcoming events" href="/dashboard/schedule">
            {upcoming.length === 0 ? (
              <p className="text-sm text-zinc-400">Nothing scheduled in the next 14 days.</p>
            ) : (
              upcoming.map((e) => {
                const n = availableCount(e, players);
                return (
                  <div key={e.id} className="flex items-center gap-3 text-sm">
                    <span className={`w-2 h-2 rounded-full ${EVENT_TYPES[e.type].dot}`} />
                    <div className="flex-1 min-w-0 truncate">
                      {e.title}
                      <span className="text-zinc-500"> · {format(new Date(e.starts_at), "EEE d MMM HH:mm")}</span>
                    </div>
                    <span className={n >= 5 ? "text-emerald-400" : "text-amber-400"}>
                      {n}/{players.length}
                    </span>
                  </div>
                );
              })
            )}
          </Card>

          <Card title="Latest games" href="/dashboard/analytics">
            {recent.length === 0 ? (
              <p className="text-sm text-zinc-400">No games yet. Import match history from the Players page.</p>
            ) : (
              recent.map((g) => (
                <div key={g.id} className="flex items-center gap-3 text-sm">
                  <ChampionIcon name={g.champion} size={28} />
                  <span className="flex-1 truncate">{nameOf(g.player_id)}</span>
                  <span className="text-zinc-400">
                    {g.kills}/{g.deaths}/{g.assists}
                  </span>
                  <span className={`w-14 text-right ${g.win ? "text-emerald-400" : "text-red-400"}`}>{g.win ? "Win" : "Loss"}</span>
                </div>
              ))
            )}
          </Card>

          <Card title="Solo queue ranks" href="/dashboard/players">
            {ranks.length === 0 ? (
              <p className="text-sm text-zinc-400">No rank data yet.</p>
            ) : (
              ranks.map((r) => (
                <div key={r.player_id} className="flex justify-between text-sm">
                  <span>{nameOf(r.player_id)}</span>
                  <span className="text-zinc-300">
                    {r.tier} {r.rank} · {r.lp} LP
                  </span>
                </div>
              ))
            )}
          </Card>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
