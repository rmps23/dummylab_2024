"use client";

import Modal from "@/components/ui/Modal";
import { useState, useEffect } from "react";
import { playerStore } from "@/store/playerStore";
import { useParams } from "next/navigation";
import AddPlayer from "@/components/AddPlayer";
import { fetchPlayers } from "@/hooks/fetchPlayers";

const Management = () => {
  const params = useParams();
  const { players, addPlayer } = playerStore(); // Destructure players and addPlayer from playerStore

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true); // Set loading to true initially

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Set loading to true before fetching data
      try {
        const result = await fetchPlayers(params.team_id);
        addPlayer(result); // Update players state with fetched data
      } catch (error) {
        console.error("Error fetching players:", error);
      } finally {
        setLoading(false); // Set loading to false after data is fetched
      }
    };

    fetchData();
  }, [params.team_id, addPlayer]);

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
      <Modal
        show={isModalOpen}
        onClose={handleCloseModal}
        content={<AddPlayer onClose={handleCloseModal} />}
      />
      <div>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            {players && players.length > 0 ? (
              players.map((player) => (
                <div key={player.riot_id}>
                  <div>
                    <p>{player.name}</p>
                    <p>{player.riot_id}</p>
                  </div>
                </div>
              ))
            ) : (
              <>No results found</>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Management;
