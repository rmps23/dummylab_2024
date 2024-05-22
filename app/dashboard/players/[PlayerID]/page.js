"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";

import Navbar from "@/components/navbar/Navbar";
import Image from "next/image";

import { getPlayerByID } from "@/functions/Players";
import { getSupaPlayerData } from "@/functions/GameList";
import { CircularProgress, Button } from "@mui/material";

const PlayerInfo = () => {
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [playerInfo, setPlayerInfo] = useState(null);

  useEffect(() => {
    function_GetPlayerInfo(params.PlayerID);
    function_GetSupaPlayerData(params.PlayerID);
  }, [params.PlayerID]);

  const function_GetSupaPlayerData = async (player_id) => {
    const supa_player_data = await getSupaPlayerData(player_id);
    // You might want to do something with supa_player_data here
  };

  const function_GetPlayerInfo = async (player_id) => {
    setLoading(true);
    const player_info = await getPlayerByID(player_id);
    console.log(player_info);
    setPlayerInfo(player_info);
    setLoading(false);
  };

  const handleUpdate = () => {
    if (playerInfo) {
      // Call update function here
    }
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
                  height={25} // Changed height to 25 to maintain aspect ratio
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
          {/* Additional player information can be rendered here */}
        </div>
      </div>
    </div>
  );
};

export default PlayerInfo;
