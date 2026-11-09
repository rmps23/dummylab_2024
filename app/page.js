import Link from "next/link";
import { FaCheck } from "react-icons/fa6";
import Footer from "@/components/Footer";
import SiteHeader from "@/components/marketing/SiteHeader";
import DemoButton from "@/components/marketing/DemoButton";
import PricingCards from "@/components/marketing/PricingCards";
import Faq from "@/components/marketing/Faq";
import { HeroShot, ScheduleShot, StatsShot, ReportShot } from "@/components/marketing/ProductShots";
import { btnSecondary } from "@/components/ui/buttons";

export const metadata = {
  title: { absolute: "DummyLab: scheduling and stats for League of Legends teams" },
  description:
    "Plan trainings and scrims around player availability, and follow win rate, KDA and champion pool for every player. Free for one team.",
  openGraph: {
    title: "DummyLab: scheduling and stats for League of Legends teams",
    description: "Plan the week and follow every player. Free for one team.",
    type: "website",
  },
};

const SECTIONS = [
  {
    id: "schedule",
    label: "Schedule",
    title: "Know who can play before you book the scrim",
    text: "Trainings, scrims and matches live in one calendar. Every event shows which players said yes, maybe or no, and who has not answered yet.",
    points: [
      "Set availability yourself, or send each player a personal link",
      "Players answer from their phone, with no account and no app",
      "Discord reminders for the people still pending (Pro)",
    ],
    shot: <ScheduleShot />,
  },
  {
    id: "stats",
    label: "Stats",
    title: "See how each player is really doing",
    text: "Add players by Riot ID and import their match history. You get win rate, KDA, CS, damage and vision per minute, plus champion pool and trends, per player and for the whole roster.",
    points: [
      "Rank and recent form next to every name",
      "Champion pool with games played and win rate",
      "Private notes and goals for each player, visible only to you",
      "Invite analysts and assistant coaches with their own login (Pro)",
    ],
    shot: <StatsShot />,
  },
  {
    id: "reports",
    label: "Reports",
    title: "A weekly summary, without opening the app",
    text: "Every Monday your team report lands in your inbox: results, who is performing, and what is on the calendar next. Export the numbers to CSV when you need them elsewhere.",
    points: ["One email per team, sent on Monday morning", "Manual send whenever you want one", "CSV export of the roster stats"],
    shot: <ReportShot />,
  },
];

export default function Home() {
  return (
    <main id="main">
      <SiteHeader />

      <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-6 pb-16 pt-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14 lg:pt-20">
        <div>
          <p className="eyebrow !text-brand">For coaches and academies</p>
          <h1 className="mt-3 text-4xl font-bold leading-[1.05] sm:text-5xl">Scheduling and stats for League of Legends teams</h1>
          <p className="mt-5 max-w-lg text-lg text-zinc-300">
            See who can play on Thursday, how each player has been doing, and what to work on before the next scrim.
          </p>
          <div className="mt-7 flex flex-wrap items-start gap-3">
            <DemoButton />
            <Link href="/login?mode=signup" className={btnSecondary}>
              Create a free account
            </Link>
          </div>
          <p className="mt-4 text-sm text-zinc-400">Free for one team. No card needed. The demo uses sample data.</p>
        </div>
        <HeroShot />
      </section>

      {SECTIONS.map((s, i) => (
        <section key={s.id} id={s.id} aria-labelledby={`${s.id}-title`} className="border-t border-line">
          <div className={`mx-auto grid w-full max-w-6xl items-center gap-10 px-6 py-16 lg:grid-cols-2 lg:gap-16 ${i % 2 ? "lg:[&>div:first-child]:order-2" : ""}`}>
            <div>
              <p className="eyebrow !text-brand">{s.label}</p>
              <h2 id={`${s.id}-title`} className="mt-2 text-3xl font-bold leading-tight">{s.title}</h2>
              <p className="mt-4 text-zinc-300">{s.text}</p>
              <ul className="mt-5 flex flex-col gap-2.5 text-sm text-zinc-300">
                {s.points.map((p) => (
                  <li key={p} className="flex gap-3">
                    <FaCheck aria-hidden="true" className="mt-0.5 shrink-0 text-brand" /> {p}
                  </li>
                ))}
              </ul>
            </div>
            <div>{s.shot}</div>
          </div>
        </section>
      ))}

      <section className="border-t border-line bg-panel" aria-labelledby="riot-title">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 py-14 md:grid-cols-[1fr_2fr]">
          <h2 id="riot-title" className="text-2xl font-bold">Built on official Riot data</h2>
          <p className="text-zinc-300">
            Match history and ranks come from the Riot Games API, for the players you add by Riot ID. Importing is being switched on
            for all accounts as Riot reviews the product, so until then the demo shows sample data. Scrim (custom) games are only included for players who opt in themselves. Your private notes and
            availability answers stay in your account, and any player can ask for their data to be deleted.
          </p>
        </div>
      </section>

      <section className="border-t border-line" aria-labelledby="pricing-title">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 id="pricing-title" className="text-center text-3xl font-bold">Pricing</h2>
          <p className="mx-auto mb-8 mt-2 max-w-xl text-center text-zinc-400">Free for one team. The paid plans only cover what the servers cost, so they stay as cheap as we can make them.</p>
          <PricingCards />
        </div>
      </section>

      <section className="border-t border-line" aria-labelledby="faq-title">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <h2 id="faq-title" className="mb-6 text-center text-3xl font-bold">Questions</h2>
          <Faq />
        </div>
      </section>

      <section className="border-t border-line bg-panel">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 py-14 text-center">
          <h2 className="text-3xl font-bold">Look around with a sample team</h2>
          <p className="max-w-md text-zinc-400">One click, no sign-up. Five players, a few weeks of games and a full calendar.</p>
          <DemoButton />
        </div>
      </section>

      <Footer className="px-6 pb-8 pt-8" />
    </main>
  );
}
