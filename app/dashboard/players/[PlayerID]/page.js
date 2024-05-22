"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/navbar/Navbar";
import Image from "next/image";
import { getPlayerByID } from "@/functions/Players";
import { getSupaPlayerData, getPlayerRiotInfo } from "@/functions/GameList";
import { CircularProgress, Button } from "@mui/material";
import champion_json from "@/lol_champions.json";

const PlayerInfo = () => {
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [playerInfo, setPlayerInfo] = useState(null);
  const [playerSupaInfo, setPlayerSupaInfo] = useState();
  const [champions, setChampions] = useState(champion_json.data);

  useEffect(() => {
    function_GetPlayerInfo(params.PlayerID);
    function_GetSupaPlayerData(params.PlayerID);
  }, [params.PlayerID]);

  const handleUpdate = () => {
    function_GetPlayerMatchData(playerInfo.riot_id, params.PlayerID);
  };

  const function_GetSupaPlayerData = async (player_id) => {
    const supa_player_data = await getSupaPlayerData(player_id);
    setPlayerSupaInfo(supa_player_data);
    console.log(supa_player_data);
    console.log(champions);
  };

  const function_GetPlayerInfo = async (player_id) => {
    setLoading(true);
    const player_info = await getPlayerByID(player_id);
    setPlayerInfo(player_info);
    setLoading(false);
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
          {playerSupaInfo && playerSupaInfo.length > 0
            ? playerSupaInfo.map((game_data, index) => {
                return (
                  <div
                    key={index}
                    className="bg-zinc-900 hover:bg-zinc-800 transition-all duration-100 rounded-md border-l-2 border-teal-500 flex justify-between"
                  >
                    <p>{game_data.game_time}m</p>
                    <div className="flex flex-col py-2 px-10">
                      <div className="flex gap-2 rounded-md justify-center">
                        <Image
                          src={`https://ddragon.leagueoflegends.com/cdn/14.10.1/img/champion/${game_data.blue_top.champ_name}.png`}
                          width={25}
                          height={25}
                          className="rounded-full border-2 border-teal-500"
                        ></Image>
                        <p className="flex items-center gap-2 text-teal-500 font-medium">
                          vs
                        </p>
                        <Image
                          src={`https://ddragon.leagueoflegends.com/cdn/14.10.1/img/champion/${game_data.red_top.champ_name}.png`}
                          width={25}
                          height={25}
                          className="rounded-full border-2 border-teal-500"
                        ></Image>
                      </div>
                      <div className="flex gap-2 rounded-md justify-center">
                        <Image
                          src={`https://ddragon.leagueoflegends.com/cdn/14.10.1/img/champion/${game_data.blue_jungler.champ_name}.png`}
                          width={25}
                          height={25}
                          className="rounded-full border-2 border-teal-500"
                        ></Image>
                        <p className="flex items-center gap-2 text-teal-500 font-medium">
                          vs
                        </p>
                        <Image
                          src={`https://ddragon.leagueoflegends.com/cdn/14.10.1/img/champion/${game_data.red_jungler.champ_name}.png`}
                          width={25}
                          height={25}
                          className="rounded-full border-2 border-teal-500"
                        ></Image>
                      </div>
                      <div className="flex gap-2 rounded-md justify-center">
                        <Image
                          src={`https://ddragon.leagueoflegends.com/cdn/14.10.1/img/champion/${game_data.blue_mid.champ_name}.png`}
                          width={25}
                          height={25}
                          className="rounded-full border-2 border-teal-500"
                        ></Image>
                        <p className="flex items-center gap-2 text-teal-500 font-medium">
                          vs
                        </p>
                        <Image
                          src={`https://ddragon.leagueoflegends.com/cdn/14.10.1/img/champion/${game_data.red_mid.champ_name}.png`}
                          width={25}
                          height={25}
                          className="rounded-full border-2 border-teal-500"
                        ></Image>
                      </div>
                      <div className="flex gap-2 rounded-md justify-center">
                        <Image
                          src={`https://ddragon.leagueoflegends.com/cdn/14.10.1/img/champion/${game_data.blue_bot.champ_name}.png`}
                          width={25}
                          height={25}
                          className="rounded-full border-2 border-teal-500"
                        ></Image>
                        <p className="flex items-center gap-2 text-teal-500 font-medium">
                          vs
                        </p>
                        <Image
                          src={`https://ddragon.leagueoflegends.com/cdn/14.10.1/img/champion/${game_data.red_bot.champ_name}.png`}
                          width={25}
                          height={25}
                          className="rounded-full border-2 border-teal-500"
                        ></Image>
                      </div>
                      <div className="flex gap-2 rounded-md justify-center">
                        <Image
                          src={`https://ddragon.leagueoflegends.com/cdn/14.10.1/img/champion/${game_data.blue_sup.champ_name}.png`}
                          width={25}
                          height={25}
                          className="rounded-full border-2 border-teal-500"
                        ></Image>
                        <p className="flex items-center gap-2 text-teal-500 font-medium">
                          vs
                        </p>
                        <Image
                          src={`https://ddragon.leagueoflegends.com/cdn/14.10.1/img/champion/${game_data.red_sup.champ_name}.png`}
                          width={25}
                          height={25}
                          className="rounded-full border-2 border-teal-500"
                        ></Image>
                      </div>
                    </div>
                  </div>
                );
              })
            : "There is no data from this player."}
        </div>
      </div>
    </div>
  );
};

export default PlayerInfo;
