"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { FaCircleCheck, FaCircleExclamation } from "react-icons/fa6";
import { verifyPlayer, insertPlayer } from "@/hooks/players";
import { regionStore } from "@/store/regionStore";
import { teamStore } from "@/store/teamStore";
import { playerStore } from "@/store/playerStore";
import { featureStore } from "@/store/featureStore";
import { ROLES } from "@/lib/constants";

const field = "flex min-h-11 w-full cursor-pointer rounded-md bg-zinc-900 p-2";

const AddPlayer = ({ setCreatePlayerModal }) => {
  const { regions } = regionStore();
  const { teams, activeTeamId } = teamStore();
  const addPlayer = playerStore((s) => s.addPlayer);
  const riotEnabled = featureStore((s) => s.riot);

  const [name, setName] = useState("");
  const [team, setTeam] = useState(activeTeamId ?? teams[0]?.id ?? "");
  const [role, setRole] = useState(1);
  const [region, setRegion] = useState(regions[0].code);
  const [gameName, setGameName] = useState("");
  const [tagLine, setTagLine] = useState("");
  const [verified, setVerified] = useState(null); // { puuid, riotId }
  const [skipRiot, setSkipRiot] = useState(false);
  const [verError, setVerError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Without Riot lookups (disabled for the account, or skipped on purpose) the player is added by name.
  const manual = !riotEnabled || skipRiot;
  const canSave = name.trim() && team && (manual || verified) && !loading;

  async function verPlayer() {
    setLoading(true);
    setVerError(null);
    try {
      setVerified(await verifyPlayer(gameName.trim(), tagLine.trim().replace(/^#/, ""), region));
    } catch (error) {
      setVerError(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleInsertPlayer() {
    if (!canSave) return;
    setLoading(true);
    try {
      const player = await insertPlayer({
        team_id: Number(team),
        name: name.trim(),
        region,
        role_id: Number(role),
        riot_id: manual ? null : verified.riotId,
        riot_puuid: manual ? null : verified.puuid,
      });
      addPlayer(player);
      setCreatePlayerModal(false);
    } catch (error) {
      toast.error(`Could not add the player: ${error.message}`);
      setLoading(false);
    }
  }

  if (teams.length === 0) return <p>Create a team first, then add players to it.</p>;

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg">Add a player</h2>
      <div className="flex flex-col gap-2">
        <label htmlFor="player-name">Player name</label>
        <input
          id="player-name"
          type="text"
          className="min-h-11 rounded-md bg-zinc-900 p-2 outline-none"
          placeholder="Insert player name..."
          value={name}
          maxLength={40}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="player-team">Team</label>
        <select id="player-team" className={field} value={team} onChange={(e) => setTeam(e.target.value)}>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="player-role">Role</label>
        <select id="player-role" className={field} value={role} onChange={(e) => setRole(e.target.value)}>
          {ROLES.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-md bg-zinc-900 p-4">
        {!riotEnabled ? (
          <p className="text-sm text-zinc-300">
            Riot lookups are not enabled for your account yet, so this player is added without a Riot ID. You can still
            plan their availability in the schedule.
          </p>
        ) : skipRiot ? (
          <div className="flex items-center justify-between gap-2 text-sm">
            <span className="text-zinc-300">Adding without a Riot ID (no match history).</span>
            <button className="min-h-11 rounded-md bg-zinc-200 px-3 text-zinc-900" onClick={() => setSkipRiot(false)}>
              Use Riot ID
            </button>
          </div>
        ) : verified ? (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {verified.riotId} is verified <FaCircleCheck aria-hidden="true" className="text-xl text-cyan-400" />
            </div>
            <button
              aria-label="Remove verified Riot ID"
              className="min-h-11 min-w-11 rounded-md bg-zinc-200 px-2 text-zinc-900"
              onClick={() => setVerified(null)}
            >
              X
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <p>Riot ID</p>
            {verError && (
              <div role="alert" className="flex items-center justify-between rounded-md border-2 border-red-600 bg-red-600/20 p-3">
                <span>{verError}</span>
                <FaCircleExclamation aria-hidden="true" className="text-xl text-red-500" />
              </div>
            )}
            <div className="flex space-x-2">
              <input
                type="text"
                aria-label="Game name"
                className="min-h-11 min-w-0 flex-1 rounded-md bg-zinc-950 p-2 outline-none"
                placeholder="Game Name"
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
              />
              <span className="flex items-center justify-center">#</span>
              <input
                type="text"
                aria-label="Tag line"
                className="min-h-11 min-w-0 max-w-24 flex-1 rounded-md bg-zinc-950 p-2 outline-none"
                placeholder="Tag"
                value={tagLine}
                onChange={(e) => setTagLine(e.target.value)}
              />
            </div>
            <select aria-label="Region" className="min-h-11 cursor-pointer rounded-md bg-zinc-950 p-2" value={region} onChange={(e) => setRegion(e.target.value)}>
              {regions.map((r) => (
                <option key={r.code} value={r.code}>
                  {r.name}
                </option>
              ))}
            </select>
            <button
              className="min-h-11 rounded-md bg-zinc-200 p-1 text-zinc-950 disabled:opacity-50"
              disabled={loading || !gameName.trim() || !tagLine.trim()}
              onClick={verPlayer}
            >
              {loading ? "Verifying..." : "Verify Player"}
            </button>
            <button className="min-h-11 text-sm text-zinc-300 underline" onClick={() => setSkipRiot(true)}>
              Add without a Riot ID
            </button>
          </div>
        )}
      </div>

      <button
        className="min-h-11 rounded-md bg-zinc-200 p-1 text-zinc-950 disabled:opacity-20"
        disabled={!canSave}
        onClick={handleInsertPlayer}
      >
        Confirm
      </button>
    </div>
  );
};

export default AddPlayer;
