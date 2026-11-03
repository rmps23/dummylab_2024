"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";
import { FaArrowRotateRight, FaUsers } from "react-icons/fa6";
import ProgressBar from "@/components/ui/ProgressBar";
import PageHeader from "@/components/ui/PageHeader";
import RankBadge from "@/components/ui/RankBadge";
import RoleBadge from "@/components/ui/RoleBadge";
import FormPips from "@/components/ui/FormPips";
import Skeleton from "@/components/ui/Skeleton";
import { btnPrimary } from "@/components/ui/buttons";
import { fetchPlayer, fetchMatches, fetchRank, syncPlayer, refreshRank } from "@/hooks/players";
import { isDemo, userStore } from "@/store/userStore";
import { featureStore } from "@/store/featureStore";
import { QUEUES } from "@/lib/constants";
import { fmt, kda } from "@/lib/stats";
import ChampionIcon from "@/components/ui/ChampionIcon";

const MatchHistory = () => {
  const { player_id } = useParams();
  const user = userStore((s) => s.user);
  const riotEnabled = featureStore((s) => s.riot);
  const featuresLoaded = featureStore((s) => s.loaded);
  const [player, setPlayer] = useState(null);
  const [matches, setMatches] = useState(null);
  const [rank, setRank] = useState([]);
  const [progress, setProgress] = useState(null);

  const load = useCallback(async () => {
    try {
      const [p, m, r] = await Promise.all([fetchPlayer(player_id), fetchMatches(player_id), fetchRank(player_id)]);
      setPlayer(p);
      setMatches(m);
      setRank(r);
    } catch (error) {
      toast.error(error.message);
      setMatches([]);
    }
  }, [player_id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleUpdate() {
    setProgress(0);
    try {
      await syncPlayer(player_id, (done, total) => setProgress(total ? (done / total) * 100 : 100));
      await refreshRank(player_id).catch(() => {});
      await load();
      toast.success("Match history updated");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setProgress(null);
    }
  }

  if (!matches) return <Skeleton className="m-6 h-64" />;

  const demo = isDemo(user);
  // Why importing is unavailable, if it is.
  const blocked = demo
    ? "Importing from Riot is disabled in the demo account. The games below are sample data."
    : !player?.riot_puuid
      ? "This player has no Riot ID linked, so match history cannot be imported."
      : featuresLoaded && !riotEnabled
        ? "Importing from Riot is not enabled for this account yet. It will be available once DummyLab's Riot production key is approved."
        : null;

  const wins = matches.filter((g) => g.win).length;
  const solo = rank.find((r) => r.queue === "RANKED_SOLO_5x5");

  return (
    <>
      <PageHeader
        icon={FaUsers}
        title={player?.name ?? "Player"}
        subtitle={`${player?.riot_id || "No Riot ID linked"} · ${player?.region ?? ""}`}
      >
        <Link href="/dashboard/players" className="inline-flex min-h-11 items-center px-2 text-sm text-zinc-400 hover:text-zinc-100">
          ← Players
        </Link>
        <button onClick={handleUpdate} disabled={progress !== null || !!blocked || !featuresLoaded} className={btnPrimary}>
          <FaArrowRotateRight aria-hidden="true" className={progress !== null ? "animate-spin" : ""} /> Update from Riot
        </button>
      </PageHeader>

      <div className="flex max-w-5xl flex-col gap-4 p-4 sm:p-6">
        {blocked && <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-300">{blocked}</p>}
        {progress !== null && <ProgressBar value={progress} label="Importing matches" />}

        <div className="flex flex-wrap items-center gap-4 rounded-xl border border-white/[0.07] bg-panel/80 p-4 shadow-card">
          {player?.role?.name && <RoleBadge role={player.role.name} />}
          {solo ? <RankBadge tier={solo.tier} rank={solo.rank} lp={solo.lp} /> : <span className="text-sm text-zinc-400">Unranked</span>}
          {rank.filter((r) => r.queue !== "RANKED_SOLO_5x5").map((r) => (
            <span key={r.queue} className="text-sm text-zinc-300">
              Flex: {r.tier} {r.rank} · {r.lp} LP
            </span>
          ))}
          <div className="ml-auto flex items-center gap-4">
            <span className="text-sm text-zinc-400">
              {wins}W {matches.length - wins}L
            </span>
            <FormPips results={matches.slice(0, 10).map((g) => g.win)} />
          </div>
        </div>

        {matches.length === 0 ? (
          <p className="rounded-xl border border-dashed border-white/10 p-8 text-center text-zinc-400">
            No matches yet. Use &quot;Update from Riot&quot; to import the latest games.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {matches.map((g) => (
              <li
                key={g.id}
                className={`flex items-center gap-3 rounded-xl border border-white/[0.07] border-l-[3px] bg-panel/80 p-3 shadow-card ${g.win ? "border-l-win" : "border-l-loss"}`}
              >
                <ChampionIcon name={g.champion} size={44} />
                <div className="w-24">
                  <div className={`text-sm font-bold uppercase ${g.win ? "text-win" : "text-loss"}`}>{g.win ? "Victory" : "Defeat"}</div>
                  <div className="text-xs text-zinc-400">{QUEUES[g.match.queue_id] ?? `Queue ${g.match.queue_id}`}</div>
                </div>
                <div className="w-28">
                  <div className="font-semibold">
                    {g.kills}
                    <span className="text-zinc-500"> / </span>
                    <span className="text-loss">{g.deaths}</span>
                    <span className="text-zinc-500"> / </span>
                    {g.assists}
                  </div>
                  <div className="text-xs text-zinc-400">{fmt(kda(g.kills, g.deaths, g.assists))} KDA</div>
                </div>
                <div className="hidden w-24 sm:block">
                  <div className="font-semibold">{g.cs} CS</div>
                  <div className="text-xs text-zinc-400">{fmt(g.cs / (g.match.duration / 60), 1)}/min</div>
                </div>
                <div className="ml-auto text-right text-xs text-zinc-400">
                  <div>{new Date(g.match.ended_at).toLocaleDateString("en-GB")}</div>
                  <div>{Math.round(g.match.duration / 60)} min</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};

export default MatchHistory;
