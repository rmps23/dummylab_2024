import Login from "@/components/auth/Login";
import Footer from "@/components/Footer";
import SiteHeader from "@/components/marketing/SiteHeader";
import Preview from "@/components/marketing/Preview";
import PricingCards from "@/components/marketing/PricingCards";
import Faq from "@/components/marketing/Faq";

export const metadata = {
  title: { absolute: "DummyLab: schedule and stats for League of Legends teams" },
  description:
    "Put trainings, scrims and matches in one calendar, see who can play, and track each player's results from match history. Free for one team.",
  openGraph: {
    title: "DummyLab: schedule and stats for League of Legends teams",
    description: "Plan the week, see who can play and follow your team's stats. Free for one team.",
    type: "website",
  },
};

// Each card has its own colour: border, hard shadow and a slight tilt on wide screens.
const THINGS = [
  {
    title: "Plan trainings, scrims and matches",
    text: "Everything goes in one calendar. Each player says whether they can make it, so you know if you have five before you book the scrim.",
    card: "border-brand shadow-[6px_6px_0_0_#3ab5c6] md:-rotate-1",
  },
  {
    title: "Stop chasing people for answers",
    text: "Send every player a personal link. They tap yes or no on their phone, with no account and no app to install.",
    tag: "Pro",
    card: "border-violet-400 shadow-[6px_6px_0_0_#a78bfa] md:rotate-1",
  },
  {
    title: "See how the team is really doing",
    text: "Add players by Riot ID and import their games. DummyLab works out win rate, KDA, CS per minute and champion pool, for each player and for the whole team.",
    card: "border-accent shadow-[6px_6px_0_0_#d6a24e] md:rotate-1",
  },
  {
    title: "Keep notes and goals per player",
    text: "Write down what each player should work on, so the next VOD review starts where the last one ended.",
    card: "border-loss shadow-[6px_6px_0_0_#e0726a] md:-rotate-1",
  },
];

const STEPS = [
  ["Create your team", "Sign up and add your players. If you give a Riot ID, it is checked against the Riot API.", "bg-brand"],
  ["Plan the week", "Add trainings, scrims and matches. Players mark whether they can come.", "bg-violet-400"],
  ["Look at the numbers", "Import match history and see who is in form and what to work on.", "bg-accent"],
];

const TICKER = ["Scrims", "Availability", "Win rate", "KDA", "CS per minute", "Champion pool", "VOD notes", "Rank tracking", "Discord reminders"];

// A hand-drawn style underline for a highlighted word.
const Squiggle = () => (
  <svg aria-hidden="true" viewBox="0 0 200 12" preserveAspectRatio="none" className="absolute -bottom-2 left-0 h-3 w-full text-brand">
    <path d="M2 8 Q 14 1 26 7 T 50 7 T 74 7 T 98 7 T 122 7 T 146 7 T 170 7 T 198 6" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
  </svg>
);

export default function Home() {
  return (
    <main id="main" className="relative overflow-hidden">
      {/* Soft coloured glows behind the page */}
      <span aria-hidden="true" className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-violet-500/25 blur-3xl" />
      <span aria-hidden="true" className="pointer-events-none absolute -right-24 top-80 h-96 w-96 rounded-full bg-brand/20 blur-3xl" />
      <span aria-hidden="true" className="pointer-events-none absolute -left-24 top-[1500px] h-80 w-80 rounded-full bg-accent/15 blur-3xl" />

      <SiteHeader />

      <section className="relative mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-10 lg:flex-row lg:items-center lg:justify-between lg:gap-16 lg:py-20">
        <div className="w-full max-w-xl">
          <span className="inline-block -rotate-2 rounded-md bg-accent px-3 py-1 text-sm font-bold text-zinc-950 shadow-[3px_3px_0_0_rgba(255,255,255,0.15)]">
            Free for your first team
          </span>
          <h1 className="mt-5 text-4xl font-bold leading-[1.08] sm:text-6xl">
            Schedule scrims. Track stats. Stop asking{" "}
            <span className="relative inline-block text-brand">
              &ldquo;who&apos;s online?&rdquo;
              <Squiggle />
            </span>
          </h1>
          <p className="mt-7 text-lg leading-relaxed text-zinc-300">
            DummyLab is a web app for League of Legends coaches and managers. One calendar for trainings, scrims and
            matches, a quick way to see who can play, and each player&apos;s results pulled from their match history.
          </p>
          <p className="mt-4 text-sm text-zinc-400">One team, up to 10 players, no card needed.</p>
        </div>
        <div id="start" className="relative w-full max-w-sm scroll-mt-8 pb-2 pr-2 lg:shrink-0">
          <div className="rotate-1 rounded-lg shadow-[8px_8px_0_0_#3ab5c6]">
            <Login />
          </div>
        </div>
      </section>

      {/* Ticker */}
      <div aria-hidden="true" className="relative -rotate-1 overflow-hidden border-y-2 border-white/15 bg-brand py-3 text-zinc-950">
        <div className="flex w-max animate-marquee gap-8 whitespace-nowrap font-display text-lg font-bold">
          {[...TICKER, ...TICKER, ...TICKER, ...TICKER].map((t, i) => (
            <span key={i} className="flex items-center gap-8">
              {t} <span>✦</span>
            </span>
          ))}
        </div>
      </div>

      <section className="relative mx-auto max-w-6xl px-6 py-20" aria-labelledby="what-title">
        <h2 id="what-title" className="max-w-2xl text-3xl font-bold sm:text-4xl">
          What it helps you <span className="rounded bg-violet-400 px-2 text-zinc-950">actually</span> do
        </h2>
        <ul className="mt-12 grid gap-x-10 gap-y-10 pr-2 md:grid-cols-2">
          {THINGS.map(({ title, text, tag, card }) => (
            <li key={title} className={`rounded-lg border-2 bg-panel p-6 ${card}`}>
              <h3 className="text-xl font-bold">
                {title}
                {tag && <span className="ml-2 rounded bg-accent px-1.5 py-0.5 align-middle text-xs font-bold text-zinc-950">{tag}</span>}
              </h3>
              <p className="mt-2 leading-relaxed text-zinc-300">{text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 py-16" aria-labelledby="preview-title">
        <h2 id="preview-title" className="text-3xl font-bold sm:text-4xl">This is what you will see</h2>
        <p className="mt-3 max-w-2xl text-zinc-400">
          Recent results, the next events with who can play, and the ranks of your players, all on the home screen. The
          numbers below are an example.
        </p>
        <div className="mr-2 mt-10 max-w-3xl rotate-[-0.6deg] rounded-lg shadow-[8px_8px_0_0_#a78bfa]">
          <Preview />
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 py-20" aria-labelledby="how-title">
        <h2 id="how-title" className="text-3xl font-bold sm:text-4xl">How it works</h2>
        <ol className="mt-12 grid gap-10 md:grid-cols-3">
          {STEPS.map(([title, text, color], i) => (
            <li key={title}>
              <span className={`inline-flex h-12 w-12 -rotate-6 items-center justify-center rounded-lg font-display text-xl font-bold text-zinc-950 ${color}`}>
                {i + 1}
              </span>
              <h3 className="mt-4 text-xl font-bold">{title}</h3>
              <p className="mt-1 leading-relaxed text-zinc-400">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="relative mx-auto max-w-4xl px-6 py-16" aria-labelledby="pricing-title">
        <h2 id="pricing-title" className="text-3xl font-bold sm:text-4xl">Pricing</h2>
        <p className="mb-10 mt-3 max-w-xl text-zinc-400">Start free with one team. Move to Pro when you run more than one roster.</p>
        <PricingCards />
      </section>

      <section className="relative mx-auto max-w-6xl px-6 py-16" aria-labelledby="faq-title">
        <h2 id="faq-title" className="mb-8 text-3xl font-bold sm:text-4xl">Questions</h2>
        <Faq />
      </section>

      <section className="relative mx-auto max-w-6xl px-6 pb-16 pt-6">
        <div className="mr-2 flex rotate-[-0.8deg] flex-col items-start justify-between gap-5 rounded-lg border-2 border-white/20 bg-brand p-7 text-zinc-950 shadow-[8px_8px_0_0_#a78bfa] sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-bold">Ready to try it with your team?</h2>
            <p className="mt-1 font-medium text-zinc-900/80">Create a free account and add your first team in a couple of minutes.</p>
          </div>
          <a
            href="#start"
            className="inline-flex min-h-12 shrink-0 items-center rounded-lg border-2 border-zinc-950 bg-zinc-950 px-6 font-bold text-white shadow-[4px_4px_0_0_#d6a24e] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_0_#d6a24e]"
          >
            Create a free account
          </a>
        </div>
      </section>

      <Footer className="relative px-6 pb-8 pt-6" />
    </main>
  );
}
