"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { editPlayer } from "@/hooks/players";
import { playerStore } from "@/store/playerStore";
import { teamStore } from "@/store/teamStore";
import { ROLES } from "@/lib/constants";

const field = "flex min-h-11 w-full cursor-pointer rounded-lg border border-white/10 bg-black/30 px-3 text-sm outline-none focus:border-brand/60";

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
      <h2 className="text-lg font-bold">Edit player</h2>
      <input
        type="text"
        className="min-h-11 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm outline-none transition placeholder:text-zinc-500 focus:border-brand/60 focus:ring-2 focus:ring-brand/20"
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
      <button className="inline-flex min-h-11 items-center justify-center rounded-lg bg-gradient-to-r from-cyan-400 to-sky-500 px-4 text-sm font-semibold text-zinc-950 shadow-[0_6px_18px_-8px_rgba(34,211,238,0.8)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 w-full" onClick={handleEditPlayer}>
        Confirm
      </button>
    </div>
  );
};

export default EditPlayer;
