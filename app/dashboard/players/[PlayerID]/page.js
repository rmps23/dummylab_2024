"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/navbar/Navbar";
import { getPlayerByID } from "@/functions/Players";
import { useParams } from "next/navigation";

const PlayerInfo = () => {
  const params = useParams();
  const [playerID, setPlayerID] = useState();
  const [playerInfo, setPlayerInfo] = useState();

  useEffect(() => {
    if (params.PlayerID) {
      setPlayerID(params.PlayerID);
      getPlayerInfo(params.PlayerID);
    }
  }, [params.PlayerID]);

  useEffect(() => {
    if (playerInfo) {
      console.log(playerInfo);
    }
  }, [playerInfo]);

  const getPlayerInfo = async (playerID) => {
    try {
      const data = await getPlayerByID(playerID);
      setPlayerInfo(data[0]);
    } catch (error) {
      console.error("Error fetching player info:", error);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="max-w-[1440px] px-5 py-10 mx-auto">
        {playerInfo ? (
          <div>
            {/* Render playerInfo details here */}
            <p>{playerInfo.name}</p>
            <p>{playerInfo.riot_id}</p>
            {/* Add more fields as necessary */}
          </div>
        ) : (
          <p>Loading player information...</p>
        )}
      </div>
    </div>
  );
};

export default PlayerInfo;
