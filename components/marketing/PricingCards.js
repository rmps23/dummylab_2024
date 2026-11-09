import Link from "next/link";
import { FaCheck } from "react-icons/fa6";
import { PLANS } from "@/lib/plans";
import { btnPrimary, btnSecondary } from "@/components/ui/buttons";
import DemoButton from "@/components/marketing/DemoButton";

// Shared by the landing page and /pricing. Payments are not live yet, so Pro shows as coming soon.
export default function PricingCards({ proAvailable = false }) {
  const free = PLANS.free;
  const pro = PLANS.pro;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <section className="flex flex-col rounded-xl border border-white/[0.08] bg-panel p-6 shadow-card">
        <h3 className="eyebrow">{free.name}</h3>
        <p className="mt-2 text-4xl font-bold">€0</p>
        <p className="text-sm text-zinc-400">Free forever</p>
        <p className="mt-3 text-sm text-zinc-300">{free.tagline}</p>
        <ul className="mt-4 flex flex-1 flex-col gap-2 text-sm">
          {free.features.map((f) => (
            <li key={f} className="flex gap-2">
              <FaCheck aria-hidden="true" className="mt-1 shrink-0 text-win" /> {f}
            </li>
          ))}
        </ul>
        <Link href="/login?mode=signup" className={`${btnSecondary} mt-6`}>
          Start for free
        </Link>
      </section>

      <section className="relative flex flex-col rounded-xl border border-brand/40 bg-panel p-6">
        <span className="absolute right-4 top-4 rounded-full bg-brand/15 px-3 py-1 text-xs font-bold text-brand">For academies</span>
        <h3 className="eyebrow !text-brand">{pro.name}</h3>
        <p className="mt-2 text-4xl font-bold">
          €{pro.price.month}
          <span className="text-base font-normal text-zinc-400"> / month</span>
        </p>
        <p className="text-sm text-zinc-400">or €{pro.price.year} per year (2 months free)</p>
        <p className="mt-3 text-sm text-zinc-300">{pro.tagline}</p>
        <ul className="mt-4 flex flex-1 flex-col gap-2 text-sm">
          <li className="flex gap-2 text-zinc-400">Everything in Free, plus:</li>
          {pro.features.map((f) => (
            <li key={f} className="flex gap-2">
              <FaCheck aria-hidden="true" className="mt-1 shrink-0 text-brand" /> {f}
            </li>
          ))}
        </ul>
        {proAvailable ? (
          <Link href="/dashboard/billing" className={`${btnPrimary} mt-6`}>
            Upgrade to Pro
          </Link>
        ) : (
          <>
            <DemoButton className="mt-6 w-full">Try every Pro feature in the demo</DemoButton>
            <p className="mt-2 text-center text-xs text-zinc-400">Payments open soon. The demo account has Pro switched on.</p>
          </>
        )}
      </section>
    </div>
  );
}
