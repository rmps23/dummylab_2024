"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FaCheck, FaCopy } from "react-icons/fa6";
import { createInvite, fetchInvite, revokeInvite } from "@/hooks/players";
import Link from "next/link";
import { isDemo, userStore } from "@/store/userStore";
import { featureStore } from "@/store/featureStore";
import { btnDanger, btnPrimary, btnSecondary, inputClass } from "@/components/ui/buttons";
import { isPaid } from "@/lib/plans";

export default function InviteLink({ player }) {
  const user = userStore((s) => s.user);
  const demo = isDemo(user);
  const plan = featureStore((s) => s.plan);
  const loaded = featureStore((s) => s.loaded);
  const [invite, setInvite] = useState(undefined); // undefined = loading, null = none
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchInvite(player.id)
      .then(setInvite)
      .catch((e) => {
        toast.error(e.message);
        setInvite(null);
      });
  }, [player.id]);

  const url = invite ? `${window.location.origin}/r/${invite.token}` : "";

  async function handleCreate() {
    setBusy(true);
    try {
      setInvite(await createInvite(player.id));
      setCopied(false);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleRevoke() {
    setBusy(true);
    try {
      await revokeInvite(player.id);
      setInvite(null);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy. Select the link and copy it manually.");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-bold">Availability link for {player.name}</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Send this link to {player.name}. They can answer for your upcoming events from their phone, with no account.
          The link only lets them answer for themselves, and you can revoke it at any time.
        </p>
      </div>

      {demo && (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-300">
          Invite links are disabled in the demo account.
        </p>
      )}

      {loaded && !isPaid(plan) ? (
        <div className="rounded-xl border border-brand/30 bg-brand/[0.05] p-4 text-sm">
          <p className="font-semibold">Availability links are a Pro feature.</p>
          <p className="mt-1 text-zinc-300">Upgrade to let players answer for upcoming events from their phone.</p>
          <Link href="/dashboard/billing" className={`${btnPrimary} mt-3`}>
            See Pro
          </Link>
        </div>
      ) : invite === undefined ? (
        <p className="text-sm text-zinc-400">Loading...</p>
      ) : invite ? (
        <>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input readOnly aria-label="Availability link" value={url} onFocus={(e) => e.target.select()} className={inputClass} />
            <button onClick={handleCopy} className={`${btnPrimary} shrink-0`}>
              {copied ? <FaCheck aria-hidden="true" /> : <FaCopy aria-hidden="true" />} {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <p className="text-xs text-zinc-400">
            Created {new Date(invite.created_at).toLocaleDateString("en-GB")}
            {invite.last_used_at && ` · last used ${new Date(invite.last_used_at).toLocaleDateString("en-GB")}`}
          </p>
          <div className="flex flex-wrap gap-2">
            <button onClick={handleCreate} disabled={busy || demo} className={btnSecondary}>
              Create a new link
            </button>
            <button onClick={handleRevoke} disabled={busy} className={btnDanger}>
              Revoke link
            </button>
          </div>
        </>
      ) : (
        <button onClick={handleCreate} disabled={busy || demo} className={`${btnPrimary} self-start`}>
          Create link
        </button>
      )}
    </div>
  );
}
