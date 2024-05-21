"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";

import Navbar from "@/components/navbar/Navbar";
import Image from "next/image";

import { getPlayerByID } from "@/functions/Players";
import { CircularProgress } from "@mui/material";
import { Button } from "@mui/material";

const PlayerInfo = () => {
  const params = useParams();
  const [playerID, setPlayerID] = useState();
  const [playerInfo, setPlayerInfo] = useState();
  const [PlayerSupaData, setPlayerSupaData] = useState([]);
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
      const player = data[0];
      setPlayerInfo(player);
    } catch (error) {
      console.error("Error fetching player info:", error);
    }
  };
  const fetchSupaPlayerData = async (playerID) => {
    try {
      const data = await getSupaPlayerData(playerID);
      setPlayerSupaData(data);
    } catch (error) {
      console.error("Error fetching Supa player data:", error);
    }
  };

  const getPlayerAPIInfo = async (riotID) => {
    setLoading(true);
    try {
      const playerData = await getPlayerRiotInfo(riotID, playerID);
      setPlayerInfo((prevInfo) => ({
        ...prevInfo,
        riotData: playerData,
      }));
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
                height={25} // Changed height to 25 to maintain aspect ratio
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
                // onClick={handleUpdate}
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
          {PlayerSupaData && PlayerSupaData.length > 0
            ? PlayerSupaData.map((supaData, index) => (
                <div
                  className="bg-gradient-to-r from-teal-500/30 border border-teal-500/30 p-4"
                  key={index}
                ></div>
              ))
            : "loading"}
        </div>
      </div>
    </div>
  );
};

export default PlayerInfo;
