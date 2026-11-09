"use client";

import { useState } from "react";
import { FaPen, FaTrash } from "react-icons/fa6";
import Modal from "../ui/Modal";
import Avatar from "../ui/Avatar";
import RoleBadge from "../ui/RoleBadge";
import { iconBtn } from "../ui/buttons";
import EditTeam from "./EditTeam";
import RemoveTeam from "./RemoveTeam";

const TeamCard = ({ team, players = [], active, onSelect }) => {
  const [removeTeamModal, setRemoveTeamModal] = useState(false);
  const [editTeamModal, setEditTeamModal] = useState(false);

  return (
    <article
      className={`animate-rise flex flex-col gap-4 rounded-xl border bg-panel p-4 shadow-card transition ${
        active ? "border-brand/50" : "border-line hover:border-white/20"
      }`}
    >
      <div className="flex items-center gap-3">
        <Avatar name={team.name} size={48} />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-bold">{team.name}</h2>
          <p className="text-xs text-zinc-400">
            {players.length} player{players.length === 1 ? "" : "s"}
          </p>
        </div>
        {team.my_role && team.my_role !== "owner" && (
          <span className="rounded-full bg-well px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-zinc-300">{team.my_role}</span>
        )}
        {(!team.my_role || team.my_role === "owner") && (
          <>
            <button aria-label={`Edit ${team.name}`} onClick={() => setEditTeamModal(true)} className={iconBtn}>
              <FaPen />
            </button>
            <button aria-label={`Delete ${team.name}`} onClick={() => setRemoveTeamModal(true)} className={iconBtn}>
              <FaTrash />
            </button>
          </>
        )}
      </div>

      <div className="flex min-h-6 flex-wrap gap-1.5">
        {players.length === 0 ? (
          <span className="text-xs text-zinc-400">No players yet</span>
        ) : (
          players.map((p) => <RoleBadge key={p.id} role={p.role?.name} />)
        )}
      </div>

      <button
        onClick={onSelect}
        disabled={active}
        className="min-h-11 rounded-lg border border-line bg-white/[0.04] text-sm font-semibold transition hover:bg-white/10 disabled:border-brand/40 disabled:bg-brand/10 disabled:text-brand"
      >
        {active ? "Active team" : "Switch to this team"}
      </button>

      <Modal
        title="Edit team"
        show={editTeamModal}
        onClose={() => setEditTeamModal(false)}
        content={<EditTeam team_name={team.name} team_id={team.id} setEditTeamModal={setEditTeamModal} />}
      />
      <Modal
        title="Delete team"
        show={removeTeamModal}
        onClose={() => setRemoveTeamModal(false)}
        content={<RemoveTeam team_name={team.name} team_id={team.id} setRemoveTeamModal={setRemoveTeamModal} />}
      />
    </article>
  );
};

export default TeamCard;
