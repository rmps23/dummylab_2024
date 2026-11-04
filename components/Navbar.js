"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { FaChartSimple, FaCalendar, FaShield, FaUsers, FaGear, FaHouse } from "react-icons/fa6";
import Logout from "./auth/Logout";
import Avatar from "@/components/ui/Avatar";
import Select from "@/components/ui/Select";
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
  const active = teams.find((t) => t.id === activeTeamId);
  return (
    <div className={`relative flex w-full items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-2 hover:bg-white/[0.07] ${className}`}>
      <Avatar name={active?.name} size={28} />
      <Select
        variant="bare"
        label="Active team"
        value={activeTeamId ?? ""}
        onChange={(id) => setActiveTeam(Number(id))}
        options={teams.map((team) => ({ value: team.id, label: team.name }))}
      />
    </div>
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
    <aside className="hidden h-dvh w-64 shrink-0 flex-col justify-between gap-4 border-r border-white/[0.06] bg-panel/60 px-4 pb-4 pt-8 sm:flex">
      <div className="flex w-full flex-col gap-6">
        <Link href="/dashboard" className="px-2">
          <Image src="/assets/logos/dummylab_logo.png" width={140} height={33} alt="DummyLab" priority className="h-auto w-[140px]" />
        </Link>
        <TeamSwitcher />
        <nav aria-label="Main" className="flex w-full flex-col gap-1">
          <span className="eyebrow mb-1 px-3">Menu</span>
          {all.map((l) => {
            const active = isActive(l);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`relative flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-semibold transition ${
                  active ? "bg-white/[0.07] text-white" : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-100"
                }`}
              >
                {active && <span aria-hidden="true" className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-brand" />}
                <l.icon aria-hidden="true" className={active ? "text-brand" : ""} /> <span>{l.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex w-full items-center justify-between border-t border-white/[0.06] pt-3">
        <span className="eyebrow">Sign out</span>
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
      <header className="sticky top-0 z-40 flex items-center gap-2 border-b border-white/[0.06] bg-ink/85 px-3 py-2 sm:hidden">
        <Link href="/dashboard" aria-label="DummyLab home" className="shrink-0">
          <Image src="/assets/logos/dummylab_logo_solo.png" width={28} height={29} alt="" className="h-auto w-7" />
        </Link>
        <div className="min-w-0 flex-1">
          <TeamSwitcher />
        </div>
        <Link
          href={settings.href}
          aria-label="Settings"
          aria-current={isActive(settings) ? "page" : undefined}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg hover:bg-white/[0.06] ${
            isActive(settings) ? "bg-white/[0.07] text-brand" : "text-zinc-400"
          }`}
        >
          <FaGear />
        </Link>
        <Logout className="h-11 w-11" />
      </header>

      <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-white/[0.06] bg-ink/90 sm:hidden">
        {links.map((l) => {
          const active = isActive(l);
          return (
            <Link
              key={l.href}
              href={l.href}
              aria-current={active ? "page" : undefined}
              className={`relative flex h-14 flex-col items-center justify-center gap-1 text-[11px] font-semibold ${
                active ? "text-brand" : "text-zinc-400"
              }`}
            >
              {active && <span aria-hidden="true" className="absolute inset-x-5 top-0 h-[3px] rounded-b-full bg-brand" />}
              <l.icon aria-hidden="true" className="text-base" /> <span>{l.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
