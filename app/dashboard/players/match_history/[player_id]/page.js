"use client";

import React, { useState, useEffect } from "react";
import { fetchPlayer } from "@/hooks/players/fetchPlayer";
import { fetchGames } from "@/hooks/players/fetchGames";
import { useParams } from "next/navigation";
import { regionStore } from "@/store/regionStore";

const MatchHistory = () => {
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);

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
        player_region.zone
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
      <br></br>
      {updateLoading ? "sim" : "nao"}
    </div>
  );
};

export default MatchHistory;
