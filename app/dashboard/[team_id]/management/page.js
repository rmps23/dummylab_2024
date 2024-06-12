'use client'

import Modal from "@/components/ui/Modal";
import { useState } from "react";

const Management = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [playerName, setPlayerName] = useState("");

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
      <Modal show={isModalOpen} onClose={handleCloseModal}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <p className="text-sm uppercase">Player name</p>
            <input
              type="text"
              onChange={(e) => setTeamName(e.target.value)}
              className="outline-none bg-zinc-950 p-2 rounded-md"
            />
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Management;
