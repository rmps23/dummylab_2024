"use client";

import React, { useState, useEffect } from "react";
import { fetchPlayer } from "@/hooks/players/fetchPlayer";
import { fetchGames } from "@/hooks/players/fetchGames";
import { useParams } from "next/navigation";
import { regionStore } from "@/store/regionStore";
import LinearProgress from '@mui/material/LinearProgress';
import { fetchMatchHistory } from "@/hooks/players/fetchGames";

const MatchHistory = () => {
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mH, setMH] = useState();

  const params = useParams();
  const player_id = params.player_id;
  const { regions } = regionStore();

  const getPlayerData = async () => {
    try {
      const data = await fetchPlayer(player_id);
      setPlayer(data);
    } catch (error) {
      console.error("Failed to fetch player:", error);
    } finally {
      setLoading(false);
    }
  };

  const getMatchHistory = async () => {
    try {
      const data = await fetchMatchHistory(player_id);


      setMH(data);
    } catch (error) {
      console.error("Failed to fetch player:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleUpdate = async () => {
    const player_region = regions.find(
      (region) => region.code === player.region
    );
    try {
      setUpdateLoading(true);
      const games = await fetchGames(
        player.riot_puuid,
        player.riot_acc_id,
        player_id,
        player_region.zone,
        (progress) => setProgress(progress) // Pass progress callback
      );

      if (games) {
        setUpdateLoading(false);
      }
    } catch (error) {
      console.error("Failed to update games:", error);
    }
  };

  useEffect(() => {
    getPlayerData();
    getMatchHistory();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {player ? (
        <div>Player Name: {player.name}</div>
      ) : (
        <div>No player data found.</div>
      )}
      <button onClick={handleUpdate}>Update</button>
      <br />
      {updateLoading && (
        <div>
          <LinearProgress variant="determinate" value={parseInt(progress)} />
        </div>
      )}

      <div className="p-4"></div>

      {mH && mH.length > 0 ? (
        <div className="flex flex-col gap-2">
          {mH.map((game) => {
            const date = new Date(game.end_timestamp);
            const formattedDate = date.toLocaleDateString('en-GB');  // en-GB for "DD/MM/YYYY"

            return (
              <div key={game.id} className="bg-zinc-800 max-w-[800px] p-2 flex gap-2">
                <div>{formattedDate}</div>
                <div>teste</div>
                <div>asd</div>
                <div>ggg</div>
              </div>
            );
          })}
        </div>
      ) : (
        <>No match history</>
      )}


    </div>
  );
};

export default MatchHistory;
