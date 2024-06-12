"use client";

import Modal from "@/components/ui/Modal";
import { useState, useEffect } from "react";
import { userStore } from "@/store/userStore";
import { playerStore } from "@/store/playerStore";
import { useParams } from "next/navigation";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Management = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [riotId, setRiotId] = useState("");
  const [tagLine, setTagLine] = useState("");
  const [role, setRole] = useState("1");

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

  const handlePlayerSubmit = async () => {
    if (playerName === "" || riotId === "" || tagLine === "") {
      return;
    }
    const riotID = riotId + "#" + tagLine;
    await addPlayer(playerName, role, riotID, user.id, params.team_id);
    handleCloseModal();
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
              className="outline-none bg-zinc-950 p-2 rounded-md"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm uppercase">Riot ID</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                className="outline-none bg-zinc-950 p-2 rounded-md w-1/3"
                value={riotId}
                onChange={(e) => setRiotId(e.target.value)}
              />
              <p className="w-auto">#</p>
              <input
                type="text"
                className="outline-none bg-zinc-950 p-2 rounded-md w-1/3"
                value={tagLine}
                onChange={(e) => setTagLine(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm uppercase">Role</p>
            <select
              className="outline-none bg-zinc-950 p-2 rounded-md"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="1">Top</option>
              <option value="2">Jungler</option>
              <option value="3">Mid</option>
              <option value="4">Bottom</option>
              <option value="5">Support</option>
            </select>
          </div>
          <div className="flex justify-end mt-2">
            <button
              className="bg-cyan-500 py-1 px-4 rounded-md text-zinc-950"
              onClick={handlePlayerSubmit}
              disabled={loading}
            >
              {loading ? "Loading..." : "Confirm"}
            </button>
          </div>
        </div>
      </Modal>
      <div>
        {loading ? (
          <p>Loading...</p>
        ) : players.length > 0 ? (
          players.map((player) => <div key={player.id}>{player.name}</div>)
        ) : (
          <p>No players found</p>
        )}
      </div>
    </>
  );
};

export default Management;
