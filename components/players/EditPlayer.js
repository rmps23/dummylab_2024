"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { editPlayer } from "@/hooks/players";
import { playerStore } from "@/store/playerStore";
import { teamStore } from "@/store/teamStore";
import { ROLES } from "@/lib/constants";

import Select from "@/components/ui/Select";

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
        className="min-h-11 w-full rounded-lg border border-line bg-ink px-3 text-sm outline-none transition placeholder:text-zinc-500 focus:border-brand focus:ring-2 focus:ring-brand/25"
        value={name}
        maxLength={40}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleEditPlayer()}
      />
      <Select label="Team" value={team} onChange={setTeam} options={teams.map((t) => ({ value: t.id, label: t.name }))} />
      <Select label="Role" value={role} onChange={setRole} options={ROLES.map((r) => ({ value: r.id, label: r.name }))} />
      <button className="inline-flex min-h-11 items-center justify-center rounded-lg bg-brand hover:bg-brand-soft px-4 text-sm font-semibold text-brand-ink transition disabled:cursor-not-allowed disabled:opacity-40 w-full" onClick={handleEditPlayer}>
        Confirm
      </button>
    </div>
  );
};

export default EditPlayer;
