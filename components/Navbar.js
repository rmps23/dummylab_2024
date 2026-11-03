"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { FaChartSimple, FaCalendar, FaShield, FaUsers, FaGear, FaHouse } from "react-icons/fa6";
import Logout from "./auth/Logout";
import { teamStore } from "@/store/teamStore";

const links = [
  { href: "/dashboard", label: "Home", icon: FaHouse, exact: true },
  { href: "/dashboard/schedule", label: "Schedule", icon: FaCalendar },
  { href: "/dashboard/players", label: "Players", icon: FaUsers },
  { href: "/dashboard/analytics", label: "Analytics", icon: FaChartSimple },
  { href: "/dashboard/teams", label: "Teams", icon: FaShield },
];
const settings = { href: "/dashboard/settings", label: "Settings", icon: FaGear };

export function TeamSwitcher({ className = "" }) {
  const { teams, activeTeamId, setActiveTeam } = teamStore();
  if (teams.length === 0) return null;
  return (
    <select
      aria-label="Active team"
      value={activeTeamId ?? ""}
      onChange={(e) => setActiveTeam(Number(e.target.value))}
      className={`w-full cursor-pointer rounded-md bg-zinc-900 p-2 text-sm text-zinc-200 outline-none ${className}`}
    >
      {teams.map((team) => (
        <option key={team.id} value={team.id}>
          {team.name}
        </option>
      ))}
    </select>
  );
}

function useActive() {
  const path = usePathname();
  return (l) => (l.exact ? path === l.href : path.startsWith(l.href));
}

// Desktop sidebar.
export function Sidebar() {
  const isActive = useActive();
  const all = [...links, settings];

  return (
    <aside className="hidden h-dvh w-60 shrink-0 flex-col items-center justify-between gap-4 border-r border-zinc-800 px-4 pb-4 pt-10 sm:flex">
      <div className="flex w-full flex-col items-center gap-4">
        <Link href="/dashboard" className="mb-2">
          <Image src="/assets/logos/dummylab_logo.png" width={140} height={33} alt="DummyLab" priority className="h-auto w-[140px]" />
        </Link>
        <TeamSwitcher />
        <nav aria-label="Main" className="flex w-full flex-col gap-2">
          {all.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isActive(l) ? "page" : undefined}
              className={`flex w-full items-center gap-4 rounded-md px-3 py-2 hover:bg-zinc-900 ${
                isActive(l) ? "bg-zinc-900 text-zinc-100" : "text-zinc-400"
              }`}
            >
              <l.icon aria-hidden="true" /> <span>{l.label}</span>
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex w-full justify-end">
        <Logout />
      </div>
    </aside>
  );
}

// Phone: top bar (team, settings, logout) and a five-item bottom navigation.
export function MobileChrome() {
  const isActive = useActive();

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center gap-2 border-b border-zinc-800 bg-zinc-950 px-3 py-2 sm:hidden">
        <Link href="/dashboard" aria-label="DummyLab home" className="shrink-0">
          <Image src="/assets/logos/dummylab_logo_solo.png" width={28} height={29} alt="" className="h-auto w-7" />
        </Link>
        <div className="min-w-0 flex-1">
          <TeamSwitcher className="h-11" />
        </div>
        <Link
          href={settings.href}
          aria-label="Settings"
          aria-current={isActive(settings) ? "page" : undefined}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-md hover:bg-zinc-900 ${
            isActive(settings) ? "bg-zinc-900 text-zinc-100" : "text-zinc-400"
          }`}
        >
          <FaGear />
        </Link>
        <Logout className="h-11 w-11" />
      </header>

      <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-zinc-800 bg-zinc-950 sm:hidden">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            aria-current={isActive(l) ? "page" : undefined}
            className={`flex h-14 flex-col items-center justify-center gap-1 text-[11px] ${
              isActive(l) ? "text-cyan-400" : "text-zinc-400"
            }`}
          >
            <l.icon aria-hidden="true" className="text-base" /> <span>{l.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
