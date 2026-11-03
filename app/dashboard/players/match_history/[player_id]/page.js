"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";
import ProgressBar from "@/components/ui/ProgressBar";
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

  if (!matches) return <p className="p-6 text-zinc-400">Loading...</p>;

  const demo = isDemo(user);
  // Why importing is unavailable, if it is.
  const blocked = demo
    ? "Importing from Riot is disabled in the demo account. The games below are sample data."
    : !player?.riot_puuid
      ? "This player has no Riot ID linked, so match history cannot be imported."
      : featuresLoaded && !riotEnabled
        ? "Importing from Riot is not enabled for this account yet. It will be available once DummyLab's Riot production key is approved."
        : null;

  return (
    <div className="p-4 sm:p-6 flex flex-col gap-4 max-w-4xl">
      <Link href="/dashboard/players" className="text-sm text-zinc-400 hover:text-zinc-200">
        ← Players
      </Link>
      <div className="flex flex-wrap items-center gap-4 justify-between">
        <div>
          <h1 className="text-xl text-cyan-400">{player?.name ?? "Player"}</h1>
          <p className="text-sm text-zinc-400">
            {player?.riot_id || "No Riot ID linked"} · {player?.region}
          </p>
        </div>
        <button
          onClick={handleUpdate}
          disabled={progress !== null || !!blocked || !featuresLoaded}
          className="min-h-11 rounded-md bg-cyan-500 px-3 text-zinc-950 disabled:opacity-40"
        >
          Update from Riot
        </button>
      </div>

      {blocked && <p className="text-sm text-amber-400">{blocked}</p>}

      {progress !== null && <ProgressBar value={progress} label="Importing matches" />}

      {rank.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {rank.map((r) => (
            <div key={r.queue} className="bg-zinc-800 rounded-md px-3 py-2 text-sm">
              <div className="text-zinc-400">{r.queue === "RANKED_SOLO_5x5" ? "Solo/Duo" : "Flex"}</div>
              <div>
                {r.tier} {r.rank} · {r.lp} LP
              </div>
              <div className="text-zinc-400">
                {r.wins}W {r.losses}L
              </div>
            </div>
          ))}
        </div>
      )}

      {matches.length === 0 ? (
        <p className="text-zinc-400">No matches yet. Use &quot;Update from Riot&quot; to import the latest games.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {matches.map((g) => (
            <div
              key={g.id}
              className={`bg-zinc-800 border-l-4 ${g.win ? "border-emerald-500" : "border-red-500"} p-2 flex items-center gap-3 text-sm`}
            >
              <ChampionIcon name={g.champion} size={40} />
              <div className="w-24">
                <div className={g.win ? "text-emerald-400" : "text-red-400"}>{g.win ? "Victory" : "Defeat"}</div>
                <div className="text-zinc-400 text-xs">{QUEUES[g.match.queue_id] ?? `Queue ${g.match.queue_id}`}</div>
              </div>
              <div className="w-28">
                {g.kills}/{g.deaths}/{g.assists}
                <div className="text-zinc-400 text-xs">{fmt(kda(g.kills, g.deaths, g.assists))} KDA</div>
              </div>
              <div className="w-24 hidden sm:block">
                {g.cs} CS
                <div className="text-zinc-400 text-xs">{fmt(g.cs / (g.match.duration / 60), 1)}/min</div>
              </div>
              <div className="ml-auto text-right text-zinc-400 text-xs">
                <div>{new Date(g.match.ended_at).toLocaleDateString("en-GB")}</div>
                <div>{Math.round(g.match.duration / 60)} min</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MatchHistory;
