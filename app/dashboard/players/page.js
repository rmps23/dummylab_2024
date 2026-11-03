"use client";

import { useState } from "react";
import Link from "next/link";
import { FaUsers } from "react-icons/fa6";
import { teamStore } from "@/store/teamStore";
import { playerStore } from "@/store/playerStore";
import Modal from "@/components/ui/Modal";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState, { actionClass } from "@/components/ui/EmptyState";
import { SkeletonCards } from "@/components/ui/Skeleton";
import AddPlayer from "@/components/players/AddPlayer";
import EditPlayer from "@/components/players/EditPlayer";
import RemovePlayer from "@/components/players/RemovePlayer";
import { PlayerCard } from "@/components/players/PlayerCard";

const headerButton =
  "inline-flex min-h-11 items-center rounded-md bg-zinc-50 px-3 text-sm text-zinc-950 hover:bg-zinc-100";

const Players = () => {
  const { teams, activeTeamId, loaded: teamsLoaded } = teamStore();
  const { players, loaded } = playerStore();
  const [showAll, setShowAll] = useState(false);
  const [createModal, setCreateModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [removing, setRemoving] = useState(null);

  const visible = players.filter((p) => showAll || p.team_id === activeTeamId);
  const teamName = (id) => teams.find((t) => t.id === id)?.name ?? "";
  const noTeams = teamsLoaded && teams.length === 0;

  return (
    <>
      <PageHeader icon={FaUsers} title="Players">
        <button onClick={() => setCreateModal(true)} disabled={noTeams} className={`${headerButton} disabled:opacity-50`}>
          Add Player
        </button>
        <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} /> All teams
        </label>
      </PageHeader>

      <Modal
        title="Add player"
        show={createModal}
        onClose={() => setCreateModal(false)}
        content={<AddPlayer setCreatePlayerModal={setCreateModal} />}
      />
      <Modal
        title="Edit player"
        show={!!editing}
        onClose={() => setEditing(null)}
        content={editing && <EditPlayer key={editing.id} player={editing} setEditPlayerModal={(v) => !v && setEditing(null)} />}
      />
      <Modal
        title="Delete player"
        show={!!removing}
        onClose={() => setRemoving(null)}
        content={removing && <RemovePlayer player={removing} setRemovePlayerModal={(v) => !v && setRemoving(null)} />}
      />

      {!loaded || !teamsLoaded ? (
        <SkeletonCards count={6} className="h-24" />
      ) : visible.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-3">
          {visible.map((player) => (
            <PlayerCard key={player.id} player={player} teamName={teamName(player.team_id)} onEdit={setEditing} onRemove={setRemoving} />
          ))}
        </div>
      ) : noTeams ? (
        <EmptyState
          icon={FaUsers}
          title="Create a team first"
          action={
            <Link href="/dashboard/teams" className={actionClass}>
              Go to Teams
            </Link>
          }
        >
          Players belong to a team, so start by creating one.
        </EmptyState>
      ) : (
        <EmptyState
          icon={FaUsers}
          title="Add your first player"
          action={
            <button onClick={() => setCreateModal(true)} className={actionClass}>
              Add a player
            </button>
          }
        >
          Add players by Riot ID. Once they are in, you can import their match history to see stats, and track their
          availability in the schedule.
        </EmptyState>
      )}
    </>
  );
};

export default Players;
