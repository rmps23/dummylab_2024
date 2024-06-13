"use client";

import Modal from "@/components/ui/Modal";
import { useState, useEffect } from "react";
import { userStore } from "@/store/userStore";
import { playerStore } from "@/store/playerStore";
import { useParams } from "next/navigation";
import AddPlayer from "@/components/AddPlayer";

const Management = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const user = userStore((state) => state.user);
  const params = useParams();
  const { players, loading, getPlayers, addPlayer } = playerStore((state) => ({
    players: state.players,
    loading: state.loading,
    getPlayers: state.getPlayers,
    addPlayer: state.addPlayer,
  }));

  useEffect(() => {
    getPlayers(params.team_id);
  }, [params.team_id, getPlayers]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <button
        onClick={handleOpenModal}
        className="text-sm px-2 py-1 bg-cyan-400 text-zinc-950 font-bold rounded-md"
      >
        Add Player
      </button>
      <Modal show={isModalOpen} onClose={handleCloseModal} content={<AddPlayer onClose={handleCloseModal} />}></Modal>
      <div>
        {loading ? (
          <p>Loading...</p>
        ) : players.length > 0 ? (
          players.map((player) =>
            <div key={player.id}>
              <div>
                <p>{player.name}</p>
                <p>{player.riot_id}</p>
                <p>{player.role.name}</p>
                <p>{player.role.image_link}</p>
              </div>
            </div>)
        ) : (
          <p>No players found</p>
        )}
      </div>
    </>
  );
};

export default Management;
