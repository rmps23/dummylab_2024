import { FaCheck, FaMinus } from "react-icons/fa6";
import Footer from "@/components/Footer";
import SiteHeader from "@/components/marketing/SiteHeader";
import PricingCards from "@/components/marketing/PricingCards";
import Faq from "@/components/marketing/Faq";
import { PLANS } from "@/lib/plans";

export const metadata = {
  title: "Pricing",
  description: "DummyLab is free for one team. Pro is 3 euros a month, Academy 9. Prices cover the servers and nothing more.",
};

const { free, pro, academy } = PLANS;
const num = (n) => `${n}`;

const ROWS = [
  ["Teams", num(free.limits.teams), num(pro.limits.teams), num(academy.limits.teams)],
  ["Players", num(free.limits.players), num(pro.limits.players), num(academy.limits.players)],
  ["Staff you can invite", false, num(pro.limits.staff), num(academy.limits.staff)],
  ["Schedule and coach-set availability", true, true, true],
  ["Stats and champion pool", "Last 30 days", "Full history", "Full history"],
  ["Match import and rank (Riot API)", true, true, true],
  ["Private notes and goals", num(free.limits.notes), "Unlimited", "Unlimited"],
  ["Availability links for players", false, true, true],
  ["Discord reminders", false, true, true],
  ["Weekly report: email, CSV, print", false, true, true],
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
      <main id="main" className="relative mx-auto max-w-5xl px-6 py-10">
        <h1 className="text-center text-4xl font-bold">Pricing</h1>
        <p className="mx-auto mb-8 mt-2 max-w-xl text-center text-zinc-400">
          Free for one team, always. The paid plans cost what it takes to keep the servers running, and nothing more. Prices in
          euros; taxes may apply.
        </p>
        <PricingCards />

        <section className="mt-14" aria-labelledby="compare-title">
          <h2 id="compare-title" className="mb-4 text-2xl font-bold">Compare plans</h2>
          <div className="overflow-x-auto rounded-xl border border-line bg-panel">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="text-left">
                  <th scope="col" className="eyebrow p-3">Feature</th>
                  <th scope="col" className="eyebrow p-3 text-center">Free</th>
                  <th scope="col" className="eyebrow p-3 text-center !text-brand">Pro</th>
                  <th scope="col" className="eyebrow p-3 text-center">Academy</th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map(([label, a, b, c]) => (
                  <tr key={label} className="border-t border-line">
                    <th scope="row" className="p-3 text-left font-normal">{label}</th>
                    <td className="p-3 text-center"><Cell value={a} /></td>
                    <td className="p-3 text-center"><Cell value={b} /></td>
                    <td className="p-3 text-center"><Cell value={c} /></td>
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
