"use client";

import { useState, useEffect } from "react";
import { editPlayer } from "@/hooks/players/editPlayer";
import { playerStore } from "@/store/playerStore";

const EditPlayer = ({
  player_name,
  player_id,
  teams,
  setEditPlayerModal,
  team_id,
}) => {
  const [playerName, setPlayerName] = useState(player_name);
  const [team, setTeam] = useState(team_id);
  const { editPlayerStore } = playerStore();

  async function handleEditPlayer() {
    try {
      const response = await editPlayer(playerName, team, player_id);
      if (response && response.length > 0) {
        const updatedPlayer = response[0];
        editPlayerStore(updatedPlayer.name, updatedPlayer.team_id.id, updatedPlayer.id);
        setEditPlayerModal(false);
      } else {
        console.error("Failed to update player: No data returned");
      }
    } catch (error) {
      console.error("Error editing player:", error);
    }
  }

  const handleKeyDown = async (e) => {
    if (e.key === "Enter") {
      await handleEditPlayer();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <p>Player Name</p>
      <input
        type="text"
        className="bg-zinc-900 p-2 rounded-md outline-none"
        placeholder="Insert player name..."
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <select
        className="p-2 rounded-md flex w-full bg-zinc-900 cursor-pointer"
        value={team}
        onChange={(e) => setTeam(e.target.value)}
      >
        {teams.map((team, index) => (
          <option key={index} value={team.id}>
            {team.name}
          </option>
        ))}
      </select>
      <button className="bg-zinc-200 text-zinc-950 p-1 rounded-md" onClick={handleEditPlayer}>
        Confirm
      </button>
    </div>
  );
};

export default EditPlayer;
