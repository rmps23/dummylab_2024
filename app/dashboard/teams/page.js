"use client";

import { FaUsers } from "react-icons/fa6";
import Modal from "@/components/ui/Modal";
import { useState } from "react";

const Teams = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="flex ">
      <div className="flex items-center gap-4 w-full pb-4 border-b border-zinc-900">
        <FaUsers className="bg-zinc-900 p-2 text-4xl rounded-md"></FaUsers>
        <span className="text-lg">Teams</span>
      </div>
      <div>
        <button
          onClick={handleOpenModal}
          className="text-sm px-2 py-1 bg-zinc-950 rounded-md hover:bg-zinc-900"
        >
          Create Team
        </button>
        <Modal show={isModalOpen} onClose={handleCloseModal}></Modal>
      </div>
    </div>
  );
};

export default Teams;
