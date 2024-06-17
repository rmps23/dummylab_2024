"use client";

import { FaUsers } from "react-icons/fa6";
import { useState, useEffect } from "react";
import { fetchTeams } from "@/hooks/fetchTeams";
import { userStore } from "@/store/userStore";
import Modal from "@/components/ui/Modal";

const Teams = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = userStore((state) => state.user);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    const getTeams = async () => {
      try {
        setLoading(true);
        const teams = await fetchTeams(user.id);
        setTeams(teams);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    if (user?.id) {
      getTeams();
    }
  }, [user]);

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
          <Modal show={isModalOpen} onClose={handleCloseModal} />
        </div>
      </div>
      <div className="py-4">
        {loading && <p>Loading teams...</p>}
        {error && <p>Error loading teams: {error.message}</p>}
        {!loading && !error && teams.length === 0 && <p>No teams available.</p>}
        {!loading && !error && teams.length > 0 && (
          <ul>
            {teams.map((team) => (
              <li key={team.id}>{team.name}</li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};

export default Teams;
