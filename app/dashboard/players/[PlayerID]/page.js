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
  const [playerSupaInfo, setPlayerSupaInfo] = useState();
  const [loadingSupaData, setLoadingSupaData] = useState(false);
  const [champions, setChampions] = useState(champion_json.data);

  useEffect(() => {
    function_GetPlayerInfo(params.PlayerID);
    function_GetSupaPlayerData(params.PlayerID);
  }, [params.PlayerID]);

  const handleUpdate = async () => {
    setLoading(true);
    await function_GetPlayerMatchData(playerInfo.riot_id, params.PlayerID);
    await function_GetSupaPlayerData(params.PlayerID);
    setLoading(false);
  };

  const function_GetSupaPlayerData = async (player_id) => {
    setLoadingSupaData(true);
    const supa_player_data = await getSupaPlayerData(player_id);
    setPlayerSupaInfo(supa_player_data);
    setLoadingSupaData(false);
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
      <div className="max-w-[1440px] px-5 py-10 mx-auto">
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
      <div className="max-w-[1440px] px-5 mx-auto">
        <div className="flex flex-col gap-4">
          {loadingSupaData ? (
            <div className="flex justify-center">
              <CircularProgress />
            </div>
          ) : playerSupaInfo && playerSupaInfo.length > 0 ? (
            playerSupaInfo.map((game_data, index) => {
              return (
                <div key={index}>
                  <GameInfoBar data={game_data}></GameInfoBar>
                </div>
              );
            })
          ) : (
            "There is no data from this player."
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayerInfo;
