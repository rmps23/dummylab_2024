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
  const [playerPuuid, setPlayerPuuid] = useState();
  const [opgg, setOPGG] = useState();
  const [matchDetails, setMatchDetails] = useState([]);
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
        generateOpggLink(player.riot_id);
      } else {
        console.log("No player found");
      }
    } catch (error) {
      console.error("Error fetching player info:", error);
    }
  };

  const getPlayerPuuidInfo = async (riotID) => {
    setLoading(true);
    try {
      const puuidData = await getPlayerRiotInfo(riotID, playerID); // Pass playerID here
      setPlayerPuuid(puuidData);
      if (puuidData.matchesData) {
        const filteredMatches = puuidData.matchesData.filter(
          (match) => match.queueId === 420
        );
        setMatchDetails(filteredMatches);
      }
    } catch (error) {
      console.error("Error fetching player PUUID:", error);
    }
    setLoading(false);
  };
  const handleUpdate = () => {
    if (playerInfo) {
      getPlayerPuuidInfo(playerInfo.riot_id);
    }
  };

  const renderPlayerPuuid = (puuid) => {
    // Check if puuid is not undefined and is an array
    if (!puuid || !Array.isArray(puuid)) return null;

    return (
      <div>
        {puuid.map(
          (
            puuidItem,
            index // Use a different variable name for individual puuid item
          ) => (
            <div key={index}>
              <p>{puuidItem.puuid}</p> // Access puuid property of individual
              item
            </div>
          )
        )}
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
              <Link
                href={generateOpggLink(playerInfo.riot_id)}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 p-1 rounded-sm hover:"
              >
                OP.GG
              </Link>
              <Button
                variant="contained"
                size="small"
                sx={{ fontSize: "0.7rem", fontWeight: "600" }}
                onClick={handleUpdate}
              >
                {loading ? <CircularProgress size={24} /> : "Update"}
              </Button>
            </div>
          </div>
        ) : (
          <p className="flex justify-center">
            <CircularProgress />
          </p>
        )}
        {playerPuuid && renderPlayerPuuid(playerPuuid)}
        {matchDetails.length > 0 && (
          <div>
            <h2>Match Details</h2>
            {matchDetails.map((match, index) => (
              <div key={index}>
                <p>Match ID: {match.matchId}</p>
                <pre>{JSON.stringify(match.timelineData, null, 2)}</pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerInfo;
