import Link from "next/link";
import { FaCheck } from "react-icons/fa6";
import { PLANS, PLAN_ORDER } from "@/lib/plans";
import { btnPrimary, btnSecondary } from "@/components/ui/buttons";
import DemoButton from "@/components/marketing/DemoButton";

const BADGE = { pro: "Most coaches", academy: "For academies" };

// Shared by the landing page and /pricing. Payments are not live yet, so paid plans show as "opening soon".
export default function PricingCards({ proAvailable = false }) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {PLAN_ORDER.map((id) => {
        const plan = PLANS[id];
        const paid = id !== "free";
        const prev = id === "academy" ? "Pro" : "Free";
        return (
          <section
            key={id}
            className={`relative flex flex-col rounded-xl border bg-panel p-6 ${id === "pro" ? "border-brand/50" : "border-line"}`}
          >
            {BADGE[id] && (
              <span className="absolute right-4 top-4 rounded-full bg-brand/15 px-3 py-1 text-xs font-bold text-brand">{BADGE[id]}</span>
            )}
            <h3 className={`eyebrow ${id === "pro" ? "!text-brand" : ""}`}>{plan.name}</h3>
            <p className="mt-2 text-4xl font-bold">
              €{plan.price.month}
              {paid && <span className="text-base font-normal text-zinc-400"> / month</span>}
            </p>
            <p className="text-sm text-zinc-400">{paid ? `or €${plan.price.year} per year (2 months free)` : "Free forever"}</p>
            <p className="mt-3 text-sm text-zinc-300">{plan.tagline}</p>
            <ul className="mt-4 flex flex-1 flex-col gap-2 text-sm">
              {paid && <li className="text-zinc-400">Everything in {prev}, plus:</li>}
              {plan.features.map((f) => (
                <li key={f} className="flex gap-2">
                  <FaCheck aria-hidden="true" className={`mt-1 shrink-0 ${paid ? "text-brand" : "text-win"}`} /> {f}
                </li>
              ))}
            </ul>
            {!paid ? (
              <Link href="/login?mode=signup" className={`${btnSecondary} mt-6`}>
                Start for free
              </Link>
            ) : proAvailable ? (
              <Link href="/dashboard/billing" className={`${id === "pro" ? btnPrimary : btnSecondary} mt-6`}>
                Choose {plan.name}
              </Link>
            ) : (
              <>
                <DemoButton className="mt-6 w-full">Try {plan.name} in the demo</DemoButton>
                <p className="mt-2 text-center text-xs text-zinc-400">Payments open soon. The demo has every feature on.</p>
              </>
            )}
          </section>
        );
      })}
    </div>
  );
}
