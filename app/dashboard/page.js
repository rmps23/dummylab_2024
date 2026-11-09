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
import { pendingCount } from "@/lib/availability";
import PageHeader from "@/components/ui/PageHeader";
import Card, { linkAction } from "@/components/ui/Card";
import KpiCard from "@/components/ui/KpiCard";
import Donut from "@/components/ui/Donut";
import FormPips from "@/components/ui/FormPips";
import RankBadge from "@/components/ui/RankBadge";
import RoleBadge from "@/components/ui/RoleBadge";
import AvailabilityDots from "@/components/ui/AvailabilityDots";
import Avatar from "@/components/ui/Avatar";
import ChampionIcon from "@/components/ui/ChampionIcon";
import EmptyState, { actionClass } from "@/components/ui/EmptyState";
import { SkeletonKpis } from "@/components/ui/Skeleton";

function GetStarted({ steps }) {
  const done = steps.filter((s) => s.done).length;
  return (
    <Card title={`Get started · ${done} of ${steps.length} done`} className="border-brand/30 bg-brand/[0.04]">
      <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-brand" style={{ width: `${(done / steps.length) * 100}%` }} />
      </div>
      <ol className="grid gap-1 sm:grid-cols-2">
        {steps.map((s) => (
          <li key={s.label}>
            <Link href={s.href} className="flex min-h-11 items-center gap-3 rounded-lg px-2 text-sm hover:bg-white/[0.06]">
              {s.done ? <FaCircleCheck aria-hidden="true" className="text-win" /> : <FaRegCircle aria-hidden="true" className="text-zinc-500" />}
              <span className={s.done ? "text-zinc-400 line-through" : "font-semibold"}>{s.label}</span>
              <span className="sr-only">{s.done ? "(done)" : "(to do)"}</span>
            </Link>
          </li>
        ))}
      </ol>
    </Card>
  );
}

const DateBlock = ({ date }) => (
  <div className="w-12 shrink-0 rounded-lg bg-white/[0.06] py-1 text-center">
    <div className="eyebrow !text-[10px]">{format(date, "MMM")}</div>
    <div className="text-lg font-bold leading-tight">{format(date, "dd")}</div>
  </div>
);

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
    fetchRecentTeamMatches(ids, 10).then(setRecent).catch(() => setRecent([]));
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
  const byId = (id) => players.find((p) => p.id === id);
  const pendingReplies = (events || []).reduce((n, e) => n + pendingCount(e, players), 0);
  const upcoming = (events || []).slice(0, 5);
  const form = recent.map((g) => g.win);
  const wr = total?.games ? pct(total.wins, total.games) : 0;

  const steps = [
    { label: "Create a team", href: "/dashboard/teams", done: teams.length > 0 },
    { label: "Add your players", href: "/dashboard/players", done: players.length > 0 },
    { label: "Import match history", href: "/dashboard/players", done: !!total && total.games > 0 },
    { label: "Schedule a training or scrim", href: "/dashboard/schedule", done: !!events && events.length > 0 },
  ];

  return (
    <>
      <PageHeader
        icon={FaHouse}
        title={team ? team.name : "Home"}
        subtitle={`${players.length} player${players.length === 1 ? "" : "s"} · overview`}
      />

      <div className="flex flex-col gap-4 p-4 sm:p-6">
        {events && stats && steps.some((s) => !s.done) && <GetStarted steps={steps} />}

        {!stats || !events ? (
          <SkeletonKpis />
        ) : (
          <>
            <Card className="relative overflow-hidden">
              <div className="relative flex flex-wrap items-center gap-x-8 gap-y-5">
                <Donut value={wr} size={112} label="Wins" />
                <div className="min-w-[10rem]">
                  <div className="eyebrow">Team win rate · last 30 days</div>
                  <div className={`mt-1 text-5xl font-bold leading-none ${wr >= 50 ? "text-brand" : "text-loss"}`}>{wr}%</div>
                  <div className="mt-2 text-sm text-zinc-400">
                    <span className="font-semibold text-win">{total.wins}W</span> <span className="text-zinc-500">/</span>{" "}
                    <span className="font-semibold text-loss">{total.games - total.wins}L</span> · {total.games} games
                  </div>
                </div>
                <div>
                  <div className="eyebrow mb-2">Recent form</div>
                  <FormPips results={form} />
                </div>
                <div className="ml-auto hidden sm:block">
                  <div className="eyebrow mb-2 text-right">Roster</div>
                  <div className="flex -space-x-2">
                    {players.slice(0, 6).map((p) => (
                      <span key={p.id} className="rounded-xl ring-2 ring-panel" title={p.name}>
                        <Avatar name={p.name} size={34} />
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex flex-wrap gap-3">
              <KpiCard label="Team KDA" accent="accent" value={total.games ? fmt(kda(total.kills, total.deaths, total.assists)) : "-"} hint="(K + A) / D" title="(kills + assists) / deaths" />
              <KpiCard label="CS / min" accent="brand" value={total.minutes ? fmt(total.cs / total.minutes, 1) : "-"} hint="all roles" />
              <KpiCard label="Damage / min" accent="loss" value={total.minutes ? Math.round(total.damage / total.minutes) : "-"} hint="to champions" />
              <KpiCard
                label="Awaiting replies"
                accent="amber"
                value={pendingReplies}
                hint="next 14 days"
                title="Players who have not answered for upcoming events"
              />
            </div>
          </>
        )}

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <Card title="Upcoming events" action={<Link href="/dashboard/schedule" className={linkAction}>View all</Link>}>
            {events === null ? (
              <p className="text-sm text-zinc-400">Loading...</p>
            ) : upcoming.length === 0 ? (
              <p className="text-sm text-zinc-400">Nothing scheduled in the next 14 days.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {upcoming.map((e) => (
                  <li key={e.id} className="flex items-center gap-3 rounded-lg p-1.5 hover:bg-white/[0.04]">
                    <DateBlock date={new Date(e.starts_at)} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold">{e.title}</div>
                      <div className="flex items-center gap-2 text-xs text-zinc-400">
                        <span aria-hidden="true" className={`h-2 w-2 rounded-full ${EVENT_TYPES[e.type].dot}`} />
                        {EVENT_TYPES[e.type].label} · {format(new Date(e.starts_at), "EEE HH:mm")}
                      </div>
                    </div>
                    <AvailabilityDots event={e} players={players} />
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Latest games" action={<Link href="/dashboard/analytics" className={linkAction}>View all</Link>}>
            {recent.length === 0 ? (
              <p className="text-sm text-zinc-400">No games yet. Import match history from a player&apos;s page.</p>
            ) : (
              <ul className="flex flex-col gap-1.5">
                {recent.slice(0, 7).map((g) => (
                  <li key={g.id} className={`flex items-center gap-3 rounded-lg border-l-[3px] bg-white/[0.03] py-1.5 pl-2 pr-3 ${g.win ? "border-win" : "border-loss"}`}>
                    <ChampionIcon name={g.champion} size={32} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold">{byId(g.player_id)?.name ?? "?"}</div>
                      <div className="text-xs text-zinc-400">{g.champion}</div>
                    </div>
                    <span className="text-sm">
                      {g.kills}<span className="text-zinc-500">/</span>
                      <span className="text-loss">{g.deaths}</span>
                      <span className="text-zinc-500">/</span>
                      {g.assists}
                    </span>
                    <span className={`w-12 text-right text-xs font-bold uppercase ${g.win ? "text-win" : "text-loss"}`}>{g.win ? "Win" : "Loss"}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Solo queue ranks" action={<Link href="/dashboard/players" className={linkAction}>View all</Link>} className="xl:col-span-2">
            {ranks.length === 0 ? (
              <p className="text-sm text-zinc-400">No rank data yet.</p>
            ) : (
              <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {ranks.map((r) => {
                  const p = byId(r.player_id);
                  return (
                    <li key={r.player_id} className="flex items-center justify-between gap-3 rounded-lg bg-white/[0.03] px-3 py-2">
                      <div className="min-w-0">
                        <div className="truncate font-semibold">{p?.name ?? "?"}</div>
                        <RoleBadge role={p?.role?.name} />
                      </div>
                      <RankBadge tier={r.tier} rank={r.rank} lp={r.lp} />
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
