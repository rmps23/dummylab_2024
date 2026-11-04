"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { FaDownload, FaFileLines, FaPrint } from "react-icons/fa6";
import { teamStore } from "@/store/teamStore";
import { featureStore } from "@/store/featureStore";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import KpiCard from "@/components/ui/KpiCard";
import RoleBadge from "@/components/ui/RoleBadge";
import EmptyState, { actionClass } from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";
import { btnSecondary } from "@/components/ui/buttons";

export default function Report() {
  const { activeTeamId, teams, loaded } = teamStore();
  const { plan, loaded: featuresLoaded } = featureStore();
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!activeTeamId || !featuresLoaded || plan !== "pro") return;
    setReport(null);
    setError(null);
    fetch(`/api/teams/${activeTeamId}/report`)
      .then(async (r) => {
        const body = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(body.error || "Could not load the report");
        setReport(body.report);
      })
      .catch((e) => setError(e.message));
  }, [activeTeamId, featuresLoaded, plan]);

  const team = teams.find((t) => t.id === activeTeamId);

  if ((loaded && teams.length === 0) || (featuresLoaded && plan !== "pro")) {
    return (
      <>
        <PageHeader icon={FaFileLines} title="Weekly report" />
        <EmptyState
          icon={FaFileLines}
          title={teams.length === 0 ? "Create a team first" : "The weekly report is a Pro feature"}
          action={
            <Link href={teams.length === 0 ? "/dashboard/teams" : "/dashboard/billing"} className={actionClass}>
              {teams.length === 0 ? "Go to Teams" : "See Pro"}
            </Link>
          }
        >
          A summary of the last 7 games and the next 7 days of your team, ready to print, download as CSV or email.
        </EmptyState>
      </>
    );
  }

  return (
    <>
      <PageHeader
        icon={FaFileLines}
        title="Weekly report"
        subtitle={team ? `${team.name} · last 7 days and next 7 days` : undefined}
      >
        <a href={`/api/teams/${activeTeamId}/report?format=csv`} className={`${btnSecondary} print:hidden`}>
          <FaDownload aria-hidden="true" /> CSV
        </a>
        <button onClick={() => window.print()} className={`${btnSecondary} print:hidden`}>
          <FaPrint aria-hidden="true" /> Print
        </button>
      </PageHeader>

      <div className="flex flex-col gap-4 p-4 sm:p-6">
        {error ? (
          <p role="alert" className="rounded-lg border border-rose-700 bg-rose-950/40 p-4 text-sm">{error}</p>
        ) : !report ? (
          <Skeleton className="h-64" />
        ) : (
          <>
            <div className="flex flex-wrap gap-3">
              <KpiCard label="Games" value={report.games} />
              <KpiCard label="Record" accent="win" value={`${report.wins}W ${report.losses}L`} hint={`${report.winRate}% win rate`} />
              <KpiCard label="Team KDA" accent="accent" value={report.kda ?? "-"} />
              <KpiCard
                label="Most played"
                accent="amber"
                value={report.topChampions[0]?.champion ?? "-"}
                hint={report.topChampions[0] ? `${report.topChampions[0].games} games` : undefined}
              />
            </div>

            <Card title="Players">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[480px] text-sm">
                  <thead>
                    <tr className="text-left">
                      {["Player", "Games", "Win rate", "KDA", "CS/min"].map((h) => (
                        <th key={h} scope="col" className="eyebrow py-2 pr-3 font-bold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {report.perPlayer.map((p) => (
                      <tr key={p.id} className="border-t border-white/[0.06]">
                        <td className="flex items-center gap-2 py-2 pr-3 font-semibold">
                          {p.name} <RoleBadge role={p.role} />
                        </td>
                        <td className="pr-3">{p.games}</td>
                        <td className="pr-3">{p.games ? `${p.winRate}%` : "-"}</td>
                        <td className="pr-3">{p.kda ?? "-"}</td>
                        <td>{p.csPerMin ?? "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card title="Next 7 days">
              {report.upcoming.length === 0 ? (
                <p className="text-sm text-zinc-400">Nothing scheduled.</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {report.upcoming.map((e) => (
                    <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white/[0.04] p-2 text-sm">
                      <span>
                        <b>{e.title}</b>
                        <span className="text-zinc-400"> · {format(new Date(e.starts_at), "EEE d MMM HH:mm")}</span>
                      </span>
                      <span className={e.available >= 5 ? "text-win" : "text-amber-400"}>
                        {e.available}/{report.players} available
                        {e.pendingCount > 0 && <span className="text-zinc-400"> · waiting: {e.pending.join(", ")}</span>}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </>
        )}
      </div>
    </>
  );
}
