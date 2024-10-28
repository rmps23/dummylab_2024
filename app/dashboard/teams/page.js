"use client";

import { useState, useEffect } from "react";
import { userStore } from "@/store/userStore";
import { teamStore } from "@/store/teamStore";
import Modal from "@/components/ui/Modal";
import Image from "next/image";
import { fetchTeams } from "@/hooks/teams/fetchTeams";
import AddTeam from "@/components/teams/AddTeam";
import { FaShield } from "react-icons/fa6";
import TeamCard from "@/components/teams/TeamCard";

const Teams = () => {

  const [addTeamModal, setAddTeamModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const user = userStore((state) => state.user);
  const { teams, setTeams } = teamStore();

  const handleOpenModal = () => {
    setAddTeamModal(true);
  };

  const handleCloseModal = () => {
    setAddTeamModal(false);
  };

  const fetchTeamsData = async () => {
    if (!user) {
      return;
    }
    try {
      setLoading(true);
      const data = await fetchTeams(user.id);
      setTeams(data);
    } catch (error) {
      console.error("Failed to fetch teams:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamsData();
  }, [user]);

  if (loading) {
    return (
      <div className="w-full pt-40 flex flex-col items-center justify-center">
        <Image
          src="/assets/logos/dummylab_logo_solo.png"
          height={40}
          width={40}
          alt="Loading"
          className="animate-bounce pb-4"
        />
        <p className="animate-pulse text-xl">Loading</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-6 w-full pt-4 px-6 pb-4 border-b border-zinc-900 bg-cyan-600">
        <div className="flex items-center gap-4">
          <FaShield className="bg-zinc-900 p-2 text-4xl rounded-md" />
          <span className="text-lg">Teams</span>
        </div>
        <div>
          <button
            onClick={handleOpenModal}
            className="text-sm bg-zinc-50 text-zinc-950 px-2 py-1 rounded-md hover:bg-zinc-100"
          >
            Create Team
          </button>
          <Modal
            show={addTeamModal}
            onClose={handleCloseModal}
            content={
              <AddTeam
                user_id={user.id}
                setAddTeamModal={setAddTeamModal}
              />
            }
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4">
        {teams.length > 0 ? (
          teams.map((team) => (
            <>
              <TeamCard team={team} />
            </>
          ))
        ) : (
          <p>No teams available</p>
        )}
      </div>
    </>
  );
};

export default Teams;
