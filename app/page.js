import Image from "next/image";
import { FaCalendarCheck, FaChartLine, FaUsers } from "react-icons/fa6";
import Login from "@/components/auth/Login";
import Footer from "@/components/Footer";

const FEATURES = [
  { icon: FaCalendarCheck, title: "Plan the week", text: "Trainings, scrims and matches, with every player's availability at a glance." },
  { icon: FaChartLine, title: "Know the numbers", text: "Win rate, KDA, CS and vision per player and per team, built from match history." },
  { icon: FaUsers, title: "Run every roster", text: "Manage several teams and keep each player's role, rank and form in one place." },
];

export default function Home() {
  return (
    <main id="main" className="relative flex min-h-dvh flex-col overflow-hidden px-6">
      <span aria-hidden="true" className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
      <span aria-hidden="true" className="pointer-events-none absolute -right-24 bottom-20 h-96 w-96 rounded-full bg-brand/15 blur-3xl" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center gap-12 py-12 lg:flex-row lg:gap-20">
        <div className="w-full max-w-xl text-center lg:text-left">
          <Image src="/assets/logos/dummylab_logo.png" width={180} height={42} alt="" priority className="mx-auto h-auto w-[180px] lg:mx-0" />
          <h1 className="mt-6 text-4xl font-bold leading-tight sm:text-5xl">
            The coaching dashboard for <span className="bg-gradient-to-r from-cyan-300 to-violet-400 bg-clip-text text-transparent">League teams</span>
          </h1>
          <p className="mt-4 text-lg text-zinc-300">
            Schedule trainings and scrims with player availability, and track stats from match history. Built for coaches
            of amateur and semi-pro teams.
          </p>
          <ul className="mt-8 grid gap-4 text-left sm:grid-cols-3 lg:grid-cols-1">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand/25 to-accent/25 text-brand">
                  <Icon aria-hidden="true" />
                </span>
                <span>
                  <span className="block font-bold">{title}</span>
                  <span className="block text-sm text-zinc-400">{text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="w-full">
          <Login />
        </div>
      </div>
      <Footer className="relative pb-6" />
    </main>
  );
}
