'use client'

import { FaUsers } from "react-icons/fa6";
import { useState, useEffect } from "react";
import { userStore } from "@/store/userStore";
import { teamStore } from "@/store/teamStore";
import Modal from "@/components/ui/Modal";
import Image from "next/image";
import { fetchTeams } from "@/hooks/teams/fetchTeams";
import AddTeam from "@/components/teams/AddTeam";
import EditTeam from "@/components/teams/EditTeam";

const Teams = () => {
  const [addTeamModal, setAddTeamModal] = useState(false);
  const [editTeamModal, setEditTeamModal] = useState(false);
  const [editTeamId, setEditTeamId] = useState(null); // Track the team ID for editing
  const [loading, setLoading] = useState(true);

  const user = userStore((state) => state.user);
  const { teams, setTeams } = teamStore();

  const handleOpenModal = () => {
    setAddTeamModal(true);
  };

  const handleCloseModal = () => {
    setAddTeamModal(false);
  };

  const handleOpenEditModal = (teamId) => { // Receive teamId as parameter
    setEditTeamId(teamId); // Set the team ID for the edit modal
    setEditTeamModal(true);
  };

  const handleCloseEditModal = () => {
    setEditTeamModal(false);
    setEditTeamId(null); // Reset the team ID when closing the modal
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
      <div className="flex items-center gap-6 w-full pb-4 border-b border-zinc-900">
        <div className="flex items-center gap-4">
          <FaUsers className="bg-zinc-900 p-2 text-4xl rounded-md" />
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
            content={<AddTeam user_id={user.id} setAddTeamModal={setAddTeamModal} edit={false} />}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-4">
        {teams.length > 0 ? (
          teams.map((team) => (
            <div key={team.id} className="border border-zinc-900 p-4 rounded-md">
              {team.name}
              <button
                onClick={() => handleOpenEditModal(team.id)} // Pass team.id to handler
                className="text-sm bg-zinc-50 text-zinc-950 px-2 py-1 rounded-md hover:bg-zinc-100"
              >
                Edit
              </button>
              <Modal
                show={editTeamModal && editTeamId === team.id} // Show modal if editTeamModal is true and editTeamId matches current team.id
                onClose={handleCloseEditModal}
                content={<EditTeam team_name={team.name} team_id={team.id} setEditTeamModal={setEditTeamModal} />}
              />
            </div>
          ))
        ) : (
          <p>No teams available</p>
        )}
      </div>
    </>
  );
};

export default Teams;