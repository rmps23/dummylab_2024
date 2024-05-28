"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/navbar/Navbar";
import { useParams } from "next/navigation";
import { updateStats, getSupaStats } from "@/functions/UpdateStats";
import { CircularProgress } from "@mui/material";

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
  const kill_part = dataStat?.kill_part / dataStat?.total_games;

  return (
    <div>
      <Navbar />
      <div className="pl-72 pr-8 py-8">
        <div className="flex items-center gap-2 mb-4">
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
        <div className="flex gap-10">
          <div className="bg-neutral-800 flex w-full p-6 relative overflow-hidden rounded-md">
            <span className="absolute -bottom-4 right-0 text-7xl text-teal-300/50">
              GAMES
            </span>
            <p className="text-5xl text-neutral-200">{dataStat?.total_games}</p>
          </div>
          <div className="bg-neutral-800 flex w-full p-6 relative overflow-hidden rounded-md">
            <span className="absolute -bottom-4 right-0 text-7xl text-teal-300/50">
              KDA
            </span>
            <p className="text-5xl text-neutral-200">{kda.toFixed(1)}</p>
          </div>
          <div className="bg-neutral-800 flex w-full p-6 relative overflow-hidden rounded-md">
            <span className="absolute -bottom-4 right-0 text-7xl text-teal-300/50">
              K/P
            </span>
            <p className="text-5xl text-neutral-200">{kill_part.toFixed(1)}</p>
          </div>
          <div className="bg-neutral-800 flex w-full p-6 relative overflow-hidden rounded-md">
            <span className="absolute -bottom-4 right-0 text-7xl text-teal-300/50">
              KILLS
            </span>
            <p className="text-5xl text-neutral-200">{dataStat?.kills}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;
