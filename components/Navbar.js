"use client";

import { userStore } from "@/store/userStore";
import Link from "next/link";
import Logout from "./auth/Logout";
import { usePathname } from "next/navigation";
import {
  FaChartSimple,
  FaCalendar,
  FaShield,
  FaUsers,
  FaGear,
} from "react-icons/fa6";
import Image from "next/image";
import { useEffect } from "react";

const Navbar = () => {
  const path = usePathname();
  const getUser = userStore((state) => state.getUser);

  useEffect(() => {
    getUser();
  }, [getUser]);

  return (
    <>
      <div className="w-60 sm:flex flex-col justify-between gap-4 px-4 pb-4 pt-10 items-center h-screen border-r border-zinc-900 hidden">
        <div className="w-full flex flex-col gap-4 items-center">
          <div className="mb-4">
            <Link href="/dashboard">
              <Image
                src="/assets/logos/dummylab_logo.png"
                width={140}
                height={0}
                alt=""
                priority
              ></Image>
            </Link>
          </div>
          <div className="flex flex-col gap-2 w-full">
            <Link
              href="/dashboard/teams"
              className={`flex items-center gap-4 w-full px-3 py-1 rounded-md ${path == "/dashboard/teams"
                ? "bg-zinc-900 text-zinc-100"
                : "bg-zinc-950 text-zinc-400"
                } hover:bg-zinc-900`}
            >
              <FaShield></FaShield> <span className="pt-[1px]">Teams</span>
            </Link>
            <Link
              href="/dashboard/players"
              className={`flex items-center gap-4 w-full px-3 py-1 rounded-md ${path == "/dashboard/players"
                ? "bg-zinc-900 text-zinc-100"
                : "bg-zinc-950 text-zinc-400"
                } hover:bg-zinc-900`}
            >
              <FaUsers></FaUsers> <span className="pt-[1px]">Players</span>
            </Link>
            <Link
              href="/dashboard/analytics"
              className={`flex items-center gap-4 w-full px-3 py-1 rounded-md ${path == "/dashboard/analytics"
                ? "bg-zinc-900 text-zinc-100"
                : "bg-zinc-950 text-zinc-400"
                } hover:bg-zinc-900`}
            >
              <FaChartSimple></FaChartSimple>{" "}
              <span className="pt-[1px]">Analytics</span>
            </Link>
            <Link
              href="/dashboard/schedule"
              className={`flex items-center gap-4 w-full px-3 py-1 rounded-md ${path == "/dashboard/schedule"
                ? "bg-zinc-900 text-zinc-100"
                : "bg-zinc-950 text-zinc-400"
                } hover:bg-zinc-900`}
            >
              <FaCalendar></FaCalendar> <span className="pt-[1px]">Schedule</span>
            </Link>
          </div>
        </div>
        <div className="w-full flex gap-4 items-center">
          <Link
            href="/dashboard/settings"
            className={`flex items-center gap-4 w-2/3 h-8 px-3 rounded-md ${path == "/dashboard/settings"
              ? "bg-zinc-900 text-zinc-100"
              : "bg-zinc-950 text-zinc-400"
              } hover:bg-zinc-900`}
          >
            <FaGear></FaGear> <span className="pt-[1px]">Settings</span>
          </Link>
          <Logout></Logout>
        </div>
      </div>

      <div className="sm:hidden flex fixed bottom-0 w-full p-2 gap-2 bg-zinc-900">
        <Link
          href="/dashboard/teams"
          className={`flex flex-col items-center gap-1 w-full rounded-md text-xs ${path == "/dashboard/teams" ? "text-zinc-100" : "text-zinc-400"
            } hover:bg-zinc-900`}
        >
          <FaShield></FaShield> <span className="pt-[1px]">Teams</span>
        </Link>
        <Link
          href="/dashboard/players"
          className={`flex flex-col items-center gap-1 w-full rounded-md text-xs ${path == "/dashboard/players" ? "text-zinc-100" : "text-zinc-400"
            } hover:bg-zinc-900`}
        >
          <FaUsers></FaUsers> <span className="pt-[1px]">Players</span>
        </Link>
        <Link
          href="/dashboard/analytics"
          className={`flex flex-col items-center gap-1 w-full rounded-md text-xs ${path == "/dashboard/analytics" ? "text-zinc-100" : "text-zinc-400"
            } hover:bg-zinc-900`}
        >
          <FaChartSimple></FaChartSimple>{" "}
          <span className="pt-[1px]">Analytics</span>
        </Link>
        <Link
          href="/dashboard/schedule"
          className={`flex flex-col items-center gap-1 w-full rounded-md text-xs ${path == "/dashboard/schedule" ? "text-zinc-100" : "text-zinc-400"
            } hover:bg-zinc-900`}
        >
          <FaCalendar></FaCalendar> <span className="pt-[1px]">Schedule</span>
        </Link>
        <Link
          href="/dashboard/settings"
          className={`flex flex-col items-center gap-1 w-full rounded-md text-xs ${path == "/dashboard/settings" ? "text-zinc-100" : "text-zinc-400"
            } hover:bg-zinc-900`}
        >
          <FaGear></FaGear> <span className="pt-[1px]">Settings</span>
        </Link>
        <Logout></Logout>
      </div>
    </>
  );
};

export default Navbar;
