"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/navbar/Navbar";
import { useParams } from "next/navigation";
import { updateStats, getSupaStats } from "@/functions/UpdateStats";
import { CircularProgress } from "@mui/material";
import lol_champions from "@/lol_champions.json";
import Image from "next/image";

const Stats = () => {
  const params = useParams();
  const player_id = params.PlayerID;
  const [dataStat, setDataStat] = useState();
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    await updateStats(player_id);
    const updatedStats = await getSupaStats(player_id);
    setDataStat(updatedStats[0]); // Assuming updatedStats is an array, so accessing the first item
    setLoading(false);
  };

  const fetchStats = async () => {
    const data_stats = await getSupaStats(player_id);
    setDataStat(data_stats[0]); // Assuming data_stats is an array, so accessing the first item
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const originalDateTime = dataStat?.updated_at;
  const dateTime = originalDateTime ? new Date(originalDateTime) : null;

  const datePart = dateTime ? dateTime.toISOString().split("T")[0] : "";
  const timePart = dateTime
    ? dateTime.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
    : "";
  const simplifiedDateTime = `${datePart} - ${timePart}`;

  const kda = (dataStat?.kills + dataStat?.assists) / dataStat?.deaths;
  const kill_part = (dataStat?.kill_part / dataStat?.total_games) * 100;

  const win_ratio = (dataStat?.win / dataStat?.total_games) * 100

  console.log(dataStat);

  return (
    <div>
      <Navbar />
      <div className="pl-72 pr-8 py-8">
        <div className="flex items-center gap-2 mb-8">
          <button
            onClick={handleUpdate}
            className="bg-teal-500 text-neutral-950 uppercase text-sm font-bold py-1 px-4 rounded-md"
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={10} color="inherit" />
            ) : (
              "Update"
            )}
          </button>
          <span className="text-xs text-neutral-400">
            Last Update: {simplifiedDateTime}
          </span>
        </div>
        <div className="flex gap-10 mb-10">
          <div className="bg-neutral-800 flex w-full p-6 relative overflow-hidden rounded-md">
            <span className="absolute -bottom-1 right-0 text-5xl text-teal-500/20">
              GAMES
            </span>
            <p className="text-5xl text-neutral-200">{dataStat?.total_games}</p>
          </div>
          <div className="bg-neutral-800 flex w-full p-6 relative overflow-hidden rounded-md">
            <span className="absolute -bottom-1 right-0 text-5xl text-teal-500/20">
              KDA
            </span>
            <p className="text-5xl text-neutral-200">{kda.toFixed(1)}</p>
          </div>
          <div className="bg-neutral-800 flex w-full p-6 relative overflow-hidden rounded-md">
            <span className="absolute -bottom-1 right-0 text-5xl text-teal-500/20">
              K/P
            </span>
            <p className="text-5xl text-neutral-200">{kill_part.toFixed(0)}%</p>
          </div>
          <div className="bg-neutral-800 flex w-full p-6 relative overflow-hidden rounded-md">
            <span className="absolute -bottom-1 right-0 text-5xl text-teal-500/20">
              W/R
            </span>
            <p className="text-5xl text-neutral-200">{win_ratio.toFixed(0)}%</p>
          </div>
        </div>
        <div className="flex gap-10">
          <div className="bg-neutral-800 flex flex-col gap-4 w-full p-6 relative overflow-hidden rounded-md">
            <div>
              Champions Played
            </div>
            {dataStat?.championids.map((champion, index) => (
              <div key={index} className="flex gap-4 items-center">
                <Image
                  src={`https://fpwrnfdqzvztmakmrdnc.supabase.co/storage/v1/object/public/champions_icons/${lol_champions.data[champion.championName].image.full}`}
                  height={50}
                  width={50}
                  className="scale-110"
                  alt=""
                ></Image>
                <p className="text-2xl text-neutral-200">{champion.count} times</p>
              </div>
            ))}
          </div>
          <div className="bg-neutral-800 flex w-full p-6 relative overflow-hidden rounded-md">
            teste
          </div>
          <div className="bg-neutral-800 flex w-full p-6 relative overflow-hidden rounded-md">
            teste
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;
