"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { insertTeam } from "@/hooks/teams";
import { teamStore } from "@/store/teamStore";

const AddTeam = ({ setAddTeamModal }) => {
  const addTeam = teamStore((s) => s.addTeam);
  const [teamName, setTeamName] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleAddTeam() {
    if (!teamName.trim() || saving) return;
    setSaving(true);
    try {
      addTeam(await insertTeam(teamName.trim()));
      setAddTeamModal(false);
    } catch (error) {
      toast.error(`Could not create the team: ${error.message}`);
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-bold">Team name</h2>
      <input
        type="text"
        className="min-h-11 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm outline-none transition placeholder:text-zinc-500 focus:border-brand/60 focus:ring-2 focus:ring-brand/20"
        placeholder="Insert team name..."
        value={teamName}
        maxLength={60}
        onChange={(e) => setTeamName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleAddTeam()}
      />
      <button className="inline-flex min-h-11 items-center justify-center rounded-lg bg-gradient-to-r from-cyan-400 to-sky-500 px-4 text-sm font-semibold text-zinc-950 shadow-[0_6px_18px_-8px_rgba(34,211,238,0.8)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 w-full" disabled={saving} onClick={handleAddTeam}>
        Confirm
      </button>
    </div>
  );
};

export default AddTeam;
