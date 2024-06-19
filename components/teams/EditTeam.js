"use client";

import { editTeam } from "@/hooks/teams/editTeam";
import { useState } from "react";
import { teamStore } from "@/store/teamStore";

const EditTeam = ({ team_name, team_id, setEditTeamModal }) => {
  const [teamName, setTeamName] = useState(team_name);
  const { editTeamName } = teamStore();

  async function handleEditTeam() {
    try {
      const response = await editTeam(teamName, team_id);
      editTeamName(response.id, response.name);
      setEditTeamModal(false);
    } catch (error) {
      console.error("Error editing team:", error);
    }
  }

  const handleKeyDown = async (e) => {
    if (e.key === "Enter") {
      await handleEditTeam();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <p>Team Name</p>
      <input
        type="text"
        className="bg-zinc-900 p-2 rounded-md outline-none"
        placeholder="Insert team name..."
        value={teamName}
        onChange={(e) => setTeamName(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button
        className="bg-zinc-200 text-zinc-950 p-1 rounded-md"
        onClick={handleEditTeam}
      >
        Confirm
      </button>
    </div>
  );
};

export default EditTeam;
