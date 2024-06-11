"use client";

import React from "react";
import { userStore } from "@/store/userStore";
import TeamSelector from "./TeamSelector";
import Link from "next/link";
import Logout from "./auth/Logout";
import { useParams, usePathname } from "next/navigation";
import { FaChartSimple, FaGear, FaHouse, FaUsers } from "react-icons/fa6";
import { FaCalendar, FaStar } from "react-icons/fa";

const Navbar = () => {
  const user = userStore((state) => state.user);
  const params = useParams();
  const path = usePathname();
  const team_id = params.team_id;

  return (
    <>
      <div className="w-72 bg-neutral-900 px-4 py-6 h-screen sm:flex flex-col justify-between hidden">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-center flex-col">
            <Link
              href="/dashboard"
              className="flex items-center gap-1 text-2xl"
            >
              DUMMY
              <span className="bg-cyan-400 text-neutral-950 px-1 rounded-sm font-bold">
                LAB
              </span>
            </Link>
          </div>
          <div className="bg-gradient-to-br bg-zinc-800 shadow-lg shadow-zinc-950/30 p-2 rounded-md max-h-48 overflow-y-auto">
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
                  href={`/dashboard/${team_id}/management`}
                  className="flex gap-2 items-center py-2 px-2 bg-zinc-800 text-sm rounded-md hover:bg-zinc-700"
                >
                  <FaUsers /> <span>Team Management</span>
                </Link>
                <Link
                  href={`/dashboard/${team_id}/analytics`}
                  className="flex gap-2 items-center py-2 px-2 bg-zinc-800 text-sm rounded-md hover:bg-zinc-700"
                >
                  <FaChartSimple /> <span>Analytics</span>
                </Link>
                <Link
                  href={`/dashboard/${team_id}/schedule`}
                  className="flex gap-2 items-center py-2 px-2 bg-zinc-800 text-sm rounded-md hover:bg-zinc-700"
                >
                  <FaCalendar /> <span>Schedule</span>
                </Link>
                <Link
                  href={`/dashboard/${team_id}/champion_pool`}
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
      {team_id && (
        <>
          <div className="fixed p-2 bottom-0 bg-neutral-900 w-full flex gap-4 items-center justify-center sm:hidden">
            <Link
              href={`/dashboard/${team_id}`}
              className={`flex flex-1 items-center justify-center p-2 text-sm rounded-md ${
                path == `/dashboard/${team_id}` ? "bg-cyan-500" : "bg-zinc-800"
              }`}
            >
              <FaHouse />
            </Link>
            <Link
              href={`/dashboard/${team_id}/management`}
              className={`flex flex-1 items-center justify-center p-2 text-sm rounded-md ${
                path === `/dashboard/${team_id}/management`
                  ? "bg-cyan-500"
                  : "bg-zinc-800"
              }`}
            >
              <FaUsers />
            </Link>

            <Link
              href={`/dashboard/${team_id}/analytics`}
              className={`flex flex-1 items-center justify-center p-2 text-sm rounded-md ${
                path == `/dashboard/${team_id}/analytics`
                  ? "bg-cyan-500"
                  : "bg-zinc-800"
              }`}
            >
              <FaChartSimple />
            </Link>
            <Link
              href={`/dashboard/${team_id}/schedule`}
              className={`flex flex-1 items-center justify-center p-2 text-sm rounded-md ${
                path == `/dashboard/${team_id}/schedule`
                  ? "bg-cyan-500"
                  : "bg-zinc-800"
              }`}
            >
              <FaCalendar />
            </Link>
            <Link
              href={`/dashboard/${team_id}/champion_pool`}
              className={`flex flex-1 items-center justify-center p-2 text-sm rounded-md ${
                path == `/dashboard/${team_id}/champion_pool`
                  ? "bg-cyan-500"
                  : "bg-zinc-800"
              }`}
            >
              <FaStar />
            </Link>
          </div>
        </>
      )}
      <div className="sm:hidden flex flex-col justify-between fixed top-0 w-full bg-zinc-900 p-2">
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-1 text-sm rounded-md"
          >
            DUMMY
            <span className="bg-cyan-400 text-neutral-950 px-1 rounded-sm font-bold">
              LAB
            </span>
          </Link>
          <div className="flex gap-2">
            <Link
              href={`/dashboard/settings`}
              className={`flex items-center justify-center p-2 px-2 text-sm rounded-md ${
                path == `/dashboard/settings` ? "bg-cyan-500" : "bg-zinc-800"
              }`}
            >
              <FaGear />
            </Link>
            <Logout />
          </div>
        </div>
        <div>
          <TeamSelector user={user} />
        </div>
      </div>
    </>
  );
};

export default Navbar;
