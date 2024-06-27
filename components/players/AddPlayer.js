"use client";

import { useState, useEffect } from "react";
import { verifyPlayer } from "@/hooks/players/verifyPlayer";
import { regionStore } from "@/store/regionStore";
import { teamStore } from "@/store/teamStore";
import { FaCircleCheck, FaCircleExclamation } from "react-icons/fa6";
import { insertPlayer } from "@/hooks/players/insertPlayer";

const AddPlayer = ({ user_id, setCreatePlayerModal }) => {
  const { regions } = regionStore();
  const { teams } = teamStore();

  const [verPlayerLOAD, setVerPlayerLOAD] = useState(false);
  const [playerRegion, setPlayerRegion] = useState(regions[0].code);
  const [gameName, setGameName] = useState("");
  const [tagLine, setTagLine] = useState("");
  const [verified, setVerified] = useState(false);
  const [verError, setVerError] = useState(false);
  const [name, setName] = useState("");
  const [team, setTeam] = useState(0);
  const [role, setRole] = useState(0);

  const [riot_id, set_riot_id] = useState("");
  const [riot_puuid, set_riot_puuid] = useState("");
  const [riot_acc_id, set_riot_acc_id] = useState("");

  async function resetVerify() {
    setGameName("");
    setTagLine("");
    setVerified("");
    set_riot_id("");
    set_riot_puuid("");
    set_riot_acc_id("");
    setVerified(false);
    setVerError(false);
  }

  async function handleInsertPlayer() {
    if (!name) {
      console.log("Error: Player name is missing");
      return false;
    }

    const regionCode = regions.find((r) => r.code === playerRegion);
    if (!regionCode) {
      console.log("Error: Invalid player region");
      return false;
    }

    try {
      const response = await insertPlayer(
        team,
        name,
        regionCode,
        role,
        riot_id,
        riot_puuid,
        riot_acc_id,
        user_id
      );

    } catch (error) {
      console.error("Error during player insertion:", error);
      setVerError(true);
    } finally {
      setCreatePlayerModal(false);
    }
  }

  async function verPlayer() {
    setVerPlayerLOAD(true);

    const regionCode = regions.find((r) => r.code === playerRegion);

    try {
      const response = await verifyPlayer(gameName, tagLine, regionCode);

      if (!response.error) {
        set_riot_id(gameName + "#" + tagLine);
        set_riot_puuid(response.puuid);
        set_riot_acc_id(response.acc_id);

        setVerified(true);
        setVerPlayerLOAD(false);
        setVerError(false);
      } else {
        setVerError(true);
      }
    } catch (error) {
      setVerPlayerLOAD(false);
      setVerified(false);
      setVerError(true);
    } finally {
      setVerPlayerLOAD(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <p>Player Name</p>
        <input
          type="text"
          className="bg-zinc-900 p-2 rounded-md outline-none"
          placeholder="Insert player name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <p>Team</p>
        <select
          className="p-2 rounded-md flex w-full bg-zinc-900 cursor-pointer"
          value={team}
          onChange={(e) => setTeam(e.target.value)}
        >
          <option value={0}>Select a team</option>
          {teams.map((team, index) => (
            <option key={index} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <p>Role</p>
        <select
          className="p-2 rounded-md flex w-full bg-zinc-900 cursor-pointer"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value={0}>Top</option>
          <option value={1}>Jungler</option>
          <option value={2}>Mid</option>
          <option value={3}>Bottom</option>
          <option value={4}>Support</option>
        </select>
      </div>
      <div className="bg-zinc-900 p-4 rounded-md">
        {verPlayerLOAD ? (
          "Loading..."
        ) : (
          <>
            {verified == false ? (
              <>
                <div className="flex flex-col gap-4">
                  <p>Riot ID</p>
                  {verError === true && (
                    <div className="bg-red-600/20 border-2 border-red-600 rounded-md p-3 flex items-center justify-between">
                      <span>Couldnt find the player</span>
                      <span>
                        <FaCircleExclamation className="text-red-500 text-xl" />
                      </span>
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
                      placeholder="Tag Line"
                      value={tagLine}
                      onChange={(e) => setTagLine(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col">
                    <select
                      className="p-2 rounded-md bg-zinc-950 cursor-pointer"
                      value={playerRegion}
                      onChange={(e) => setPlayerRegion(e.target.value)}
                    >
                      {regions.map((region, index) => (
                        <option key={index} value={region.code}>
                          {region.name} ({region.zone})
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    className="bg-zinc-200 text-zinc-950 p-1 rounded-md"
                    onClick={verPlayer}
                  >
                    Verify Player
                  </button>
                </div>
              </>
            ) : (
              <div className="flex justify-between items-center gap-2">
                <div className="flex items-center gap-2">
                  {riot_id} is verified{" "}
                  <FaCircleCheck className="text-cyan-400 text-xl" />
                </div>
                <div>
                  <button
                    className="bg-zinc-200 text-zinc-900 py-1 px-2 rounded-md text-sm"
                    onClick={resetVerify}
                  >
                    X
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <button
        className={` text-zinc-950 p-1 rounded-md ${verified ? "bg-zinc-200" : "bg-zinc-200/20"
          }`}
        disabled={!verified}
        onClick={handleInsertPlayer}
      >
        Confirm
      </button>
    </div>
  );
};

export default AddPlayer;
