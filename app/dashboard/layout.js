"use client";

import "react-tooltip/dist/react-tooltip.css";
import { useEffect } from "react";
import { userStore } from "@/store/userStore";
import { teamStore } from "@/store/teamStore";
import Navbar from "@/components/Navbar";

export default function DashboardLayout({ children }) {
  const getUser = userStore((state) => state.getUser);
  const user = userStore((state) => state.user);
  const getTeams = teamStore((state) => state.getTeams);

  useEffect(() => {
    getUser();
  }, [getUser]);

  useEffect(() => {
    if (user && user.id) {
      getTeams(user.id);
    }
  }, [user, getTeams]);

  return (
    <div className="flex">
      <Navbar />
      <div className="w-full h-screen overflow-y-scroll p-4">{children}</div>
    </div>
  );
}
