"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/navbar/Navbar";
import { getPlayerByID, getPlayerRiotInfo } from "@/functions/Players";
import { useParams } from "next/navigation";
import { CircularProgress } from "@mui/material";
import Image from "next/image";
import { Button } from "@mui/material";
import Link from "next/link";

const PlayerInfo = () => {
  const params = useParams();
  const [playerID, setPlayerID] = useState();
  const [playerInfo, setPlayerInfo] = useState();
  const [playerData, setPlayerData] = useState();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (params.PlayerID) {
      setPlayerID(params.PlayerID);
      getPlayerInfo(params.PlayerID);
    }
  }, [params.PlayerID]);

  const getPlayerInfo = async (playerID) => {
    try {
      const data = await getPlayerByID(playerID);
      if (data && data.length > 0) {
        const player = data[0];
        setPlayerInfo(player);
      } else {
        console.log("No player found");
      }
    } catch (error) {
      console.error("Error fetching player info:", error);
    }
  };

  const getPlayerAPIInfo = async (riotID) => {
    setLoading(true);
    try {
      const playerData = await getPlayerRiotInfo(riotID, playerID);
      setPlayerData(playerData);
    } catch (error) {
      console.error("Error fetching player PUUID:", error);
    }
    setLoading(false);
  };

  const handleUpdate = () => {
    if (playerInfo) {
      getPlayerAPIInfo(playerInfo.riot_id);
    }
  };


  return (
    <div>
      <Navbar />
      <div className="max-w-[1440px] px-5 py-10 mx-auto">
        {playerInfo ? (
          <div className="bg-zinc-900 border-b border-teal-500 flex justify-between gap-3 p-4 rounded-md items-center">
            <div className="flex gap-3">
              <Image
                src={playerInfo.role.image_link}
                alt={playerInfo.role.name}
                width={25}
                height={0}
              ></Image>
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
                {loading ? <CircularProgress size={24} color="warning" /> : "Update"}
              </Button>
            </div>
          </div>
        ) : (
          <p className="flex justify-center">
            <CircularProgress />
          </p>
        )}
      </div>
    </div>
  );
};

export default PlayerInfo;
