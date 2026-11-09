"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FaCheck, FaCrown } from "react-icons/fa6";
import { toast } from "react-toastify";
import { supabase } from "@/supabase";
import { featureStore } from "@/store/featureStore";
import { teamStore } from "@/store/teamStore";
import { playerStore } from "@/store/playerStore";
import { PLANS } from "@/lib/plans";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import { btnPrimary, btnSecondary } from "@/components/ui/buttons";

const Meter = ({ label, used, limit }) => {
  const pct = Math.min(100, Math.round((used / limit) * 100));
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span>{label}</span>
        <span className="text-zinc-400">
          {used} / {limit}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-label={label} aria-valuenow={used} aria-valuemin={0} aria-valuemax={limit}>
        <div className={`h-full rounded-full ${pct >= 100 ? "bg-loss" : "bg-brand"}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

function BillingContent() {
  const params = useSearchParams();
  const { plan, billing, demo, loaded } = featureStore();
  const teams = teamStore((s) => s.teams);
  const players = playerStore((s) => s.players);
  const [account, setAccount] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase
      .from("account")
      .select("current_period_end, cancel_at_period_end, stripe_customer_id")
      .maybeSingle()
      .then(({ data }) => setAccount(data));
  }, [plan]);

  useEffect(() => {
    if (params.get("checkout") === "success") toast.success("Thanks! Your plan updates in a few seconds.");
  }, [params]);

  async function go(path, body) {
    setBusy(true);
    try {
      const response = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body || {}) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Something went wrong");
      window.location.href = data.url;
    } catch (error) {
      toast.error(error.message);
      setBusy(false);
    }
  }

  const current = PLANS[plan] ?? PLANS.free;
  const pro = PLANS.pro;

  return (
    <>
      <PageHeader icon={FaCrown} title="Plan and billing" subtitle={`You are on the ${current.name} plan`} />

      <div className="mx-auto flex max-w-4xl flex-col gap-4 p-4 sm:p-6">
        {demo && (
          <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-300">
            The demo account has every Pro feature switched on. Plans cannot be changed here.
          </p>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <Card title="Usage">
            <div className="flex flex-col gap-4">
              <Meter label="Teams" used={teams.length} limit={current.limits.teams} />
              <Meter label="Players" used={players.length} limit={current.limits.players} />
              <p className="text-xs text-zinc-400">
                Stats history: {current.limits.statsDays ? `last ${current.limits.statsDays} days` : "everything"}
              </p>
            </div>
          </Card>

          <Card title="Your plan">
            <p className="text-2xl font-bold">{current.name}</p>
            <ul className="mt-3 flex flex-col gap-1.5 text-sm text-zinc-300">
              {current.features.map((f) => (
                <li key={f} className="flex gap-2">
                  <FaCheck aria-hidden="true" className="mt-1 shrink-0 text-win" /> {f}
                </li>
              ))}
            </ul>
            {plan === "pro" && account?.current_period_end && (
              <p className="mt-3 text-xs text-zinc-400">
                {account.cancel_at_period_end ? "Ends" : "Renews"} on {new Date(account.current_period_end).toLocaleDateString("en-GB")}
              </p>
            )}
            {plan === "pro" && account?.stripe_customer_id && billing && (
              <button onClick={() => go("/api/billing/portal")} disabled={busy} className={`${btnSecondary} mt-4`}>
                Manage subscription
              </button>
            )}
          </Card>
        </div>

        {plan !== "pro" && !demo && (
          <Card title="Upgrade to Pro" className="border-brand/30 bg-brand/[0.04]">
            <p className="text-sm text-zinc-300">{pro.tagline}</p>
            <ul className="mt-3 grid gap-1.5 text-sm text-zinc-300 sm:grid-cols-2">
              {pro.features.map((f) => (
                <li key={f} className="flex gap-2">
                  <FaCheck aria-hidden="true" className="mt-1 shrink-0 text-brand" /> {f}
                </li>
              ))}
            </ul>
            {loaded && billing ? (
              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={() => go("/api/billing/checkout", { interval: "month" })} disabled={busy} className={btnPrimary}>
                  €{pro.price.month} / month
                </button>
                <button onClick={() => go("/api/billing/checkout", { interval: "year" })} disabled={busy} className={btnSecondary}>
                  €{pro.price.year} / year (2 months free)
                </button>
              </div>
            ) : (
              <p className="mt-4 rounded-lg border border-line bg-white/[0.04] p-3 text-sm text-zinc-300">
                Pro is coming soon: payments are not enabled yet. Planned price: €{pro.price.month} per month or €{pro.price.year} per
                year.
              </p>
            )}
          </Card>
        )}
      </div>
    </>
  );
}

export default function Billing() {
  return (
    <Suspense fallback={null}>
      <BillingContent />
    </Suspense>
  );
}
