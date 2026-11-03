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
      <p>Team Name</p>
      <input
        type="text"
        className="bg-zinc-900 p-2 rounded-md outline-none"
        placeholder="Insert team name..."
        value={teamName}
        maxLength={60}
        onChange={(e) => setTeamName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleAddTeam()}
      />
      <button className="bg-zinc-200 text-zinc-950 p-1 rounded-md disabled:opacity-50" disabled={saving} onClick={handleAddTeam}>
        Confirm
      </button>
    </div>
  );
};

export default AddTeam;
