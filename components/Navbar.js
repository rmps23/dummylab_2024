"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { FaChartSimple, FaCalendar, FaShield, FaUsers, FaGear, FaHouse } from "react-icons/fa6";
import Logout from "./auth/Logout";
import { teamStore } from "@/store/teamStore";

const links = [
  { href: "/dashboard", label: "Home", icon: FaHouse, exact: true },
  { href: "/dashboard/teams", label: "Teams", icon: FaShield },
  { href: "/dashboard/players", label: "Players", icon: FaUsers },
  { href: "/dashboard/schedule", label: "Schedule", icon: FaCalendar },
  { href: "/dashboard/analytics", label: "Analytics", icon: FaChartSimple },
  { href: "/dashboard/settings", label: "Settings", icon: FaGear },
];

export function TeamSwitcher() {
  const { teams, activeTeamId, setActiveTeam } = teamStore();
  if (teams.length === 0) return null;
  return (
    <select
      aria-label="Active team"
      value={activeTeamId ?? ""}
      onChange={(e) => setActiveTeam(Number(e.target.value))}
      className="w-full bg-zinc-900 text-zinc-200 text-sm rounded-md p-2 outline-none cursor-pointer"
    >
      {teams.map((team) => (
        <option key={team.id} value={team.id}>
          {team.name}
        </option>
      ))}
    </select>
  );
}

const Navbar = () => {
  const path = usePathname();
  const isActive = (l) => (l.exact ? path === l.href : path.startsWith(l.href));

  return (
    <>
      <div className="w-60 sm:flex flex-col justify-between gap-4 px-4 pb-4 pt-10 items-center h-screen border-r border-zinc-900 hidden shrink-0">
        <div className="w-full flex flex-col gap-4 items-center">
          <Link href="/dashboard" className="mb-2">
            <Image src="/assets/logos/dummylab_logo.png" width={140} height={40} alt="DummyLab" priority style={{ height: "auto" }} />
          </Link>
          <TeamSwitcher />
          <nav className="flex flex-col gap-2 w-full">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`flex items-center gap-4 w-full px-3 py-1 rounded-md hover:bg-zinc-900 ${
                  isActive(l) ? "bg-zinc-900 text-zinc-100" : "bg-zinc-950 text-zinc-400"
                }`}
              >
                <l.icon /> <span className="pt-[1px]">{l.label}</span>
              </Link>
            ))}
          </nav>
        </div>
        <div className="w-full flex justify-end">
          <Logout />
        </div>
      </div>

      <nav className="sm:hidden flex fixed bottom-0 w-full p-2 gap-2 bg-zinc-900 z-40">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`flex flex-col items-center gap-1 w-full rounded-md text-xs ${
              isActive(l) ? "text-cyan-400" : "text-zinc-400"
            }`}
          >
            <l.icon /> <span>{l.label}</span>
          </Link>
        ))}
        <Logout />
      </nav>
    </>
  );
};

export default Navbar;
