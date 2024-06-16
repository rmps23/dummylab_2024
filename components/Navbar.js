"use client";

import React from "react";
import { userStore } from "@/store/userStore";
import TeamSelector from "./TeamSelector";
import Link from "next/link";
import Logout from "./auth/Logout";
import { useParams, usePathname } from "next/navigation";
import { FaChartSimple, FaGear, FaHouse, FaUsers } from "react-icons/fa6";
import { FaCalendar, FaStar } from "react-icons/fa";
import Image from "next/image";

const Navbar = () => {
  const user = userStore((state) => state.user);
  const params = useParams();
  const path = usePathname();
  const team_id = params.team_id;

  return (
    <>
      <div className="w-60 flex flex-col gap-4 px-4 py-10 items-center h-screen border-r border-zinc-900">
        <div className="mb-4">
          <Link href="/dashboard">
            <Image
              src="/assets/logos/dummylab_logo.png"
              width={140}
              height={0}
            ></Image>
          </Link>
        </div>
        <div className="flex flex-col gap-2 w-full">
          {/* <Link
            href="/dashboard"
            className={`flex items-center gap-4 w-full px-3 py-1 rounded-md ${
              path == "/dashboard"
                ? "bg-zinc-900 text-zinc-100"
                : "bg-zinc-950 text-zinc-400"
            } hover:bg-zinc-900`}
          >
            <FaHouse></FaHouse> <span className="pt-[2px]">Dashboard</span>
          </Link> */}
          <Link
            href="/dashboard/teams"
            className={`flex items-center gap-4 w-full px-3 py-1 rounded-md ${
              path == "/dashboard/teams"
                ? "bg-zinc-900 text-zinc-100"
                : "bg-zinc-950 text-zinc-400"
            } hover:bg-zinc-900`}
          >
            <FaUsers></FaUsers> <span className="pt-[1px]">Teams</span>
          </Link>
        </div>
      </div>
    </>
  );
};

export default Navbar;
