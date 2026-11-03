"use client";

import { useState } from "react";
import { FaUsers } from "react-icons/fa6";
import { teamStore } from "@/store/teamStore";
import { playerStore } from "@/store/playerStore";
import Modal from "@/components/ui/Modal";
import PageHeader from "@/components/ui/PageHeader";
import AddPlayer from "@/components/players/AddPlayer";
import EditPlayer from "@/components/players/EditPlayer";
import RemovePlayer from "@/components/players/RemovePlayer";
import { PlayerCard } from "@/components/players/PlayerCard";

const Players = () => {
  const { teams, activeTeamId } = teamStore();
  const { players, loaded } = playerStore();
  const [showAll, setShowAll] = useState(false);
  const [createModal, setCreateModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [removing, setRemoving] = useState(null);

  const visible = players.filter((p) => showAll || p.team_id === activeTeamId);
  const teamName = (id) => teams.find((t) => t.id === id)?.name ?? "";

  return (
    <>
      <PageHeader icon={FaUsers} title="Players">
        <button
          onClick={() => setCreateModal(true)}
          className="text-sm bg-zinc-50 text-zinc-950 px-2 py-1 rounded-md hover:bg-zinc-100"
        >
          Add Player
        </button>
        <label className="text-sm flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} /> All teams
        </label>
      </PageHeader>

      <Modal show={createModal} onClose={() => setCreateModal(false)} content={<AddPlayer setCreatePlayerModal={setCreateModal} />} />
      <Modal
        show={!!editing}
        onClose={() => setEditing(null)}
        content={editing && <EditPlayer key={editing.id} player={editing} setEditPlayerModal={(v) => !v && setEditing(null)} />}
      />
      <Modal
        show={!!removing}
        onClose={() => setRemoving(null)}
        content={removing && <RemovePlayer player={removing} setRemovePlayerModal={(v) => !v && setRemoving(null)} />}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4">
        {!loaded ? (
          <p className="text-zinc-400">Loading...</p>
        ) : visible.length > 0 ? (
          visible.map((player) => (
            <PlayerCard key={player.id} player={player} teamName={teamName(player.team_id)} onEdit={setEditing} onRemove={setRemoving} />
          ))
        ) : (
          <p className="text-zinc-400">No players found.</p>
        )}
      </div>
    </>
  );
};

export default Players;
