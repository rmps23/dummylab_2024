"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaPlus, FaUsers } from "react-icons/fa6";
import { teamStore } from "@/store/teamStore";
import { playerStore } from "@/store/playerStore";
import { fetchRecentTeamMatches, fetchTeamRanks } from "@/hooks/stats";
import Modal from "@/components/ui/Modal";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState, { actionClass } from "@/components/ui/EmptyState";
import { SkeletonCards } from "@/components/ui/Skeleton";
import { btnPrimary } from "@/components/ui/buttons";
import AddPlayer from "@/components/players/AddPlayer";
import EditPlayer from "@/components/players/EditPlayer";
import RemovePlayer from "@/components/players/RemovePlayer";
import InviteLink from "@/components/players/InviteLink";
import PlayerNotes from "@/components/players/PlayerNotes";
import { PlayerCard } from "@/components/players/PlayerCard";

const Players = () => {
  const { teams, activeTeamId, loaded: teamsLoaded } = teamStore();
  const { players, loaded } = playerStore();
  const [showAll, setShowAll] = useState(false);
  const [createModal, setCreateModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [removing, setRemoving] = useState(null);
  const [inviting, setInviting] = useState(null);
  const [noting, setNoting] = useState(null);
  const [ranks, setRanks] = useState({});
  const [forms, setForms] = useState({});

  const visible = players.filter((p) => showAll || p.team_id === activeTeamId);
  const teamName = (id) => teams.find((t) => t.id === id)?.name ?? "";
  const noTeams = teamsLoaded && teams.length === 0;
  const isOwnerOf = (teamId) => (teams.find((t) => t.id === teamId)?.my_role ?? "owner") === "owner";
  const canAdd = !noTeams && isOwnerOf(activeTeamId);

  // Rank and recent form for the players on screen.
  const visibleKey = visible.map((p) => p.id).join(",");
  useEffect(() => {
    const ids = visibleKey ? visibleKey.split(",") : [];
    if (ids.length === 0) return;
    fetchTeamRanks(ids)
      .then((rows) => setRanks(Object.fromEntries(rows.map((r) => [r.player_id, r]))))
      .catch(() => {});
    fetchRecentTeamMatches(ids, 200)
      .then((rows) => {
        const byPlayer = {};
        rows.forEach((r) => {
          const list = (byPlayer[r.player_id] ||= []);
          if (list.length < 8) list.push(r.win);
        });
        setForms(byPlayer);
      })
      .catch(() => {});
  }, [visibleKey]);

  return (
    <>
      <PageHeader icon={FaUsers} title="Players" subtitle={`${visible.length} ${showAll ? "across all teams" : "in this team"}`}>
        <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-zinc-300">
          <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} className="h-4 w-4 accent-brand" /> All teams
        </label>
        <button onClick={() => setCreateModal(true)} disabled={!canAdd} title={canAdd ? undefined : "Only the team owner can add players"} className={btnPrimary}>
          <FaPlus aria-hidden="true" /> Add Player
        </button>
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
        title="Notes and goals"
        show={!!noting}
        onClose={() => setNoting(null)}
        content={noting && <PlayerNotes key={noting.id} player={noting} />}
      />
      <Modal
        title="Availability link"
        show={!!inviting}
        onClose={() => setInviting(null)}
        content={inviting && <InviteLink key={inviting.id} player={inviting} />}
      />
      <Modal
        title="Delete player"
        show={!!removing}
        onClose={() => setRemoving(null)}
        content={removing && <RemovePlayer player={removing} setRemovePlayerModal={(v) => !v && setRemoving(null)} />}
      />

      {!loaded || !teamsLoaded ? (
        <SkeletonCards count={6} className="h-44" />
      ) : visible.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-6 2xl:grid-cols-3">
          {visible.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              teamName={teamName(player.team_id)}
              rank={ranks[player.id]}
              form={forms[player.id] || []}
              onEdit={setEditing}
              onRemove={setRemoving}
              onInvite={setInviting}
              onNotes={setNoting}
              readOnly={!isOwnerOf(player.team_id)}
            />
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
