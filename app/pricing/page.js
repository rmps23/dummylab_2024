import { FaCheck, FaMinus } from "react-icons/fa6";
import Footer from "@/components/Footer";
import SiteHeader from "@/components/marketing/SiteHeader";
import PricingCards from "@/components/marketing/PricingCards";
import Faq from "@/components/marketing/Faq";
import { PLANS } from "@/lib/plans";

export const metadata = {
  title: "Pricing",
  description: "DummyLab is free for one team. Pro adds more teams, availability links, full stats history, Discord reminders and a weekly report.",
};

const { free, pro } = PLANS;

const ROWS = [
  ["Teams", `${free.limits.teams}`, `${pro.limits.teams}`],
  ["Players", `${free.limits.players}`, `${pro.limits.players}`],
  ["Schedule and coach-set availability", true, true],
  ["Stats and champion pool", "Last 30 days", "Full history"],
  ["Match import and rank (Riot API)", true, true],
  ["Private notes and goals", `${free.limits.notes}`, "Unlimited"],
  ["Availability links for players", false, true],
  ["Discord reminders", false, true],
  ["Weekly report: email, CSV, print", false, true],
];

const Cell = ({ value }) =>
  value === true ? (
    <FaCheck aria-label="Included" className="mx-auto text-win" />
  ) : value === false ? (
    <FaMinus aria-label="Not included" className="mx-auto text-zinc-500" />
  ) : (
    <span>{value}</span>
  );

export default function Pricing() {
  return (
    <div className="relative min-h-dvh overflow-hidden">
      <SiteHeader />
      <main id="main" className="relative mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-center text-4xl font-bold">Pricing</h1>
        <p className="mx-auto mb-8 mt-2 max-w-xl text-center text-zinc-400">
          Free for one team, always. Pro is for coaches and academies that run more than one roster. Prices in euros; taxes may
          apply.
        </p>
        <PricingCards />

        <section className="mt-14" aria-labelledby="compare-title">
          <h2 id="compare-title" className="mb-4 text-2xl font-bold">Compare plans</h2>
          <div className="overflow-x-auto rounded-xl border border-line bg-panel">
            <table className="w-full min-w-[480px] text-sm">
              <thead>
                <tr className="text-left">
                  <th scope="col" className="eyebrow p-3">Feature</th>
                  <th scope="col" className="eyebrow p-3 text-center">Free</th>
                  <th scope="col" className="eyebrow p-3 text-center !text-brand">Pro</th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map(([label, a, b]) => (
                  <tr key={label} className="border-t border-line">
                    <th scope="row" className="p-3 text-left font-normal">{label}</th>
                    <td className="p-3 text-center"><Cell value={a} /></td>
                    <td className="p-3 text-center"><Cell value={b} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-14" aria-labelledby="faq-title">
          <h2 id="faq-title" className="mb-4 text-center text-2xl font-bold">Questions</h2>
          <Faq />
        </section>
      </main>
      <Footer className="relative px-6 pb-8" />
    </div>
  );
}
