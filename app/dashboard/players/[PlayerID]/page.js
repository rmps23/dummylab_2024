"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/navbar/Navbar";
import { getPlayerByID, getPlayerPUUID } from "@/functions/Players";
import { useParams } from "next/navigation";

const PlayerInfo = () => {
  const params = useParams();
  const [playerID, setPlayerID] = useState();
  const [playerInfo, setPlayerInfo] = useState();
  const [playerPuuid, setPlayerPuuid] = useState();

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
        getPlayerPuuidInfo(player.riot_id);
      } else {
        console.log('No player found');
      }
    } catch (error) {
      console.error("Error fetching player info:", error);
    }
  };

  const getPlayerPuuidInfo = async (riotID) => {
    try {
      const puuid = await getPlayerPUUID(riotID);
      setPlayerPuuid(puuid);
      console.log(puuid);
    } catch (error) {
      console.error("Error fetching player matches:", error);
    }
  };

  const renderPlayerInfo = (info) => {
    if (!info) return null;

    const [riotName, riotNumber] = info.riot_id.split("#");

    return (
      <div>
        <p>Name: {info.name}</p>
        <p>Riot Name: {riotName}</p>
        <p>Riot ID: {riotNumber}</p>
        <p>Role: {info.role.name}</p>
        <img src={info.role.image_link} alt={info.role.name} />
      </div>
    );
  };

  return (
    <div>
      <Navbar />
      <div className="max-w-[1440px] px-5 py-10 mx-auto">
        {playerInfo ? renderPlayerInfo(playerInfo) : <p>Loading player information...</p>}
      </div>
    </div>
  );
};

export default PlayerInfo;
