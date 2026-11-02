"use client";

import { useEffect } from "react";
import { toast } from "react-toastify";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { userStore } from "@/store/userStore";
import { teamStore } from "@/store/teamStore";
import { playerStore } from "@/store/playerStore";
import { fetchTeams } from "@/hooks/teams";
import { fetchPlayers } from "@/hooks/players";

export default function DashboardLayout({ children }) {
  const getUser = userStore((s) => s.getUser);
  const setTeams = teamStore((s) => s.setTeams);
  const setPlayers = playerStore((s) => s.setPlayers);

  useEffect(() => {
    getUser();
    fetchTeams().then(setTeams).catch((e) => toast.error(`Could not load teams: ${e.message}`));
    fetchPlayers().then(setPlayers).catch((e) => toast.error(`Could not load players: ${e.message}`));
  }, [getUser, setTeams, setPlayers]);

  return (
    <div className="flex">
      <Navbar />
      <div className="w-full h-screen overflow-y-auto bg-zinc-900 pb-20 sm:pb-0 flex flex-col">
        <div className="flex-1">{children}</div>
        <Footer className="p-4" />
      </div>
    </div>
  );
}
