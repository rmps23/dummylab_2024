"use client";

import { useState } from "react";
import { FaPlus, FaShield } from "react-icons/fa6";
import { teamStore } from "@/store/teamStore";
import { playerStore } from "@/store/playerStore";
import Modal from "@/components/ui/Modal";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState, { actionClass } from "@/components/ui/EmptyState";
import { SkeletonCards } from "@/components/ui/Skeleton";
import { btnPrimary } from "@/components/ui/buttons";
import AddTeam from "@/components/teams/AddTeam";
import TeamCard from "@/components/teams/TeamCard";

const Teams = () => {
  const [addTeamModal, setAddTeamModal] = useState(false);
  const { teams, loaded, activeTeamId, setActiveTeam } = teamStore();
  const players = playerStore((s) => s.players);

  return (
    <>
      <PageHeader icon={FaShield} title="Teams" subtitle={`${teams.length} team${teams.length === 1 ? "" : "s"}`}>
        <button onClick={() => setAddTeamModal(true)} className={btnPrimary}>
          <FaPlus aria-hidden="true" /> Create Team
        </button>
      </PageHeader>
      <Modal
        title="Create team"
        show={addTeamModal}
        onClose={() => setAddTeamModal(false)}
        content={<AddTeam setAddTeamModal={setAddTeamModal} />}
      />

      {!loaded ? (
        <SkeletonCards className="h-44" />
      ) : teams.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-6 xl:grid-cols-3">
          {teams.map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              players={players.filter((p) => p.team_id === team.id)}
              active={team.id === activeTeamId}
              onSelect={() => setActiveTeam(team.id)}
            />
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
