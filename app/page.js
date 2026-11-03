import { FaCalendarCheck, FaChartLine, FaLink, FaUsers } from "react-icons/fa6";
import Login from "@/components/auth/Login";
import Footer from "@/components/Footer";
import SiteHeader from "@/components/marketing/SiteHeader";
import Preview from "@/components/marketing/Preview";
import PricingCards from "@/components/marketing/PricingCards";
import Faq from "@/components/marketing/Faq";

export const metadata = {
  title: { absolute: "DummyLab: coaching dashboard for League of Legends teams" },
  description:
    "Plan trainings and scrims with player availability and track win rate, KDA and champion pool from match history. Free for one team.",
  openGraph: {
    title: "DummyLab: coaching dashboard for League of Legends teams",
    description: "Plan the week and track the stats of your team. Free for one team.",
    type: "website",
  },
};

const FEATURES = [
  { icon: FaCalendarCheck, title: "Plan the week", text: "Trainings, scrims and matches in one calendar, with every player's availability at a glance." },
  { icon: FaLink, title: "Players answer in one tap", text: "Send a personal link. No account, no app: they answer from their phone." },
  { icon: FaChartLine, title: "Know the numbers", text: "Win rate, KDA, CS and vision per player and per team, plus champion pool and trends." },
  { icon: FaUsers, title: "Run every roster", text: "Several teams, roles, ranks and recent form, with private notes and goals per player." },
];

const STEPS = [
  ["1", "Add your team", "Create a team and add players by Riot ID. Each one is checked against the Riot API."],
  ["2", "Schedule and import", "Plan trainings and scrims, and import match history to fill your stats."],
  ["3", "Coach with context", "See who is free, who is in form, and what to work on next."],
];

export default function Home() {
  return (
    <main id="main" className="relative overflow-hidden">
      <span aria-hidden="true" className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
      <span aria-hidden="true" className="pointer-events-none absolute -right-24 top-96 h-96 w-96 rounded-full bg-brand/15 blur-3xl" />

      <SiteHeader />

      <section className="relative mx-auto flex w-full max-w-6xl flex-col items-center gap-12 px-6 py-10 lg:flex-row lg:gap-20 lg:py-16">
        <div className="w-full max-w-xl text-center lg:text-left">
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
            The coaching dashboard for{" "}
            <span className="bg-gradient-to-r from-cyan-300 to-violet-400 bg-clip-text text-transparent">League teams</span>
          </h1>
          <p className="mt-4 text-lg text-zinc-300">
            Schedule trainings and scrims with player availability, and track stats from match history. Built for coaches
            of amateur and semi-pro teams and academies.
          </p>
          <p className="mt-3 text-sm text-zinc-400">Free for one team. No card needed.</p>
        </div>
        <div id="start" className="w-full scroll-mt-8">
          <Login />
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 py-12" aria-labelledby="preview-title">
        <h2 id="preview-title" className="text-center text-3xl font-bold">Your whole week at a glance</h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-zinc-400">Form, availability and ranks in one screen, so you know what to do before practice starts.</p>
        <div className="mx-auto mt-8 max-w-3xl">
          <Preview />
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 py-12" aria-labelledby="features-title">
        <h2 id="features-title" className="sr-only">Features</h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <li key={title} className="rounded-2xl border border-white/[0.07] bg-panel/70 p-5 shadow-card">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand/25 to-accent/25 text-brand">
                <Icon aria-hidden="true" />
              </span>
              <h3 className="mt-4 font-bold">{title}</h3>
              <p className="mt-1 text-sm text-zinc-400">{text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 py-12" aria-labelledby="how-title">
        <h2 id="how-title" className="text-center text-3xl font-bold">How it works</h2>
        <ol className="mt-8 grid gap-6 md:grid-cols-3">
          {STEPS.map(([n, title, text]) => (
            <li key={n} className="flex gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/15 font-bold text-brand">{n}</span>
              <span>
                <span className="block font-bold">{title}</span>
                <span className="block text-sm text-zinc-400">{text}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="relative mx-auto max-w-4xl px-6 py-12" aria-labelledby="pricing-title">
        <h2 id="pricing-title" className="text-center text-3xl font-bold">Simple pricing</h2>
        <p className="mx-auto mb-8 mt-2 max-w-xl text-center text-zinc-400">Start free with one team. Move to Pro when you run more than one roster.</p>
        <PricingCards />
      </section>

      <section className="relative mx-auto max-w-6xl px-6 py-12" aria-labelledby="faq-title">
        <h2 id="faq-title" className="mb-6 text-center text-3xl font-bold">Questions</h2>
        <Faq />
      </section>

      <Footer className="relative px-6 pb-8 pt-6" />
    </main>
  );
}
