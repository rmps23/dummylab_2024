"use client";

import { useState } from "react";
import { FaShield } from "react-icons/fa6";
import { teamStore } from "@/store/teamStore";
import { playerStore } from "@/store/playerStore";
import Modal from "@/components/ui/Modal";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState, { actionClass } from "@/components/ui/EmptyState";
import { SkeletonCards } from "@/components/ui/Skeleton";
import AddTeam from "@/components/teams/AddTeam";
import TeamCard from "@/components/teams/TeamCard";

const headerButton =
  "inline-flex min-h-11 items-center rounded-md bg-zinc-50 px-3 text-sm text-zinc-950 hover:bg-zinc-100";

const Teams = () => {
  const [addTeamModal, setAddTeamModal] = useState(false);
  const { teams, loaded } = teamStore();
  const players = playerStore((s) => s.players);

  return (
    <>
      <PageHeader icon={FaShield} title="Teams">
        <button onClick={() => setAddTeamModal(true)} className={headerButton}>
          Create Team
        </button>
      </PageHeader>
      <Modal
        title="Create team"
        show={addTeamModal}
        onClose={() => setAddTeamModal(false)}
        content={<AddTeam setAddTeamModal={setAddTeamModal} />}
      />

      {!loaded ? (
        <SkeletonCards />
      ) : teams.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-3">
          {teams.map((team) => (
            <TeamCard key={team.id} team={team} playerCount={players.filter((p) => p.team_id === team.id).length} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FaShield}
          title="Create your first team"
          action={
            <button onClick={() => setAddTeamModal(true)} className={actionClass}>
              Create a team
            </button>
          }
        >
          A team groups your players, schedule and stats. You can manage several teams and switch between them from the
          menu.
        </EmptyState>
      )}
    </>
  );
};

export default Teams;
