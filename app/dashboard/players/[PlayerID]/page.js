"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/navbar/Navbar";
import Image from "next/image";
import { getPlayerByID } from "@/functions/Players";
import { getSupaPlayerData, getPlayerRiotInfo } from "@/functions/GameList";
import { CircularProgress, Button } from "@mui/material";
import champion_json from "@/lol_champions.json";
import GameInfoBar from "@/components/players/GameInfoBar";

const PlayerInfo = () => {
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [playerInfo, setPlayerInfo] = useState(null);
  const [playerSupaInfo, setPlayerSupaInfo] = useState([]);
  const [loadingSupaData, setLoadingSupaData] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    function_GetPlayerInfo(params.PlayerID);
    function_GetSupaPlayerData(params.PlayerID, 0, true); // Ensure reset on initial load
  }, [params.PlayerID]);

  const handleUpdate = async () => {
    setLoading(true);
    await function_GetPlayerMatchData(playerInfo.riot_id, params.PlayerID);
    await function_GetSupaPlayerData(params.PlayerID, 0, true); // Reset to first page on update
    setLoading(false);
  };

  const function_GetSupaPlayerData = async (player_id, page, reset = false) => {
    setLoadingSupaData(true);
    const supa_player_data = await getSupaPlayerData(player_id, page);
    if (reset) {
      setPlayerSupaInfo(supa_player_data);
      setPage(0);
    } else {
      setPlayerSupaInfo((prevData) => [...prevData, ...supa_player_data]);
    }
    setHasMore(supa_player_data.length === 10); // Check if there might be more data
    setLoadingSupaData(false);
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    function_GetSupaPlayerData(params.PlayerID, nextPage);
  };

  const function_GetPlayerInfo = async (player_id) => {
    const player_info = await getPlayerByID(player_id);
    setPlayerInfo(player_info);
  };

  const function_GetPlayerMatchData = async (RiotID, playerID) => {
    await getPlayerRiotInfo(RiotID, playerID);
  };

  return (
    <div>
      <Navbar />
      <div className="pl-72 pr-8 py-8">
        {playerInfo ? (
          <div className="bg-zinc-900 border-b border-teal-500 flex justify-between gap-3 p-4 rounded-md items-center">
            <div className="flex gap-3">
              {playerInfo.role && (
                <Image
                  src={playerInfo.role.image_link}
                  alt={playerInfo.role.name}
                  width={25}
                  height={25}
                />
              )}
              <p className="uppercase text-zinc-200 font-medium text-md">
                {playerInfo.name}
              </p>
            </div>
            <div>
              <Button
                variant="contained"
                size="small"
                sx={{ fontSize: "0.7rem", fontWeight: "600" }}
                onClick={handleUpdate}
              >
                {loading ? (
                  <CircularProgress size={24} color="warning" />
                ) : (
                  "Update"
                )}
              </Button>
            </div>
          </div>
        ) : (
          <p className="flex justify-center">
            <CircularProgress />
          </p>
        )}
      </div>
      <div className="pl-72 pr-8 py-8">
        <div className="flex flex-col gap-4">
          {playerSupaInfo.length > 0 ? (
            playerSupaInfo.map((game_data, index) => (
              <div key={index}>
                <GameInfoBar data={game_data} />
              </div>
            ))
          ) : (
            <div className="flex justify-center">
              {loadingSupaData ? (
                <CircularProgress />
              ) : (
                "There is no data from this player."
              )}
            </div>
          )}
          {hasMore && !loadingSupaData && (
            <div className="flex justify-center">
              <Button onClick={loadMore} variant="contained">
                Load More
              </Button>
            </div>
          )}
          {loadingSupaData && (
            <div className="flex justify-center">
              <CircularProgress />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayerInfo;
