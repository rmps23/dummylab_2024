"use client";

import { editTeam } from "@/hooks/teams/editTeam";
import { useState } from "react";
import { teamStore } from "@/store/teamStore";

const EditPlayer = ({ player_name, player_id, teams, setEditPlayerModal }) => {
  const [playerName, setPlayerName] = useState(player_name);
  const [team, setTeam] = useState();
  const { editTeamName } = teamStore();

  // async function handleEditTeam() {
  //   try {
  //     const response = await editTeam(teamName, team_id);
  //     editTeamName(response.id, response.name);
  //     setEditTeamModal(false);
  //   } catch (error) {
  //     console.error("Error editing team:", error);
  //   }
  // }

  // const handleKeyDown = async (e) => {
  //   if (e.key === "Enter") {
  //     await handleEditTeam();
  //   }
  // };

  return (
    <div className="flex flex-col gap-4">
      <p>Player Name</p>
      <input
        type="text"
        className="bg-zinc-900 p-2 rounded-md outline-none"
        placeholder="Insert team name..."
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
      // onKeyDown={handleKeyDown}
      />
      <select
        className="p-2 rounded-md flex w-full bg-zinc-900 cursor-pointer"
        value={team}
        onChange={(e) => setTeam(e.target.value)}
      >
        <option value={0}>Select a team</option>
        {teams.map((team, index) => (
          <option key={index} value={team.id}>
            {team.name}
          </option>
        ))}
      </select>
      <button
        className="bg-zinc-200 text-zinc-950 p-1 rounded-md"
      >
        Confirm
      </button>
    </div>
  );
};

export default EditPlayer;
