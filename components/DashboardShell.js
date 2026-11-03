"use client";

import { useEffect } from "react";
import { toast } from "react-toastify";
import { Sidebar, MobileChrome } from "@/components/Navbar";
import Footer from "@/components/Footer";
import { userStore } from "@/store/userStore";
import { teamStore } from "@/store/teamStore";
import { playerStore } from "@/store/playerStore";
import { featureStore } from "@/store/featureStore";
import { fetchTeams } from "@/hooks/teams";
import { fetchPlayers } from "@/hooks/players";

export default function DashboardShell({ children }) {
  const getUser = userStore((s) => s.getUser);
  const setTeams = teamStore((s) => s.setTeams);
  const setPlayers = playerStore((s) => s.setPlayers);
  const loadFeatures = featureStore((s) => s.load);

  useEffect(() => {
    getUser();
    loadFeatures();
    fetchTeams().then(setTeams).catch((e) => toast.error(`Could not load teams: ${e.message}`));
    fetchPlayers().then(setPlayers).catch((e) => toast.error(`Could not load players: ${e.message}`));
  }, [getUser, loadFeatures, setTeams, setPlayers]);

  return (
    <div className="flex">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[60] focus:rounded-md focus:bg-cyan-500 focus:px-3 focus:py-2 focus:text-zinc-950"
      >
        Skip to content
      </a>
      <Sidebar />
      <div className="flex h-dvh w-full flex-col overflow-y-auto">
        <MobileChrome />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer className="p-4 pb-20 sm:pb-4" />
      </div>
    </div>
  );
}
