"use client";

import { useState, useEffect } from "react";
import { verifyPlayer } from "@/hooks/players/verifyPlayer";
import { regionStore } from "@/store/regionStore";

const AddPlayer = () => {
  const { regions } = regionStore();

  const [verPlayerLOAD, setVerPlayerLOAD] = useState(false);
  const [playerRegion, setPlayerRegion] = useState(regions[0].code);
  const [gameName, setGameName] = useState("");
  const [tagLine, setTagLine] = useState("");

  const [riot_id, set_riot_id] = useState("");
  const [riot_puuid, set_riot_puuid] = useState("");
  const [riot_acc_id, set_riot_acc_id] = useState("");

  async function verPlayer() {
    setVerPlayerLOAD(true);

    const regionCode = regions.find((r) => r.code === playerRegion);

    try {
      const response = await verifyPlayer(gameName, tagLine, regionCode);

      // set_riot_id(gameName + "#" + tagLine);
      // set_riot_puuid(response.puuid);
      // set_riot_acc_id(response.acc_id);

      // console.log(riot_id);
      // console.log(riot_puuid);
      // console.log(riot_acc_id);

      console.log(response);
      setVerPlayerLOAD(false);
    } catch (error) {
      console.error("Error adding team:", error);
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
          placeholder="Insert team name..."
        />
      </div>
      <div className="bg-zinc-900 p-4 rounded-md">
        {verPlayerLOAD ? (
          "Loading..."
        ) : (
          <>
            <div className="flex flex-col gap-4">
              <p>Riot ID</p>
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

              <span>----------------</span>
            </div>
          </>
        )}
      </div>
      team and role missing
      <button className="bg-zinc-200 text-zinc-950 p-1 rounded-md">
        Confirm
      </button>
    </div>
  );
};

export default AddPlayer;
