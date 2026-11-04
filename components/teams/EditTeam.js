"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { editTeam } from "@/hooks/teams";
import { teamStore } from "@/store/teamStore";

const EditTeam = ({ team_name, team_id, setEditTeamModal }) => {
  const [teamName, setTeamName] = useState(team_name);
  const editTeamName = teamStore((s) => s.editTeamName);

  async function handleEditTeam() {
    if (!teamName.trim()) return;
    try {
      const team = await editTeam(teamName.trim(), team_id);
      editTeamName(team.id, team.name);
      setEditTeamModal(false);
    } catch (error) {
      toast.error(`Could not update the team: ${error.message}`);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-bold">Team name</h2>
      <input
        type="text"
        className="min-h-11 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm outline-none transition placeholder:text-zinc-500 focus:border-brand/60 focus:ring-2 focus:ring-brand/20"
        value={teamName}
        maxLength={60}
        onChange={(e) => setTeamName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleEditTeam()}
      />
      <button className="inline-flex min-h-11 items-center justify-center rounded-lg bg-brand hover:bg-brand-soft px-4 text-sm font-semibold text-zinc-950 transition disabled:cursor-not-allowed disabled:opacity-40 w-full" onClick={handleEditTeam}>
        Confirm
      </button>
    </div>
  );
};

export default EditTeam;
