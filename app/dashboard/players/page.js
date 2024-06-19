"use client";

import { FaUsers } from "react-icons/fa6";
import { useEffect, useState } from "react";
import { userStore } from "@/store/userStore";
import { teamStore } from "@/store/teamStore";
import { fetchTeams } from "@/hooks/teams/fetchTeams";
import Modal from "@/components/ui/Modal";
import AddPlayer from "@/components/players/AddPlayer";

const Players = () => {
  const user = userStore((state) => state.user);
  const { teams, setTeams } = teamStore();

  const [loading, setLoading] = useState(true);
  const [createPlayerModal, setCreatePlayerModal] = useState(false);

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

  const handleOpenCreate = () => {
    setCreatePlayerModal(true);
  };

  const handleCloseCreate = () => {
    setCreatePlayerModal(false);
  };

  return (
    <>
      <div className="flex items-center gap-6 w-full pb-4 mb-8 border-b border-zinc-900">
        <div className="flex items-center gap-4">
          <FaUsers className="bg-zinc-900 p-2 text-4xl rounded-md" />
          <span className="text-lg">Players</span>
        </div>
        <button
          onClick={handleOpenCreate}
          className="text-sm bg-zinc-50 text-zinc-950 px-2 py-1 rounded-md hover:bg-zinc-100"
        >
          Add Player
        </button>
        {user && (
          <Modal
            show={createPlayerModal}
            onClose={handleCloseCreate}
            content={<AddPlayer user_id={user.id} teams={teams} />}
          />
        )}
      </div>
    </>
  );
};

export default Players;
