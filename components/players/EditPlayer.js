"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { editPlayer } from "@/hooks/players";
import { playerStore } from "@/store/playerStore";
import { teamStore } from "@/store/teamStore";
import { ROLES } from "@/lib/constants";

const field = "p-2 rounded-md flex w-full bg-zinc-900 cursor-pointer";

const EditPlayer = ({ player, setEditPlayerModal }) => {
  const teams = teamStore((s) => s.teams);
  const updatePlayer = playerStore((s) => s.updatePlayer);
  const [name, setName] = useState(player.name);
  const [team, setTeam] = useState(player.team_id);
  const [role, setRole] = useState(player.role_id);

  async function handleEditPlayer() {
    if (!name.trim()) return;
    try {
      updatePlayer(await editPlayer(player.id, { name: name.trim(), team_id: Number(team), role_id: Number(role) }));
      setEditPlayerModal(false);
    } catch (error) {
      toast.error(`Could not update the player: ${error.message}`);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p>Player Name</p>
      <input
        type="text"
        className="bg-zinc-900 p-2 rounded-md outline-none"
        value={name}
        maxLength={40}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleEditPlayer()}
      />
      <select className={field} value={team} onChange={(e) => setTeam(e.target.value)}>
        {teams.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>
      <select className={field} value={role} onChange={(e) => setRole(e.target.value)}>
        {ROLES.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name}
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
