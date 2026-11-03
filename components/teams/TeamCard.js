"use client";

import { useState } from "react";
import { FaPen, FaTrash } from "react-icons/fa6";
import Modal from "../ui/Modal";
import EditTeam from "./EditTeam";
import RemoveTeam from "./RemoveTeam";

const TeamCard = ({ team, playerCount = 0 }) => {
  const [removeTeamModal, setRemoveTeamModal] = useState(false);
  const [editTeamModal, setEditTeamModal] = useState(false);

  return (
    <div className="border border-zinc-800 bg-zinc-800 p-4 rounded-md flex justify-between">
      <div>
        <div>{team.name}</div>
        <div className="text-xs text-zinc-400">
          {playerCount} player{playerCount === 1 ? "" : "s"}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button aria-label="Edit team" onClick={() => setEditTeamModal(true)} className="text-sm text-zinc-200 p-2 rounded-md bg-zinc-900">
          <FaPen />
        </button>
        <button aria-label="Delete team" onClick={() => setRemoveTeamModal(true)} className="text-sm text-zinc-200 p-2 rounded-md bg-zinc-900">
          <FaTrash />
        </button>
      </div>
      <Modal title="Edit team"
        show={editTeamModal}
        onClose={() => setEditTeamModal(false)}
        content={<EditTeam team_name={team.name} team_id={team.id} setEditTeamModal={setEditTeamModal} />}
      />
      <Modal title="Delete team"
        show={removeTeamModal}
        onClose={() => setRemoveTeamModal(false)}
        content={<RemoveTeam team_name={team.name} team_id={team.id} setRemoveTeamModal={setRemoveTeamModal} />}
      />
    </div>
  );
};

export default TeamCard;
