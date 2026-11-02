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
      <p>Team Name</p>
      <input
        type="text"
        className="bg-zinc-900 p-2 rounded-md outline-none"
        value={teamName}
        maxLength={60}
        onChange={(e) => setTeamName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleEditTeam()}
      />
      <button className="bg-zinc-200 text-zinc-950 p-1 rounded-md" onClick={handleEditTeam}>
        Confirm
      </button>
    </div>
  );
};

export default EditTeam;
