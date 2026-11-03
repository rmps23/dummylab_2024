"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { FaCircleCheck, FaCircleExclamation } from "react-icons/fa6";
import { verifyPlayer, insertPlayer } from "@/hooks/players";
import { regionStore } from "@/store/regionStore";
import { teamStore } from "@/store/teamStore";
import { playerStore } from "@/store/playerStore";
import { ROLES } from "@/lib/constants";

const field = "p-2 rounded-md flex w-full bg-zinc-900 cursor-pointer";

const AddPlayer = ({ setCreatePlayerModal }) => {
  const { regions } = regionStore();
  const { teams, activeTeamId } = teamStore();
  const addPlayer = playerStore((s) => s.addPlayer);

  const [name, setName] = useState("");
  const [team, setTeam] = useState(activeTeamId ?? teams[0]?.id ?? "");
  const [role, setRole] = useState(1);
  const [region, setRegion] = useState(regions[0].code);
  const [gameName, setGameName] = useState("");
  const [tagLine, setTagLine] = useState("");
  const [verified, setVerified] = useState(null); // { puuid, riotId }
  const [verError, setVerError] = useState(null);
  const [loading, setLoading] = useState(false);

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
    if (!name.trim() || !team || !verified) return;
    setLoading(true);
    try {
      const player = await insertPlayer({
        team_id: Number(team),
        name: name.trim(),
        region,
        role_id: Number(role),
        riot_id: verified.riotId,
        riot_puuid: verified.puuid,
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
      <div className="flex flex-col gap-2">
        <p>Player Name</p>
        <input
          type="text"
          className="bg-zinc-900 p-2 rounded-md outline-none"
          placeholder="Insert player name..."
          value={name}
          maxLength={40}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <p>Team</p>
        <select className={field} value={team} onChange={(e) => setTeam(e.target.value)}>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <p>Role</p>
        <select className={field} value={role} onChange={(e) => setRole(e.target.value)}>
          {ROLES.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>
      <div className="bg-zinc-900 p-4 rounded-md">
        {verified ? (
          <div className="flex justify-between items-center gap-2">
            <div className="flex items-center gap-2">
              {verified.riotId} is verified <FaCircleCheck className="text-cyan-400 text-xl" />
            </div>
            <button className="bg-zinc-200 text-zinc-900 py-1 px-2 rounded-md text-sm" onClick={() => setVerified(null)}>
              X
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <p>Riot ID</p>
            {verError && (
              <div className="bg-red-600/20 border-2 border-red-600 rounded-md p-3 flex items-center justify-between">
                <span>{verError}</span>
                <FaCircleExclamation className="text-red-500 text-xl" />
              </div>
            )}
            <div className="flex space-x-2">
              <input
                type="text"
                className="bg-zinc-950 p-2 rounded-md outline-none flex-1 min-w-0"
                placeholder="Game Name"
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
              />
              <span className="flex items-center justify-center">#</span>
              <input
                type="text"
                className="bg-zinc-950 p-2 rounded-md outline-none flex-1 min-w-0 max-w-24"
                placeholder="Tag"
                value={tagLine}
                onChange={(e) => setTagLine(e.target.value)}
              />
            </div>
            <select className="p-2 rounded-md bg-zinc-950 cursor-pointer" value={region} onChange={(e) => setRegion(e.target.value)}>
              {regions.map((r) => (
                <option key={r.code} value={r.code}>
                  {r.name}
                </option>
              ))}
            </select>
            <button
              className="bg-zinc-200 text-zinc-950 p-1 rounded-md disabled:opacity-50"
              disabled={loading || !gameName.trim() || !tagLine.trim()}
              onClick={verPlayer}
            >
              {loading ? "Verifying..." : "Verify Player"}
            </button>
          </div>
        )}
      </div>
      <button
        className="text-zinc-950 p-1 rounded-md bg-zinc-200 disabled:opacity-20"
        disabled={!verified || !name.trim() || loading}
        onClick={handleInsertPlayer}
      >
        Confirm
      </button>
    </div>
  );
};

export default AddPlayer;
