"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/navbar/Navbar";
import { getPlayerByID, getPlayerRiotInfo } from "@/functions/Players";
import { useParams } from "next/navigation";
import { CircularProgress } from "@mui/material";

const PlayerInfo = () => {
  const params = useParams();
  const [playerID, setPlayerID] = useState();
  const [playerInfo, setPlayerInfo] = useState();
  const [playerPuuid, setPlayerPuuid] = useState();
  const [opgg, setOPGG] = useState();

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
        generateOpggLink(player.riot_id);
      } else {
        console.log('No player found');
      }
    } catch (error) {
      console.error("Error fetching player info:", error);
    }
  };

  const getPlayerPuuidInfo = async (riotID) => {
    try {
      const puuidData = await getPlayerRiotInfo(riotID);
      setPlayerPuuid(puuidData);
    } catch (error) {
      console.error("Error fetching player PUUID:", error);
    }
  };

  const renderPlayerPuuid = (puuid) => {
    if (!puuid) return null;
    console.log(puuid);

    return (
      <div>
        {puuid.map((puuid, index) => (<div key={index}> <p>{puuid.puuid}</p> </div>))}
      </div>
    );
  };

  const generateOpggLink = (riotId) => {
    const formattedRiotId = riotId.replace("#", "-");

    return `https://www.op.gg/summoners/euw/${formattedRiotId}`;
  };

  return (
    <div>
      <Navbar />
      <div className="max-w-[1440px] px-5 py-10 mx-auto">
        {playerInfo ? (
          <div className="bg-zinc-900 border-b border-teal-500">
            <p>Name: {playerInfo.name}</p>
            <img src={playerInfo.role.image_link} alt={playerInfo.role.name} />
          </div>
        ) : (
          <p><CircularProgress /></p>
        )}
        {playerPuuid && renderPlayerPuuid(playerPuuid)}
      </div>
    </div>
  );
};

export default PlayerInfo;
