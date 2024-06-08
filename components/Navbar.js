"use client";

import React from "react";
import { userStore } from "@/store/userStore";
import TeamSelector from "./TeamSelector";
import Link from "next/link";
import Logout from "./auth/Logout";
import { useParams } from "next/navigation";
import { FaChartSimple, FaGear, FaHouse, FaUsersGear } from "react-icons/fa6";
import { FaCalendar, FaStar } from "react-icons/fa";

const Navbar = () => {
  const user = userStore((state) => state.user);
  const params = useParams();
  const team_id = params.team_id;

  return (
    <div className="w-72 bg-neutral-900 px-4 py-6 h-screen flex flex-col justify-between">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-center flex-col">
          <Link href="/dashboard" className="flex items-center gap-1 text-2xl">
            DUMMY
            <span className="bg-cyan-400 text-neutral-950 px-1 rounded-sm font-bold">
              LAB
            </span>
          </Link>
        </div>
        <div className="bg-gradient-to-br from-cyan-600 to-cyan-800 p-2 rounded-md max-h-48 overflow-y-auto">
          <TeamSelector user={user} />
        </div>
        <div>
          <p className="pb-1 mb-4 border-b border-zinc-700 text-xs uppercase text-zinc-300">
            Menu
          </p>
          {team_id ? (
            <div className="flex flex-col gap-2">
              <Link
                href={`/dashboard/${team_id}`}
                className="flex gap-2 items-center py-2 px-2 bg-zinc-800 text-sm rounded-md hover:bg-zinc-700"
              >
                <FaHouse /> <span>Home</span>
              </Link>
              <Link
                href={`/dashboard/${team_id}`}
                className="flex gap-2 items-center py-2 px-2 bg-zinc-800 text-sm rounded-md hover:bg-zinc-700"
              >
                <FaGear /> <span>Team Management</span>
              </Link>
              <Link
                href={`/dashboard/${team_id}`}
                className="flex gap-2 items-center py-2 px-2 bg-zinc-800 text-sm rounded-md hover:bg-zinc-700"
              >
                <FaChartSimple /> <span>Analytics</span>
              </Link>
              <Link
                href={`/dashboard/${team_id}`}
                className="flex gap-2 items-center py-2 px-2 bg-zinc-800 text-sm rounded-md hover:bg-zinc-700"
              >
                <FaCalendar /> <span>Schedule</span>
              </Link>
              <Link
                href={`/dashboard/${team_id}`}
                className="flex gap-2 items-center py-2 px-2 bg-zinc-800 text-sm rounded-md hover:bg-zinc-700"
              >
                <FaStar /> <span>Champion Pool</span>
              </Link>
            </div>
          ) : (
            <div className="p-2 bg-zinc-300 text-zinc-950 rounded-md flex items-center justify-center">
              <p className="text-sm">Select a team to start managing it!</p>
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-4">
        <Link
          href={`/settings`}
          className="flex w-2/3 bg-zinc-800 rounded-md items-center justify-center py-2"
        >
          <FaGear />
        </Link>
        <Logout></Logout>
      </div>
    </div>
  );
};

export default Navbar;
