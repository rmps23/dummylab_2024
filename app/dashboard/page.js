"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { FaCircleCheck, FaHouse, FaRegCircle } from "react-icons/fa6";
import { teamStore } from "@/store/teamStore";
import { playerStore } from "@/store/playerStore";
import { fetchEvents } from "@/hooks/schedule";
import { fetchPlayerStats, fetchRecentTeamMatches, fetchTeamRanks, sumStats } from "@/hooks/stats";
import { EVENT_TYPES } from "@/lib/constants";
import { fmt, kda, pct } from "@/lib/stats";
import { availableCount, pendingCount } from "@/lib/availability";
import PageHeader from "@/components/ui/PageHeader";
import KpiCard from "@/components/ui/KpiCard";
import ChampionIcon from "@/components/ui/ChampionIcon";
import EmptyState, { actionClass } from "@/components/ui/EmptyState";
import { SkeletonKpis } from "@/components/ui/Skeleton";

const Card = ({ title, href, children }) => (
  <section className="flex flex-col gap-3 rounded-md border border-zinc-800 bg-zinc-950 p-4">
    <div className="flex items-center justify-between">
      <h2 className="font-bold">{title}</h2>
      {href && (
        <Link href={href} className="inline-flex min-h-9 items-center text-xs text-cyan-400 hover:underline">
          View all
        </Link>
      )}
    </div>
    {children}
  </section>
);

function GetStarted({ steps }) {
  const done = steps.filter((s) => s.done).length;
  return (
    <section className="rounded-md border border-cyan-800 bg-cyan-950/30 p-4">
      <h2 className="font-bold">
        Get started <span className="text-sm font-normal text-zinc-400">· {done} of {steps.length} done</span>
      </h2>
      <ol className="mt-3 flex flex-col gap-1">
        {steps.map((s) => (
          <li key={s.label}>
            <Link href={s.href} className="flex min-h-11 items-center gap-3 rounded-md px-2 text-sm hover:bg-zinc-800">
              {s.done ? (
                <FaCircleCheck aria-hidden="true" className="text-emerald-400" />
              ) : (
                <FaRegCircle aria-hidden="true" className="text-zinc-400" />
              )}
              <span className={s.done ? "text-zinc-400 line-through" : ""}>{s.label}</span>
              <span className="sr-only">{s.done ? "(done)" : "(to do)"}</span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}

const Dashboard = () => {
  const { teams, activeTeamId, loaded } = teamStore();
  const allPlayers = playerStore((s) => s.players);
  const team = teams.find((t) => t.id === activeTeamId);
  const players = useMemo(() => allPlayers.filter((p) => p.team_id === activeTeamId), [allPlayers, activeTeamId]);

  const [events, setEvents] = useState(null);
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [ranks, setRanks] = useState([]);

  // Team-level data depends only on the team; player-level data only on the set of player ids.
  useEffect(() => {
    if (!activeTeamId) return;
    setEvents(null);
    setStats(null);
    const from = new Date();
    const to = new Date(Date.now() + 14 * 86400000);
    fetchEvents(activeTeamId, from, to).then(setEvents).catch(() => setEvents([]));
    fetchPlayerStats({ team: activeTeamId, days: 30 }).then(setStats).catch(() => setStats([]));
  }, [activeTeamId]);

  const playerKey = players.map((p) => p.id).join(",");
  useEffect(() => {
    const ids = playerKey ? playerKey.split(",") : [];
    fetchRecentTeamMatches(ids).then(setRecent).catch(() => setRecent([]));
    fetchTeamRanks(ids).then(setRanks).catch(() => setRanks([]));
  }, [playerKey]);

  if (loaded && teams.length === 0) {
    return (
      <>
        <PageHeader icon={FaHouse} title="Home" />
        <EmptyState
          icon={FaHouse}
          title="Welcome to DummyLab"
          action={
            <Link href="/dashboard/teams" className={actionClass}>
              Create your first team
            </Link>
          }
        >
          Create a team, add its players, plan trainings and scrims with each player&apos;s availability, and follow stats
          from match history.
        </EmptyState>
      </>
    );
  }

  const total = stats ? sumStats(stats) : null;
  const nameOf = (id) => players.find((p) => p.id === id)?.name ?? "?";
  const pendingReplies = (events || []).reduce((n, e) => n + pendingCount(e, players), 0);
  const upcoming = (events || []).slice(0, 5);

  const steps = [
    { label: "Create a team", href: "/dashboard/teams", done: teams.length > 0 },
    { label: "Add your players", href: "/dashboard/players", done: players.length > 0 },
    { label: "Import match history", href: "/dashboard/players", done: !!total && total.games > 0 },
    { label: "Schedule a training or scrim", href: "/dashboard/schedule", done: !!events && events.length > 0 },
  ];

  return (
    <>
      <PageHeader icon={FaHouse} title={team ? team.name : "Home"} />

      <div className="flex flex-col gap-4 p-4 sm:p-6">
        {events && stats && steps.some((s) => !s.done) && <GetStarted steps={steps} />}

        {!stats || !events ? (
          <SkeletonKpis />
        ) : (
          <div className="flex flex-wrap gap-3">
            <KpiCard label="Players" value={players.length} />
            <KpiCard label="Games (30d)" value={total.games} title="Games imported in the last 30 days" />
            <KpiCard label="Win rate (30d)" value={total.games ? `${pct(total.wins, total.games)}%` : "-"} />
            <KpiCard
              label="Team KDA (30d)"
              value={total.games ? fmt(kda(total.kills, total.deaths, total.assists)) : "-"}
              title="(kills + assists) / deaths"
            />
            <KpiCard
              label="Awaiting replies"
              value={pendingReplies}
              hint="next 14 days"
              title="Players who have not answered for upcoming events"
            />
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card title="Upcoming events" href="/dashboard/schedule">
            {events === null ? (
              <p className="text-sm text-zinc-400">Loading...</p>
            ) : upcoming.length === 0 ? (
              <p className="text-sm text-zinc-400">Nothing scheduled in the next 14 days.</p>
            ) : (
              upcoming.map((e) => {
                const n = availableCount(e, players);
                return (
                  <div key={e.id} className="flex items-center gap-3 text-sm">
                    <span aria-hidden="true" className={`h-2 w-2 shrink-0 rounded-full ${EVENT_TYPES[e.type].dot}`} />
                    <div className="min-w-0 flex-1 truncate">
                      {e.title}
                      <span className="text-zinc-400"> · {format(new Date(e.starts_at), "EEE d MMM HH:mm")}</span>
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
              <p className="text-sm text-zinc-400">No games yet. Import match history from a player&apos;s page.</p>
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
