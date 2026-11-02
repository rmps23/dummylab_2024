"use client";

import { useState } from "react";
import { FaShield } from "react-icons/fa6";
import { teamStore } from "@/store/teamStore";
import { playerStore } from "@/store/playerStore";
import Modal from "@/components/ui/Modal";
import PageHeader from "@/components/ui/PageHeader";
import AddTeam from "@/components/teams/AddTeam";
import TeamCard from "@/components/teams/TeamCard";

const Teams = () => {
  const [addTeamModal, setAddTeamModal] = useState(false);
  const { teams, loaded } = teamStore();
  const players = playerStore((s) => s.players);

  return (
    <>
      <PageHeader icon={FaShield} title="Teams">
        <button
          onClick={() => setAddTeamModal(true)}
          className="text-sm bg-zinc-50 text-zinc-950 px-2 py-1 rounded-md hover:bg-zinc-100"
        >
          Create Team
        </button>
      </PageHeader>
      <Modal show={addTeamModal} onClose={() => setAddTeamModal(false)} content={<AddTeam setAddTeamModal={setAddTeamModal} />} />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4">
        {!loaded ? (
          <p className="text-zinc-400">Loading...</p>
        ) : teams.length > 0 ? (
          teams.map((team) => (
            <TeamCard key={team.id} team={team} playerCount={players.filter((p) => p.team_id === team.id).length} />
          ))
        ) : (
          <p className="text-zinc-400">No teams yet. Create your first team to get started.</p>
        )}
      </div>
    </>
  );
};

export default Teams;
