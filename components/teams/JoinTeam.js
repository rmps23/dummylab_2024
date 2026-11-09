"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { btnPrimary } from "@/components/ui/buttons";

export default function JoinTeam({ token, teamName, role, roleLabel, help }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function accept() {
    setBusy(true);
    setError(null);
    const response = await fetch("/api/invites/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(body.error || "Something went wrong.");
      return setBusy(false);
    }
    try {
      localStorage.setItem("activeTeamId", String(body.team_id));
    } catch {}
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <>
      <h1 className="text-xl font-bold">Join {teamName}</h1>
      <p className="text-sm text-zinc-300">
        You will join as <b>{roleLabel}</b> ({role}). {help}
      </p>
      {error && <p role="alert" className="text-sm text-loss">{error}</p>}
      <button onClick={accept} disabled={busy} className={btnPrimary}>{busy ? "Joining..." : "Accept invitation"}</button>
    </>
  );
}
