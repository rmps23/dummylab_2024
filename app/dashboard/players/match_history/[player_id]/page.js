'use client'

import React, { useState, useEffect } from "react";
import { fetchPlayer } from "@/hooks/players/fetchPlayer";
import { fetchGames } from "@/hooks/players/fetchGames";
import { useParams } from "next/navigation";

const MatchHistory = () => {
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);

  const params = useParams();
  const player_id = params.player_id;

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

  const handleUpdate = async () => {
    try {
      const games = await fetchGames(player.riot_puuid, player.riot_acc_id, player_id);
      console.log(games); // Handle the games data as needed
    } catch (error) {
      console.error("Failed to update games:", error);
    }
  };


  useEffect(() => {
    getPlayerData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {player ? <div>Player Name: {player.name}</div> : <div>No player data found.</div>}
      <button onClick={handleUpdate}>Update</button>
    </div>
  );
};

export default MatchHistory;
