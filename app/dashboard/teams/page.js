"use client";

import { FaUsers } from "react-icons/fa6";
import { useState, useEffect } from "react";
import { userStore } from "@/store/userStore";
import { teamStore } from "@/store/teamStore";
import Modal from "@/components/ui/Modal";
import Image from "next/image";
import { fetchTeams } from "@/hooks/fetchTeams";

const Teams = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [teams, setTeams] = useState([]);
  const user = userStore((state) => state.user);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    const getTeams = async () => {
      if (user) {
        setLoading(true);
        try {
          const response = await fetchTeams();
          setTeams(response.teams);
        } catch (error) {
          console.error("Failed to fetch teams:", error);
        } finally {
          setLoading(false);
          console.log(teams);
        }
      }
    };

    getTeams();
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
          <Modal show={isModalOpen} onClose={handleCloseModal} />
        </div>
      </div>
    </>
  );
};

export default Teams;
